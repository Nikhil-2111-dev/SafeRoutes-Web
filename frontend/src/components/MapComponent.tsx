'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Map, useMap, useMapsLibrary, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { io, Socket } from 'socket.io-client';

interface Incident {
  incidentId: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: number;
  createdAt: string;
  status: string;
}

interface SearchResult {
  label: string;
  point: [number, number]; 
}

// Helper to get time ago
function timeAgo(dateString: string) {
  const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} minutes ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function MapComponent() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [destination, setDestination] = useState<{lat: number, lng: number} | null>(null);
  
  // Routing state
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeScores, setRouteScores] = useState<any[]>([]);
  
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  // WebSocket Connection
  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    
    socket.on('new_incident', (incident: Incident) => {
      setIncidents(prev => [...prev, incident]);
      // If a route is active, we should ideally re-score it. 
      // For now, the user sees the marker appear instantly.
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch initial incidents
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/incidents`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIncidents(data.incidents || []);
        }
      })
      .catch(console.error);
  }, []);

  // Initialize Directions Service
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    const renderer = new routesLibrary.DirectionsRenderer({ 
      map,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 6,
        strokeOpacity: 0.8
      }
    });
    setDirectionsRenderer(renderer);
  }, [routesLibrary, map]);

  // Handle AWS Location Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const selectDestination = (result: SearchResult) => {
    const dest = { lat: result.point[1], lng: result.point[0] };
    setDestination(dest);
    setSearchResults([]);
    setSearchQuery(result.label);
    
    if (map) {
      map.panTo(dest);
      map.setZoom(14);
    }

    calculateRoutes(dest);
  };

  const calculateRoutes = async (dest: {lat: number, lng: number}) => {
    if (!directionsService || !directionsRenderer) return;

    // For demonstration, use a fixed origin (e.g. London). In prod, use Geolocation API.
    const origin = { lat: 51.5072, lng: -0.1276 }; 

    directionsService.route({
      origin,
      destination: dest,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    }).then(async response => {
      directionsRenderer.setDirections(response);
      setRoutes(response.routes);
      
      // Score each route via Backend (AWS DynamoDB Incidents)
      const scores = await Promise.all(response.routes.map(async (route, index) => {
        const path = route.overview_path.map(p => ({ lat: p.lat(), lng: p.lng() }));
        const scoreRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/route/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path })
        });
        const scoreData = await scoreRes.json();
        
        // Determine label
        let type = "Balanced";
        if (index === 0) type = "Fastest"; // Google returns fastest first
        // If it's the safest route (will be recalculated below)
        
        return {
          index,
          type,
          duration: route.legs[0].duration?.text,
          distance: route.legs[0].distance?.text,
          safetyScore: scoreData.score || 100,
          incidentsCount: scoreData.impactingIncidents?.length || 0
        };
      }));

      // Identify the safest route
      let safestIdx = 0;
      let highestScore = -1;
      scores.forEach((s, i) => {
        if (s.safetyScore > highestScore) {
          highestScore = s.safetyScore;
          safestIdx = i;
        }
      });
      scores[safestIdx].type = "Safest";
      
      setRouteScores(scores);
      
      // Auto-select safest if it's different from fastest and has a better score
      if (safestIdx !== 0 && scores[safestIdx].safetyScore > scores[0].safetyScore) {
        changeRoute(safestIdx);
      } else {
        changeRoute(0);
      }

    }).catch(err => {
      console.error('Routing failed:', err);
    });
  };

  const changeRoute = (index: number) => {
    setSelectedRouteIndex(index);
    if (directionsRenderer) {
      directionsRenderer.setRouteIndex(index);
    }
  };

  // Get Custom Pin configuration based on Category
  const getPinConfig = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('women')) return { bg: '#e11d48', glyph: '👩', text: 'Women Safety' };
    if (cat.includes('child')) return { bg: '#ea580c', glyph: '🧒', text: 'Child Safety' };
    if (cat.includes('theft')) return { bg: '#7f1d1d', glyph: '🦹', text: 'Theft' };
    if (cat.includes('lighting')) return { bg: '#d97706', glyph: '💡', text: 'Poor Lighting' };
    return { bg: '#ef4444', glyph: '⚠️', text: 'General Hazard' };
  };

  return (
    <div className="relative w-full h-full flex flex-col font-sans">
      
      {/* Search Bar (AWS Location Service) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-xl z-20 pointer-events-auto px-4">
        <form onSubmit={handleSearch} className="flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden border border-slate-200/20 dark:border-white/10 transition-all focus-within:ring-2 focus-within:ring-blue-500">
          <div className="pl-4 flex items-center text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            className="flex-1 px-4 py-4 bg-transparent outline-none dark:text-white text-lg font-medium placeholder-slate-400"
            placeholder="Search destination via AWS Location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="px-8 bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
            Navigate
          </button>
        </form>
        
        {searchResults.length > 0 && (
          <ul className="mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 max-h-60 overflow-y-auto">
            {searchResults.map((res, i) => (
              <li 
                key={i} 
                onClick={() => selectDestination(res)}
                className="px-6 py-4 hover:bg-slate-100/50 dark:hover:bg-white/5 cursor-pointer border-b last:border-0 border-white/5 flex items-center gap-3 transition"
              >
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{res.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Route Options Panel */}
      {routeScores.length > 0 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl z-20 pointer-events-auto px-4">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex gap-4 overflow-x-auto border border-white/10">
            {routeScores.map((score, idx) => {
              const isSelected = selectedRouteIndex === score.index;
              let badgeColor = 'bg-slate-100 text-slate-600';
              if (score.type === 'Safest') badgeColor = 'bg-green-100 text-green-700 border border-green-200';
              if (score.type === 'Fastest') badgeColor = 'bg-blue-100 text-blue-700 border border-blue-200';

              return (
                <button 
                  key={idx}
                  onClick={() => changeRoute(score.index)}
                  className={`flex-1 min-w-[220px] p-5 rounded-2xl text-left transition-all relative overflow-hidden group ${
                    isSelected 
                      ? 'bg-blue-50/50 dark:bg-blue-900/30 border-2 border-blue-500 shadow-inner' 
                      : 'bg-white dark:bg-[#1c1c1c] border-2 border-transparent hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeColor}`}>
                      {score.type}
                    </span>
                  </div>
                  <div className="font-bold text-2xl dark:text-white mt-3 mb-1">{score.duration}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{score.distance}</div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                    <div>
                      <div className={`text-xl font-black ${score.safetyScore > 80 ? 'text-green-500' : score.safetyScore > 50 ? 'text-orange-500' : 'text-red-500'}`}>
                        {score.safetyScore}/100
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">Safety Score</div>
                    </div>
                    {score.incidentsCount > 0 && (
                      <div className="text-right">
                        <div className="text-red-500 font-bold text-lg flex items-center justify-end gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                          {score.incidentsCount}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">Alerts Near Route</div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Google Map */}
      <Map
        defaultCenter={{ lat: 51.5072, lng: -0.1276 }}
        defaultZoom={13}
        mapId="SAFE_ROUTE_DEMO_MAP"
        disableDefaultUI={true}
        gestureHandling="greedy"
      >
        {incidents.map((incident) => {
          const config = getPinConfig(incident.category);
          return (
            <AdvancedMarker 
              key={incident.incidentId}
              position={{ lat: incident.latitude, lng: incident.longitude }}
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="relative group cursor-pointer">
                {/* Ping animation for active threat */}
                <div className="absolute -inset-2 rounded-full opacity-40 animate-ping" style={{ backgroundColor: config.bg }}></div>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white text-xl z-10 transition-transform group-hover:scale-110" style={{ backgroundColor: config.bg }}>
                  {config.glyph}
                </div>
              </div>
            </AdvancedMarker>
          );
        })}

        {selectedIncident && (
          <InfoWindow
            position={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }}
            onCloseClick={() => setSelectedIncident(null)}
            pixelOffset={[0, -20]}
          >
            <div className="p-1 min-w-[200px] text-slate-800">
              <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-2">
                <span className="text-xl">{getPinConfig(selectedIncident.category).glyph}</span>
                <strong className="text-sm font-bold">{getPinConfig(selectedIncident.category).text} Report</strong>
              </div>
              <p className="text-xs text-slate-500 mb-3">{selectedIncident.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-lg">
                <div>
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Reported</div>
                  <div className="font-semibold">{timeAgo(selectedIncident.createdAt)}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Impact</div>
                  <div className="font-semibold text-red-600">-{selectedIncident.severity} points</div>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-center font-mono uppercase tracking-widest text-blue-600 bg-blue-50 py-1 rounded">
                Status: {selectedIncident.status}
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}
