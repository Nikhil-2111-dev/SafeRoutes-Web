'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SOSModal from '@/components/SOSModal';

export default function Home() {
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [highlightedRoute, setHighlightedRoute] = useState<'safer' | 'faster'>('safer');
  const [activeLayer, setActiveLayer] = useState<'lighting' | 'activity' | 'infrastructure' | 'hazards'>('lighting');
  const [activeSignal, setActiveSignal] = useState<number>(1);
  const [revealedScenes, setRevealedScenes] = useState<Record<string, boolean>>({
    'scene-0': true,
  });
  const [activeScene, setActiveScene] = useState<string>('scene-0');
  const [scrollProgress, setScrollProgress] = useState(0);

  const waypoints = [
    { id: 'scene-0', num: '00', label: 'JOURNEY' },
    { id: 'scene-1', num: '01', label: 'ROUTE' },
    { id: 'scene-2', num: '02', label: 'INTELLIGENCE' },
    { id: 'scene-3', num: '03', label: 'SIGNALS' },
    { id: 'scene-4', num: '04', label: 'SOS' },
    { id: 'scene-5', num: '05', label: 'DESTINATION' },
  ];

  // Animated emergency grace countdown simulation
  const [countdown, setCountdown] = useState(5.0);
  useEffect(() => {
    if (!revealedScenes['scene-4']) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0.2) return 5.0;
        return Math.round((prev - 0.1) * 10) / 10;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [revealedScenes]);

  useEffect(() => {
    const sceneIds = ['scene-0', 'scene-1', 'scene-2', 'scene-3', 'scene-4', 'scene-5'];
    const elements = sceneIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    // Latching reveal observer - triggers once upon entry and stays revealed
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealedScenes((prev) => (prev[entry.target.id] ? prev : { ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    // Active scene tracker for waypoint indicator
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveScene(entry.target.id);
          }
        });
      },
      { threshold: 0.35 }
    );

    elements.forEach((el) => {
      revealObserver.observe(el);
      activeObserver.observe(el);
    });

    // Throttled scroll progress tracker
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalHeight)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const signals = [
    {
      id: 1,
      title: 'Low Illumination Corridor',
      location: 'North Boulevard // Sector 04',
      status: 'Streetlamp Deficit',
      color: 'amber',
      detail: 'Reduced street lighting reported along 180m pedestrian walkway. Safer route diverts to illuminated avenue.',
      coords: '40.7138° N, 74.0042° W',
      radarX: 160,
      radarY: 140,
    },
    {
      id: 2,
      title: 'Pedestrian Caution Advisory',
      location: 'East Shadow Alley // Transit Way',
      status: 'Caution Advisory',
      color: 'coral',
      detail: 'Isolated passage adjacent to unlit loading zone. Avoidance recommended during nighttime transit.',
      coords: '40.7112° N, 74.0089° W',
      radarX: 300,
      radarY: 280,
    },
    {
      id: 3,
      title: 'Pathway Obstruction',
      location: 'West Walkway Overpass',
      status: 'Pathway Blocked',
      color: 'cyan',
      detail: 'Sidewalk construction obstruction forcing detour into vehicular lane. Alternate sidewalk advised.',
      coords: '40.7154° N, 73.9998° W',
      radarX: 130,
      radarY: 310,
    },
    {
      id: 4,
      title: 'Low Visibility Corridor',
      location: 'South Plaza Underpass',
      status: 'Shadow Gap',
      color: 'rose',
      detail: 'Underpass lighting outage reported by neighborhood walkers. SafeRoute favors ground-level illuminated crossing.',
      coords: '40.7095° N, 74.0065° W',
      radarX: 280,
      radarY: 110,
    }
  ];

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 selection:bg-teal-400 selection:text-slate-950 font-sans relative overflow-x-hidden">
      
      {/* Ambient Atmospheric Canvas Glows with Chromatic Migration */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-transform duration-500 ease-out"
        style={{ transform: `translate3d(0, ${-(scrollProgress * 48)}px, 0)` }}
      >
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] blur-[140px] rounded-full transition-colors duration-700 ${
          activeScene === 'scene-4' 
            ? 'bg-gradient-to-b from-rose-500/15 via-orange-500/5 to-transparent' 
            : 'bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent'
        }`} />
        <div className={`absolute top-[40%] -right-40 w-[600px] h-[500px] blur-[160px] rounded-full transition-colors duration-700 ${
          activeScene === 'scene-4' ? 'bg-rose-500/10' : 'bg-teal-500/5'
        }`} />
        <div className="absolute bottom-[20%] -left-40 w-[600px] h-[500px] bg-rose-500/5 blur-[160px] rounded-full" />
      </div>

      {/* Cartographic Coordinate Ticks & Subtle Background Grid Parallax */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.035] transition-transform duration-300 ease-out"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          transform: `translate3d(0, ${-(scrollProgress * 36)}px, 0)`,
        }}
      />

      {/* Continuous Journey / Transit Spine (Ultra-wide desktop display) */}
      <div className="fixed left-3 sm:left-5 top-24 bottom-12 pointer-events-none z-30 hidden 2xl:flex flex-col items-center">
        <div className="text-[9px] font-mono text-teal-400/80 mb-2 font-bold tracking-widest uppercase rotate-180 [writing-mode:vertical-lr]">
          ROUTE // PROGRESS
        </div>
        <div className="w-px flex-1 bg-white/[0.08] relative">
          <div 
            className="absolute top-0 w-[2px] -left-[0.5px] bg-gradient-to-b from-teal-400 via-cyan-400 to-teal-400 shadow-[0_0_8px_rgba(0,223,192,0.6)] transition-all duration-150"
            style={{ height: `${Math.round(scrollProgress * 100)}%` }}
          />
          <div 
            className="absolute w-2.5 h-2.5 -left-[4.5px] rounded-full bg-teal-300 border border-teal-100 shadow-[0_0_12px_#00dfc0] transition-all duration-150"
            style={{ top: `calc(${Math.round(scrollProgress * 100)}% - 5px)` }}
          />
        </div>
        <div className="text-[8px] font-mono text-slate-500 mt-2">
          {Math.round(scrollProgress * 100)}%
        </div>
      </div>

      {/* Minimal Active-Scene Waypoint Rail Indicator (Desktop) */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-1.5 p-2 rounded-2xl bg-[#070b16]/75 border border-white/[0.08] backdrop-blur-md font-mono shadow-2xl">
        {waypoints.map((wp) => {
          const isActive = activeScene === wp.id;
          return (
            <button
              key={wp.id}
              type="button"
              onClick={() => {
                document.getElementById(wp.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all text-left cursor-pointer ${
                isActive
                  ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30 font-bold'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
              }`}
              aria-label={`Scroll to ${wp.label}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-teal-400 shadow-[0_0_8px_#00dfc0] scale-125'
                    : 'bg-slate-700 group-hover:bg-slate-400'
                }`}
              />
              <span className="text-[10px] tracking-wider">{wp.num}</span>
              <span className="text-[9px] tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden 2xl:inline">
                {wp.label}
              </span>
            </button>
          );
        })}
      </div>

      <main className="relative z-10 flex flex-col">
        
        {/* ================================================================= */}
        {/* HERO: THE SIGNATURE MOMENT                                        */}
        {/* ================================================================= */}
        <section id="scene-0" className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden border-b border-white/[0.06]">
          
          {/* Main Hero Container: Balanced 40/60 Editorial Layout */}
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-8 sm:pt-12 pb-10 flex-1 flex flex-col lg:flex-row items-center gap-10 lg:gap-12 justify-between">
            
            {/* Left Column (~40% on Desktop): Editorial Copy & Primary Actions */}
            <div className="w-full lg:w-[42%] flex flex-col justify-center z-10">
              
              {/* Eyebrow */}
              <div className="text-xs sm:text-sm font-mono tracking-[0.22em] text-slate-400 font-semibold uppercase mb-4 sm:mb-6">
                REAL PEOPLE. SAFER ROUTES. BRIGHTER CITIES.
              </div>

              {/* Refined Headline at normal premium landing-page scale */}
              <h1 className="text-4xl sm:text-5xl lg:text-[50px] xl:text-[56px] font-black uppercase tracking-tight leading-[1.06] text-white">
                THE FASTEST<br />
                ROUTE ISN&apos;T<br />
                <span className="text-[#00dfc0] drop-shadow-[0_0_25px_rgba(0,223,192,0.45)]">
                  THE SAFEST.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base sm:text-lg text-slate-300/90 font-normal max-w-md leading-relaxed">
                SafeRoute adds a layer traditional navigation misses — the safety context around your journey.
              </p>

              {/* CTA Button Group */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
                <Link href="/map">
                  <button className="bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 font-bold px-7 py-3.5 rounded-full text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(0,223,192,0.35)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer">
                    <span>Explore SafeRoute</span>
                    <span className="text-base font-bold">→</span>
                  </button>
                </Link>

                <Link href="/report">
                  <button className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white px-6 py-3.5 rounded-full font-medium text-sm sm:text-base border border-slate-700/80 backdrop-blur-md transition-all hover:border-slate-500 cursor-pointer">
                    <span>Report an incident</span>
                  </button>
                </Link>
              </div>

              {/* Smooth Interactive Scroll Indicator */}
              <button
                type="button"
                onClick={() => document.getElementById('scene-1')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-12 lg:mt-16 flex items-center gap-3 text-slate-400 hover:text-teal-300 transition-colors group cursor-pointer text-left"
              >
                <div className="w-[2px] h-3.5 bg-teal-400 rounded-full group-hover:h-5 transition-all" />
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-slate-400 group-hover:text-teal-300 transition-colors">
                  SCROLL TO EXPLORE
                </span>
                <div className="w-3.5 h-5 rounded-full border border-slate-600 group-hover:border-teal-500/60 flex items-start justify-center p-[2px] transition-colors">
                  <div className="w-1 h-1.5 bg-slate-400 group-hover:bg-teal-300 rounded-full animate-bounce" />
                </div>
                <div className="w-10 sm:w-14 h-[1px] bg-slate-800 group-hover:bg-teal-500/40 transition-colors" />
              </button>

            </div>

            {/* Right Column (~60% on Desktop): Large Cinematic City Navigation Visual */}
            <div className="w-full lg:w-[58%] relative flex items-center justify-center">
              
              {/* Card Canvas Container */}
              <div className="relative w-full aspect-[4/3] max-w-[660px] rounded-2xl overflow-hidden bg-[#070b16] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(0,223,192,0.06)]">
                
                {/* SVG Nighttime City Navigation Scene */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 700 520"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Cyan/Teal Gradient for Safe Route */}
                    <linearGradient id="heroTealGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity="0.9" />
                      <stop offset="40%" stopColor="#00dfc0" stopOpacity="1" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
                    </linearGradient>

                    {/* Filter for glowing polylines */}
                    <filter id="heroGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Amber Urban Night Radiance */}
                    <radialGradient id="amberGlow1" cx="62%" cy="65%" r="35%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.14" />
                      <stop offset="60%" stopColor="#d97706" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#070b16" stopOpacity="0" />
                    </radialGradient>

                    <radialGradient id="amberGlow2" cx="45%" cy="30%" r="30%">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.12" />
                      <stop offset="60%" stopColor="#b45309" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="#070b16" stopOpacity="0" />
                    </radialGradient>

                    {/* Cyan Corridor Illumination */}
                    <radialGradient id="tealCorridorGlow" cx="42%" cy="46%" r="32%">
                      <stop offset="0%" stopColor="#00dfc0" stopOpacity="0.12" />
                      <stop offset="55%" stopColor="#0f766e" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="#070b16" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Atmospheric Light Washes */}
                  <rect width="700" height="520" fill="#070b16" />
                  <rect width="700" height="520" fill="url(#amberGlow1)" />
                  <rect width="700" height="520" fill="url(#amberGlow2)" />
                  <rect width="700" height="520" fill="url(#tealCorridorGlow)" />

                  {/* Dark Nocturnal River Body on East Perimeter */}
                  <path
                    d="M 640 0 Q 610 180 650 330 T 700 520 L 700 0 Z"
                    fill="#040813"
                    stroke="rgba(56, 189, 248, 0.12)"
                    strokeWidth="1"
                  />
                  {/* Bridge Crossings */}
                  <line x1="622" y1="160" x2="660" y2="165" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
                  <line x1="638" y1="310" x2="676" y2="315" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />

                  {/* Cartographic Urban Minor Street Grid */}
                  <g stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1">
                    <line x1="40" y1="90" x2="640" y2="90" />
                    <line x1="40" y1="170" x2="640" y2="170" />
                    <line x1="40" y1="250" x2="640" y2="250" />
                    <line x1="40" y1="330" x2="640" y2="330" />
                    <line x1="40" y1="410" x2="640" y2="410" />
                    <line x1="40" y1="490" x2="640" y2="490" />

                    <line x1="90" y1="30" x2="90" y2="500" />
                    <line x1="170" y1="30" x2="170" y2="500" />
                    <line x1="250" y1="30" x2="250" y2="500" />
                    <line x1="330" y1="30" x2="330" y2="500" />
                    <line x1="410" y1="30" x2="410" y2="500" />
                    <line x1="490" y1="30" x2="490" y2="500" />
                    <line x1="570" y1="30" x2="570" y2="500" />
                  </g>

                  {/* Warm Illuminated Arterial Avenues */}
                  <g stroke="#f59e0b" strokeWidth="1.5" opacity="0.32" strokeLinecap="round">
                    <line x1="50" y1="210" x2="610" y2="210" />
                    <line x1="80" y1="380" x2="600" y2="380" />
                    <line x1="250" y1="40" x2="250" y2="480" />
                    <line x1="450" y1="40" x2="450" y2="480" />
                    {/* Diagonal Urban Thoroughfare */}
                    <line x1="70" y1="460" x2="520" y2="90" strokeWidth="2" opacity="0.45" />
                    <line x1="180" y1="500" x2="610" y2="140" strokeWidth="1.2" opacity="0.28" />
                  </g>

                  {/* Soft Building Footprints (Cartographic massing) */}
                  <g fill="rgba(15, 23, 42, 0.45)" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5">
                    <rect x="105" y="105" width="50" height="50" rx="3" />
                    <rect x="185" y="105" width="50" height="50" rx="3" />
                    <rect x="265" y="105" width="50" height="50" rx="3" />
                    <rect x="345" y="105" width="50" height="50" rx="3" />
                    <rect x="425" y="105" width="50" height="50" rx="3" />
                    <rect x="505" y="105" width="50" height="50" rx="3" />

                    <rect x="105" y="265" width="50" height="50" rx="3" />
                    <rect x="185" y="265" width="50" height="50" rx="3" />
                    <rect x="265" y="265" width="50" height="50" rx="3" />
                    <rect x="345" y="265" width="50" height="50" rx="3" />
                    <rect x="425" y="265" width="50" height="50" rx="3" />

                    <rect x="105" y="345" width="50" height="50" rx="3" />
                    <rect x="265" y="345" width="50" height="50" rx="3" />
                    <rect x="345" y="345" width="50" height="50" rx="3" />
                    <rect x="425" y="345" width="50" height="50" rx="3" />
                  </g>

                  {/* ---------------------------------------------------- */}
                  {/* ROUTE 2: FASTER ROUTE (Amber/Red Dashed Risky Path) */}
                  {/* ---------------------------------------------------- */}
                  <path
                    d="M 170 380 L 260 395 L 350 345 L 430 265 L 500 195 L 550 130"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />

                  {/* Hazard Warning Node on Faster Route */}
                  <circle cx="430" cy="265" r="16" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
                  <polygon points="430,256 439,272 421,272" fill="#ef4444" stroke="#f87171" strokeWidth="1" />
                  <line x1="430" y1="262" x2="430" y2="266" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="430" cy="269" r="0.9" fill="#ffffff" />

                  {/* ---------------------------------------------------- */}
                  {/* ROUTE 1: SAFER ROUTE (Luminous Glowing Teal Avenue)   */}
                  {/* ---------------------------------------------------- */}
                  <path
                    d="M 170 380 L 230 320 L 280 290 L 330 210 L 400 180 L 480 160 L 550 130"
                    stroke="url(#heroTealGlow)"
                    strokeWidth="4"
                    filter="url(#heroGlowFilter)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-route-pulse"
                  />

                  {/* Animated White Flow Packet along Safer Route */}
                  <path
                    d="M 170 380 L 230 320 L 280 290 L 330 210 L 400 180 L 480 160 L 550 130"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="24 160"
                    strokeLinecap="round"
                    className="animate-route-flow"
                    opacity="0.95"
                  />

                  {/* Waypoint Shield Node along Safer Route */}
                  <circle cx="330" cy="210" r="18" fill="#00dfc0" fillOpacity="0.15" stroke="#00dfc0" strokeWidth="1" opacity="0.7" />
                  <circle cx="330" cy="210" r="12" fill="#0d9488" stroke="#00dfc0" strokeWidth="1.5" />
                  {/* Shield graphic */}
                  <path
                    d="M 326 206 L 330 204 L 334 206 V 211 C 334 214 330 217 330 217 C 330 217 326 214 326 211 Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M 328.5 210.5 L 329.8 211.8 L 332 208.5"
                    stroke="#0d9488"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* ---------------------------------------------------- */}
                  {/* ORIGIN NODE (Current Location / Radar Pulse)         */}
                  {/* ---------------------------------------------------- */}
                  <circle cx="170" cy="380" r="34" stroke="#0ea5e9" strokeWidth="1" opacity="0.2" />
                  <circle cx="170" cy="380" r="22" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" className="animate-beacon-wave" />
                  <circle cx="170" cy="380" r="9" fill="#0284c7" />
                  <circle cx="170" cy="380" r="3.5" fill="#ffffff" />

                  {/* ---------------------------------------------------- */}
                  {/* DESTINATION NODE (Civic Center Marker)              */}
                  {/* ---------------------------------------------------- */}
                  <circle cx="550" cy="130" r="22" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                  <circle cx="550" cy="130" r="10" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle cx="550" cy="130" r="4" fill="#f59e0b" />
                  
                  {/* Destination Pin Icon */}
                  <g transform="translate(542, 98)">
                    <path
                      d="M8 0C3.58 0 0 3.58 0 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z"
                      fill="#f59e0b"
                      stroke="#fbbf24"
                      strokeWidth="1"
                    />
                    <circle cx="8" cy="8" r="3" fill="#ffffff" />
                  </g>
                </svg>

                {/* Telemetry Header (Top Right) */}
                <div className="absolute top-3 right-4 sm:top-4 sm:right-6 text-right font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-slate-400 uppercase pointer-events-none">
                  <div>A SAFER CITY</div>
                  <div className="text-slate-500">FOR BRIGHTER TOMORROWS</div>
                </div>

                {/* Floating "You are here" Pill */}
                <div className="absolute left-[28%] top-[72%] -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-lg text-[10px] sm:text-[11px] text-slate-300 font-medium whitespace-nowrap backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>You are here</span>
                </div>

                {/* Floating "Safer Route" Card (Top-Left of Route) */}
                <div className="absolute left-[26%] sm:left-[30%] top-[12%] sm:top-[14%] flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-teal-500/40 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(0,223,192,0.15)] max-w-[190px] sm:max-w-[215px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-teal-400 shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white leading-tight">Safer Route</div>
                    <div className="text-[10px] sm:text-[11px] text-teal-300/90 font-medium truncate mt-0.5">Better lit, more people</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5">18 min • ~ 2.4 km</div>
                  </div>
                </div>

                {/* Floating "Faster Route" Card (Lower-Right of Route) */}
                <div className="absolute right-[4%] sm:right-[6%] top-[48%] sm:top-[50%] flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.6)] max-w-[185px] sm:max-w-[205px]">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white leading-tight">Faster Route</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-300 truncate mt-0.5">Quicker but higher risk</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5">12 min • ~ 1.8 km</div>
                  </div>
                </div>

                {/* Floating "Destination" Card (Top Right next to Pin) */}
                <div className="absolute right-[3%] sm:right-[4%] top-[12%] sm:top-[14%] p-2 sm:p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/70 backdrop-blur-md shadow-lg min-w-[125px]">
                  <div className="text-[11px] sm:text-xs font-bold text-white leading-tight">Destination</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">City Civic Center</div>
                </div>

                {/* Compass Rose & GPS Telemetry (Bottom Right) */}
                <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 flex flex-col items-end gap-1.5 pointer-events-none font-mono">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-slate-700/80 flex flex-col items-center justify-center text-[8px] text-slate-400 bg-slate-950/40">
                    <span className="font-bold text-teal-400 text-[9px]">N</span>
                    <span className="w-1.5 h-[1px] bg-slate-600 my-[1px]" />
                    <span className="text-[8px] text-slate-600">S</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] tracking-wider text-slate-500 text-right leading-tight">
                    <div>40.7128° N</div>
                    <div>74.0060° W</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Spatial Navigation Telemetry Horizon Strip (Integrated Transition from Hero) */}
          <div className="w-full border-t border-white/[0.08] bg-[#050914]/85 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-5 sm:py-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:gap-8 text-xs font-mono">
              
              {/* Pillar 1 */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] tracking-widest text-teal-400 font-bold uppercase">ROUTE // CONTEXT</div>
                  <div className="text-sm font-bold text-white tracking-tight truncate font-sans">Safety-Aware Routing</div>
                  <div className="text-[11px] text-slate-400 truncate">Illumination &amp; street-level safety focus</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-white/[0.08]" />

              {/* Pillar 2 */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] tracking-widest text-teal-400 font-bold uppercase">COMMUNITY // SIGNAL</div>
                  <div className="text-sm font-bold text-white tracking-tight truncate font-sans">Pedestrian Hazard Reports</div>
                  <div className="text-[11px] text-slate-400 truncate">Shared local insights from neighborhood walkers</div>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-white/[0.08]" />

              {/* Pillar 3 */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] tracking-widest text-rose-400 font-bold uppercase">SOS // UI SIMULATION</div>
                  <div className="text-sm font-bold text-white tracking-tight truncate font-sans">Emergency Response</div>
                  <div className="text-[11px] text-slate-400 truncate">5-second grace window &amp; coordinate packaging</div>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* ================================================================= */}
        {/* CONTINUOUS ROUTE CONNECTOR: HERO → SCENE 01 (ROUTE CHOICE)        */}
        {/* ================================================================= */}
        <div className="relative w-full h-24 sm:h-32 flex items-center justify-center overflow-hidden pointer-events-none -my-6 sm:-my-8 z-20">
          <svg className="w-full max-w-5xl h-full" viewBox="0 0 600 120" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connectorHeroToS1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00dfc0" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#00dfc0" stopOpacity="1" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d="M 300 0 L 300 120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <path
              d="M 300 0 C 300 45, 300 75, 300 120"
              stroke="url(#connectorHeroToS1)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 8px rgba(0,223,192,0.6))"
            />
            <path
              d="M 300 0 L 300 120"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-connector-flow"
              opacity="0.9"
            />
            <circle cx="300" cy="60" r="4.5" fill="#00dfc0" className="animate-tracer-pulse" />
          </svg>
          <div className="absolute font-mono text-[9px] tracking-[0.25em] text-teal-400/80 uppercase bg-[#070b16]/90 px-2.5 py-1 rounded-full border border-teal-500/30 backdrop-blur-md">
            TRANSIT // DIVERGENCE ZONE
          </div>
        </div>

        {/* ================================================================= */}
        {/* SCENE 01: ROUTE CHOICE (SPATIAL ROUTE DIVERGENCE)                 */}
        {/* ================================================================= */}
        <section id="scene-1" className="relative px-6 sm:px-10 lg:px-16 py-16 sm:py-20 border-b border-white/[0.06] overflow-hidden">
          
          <div className="max-w-7xl mx-auto">
            
            {/* Editorial Scene Header & Route Selector */}
            <div className={`flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8 sm:mb-10 reveal-base ${revealedScenes['scene-1'] ? 'reveal-active' : ''}`}>
              <div>
                <div className="text-[11px] font-mono tracking-[0.25em] text-teal-400 uppercase mb-2">
                  01 // ROUTE CHOICE
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                  Two routes. Two very different journeys.
                </h2>
                <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl font-light leading-relaxed">
                  Traditional navigation routes pedestrians through dark shortcuts to save three minutes. SafeRoute balances travel time with street-level safety context.
                </p>
              </div>

              {/* Compact Floating Route Selector */}
              <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-900/90 border border-white/[0.1] backdrop-blur-md shrink-0">
                <button
                  type="button"
                  onClick={() => setHighlightedRoute('safer')}
                  className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    highlightedRoute === 'safer'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.3)] font-bold'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  ★ Route // Safer
                </button>

                <button
                  type="button"
                  onClick={() => setHighlightedRoute('faster')}
                  className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    highlightedRoute === 'faster'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  ⚡ Route // Direct
                </button>
              </div>
            </div>

            {/* Dominant Centered Route Canvas with Spatially Attached Annotations */}
            <div 
              className={`relative w-full aspect-[16/10] sm:aspect-[21/10] max-h-[580px] rounded-2xl overflow-hidden bg-[#070b16] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center justify-center reveal-base ${revealedScenes['scene-1'] ? 'reveal-active' : ''}`}
              style={{ transitionDelay: '150ms' }}
            >
              
              <svg
                className="w-full h-full"
                viewBox="0 0 900 440"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="scene1TealGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="50%" stopColor="#00dfc0" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>

                  <filter id="scene1Filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect width="900" height="440" fill="#070b16" />

                {/* Urban Minor Street Grid */}
                <g stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1">
                  <line x1="40" y1="80" x2="860" y2="80" />
                  <line x1="40" y1="160" x2="860" y2="160" />
                  <line x1="40" y1="240" x2="860" y2="240" />
                  <line x1="40" y1="320" x2="860" y2="320" />
                  <line x1="40" y1="400" x2="860" y2="400" />

                  <line x1="120" y1="20" x2="120" y2="420" />
                  <line x1="260" y1="20" x2="260" y2="420" />
                  <line x1="400" y1="20" x2="400" y2="420" />
                  <line x1="540" y1="20" x2="540" y2="420" />
                  <line x1="680" y1="20" x2="680" y2="420" />
                  <line x1="820" y1="20" x2="820" y2="420" />
                </g>

                {/* Soft Block Massing */}
                <g fill="rgba(15, 23, 42, 0.45)" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5">
                  <rect x="140" y="100" width="100" height="45" rx="3" />
                  <rect x="280" y="100" width="100" height="45" rx="3" />
                  <rect x="420" y="100" width="100" height="45" rx="3" />
                  <rect x="560" y="100" width="100" height="45" rx="3" />
                  <rect x="700" y="100" width="100" height="45" rx="3" />

                  <rect x="140" y="260" width="100" height="45" rx="3" />
                  <rect x="280" y="260" width="100" height="45" rx="3" />
                  <rect x="420" y="260" width="100" height="45" rx="3" />
                  <rect x="560" y="260" width="100" height="45" rx="3" />
                  <rect x="700" y="260" width="100" height="45" rx="3" />
                </g>

                {/* ---------------------------------------------------- */}
                {/* ROUTE 2: DIRECT SHORTCUT (Amber Dashed Corridor)     */}
                {/* ---------------------------------------------------- */}
                <path
                  d="M 120 340 L 280 340 L 460 250 L 640 170 L 780 100"
                  stroke="#f59e0b"
                  strokeWidth={highlightedRoute === 'faster' ? '4' : '2'}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={highlightedRoute === 'faster' ? 1 : 0.25}
                  className={`transition-all duration-500 ${revealedScenes['scene-1'] ? 'animate-draw-line' : ''}`}
                />

                {/* Hazard Nodes & Leader Line along Direct Shortcut */}
                <g opacity={highlightedRoute === 'faster' ? 1 : 0.25} className="transition-opacity duration-500">
                  <circle cx="370" cy="295" r="14" fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="1.2" />
                  <polygon points="370,288 376,300 364,300" fill="#ef4444" />
                  
                  <circle cx="550" cy="210" r="14" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.2" />
                  <polygon points="550,203 556,215 544,215" fill="#f59e0b" />

                  {/* Leader line from hazard to annotation */}
                  {highlightedRoute === 'faster' && (
                    <g stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6">
                      <line x1="370" y1="295" x2="370" y2="340" />
                      <line x1="370" y1="340" x2="430" y2="340" />
                    </g>
                  )}
                </g>

                {/* ---------------------------------------------------- */}
                {/* ROUTE 1: SAFER CORRIDOR (Luminous Glowing Avenue)    */}
                {/* ---------------------------------------------------- */}
                <path
                  d="M 120 340 L 220 180 L 460 180 L 620 240 L 780 100"
                  stroke="url(#scene1TealGrad)"
                  strokeWidth={highlightedRoute === 'safer' ? '4.5' : '2'}
                  filter={highlightedRoute === 'safer' ? 'url(#scene1Filter)' : 'none'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={highlightedRoute === 'safer' ? 1 : 0.25}
                  className={`transition-all duration-500 ${revealedScenes['scene-1'] ? 'animate-draw-line' : ''}`}
                />

                {/* Animated flow packet on Safer Route */}
                {highlightedRoute === 'safer' && (
                  <path
                    d="M 120 340 L 220 180 L 460 180 L 620 240 L 780 100"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="20 140"
                    strokeLinecap="round"
                    className="animate-route-flow"
                    opacity="0.95"
                  />
                )}

                {/* Illumination Beacons & Waypoints along Safer Corridor */}
                <g opacity={highlightedRoute === 'safer' ? 1 : 0.3} className="transition-opacity duration-500">
                  <circle cx="220" cy="180" r="16" fill="#00dfc0" fillOpacity="0.15" />
                  <circle cx="220" cy="180" r="5" fill="#00dfc0" />

                  <circle cx="340" cy="180" r="16" fill="#00dfc0" fillOpacity="0.15" />
                  <circle cx="340" cy="180" r="5" fill="#00dfc0" />

                  {/* Shield Waypoint at (460, 180) */}
                  <circle cx="460" cy="180" r="18" fill="#00dfc0" fillOpacity="0.2" stroke="#00dfc0" strokeWidth="1.5" />
                  <circle cx="460" cy="180" r="10" fill="#0d9488" />
                  <path d="M 457 177 L 460 175 L 463 177 V 181 C 463 183 460 185 460 185 C 460 185 457 183 457 181 Z" fill="#ffffff" />

                  {/* Leader line from safer corridor to annotation */}
                  {highlightedRoute === 'safer' && (
                    <g stroke="#00dfc0" strokeWidth="1" strokeDasharray="3 3" opacity="0.6">
                      <line x1="340" y1="180" x2="340" y2="120" />
                      <line x1="340" y1="120" x2="390" y2="120" />
                    </g>
                  )}
                </g>

                {/* Origin Point */}
                <circle cx="120" cy="340" r="22" stroke="#38bdf8" strokeWidth="1" opacity="0.4" className="animate-beacon-wave" />
                <circle cx="120" cy="340" r="8" fill="#0284c7" />
                <circle cx="120" cy="340" r="3.5" fill="#ffffff" />
                <text x="95" y="375" fill="#94a3b8" fontSize="10" fontFamily="monospace">ORIGIN // 40.7128° N</text>

                {/* Destination Point */}
                <circle cx="780" cy="100" r="18" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                <circle cx="780" cy="100" r="7" fill="#f59e0b" />
                <text x="730" y="80" fill="#f59e0b" fontSize="10" fontFamily="monospace">DESTINATION // CIVIC CENTER</text>
              </svg>

              {/* Spatial Annotation Floating HUDs directly attached to canvas */}
              {highlightedRoute === 'safer' ? (
                <>
                  {/* Top-Center Attached Annotation */}
                  <div 
                    className={`absolute top-[16%] left-[42%] -translate-y-1/2 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-teal-500/40 backdrop-blur-md shadow-xl text-left pointer-events-none max-w-[240px] reveal-base ${revealedScenes['scene-1'] ? 'reveal-active' : ''}`}
                    style={{ transitionDelay: '350ms' }}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-teal-300 font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>DEMO: ~18 MIN WALK</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">Broad Commercial Avenue</div>
                    <div className="text-[10px] text-slate-300/80 mt-0.5">Continuous streetlamps &amp; open storefronts</div>
                  </div>

                  {/* Right Shield Waypoint Annotation */}
                  <div 
                    className={`absolute bottom-[22%] right-[22%] p-2 rounded-lg bg-slate-900/90 border border-teal-500/30 backdrop-blur-md text-left pointer-events-none hidden sm:block reveal-base ${revealedScenes['scene-1'] ? 'reveal-active' : ''}`}
                    style={{ transitionDelay: '450ms' }}
                  >
                    <div className="text-[10px] font-mono text-teal-400 font-bold">CIVIC PLAZA WAYPOINT</div>
                    <div className="text-[10px] text-slate-400">Zero reported hazard flags • Well populated</div>
                  </div>
                </>
              ) : (
                <>
                  {/* Lower-Center Attached Annotation */}
                  <div 
                    className={`absolute bottom-[18%] left-[46%] -translate-y-1/2 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 backdrop-blur-md shadow-xl text-left pointer-events-none max-w-[240px] reveal-base ${revealedScenes['scene-1'] ? 'reveal-active' : ''}`}
                    style={{ transitionDelay: '350ms' }}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300 font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>DEMO: ~12 MIN WALK (-6 MIN)</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">Direct Rear Alleyway</div>
                    <div className="text-[10px] text-slate-300/80 mt-0.5">Unlit passage • 2 Caution flags logged</div>
                  </div>
                </>
              )}

              {/* Bottom Telemetry Passage Ribbon */}
              <div className="absolute bottom-3 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-white/[0.08] text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-teal-400 font-bold">WAYPOINT TRANSIT:</span>
                  <span>Origin</span>
                  <span>→</span>
                  <span>{highlightedRoute === 'safer' ? 'Market Ave Boulevard' : 'Dark Rear Alley'}</span>
                  <span>→</span>
                  <span>{highlightedRoute === 'safer' ? 'Civic Plaza' : 'Low-Light Underpass'}</span>
                  <span>→</span>
                  <span>Destination</span>
                </div>
                <div className="text-slate-500">
                  DEMO VISUALIZATION // ILLUSTRATIVE ATTRIBUTES
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ================================================================= */}
        {/* CONTINUOUS ROUTE CONNECTOR: SCENE 01 → SCENE 02 (INTELLIGENCE)    */}
        {/* ================================================================= */}
        <div className="relative w-full h-24 sm:h-32 flex items-center justify-center overflow-hidden pointer-events-none -my-6 sm:-my-8 z-20">
          <svg className="w-full max-w-5xl h-full" viewBox="0 0 600 120" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connectorS1ToS2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#00dfc0" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path d="M 300 0 L 300 120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <path
              d="M 300 0 C 300 50, 300 70, 300 120"
              stroke="url(#connectorS1ToS2)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 8px rgba(0,223,192,0.6))"
            />
            <path
              d="M 300 0 L 300 120"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-connector-flow"
              opacity="0.9"
            />
            <circle cx="300" cy="60" r="4.5" fill="#38bdf8" className="animate-tracer-pulse" />
          </svg>
          <div className="absolute font-mono text-[9px] tracking-[0.25em] text-teal-400/80 uppercase bg-[#070b16]/90 px-2.5 py-1 rounded-full border border-teal-500/30 backdrop-blur-md">
            ROUTE → GIS GRID FEED
          </div>
        </div>

        {/* ================================================================= */}
        {/* SCENE 02: SAFETY INTELLIGENCE (GIS MULTI-LAYER CENTERPIECE)       */}
        {/* ================================================================= */}
        <section id="scene-2" className="relative px-6 sm:px-10 lg:px-16 py-16 sm:py-20 border-b border-white/[0.06] overflow-hidden">
          
          <div className="max-w-7xl mx-auto">
            
            {/* Editorial Scene Header */}
            <div className={`text-center max-w-3xl mx-auto mb-8 sm:mb-10 reveal-base ${revealedScenes['scene-2'] ? 'reveal-active' : ''}`}>
              <div className="text-[11px] font-mono tracking-[0.25em] text-teal-400 uppercase mb-2">
                02 // SAFETY INTELLIGENCE
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                The safety factors traditional maps miss.
              </h2>
              <p className="mt-2 text-slate-400 text-sm sm:text-base font-light leading-relaxed">
                SafeRoute evaluates multi-layer physical street conditions rather than simple road geometry.
              </p>
            </div>

            {/* Compact Floating Layer Selectors (Centered Row of Tabs) */}
            <div 
              className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 reveal-base ${revealedScenes['scene-2'] ? 'reveal-active' : ''}`}
              style={{ transitionDelay: '150ms' }}
            >
              {[
                { id: 'lighting', icon: '☀', label: 'Street Illumination' },
                { id: 'activity', icon: '🚶', label: 'Pedestrian Activity' },
                { id: 'infrastructure', icon: '🛡', label: 'Safety Infrastructure' },
                { id: 'hazards', icon: '⚠', label: 'Community Hazards' }
              ].map((layer) => {
                const isActive = activeLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setActiveLayer(layer.id as 'lighting' | 'activity' | 'infrastructure' | 'hazards')}
                    className={`px-4 py-2.5 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-2 border ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.25)] font-bold'
                        : 'bg-slate-900/80 text-slate-400 border-white/[0.08] hover:text-white hover:border-white/[0.15]'
                    }`}
                  >
                    <span>{layer.icon}</span>
                    <span>{layer.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Centerpiece Dominant GIS Vector Visualization Canvas */}
            <div 
              className={`relative w-full max-w-5xl mx-auto aspect-[16/10] sm:aspect-[2/1] max-h-[520px] rounded-2xl overflow-hidden bg-[#070b16] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center justify-center reveal-base ${revealedScenes['scene-2'] ? 'reveal-active' : ''}`}
              style={{ transitionDelay: '250ms' }}
            >
              
              <svg
                className="w-full h-full"
                viewBox="0 0 800 420"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="gisLampGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#d97706" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#070b16" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="gisPedestrianPulse" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#00dfc0" stopOpacity="0.5" />
                    <stop offset="60%" stopColor="#0d9488" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#070b16" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect width="800" height="420" fill="#070b16" />

                {/* Urban Minor Street Grid */}
                <g stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1">
                  <line x1="40" y1="80" x2="760" y2="80" />
                  <line x1="40" y1="160" x2="760" y2="160" />
                  <line x1="40" y1="240" x2="760" y2="240" />
                  <line x1="40" y1="320" x2="760" y2="320" />
                  <line x1="40" y1="400" x2="760" y2="400" />

                  <line x1="120" y1="20" x2="120" y2="400" />
                  <line x1="280" y1="20" x2="280" y2="400" />
                  <line x1="440" y1="20" x2="440" y2="400" />
                  <line x1="600" y1="20" x2="600" y2="400" />
                  <line x1="720" y1="20" x2="720" y2="400" />
                </g>

                {/* Major Arterial Boulevards */}
                <line x1="40" y1="200" x2="760" y2="200" stroke="#f59e0b" strokeWidth="2" opacity="0.3" />
                <line x1="360" y1="20" x2="360" y2="400" stroke="#f59e0b" strokeWidth="2" opacity="0.3" />

                {/* LAYER 01: STREET ILLUMINATION */}
                {activeLayer === 'lighting' && (
                  <g className="animate-fade-in">
                    <circle cx="120" cy="200" r="55" fill="url(#gisLampGlow)" />
                    <circle cx="280" cy="200" r="55" fill="url(#gisLampGlow)" />
                    <circle cx="440" cy="200" r="55" fill="url(#gisLampGlow)" />
                    <circle cx="600" cy="200" r="55" fill="url(#gisLampGlow)" />
                    <circle cx="360" cy="100" r="50" fill="url(#gisLampGlow)" />
                    <circle cx="360" cy="300" r="50" fill="url(#gisLampGlow)" />

                    <circle cx="120" cy="200" r="4" fill="#fbbf24" />
                    <circle cx="280" cy="200" r="4" fill="#fbbf24" />
                    <circle cx="440" cy="200" r="4" fill="#fbbf24" />
                    <circle cx="600" cy="200" r="4" fill="#fbbf24" />
                    <circle cx="360" cy="100" r="4" fill="#fbbf24" />
                    <circle cx="360" cy="300" r="4" fill="#fbbf24" />

                    {/* Leader Line to Annotation */}
                    <line x1="440" y1="200" x2="440" y2="130" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                  </g>
                )}

                {/* LAYER 02: PEDESTRIAN ACTIVITY */}
                {activeLayer === 'activity' && (
                  <g className="animate-fade-in">
                    <circle cx="280" cy="200" r="65" fill="url(#gisPedestrianPulse)" className="animate-pulse" />
                    <circle cx="360" cy="200" r="75" fill="url(#gisPedestrianPulse)" className="animate-pulse" />
                    <circle cx="440" cy="200" r="65" fill="url(#gisPedestrianPulse)" className="animate-pulse" />

                    <rect x="255" y="175" width="10" height="10" fill="#00dfc0" rx="2" />
                    <rect x="335" y="175" width="10" height="10" fill="#00dfc0" rx="2" />
                    <rect x="415" y="175" width="10" height="10" fill="#00dfc0" rx="2" />

                    {/* Leader Line to Annotation */}
                    <line x1="360" y1="200" x2="360" y2="130" stroke="#00dfc0" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                  </g>
                )}

                {/* LAYER 03: SAFETY INFRASTRUCTURE */}
                {activeLayer === 'infrastructure' && (
                  <g className="animate-fade-in">
                    <circle cx="280" cy="120" r="26" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" className="animate-beacon-wave" />
                    <circle cx="280" cy="120" r="8" fill="#0284c7" />

                    <circle cx="520" cy="280" r="26" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" className="animate-beacon-wave" />
                    <circle cx="520" cy="280" r="8" fill="#0284c7" />

                    {/* Leader Line to Annotation */}
                    <line x1="280" y1="120" x2="280" y2="60" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                  </g>
                )}

                {/* LAYER 04: COMMUNITY HAZARDS */}
                {activeLayer === 'hazards' && (
                  <g className="animate-fade-in">
                    <circle cx="200" cy="290" r="38" fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
                    <circle cx="200" cy="290" r="6" fill="#ef4444" />

                    <circle cx="520" cy="110" r="35" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
                    <circle cx="520" cy="110" r="6" fill="#f59e0b" />

                    {/* Leader Line to Annotation */}
                    <line x1="200" y1="290" x2="200" y2="350" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                  </g>
                )}
              </svg>

              {/* Dynamic Spatial Annotation Pill directly attached to the canvas */}
              {activeLayer === 'lighting' && (
                <div 
                  className={`absolute top-[18%] left-[56%] -translate-x-1/2 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 backdrop-blur-md shadow-xl text-left pointer-events-none max-w-[280px] reveal-base ${revealedScenes['scene-2'] ? 'reveal-active' : ''}`}
                  style={{ transitionDelay: '350ms' }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300 font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>STREET ILLUMINATION LAYER</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Commercial Corridor Light Cones</div>
                  <div className="text-[10px] text-slate-300/80 mt-0.5">Evaluates operational streetlamps &amp; lit storefronts</div>
                </div>
              )}

              {activeLayer === 'activity' && (
                <div 
                  className={`absolute top-[18%] left-[46%] -translate-x-1/2 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-teal-500/40 backdrop-blur-md shadow-xl text-left pointer-events-none max-w-[280px] reveal-base ${revealedScenes['scene-2'] ? 'reveal-active' : ''}`}
                  style={{ transitionDelay: '350ms' }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-teal-300 font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span>PEDESTRIAN ACTIVITY LAYER</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Active Evening Foot Traffic</div>
                  <div className="text-[10px] text-slate-300/80 mt-0.5">Favors populated streets with open late-night storefronts</div>
                </div>
              )}

              {activeLayer === 'infrastructure' && (
                <div 
                  className={`absolute top-[12%] left-[36%] -translate-x-1/2 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-sky-500/40 backdrop-blur-md shadow-xl text-left pointer-events-none max-w-[280px] reveal-base ${revealedScenes['scene-2'] ? 'reveal-active' : ''}`}
                  style={{ transitionDelay: '350ms' }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-sky-300 font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>SAFETY INFRASTRUCTURE LAYER</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Metro Entrance &amp; Civic Kiosks</div>
                  <div className="text-[10px] text-slate-300/80 mt-0.5">Routes near well-lit transit nodes and emergency callboxes</div>
                </div>
              )}

              {activeLayer === 'hazards' && (
                <div 
                  className={`absolute bottom-[16%] left-[26%] -translate-x-1/2 p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-rose-500/40 backdrop-blur-md shadow-xl text-left pointer-events-none max-w-[280px] reveal-base ${revealedScenes['scene-2'] ? 'reveal-active' : ''}`}
                  style={{ transitionDelay: '350ms' }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-300 font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>COMMUNITY HAZARDS LAYER</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">Dynamic Avoidance Buffers</div>
                  <div className="text-[10px] text-slate-300/80 mt-0.5">Routes around pedestrian-flagged outages and blocked sidewalks</div>
                </div>
              )}

              {/* Bottom Footnote */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/[0.06]">
                <span>CONCEPTUAL SAFETY LAYERS // DESIGN INTENT FOR SAFE TRANSIT EVALUATION</span>
                <span className="text-teal-400">DEMO MODEL</span>
              </div>

            </div>

          </div>
        </section>

        {/* ================================================================= */}
        {/* CONTINUOUS ROUTE CONNECTOR: SCENE 02 → SCENE 03 (COMMUNITY RADAR) */}
        {/* ================================================================= */}
        <div className="relative w-full h-24 sm:h-32 flex items-center justify-center overflow-hidden pointer-events-none -my-6 sm:-my-8 z-20">
          <svg className="w-full max-w-5xl h-full" viewBox="0 0 600 120" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connectorS2ToS3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00dfc0" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#14b8a6" stopOpacity="1" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d="M 240 0 C 260 60, 280 90, 300 120" stroke="rgba(20,184,166,0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 360 0 C 340 60, 320 90, 300 120" stroke="rgba(20,184,166,0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <path
              d="M 300 0 L 300 120"
              stroke="url(#connectorS2ToS3)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 8px rgba(20,184,166,0.6))"
            />
            <path
              d="M 300 0 L 300 120"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-connector-flow"
              opacity="0.9"
            />
            <circle cx="300" cy="60" r="4.5" fill="#2dd4bf" className="animate-tracer-pulse" />
          </svg>
          <div className="absolute font-mono text-[9px] tracking-[0.25em] text-teal-400/80 uppercase bg-[#070b16]/90 px-2.5 py-1 rounded-full border border-teal-500/30 backdrop-blur-md">
            GRID // RADAR CONVERGENCE
          </div>
        </div>

        {/* ================================================================= */}
        {/* SCENE 03: COMMUNITY SIGNALS (ENLARGED RADAR & SPATIAL CALLOUT)    */}
        {/* ================================================================= */}
        <section id="scene-3" className="relative px-6 sm:px-10 lg:px-16 py-16 sm:py-20 border-b border-white/[0.06] overflow-hidden">
          
          <div className="max-w-7xl mx-auto">
            
            {/* Editorial Scene Header */}
            <div className={`text-center max-w-3xl mx-auto mb-8 sm:mb-10 reveal-base ${revealedScenes['scene-3'] ? 'reveal-active' : ''}`}>
              <div className="text-[11px] font-mono tracking-[0.25em] text-teal-400 uppercase mb-2">
                03 // COMMUNITY SIGNALS
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                Local awareness, reported by pedestrians.
              </h2>
              <p className="mt-2 text-slate-400 text-sm sm:text-base font-light leading-relaxed">
                When someone reports a streetlamp outage or hazard, that context helps other walkers make informed route choices after dark.
              </p>
            </div>

            {/* Enlarged Radar Canvas with Spatially Connected Annotation */}
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
              
              <div 
                className={`relative w-full max-w-[480px] sm:max-w-[520px] aspect-square rounded-full bg-[#070b16] border border-teal-500/30 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(45,212,191,0.08)] flex items-center justify-center p-4 reveal-base ${revealedScenes['scene-3'] ? 'reveal-active' : ''}`}
                style={{ transitionDelay: '150ms' }}
              >
                
                <svg
                  className="w-full h-full"
                  viewBox="0 0 440 440"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="scene3RadarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00dfc0" stopOpacity="0.32" />
                      <stop offset="50%" stopColor="#0d9488" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#070b16" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Concentric Radar Rings */}
                  <circle cx="220" cy="220" r="185" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="1" />
                  <circle cx="220" cy="220" r="125" stroke="rgba(20, 184, 166, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="220" cy="220" r="65" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1" />

                  {/* Azimuth Crosshairs */}
                  <line x1="220" y1="25" x2="220" y2="415" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="1" />
                  <line x1="25" y1="220" x2="415" y2="220" stroke="rgba(20, 184, 166, 0.15)" strokeWidth="1" />

                  {/* Rotating Radar Sweep Beam */}
                  <g className={`origin-center ${revealedScenes['scene-3'] ? 'animate-radar-sweep' : 'opacity-20'}`}>
                    <path
                      d="M 220 220 L 220 35 A 185 185 0 0 1 350 90 Z"
                      fill="url(#scene3RadarSweep)"
                    />
                    <line x1="220" y1="220" x2="220" y2="35" stroke="#00dfc0" strokeWidth="1.5" opacity="0.75" />
                  </g>

                  {/* Center Location Dot */}
                  <circle cx="220" cy="220" r="16" stroke="#38bdf8" strokeWidth="1" opacity="0.5" className="animate-beacon-wave" />
                  <circle cx="220" cy="220" r="5" fill="#38bdf8" />

                  {/* Signal 1 (Amber, Low Illumination) at (170, 140) */}
                  <g className="cursor-pointer" onClick={() => setActiveSignal(1)}>
                    <circle cx="170" cy="140" r="15" fill="#f59e0b" fillOpacity={activeSignal === 1 ? '0.35' : '0.15'} stroke="#f59e0b" strokeWidth="1.2" />
                    <circle cx="170" cy="140" r="5" fill="#f59e0b" />
                    {activeSignal === 1 && <circle cx="170" cy="140" r="22" stroke="#f59e0b" strokeWidth="1" opacity="0.5" className="animate-beacon-wave" style={{ animationDelay: '0s' }} />}
                  </g>

                  {/* Signal 2 (Coral, Caution Advisory) at (320, 300) */}
                  <g className="cursor-pointer" onClick={() => setActiveSignal(2)}>
                    <circle cx="320" cy="300" r="15" fill="#fb923c" fillOpacity={activeSignal === 2 ? '0.35' : '0.15'} stroke="#fb923c" strokeWidth="1.2" />
                    <circle cx="320" cy="300" r="5" fill="#fb923c" />
                    {activeSignal === 2 && <circle cx="320" cy="300" r="22" stroke="#fb923c" strokeWidth="1" opacity="0.5" className="animate-beacon-wave" style={{ animationDelay: '0.7s' }} />}
                  </g>

                  {/* Signal 3 (Cyan, Obstruction) at (130, 290) */}
                  <g className="cursor-pointer" onClick={() => setActiveSignal(3)}>
                    <circle cx="130" cy="290" r="15" fill="#38bdf8" fillOpacity={activeSignal === 3 ? '0.35' : '0.15'} stroke="#38bdf8" strokeWidth="1.2" />
                    <circle cx="130" cy="290" r="5" fill="#38bdf8" />
                    {activeSignal === 3 && <circle cx="130" cy="290" r="22" stroke="#38bdf8" strokeWidth="1" opacity="0.5" className="animate-beacon-wave" style={{ animationDelay: '1.4s' }} />}
                  </g>

                  {/* Signal 4 (Rose, Low Visibility) at (300, 110) */}
                  <g className="cursor-pointer" onClick={() => setActiveSignal(4)}>
                    <circle cx="300" cy="110" r="15" fill="#f43f5e" fillOpacity={activeSignal === 4 ? '0.35' : '0.15'} stroke="#f43f5e" strokeWidth="1.2" />
                    <circle cx="300" cy="110" r="5" fill="#f43f5e" />
                    {activeSignal === 4 && <circle cx="300" cy="110" r="22" stroke="#f43f5e" strokeWidth="1" opacity="0.5" className="animate-beacon-wave" style={{ animationDelay: '2.1s' }} />}
                  </g>
                </svg>

                {/* Compass Markers */}
                <div className="absolute top-2 font-mono text-[9px] text-teal-400 font-bold">N</div>
                <div className="absolute bottom-2 font-mono text-[9px] text-slate-500">S</div>
                <div className="absolute left-2 font-mono text-[9px] text-slate-500">W</div>
                <div className="absolute right-2 font-mono text-[9px] text-slate-500">E</div>

                {/* Center Range Tag */}
                <div className="absolute bottom-16 font-mono text-[9px] tracking-wider text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-white/[0.06]">
                  500m RADAR
                </div>

                {/* Attached Lightweight Spatial Callout for Active Signal */}
                {(() => {
                  const current = signals.find((s) => s.id === activeSignal) || signals[0];
                  return (
                    <div 
                      className={`absolute top-4 sm:top-6 right-2 sm:-right-8 p-3 sm:p-4 rounded-xl bg-slate-900/95 border border-white/[0.12] backdrop-blur-xl shadow-2xl text-left max-w-[240px] sm:max-w-[270px] z-10 reveal-base ${revealedScenes['scene-3'] ? 'reveal-active' : ''}`}
                      style={{ transitionDelay: '300ms' }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-teal-400 font-bold">
                          <span className={`w-2 h-2 rounded-full ${
                            current.color === 'amber' ? 'bg-amber-400' :
                            current.color === 'coral' ? 'bg-orange-400' :
                            current.color === 'cyan' ? 'bg-cyan-400' : 'bg-rose-500'
                          } animate-pulse`} />
                          <span>SIGNAL // 0{current.id}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300">
                          {current.status}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white mt-1">{current.title}</div>
                      <div className="text-[10px] font-mono text-teal-400/90 mt-0.5">{current.location}</div>
                      <p className="text-[11px] text-slate-300/80 font-light mt-1 leading-snug">{current.detail}</p>
                      <div className="pt-2 mt-2 border-t border-white/[0.06] text-[9px] font-mono text-slate-400 flex items-center justify-between">
                        <span>{current.coords}</span>
                        <span className="text-teal-400">AVOIDANCE APPLIED</span>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Compact Signal Selector Pills + Action Row */}
              <div 
                className={`mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 reveal-base ${revealedScenes['scene-3'] ? 'reveal-active' : ''}`}
                style={{ transitionDelay: '400ms' }}
              >
                {signals.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSignal(s.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                      activeSignal === s.id
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold shadow-[0_0_12px_rgba(20,184,166,0.2)]'
                        : 'bg-slate-900/60 text-slate-400 border-white/[0.06] hover:text-white'
                    }`}
                  >
                    Signal 0{s.id}: {s.title.split(' ')[0]}
                  </button>
                ))}

                <Link href="/report" className="ml-2">
                  <button className="bg-slate-100 hover:bg-white text-slate-950 px-4 py-1.5 rounded-full font-bold text-xs tracking-wide transition hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap">
                    Report an incident →
                  </button>
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* ================================================================= */}
        {/* CONTINUOUS ROUTE CONNECTOR: SCENE 03 → SCENE 04 (EMERGENCY SOS)   */}
        {/* ================================================================= */}
        <div className="relative w-full h-24 sm:h-32 flex items-center justify-center overflow-hidden pointer-events-none -my-6 sm:-my-8 z-20">
          <svg className="w-full max-w-5xl h-full" viewBox="0 0 600 120" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connectorS3ToS4" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#f97316" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle cx="300" cy="120" r="90" stroke="rgba(244,63,94,0.12)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="300" cy="120" r="50" stroke="rgba(244,63,94,0.18)" strokeWidth="1" />
            <path
              d="M 300 0 L 300 120"
              stroke="url(#connectorS3ToS4)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 10px rgba(244,63,94,0.7))"
            />
            <path
              d="M 300 0 L 300 120"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-connector-flow"
              opacity="0.9"
            />
            <circle cx="300" cy="60" r="4.5" fill="#f43f5e" className="animate-tracer-pulse" />
          </svg>
          <div className="absolute font-mono text-[9px] tracking-[0.25em] text-rose-400 uppercase bg-[#070b16]/90 px-2.5 py-1 rounded-full border border-rose-500/30 backdrop-blur-md shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            INCIDENT PROXIMITY // SOS CORRIDOR
          </div>
        </div>

        {/* ================================================================= */}
        {/* SCENE 04: EMERGENCY RESPONSE (SCULPTURAL HUD & PROCESS TIMELINE)  */}
        {/* ================================================================= */}
        <section id="scene-4" className="relative px-6 sm:px-10 lg:px-16 py-16 sm:py-20 border-b border-white/[0.06] overflow-hidden">
          
          {/* Subtle Emergency Radial Ambient Veil */}
          <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_50%_50%,rgba(225,29,72,0.06),transparent_70%)]" />

          <div className="max-w-7xl mx-auto">
            
            {/* Editorial Scene Header */}
            <div className={`text-center max-w-3xl mx-auto mb-8 sm:mb-10 reveal-base ${revealedScenes['scene-4'] ? 'reveal-active' : ''}`}>
              <div className="text-[11px] font-mono tracking-[0.25em] text-rose-400 uppercase mb-2">
                04 // EMERGENCY RESPONSE
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                Protection when seconds count.
              </h2>
              <p className="mt-2 text-slate-400 text-sm sm:text-base font-light leading-relaxed">
                SafeRoute includes a 5-second cancelable countdown to prevent false alarms, with an instant override when urgency is critical.
              </p>
            </div>

            {/* Centerpiece: Sculptural Emergency HUD & Countdown Simulation */}
            <div 
              className={`w-full max-w-lg mx-auto flex flex-col items-center reveal-base ${revealedScenes['scene-4'] ? 'reveal-active' : ''}`}
              style={{ transitionDelay: '150ms' }}
            >
              
              <div className="w-full rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/25 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
                
                <div className="text-xs font-mono text-rose-400 tracking-widest uppercase mb-4 flex items-center justify-between w-full">
                  <span>SOS UI SIMULATION</span>
                  <span className="text-slate-400">5.00 SEC GRACE</span>
                </div>

                {/* Circular Countdown Dial with Pulsing Halos */}
                <div className="my-3 relative flex items-center justify-center">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-rose-500/40 flex flex-col items-center justify-center relative shadow-[0_0_40px_rgba(225,29,72,0.25)]">
                    <div className="absolute inset-0 rounded-full border border-rose-500/50 animate-ping opacity-20" />
                    <div className="text-5xl sm:text-6xl font-black font-mono text-rose-500 drop-shadow-[0_0_20px_rgba(225,29,72,0.8)] tabular-nums">
                      {countdown.toFixed(1)}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                      SECONDS
                    </div>
                  </div>
                </div>

                {/* Trigger Button opening real existing SOSModal */}
                <div className="mt-4 w-full flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setIsSOSOpen(true)}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Initiate SOS Simulation</span>
                    <span>→</span>
                  </button>
                  <div className="text-[10px] font-mono text-slate-500 mt-2 text-center">
                    * SafeRoute prototype simulation. In this demo, alerts are demonstrated in-browser.
                  </div>
                </div>

              </div>

            </div>

            {/* Visual Process Timeline: TRIGGER → 5 SEC GRACE → LOCATION ATTACHED → ALERT */}
            <div 
              className={`mt-10 sm:mt-12 max-w-5xl mx-auto reveal-base ${revealedScenes['scene-4'] ? 'reveal-active' : ''}`}
              style={{ transitionDelay: '300ms' }}
            >
              
              <div className="relative">
                
                {/* Horizontal Connecting Guide Line */}
                <div className="hidden md:block absolute top-4 left-[10%] right-[10%] h-px bg-gradient-to-r from-rose-500/40 via-rose-500/60 to-rose-500/40" />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4">
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-rose-950 border border-rose-500/60 text-rose-400 font-mono text-xs font-bold flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                      01
                    </div>
                    <div className="font-mono text-xs text-white font-bold tracking-wider uppercase">
                      TRIGGER
                    </div>
                    <p className="text-[11px] text-slate-400 font-light mt-1 max-w-[180px] leading-relaxed">
                      Emergency button pressed via in-app red SOS action or lock screen.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-rose-600 border border-rose-400 text-white font-mono text-xs font-bold flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulse">
                      02
                    </div>
                    <div className="font-mono text-xs text-rose-400 font-bold tracking-wider uppercase">
                      5 SEC GRACE
                    </div>
                    <p className="text-[11px] text-slate-400 font-light mt-1 max-w-[180px] leading-relaxed">
                      Audible &amp; visual countdown provides an instant window to cancel false alarms.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-rose-950 border border-rose-500/60 text-rose-400 font-mono text-xs font-bold flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                      03
                    </div>
                    <div className="font-mono text-xs text-white font-bold tracking-wider uppercase">
                      LOCATION ATTACHED
                    </div>
                    <p className="text-[11px] text-slate-400 font-light mt-1 max-w-[180px] leading-relaxed">
                      High-accuracy GPS coordinates (40.7128° N, 74.0060° W) packaged from device.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-rose-950 border border-rose-500/60 text-rose-400 font-mono text-xs font-bold flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                      04
                    </div>
                    <div className="font-mono text-xs text-white font-bold tracking-wider uppercase">
                      ALERT BROADCAST
                    </div>
                    <p className="text-[11px] text-slate-400 font-light mt-1 max-w-[180px] leading-relaxed">
                      Beacon dispatched to designated emergency contacts with route context.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ================================================================= */}
        {/* CONTINUOUS ROUTE CONNECTOR: SCENE 04 → SCENE 05 (DESTINATION)     */}
        {/* ================================================================= */}
        <div className="relative w-full h-24 sm:h-32 flex items-center justify-center overflow-hidden pointer-events-none -my-6 sm:-my-8 z-20">
          <svg className="w-full max-w-5xl h-full" viewBox="0 0 600 120" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="connectorS4ToS5" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#0d9488" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00dfc0" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M 300 0 L 300 120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <path
              d="M 300 0 L 300 120"
              stroke="url(#connectorS4ToS5)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 10px rgba(0,223,192,0.7))"
            />
            <path
              d="M 300 0 L 300 120"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-connector-flow"
              opacity="0.9"
            />
            <circle cx="300" cy="60" r="4.5" fill="#00dfc0" className="animate-tracer-pulse" />
          </svg>
          <div className="absolute font-mono text-[9px] tracking-[0.25em] text-teal-400 uppercase bg-[#070b16]/90 px-2.5 py-1 rounded-full border border-teal-500/30 backdrop-blur-md shadow-[0_0_12px_rgba(0,223,192,0.3)]">
            EMERGENCY RESOLVED // SAFE DESTINATION
          </div>
        </div>

        {/* ================================================================= */}
        {/* SCENE 05: EXPLORE SAFEROUTE (NOCTURNAL NAVIGATION HORIZON)        */}
        {/* ================================================================= */}
        <section id="scene-5" className="relative px-6 sm:px-10 lg:px-16 py-28 sm:py-36 overflow-hidden text-center flex flex-col items-center">
          
          {/* Nocturnal Horizon Canvas Perspective Grid */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-t from-teal-500/10 via-cyan-500/5 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

          {/* Converging Cartographic Perspective Lines */}
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-15 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full max-w-6xl" viewBox="0 0 1000 400" fill="none">
              <path d="M 100 400 L 500 150 L 900 400" stroke="#00dfc0" strokeWidth="1" />
              <path d="M 250 400 L 500 150 L 750 400" stroke="#00dfc0" strokeWidth="1" />
              <path d="M 400 400 L 500 150 L 600 400" stroke="#00dfc0" strokeWidth="1" />
              <line x1="100" y1="350" x2="900" y2="350" stroke="#00dfc0" strokeWidth="0.8" />
              <line x1="250" y1="280" x2="750" y2="280" stroke="#00dfc0" strokeWidth="0.8" />
              <line x1="380" y1="200" x2="620" y2="200" stroke="#00dfc0" strokeWidth="0.8" />
            </svg>
          </div>

          <div 
            className={`max-w-4xl mx-auto space-y-8 relative z-10 reveal-base ${revealedScenes['scene-5'] ? 'reveal-active' : ''}`}
            style={{ transitionDelay: '150ms' }}
          >
            
            <div className="text-[11px] font-mono tracking-[0.3em] text-teal-400 uppercase">
              05 // SAFE TRANSIT
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.05]">
              Navigate your city<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-teal-400 to-cyan-300 drop-shadow-[0_0_35px_rgba(20,184,166,0.6)]">
                with confidence.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
              Explore safety-aware pedestrian navigation, live route comparisons, and community incident reporting in the SafeRoute application.
            </p>

            {/* Interactive Destination Search Mockup */}
            <div className="max-w-xl mx-auto p-2 rounded-full bg-slate-900/90 border border-white/[0.12] backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 pl-4 text-slate-400 text-sm font-light">
                <svg className="w-5 h-5 text-teal-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span className="truncate">Where would you like to walk tonight?</span>
              </div>
              <Link href="/map">
                <button className="bg-teal-400 hover:bg-teal-300 text-slate-950 px-6 py-3 rounded-full font-bold text-sm tracking-wide transition hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap">
                  Find Safe Routes →
                </button>
              </Link>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/map">
                <button className="bg-teal-400 hover:bg-teal-300 text-slate-950 px-9 py-4 rounded-full font-bold text-base tracking-wide shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer">
                  <span>Explore the Interactive Map</span>
                  <span>→</span>
                </button>
              </Link>

              <Link href="/report">
                <button className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white px-7 py-4 rounded-full font-medium text-base border border-slate-700/80 backdrop-blur-md transition-all hover:border-slate-500 cursor-pointer">
                  <span>Report an Incident</span>
                </button>
              </Link>
            </div>

            <div className="text-[11px] font-mono text-slate-500 pt-4">
              SafeRoute Prototype // Designed for Hackathon Demonstration
            </div>

          </div>

        </section>

      </main>

      {/* =================================================================== */}
      {/* MINIMAL EDITORIAL FOOTER                                            */}
      {/* =================================================================== */}
      <footer className="border-t border-white/[0.06] bg-[#02050b] py-10 px-6 sm:px-10 lg:px-16 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-widest">SAFEROUTE</span>
            <span className="text-slate-700">{"//"}</span>
            <span className="text-slate-400">PEDESTRIAN SAFETY &amp; NAVIGATION INTELLIGENCE</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/map" className="hover:text-teal-400 transition-colors">MAP</Link>
            <Link href="/report" className="hover:text-teal-400 transition-colors">REPORT</Link>
            <Link href="/login" className="hover:text-teal-400 transition-colors">LOG IN</Link>
            <Link href="/register" className="hover:text-teal-400 transition-colors">REGISTER</Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} SAFEROUTE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

      {/* Reused Existing SOS Modal Component Trigger */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />

    </div>
  );
}
