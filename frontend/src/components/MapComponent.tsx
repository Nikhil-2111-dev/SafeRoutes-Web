'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const mapRef = useRef<MapRef>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const onMapLoad = useCallback(() => {
    // Globe projection was causing the location marker to disappear on certain zoom levels.
    // Keeping default Mercator for better marker stability.
  }, []);

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
        <NavigationControl position="bottom-right" />
        
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
          showAccuracyCircle={true} 
          onGeolocate={onGeolocate}
        />
      </Map>
    </div>
  );
}
