import { Router } from 'express';
import haversine from 'haversine';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { fallbackIncidents } from './incidents';

const router = Router();
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'SafeRouteIncidents';

// ---- Safety Scoring Configuration ----
const MAX_IMPACT_RADIUS_METERS = 1000;
const SEVERITY_BASE_IMPACT: Record<number, number> = {
  1: 5,   // Low severity (e.g. poor lighting)
  2: 10,  // Medium-low
  3: 20,  // Medium (e.g. suspicious activity)
  4: 35,  // High (e.g. theft)
  5: 60   // Critical (e.g. assault)
};
const TIME_DECAY_HOURS = 24; // Incidents older than this have 0 impact

// India bounding box: lat 6–37.5°N, lng 68–98°E
const INDIA_BOUNDS = { minLat: 6.0, maxLat: 37.5, minLng: 68.0, maxLng: 98.0 };

function isInIndia(lat: number, lng: number): boolean {
  return (
    lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
    lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng
  );
}

// Decodes Google's encoded polyline into [lng, lat] coordinate arrays
function decodePolyline(encoded: string): number[][] {
  const poly: number[][] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    poly.push([lng / 1e5, lat / 1e5]);
  }
  return poly;
}

// Fetch active incidents — DynamoDB with in-memory fallback for dev without AWS creds or missing table
async function fetchActiveIncidents(): Promise<any[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': 'active' }
    });
    const response = await docClient.send(command);
    return response.Items || [];
  } catch (err: any) {
    console.warn('DynamoDB scan failed, using fallback incidents:', err.message);
    return fallbackIncidents.filter((i: any) => i.status === 'active');
  }
}

