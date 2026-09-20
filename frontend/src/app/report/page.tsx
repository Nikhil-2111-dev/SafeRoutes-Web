'use client';

import { useState, useId, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

type IncidentType = 'incident' | 'danger' | 'warning';

interface IncidentOption {
  id: IncidentType;
  title: string;
  activeBorder: string;
  activeBg: string;
  activeRing: string;
  accentText: string;
  activeShadow: string;
  icon: React.ReactNode;
}

const INCIDENT_OPTIONS: IncidentOption[] = [
  {
    id: 'incident',
    title: 'General Incident',
    activeBorder: 'border-[#00dfc0]',
    activeBg: 'bg-gradient-to-b from-teal-950/60 to-[#021a1c]/70',
    activeRing: 'ring-[#00dfc0]/50',
    accentText: 'text-[#00dfc0]',
    activeShadow: 'shadow-[0_0_20px_rgba(0,223,192,0.25),inset_0_0_12px_rgba(0,223,192,0.1)]',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'danger',
    title: 'Danger Zone',
    activeBorder: 'border-rose-500',
    activeBg: 'bg-gradient-to-b from-rose-950/60 to-[#1e050b]/70',
    activeRing: 'ring-rose-500/50',
    accentText: 'text-rose-400',
    activeShadow: 'shadow-[0_0_20px_rgba(244,63,94,0.25),inset_0_0_12px_rgba(244,63,94,0.1)]',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    id: 'warning',
    title: 'Hazard / Warning',
    activeBorder: 'border-amber-400',
    activeBg: 'bg-gradient-to-b from-amber-950/60 to-[#1c1203]/70',
    activeRing: 'ring-amber-400/50',
    accentText: 'text-amber-400',
    activeShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.25),inset_0_0_12px_rgba(245,158,11,0.1)]',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function ReportPage() {
  const [type, setType] = useState<string>('incident');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smart Scan (AI) image capture state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Map and Geolocation state
  const mapRef = useRef<MapRef>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'detected' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showManualCoords, setShowManualCoords] = useState(false);

  // Submission feedback
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getAuthToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (e) {
      console.warn("Could not get auth session for request");
      return null;
    }
  };

  const latInputId = useId();
  const lngInputId = useId();
  const descInputId = useId();
  const tagInputId = useId();

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
      setImageFile(file);

      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const token = await getAuthToken();
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/pins/analyze-image`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ 
              imageBase64: base64data,
              mimeType: file.type 
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.tags) {
              setTags(prev => {
                const newTags = [...prev];
                data.tags.forEach((tag: string) => {
                  const clean = tag.toLowerCase().replace(/^#+/, '');
                  if (!newTags.includes(clean)) newTags.push(clean);
                });
                return newTags.slice(0, 8);
              });
            }
          }
        } catch (err) {
          console.error("AI Analysis failed", err);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#+/, '').toLowerCase();
    if (!cleanTag) return;
    if (tags.some((t) => t.toLowerCase() === cleanTag)) {
      setTagInput('');
      return;
    }
    if (tags.length >= 8) return;
    setTags([...tags, cleanTag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleLocationDetect = () => {
    setLocationError(null);
    setSubmitError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      setShowManualCoords(true);
      return;
    }

    setLocationStatus('detecting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        setLocationStatus('detected');
        setLocationError(null);
        mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 1000 });
      },
      (err) => {
        setLocationStatus('error');
        let message = 'Unable to detect your location.';
        if (err.code === 1) {
          message = 'Location permission was denied. Please allow permissions or enter coordinates manually.';
        } else if (err.code === 2) {
          message = 'Location position unavailable. Please enter coordinates manually.';
        } else if (err.code === 3) {
          message = 'Location request timed out. Please try again or enter coordinates manually.';
        }
        setLocationError(message);
        setShowManualCoords(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const handleMapClick = useCallback((e: { lngLat: { lng: number; lat: number } }) => {
    const { lng, lat } = e.lngLat;
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setLocationStatus('detected');
    setLocationError(null);
    setSubmitError(null);
  }, []);

  const handleMarkerDragEnd = useCallback((e: { lngLat: { lng: number; lat: number } }) => {
    const { lng, lat } = e.lngLat;
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setLocationStatus('detected');
    setLocationError(null);
    setSubmitError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setSubmitError('Please capture your location or enter valid numeric coordinates before submitting.');
      setShowManualCoords(true);
      return;
    }

    if (!description.trim()) {
      setSubmitError('Please describe what happened so others know what to expect.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/v1/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id', // Would come from Auth in production
          type,
          description,
          latitude: latNum,
          longitude: lngNum,
        }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const errorText = await res.text().catch(() => '');
        setSubmitError(`Failed to submit report (${res.status}${errorText ? `: ${errorText}` : ''}). Please try again.`);
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Error submitting report. Please verify that the backend service is reachable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);
  const formattedLat = !isNaN(parsedLat) ? parsedLat.toFixed(4) : latitude;
  const formattedLng = !isNaN(parsedLng) ? parsedLng.toFixed(4) : longitude;

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#020713] text-slate-100 relative overflow-x-hidden py-5 sm:py-8 lg:py-12 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-start sm:justify-center font-sans">
      {/* Inline styles for subtle cinematic animations */}
      <style>{`
        @keyframes routeAtmospherePulse {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        @keyframes waypointRadarPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes photonTracerFlow {
          from { stroke-dashoffset: 900; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes reticleSweepSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbitDot {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .anim-route-glow {
          animation: routeAtmospherePulse 4s ease-in-out infinite;
        }
        .anim-waypoint-pulse {
          animation: waypointRadarPulse 3.5s ease-in-out infinite;
        }
        .anim-tracer-photon {
          animation: photonTracerFlow 13s linear infinite;
        }
        .anim-radar-sweep-spin {
          animation: reticleSweepSpin 3.5s linear infinite;
        }
        .anim-orbit-dot {
          animation: orbitDot 8s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-route-glow, .anim-waypoint-pulse, .anim-tracer-photon, .anim-radar-sweep-spin, .anim-orbit-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* DENSE NOCTURNAL CITY MAP BACKGROUND (Inline SVG & Telemetry Overlays)    */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {/* Vignette Depth Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,7,19,0.92)_100%)]" />

        {/* Ambient atmospheric teal and cyan glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[600px] bg-[#00dfc0]/[0.03] sm:bg-[#00dfc0]/[0.045] rounded-full blur-[80px] sm:blur-[150px]" />
        <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-cyan-600/[0.025] sm:bg-cyan-600/[0.04] rounded-full blur-[70px] sm:blur-[140px]" />

        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 900"
        >
          <defs>
            {/* Wide atmospheric blur for active SafeRoute */}
            <filter id="denseRouteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Marker glow filter */}
            <filter id="denseMarkerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Radar card internal grid pattern */}
            <pattern id="radarCardGrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#00dfc0" strokeWidth="0.5" strokeOpacity="0.12" />
            </pattern>
          </defs>

          {/* LAYER 1: RIVERDALE WATERWAY (Deep blue curved river on western edge) */}
          <path
            d="M 140 -50 C 200 180, 260 380, 180 560 C 110 700, 40 790, -40 860 L -120 860 L -120 -50 Z"
            fill="#03162b"
            opacity="0.65"
          />
          <path
            d="M 140 -50 C 200 180, 260 380, 180 560 C 110 700, 40 790, -40 860"
            stroke="#0a2a4e"
            strokeWidth="3"
            fill="none"
            opacity="0.7"
          />

          {/* LAYER 2: DENSE CITY BUILDING SILHOUETTES & PARCELS */}
          <g fill="#061224" fillOpacity="0.45" stroke="#0b1d36" strokeWidth="0.8">
            {/* Northwest District */}
            <rect x="20" y="40" width="80" height="70" rx="3" />
            <rect x="180" y="30" width="100" height="60" rx="3" />
            <rect x="220" y="110" width="120" height="80" rx="3" />
            <rect x="360" y="80" width="90" height="90" rx="3" />
            <rect x="470" y="70" width="110" height="70" rx="3" />
            <rect x="600" y="50" width="130" height="80" rx="3" />

            {/* Northeast District */}
            <rect x="760" y="40" width="100" height="70" rx="3" />
            <rect x="880" y="50" width="120" height="90" rx="3" />
            <rect x="1020" y="60" width="90" height="80" rx="3" />
            <rect x="1130" y="40" width="140" height="90" rx="3" />
            <rect x="1290" y="50" width="120" height="80" rx="3" />

            {/* Central-West Flank */}
            <rect x="40" y="360" width="90" height="110" rx="3" />
            <rect x="190" y="360" width="100" height="90" rx="3" />
            <rect x="50" y="620" width="110" height="100" rx="3" />
            <rect x="230" y="680" width="120" height="90" rx="3" />

            {/* Central-East Flank */}
            <rect x="1180" y="330" width="110" height="80" rx="3" />
            <rect x="1310" y="320" width="90" height="100" rx="3" />
            <rect x="1170" y="540" width="100" height="90" rx="3" />
            <rect x="1290" y="560" width="110" height="80" rx="3" />

            {/* Southern Perimeter */}
            <rect x="390" y="740" width="120" height="90" rx="3" />
            <rect x="530" y="760" width="100" height="80" rx="3" />
            <rect x="650" y="750" width="140" height="80" rx="3" />
            <rect x="810" y="740" width="110" height="90" rx="3" />
            <rect x="940" y="760" width="120" height="80" rx="3" />
          </g>

          {/* LAYER 3: SECONDARY LOCAL ROAD NETWORK (Subtle low-opacity dark lines) */}
          <g stroke="#0e2340" strokeWidth="1.2" strokeOpacity="0.75" fill="none">
            <line x1="0" y1="90" x2="1440" y2="90" />
            <line x1="0" y1="210" x2="1440" y2="210" />
            <line x1="0" y1="330" x2="1440" y2="330" />
            <line x1="0" y1="450" x2="1440" y2="450" />
            <line x1="0" y1="580" x2="1440" y2="580" />
            <line x1="0" y1="700" x2="1440" y2="700" />
            <line x1="0" y1="820" x2="1440" y2="820" />

            <line x1="120" y1="0" x2="120" y2="900" />
            <line x1="260" y1="0" x2="260" y2="900" />
            <line x1="420" y1="0" x2="420" y2="900" />
            <line x1="560" y1="0" x2="560" y2="900" />
            <line x1="720" y1="0" x2="720" y2="900" />
            <line x1="860" y1="0" x2="860" y2="900" />
            <line x1="1000" y1="0" x2="1000" y2="900" />
            <line x1="1140" y1="0" x2="1140" y2="900" />
            <line x1="1280" y1="0" x2="1280" y2="900" />
          </g>

          {/* LAYER 4: MAJOR THOROUGHFARES & ARTERIAL HIGHWAYS */}
          <g stroke="#163864" strokeWidth="2.8" fill="none" opacity="0.85">
            <path d="M -20 180 Q 320 220 620 190 T 1220 230 L 1460 210" />
            <path d="M -20 520 C 300 480, 520 620, 840 540 S 1240 500, 1460 560" />
            <path d="M 310 -20 Q 350 320 300 580 T 360 920" />
            <path d="M 1120 -20 Q 1080 340 1140 600 T 1100 920" />
            <path d="M -20 780 L 1460 760" stroke="#102b4e" strokeWidth="2" />
          </g>

          {/* LAYER 5: ACTIVE PRIMARY SAFEROUTE CORRIDOR (Glowing Teal Arterial) */}
          <g>
            <path
              d="M 60 780 C 220 740, 290 610, 380 440 S 680 340, 820 280 S 1120 260, 1380 220"
              stroke="#00dfc0"
              strokeWidth="10"
              fill="none"
              opacity="0.12"
              filter="url(#denseRouteGlow)"
            />
            <path
              d="M 60 780 C 220 740, 290 610, 380 440 S 680 340, 820 280 S 1120 260, 1380 220"
              stroke="#00dfc0"
              strokeWidth="4"
              fill="none"
              opacity="0.55"
              className="anim-route-glow"
            />
            <path
              d="M 60 780 C 220 740, 290 610, 380 440 S 680 340, 820 280 S 1120 260, 1380 220"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeDasharray="14 180"
              fill="none"
              opacity="0.9"
              className="anim-tracer-photon"
            />
          </g>

          {/* LAYER 6: SECONDARY CORRIDORS (Amber & Rose incident telemetry lines) */}
          <g>
            <path
              d="M 380 440 Q 520 620, 780 660 T 1270 480"
              stroke="#f59e0b"
              strokeWidth="2.2"
              strokeDasharray="6 8"
              fill="none"
              opacity="0.45"
            />
            <path
              d="M 600 80 Q 760 160, 820 280 T 960 520"
              stroke="#06b6d4"
              strokeWidth="1.8"
              strokeDasharray="4 6"
              fill="none"
              opacity="0.4"
            />
          </g>

          {/* LAYER 7: RADAR & TELEMETRY WAYPOINT NODES */}
          {/* 1. WEST WAYPOINT RADAR */}
          <g transform="translate(180, 680)" className="anim-waypoint-pulse">
            <circle cx="0" cy="0" r="28" stroke="#00dfc0" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.3" fill="none" />
            <circle cx="0" cy="0" r="16" stroke="#00dfc0" strokeWidth="1" opacity="0.4" fill="none" />
            <circle cx="0" cy="0" r="6" fill="#00dfc0" opacity="0.8" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
          </g>

          {/* 2. DANGER ZONE PIN (Rose Red) */}
          <g transform="translate(1040, 410)" filter="url(#denseMarkerGlow)">
            <line x1="0" y1="0" x2="0" y2="18" stroke="#f43f5e" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="14" stroke="#f43f5e" strokeWidth="1.2" opacity="0.4" fill="none" />
            <circle cx="0" cy="0" r="5" fill="#f43f5e" />
          </g>

          {/* 3. HAZARD ZONE PIN (Amber) */}
          <g transform="translate(1270, 480)" filter="url(#denseMarkerGlow)">
            <line x1="0" y1="0" x2="0" y2="16" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="12" stroke="#f59e0b" strokeWidth="1.2" opacity="0.4" fill="none" />
            <circle cx="0" cy="0" r="5" fill="#f59e0b" />
          </g>

          {/* 4. UPPER-RIGHT TEAL SAFETY NODE (With stem) */}
          <g transform="translate(1380, 220)">
            <circle cx="0" cy="0" r="10" stroke="#00dfc0" strokeWidth="1.2" opacity="0.4" fill="none" />
            <circle cx="0" cy="0" r="4.5" fill="#00dfc0" />
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* CENTRAL SCENE / REPORTING WORKSPACE (Responsive Mobile-First & Desktop)   */}
      {/* ========================================================================= */}
      <div className="w-full max-w-3xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* COMPACT TOP INTRO */}
        <header className="text-center space-y-1 max-w-md mx-auto px-2">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00dfc0] shadow-[0_0_6px_#00dfc0]" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-[#00dfc0] font-bold uppercase">
              COMMUNITY SAFETY
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight">
            Report an <span className="text-[#00dfc0] drop-shadow-[0_0_20px_rgba(0,223,192,0.4)]">Incident</span>
          </h1>

          {/* Supporting line */}
          <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
            Help keep nearby routes safer.
          </p>
        </header>

        {/* RESPONSIVE HORIZONTAL WORKFLOW MILESTONE INDICATOR */}
        <div
          role="navigation"
          aria-label="Reporting progress"
          className="flex items-center justify-center gap-1.5 sm:gap-4 my-2.5 sm:my-4 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider sm:tracking-[0.15em] select-none w-full max-w-xs sm:max-w-none"
        >
          {/* Step 1 indicator with glowing pill */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-teal-500/15 border border-[#00dfc0]/50 text-[#00dfc0] font-semibold shadow-[0_0_12px_rgba(0,223,192,0.25)] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00dfc0] shadow-[0_0_5px_#00dfc0]" />
            <span>01 TYPE</span>
          </div>

          <div className="flex-1 max-w-[16px] sm:max-w-[56px] h-[1px] bg-gradient-to-r from-[#00dfc0]/70 to-[#00dfc0]/20 shrink" />

          {/* Step 2 indicator */}
          <div className={`flex items-center gap-1 sm:gap-1.5 font-semibold transition-colors shrink-0 ${latitude && longitude ? 'text-[#00dfc0]' : 'text-slate-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${latitude && longitude ? 'bg-[#00dfc0] shadow-[0_0_6px_#00dfc0]' : 'bg-slate-600'}`} />
            <span>02 LOCATION</span>
          </div>

          <div className="flex-1 max-w-[16px] sm:max-w-[56px] h-[1px] bg-gradient-to-r from-[#00dfc0]/20 to-slate-700 shrink" />

          {/* Step 3 indicator */}
          <div className={`flex items-center gap-1 sm:gap-1.5 font-semibold transition-colors shrink-0 ${description.trim() ? 'text-[#00dfc0]' : 'text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full transition-colors ${description.trim() ? 'bg-[#00dfc0] shadow-[0_0_6px_#00dfc0]' : 'bg-slate-700'}`} />
            <span>03 DETAILS</span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* MAIN REPORTING WORKSPACE: Edge-to-Edge Glass on Mobile, Card on Desktop */}
        {/* ======================================================================= */}
        <div className="w-full bg-[#030915]/90 backdrop-blur-2xl border border-[#00dfc0]/40 sm:border-[#00dfc0]/50 rounded-2xl p-4 sm:p-7 shadow-[0_0_25px_rgba(0,223,192,0.18),0_20px_60px_rgba(0,0,0,0.9)] sm:shadow-[0_0_35px_rgba(0,223,192,0.22),0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* SMART SCAN (AI) - COMPACT PHOTO CAPTURE WORKSPACE */}
            <div className="space-y-1.5">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
                aria-label="Upload or take incident photo"
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative cursor-pointer p-3 sm:p-3.5 rounded-xl border border-dashed border-teal-500/40 bg-teal-950/20 hover:bg-teal-950/35 hover:border-teal-400/70 transition flex items-center justify-between gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#00dfc0] group-hover:scale-105 transition-transform shrink-0 shadow-[0_0_10px_rgba(0,223,192,0.2)]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-wide">SMART SCAN</span>
                        <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-[#00dfc0] border border-teal-500/40">AI ASSISTED</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-400 font-light mt-0.5 truncate">
                        Take a photo and let AI identify the incident details
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-xs font-semibold transition"
                  >
                    Select Photo
                  </button>
                </div>
              ) : (
                <div className="relative p-3 rounded-xl bg-[#020713]/90 border border-teal-500/30 overflow-hidden space-y-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00dfc0] shadow-[0_0_6px_#00dfc0]" />
                      <span className="text-xs font-bold text-teal-300 font-mono tracking-wider uppercase">Photo Attached</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-teal-300 hover:text-white underline font-mono transition cursor-pointer"
                      >
                        Replace photo
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs text-rose-400 hover:text-rose-300 underline font-mono transition cursor-pointer"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                  <div className="relative max-h-36 sm:max-h-44 w-full rounded-lg overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage}
                      alt="Incident preview"
                      className="w-full h-36 sm:h-44 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 1. INCIDENT TYPE SELECTION: Compact Touch Rows on Mobile, 3 Cards on Desktop */}
            <div className="space-y-2 sm:space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                  1. What type of incident?
                </span>
                <span className="text-xs font-mono text-slate-400">Select one</span>
              </div>

              {/* Responsive Selector Grid: 1 Col on Mobile, 3 Cols on Desktop */}
              <div
                role="radiogroup"
                aria-label="Incident Type"
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3"
              >
                {INCIDENT_OPTIONS.map((opt) => {
                  const isSelected = type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => setType(opt.id)}
                      className={`w-full min-h-[48px] sm:min-h-[105px] px-3.5 py-2.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-row sm:flex-col items-center justify-between gap-3 sm:gap-2.5 relative group active:scale-[0.98] ${
                        isSelected
                          ? `${opt.activeBg} ${opt.activeBorder} ${opt.activeRing} ring-1 ${opt.activeShadow} scale-[1.005] sm:scale-[1.01]`
                          : 'bg-[#071022]/70 border-white/10 hover:border-white/20 hover:bg-[#0c1833] hover:-translate-y-0.5 hover:shadow-lg'
                      }`}
                    >
                      {/* Left on mobile / Bottom-centered on desktop */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2.5 flex-1 min-w-0 sm:w-full sm:order-2">
                        {/* Prominent Crisp Icon */}
                        <div className={`shrink-0 transition-transform duration-200 ${isSelected ? `${opt.accentText} scale-105 drop-shadow-[0_0_8px_currentColor]` : 'text-slate-300 group-hover:text-white'}`}>
                          {opt.icon}
                        </div>

                        {/* Title */}
                        <div className="text-xs sm:text-sm font-bold text-white leading-tight truncate sm:whitespace-normal text-left sm:text-center">
                          {opt.title}
                        </div>
                      </div>

                      {/* Radio Indicator Dot: Right on mobile, Top-Right on desktop */}
                      <div className="flex sm:w-full sm:justify-end shrink-0 sm:order-1">
                        <div
                          className={`w-4 h-4 sm:w-3.5 sm:h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? opt.activeBorder : 'border-slate-600 group-hover:border-slate-500'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full bg-current shadow-[0_0_4px_currentColor]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. LOCATION SECTION WITH INTERACTIVE DARK MAP */}
            <div className="space-y-2 sm:space-y-2.5 pt-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#00dfc0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                    2. Location
                  </span>
                </div>

                {/* Edit coordinates toggle */}
                <button
                  type="button"
                  onClick={() => setShowManualCoords(!showManualCoords)}
                  className="text-xs font-mono text-[#00dfc0] hover:text-[#00c9ad] transition underline cursor-pointer py-1 px-1 touch-manipulation"
                >
                  {showManualCoords ? 'Hide coordinates' : 'Edit coordinates'}
                </button>
              </div>

              <p className="text-xs text-slate-400 font-light -mt-1">
                Tap map to place a pin, drag the marker, or use your GPS location.
              </p>

              {/* Interactive Location Selection Dark Map */}
              <div className="relative w-full h-[200px] sm:h-[240px] rounded-xl overflow-hidden border border-teal-500/30 shadow-[0_0_20px_rgba(0,0,0,0.6)] bg-[#0a0f1d]">
                <Map
                  ref={mapRef}
                  initialViewState={{
                    longitude: parsedLng && !isNaN(parsedLng) ? parsedLng : 75.8267,
                    latitude: parsedLat && !isNaN(parsedLat) ? parsedLat : 26.9239,
                    zoom: parsedLat && parsedLng && !isNaN(parsedLat) && !isNaN(parsedLng) ? 14 : 12,
                  }}
                  mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                  style={{ width: '100%', height: '100%' }}
                  onClick={handleMapClick}
                  cursor="crosshair"
                >
                  <NavigationControl position="bottom-right" showCompass={false} />

                  {/* Draggable Teal Pin Marker */}
                  {!isNaN(parsedLat) && !isNaN(parsedLng) && (
                    <Marker
                      longitude={parsedLng}
                      latitude={parsedLat}
                      draggable
                      onDragEnd={handleMarkerDragEnd}
                      anchor="bottom"
                    >
                      <div className="relative flex flex-col items-center cursor-grab active:cursor-grabbing group">
                        {/* Animated radar ring around pin */}
                        <div className="absolute -inset-1 rounded-full bg-[#00dfc0]/35 animate-ping pointer-events-none" />
                        {/* Glowing pin head */}
                        <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#00dfc0] border-2 border-white shadow-[0_0_15px_#00dfc0] flex items-center justify-center transition-transform group-hover:scale-110">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        </div>
                        {/* Pin pointer tip */}
                        <div className="w-2 h-2 bg-[#00dfc0] rotate-45 -mt-1 border-r border-b border-teal-700" />
                      </div>
                    </Marker>
                  )}
                </Map>

                {/* Map Overlay Top Bar: Status Readout & GPS Trigger */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                  {/* Left: Coordinate readout badge */}
                  <div className="pointer-events-auto px-2.5 py-1.5 rounded-lg bg-[#020713]/85 backdrop-blur-md border border-teal-500/35 text-xs font-mono shadow-md flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${!isNaN(parsedLat) && !isNaN(parsedLng) ? 'bg-[#00dfc0] shadow-[0_0_6px_#00dfc0]' : 'bg-slate-500'}`} />
                    {!isNaN(parsedLat) && !isNaN(parsedLng) ? (
                      <span className="text-teal-300 font-semibold truncate max-w-[150px] sm:max-w-none">
                        {formattedLat}, {formattedLng}
                      </span>
                    ) : (
                      <span className="text-slate-400">Click map to set pin</span>
                    )}
                  </div>

                  {/* Right: Geolocation button */}
                  <button
                    type="button"
                    onClick={handleLocationDetect}
                    disabled={locationStatus === 'detecting'}
                    className="pointer-events-auto px-3 py-1.5 rounded-lg bg-teal-950/85 backdrop-blur-md border border-teal-500/40 hover:border-[#00dfc0] text-teal-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <svg className={`w-3.5 h-3.5 text-[#00dfc0] ${locationStatus === 'detecting' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="7" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                      <path strokeLinecap="round" strokeWidth={1.8} d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                    </svg>
                    <span className="hidden sm:inline">
                      {locationStatus === 'detecting' ? 'Locating...' : 'Use my current location'}
                    </span>
                    <span className="sm:hidden">
                      {locationStatus === 'detecting' ? 'Locating...' : 'GPS'}
                    </span>
                  </button>
                </div>

                {/* Map Overlay Bottom Hint */}
                <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                  <div className="px-2 py-1 rounded bg-[#020713]/85 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-slate-400 hidden sm:block">
                    Click map to place pin • Drag marker to adjust
                  </div>
                </div>
              </div>

              {/* Inline Geolocation Error Alert */}
              {locationStatus === 'error' && locationError && (
                <div role="alert" aria-live="polite" className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1 leading-relaxed">
                    {locationError}
                  </div>
                </div>
              )}

              {/* Expandable Manual Coordinates Inputs */}
              {showManualCoords && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-white/10">
                  <div>
                    <label htmlFor={latInputId} className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Latitude
                    </label>
                    <input
                      id={latInputId}
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => {
                        setLatitude(e.target.value);
                        const latVal = parseFloat(e.target.value);
                        const lngVal = parseFloat(longitude);
                        if (!isNaN(latVal) && !isNaN(lngVal)) {
                          setLocationStatus('detected');
                          mapRef.current?.flyTo({ center: [lngVal, latVal], zoom: 14, duration: 500 });
                        }
                      }}
                      placeholder="e.g. 26.9239"
                      required
                      className="w-full min-h-[44px] p-2.5 rounded-lg bg-slate-950 border border-white/10 text-white font-mono text-base sm:text-sm focus:outline-none focus:border-[#00dfc0] transition"
                    />
                  </div>
                  <div>
                    <label htmlFor={lngInputId} className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Longitude
                    </label>
                    <input
                      id={lngInputId}
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => {
                        setLongitude(e.target.value);
                        const latVal = parseFloat(latitude);
                        const lngVal = parseFloat(e.target.value);
                        if (!isNaN(latVal) && !isNaN(lngVal)) {
                          setLocationStatus('detected');
                          mapRef.current?.flyTo({ center: [lngVal, latVal], zoom: 14, duration: 500 });
                        }
                      }}
                      placeholder="e.g. 75.8267"
                      required
                      className="w-full min-h-[44px] p-2.5 rounded-lg bg-slate-950 border border-white/10 text-white font-mono text-base sm:text-sm focus:outline-none focus:border-[#00dfc0] transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. DETAILS: WHAT HAPPENED? WITH TAGS & 500-CHAR TEXTAREA */}
            <div className="space-y-2.5 pt-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#00dfc0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <label htmlFor={descInputId} className="text-sm sm:text-base font-bold text-white tracking-wide">
                    3. What happened?
                  </label>
                </div>
                <span
                  className={`text-[11px] font-mono ${
                    description.length > 450 ? 'text-amber-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {description.length} / 500
                </span>
              </div>

              {/* Tags Input (Frontend-only state) */}
              <div className="space-y-1.5">
                <label htmlFor={tagInputId} className="block text-xs font-semibold text-slate-300">
                  Incident Tags <span className="text-[11px] font-mono text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">#</span>
                    <input
                      id={tagInputId}
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="e.g. poor-lighting, crowd, obstruction (press Enter)"
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#02050f]/90 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfc0] focus:ring-1 focus:ring-[#00dfc0]/40 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3.5 py-2 rounded-lg border border-teal-500/40 bg-teal-950/40 hover:bg-teal-950/70 text-teal-300 text-xs font-semibold transition cursor-pointer hover:border-[#00dfc0]"
                  >
                    Add
                  </button>
                </div>

                {/* Active Tag Chips */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-950/70 border border-teal-500/40 text-teal-200 text-xs font-medium"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="w-3.5 h-3.5 rounded-full hover:bg-teal-500/20 text-teal-400 hover:text-white flex items-center justify-center transition cursor-pointer font-bold leading-none"
                          aria-label={`Remove tag ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                id={descInputId}
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you noticed so others know what to expect..."
                required
                className="w-full p-3 sm:p-3.5 rounded-xl bg-[#02050f]/90 border border-white/10 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00dfc0] focus:ring-1 focus:ring-[#00dfc0]/40 transition resize-none leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]"
              />
            </div>

            {/* Inline Submission Network Error */}
            {submitError && (
              <div role="alert" aria-live="polite" className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
                <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1 leading-relaxed">{submitError}</div>
              </div>
            )}

            {/* ACTION BUTTONS: Dominant Stacked Submit on Mobile, Horizontal on Desktop */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-6 rounded-xl border border-white/10 hover:border-white/20 active:bg-white/[0.08] hover:bg-white/[0.04] text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 min-h-[48px] py-3 sm:py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#00dfc0] hover:bg-[#00c9ad] active:scale-[0.98] text-slate-950 shadow-[0_0_20px_rgba(0,223,192,0.35)] hover:shadow-[0_0_30px_rgba(0,223,192,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>SUBMIT REPORT</span>
                    <span className="font-mono text-sm">→</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </main>
  );
}
