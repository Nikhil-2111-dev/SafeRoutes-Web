import { Router } from 'express';
import haversine from 'haversine';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const router = Router();
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'SafeRouteIncidents';

// The threshold radius for an incident to impact a route (e.g. 200 meters)
const IMPACT_RADIUS_METERS = 200;

router.post('/score', async (req, res) => {
  const { path } = req.body; // path is an array of {lat, lng} or {latitude, longitude}

  if (!path || !Array.isArray(path) || path.length === 0) {
    return res.status(400).json({ error: 'Valid path coordinates are required' });
  }

  try {
    // 1. Fetch all active incidents
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': 'active' }
    });
    const response = await docClient.send(command);
    const incidents = response.Items || [];

    let safetyScore = 100;
    const impactingIncidents: any[] = [];
    const penaltyPerIncident = 3;

    // 2. Iterate over incidents to see if they are within IMPACT_RADIUS_METERS of ANY point on the route
    for (const incident of incidents) {
      const incidentCoord = { latitude: incident.latitude, longitude: incident.longitude };
      
      let affectsRoute = false;
      for (const point of path) {
        // Handle both {lat, lng} and {latitude, longitude}
        const routeCoord = { 
          latitude: point.lat || point.latitude, 
          longitude: point.lng || point.longitude 
        };
        
        const distance = haversine(incidentCoord, routeCoord, { unit: 'meter' });
        
        if (distance <= IMPACT_RADIUS_METERS) {
          affectsRoute = true;
          break; // Optimization: as soon as it hits the route once, it affects the route
        }
      }

      if (affectsRoute) {
        safetyScore -= penaltyPerIncident;
        impactingIncidents.push(incident);
      }
    }

    // Ensure score doesn't fall below 0
    safetyScore = Math.max(0, safetyScore);

    res.status(200).json({ 
      success: true, 
      score: safetyScore, 
      impactingIncidents 
    });

  } catch (error) {
    console.error('Error calculating route score:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate safety score' });
  }
});

export default router;