// Score a route's geometry against active incidents
function scoreRoute(
  pathCoords: number[][],
  incidents: any[]
): { safetyScore: number; incidentsCount: number } {
  let totalImpact = 0;
  let incidentsCount = 0;
  const now = new Date().getTime();

  for (const incident of incidents) {
    const incidentCoord = { latitude: incident.latitude, longitude: incident.longitude };
    let minDistance = Infinity;

    // Sample every 5th point for speed — still accurate at typical OSRM geometry density
    for (let i = 0; i < pathCoords.length; i += 5) {
      const pt = pathCoords[i];
      const distance = haversine(
        incidentCoord,
        { latitude: pt[1], longitude: pt[0] },
        { unit: 'meter' }
      );
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    if (minDistance <= MAX_IMPACT_RADIUS_METERS) {
      incidentsCount++;
      
      // 1. Severity Impact
      const severity = incident.severity || 3;
      const baseImpact = SEVERITY_BASE_IMPACT[severity] || SEVERITY_BASE_IMPACT[3];
      
      // 2. Distance Decay (Linear decay from 100% impact at 0m to 0% at MAX_IMPACT_RADIUS_METERS)
      const distanceFactor = 1 - (minDistance / MAX_IMPACT_RADIUS_METERS);
      
      // 3. Time Decay (Linear decay from 100% impact at 0 hours to 0% at TIME_DECAY_HOURS)
      const reportedAt = new Date(incident.reportedAt || incident.createdAt).getTime();
      const hoursSinceReport = (now - reportedAt) / (1000 * 60 * 60);
      let timeFactor = 1 - (hoursSinceReport / TIME_DECAY_HOURS);
      if (timeFactor < 0) timeFactor = 0; // Past decay horizon

      // 4. Confidence Multiplier
      const confidenceScore = incident.confidenceScore || 50;
      const confidenceFactor = confidenceScore / 100;

      // Calculate final impact for this incident
      const impact = baseImpact * distanceFactor * timeFactor * confidenceFactor;
      totalImpact += impact;
    }
  }

  // Final score: 100 minus total impact, clamped between 0 and 100
  const finalScore = Math.max(0, Math.min(100, 100 - totalImpact));
  
  return { safetyScore: Math.round(finalScore), incidentsCount };
}

// Safety score endpoint (POST /api/v1/route/score)
router.post('/score', async (req, res) => {
  const { path } = req.body;
  if (!path || !Array.isArray(path) || path.length === 0) {
    return res.status(400).json({ error: 'Valid path coordinates are required' });
  }

  try {
    const incidents = await fetchActiveIncidents();
    // Convert path objects {lat, lng} to number[][] [lng, lat]
    const pathCoords = path.map((p: any) => [p.lng || p.longitude, p.lat || p.latitude]);
    
    const { safetyScore, incidentsCount } = scoreRoute(pathCoords, incidents);

    // Get the specifically impacting incidents for the response payload
    const impactingIncidents = incidents.filter(incident => {
      const incidentCoord = { latitude: incident.latitude, longitude: incident.longitude };
      for (let i = 0; i < pathCoords.length; i += 5) {
        const pt = pathCoords[i];
        const dist = haversine(incidentCoord, { latitude: pt[1], longitude: pt[0] }, { unit: 'meter' });
        if (dist <= MAX_IMPACT_RADIUS_METERS) return true;
      }
      return false;
    });

    return res.status(200).json({
      success: true,
      score: safetyScore,
      impactingIncidents
    });
  } catch (error) {
    console.error('Error calculating route score:', error);
    return res.status(500).json({ success: false, error: 'Failed to calculate safety score' });
  }
});

// ============================================================
// Main routing endpoint  POST /api/v1/route/calculate
// Uses OSRM public server (full India road coverage confirmed)
// ============================================================
router.post('/calculate', async (req, res) => {
  const { origin, destination } = req.body;

  if (
    !origin || !destination ||
    origin.lat == null || origin.lng == null ||
    destination.lat == null || destination.lng == null
  ) {
    return res.status(400).json({
      success: false,
      error: 'Origin and destination coordinates are required.'
    });
  }

  // India boundary check
  if (!isInIndia(origin.lat, origin.lng)) {
    return res.status(400).json({
      success: false,
      error: 'SafeRoutes currently supports routing within India. The starting point appears to be outside India.'
    });
  }

  if (!isInIndia(destination.lat, destination.lng)) {
    return res.status(400).json({
      success: false,
      error: 'SafeRoutes currently supports routing within India. The destination appears to be outside India.'
    });
  }

  try {
    // We use Google Maps Routes API to reliably get multiple alternatives
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyAGjv9P7VcJ60U9DXd0FyhGk7IbY9ikjWY';
    
    const requestBody = {
      origin: {
        location: { latLng: { latitude: origin.lat, longitude: origin.lng } }
      },
      destination: {
        location: { latLng: { latitude: destination.lat, longitude: destination.lng } }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: true,
      languageCode: "en-US"
    };

    const gmapsUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    const gmapsRes = await fetch(gmapsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(15000)
    });

    if (!gmapsRes.ok) {
      throw new Error(`Google Maps API error: ${gmapsRes.status}`);
    }

    const gmapsData = await gmapsRes.json();

    if (!gmapsData.routes || gmapsData.routes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No drivable route found between these locations.'
      });
    }

    // Fetch active incidents for safety overlay
    const incidents = await fetchActiveIncidents();

    // Process all returned routes from Google Maps
    const processedRoutes = gmapsData.routes.map((route: any, index: number) => {
      const pathCoords = decodePolyline(route.polyline.encodedPolyline);
      const { safetyScore, incidentsCount } = scoreRoute(pathCoords, incidents);

      // Extract real turn-by-turn steps from Google Maps
      const steps = route.legs && route.legs[0] && route.legs[0].steps
        ? route.legs[0].steps.map((step: any) => {
            const maneuver = step.navigationInstruction?.maneuver;
            let simpleInstruction = 'Continue straight';
            if (maneuver) {
              if (maneuver.includes('TURN_LEFT')) simpleInstruction = 'Turn left';
              else if (maneuver.includes('TURN_RIGHT')) simpleInstruction = 'Turn right';
              else if (maneuver.includes('UTURN')) simpleInstruction = 'U-turn';
              else if (maneuver.includes('KEEP_LEFT')) simpleInstruction = 'Keep left';
              else if (maneuver.includes('KEEP_RIGHT')) simpleInstruction = 'Keep right';
              else if (maneuver.includes('STRAIGHT')) simpleInstruction = 'Go straight';
              else if (maneuver.includes('MERGE')) simpleInstruction = 'Merge';
              else if (maneuver.includes('FORK_LEFT')) simpleInstruction = 'Fork left';
              else if (maneuver.includes('FORK_RIGHT')) simpleInstruction = 'Fork right';
              else if (maneuver.includes('ROUNDABOUT')) simpleInstruction = 'Take roundabout';
            } else if (step.navigationInstruction?.instructions) {
               // Fallback: take first 3 words to keep it short if maneuver missing
               const plain = step.navigationInstruction.instructions.replace(/<[^>]*>/g, '').trim();
               simpleInstruction = plain.split(' ').slice(0, 3).join(' ') + '...';
            }

            return {
              Instruction: simpleInstruction,
              Distance: (step.distanceMeters || 0) / 1000,
              DurationSeconds: parseInt(step.duration?.replace('s', '') || '0', 10),
              EndPosition: [step.endLocation?.latLng?.longitude, step.endLocation?.latLng?.latitude]
            };
          })
        : [];

      const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);

      return {
        id: `route-${index}`,
        Label: '',
        Distance: ((route.distanceMeters || 0) / 1000).toFixed(1),
        DistanceMeters: route.distanceMeters || 0,
        DurationSeconds: durationSeconds,
        SafetyScore: safetyScore,
        IncidentsCount: incidentsCount,
        Geometry: {
          LineString: pathCoords,
          type: 'LineString',
          coordinates: pathCoords
        },
        Steps: steps
      };
    });

    if (processedRoutes.length === 0) {
      return res.status(404).json({ success: false, error: 'No drivable route found.' });
    }

    // ---- Categorise: FASTEST / BALANCED / COMMUNITY SAFETY ----
    // Ensure we provide exactly these 3 unique routes if available.
    
    // Deduplicate routes by checking geometry length / distance
    const uniqueRoutes = processedRoutes.reduce((acc: any[], current: any) => {
      const exists = acc.find((r: any) => Math.abs(r.DistanceMeters - current.DistanceMeters) < 50 && r.DurationSeconds === current.DurationSeconds);
      if (!exists) acc.push(current);
      return acc;
    }, []);

    // 1. Fastest = minimum travel time
    const fastestRoute = uniqueRoutes.reduce((a: any, b: any) =>
      a.DurationSeconds <= b.DurationSeconds ? a : b
    );

    // 2. Community Safety = maximum safety score; tie-break on lower duration
    let safestRoute = uniqueRoutes.reduce((a: any, b: any) => {
      if (a.SafetyScore !== b.SafetyScore) return a.SafetyScore > b.SafetyScore ? a : b;
      return a.DurationSeconds <= b.DurationSeconds ? a : b;
    });

    // 3. Balanced = weighted combination of safety (50%) and speed (50%)
    const fastestDur = fastestRoute.DurationSeconds;
    let balancedRoute = uniqueRoutes.reduce((a: any, b: any) => {
      const penA = ((a.DurationSeconds / fastestDur) - 1) * 100;
      const penB = ((b.DurationSeconds / fastestDur) - 1) * 100;
      const scoreA = 0.5 * a.SafetyScore - 0.5 * penA;
      const scoreB = 0.5 * b.SafetyScore - 0.5 * penB;
      return scoreA >= scoreB ? a : b;
    });

    // If there are no incidents along the fastest route (it's 100% safe), 
    // there's no reason to artificially label another route as "Community Safety".
    // We only use the safety labels if they genuinely provide a safety advantage.
    const isGenuinelySafer = safestRoute.SafetyScore > fastestRoute.SafetyScore;

    const finalSelection = [
      { ...fastestRoute, id: 'fastest', Label: 'FASTEST' }
    ];
    
    let remainingRoutes = uniqueRoutes.filter((r: any) => r.id !== fastestRoute.id);

    if (isGenuinelySafer) {
      // It's genuinely safer, so we assign Community Safety and Balanced
      finalSelection.push({ ...safestRoute, id: 'safest', Label: 'COMMUNITY SAFETY' });
      remainingRoutes = remainingRoutes.filter((r: any) => r.id !== safestRoute.id);
      
      if (balancedRoute.id !== fastestRoute.id && balancedRoute.id !== safestRoute.id) {
        finalSelection.push({ ...balancedRoute, id: 'balanced', Label: 'BALANCED' });
        remainingRoutes = remainingRoutes.filter((r: any) => r.id !== balancedRoute.id);
      }
    }

    // Any remaining alternatives (or all of them if there was no safety difference) get a generic label
    remainingRoutes.forEach((route: any, idx: number) => {
      finalSelection.push({ ...route, id: `alt-${idx + 1}`, Label: `ALTERNATIVE ${idx + 1}` });
    });

    return res.json({ success: true, routes: finalSelection });

  } catch (error: any) {
    console.error('Routing error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to calculate a route right now. Please try again.'
    });
  }
});

export default router;
