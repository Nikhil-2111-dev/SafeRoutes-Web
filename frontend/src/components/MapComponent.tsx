'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef, Source, Layer, LayerProps } from 'react-map-gl/maplibre';
import { fetchAuthSession } from 'aws-amplify/auth';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Pin {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string;
  tags?: string[];
}

// Helper to create a heatmap layer
const createHeatmapLayer = (id: string, source: string, color: string): LayerProps => ({
  id,
  type: 'heatmap',
  source,
  maxzoom: 24, // Show heatmap at all zoom levels
  paint: {
    'heatmap-weight': 1,
    'heatmap-intensity': [
      'interpolate', ['linear'], ['zoom'],
      0, 1,
      12, 3,
      15, 12,
      20, 25
    ],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(0, 0, 0, 0)',
      0.2, `${color.replace(')', ', 0.2)').replace('rgb', 'rgba')}`,
      0.4, `${color.replace(')', ', 0.4)').replace('rgb', 'rgba')}`,
      0.6, `${color.replace(')', ', 0.6)').replace('rgb', 'rgba')}`,
      0.8, `${color.replace(')', ', 0.8)').replace('rgb', 'rgba')}`,
      1, `${color.replace(')', ', 1)').replace('rgb', 'rgba')}`
    ],
    // Scale radius exponentially (base 2) so it approximates 300 meters at all zoom levels.
    // At zoom 15, 1 pixel is ~3.1 meters (at average latitudes), so 300m = ~96 pixels.
    'heatmap-radius': [
      'interpolate', ['exponential', 2], ['zoom'],
      10, 3,
      15, 96,
      20, 3072
    ],
    'heatmap-opacity': 0.8
  }
});

// For Point representation at high zoom levels
const createPointLayer = (id: string, source: string, color: string): LayerProps => ({
  id,
  type: 'circle',
  source,
  minzoom: 14,
  paint: {
    'circle-radius': 6,
    'circle-color': color,
    'circle-stroke-color': 'white',
    'circle-stroke-width': 2,
    'circle-opacity': [
      'interpolate', ['linear'], ['zoom'],
      14, 0,
      15, 1
    ]
  }
});

// Draw a literal 300m circle boundary to clearly flag the area
const createAreaLayer = (id: string, source: string, color: string): LayerProps => ({
  id,
  type: 'circle',
  source,
  paint: {
    'circle-radius': [
      'interpolate', ['exponential', 2], ['zoom'],
      10, 3,
      15, 96,
      20, 3072
    ],
    'circle-color': color,
    'circle-opacity': 0.1,
    'circle-stroke-color': color,
    'circle-stroke-width': 1,
    'circle-stroke-opacity': 0.4
  }
});

