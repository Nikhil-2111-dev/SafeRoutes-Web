'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signIn } from 'aws-amplify/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { syncProfile } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      
      if (isSignedIn) {
        setSuccess('Sign In Successful! Redirecting to map...');
        setError('');
        await syncProfile();
        setTimeout(() => {
          router.push('/map');
        }, 800);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const errorObj = err as Error;
      if (errorObj?.message?.includes('Invalid user pool id')) {
        setError("AWS Cognito is not deployed yet! Please run 'npx cdk deploy' in the infrastructure folder and check your .env.local");
      } else {
        setError(errorObj?.message || 'Error signing in');
      }
    }
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#020713] text-slate-100 relative overflow-x-hidden py-6 sm:py-10 lg:py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center font-sans">
      {/* Inline styles for subtle cinematic beacon animations */}
      <style>{`
        @keyframes beaconPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes signalPulseTransit {
          from { stroke-dashoffset: 240; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes signalNodeBreathe {
          0%, 100% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes entryBeaconHalo {
          0%, 100% { box-shadow: 0 0 15px rgba(0, 223, 192, 0.25); }
          50% { box-shadow: 0 0 25px rgba(0, 223, 192, 0.5); }
        }
        .anim-beacon-pulse {
          animation: beaconPulse 4s ease-in-out infinite;
          transform-origin: 320px 450px;
        }
        .anim-radar-sweep {
          animation: radarSweep 22s linear infinite;
          transform-origin: 320px 450px;
        }
        .anim-signal-transit {
          animation: signalPulseTransit 5s linear infinite;
        }
        .anim-signal-node {
          animation: signalNodeBreathe 4s ease-in-out infinite;
        }
        .anim-signal-node-delayed {
          animation: signalNodeBreathe 4.5s ease-in-out infinite 1.8s;
        }
        .anim-beacon-glow {
          animation: entryBeaconHalo 3s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .anim-beacon-pulse, .anim-radar-sweep, .anim-signal-transit, .anim-signal-node, .anim-signal-node-delayed, .anim-beacon-glow {
            animation: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* SAFE ACCESS BEACON ENVIRONMENT (Cool Transition: Teal -> Cyan -> Blue)    */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {/* Deep vignette backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(2,7,19,0.95)_100%)]"></div>

        {/* Primary teal beacon core illumination on left */}
        <div className="absolute top-1/2 left-[18%] sm:left-[24%] -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#00dfc0]/[0.05] sm:bg-[#00dfc0]/[0.06] rounded-full blur-[110px] sm:blur-[160px]"></div>
        
        {/* Soft cyan atmospheric bridge */}
        <div className="absolute top-[38%] left-[28%] sm:left-[34%] -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#22d3ee]/[0.04] sm:bg-[#22d3ee]/[0.055] rounded-full blur-[90px] sm:blur-[130px]"></div>

        {/* Soft electric blue glow in parts of outer left background */}
        <div className="absolute top-[28%] left-[8%] sm:left-[12%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#3b82f6]/[0.045] sm:bg-[#3b82f6]/[0.065] rounded-full blur-[100px] sm:blur-[140px]"></div>

        {/* Subtle cyan ambient reflection behind upper-right area of login panel */}
        <div className="absolute top-[20%] right-[10%] sm:right-[15%] w-[380px] h-[380px] bg-[#22d3ee]/[0.03] sm:bg-[#22d3ee]/[0.04] rounded-full blur-[100px] sm:blur-[140px]"></div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 900"
        >
          <defs>
            <filter id="beaconAtmosphereGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="beaconNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="cyanNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="blueNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="blueGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Linear gradient for scanning beam: teal to cyan to electric blue to transparent */}
            <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0dd3c5" stopOpacity="0.5" />
              <stop offset="35%" stopColor="#0dd3c5" stopOpacity="0.35" />
              <stop offset="65%" stopColor="#22d3ee" stopOpacity="0.45" />
              <stop offset="90%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            {/* Gradient for soft sweeping atmospheric cone */}
            <linearGradient id="sweepConeGrad" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#0dd3c5" stopOpacity="0.1" />
              <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.07" />
              <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            {/* Linear gradient for Ring 3: smooth teal to cyan to soft blue transition */}
            <linearGradient id="ringTealCyanBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0dd3c5" stopOpacity="0.32" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.45" />
            </linearGradient>
            {/* Linear gradient for Ring 4: cyan to electric blue */}
            <linearGradient id="ringCyanBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.35" />
            </linearGradient>
            {/* Linear gradient for Northeast Arc: teal to cyan */}
            <linearGradient id="arcTealCyanGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0dd3c5" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.45" />
            </linearGradient>
            {/* Linear gradient for Outer Arc: cyan to electric blue */}
            <linearGradient id="arcCyanBlueGrad" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {/* LAYER 1: GEOMETRIC COORDINATE GRID LINES (Sparse & Restrained) */}
          <g stroke="#00dfc0" strokeWidth="0.75" strokeOpacity="0.11" fill="none">
            {/* Horizontal baseline through beacon center */}
            <line x1="-100" y1="450" x2="1540" y2="450" strokeDasharray="6 12" />
            {/* Vertical meridian through beacon center */}
            <line x1="320" y1="-100" x2="320" y2="1000" strokeDasharray="6 12" />
            {/* Faint diagonal alignment axes */}
            <line x1="320" y1="450" x2="1100" y2="150" strokeDasharray="4 10" strokeOpacity="0.07" />
            <line x1="320" y1="450" x2="1100" y2="750" strokeDasharray="4 10" strokeOpacity="0.07" />
          </g>

          {/* LAYER 2: CONCENTRIC RADAR RINGS & RADIAL ARCS (Teal -> Cyan -> Blue) */}
          {/* Inner Range Ring 1 (Teal primary core) */}
          <circle cx="320" cy="450" r="70" stroke="#00dfc0" strokeWidth="0.8" strokeOpacity="0.25" fill="none" />
          
          {/* Range Ring 2 (Dashed technical ring: Teal/Cyan) */}
          <circle cx="320" cy="450" r="150" stroke="#0dd3c5" strokeWidth="1" strokeOpacity="0.22" strokeDasharray="3 6" fill="none" />
          
          {/* Range Ring 3 (Solid with smooth teal to cyan to soft blue transition) */}
          <circle cx="320" cy="450" r="260" stroke="url(#ringTealCyanBlueGrad)" strokeWidth="1.5" fill="none" />
          
          {/* Range Ring 4 (Large segmented ring: Cyan to Electric Blue) */}
          <circle cx="320" cy="450" r="400" stroke="url(#ringCyanBlueGrad)" strokeWidth="1.2" strokeDasharray="16 8 4 8" fill="none" />
          
          {/* Outer Boundary Ring 5 (Extends behind HUD and outside viewport: Soft Electric Blue) */}
          <circle cx="320" cy="450" r="580" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.12" fill="none" />
          
          {/* Distant Atmospheric Ring 6 (Massive cinematic perimeter: Electric Blue) */}
          <circle cx="320" cy="450" r="780" stroke="#3b82f6" strokeWidth="0.9" strokeOpacity="0.08" strokeDasharray="8 16" fill="none" />

          {/* LAYER 3: ACCENTED RADIAL ARCS (Teal -> Cyan -> Electric Blue) */}
          <g fill="none">
            {/* Northeast Primary Arc segment (Teal to Cyan) */}
            <path
              d="M 320 190 A 260 260 0 0 1 580 450"
              stroke="url(#arcTealCyanGrad)"
              strokeWidth="1.8"
            />
            {/* Southeast Dashed Arc (Teal) */}
            <path
              d="M 580 450 A 260 260 0 0 1 320 710"
              stroke="#00dfc0"
              strokeWidth="1.3"
              strokeOpacity="0.2"
              strokeDasharray="6 8"
            />
            {/* Northwest Radar Arc (Cyan secondary) */}
            <path
              d="M 320 300 A 150 150 0 0 0 170 450"
              stroke="#22d3ee"
              strokeWidth="1.6"
              strokeOpacity="0.45"
              strokeDasharray="6 8"
            />
            {/* Extended Outer Arc at r=400 (Cyan to Electric Blue transition) */}
            <path
              d="M 120 103 A 400 400 0 0 1 720 450"
              stroke="url(#arcCyanBlueGrad)"
              strokeWidth="2.5"
              strokeDasharray="48 14 14 14"
              filter="url(#blueGlowFilter)"
            />
          </g>

          {/* LAYER 4: TECHNICAL TICK MARKS & AZIMUTH HASHES */}
          <g strokeWidth="1" fill="none">
            {/* Cardinal cross ticks on r=260 (Teal) */}
            <g stroke="#00dfc0" strokeOpacity="0.25">
              <line x1="320" y1="184" x2="320" y2="196" />
              <line x1="320" y1="704" x2="320" y2="716" />
              <line x1="574" y1="450" x2="586" y2="450" />
              <line x1="54" y1="450" x2="66" y2="450" />
              <line x1="500" y1="270" x2="508" y2="262" />
              <line x1="140" y1="270" x2="132" y2="262" />
              <line x1="140" y1="630" x2="132" y2="638" />
            </g>
            {/* Secondary Cyan ticks near r=400 perimeter */}
            <g stroke="#22d3ee" strokeOpacity="0.35">
              <line x1="500" y1="630" x2="508" y2="638" />
              <line x1="600" y1="446" x2="600" y2="454" />
            </g>
            {/* Coordinate crosshairs at key geometric points */}
            <g stroke="#00dfc0" strokeWidth="0.8" strokeOpacity="0.25">
              <path d="M 320 100 L 320 110 M 315 105 L 325 105" />
              <path d="M 320 790 L 320 800 M 315 795 L 325 795" />
            </g>
            <g stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.35">
              <path d="M 715 450 L 725 450 M 720 445 L 720 455" />
            </g>
          </g>

          {/* LAYER 5: SCANNING RADAR BEAM (Rotating ray and soft cone: Teal -> Cyan -> Blue -> Transparent) */}
          <g className="anim-radar-sweep">
            {/* Soft atmospheric scanning wedge */}
            <path
              d="M 320 450 L 860 450 A 540 540 0 0 0 832 312 Z"
              fill="url(#sweepConeGrad)"
            />
            {/* Lead scanning beam line */}
            <line x1="320" y1="450" x2="880" y2="450" stroke="url(#scanBeamGrad)" strokeWidth="2.5" />
            {/* Scanning beam outer tip node in electric blue */}
            <circle cx="880" cy="450" r="3.5" fill="#3b82f6" filter="url(#blueNodeGlow)" />
          </g>

          {/* LAYER 6: SIGNAL VERIFICATION VECTOR (Links Beacon to Authentication Panel) */}
          <g>
            {/* Solid guide baseline connecting beacon to access HUD */}
            <line x1="320" y1="450" x2="980" y2="450" stroke="#00dfc0" strokeWidth="1.1" strokeOpacity="0.2" />
            {/* Traveling photon pulse along verification vector: IDENTITY TO SIGNAL VERIFIED TO SAFE ACCESS */}
            <line
              x1="320"
              y1="450"
              x2="980"
              y2="450"
              stroke="#00dfc0"
              strokeWidth="2.2"
              strokeDasharray="22 220"
              className="anim-signal-transit"
              filter="url(#beaconNodeGlow)"
            />
          </g>

          {/* LAYER 7: GLOWING SIGNAL NODES (Distance Progression: Nearby Cyan + Distant Blue) */}
          {/* Signal Node 1 (Nearby Node - Cyan): At (504, 266) along r=260 */}
          <g transform="translate(504, 266)" className="anim-signal-node">
            <circle cx="0" cy="0" r="16" fill="#22d3ee" fillOpacity="0.08" />
            <circle cx="0" cy="0" r="8" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.5" fill="none" />
            <circle cx="0" cy="0" r="3" fill="#22d3ee" filter="url(#cyanNodeGlow)" />
          </g>

          {/* Signal Node 2 (Distant Node - Electric Blue): At (603, 634) along r=350 */}
          <g transform="translate(603, 634)" className="anim-signal-node-delayed">
            <circle cx="0" cy="0" r="18" fill="#3b82f6" fillOpacity="0.12" />
            <circle cx="0" cy="0" r="9" stroke="#3b82f6" strokeWidth="1.2" strokeOpacity="0.55" fill="none" />
            <circle cx="0" cy="0" r="3.5" fill="#3b82f6" filter="url(#blueNodeGlow)" />
          </g>

          {/* LAYER 8: BEACON CENTER EMITTER (Primary Teal Core) */}
          <g className="anim-beacon-pulse">
            <circle cx="320" cy="450" r="32" fill="#00dfc0" fillOpacity="0.05" filter="url(#beaconAtmosphereGlow)" />
            <circle cx="320" cy="450" r="20" stroke="#00dfc0" strokeWidth="1.5" strokeOpacity="0.38" strokeDasharray="3 3" fill="none" />
            <circle cx="320" cy="450" r="10" fill="#021f1d" stroke="#00dfc0" strokeWidth="1.8" />
            <circle cx="320" cy="450" r="4" fill="#00dfc0" filter="url(#beaconNodeGlow)" />
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* SPATIAL AUTHENTICATION HUD (Asymmetrical Composition on Desktop)         */}
      {/* ========================================================================= */}
      <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-end lg:pr-12 xl:pr-20">
        
        {/* RESTRAINED FLOATING GLASS HUD (420-460px) */}
        <div className="w-full max-w-[440px] sm:max-w-[460px] bg-[#030816]/80 backdrop-blur-2xl border border-white/10 sm:border-[#00dfc0]/15 hover:border-[#00dfc0]/25 rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(0,223,192,0.04)] transition-all duration-300 relative overflow-hidden">
          
          {/* Subtle top edge specular highlight (Teal transitioning to soft cyan reflection) */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00dfc0]/35 via-60% to-[#22d3ee]/25 pointer-events-none"></div>

          {/* HUD Header */}
          <div className="text-center mb-6 sm:mb-7">
            {/* Waypoint Entry Beacon Icon */}
            <div className="inline-flex items-center justify-center mb-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-teal-500/25 anim-beacon-glow"></div>
                <div className="absolute inset-1.5 rounded-full border border-teal-500/40 border-dashed"></div>
                <div className="w-8 h-8 rounded-full bg-teal-950/90 border border-[#00dfc0] flex items-center justify-center shadow-[0_0_12px_rgba(0,223,192,0.4)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#00dfc0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* SafeRoute Eyebrow */}
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00dfc0] shadow-[0_0_6px_#00dfc0]"></span>
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#00dfc0] font-bold uppercase">
                SAFE ACCESS PORTAL
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-normal mt-1 leading-relaxed">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div role="alert" aria-live="polite" className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">{error}</div>
            </div>
          )}
          
          {success && (
            <div role="status" aria-live="polite" className="mb-5 p-3.5 rounded-xl bg-teal-950/50 border border-teal-500/40 text-teal-200 text-xs sm:text-sm flex items-center gap-2.5 leading-relaxed">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00dfc0] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 font-medium">{success}</div>
            </div>
          )}

          {/* Google Authentication Button */}
          <button
            type="button"
            className="w-full min-h-[48px] sm:min-h-[50px] flex items-center justify-center gap-3 bg-[#071022]/80 hover:bg-[#0d1c38] text-slate-200 border border-white/10 hover:border-white/20 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm mb-5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-3 text-[11px] font-mono text-slate-500 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-300 font-mono">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-white/10 bg-[#02050f]/80 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-[#00dfc0] focus:ring-1 focus:ring-[#00dfc0]/40 transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-teal-400 hover:text-teal-300 hover:underline transition font-medium py-1 px-1 touch-manipulation"
                >
                  Forgot password?
                </Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-white/10 bg-[#02050f]/80 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:border-[#00dfc0] focus:ring-1 focus:ring-[#00dfc0]/40 transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
            </div>
            
            {/* Primary Sign In CTA */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full min-h-[50px] sm:min-h-[52px] py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#00dfc0] hover:bg-[#00c9ad] active:scale-[0.98] text-slate-950 shadow-[0_0_25px_rgba(0,223,192,0.35)] hover:shadow-[0_0_35px_rgba(0,223,192,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <span className="font-mono text-sm">&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Sign Up Link */}
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#00dfc0] font-bold hover:underline ml-1">
              Create one
            </Link>
          </p>

        </div>

      </div>
    </main>
  );
}
