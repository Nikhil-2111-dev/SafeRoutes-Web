'use client';

import { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            phone_number: mobile.startsWith('+') ? mobile : `+1${mobile}`,
            birthdate: dob,
            gender: gender,
            address: address
          }
        }
      });
      // Redirect to verify page, passing the email via query params
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj?.message || 'Error signing up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#030914] text-slate-100 relative overflow-x-hidden py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-10 flex items-center justify-center font-sans">
      {/* Restrained CSS Animations */}
      <style>{`
        @keyframes routeFlow {
          from { stroke-dashoffset: 240; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes dangerBeaconPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.75)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 14px rgba(239, 68, 68, 0.95)); }
        }
        @keyframes shockwaveRipple {
          0% { r: 38px; opacity: 0.55; }
          70% { r: 54px; opacity: 0.18; }
          100% { r: 68px; opacity: 0; }
        }
        @keyframes nodeHaloPulse {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 223, 192, 0.45)); }
          50% { filter: drop-shadow(0 0 16px rgba(0, 223, 192, 0.75)); }
        }

        .anim-route-flow {
          animation: routeFlow 16s linear infinite;
        }
        .anim-danger-beacon {
          animation: dangerBeaconPulse 3.5s ease-in-out infinite;
          transform-origin: 540px 470px;
        }
        .anim-danger-shockwave {
          animation: shockwaveRipple 3.6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
        .anim-node-halo {
          animation: nodeHaloPulse 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-route-flow,
          .anim-danger-beacon,
          .anim-danger-shockwave,
          .anim-node-halo {
            animation: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* VECTOR NETWORK MAP & REFINED NAVIGATION ROUTE                             */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft atmospheric background gradients */}
        <div className="absolute top-[10%] left-[8%] w-[45vw] h-[55vh] bg-gradient-to-br from-cyan-950/15 via-[#030e24]/25 to-transparent blur-3xl" />
        <div className="absolute top-[35%] left-[28%] w-[22vw] h-[28vh] bg-rose-950/20 rounded-full blur-[75px]" />
        <div className="absolute bottom-[-5%] left-[5%] w-[35vw] h-[35vh] bg-cyan-900/12 rounded-full blur-3xl" />

        <svg
          className="absolute inset-0 w-full h-full object-cover opacity-85 sm:opacity-90"
          viewBox="0 0 1440 920"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Low-intensity route glow filters */}
            <filter id="sr-route-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="sr-node-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Route Gradients */}
            <linearGradient id="sr-teal-route-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00dfc0" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#0DD3C5" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
            </linearGradient>

            <radialGradient id="sr-danger-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#030914" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="sr-node-backing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00dfc0" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#030914" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* LAYER 1: NETWORK BACKGROUND CONNECTIONS (Intentional & Depth-layered) */}
          {/* Background Fainter Lines */}
          <g stroke="#091b2e" strokeWidth="0.8" opacity="0.45">
            <line x1="160" y1="440" x2="320" y2="160" />
            <line x1="320" y1="160" x2="480" y2="250" />
            <line x1="480" y1="250" x2="570" y2="340" />
            <line x1="160" y1="440" x2="250" y2="635" />
            <line x1="250" y1="635" x2="390" y2="840" />
            <line x1="600" y1="620" x2="390" y2="840" />
            <line x1="600" y1="620" x2="720" y2="700" />
            {/* Ambient Boundary Arcs */}
            <circle cx="160" cy="480" r="260" stroke="#081829" strokeWidth="0.8" strokeDasharray="4 6" fill="none" />
            <circle cx="560" cy="440" r="200" stroke="#081829" strokeWidth="0.8" fill="none" />
          </g>

          {/* Foreground Slightly Brighter Lines */}
          <g stroke="#112944" strokeWidth="1" opacity="0.65">
            <line x1="480" y1="250" x2="320" y2="270" />
            <line x1="570" y1="340" x2="540" y2="470" stroke="#1c3350" />
            <line x1="160" y1="440" x2="350" y2="500" />
            <line x1="350" y1="500" x2="450" y2="520" />
            <line x1="450" y1="520" x2="540" y2="470" stroke="#1d2e46" />
            <line x1="540" y1="470" x2="600" y2="620" stroke="#1d2e46" />
            <line x1="360" y1="710" x2="390" y2="840" />
          </g>

          {/* Secondary Teal Network Nodes (Restrained & Depth-scaled) */}
          <g>
            <circle cx="320" cy="160" r="4.5" fill="#00dfc0" opacity="0.9" />
            <circle cx="320" cy="160" r="1.5" fill="#ffffff" />
            <circle cx="160" cy="440" r="3.5" fill="#00dfc0" opacity="0.75" />
            <circle cx="480" cy="250" r="3" fill="#00dfc0" opacity="0.65" />
            <circle cx="570" cy="340" r="3" fill="#00dfc0" opacity="0.6" />
            <circle cx="450" cy="520" r="3" fill="#00dfc0" opacity="0.65" />
            <circle cx="600" cy="620" r="4.5" fill="#00dfc0" opacity="0.85" />
            <circle cx="600" cy="620" r="9" stroke="#00dfc0" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
            <circle cx="390" cy="840" r="3.5" fill="#00dfc0" opacity="0.7" />
          </g>

          {/* =================================================================== */}
          {/* LAYER 2: RED DANGER NODE (REFINED, NOTICEABLE & SPATIALLY NEARBY)   */}
          {/* =================================================================== */}
          <g>
            {/* Soft Localized Red Ambient Glow */}
            <circle cx="540" cy="470" r="90" fill="url(#sr-danger-aura)" />

            {/* One Faint Outer Pulse Ring */}
            <circle
              cx="540"
              cy="470"
              r="54"
              stroke="#ef4444"
              strokeWidth="0.8"
              strokeOpacity="0.3"
              strokeDasharray="4 4"
              fill="none"
              className="anim-danger-shockwave"
            />

            {/* One Strong Mid Ring */}
            <circle cx="540" cy="470" r="38" stroke="#ef4444" strokeWidth="1.4" strokeOpacity="0.65" fill="none" />

            {/* Central Red Danger Circle with Exclamation Mark */}
            <g className="anim-danger-beacon cursor-pointer">
              <circle cx="540" cy="470" r="19" fill="#ef4444" />
              <circle cx="540" cy="470" r="22.5" stroke="#fca5a5" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
              <text
                x="540"
                y="478"
                fill="#ffffff"
                fontSize="22"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                !
              </text>
            </g>
          </g>

          {/* =================================================================== */}
          {/* LAYER 3: REFINED 3-LAYER SAFE ROUTE (HOME -> USER -> DESTINATION)   */}
          {/* =================================================================== */}
          <g>
            {/* Layer 1: Outer Atmospheric Glow (Wide, Very Low Opacity) */}
            <path
              d="M 320,160 L 320,270 C 320,340 460,350 470,410 C 480,460 395,475 350,500 C 300,530 240,580 250,635 C 260,690 320,710 360,710"
              fill="none"
              stroke="#00dfc0"
              strokeWidth="8"
              strokeOpacity="0.18"
              filter="url(#sr-route-glow)"
            />
            {/* Layer 2: Main Route (Significantly Thinner, Crisp Teal/Cyan) */}
            <path
              d="M 320,160 L 320,270 C 320,340 460,350 470,410 C 480,460 395,475 350,500 C 300,530 240,580 250,635 C 260,690 320,710 360,710"
              fill="none"
              stroke="url(#sr-teal-route-grad)"
              strokeWidth="2.4"
              strokeOpacity="0.95"
            />
            {/* Layer 3: Center Tracer (Very Thin, Bright, Dashed Segmented) */}
            <path
              d="M 320,160 L 320,270 C 320,340 460,350 470,410 C 480,460 395,475 350,500 C 300,530 240,580 250,635 C 260,690 320,710 360,710"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.6"
              strokeDasharray="10 30"
              strokeLinecap="round"
              className="anim-route-flow"
            />
          </g>

          {/* =================================================================== */}
          {/* LAYER 4: STANDARDIZED ROUTE NODES (HOMOGENEOUS SYSTEM PROPORTIONS) */}
          {/* =================================================================== */}
          {/* NODE 1: HOME (Origin) at (320, 270) */}
          <g className="anim-node-halo cursor-pointer">
            <circle cx="320" cy="270" r="28" fill="url(#sr-node-backing)" />
            <circle cx="320" cy="270" r="21" fill="#061a29" stroke="#00dfc0" strokeWidth="2.2" />
            <path
              d="M 312,274 L 320,264 L 328,274 L 328,279 L 312,279 Z"
              fill="#ffffff"
              stroke="#00dfc0"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <rect x="318" y="273" width="4" height="6" fill="#061a29" />
          </g>

          {/* NODE 2: USER / PEDESTRIAN (Midpoint) at (350, 500) */}
          <g className="anim-node-halo cursor-pointer">
            <circle cx="350" cy="500" r="28" fill="url(#sr-node-backing)" />
            <circle cx="350" cy="500" r="21" fill="#061a29" stroke="#00dfc0" strokeWidth="2.2" />
            {/* Pedestrian Icon */}
            <circle cx="350" cy="491.5" r="2.8" fill="#ffffff" />
            <path
              d="M 347.5,497.5 L 352.5,495.5 M 350,495 L 350,503.5 L 345,510 M 350,503.5 L 355,510 M 346.5,499.5 L 353.5,499.5"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* NODE 3: DESTINATION / LOCATION PIN (Endpoint) at (360, 710) */}
          <g className="anim-node-halo cursor-pointer">
            <circle cx="360" cy="710" r="28" fill="url(#sr-node-backing)" />
            <circle cx="360" cy="710" r="21" fill="#061a29" stroke="#00dfc0" strokeWidth="2.2" />
            {/* Location Pin Icon */}
            <path
              d="M 360,700 C 355.2,700 351.5,704 351.5,708.8 C 351.5,715.5 360,722 360,722 C 360,722 368.5,715.5 368.5,708.8 C 368.5,704 364.8,700 360,700 Z"
              fill="#00dfc0"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <circle cx="360" cy="707.8" r="2.4" fill="#061a29" />
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* MAIN DESKTOP COMPOSITION: 46% LEFT VISUAL / 54% SIGNUP AREA               */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between relative z-10 gap-6 lg:gap-8 min-h-[calc(100dvh-6rem)]">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: INTENTIONAL RESTRAINED TYPOGRAPHY (46% DESKTOP AREA)       */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-[46%] flex flex-col justify-between self-stretch pointer-events-none select-none min-h-[140px] sm:min-h-[200px] lg:min-h-[580px] py-2 lg:py-6">
          {/* Top-Left Headline: "A SAFER NETWORK STARTS WITH US" */}
          <div className="pt-2 lg:pt-4">
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-cyan-400 uppercase font-bold leading-tight">A SAFER</p>
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-cyan-400 uppercase font-bold leading-tight">NETWORK</p>
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-cyan-400 uppercase font-bold leading-tight">STARTS WITH</p>
              <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-cyan-400 uppercase font-bold leading-tight">US</p>
              <div className="w-5 h-[2px] bg-cyan-400 mt-2.5 rounded-full"></div>
            </div>

            {/* Mid-Left Clearly Secondary Message: "PEOPLE PLACES SAFER TOGETHER" */}
            <div className="mt-8 sm:mt-12 space-y-1 opacity-70">
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-400 uppercase leading-snug">PEOPLE</p>
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-400 uppercase leading-snug">PLACES</p>
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-400 uppercase leading-snug">SAFER</p>
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-400 uppercase leading-snug">TOGETHER</p>
            </div>
          </div>

          {/* Bottom-Left Very Subtle: "SAFE ROUTES STRONGER COMMUNITIES" */}
          <div className="pb-2 lg:pb-4 opacity-55">
            <div className="space-y-0.5">
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-400 uppercase">SAFE ROUTES</p>
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-400 uppercase">STRONGER</p>
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-slate-400 uppercase">COMMUNITIES</p>
              <div className="w-4 h-[1.5px] bg-slate-500 mt-1.5 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: PRECISION SIGNUP PANEL (54% DESKTOP AREA)                 */}
        {/* ======================================================================= */}
        <div className="w-full lg:w-[54%] flex justify-center lg:justify-end items-center relative">
          {/* Panel constrained to 560-600px usable desktop width */}
          <div className="relative w-full max-w-[580px]">
            {/* Subtle Edge Glow Behind Card (Faint Teal Left, Faint Rose Right) */}
            <div className="absolute -left-2 top-0 bottom-0 w-8 bg-cyan-400/15 blur-lg pointer-events-none -z-10" />
            <div className="absolute -right-2 top-0 bottom-0 w-8 bg-rose-500/12 blur-lg pointer-events-none -z-10" />

            {/* Translucent Panel with Subtle Dual-Tone Edge Illumination */}
            <div className="relative rounded-[24px] sm:rounded-[28px] p-[1.5px] bg-gradient-to-br from-cyan-400/50 via-[#15233e] to-rose-500/35 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
              {/* Internal Glass Background */}
              <div className="rounded-[22.5px] sm:rounded-[26.5px] p-6 sm:p-7 lg:p-8 bg-[#040816]/92 backdrop-blur-2xl">
                {/* Header: Centered Avatar & Titles */}
                <div className="text-center mb-4 sm:mb-5">
                  <div className="w-11 h-11 rounded-full border border-cyan-400/40 bg-[#071828] flex items-center justify-center text-cyan-400 shadow-[0_0_16px_rgba(0,223,192,0.25)] mx-auto mb-2.5">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create an Account</h1>
                  <p className="text-xs text-slate-400 mt-1">Join the community for a safer route home</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Google Sign-in Button: Full-width, Logo & Text Centered as One Visual Unit */}
                <button
                  type="button"
                  className="w-full h-12 flex items-center justify-center gap-3 bg-[#0a1324] hover:bg-[#0e1a30] text-slate-200 border border-slate-700/60 rounded-xl font-medium text-sm transition-all shadow-sm hover:border-slate-600 active:scale-[0.99] mb-4"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                {/* Divider: Balanced Equal-Width Lines */}
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="mx-3 text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                    OR REGISTER WITH EMAIL
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                {/* Registration Form: Equal-Width Columns & Precise Vertical Alignment */}
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Full Name</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                          className="w-full h-11 sm:h-[46px] pl-10 pr-3.5 rounded-xl bg-[#081120] border border-slate-800 text-slate-100 placeholder-slate-500 text-base sm:text-xs lg:text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Mobile Number</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          required
                          className="w-full h-11 sm:h-[46px] pl-10 pr-3.5 rounded-xl bg-[#081120] border border-slate-800 text-slate-100 placeholder-slate-500 text-base sm:text-xs lg:text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Address (Full Width on sm+) */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Email Address</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full h-11 sm:h-[46px] pl-10 pr-3.5 rounded-xl bg-[#081120] border border-slate-800 text-slate-100 placeholder-slate-500 text-base sm:text-xs lg:text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Date of Birth</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
                            <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          required
                          className="w-full h-11 sm:h-[46px] pl-10 pr-3.5 rounded-xl bg-[#081120] border border-slate-800 text-slate-100 placeholder-slate-500 text-base sm:text-xs lg:text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Gender</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          required
                          className="w-full h-11 sm:h-[46px] pl-10 pr-8 rounded-xl bg-[#081120] border border-slate-800 text-slate-100 text-base sm:text-xs lg:text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#081120] text-slate-400">
                            Select Gender
                          </option>
                          <option value="male" className="bg-[#081120] text-slate-200">
                            Male
                          </option>
                          <option value="female" className="bg-[#081120] text-slate-200">
                            Female
                          </option>
                          <option value="other" className="bg-[#081120] text-slate-200">
                            Other
                          </option>
                          <option value="prefer_not_to_say" className="bg-[#081120] text-slate-200">
                            Prefer not to say
                          </option>
                        </select>
                        <div className="absolute right-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Address (Full Width on sm+) */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Address</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="123 Safe St, City, Country"
                          required
                          className="w-full h-11 sm:h-[46px] pl-10 pr-3.5 rounded-xl bg-[#081120] border border-slate-800 text-slate-100 placeholder-slate-500 text-base sm:text-xs lg:text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Password</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full h-11 sm:h-[46px] pl-10 pr-3.5 rounded-xl bg-[#081120] border border-slate-800 text-slate-100 placeholder-slate-500 text-base sm:text-xs lg:text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1.5">Confirm Password</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full h-11 sm:h-[46px] pl-10 pr-3.5 rounded-xl bg-[#081120] border border-slate-800 text-slate-100 placeholder-slate-500 text-base sm:text-xs lg:text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dominant Full-Width Teal CTA Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-[#00dfc0] via-[#00dfc0] to-[#00ceb6] hover:brightness-105 active:brightness-95 text-slate-950 font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,223,192,0.32)] hover:shadow-[0_0_28px_rgba(0,223,192,0.48)] transition-all active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none mt-4"
                  >
                    {isLoading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <span className="text-base leading-none">&rarr;</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <p className="mt-4 text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-cyan-400 font-semibold hover:underline hover:text-cyan-300 ml-1 transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Far Right HUD Typographic Element (Subtle & Responsive) */}
        <div className="hidden 2xl:flex flex-col justify-center space-y-0.5 pl-4 pointer-events-none select-none opacity-50">
          <p className="text-[10px] font-mono tracking-[0.22em] text-slate-400 uppercase leading-snug">YOUR</p>
          <p className="text-[10px] font-mono tracking-[0.22em] text-slate-400 uppercase leading-snug">SAFETY</p>
          <p className="text-[10px] font-mono tracking-[0.22em] text-slate-400 uppercase leading-snug">OUR</p>
          <p className="text-[10px] font-mono tracking-[0.22em] text-cyan-400 uppercase font-bold leading-snug">PRIORITY</p>
          <div className="w-5 h-[1.5px] bg-cyan-400 mt-1.5 rounded-full"></div>
        </div>
      </div>
    </main>
  );
}
