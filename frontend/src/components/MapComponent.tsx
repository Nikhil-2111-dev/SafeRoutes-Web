'use client';
import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { io, Socket } from 'socket.io-client';
import { Search, Navigation2, Plus, Minus, MapPin, X, LocateFixed, Route, PanelRightClose, PanelRightOpen, ArrowRight, Zap, ShieldCheck, Scale, Clock, Gauge, Map as MapIcon } from 'lucide-react';
import { usePOIs } from '../hooks/usePOIs';
import { loadPOIIcons } from '../utils/poiIcons';

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
  placeId?: string;
  label: string;
  point?: [number, number];
}

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function timeAgo(dateString: string) {
  const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} minutes ago`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const getPinConfig = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('women')) return { bg: '#e11d48', glyph: '👩', text: 'Women Safety' };
  if (cat.includes('child')) return { bg: '#ea580c', glyph: '🧒', text: 'Child Safety' };
  if (cat.includes('theft')) return { bg: '#7f1d1d', glyph: '🦹', text: 'Theft' };
  if (cat.includes('lighting')) return { bg: '#d97706', glyph: '💡', text: 'Poor Lighting' };
  return { bg: '#ef4444', glyph: '⚠️', text: 'General Hazard' };
};

// ==========================================
// Isolated Sub-components for Performance
// ==========================================

const LiveUserMarker = memo(({ 
  mapRef, 
  isNavigating, 
  isFollowingUser, 
  activeRoute, 
  currentStepIndex,
  setOffRoute,
  setCurrentStepIndex,
  onLocationUpdate,
  onSpeedUpdate,
  onDistanceUpdate,
  triggerRecalculate,
  isFlyingRef,
  initialLocation
}: any) => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number}>(initialLocation);
  const [markerTransition, setMarkerTransition] = useState('none');
  const [heading, setHeading] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastLocationRef = useRef<{lat: number, lng: number}>(initialLocation);
  const lastCameraUpdateRef = useRef<number>(0);
  
  const isFollowingUserRef = useRef(isFollowingUser);
  const isNavigatingRef = useRef(isNavigating);
  const activeRouteRef = useRef(activeRoute);
  const currentStepIndexRef = useRef(currentStepIndex);

  useEffect(() => {
    isFollowingUserRef.current = isFollowingUser;
    isNavigatingRef.current = isNavigating;
    activeRouteRef.current = activeRoute;
    currentStepIndexRef.current = currentStepIndex;
  }, [isFollowingUser, isNavigating, activeRoute, currentStepIndex]);

  useEffect(() => {
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const accuracy = pos.coords.accuracy || 10;

          // Report real GPS speed to parent
          if (onSpeedUpdate) {
            const rawSpeed = pos.coords.speed;
            const kmh = (rawSpeed != null && rawSpeed >= 0) ? rawSpeed * 3.6 : null;
            onSpeedUpdate(kmh);
          }

          if (lastLocationRef.current) {
            const dist = calculateDistanceMeters(lastLocationRef.current.lat, lastLocationRef.current.lng, loc.lat, loc.lng);
            if (dist < Math.max(accuracy, 3)) return;
            setMarkerTransition(dist > 5000 ? 'none' : 'transform 1.2s linear');
          } else {
            setMarkerTransition('none');
          }

          lastLocationRef.current = loc;
          setCurrentLocation(loc);
          onLocationUpdate(loc);

          // Update heading state if available
          if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
            setHeading(pos.coords.heading);
          }

          if (mapRef.current && isFollowingUserRef.current && !isFlyingRef.current) {
            const now = Date.now();
            const currentCenter = mapRef.current.getCenter();
            const camDist = calculateDistanceMeters(currentCenter.lat, currentCenter.lng, loc.lat, loc.lng);
            
            const hasHeading = pos.coords.heading !== null && !isNaN(pos.coords.heading);
            const currentBearing = mapRef.current.getBearing();
            const bearingChanged = hasHeading && Math.abs(currentBearing - pos.coords.heading) > 5;

            if ((camDist > 5 || bearingChanged) && now - lastCameraUpdateRef.current > 1000) {
              const easeOptions: any = { center: [loc.lng, loc.lat], duration: 800, easing: (t: number) => t };
              if (isNavigatingRef.current && hasHeading) {
                easeOptions.bearing = pos.coords.heading;
              }
              mapRef.current.easeTo(easeOptions);
              lastCameraUpdateRef.current = now;
            }
          }

          if (activeRouteRef.current && activeRouteRef.current.Steps.length > 0 && currentStepIndexRef.current < activeRouteRef.current.Steps.length) {
            const currentStep = activeRouteRef.current.Steps[currentStepIndexRef.current];
            const endPos = currentStep.EndPosition;
            if (endPos) {
              const dist = calculateDistanceMeters(loc.lat, loc.lng, endPos[1], endPos[0]);
              if (onDistanceUpdate) onDistanceUpdate(dist);

              if (dist < 30) {
                setCurrentStepIndex((prev: number) => prev + 1);
              }

              if (dist > (currentStep.Distance * 1000 + 300)) {
                setOffRoute(true);
                triggerRecalculate(loc);
              } else {
                setOffRoute(false);
              }
            }
          }

          // Send tracking update only during active navigation to save AWS resources and battery
          if (isNavigatingRef.current) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/tracking`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                deviceId: 'user-navigation-session', 
                latitude: loc.lat, 
                longitude: loc.lng,
                accuracy: pos.coords.accuracy,
                speed: pos.coords.speed,
                heading: pos.coords.heading,
                sampleTime: new Date(pos.timestamp).toISOString()
              })
            }).catch(() => { });
          }
        },
        (err) => console.error("Navigation error:", err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (!currentLocation) return null;

  return (
    <Marker 
      longitude={currentLocation.lng} 
      latitude={currentLocation.lat} 
      anchor="center" 
      style={{ transition: markerTransition }}
    >
      {isNavigating ? (
        <div 
          className="relative flex items-center justify-center w-12 h-12 z-50 drop-shadow-2xl"
          style={{ 
            // If we don't have map rotation active, we rotate the icon itself. Otherwise it stays upright.
            transform: (heading !== null && !mapRef.current?.isMoving()) ? `rotate(${heading - (mapRef.current?.getBearing() || 0)}deg)` : 'none',
            transition: 'transform 0.5s ease-out'
          }}
        >
          {/* Navigation Arrow */}
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping" style={{ transform: 'scale(0.8)' }}></div>
          <div className="bg-white w-9 h-9 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center border-2 border-blue-500">
            <Navigation2 className="w-5 h-5 text-blue-600 fill-blue-600 -mt-0.5" />
          </div>
        </div>
      ) : (
        <div className="relative flex items-center justify-center w-6 h-6 z-50">
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-40 animate-ping"></div>
          <div className="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
        </div>
      )}
    </Marker>
  );
});

