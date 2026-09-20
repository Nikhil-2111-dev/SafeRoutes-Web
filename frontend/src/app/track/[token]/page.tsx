'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface SOSSession {
  name: string;
  status: string;
  lastLatitude: number;
  lastLongitude: number;
  lastUpdatedAt: string;
  startedAt: string;
}

export default function TrackPage() {
  const { token } = useParams();
  const [session, setSession] = useState<SOSSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/sos/tracking/${token}`);
      if (!res.ok) {
        throw new Error('Tracking session not found or inactive');
      }
      const data = await res.json();
      setSession(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // Poll every 5 seconds for live location updates
    const interval = setInterval(fetchSession, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl">
          <h1 className="text-2xl font-bold text-danger mb-4">Tracking Unavailable</h1>
          <p className="text-slate-400">{error || "This SOS session has ended or does not exist."}</p>
        </div>
      </div>
    );
  }

  const isResolved = session.status === 'RESOLVED' || session.status === 'CANCELLED';

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className={`p-4 shadow-md z-10 flex items-center justify-between ${isResolved ? 'bg-safe' : 'bg-danger text-white'}`}>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isResolved ? 'SOS Resolved' : '🔴 EMERGENCY SOS TRACKING'}
          </h1>
          <p className="text-sm opacity-90 font-medium">{session.name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase opacity-80 mb-1">Last Updated</p>
          <p className="text-sm font-bold">
            {new Date(session.lastUpdatedAt).toLocaleTimeString()}
          </p>
        </div>
      </header>

      {/* Map */}
      <main className="flex-1 relative">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: session.lastLongitude,
            latitude: session.lastLatitude,
            zoom: 15
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" />
          
          <Marker 
            longitude={session.lastLongitude} 
            latitude={session.lastLatitude}
          >
            <div className="relative flex items-center justify-center">
              {!isResolved && (
                <div className="absolute w-16 h-16 bg-danger/30 rounded-full animate-ping"></div>
              )}
              <div className={`w-6 h-6 rounded-full border-4 border-white shadow-xl ${isResolved ? 'bg-safe' : 'bg-danger'}`}></div>
            </div>
          </Marker>
        </Map>

        {isResolved && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border-t-8 border-safe">
              <h2 className="text-2xl font-bold text-safe mb-2">SOS Resolved</h2>
              <p className="text-slate-600 dark:text-slate-300">
                {session.name} has cancelled the SOS alert. They are no longer sharing their live location.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
