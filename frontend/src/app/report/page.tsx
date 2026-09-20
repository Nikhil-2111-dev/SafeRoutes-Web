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
    activeBorder: 'border-white',
    activeBg: 'bg-white/10',
    activeRing: 'ring-white/20',
    accentText: 'text-white',
    activeShadow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'danger',
    title: 'Danger Zone',
    activeBorder: 'border-white',
    activeBg: 'bg-white/10',
    activeRing: 'ring-white/20',
    accentText: 'text-white',
    activeShadow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]',
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    id: 'warning',
    title: 'Hazard / Warning',
    activeBorder: 'border-white',
    activeBg: 'bg-white/10',
    activeRing: 'ring-white/20',
    accentText: 'text-white',
    activeShadow: 'shadow-[0_0_15px_rgba(255,255,255,0.1)]',
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
  const bgRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  // Noticeable yet restrained Desktop Pointer Parallax for background
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) return;

    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!rafId) rafId = requestAnimationFrame(updateParallax);
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;
      if (bgRef.current) {
        bgRef.current.style.setProperty('--plx-x', `${(currentX * 10).toFixed(2)}px`);
        bgRef.current.style.setProperty('--plx-y', `${(currentY * 10).toFixed(2)}px`);
      }
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        rafId = requestAnimationFrame(updateParallax);
      } else {
        rafId = null;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

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
          userId: 'test-user-id',
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

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-black text-white relative overflow-x-hidden py-10 sm:py-12 px-6 sm:px-8 flex flex-col items-center justify-start sm:justify-center font-sans">
      
      <style>{`
        @keyframes meshDrift1 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(4%, -6%) scale(1.1) rotate(20deg); }
          66% { transform: translate(-3%, 4%) scale(0.9) rotate(-10deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
        @keyframes meshDrift2 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(-5%, 5%) scale(1.15) rotate(-15deg); }
          66% { transform: translate(4%, -3%) scale(0.85) rotate(15deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
        /* Map Routing Animations */
        @keyframes travelLine {
          from { stroke-dashoffset: 4000; }
          to { stroke-dashoffset: -1000; }
        }
        @keyframes travelLineRev {
          from { stroke-dashoffset: -1000; }
          to { stroke-dashoffset: 4000; }
        }
        @keyframes pulseNode {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px) scale(0.95); opacity: 0.4; }
          50% { transform: translateY(-8px) scale(1.05); opacity: 1; }
        }
        
        .anim-travel-1 { stroke-dasharray: 400 3600; animation: travelLine 12s linear infinite; }
        .anim-travel-2 { stroke-dasharray: 250 2800; animation: travelLineRev 15s linear infinite; }
        .anim-travel-3 { stroke-dasharray: 150 2500; animation: travelLine 10s linear infinite; }
        
        .anim-node { animation: pulseNode 3s ease-in-out infinite; transform-origin: center; }
        
        .anim-float-1 { animation: floatIcon 5s ease-in-out infinite; }
        .anim-float-2 { animation: floatIcon 6s ease-in-out infinite 2s; }
        .anim-float-3 { animation: floatIcon 4s ease-in-out infinite 3.5s; }

        /* Subtle noise texture overlay */
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
        }
      `}</style>

      {/* Cinematic Animated Background */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-noise mix-blend-overlay z-20 opacity-60"></div>
        
        {/* Soft Glowing Blobs */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan-500/20 rounded-full blur-[80px] anim-mesh-1"
            style={{ transform: 'translate3d(calc(-50% - 10% + var(--plx-x, 0px)), calc(-50% - 10% + var(--plx-y, 0px)), 0)' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-teal-500/15 rounded-full blur-[70px] anim-mesh-2"
            style={{ transform: 'translate3d(calc(-50% + 15% + var(--plx-x, 0px)), calc(-50% + 15% + var(--plx-y, 0px)), 0)' }}
          />
        </div>

        {/* Ultra-Minimalist Routing Paths (No Clumsy Grid) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-100 z-10" style={{ transform: 'translate3d(calc(var(--plx-x, 0px) * 0.1), calc(var(--plx-y, 0px) * 0.1), 0)' }}>
          <svg className="w-full h-full min-w-[1200px]" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <mask id="fadeMask">
                <radialGradient id="fadeGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="75%" stopColor="white" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <rect width="1440" height="900" fill="url(#fadeGrad)" />
              </mask>
            </defs>
            
            <g mask="url(#fadeMask)">
              
              {/* Floating Ambient Small Icons */}
              <g className="anim-float-1" transform="translate(300, 300)">
                <polygon points="0,-8 8,0 0,8 -8,0" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
              </g>

              <g className="anim-float-2" transform="translate(1050, 250)">
                <path d="M-6,0 L6,0 M0,-6 L0,6" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
                <circle cx="0" cy="0" r="2" fill="#ffffff" />
              </g>

              <g className="anim-float-3" transform="translate(1200, 750)">
                <rect x="-5" y="-5" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="2" transform="rotate(45)" opacity="0.7" />
              </g>

              <g className="anim-float-1" transform="translate(250, 750)" style={{ animationDelay: '2s' }}>
                <circle cx="0" cy="0" r="7" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 4" opacity="0.9" />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
              </g>

              <g strokeLinecap="round" strokeLinejoin="round">
                {/* Curve 1: Smooth sweeping central route */}
                <path d="M -200 650 C 300 650, 550 350, 950 350 C 1200 350, 1600 450, 1600 450" stroke="#ffffff" strokeWidth="2" opacity="0.2" />
                <path d="M -200 650 C 300 650, 550 350, 950 350 C 1200 350, 1600 450, 1600 450" stroke="#ffffff" strokeWidth="5" className="anim-travel-1" opacity="1" filter="url(#routeGlow)" />
                <circle cx="950" cy="350" r="5" fill="#ffffff" className="anim-node" />
                <circle cx="550" cy="350" r="3" fill="#ffffff" className="anim-node" style={{ animationDelay: '2s' }} />

                {/* Curve 2: Elegant crossing route */}
                <path d="M -100 250 C 350 150, 850 850, 1500 750" stroke="#ffffff" strokeWidth="2" opacity="0.15" />
                <path d="M -100 250 C 350 150, 850 850, 1500 750" stroke="#ffffff" strokeWidth="4" className="anim-travel-2" opacity="0.8" filter="url(#routeGlow)" />
                
                {/* Curve 3: Vertical subtle topographic line */}
                <path d="M 250 1100 C 450 750, 350 250, 850 -200" stroke="#ffffff" strokeWidth="2" opacity="0.15" strokeDasharray="6 18" />
                <path d="M 250 1100 C 450 750, 350 250, 850 -200" stroke="#ffffff" strokeWidth="4" className="anim-travel-3" opacity="0.6" filter="url(#routeGlow)" />
                <circle cx="450" cy="750" r="4" fill="#ffffff" className="anim-node" style={{ animationDelay: '1.5s'}} />
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className="w-[90%] sm:w-full max-w-[800px] relative z-20 flex flex-col items-center">
        
        {/* COMPACT TOP INTRO */}
        <header className="text-center space-y-1 w-full mx-auto px-2 mb-6">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-zinc-400 font-bold uppercase">
              COMMUNITY SAFETY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight">
            REPORT AN INCIDENT
          </h1>
        </header>

        {/* MAIN REPORTING MODAL */}
        <div className="w-full rounded-[32px] bg-[#161618]/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.85)] p-8 sm:p-10 relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* SMART SCAN (AI) */}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative cursor-pointer p-4 rounded-2xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-wide">SMART SCAN</span>
                        <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10">AI</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 shadow-[0_0_15px_rgba(0,223,192,0.3)] text-xs font-bold uppercase transition"
                  >
                    Select Photo
                  </button>
                </div>
              ) : (
                <div className="relative p-3 rounded-2xl bg-white/5 border border-white/10 overflow-hidden space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span className="text-xs font-bold text-white font-mono uppercase">Photo Attached</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-zinc-300 hover:text-white underline font-mono">
                        Replace
                      </button>
                      <button type="button" onClick={handleRemoveImage} className="text-xs text-zinc-500 hover:text-white underline font-mono">
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="relative h-36 sm:h-44 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <img src={selectedImage} alt="Incident preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* 1. INCIDENT TYPE */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wide">1. What type of incident?</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {INCIDENT_OPTIONS.map((opt) => {
                  const isSelected = type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setType(opt.id)}
                      className={`w-full p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 active:scale-[0.98] ${
                        isSelected
                          ? `bg-white/10 border-white ring-1 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-[1.01]`
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-zinc-400'
                      }`}
                    >
                      <div className={`transition-transform ${isSelected ? 'text-white scale-110' : ''}`}>
                        {opt.icon}
                      </div>
                      <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                        {opt.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. LOCATION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white tracking-wide">2. Location</span>
                <button
                  type="button"
                  onClick={() => setShowManualCoords(!showManualCoords)}
                  className="text-xs font-mono text-zinc-400 hover:text-white underline"
                >
                  {showManualCoords ? 'Hide coordinates' : 'Edit coordinates'}
                </button>
              </div>

              <div className="relative w-full h-[240px] rounded-2xl overflow-hidden border border-white/10 bg-[#0a0f1d]">
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

                  {!isNaN(parsedLat) && !isNaN(parsedLng) && (
                    <Marker
                      longitude={parsedLng}
                      latitude={parsedLat}
                      draggable
                      onDragEnd={handleMarkerDragEnd}
                      anchor="bottom"
                    >
                      <div className="relative flex flex-col items-center cursor-grab active:cursor-grabbing group">
                        <div className="absolute -inset-1 rounded-full bg-white/35 animate-ping pointer-events-none" />
                        <div className="relative w-6 h-6 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center transition-transform group-hover:scale-110">
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        </div>
                        <div className="w-2 h-2 bg-white rotate-45 -mt-1 border-r border-b border-zinc-900" />
                      </div>
                    </Marker>
                  )}
                </Map>

                <div className="absolute top-3 right-3 pointer-events-none">
                  <button
                    type="button"
                    onClick={handleLocationDetect}
                    disabled={locationStatus === 'detecting'}
                    className="pointer-events-auto w-10 h-10 rounded-xl bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <svg className={`w-5 h-5 ${locationStatus === 'detecting' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="7" strokeWidth="2" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                      <path strokeLinecap="round" strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                    </svg>
                  </button>
                </div>
              </div>

              {showManualCoords && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <label htmlFor={latInputId} className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Latitude</label>
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
                      className="w-full min-h-[44px] p-2.5 rounded-xl bg-black border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label htmlFor={lngInputId} className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Longitude</label>
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
                      className="w-full min-h-[44px] p-2.5 rounded-xl bg-black border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. DETAILS */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wide">3. What happened?</span>
              <div className="flex flex-col sm:flex-row gap-2">
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
                  placeholder="#tags (Press Enter)"
                  className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white transition"
                  disabled={tags.length >= 8}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 8}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold uppercase transition disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-zinc-300 text-[11px] font-mono border border-white/10">
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-white">&times;</button>
                    </span>
                  ))}
                </div>
              )}

              <textarea
                id={descInputId}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Describe the incident..."
                required
                rows={3}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm resize-none focus:outline-none focus:border-white transition"
              />
            </div>

            {submitError && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm text-center">
                {submitError}
              </div>
            )}

            {/* ACTIONS */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(0,223,192,0.3)] hover:opacity-90 active:scale-[0.98] transition"
              >
                {isSubmitting ? 'Submitting...' : 'SUBMIT REPORT'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}