export default function MapComponent() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<MapRef>(null);
  const geoControlRef = useRef<any>(null);

  useEffect(() => {
    // Auto-trigger geolocation once the map mounts
    const timer = setTimeout(() => {
      if (geoControlRef.current) {
        geoControlRef.current.trigger();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/pins`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (res.ok) {
          const data = await res.json();
          setPins(data);
        }
      } catch (e) {
        console.warn("Failed to fetch pins:", e);
      }
    };
    
    fetchPins();
    
    // Optionally set up polling every 30s to keep pins fresh
    const interval = setInterval(fetchPins, 30000);
    return () => clearInterval(interval);
  }, []);

  // For AWS Hackathons: If you configure Identity Pool, we use AWS Maps. Otherwise, fallback to Carto Dark Matter.
  const awsMapName = process.env.NEXT_PUBLIC_AWS_MAP_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
  const mapStyle = awsMapName 
    ? `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${awsMapName}/style-descriptor`
    : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  // Handle live location updates to sync with AWS backend
  const onGeolocate = useCallback((e: GeolocationPosition) => {
    const lat = e.coords.latitude;
    const lng = e.coords.longitude;
    
    // Reliably set our own custom marker state
    setUserLocation({ lat, lng });

    fetch('http://localhost:5000/api/v1/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lng, timestamp: new Date().toISOString() })
    }).catch(err => console.warn('Failed to sync location to backend:', err));
  }, []);

  const onMapLoad = useCallback((e: any) => {
    // Globe projection was causing the location marker to disappear on certain zoom levels.
    // Keeping default Mercator for better marker stability.
  }, []);

  // Categorize pins into GeoJSON FeatureCollections
  const geojsons = useMemo(() => {
    const dirtyFeatures: any[] = [];
    const unsafeFeatures: any[] = [];
    const crowdedFeatures: any[] = [];
    const safeFeatures: any[] = [];

    pins.forEach(pin => {
      const tags = pin.tags || [];
      const tagsStr = tags.join(' ').toLowerCase();

      // Categorize based on tags
      let category = 'safe'; 
      if (tagsStr.includes('dirty') || tagsStr.includes('unhygienic') || tagsStr.includes('garbage') || tagsStr.includes('trash') || tagsStr.includes('smell')) {
        category = 'dirty';
      } else if (tagsStr.includes('unsafe') || tagsStr.includes('danger') || tagsStr.includes('dark') || tagsStr.includes('suspicious') || tagsStr.includes('creepy') || tagsStr.includes('hazard')) {
        category = 'unsafe';
      } else if (tagsStr.includes('crowd') || tagsStr.includes('traffic') || tagsStr.includes('busy') || tagsStr.includes('noisy')) {
        category = 'crowded';
      } else if (tagsStr.includes('clean') || tagsStr.includes('safe') || tagsStr.includes('well-lit') || tagsStr.includes('walk') || tagsStr.includes('friendly')) {
        category = 'safe';
      } else {
        // Fallback to type if tags are inconclusive
        if (pin.type === 'danger') category = 'unsafe';
        else if (pin.type === 'warning') category = 'dirty';
        else if (pin.type === 'safe') category = 'safe';
      }

      const feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [pin.longitude, pin.latitude] },
        properties: { ...pin }
      };

      if (category === 'dirty') dirtyFeatures.push(feature);
      else if (category === 'unsafe') unsafeFeatures.push(feature);
      else if (category === 'crowded') crowdedFeatures.push(feature);
      else if (category === 'safe') safeFeatures.push(feature);
    });

    return {
      dirty: { type: 'FeatureCollection', features: dirtyFeatures },
      unsafe: { type: 'FeatureCollection', features: unsafeFeatures },
      crowded: { type: 'FeatureCollection', features: crowdedFeatures },
      safe: { type: 'FeatureCollection', features: safeFeatures },
    };
  }, [pins]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0a0a0a]">

      <Map
        ref={mapRef}
        onLoad={onMapLoad}
        initialViewState={{
          longitude: -0.1276, // Start globally centered
          latitude: 51.5072,
          zoom: 1 // Zoom out completely
        }}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        renderWorldCopies={false}
      >
        <NavigationControl position="top-left" />
        
        {/* Heatmap Sources & Layers */}
        <Source id="dirty-source" type="geojson" data={geojsons.dirty as any}>
          <Layer {...createHeatmapLayer('dirty-heatmap', 'dirty-source', 'rgb(255, 165, 0)')} />
          <Layer {...createAreaLayer('dirty-area', 'dirty-source', 'rgb(255, 165, 0)')} />
          <Layer {...createPointLayer('dirty-point', 'dirty-source', 'rgb(255, 165, 0)')} />
        </Source>

        <Source id="unsafe-source" type="geojson" data={geojsons.unsafe as any}>
          <Layer {...createHeatmapLayer('unsafe-heatmap', 'unsafe-source', 'rgb(255, 0, 0)')} />
          <Layer {...createAreaLayer('unsafe-area', 'unsafe-source', 'rgb(255, 0, 0)')} />
          <Layer {...createPointLayer('unsafe-point', 'unsafe-source', 'rgb(255, 0, 0)')} />
        </Source>

        <Source id="crowded-source" type="geojson" data={geojsons.crowded as any}>
          <Layer {...createHeatmapLayer('crowded-heatmap', 'crowded-source', 'rgb(0, 0, 255)')} />
          <Layer {...createAreaLayer('crowded-area', 'crowded-source', 'rgb(0, 0, 255)')} />
          <Layer {...createPointLayer('crowded-point', 'crowded-source', 'rgb(0, 0, 255)')} />
        </Source>

        <Source id="safe-source" type="geojson" data={geojsons.safe as any}>
          <Layer {...createHeatmapLayer('safe-heatmap', 'safe-source', 'rgb(0, 255, 0)')} />
          <Layer {...createAreaLayer('safe-area', 'safe-source', 'rgb(0, 255, 0)')} />
          <Layer {...createPointLayer('safe-point', 'safe-source', 'rgb(0, 255, 0)')} />
        </Source>

        {/* Custom Highly Reliable User Location Dot */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center w-8 h-8 pointer-events-none">
              {/* Radar pulse effect */}
              <div className="absolute inset-0 bg-[#007bff] rounded-full opacity-40 animate-ping"></div>
              {/* Core solid dot */}
              <div className="relative w-4 h-4 bg-[#007bff] rounded-full border-[3px] border-white shadow-[0_0_10px_rgba(0,123,255,0.8)]"></div>
            </div>
          </Marker>
        )}

        {/* Native Tracking Control Logic (Hidden native dot, custom dot used above) */}
        <GeolocateControl
          ref={geoControlRef}
          position="bottom-right"
          positionOptions={{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }}
          trackUserLocation={true}
          showUserLocation={false} 
          showUserHeading={true}
          showAccuracyCircle={true} 
          onGeolocate={onGeolocate}
        />
      </Map>
    </div>
  );
}