// ==========================================
// Main Map Component
// ==========================================

export default function MapComponent() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Search State
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [originResults, setOriginResults] = useState<SearchResult[]>([]);
  const [destResults, setDestResults] = useState<SearchResult[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [originActiveIndex, setOriginActiveIndex] = useState(-1);
  const [destActiveIndex, setDestActiveIndex] = useState(-1);
  const [originPoint, setOriginPoint] = useState<{ lat: number, lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number, lng: number } | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [safetyNotification, setSafetyNotification] = useState<string | null>(null);

  const mapRef = useRef<MapRef>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const isFlyingRef = useRef(false);

  const [showPOIs, setShowPOIs] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { poiGeoJson, isFetchingPOIs } = usePOIs(mapRef, showPOIs, mapLoaded);
  const [hoveredPoi, setHoveredPoi] = useState<{ id: string, name: string, x: number, y: number } | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<{ id: string, name: string, category: string, lat: number, lon: number } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [initialLocation, setInitialLocation] = useState<{ lat: number, lng: number } | null>(null); 
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setInitialLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.warn('Geolocation failed or denied, using default location:', err);
          setInitialLocation({ lat: 26.8467, lng: 80.9462 }); // Lucknow fallback
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setInitialLocation({ lat: 26.8467, lng: 80.9462 });
    }
  }, []);

  // Navigation State
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [offRoute, setOffRoute] = useState(false);
  const [liveSafetyAlert, setLiveSafetyAlert] = useState<{ old: number, new: number } | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [navSpeedKmh, setNavSpeedKmh] = useState<number | null>(null);
  const [navPermissionError, setNavPermissionError] = useState<string | null>(null);
  const [realTimeDistance, setRealTimeDistance] = useState<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const latestLocationRef = useRef<{ lat: number, lng: number } | null>(null);

  // Routing State
  const [routeOptions, setRouteOptions] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('fastest');
  const [routeError, setRouteError] = useState<string | null>(null);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const originDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originAbortRef = useRef<AbortController | null>(null);
  const destAbortRef = useRef<AbortController | null>(null);

  const activeRoute = routeOptions.find(r => r.id === selectedRouteId) || null;
  const interactiveLayerIds = useMemo(() => {
    const layers = [...routeOptions.map(r => `route-line-${r.id}`), 'unclustered-point'];
    if (showPOIs) layers.push('poi-unclustered');
    return layers;
  }, [routeOptions, showPOIs]);

  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    socket.on('new_incident', (incident: Incident) => {
      setIncidents(prev => [...prev, incident]);
      
      // Authoritative Recalculation
      // The backend handles the complex logic. We just ask it for the new routes.
      const start = originPoint || latestLocationRef.current;
      if (destination && start) {
        setSafetyNotification('New incident reported. Recalculating affected routes...');
        
        // Silent calculate
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/route/calculate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: start, destination })
        }).then(res => res.json()).then(data => {
          if (data.success && data.routes) {
            setRouteOptions(data.routes);
            setSafetyNotification('Safety information updated.');
            setTimeout(() => setSafetyNotification(null), 5000);
          }
        }).catch(err => console.error('Silent recalculation failed:', err));
      }
    });
    return () => { socket.disconnect(); };
  }, [destination, originPoint]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/incidents`)
      .then(res => res.json())
      .then(data => { if (data.success) setIncidents(data.incidents || []); })
      .catch(console.error);

    // Geolocation is now triggered manually via the 'GO' or 'Current Location' buttons.
  }, []);

  const searchOrigin = (query: string) => {
    setOriginQuery(query);
    setOriginActiveIndex(-1);
    
    if (originAbortRef.current) {
      originAbortRef.current.abort();
    }
    
    if (!query.trim()) {
      setOriginResults([]);
      setIsSearchingOrigin(false);
      return;
    }
    setIsSearchingOrigin(true);
    if (originDebounceRef.current) clearTimeout(originDebounceRef.current);
    
    originDebounceRef.current = setTimeout(async () => {
      originAbortRef.current = new AbortController();
      try {
        const center = mapRef.current?.getMap()?.getCenter();
        const biasPosition = center ? [center.lng, center.lat] : (latestLocationRef.current ? [latestLocationRef.current.lng, latestLocationRef.current.lat] : undefined);
        
        let results = null;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (apiKey) {
          try {
            const body: any = { input: query, includedRegionCodes: ["IN"] };
            if (biasPosition) {
              body.locationBias = {
                circle: {
                  center: { latitude: biasPosition[1], longitude: biasPosition[0] },
                  radius: 50000.0
                }
              };
            }
            const gRes = await fetch(`https://places.googleapis.com/v1/places:autocomplete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
              body: JSON.stringify(body),
              signal: originAbortRef.current.signal
            });
            if (gRes.ok) {
              const gData = await gRes.json();
              results = (gData.suggestions || []).map((s: any) => ({
                placeId: s.placePrediction.placeId,
                label: s.placePrediction.text.text
              }));
            }
          } catch (err: any) {
            if (err.name !== 'AbortError') console.warn('Google Places Autocomplete failed, falling back...', err);
            else throw err;
          }
        }

        if (!results) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/search`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, biasPosition }),
            signal: originAbortRef.current.signal
          });
          const data = await res.json();
          results = data.success ? (data.results || []) : [];
        }
        
        setOriginResults(results || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setOriginResults([]);
        }
      } finally {
        setIsSearchingOrigin(false);
      }
    }, 250);
  };

  const searchDest = (query: string) => {
    setDestQuery(query);
    setDestActiveIndex(-1);
    
    if (destAbortRef.current) {
      destAbortRef.current.abort();
    }

    if (!query.trim()) {
      setDestResults([]);
      setIsSearchingDest(false);
      return;
    }
    setIsSearchingDest(true);
    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    
    destDebounceRef.current = setTimeout(async () => {
      destAbortRef.current = new AbortController();
      try {
        const center = mapRef.current?.getMap()?.getCenter();
        const biasPosition = center ? [center.lng, center.lat] : (latestLocationRef.current ? [latestLocationRef.current.lng, latestLocationRef.current.lat] : undefined);
        
        let results = null;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        if (apiKey) {
          try {
            const body: any = { input: query, includedRegionCodes: ["IN"] };
            if (biasPosition) {
              body.locationBias = {
                circle: {
                  center: { latitude: biasPosition[1], longitude: biasPosition[0] },
                  radius: 50000.0
                }
              };
            }
            const gRes = await fetch(`https://places.googleapis.com/v1/places:autocomplete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
              body: JSON.stringify(body),
              signal: destAbortRef.current.signal
            });
            if (gRes.ok) {
              const gData = await gRes.json();
              results = (gData.suggestions || []).map((s: any) => ({
                placeId: s.placePrediction.placeId,
                label: s.placePrediction.text.text
              }));
            }
          } catch (err: any) {
            if (err.name !== 'AbortError') console.warn('Google Places Autocomplete failed, falling back...', err);
            else throw err;
          }
        }

        if (!results) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/search`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, biasPosition }),
            signal: destAbortRef.current.signal
          });
          const data = await res.json();
          results = data.success ? (data.results || []) : [];
        }
        
        setDestResults(results || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setDestResults([]);
        }
      } finally {
        setIsSearchingDest(false);
      }
    }, 250);
  };

  const calculateRoute = async (origin: { lat: number, lng: number }, dest: { lat: number, lng: number }) => {
    setIsCalculating(true);
    setRouteError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/route/calculate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination: dest })
      });
      const data = await res.json();

      if (!data.success || !data.routes || data.routes.length === 0) {
        setRouteError(data.error || 'Unable to calculate route. Please try again.');
        return;
      }

      setRouteOptions(data.routes);
      setSelectedRouteId('fastest'); // default
      setCurrentStepIndex(0);
      setOffRoute(false);
      setRouteError(null);

      if (mapRef.current && !isNavigating) {
        const coords = data.routes[0].Geometry.LineString;
        const lats = coords.map((c: any) => c[1]);
        const lngs = coords.map((c: any) => c[0]);
        // Leave padding on the left for the side panel
        mapRef.current.fitBounds(
          [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
          { padding: { top: 60, bottom: 60, left: 420, right: 60 }, maxZoom: 16, duration: 1200 }
        );
      }
    } catch (err) {
      setRouteError('Unable to calculate route right now. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    let targetStart = originPoint || latestLocationRef.current;
    
    if (!originPoint && originResults.length > 0) {
      const loc = await resolveCoordinates(originResults[0]);
      if (loc) {
        targetStart = loc;
        setOriginPoint(targetStart);
        setOriginQuery(originResults[0].label.split(',')[0].trim());
        setOriginResults([]);
      }
    }

    let targetDest = destination;
    if (!targetDest && destResults.length > 0) {
      const loc = await resolveCoordinates(destResults[0]);
      if (loc) {
        targetDest = loc;
        setDestination(targetDest);
        setDestQuery(destResults[0].label.split(',')[0].trim());
        setDestResults([]);
      }
    }

    if (!targetStart || !targetDest) {
      setRouteError("Please select both origin and destination.");
      setIsCalculating(false);
      return;
    }
    
    setRouteError(null);
    setIsSearchExpanded(false); // Hide the search form on mobile so Route Planner Card takes over
    calculateRoute(targetStart, targetDest);
  };

  const triggerRecalculate = useCallback((loc: { lat: number, lng: number }) => {
    if (!isCalculating && destination) {
      calculateRoute(loc, destination);
    }
  }, [isCalculating, destination]);

  const startNavigation = () => {
    setNavPermissionError(null);
    // Enter navigation mode immediately — LiveUserMarker's watchPosition is already active
    setIsNavigating(true);
    setIsFollowingUser(true);
    if (mapRef.current && latestLocationRef.current) {
      mapRef.current.getMap().setPitch(50);
      mapRef.current.easeTo({
        center: [latestLocationRef.current.lng, latestLocationRef.current.lat],
        zoom: 18,
        duration: 800
      });
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setNavSpeedKmh(null);
    setRealTimeDistance(null);
    setNavPermissionError(null);
    if (mapRef.current) {
      mapRef.current.getMap().setPitch(0);
      mapRef.current.easeTo({ bearing: 0, zoom: 15, duration: 800 });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setOriginResults([]);
        setDestResults([]);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOriginResults([]);
        setDestResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const locateMe = useCallback(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setRouteError("Geolocation is not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          latestLocationRef.current = loc;
          setOriginPoint(loc);
          setOriginQuery("Your location");
          
          if (mapRef.current) {
            isFlyingRef.current = true;
            mapRef.current.once('moveend', () => { isFlyingRef.current = false; });
            mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 1500 });
          }
          
          if (destination) {
            calculateRoute(loc, destination);
          }
        },
        (err) => {
          if (latestLocationRef.current) {
            // Fallback to the last known good location instead of throwing an error
            const loc = latestLocationRef.current;
            setOriginPoint(loc);
            setOriginQuery("Your location");
            if (mapRef.current) {
              isFlyingRef.current = true;
              mapRef.current.once('moveend', () => { isFlyingRef.current = false; });
              mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 1500 });
            }
            if (destination) {
              calculateRoute(loc, destination);
            }
          } else {
            if (err.code === 1) setRouteError("Location permission is required to use your current location.");
            else setRouteError("Unable to access your location. Please try again.");
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    };
    setIsFollowingUser(true);
    getLocation();
  }, [destination]);

  const handleGoClick = useCallback(() => {
    // Instantly update UI so it feels responsive
    setOriginQuery("Your location");
    setDestQuery("");
    setDestResults([]);
    setDestination(null);

    // Call locateMe in background to actually fetch GPS and set originPoint
    locateMe();
    
    // Instantly focus the destination input
    setTimeout(() => {
      if (destInputRef.current) {
        destInputRef.current.focus();
      }
    }, 50);
  }, [locateMe]);

  
  const onMouseMove = useCallback((e: any) => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    
    try {
      // Check POI layer
      let isHoveringPoi = false;
      if (map.getLayer('poi-unclustered')) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['poi-unclustered'] });
        if (features.length > 0) {
          isHoveringPoi = true;
          map.getCanvas().style.cursor = 'pointer';
          const feature = features[0];
          setHoveredPoi({
            id: feature.properties.id,
            name: feature.properties.name,
            x: e.point.x,
            y: e.point.y
          });
        }
      }

      if (!isHoveringPoi) {
        setHoveredPoi(null);
        // Reset cursor only if not hovering incident
        let isHoveringIncident = false;
        if (map.getLayer('unclustered-point')) {
          const incidentFeatures = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
          isHoveringIncident = incidentFeatures.length > 0;
        }
        if (!isHoveringIncident) {
           map.getCanvas().style.cursor = '';
        }
      }
    } catch (err) {
      // Layers might not be fully loaded yet
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.getMap().getCanvas().style.cursor = '';
    }
    setHoveredPoi(null);
  }, []);
  
const onMapClick = useCallback((e: any) => {
    if (isNavigating) return;

    const routeFeature = e.features && e.features.find((f: any) => f.layer.id.startsWith('route-line-'));
    if (routeFeature) {
      const routeId = routeFeature.layer.id.replace('route-line-', '');
      setSelectedRouteId(routeId);
      return;
    }

    
    const poiFeature = e.features && e.features.find((f: any) => f.layer.id === 'poi-unclustered');
    if (poiFeature) {
      setSelectedPoi({
        id: poiFeature.properties.id,
        name: poiFeature.properties.name,
        category: poiFeature.properties.category,
        lat: poiFeature.geometry.coordinates[1],
        lon: poiFeature.geometry.coordinates[0]
      });
      return;
    }
const incidentFeature = e.features && e.features.find((f: any) => f.layer.id === 'unclustered-point');
    if (incidentFeature) {
      const props = incidentFeature.properties;
      setSelectedIncident({
        incidentId: props.incidentId,
        category: props.category,
        description: props.description,
        latitude: incidentFeature.geometry.coordinates[1],
        longitude: incidentFeature.geometry.coordinates[0],
        severity: props.severity,
        createdAt: props.createdAt,
        status: 'active'
      });
    }
  }, [isNavigating]);

  const resolveCoordinates = async (res: SearchResult): Promise<{ lat: number, lng: number } | null> => {
    if (res.point) return { lat: res.point[1], lng: res.point[0] };
    if (!res.placeId) return null;
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        const gRes = await fetch(`https://places.googleapis.com/v1/places/${res.placeId}?fields=location`, {
          headers: { 'X-Goog-Api-Key': apiKey }
        });
        if (gRes.ok) {
          const data = await gRes.json();
          if (data.location) {
            return { lat: data.location.latitude, lng: data.location.longitude };
          }
        }
      } catch (err) {
        console.error("Google Place Details failed:", err);
      }
    }
    return null;
  };

  const handleSelectOrigin = async (res: SearchResult) => {
    const loc = await resolveCoordinates(res);
    if (!loc) return;
    setOriginPoint(loc);
    const mainText = res.label.split(',')[0].trim();
    setOriginQuery(mainText);
    setOriginResults([]);
    if (mapRef.current) {
      mapRef.current.panTo([loc.lng, loc.lat], { duration: 1000 });
      mapRef.current.zoomTo(15, { duration: 1000 });
    }
  };

  const handleSelectDest = async (res: SearchResult) => {
    const loc = await resolveCoordinates(res);
    if (!loc) return;
    setDestination(loc);
    const mainText = res.label.split(',')[0].trim();
    setDestQuery(mainText);
    setDestResults([]);
    if (mapRef.current) {
      mapRef.current.panTo([loc.lng, loc.lat], { duration: 1000 });
      mapRef.current.zoomTo(15, { duration: 1000 });
    }
  };

  const handleOriginKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOriginActiveIndex(prev => (prev < originResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOriginActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && originActiveIndex >= 0) {
      e.preventDefault();
      handleSelectOrigin(originResults[originActiveIndex]);
    }
  };

  const handleDestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDestActiveIndex(prev => (prev < destResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDestActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && destActiveIndex >= 0) {
      e.preventDefault();
      handleSelectDest(destResults[destActiveIndex]);
    }
  };

  const incidentsGeoJSON = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: incidents.map(inc => {
        const config = getPinConfig(inc.category);
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [inc.longitude, inc.latitude] },
          properties: {
            incidentId: inc.incidentId,
            category: inc.category,
            severity: inc.severity || 1,
            color: config.bg,
            glyph: config.glyph,
            description: inc.description || '',
            createdAt: inc.createdAt || ''
          }
        };
      })
    };
  }, [incidents]);

  // Make sure routes are drawn so the active one is drawn last (highest z-index effectively)
  const memoizedAlternativeRoutes = useMemo(() => {
    return routeOptions.map(route => {
      const isSelected = route.id === selectedRouteId;
      return (
        <Source key={route.id} id={`route-${route.id}`} type="geojson" data={{ type: 'Feature', properties: {}, geometry: route.Geometry }}>
          <Layer
            id={`route-line-${route.id}`}
            type="line"
            source={`route-${route.id}`}
            layout={{ "line-join": "round", "line-cap": "round" }}
            paint={{ 
              "line-color": isSelected ? "#ffffff" : "#475569", 
              "line-width": isSelected ? 6 : 4, 
              "line-opacity": isSelected ? 1 : 0.4 
            }}
          />
        </Source>
      );
    });
  }, [routeOptions, selectedRouteId]);

  if (locationError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 text-center font-sans z-50 absolute inset-0">
        <div className="bg-red-500/20 text-red-500 p-6 rounded-full mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <h2 className="text-3xl font-black mb-3">Location Required</h2>
        <p className="text-slate-400 max-w-md text-lg font-medium">{locationError}</p>
        <button onClick={() => window.location.reload()} className="mt-8 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition">Retry GPS Fix</button>
      </div>
    );
  }

  if (!initialLocation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#040711] text-white p-6 text-center font-sans z-50 absolute inset-0 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[80px] rounded-full"></div>

        <div className="relative w-24 h-24 mb-8 flex justify-center items-center">
          {/* Outer Rotating Rings */}
          <div className="absolute inset-0 border-2 border-dashed border-teal-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-2 border-2 border-cyan-400/50 rounded-full border-t-transparent animate-[spin_2s_linear_infinite]"></div>
          <div className="absolute inset-4 border-2 border-white/10 rounded-full border-b-transparent animate-[spin_3s_linear_infinite_reverse]"></div>
          
          {/* Center Glowing Map Icon */}
          <div className="relative z-10 w-12 h-12 bg-teal-950/80 rounded-full flex items-center justify-center border border-teal-500/50 shadow-[0_0_20px_rgba(45,212,191,0.4)]">
            <MapIcon className="w-6 h-6 text-teal-400 animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-black mb-2 tracking-tight uppercase text-white">Acquiring Location</h2>
        <div className="flex items-center gap-2 text-teal-400/80 font-mono text-xs uppercase tracking-widest animate-pulse">
          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
          Synchronizing with satellite network
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full h-full flex flex-col font-sans bg-black"
    >
      {/* Safety Notification Toast */}
      {safetyNotification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 text-green-400 px-6 py-3 rounded-full shadow-lg text-sm font-semibold border border-green-500/50 backdrop-blur-md animate-fade-in-down">
          {safetyNotification}
        </div>
      )}

      {/* Mobile & Desktop Search Toggle Button */}
      {!isNavigating && !isSearchExpanded && (
        <div className={`absolute z-20 pointer-events-auto [.sidebar-open_&]:hidden ${
          routeOptions.length > 0 
            ? 'top-6 w-[180px] left-1/2 -translate-x-1/2' 
            : 'bottom-24 md:bottom-auto md:top-6 left-4 right-4 md:right-auto md:left-16 lg:left-20 md:w-[240px]'
        }`}>
          <button 
            onClick={() => setIsSearchExpanded(true)}
            className={`w-full bg-[#121212]/95 backdrop-blur-xl border border-white/10 text-white font-bold px-6 shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] ${routeOptions.length > 0 ? 'py-2.5 rounded-full text-sm' : 'py-4 md:py-3.5 rounded-3xl md:rounded-2xl'}`}
          >
            <Search className="w-5 h-5 text-blue-400" />
            {routeOptions.length > 0 ? 'Edit Search' : 'Find Routes'}
          </button>
        </div>
      )}

      {/* Search Bar - Premium Floating */}
      {!isNavigating && (
        <div className={`absolute bottom-24 md:top-6 md:bottom-auto left-4 md:left-16 lg:left-20 w-[calc(100%-2rem)] md:w-[400px] z-20 pointer-events-auto transition-transform duration-300 ease-in-out md:[.sidebar-open_&]:translate-x-72 [.sidebar-open_&]:opacity-0 md:[.sidebar-open_&]:opacity-100 [.sidebar-open_&]:pointer-events-none md:[.sidebar-open_&]:pointer-events-auto ${!isSearchExpanded ? 'hidden' : 'block'}`} ref={searchContainerRef}>
          <div className="bg-[#121212]/95 backdrop-blur-xl p-3 rounded-3xl shadow-2xl border border-white/10 flex flex-col gap-2">
            
            {/* Close button for the search box */}
            <div className="flex justify-end px-2 pt-1 pb-2">
              <button onClick={() => setIsSearchExpanded(false)} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm font-semibold">
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <form onSubmit={handleRouteSubmit} className="flex flex-col gap-2 relative">
              
              {/* Origin Input */}
              <div className="relative flex items-center bg-black/50 rounded-2xl border border-white/10 px-4 py-3 shadow-md focus-within:border-white/30 transition-all">
                <LocateFixed className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input
                  ref={originInputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={originResults.length > 0}
                  aria-controls="origin-listbox"
                  className="flex-1 min-w-0 bg-transparent text-white outline-none placeholder:text-gray-400 text-[15px] font-medium"
                  placeholder="From"
                  value={originQuery}
                  onChange={(e) => searchOrigin(e.target.value)}
                  onKeyDown={handleOriginKeyDown}
                  onFocus={(e) => { e.target.select(); if(originQuery && originResults.length === 0) searchOrigin(originQuery); }}
                />
                {isSearchingOrigin && <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin shrink-0 ml-2"></div>}
                {originQuery && !isSearchingOrigin && (
                  <button type="button" aria-label="Clear origin" onClick={() => { setOriginQuery(''); setOriginResults([]); setOriginPoint(null); originInputRef.current?.focus(); }} className="text-gray-400 hover:text-white transition-colors shrink-0 ml-2">
                    <X className="w-5 h-5" />
                  </button>
                )}
                {originResults.length > 0 && (
                  <ul id="origin-listbox" role="listbox" className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 max-h-72 overflow-y-auto hide-scrollbar z-50 py-2">
                    {originResults.map((res, i) => {
                      const parts = res.label.split(',');
                      const mainText = parts[0].trim();
                      const subText = parts.slice(1).join(',').trim();
                      return (
                        <li 
                          key={i} 
                          role="option"
                          aria-selected={i === originActiveIndex}
                          onClick={() => handleSelectOrigin(res)}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors ${i === originActiveIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                          <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-[15px] text-black truncate">{mainText}</span>
                            {subText && <span className="text-[13px] text-gray-500 truncate mt-0.5">{subText}</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              
              {/* Dest Input */}
              <div className="relative flex items-center bg-black/50 rounded-2xl border border-white/10 px-4 py-3 shadow-md focus-within:border-white/30 transition-all mt-2">
                <Search className="w-5 h-5 text-white mr-3 shrink-0" />
                <input
                  ref={destInputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={destResults.length > 0}
                  aria-controls="dest-listbox"
                  className="flex-1 min-w-0 bg-transparent text-white outline-none placeholder:text-gray-400 text-[15px] font-medium"
                  placeholder="Search destination"
                  value={destQuery}
                  onChange={(e) => searchDest(e.target.value)}
                  onKeyDown={handleDestKeyDown}
                  onFocus={(e) => { e.target.select(); if(destQuery && destResults.length === 0) searchDest(destQuery); }}
                />
                {isSearchingDest && <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin shrink-0 ml-2"></div>}
                {destQuery && !isSearchingDest && (
                  <button type="button" aria-label="Clear destination" onClick={() => { setDestQuery(''); setDestResults([]); setDestination(null); destInputRef.current?.focus(); }} className="text-gray-400 hover:text-white transition-colors shrink-0 ml-2">
                    <X className="w-5 h-5" />
                  </button>
                )}
                {destResults.length > 0 && (
                  <ul id="dest-listbox" role="listbox" className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 max-h-72 overflow-y-auto hide-scrollbar z-50 py-2">
                    {destResults.map((res, i) => {
                      const parts = res.label.split(',');
                      const mainText = parts[0].trim();
                      const subText = parts.slice(1).join(',').trim();
                      return (
                        <li 
                          key={i} 
                          role="option"
                          aria-selected={i === destActiveIndex}
                          onClick={() => handleSelectDest(res)}
                          className={`px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors ${i === destActiveIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                          <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-[15px] text-black truncate">{mainText}</span>
                            {subText && <span className="text-[13px] text-gray-500 truncate mt-0.5">{subText}</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Find Routes Button */}
              <button 
                type="submit" 
                disabled={isCalculating}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Route className="w-5 h-5" />
                )}
                {isCalculating ? 'Calculating...' : 'Find Routes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Route Planner Card (Bottom) */}
      {!isNavigating && routeOptions.length > 0 && (
        <div className={`absolute bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-20 pointer-events-auto flex-col items-center gap-2 ${isSearchExpanded ? 'hidden md:flex' : 'flex'}`}>
          {/* Scrollable horizontal cards */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar w-full justify-start md:justify-center px-4">
            {routeOptions.map((route) => {
              const isSelected = selectedRouteId === route.id;
              
              const getRouteIcon = (label: string) => {
                if (label === 'FASTEST') return <Zap className="w-5 h-5" />;
                if (label === 'SAFEST') return <ShieldCheck className="w-5 h-5" />;
                if (label === 'BALANCED') return <Scale className="w-5 h-5" />;
                return <Route className="w-5 h-5" />;
              };

              const durationMin = Math.round(route.DurationSeconds / 60);
              const hrs = Math.floor(durationMin / 60);
              const mins = durationMin % 60;

              return (
                <div key={route.id} onClick={() => setSelectedRouteId(route.id)} className={`snap-center shrink-0 w-[260px] cursor-pointer px-5 pt-4 pb-5 rounded-[2rem] border transition-all duration-300 ease-out flex flex-col shadow-2xl relative overflow-hidden group ${isSelected ? 'bg-white text-black border-white scale-100 ring-4 ring-white/10' : 'bg-[#121212]/95 backdrop-blur-md text-gray-400 border-white/10 hover:border-white/30 hover:bg-[#1a1a1a]/95 scale-95 hover:scale-[0.98]'}`}>

                  {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none opacity-20" />}

                  {/* Card Header */}
                  <div className="flex justify-between items-center mb-3 relative z-10">
                    <div className={`flex items-center gap-1.5 font-black tracking-widest text-[11px] uppercase ${isSelected ? 'text-black' : 'text-gray-300'}`}>
                      {getRouteIcon(route.Label)}
                      {route.Label}
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${route.SafetyScore >= 80 ? (isSelected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-green-500/10 text-green-400 border-green-500/20') : (isSelected ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-orange-500/10 text-orange-400 border-orange-500/20')}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {route.SafetyScore}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className={`w-full h-px mb-3 ${isSelected ? 'bg-black/10' : 'bg-white/10'}`} />

                  {/* Duration */}
                  <div className="flex items-end gap-2 relative z-10 mb-1">
                    {hrs > 0 && (
                      <div className="flex items-baseline gap-0.5">
                        <span className={`font-black text-4xl tracking-tighter leading-none ${isSelected ? 'text-black' : 'text-white'}`}>{hrs}</span>
                        <span className={`text-sm font-bold mr-1 ${isSelected ? 'text-black/50' : 'text-white/50'}`}>hr</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-0.5">
                      <span className={`font-black text-4xl tracking-tighter leading-none ${isSelected ? 'text-black' : 'text-white'}`}>{mins}</span>
                      <span className={`text-sm font-bold ${isSelected ? 'text-black/50' : 'text-white/50'}`}>min</span>
                    </div>
                  </div>

                  {/* Distance */}
                  <div className={`flex items-center gap-1.5 text-[13px] font-semibold relative z-10 ${isSelected ? 'text-black/55' : 'text-white/40'}`}>
                    <Navigation2 className="w-3.5 h-3.5 opacity-70 shrink-0" />
                    {route.Distance} km
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-1 w-[90%] max-w-md flex gap-2">
            <button
              onClick={() => {
                setRouteOptions([]);
                setDestination(null);
                setDestQuery('');
                setRouteError(null);
              }}
              className="flex-[1] bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-1.5 text-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={startNavigation}
              className="flex-[2.5] bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 font-bold py-3.5 rounded-2xl shadow-[0_0_15px_rgba(0,223,192,0.3)] transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
            >
              <Navigation2 className="w-4 h-4 fill-current" />
              Start Navigation
            </button>
          </div>
        </div>
      )}

      {/* Floating Map Controls - Now always visible */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 pointer-events-auto flex flex-col gap-2 items-end">
          
          {/* Hide/Show Controls Toggle */}
          <div className="relative group flex items-center">
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-black text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg tracking-wide z-50">
              {showControls ? 'Hide map controls' : 'Show map controls'}
            </span>
            <button 
              onClick={() => setShowControls(!showControls)} 
              aria-label={showControls ? 'Hide map controls' : 'Show map controls'} 
              className="w-[44px] h-[44px] bg-white text-black rounded-xl shadow-md border border-gray-200 hover:bg-gray-50 transition-colors flex justify-center items-center"
            >
              {showControls ? <PanelRightClose className="w-5 h-5"/> : <PanelRightOpen className="w-5 h-5"/>}
            </button>
          </div>

          {/* Expandable Secondary Controls */}
          {showControls && (
            <div className="flex flex-col gap-1 bg-white rounded-[14px] p-1 shadow-lg border border-gray-200 transform transition-all origin-right">
              <div className="relative group flex items-center justify-end">
                <span className="absolute right-full mr-4 px-3 py-1.5 bg-black text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg tracking-wide z-50">Zoom in</span>
                <button onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in" className="w-[36px] h-[36px] bg-white text-black rounded-lg hover:bg-gray-100 transition-colors flex justify-center items-center"><Plus className="w-5 h-5"/></button>
              </div>
              <div className="w-8 h-[1px] bg-gray-100 mx-auto"></div>
              <div className="relative group flex items-center justify-end">
                <span className="absolute right-full mr-4 px-3 py-1.5 bg-black text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg tracking-wide z-50">Zoom out</span>
                <button onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out" className="w-[36px] h-[36px] bg-white text-black rounded-lg hover:bg-gray-100 transition-colors flex justify-center items-center"><Minus className="w-5 h-5"/></button>
              </div>
              <div className="w-8 h-[1px] bg-gray-100 mx-auto"></div>
              <div className="relative group flex items-center justify-end">
                <span className="absolute right-full mr-4 px-3 py-1.5 bg-black text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg tracking-wide z-50">Current location</span>
                <button onClick={locateMe} aria-label="Current location" className="w-[36px] h-[36px] bg-white text-black rounded-lg hover:bg-gray-100 transition-colors flex justify-center items-center"><LocateFixed className="w-5 h-5"/></button>
              </div>
              <div className="w-8 h-[1px] bg-gray-100 mx-auto"></div>
              <div className="relative group flex items-center justify-end">
                <span className="absolute right-full mr-4 px-3 py-1.5 bg-black text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg tracking-wide z-50">Toggle POIs</span>
                <button onClick={() => setShowPOIs(!showPOIs)} aria-label="Toggle POIs" className={`w-[36px] h-[36px] rounded-lg transition-colors flex justify-center items-center ${showPOIs ? 'bg-black text-white shadow-inner' : 'bg-white text-black hover:bg-gray-50'}`}>
                  {isFetchingPOIs ? <div className="w-4 h-4 border-2 border-gray-300 border-t-current rounded-full animate-spin"></div> : <MapPin className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          {/* Dedicated GO Button */}
          {!isNavigating && (
            <div className="relative group flex items-center mt-1">
              <span className="absolute right-full mr-3 px-3 py-1.5 bg-black text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg tracking-wide z-50">Find route from your location</span>
              <button 
                onClick={handleGoClick} 
                aria-label="Go from current location" 
                className="w-[48px] h-[48px] bg-black text-white rounded-2xl shadow-xl hover:scale-[1.05] hover:bg-gray-900 transition-all flex justify-center items-center font-black tracking-widest text-sm"
              >
                GO
              </button>
            </div>
          )}
        </div>

      {/* Navigation Header — fixed top center */}
      {isNavigating && activeRoute && (
        <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-lg z-20 pointer-events-auto flex flex-col gap-3">
          <div className="w-[420px] max-w-full mx-auto bg-[#121212] border border-white/15 backdrop-blur-xl px-4 py-3 rounded-3xl shadow-2xl flex items-center gap-3">
            <div className="bg-white text-black w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Route className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-white leading-snug truncate">
                {activeRoute.Steps[currentStepIndex]?.Instruction || 'Proceed to destination'}
              </div>
              <div className="text-gray-400 mt-0.5 font-medium text-xs">
                In {realTimeDistance != null ? Math.round(realTimeDistance) : (activeRoute.Steps[currentStepIndex] ? Math.round(activeRoute.Steps[currentStepIndex].Distance * 1000) : '0')} m
              </div>
            </div>
            <button
              onClick={stopNavigation}
              aria-label="Cancel navigation"
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1 shrink-0 shadow-lg text-xs"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>

          {liveSafetyAlert && (
            <div className="mt-2 bg-red-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-red-400">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠</span>
                <div>
                  <div className="font-bold text-sm">Safety Alert</div>
                  <div className="text-xs opacity-90">Higher risk reported nearby</div>
                </div>
              </div>
              <div className="bg-black/30 px-2 py-1 rounded-lg font-bold text-sm">
                {liveSafetyAlert.old} → {liveSafetyAlert.new}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Bottom Bar — duration, distance, safety score + speedometer */}
      {isNavigating && activeRoute && (
        <div className="absolute bottom-12 md:bottom-8 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-md z-20 pointer-events-auto">
          <div className="bg-[#121212] border border-white/15 backdrop-blur-xl px-5 py-4 rounded-3xl shadow-2xl flex items-center gap-4">
            {/* Time + distance */}
            <div className="flex-1">
              <div className="text-3xl font-black text-white leading-none">{Math.round(activeRoute.DurationSeconds / 60)} min</div>
              <div className="text-gray-400 font-medium text-sm mt-0.5">{activeRoute.Distance} km</div>
            </div>
            {/* Speedometer */}
            <div className="flex flex-col items-center px-4 border-x border-white/10">
              <Gauge className="w-3.5 h-3.5 text-gray-500 mb-0.5" />
              <div className="text-2xl font-black text-white leading-none">
                {navSpeedKmh != null ? Math.round(navSpeedKmh) : '--'}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">km/h</div>
            </div>
            {/* Safety score */}
            <div className="text-right">
              <div className={`text-2xl font-black ${activeRoute.SafetyScore > 80 ? 'text-green-500' : 'text-orange-500'}`}>
                {activeRoute.SafetyScore}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Safety Score</div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Permission Error */}
      {navPermissionError && !isNavigating && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-20 pointer-events-auto">
          <div className="bg-[#1a1a1a] border border-red-500/40 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3">
            <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm text-red-400 mb-0.5">Location Required</div>
              <div className="text-gray-300 text-xs leading-relaxed">{navPermissionError}</div>
            </div>
            <button onClick={() => setNavPermissionError(null)} className="text-gray-500 hover:text-white shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Map
        onLoad={(e) => {
          loadPOIIcons(e.target);
          setMapLoaded(true);
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        ref={mapRef}
        initialViewState={{ longitude: initialLocation.lng, latitude: initialLocation.lat, zoom: 15 }}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        renderWorldCopies={false}
        attributionControl={false}
        reuseMaps={true}
        onDragStart={() => setIsFollowingUser(false)}
        onClick={onMapClick}
        interactiveLayerIds={interactiveLayerIds}
      >
        {/* Map Layers (Alternative Routes & Active Route) */}
        {memoizedAlternativeRoutes}

        {/* Native POI Layers */}
        {showPOIs && poiGeoJson.features.length > 0 && (
          <Source id="pois-source" type="geojson" data={poiGeoJson} cluster={false}>
            {/* Unclustered individual POI icons */}
            <Layer 
              id="poi-unclustered" 
              type="symbol" 
              layout={{
                'icon-image': ['get', 'icon'],
                'icon-size': 1.0,
                'icon-allow-overlap': true,
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Bold'],
                'text-size': 11,
                'text-offset': [0, 1.5],
                'text-anchor': 'top',
                'text-optional': true,
              }}
              paint={{
                'text-color': '#ffffff',
                'text-halo-color': '#000000',
                'text-halo-width': 1.5
              }}
            />
          </Source>
        )}

        {/* Origin Location Marker */}
        {originPoint && (
          <Marker longitude={originPoint.lng} latitude={originPoint.lat} anchor="center">
            <div className="w-4 h-4 bg-white rounded-full border-4 border-black shadow-md"></div>
          </Marker>
        )}

        <LiveUserMarker 
          mapRef={mapRef}
          isNavigating={isNavigating}
          isFollowingUser={isFollowingUser}
          activeRoute={activeRoute}
          currentStepIndex={currentStepIndex}
          setOffRoute={setOffRoute}
          setCurrentStepIndex={setCurrentStepIndex}
          onLocationUpdate={(loc: any) => { latestLocationRef.current = loc; }}
          onSpeedUpdate={(kmh: number | null) => setNavSpeedKmh(kmh)}
          onDistanceUpdate={(dist: number) => setRealTimeDistance(dist)}
          triggerRecalculate={triggerRecalculate}
          isFlyingRef={isFlyingRef}
          initialLocation={initialLocation}
        />

        {/* Destination Location */}
        {destination && (
          <Marker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
            <div className="w-6 h-6 bg-white rounded-full border-4 border-black shadow-xl flex items-center justify-center"><div className="w-2 h-2 bg-black rounded-full"></div></div>
          </Marker>
        )}

        {/* Incidents Clusters */}
        <Source
          id="incidents-source"
          type="geojson"
          data={incidentsGeoJSON as any}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': ['step', ['get', 'point_count'], '#ef4444', 10, '#f97316', 50, '#e11d48'],
              'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 28],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#000'
            }}
          />
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Bold'],
              'text-size': 12
            }}
            paint={{ 'text-color': '#ffffff' }}
          />
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': ['get', 'color'],
              'circle-radius': 14,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#000'
            }}
          />
          <Layer
            id="unclustered-point-label"
            type="symbol"
            filter={['!', ['has', 'point_count']]}
            layout={{
              'text-field': ['get', 'glyph'],
              'text-size': 14,
              'text-allow-overlap': true
            }}
          />
        </Source>

        {selectedIncident && (
          <Popup
            longitude={selectedIncident.longitude}
            latitude={selectedIncident.latitude}
            anchor="bottom"
            onClose={() => setSelectedIncident(null)}
            closeOnClick={false}
            className="rounded-2xl overflow-hidden"
          >
            <div className="p-3 min-w-[200px] bg-[#121212] text-white">
              <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                <span className="text-xl">{getPinConfig(selectedIncident.category).glyph}</span>
                <strong className="text-sm font-bold">{selectedIncident.category}</strong>
              </div>
              <div className="text-xs font-semibold mb-1 text-gray-400">
                Severity: {selectedIncident.severity ? `${selectedIncident.severity}/5` : 'Unknown'}
              </div>
              {selectedIncident.description && (
                <div className="text-xs text-gray-300 mb-2">"{selectedIncident.description}"</div>
              )}
              <div className="text-[10px] font-mono text-gray-500 mt-2">Reported {timeAgo(selectedIncident.createdAt)}</div>
            </div>
          </Popup>
        )}
        
        {selectedPoi && (
          <Popup
            longitude={selectedPoi.lon}
            latitude={selectedPoi.lat}
            anchor="bottom"
            onClose={() => setSelectedPoi(null)}
            closeOnClick={false}
            className="rounded-2xl overflow-hidden z-50"
          >
            <div className="p-4 min-w-[220px] bg-[#121212] text-white">
              <div className="flex flex-col gap-1 mb-2 border-b border-white/10 pb-3">
                <strong className="text-lg font-bold leading-tight">{selectedPoi.name}</strong>
                <span className="text-xs text-gray-400 capitalize tracking-wide font-medium">{selectedPoi.category.replace('_', ' ')}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => {
                    setDestQuery(selectedPoi.name);
                    setDestination({ lat: selectedPoi.lat, lng: selectedPoi.lon });
                    setSelectedPoi(null);
                  }} 
                  className="flex-1 bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 font-bold py-2 rounded-xl text-sm shadow-[0_0_15px_rgba(0,223,192,0.3)] transition-colors"
                >
                  Directions
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      {hoveredPoi && (
        <div 
          className="absolute pointer-events-none z-50 bg-black text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg whitespace-nowrap transition-opacity duration-150 border border-white/20"
          style={{ left: hoveredPoi.x, top: hoveredPoi.y - 45, transform: 'translateX(-50%)' }}
        >
          {hoveredPoi.name}
        </div>
      )}

    </div>
  );
}
