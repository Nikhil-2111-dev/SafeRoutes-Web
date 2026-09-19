'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// =========================================================================
// TEMPORARY DEVELOPMENT-ONLY PROFILE PREVIEW
// Used strictly when running in development and real profileData is unavailable
// (e.g. while the backend /api/v1/users/me request is blocked by CORS).
// REMOVE THIS FALLBACK BLOCK BEFORE PRODUCTION DEPLOYMENT.
// =========================================================================
interface TrustedContact {
  name: string;
  phone: string;
}

interface UserProfileData {
  name: string;
  email: string;
  mobile?: string;
  createdAt: string;
  trustedContacts?: TrustedContact[];
}

const DEV_PREVIEW_PROFILE: UserProfileData = {
  name: 'Pradyumna',
  email: 'pradyumna@example.com',
  mobile: '+91 98765 43210',
  createdAt: '2025-01-15T10:00:00.000Z',
  trustedContacts: [
    {
      name: 'Emergency Contact',
      phone: '+91 98765 00000',
    },
    {
      name: 'Family Contact',
      phone: '+91 98765 11111',
    },
  ],
};
// =========================================================================

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If auth finishes loading and there's no user, redirect to login
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Noticeable yet restrained Desktop Pointer Parallax (disabled at <= 640px and on reduced-motion)
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
      // Normalized coordinates from center (-1 to 1)
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;

      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    const updateParallax = () => {
      // Smooth lerp damping for fluid, premium following
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;

      if (bgRef.current) {
        // Strict parallax bounds:
        // far layer: max ±4px
        // gold arc layer: max ±8px
        // teal arc layer: max ±12px
        bgRef.current.style.setProperty('--plx-far-x', `${(currentX * 4).toFixed(2)}px`);
        bgRef.current.style.setProperty('--plx-far-y', `${(currentY * 4).toFixed(2)}px`);
        bgRef.current.style.setProperty('--plx-gold-x', `${(currentX * 8).toFixed(2)}px`);
        bgRef.current.style.setProperty('--plx-gold-y', `${(currentY * 8).toFixed(2)}px`);
        bgRef.current.style.setProperty('--plx-teal-x', `${(currentX * 12).toFixed(2)}px`);
        bgRef.current.style.setProperty('--plx-teal-y', `${(currentY * 12).toFixed(2)}px`);
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // SKELETON LOADING STATE (Matching SafeRoute Passport pixel-level aesthetic)
  if (authLoading) {
    return (
      <main className="min-h-[calc(100dvh-5rem)] bg-[#030712] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
        <div className="w-full max-w-[760px] rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#060D1A]/95 border border-[#E5B842]/30 shadow-2xl animate-pulse space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="w-36 h-4 rounded bg-[#E5B842]/20"></div>
            <div className="w-32 h-3 rounded bg-slate-800/60"></div>
          </div>
          <div className="rounded-2xl bg-[#091222]/80 border border-slate-800/80 p-5 flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border-2 border-[#E5B842]/30"></div>
            <div className="space-y-2 flex-1">
              <div className="w-28 h-4 rounded-full bg-[#E5B842]/20"></div>
              <div className="w-44 h-6 rounded bg-slate-800/80"></div>
              <div className="w-56 h-3 rounded bg-slate-800/50"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
            <div className="space-y-2">
              <div className="w-20 h-3 bg-slate-800/40 rounded"></div>
              <div className="w-36 h-4 bg-slate-800/70 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-3 bg-slate-800/40 rounded"></div>
              <div className="w-40 h-4 bg-slate-800/70 rounded"></div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/60 space-y-4">
            <div className="w-36 h-4 bg-slate-800/60 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full h-14 bg-slate-800/40 rounded-xl"></div>
              <div className="w-full h-14 bg-slate-800/40 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Real profile data from DynamoDB via AuthContext
  const realProfileData = (user as { profile?: UserProfileData })?.profile;

  // TEMPORARY DEV FALLBACK: Strictly used in development when real profileData is unavailable
  const profileData: UserProfileData | null =
    realProfileData || (process.env.NODE_ENV === 'development' ? DEV_PREVIEW_PROFILE : null);

  // ERROR STATE
  if (!profileData) {
    return (
      <main className="min-h-[calc(100dvh-5rem)] bg-[#030712] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
        <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-[#060D1A]/95 border border-rose-900/50 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full border border-rose-500/40 bg-rose-950/40 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Unable to Load Safety Passport</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            We could not synchronize your digital safety identity with the network. Please verify your connection or sign in again.
          </p>
          <div className="pt-2">
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 transition-colors text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Format "Member Since" (matches "Jan 15, 2025" in reference image)
  const memberSinceFormatted = (() => {
    try {
      return new Date(profileData.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return profileData.createdAt;
    }
  })();

  const userInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'P';

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#030712] text-slate-100 relative overflow-hidden flex items-center justify-center py-8 sm:py-10 px-4 sm:px-6 lg:px-10 font-sans select-none">
      {/* ========================================================================= */}
      {/* CLEARLY VISIBLE, SLOW & PREMIUM DYNAMIC MOTION STYLES                      */}
      {/* ========================================================================= */}
      <style>{`
        /* 1. TOP-RIGHT GOLD ARC: 18-25px drift, 2-4deg rotation, 16s duration */
        @keyframes floatTopRightArc {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-22px, 20px, 0) rotate(-3deg);
          }
          100% {
            transform: translate3d(18px, -18px, 0) rotate(2.5deg);
          }
        }

        /* 2. BOTTOM-LEFT GOLD ARC: 15-20px drift, 2-3deg rotation, 19s duration */
        @keyframes floatBottomLeftArc {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(19px, -16px, 0) rotate(2.5deg);
          }
          100% {
            transform: translate3d(-15px, 14px, 0) rotate(-2deg);
          }
        }

        /* 3. LOWER-RIGHT TEAL ARC: 12-20px drift, 1-3deg rotation, 15s duration */
        @keyframes floatTealArc {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-17px, 15px, 0) rotate(2deg);
          }
          100% {
            transform: translate3d(14px, -12px, 0) rotate(-1.5deg);
          }
        }

        /* 4. GOLD DOTTED FIELDS: Visibly breathing opacity 0.25 -> 0.55 -> 0.25, 5.5s */
        @keyframes stippleFieldBreathe {
          0%, 100% {
            opacity: 0.25;
            transform: scale(1);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.025);
          }
        }

        /* 5. GOLDEN LIGHT BREATHING: Opacity 0.35 -> 0.65 -> 0.35, 6.5s */
        @keyframes goldGlowBreathe {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.65;
            transform: scale(1.06);
          }
        }

        /* 6. SIDE TEXT: Very subtle opacity breathing (stationary) */
        @keyframes sideTextBreathe {
          0%, 100% {
            opacity: 0.85;
          }
          50% {
            opacity: 1;
          }
        }

        /* 7. AVATAR LOAD EFFECT: Single visible illumination sequence (normal -> brighter -> normal) */
        @keyframes avatarInitialGlow {
          0% {
            box-shadow: 0 0 20px rgba(229, 184, 66, 0.4), inset 0 0 10px rgba(229, 184, 66, 0.12);
          }
          50% {
            box-shadow: 0 0 45px rgba(229, 184, 66, 0.9), inset 0 0 20px rgba(229, 184, 66, 0.35);
          }
          100% {
            box-shadow: 0 0 22px rgba(229, 184, 66, 0.45), inset 0 0 12px rgba(229, 184, 66, 0.15);
          }
        }

        .anim-top-right-arc {
          animation: floatTopRightArc 16s ease-in-out infinite alternate;
          transform-origin: center center;
          will-change: transform;
        }

        .anim-bottom-left-arc {
          animation: floatBottomLeftArc 19s ease-in-out infinite alternate;
          transform-origin: center center;
          will-change: transform;
        }

        .anim-teal-arc {
          animation: floatTealArc 15s ease-in-out infinite alternate;
          transform-origin: center center;
          will-change: transform;
        }

        .anim-dots-breathe {
          animation: stippleFieldBreathe 5.5s ease-in-out infinite alternate;
          transform-origin: center center;
          will-change: opacity, transform;
        }

        .anim-glow-breathe {
          animation: goldGlowBreathe 6.5s ease-in-out infinite alternate;
          transform-origin: center center;
          will-change: opacity, transform;
        }

        .anim-side-text {
          animation: sideTextBreathe 8s ease-in-out infinite alternate;
          will-change: opacity;
        }

        .anim-avatar-load {
          animation: avatarInitialGlow 1.5s ease-out forwards;
        }

        /* MOBILE (< 640px): Reduces distances by 50% & disables parallax */
        @media (max-width: 640px) {
          @keyframes floatTopRightArcMobile {
            0% { transform: translate3d(0, 0, 0) rotate(0deg); }
            50% { transform: translate3d(-11px, 10px, 0) rotate(-1.5deg); }
            100% { transform: translate3d(9px, -9px, 0) rotate(1.2deg); }
          }
          @keyframes floatBottomLeftArcMobile {
            0% { transform: translate3d(0, 0, 0) rotate(0deg); }
            50% { transform: translate3d(9px, -8px, 0) rotate(1.2deg); }
            100% { transform: translate3d(-7px, 7px, 0) rotate(-1deg); }
          }
          @keyframes floatTealArcMobile {
            0% { transform: translate3d(0, 0, 0) rotate(0deg); }
            50% { transform: translate3d(-8px, 7px, 0) rotate(1deg); }
            100% { transform: translate3d(7px, -6px, 0) rotate(-0.8deg); }
          }
          .anim-top-right-arc {
            animation: floatTopRightArcMobile 16s ease-in-out infinite alternate !important;
          }
          .anim-bottom-left-arc {
            animation: floatBottomLeftArcMobile 19s ease-in-out infinite alternate !important;
          }
          .anim-teal-arc {
            animation: floatTealArcMobile 15s ease-in-out infinite alternate !important;
          }
        }

        /* ACCESSIBILITY: Disable all continuous decorative motion when reduced motion is requested */
        @media (prefers-reduced-motion: reduce) {
          .anim-top-right-arc,
          .anim-bottom-left-arc,
          .anim-teal-arc,
          .anim-dots-breathe,
          .anim-glow-breathe,
          .anim-side-text,
          .anim-avatar-load {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. DYNAMIC DECORATIVE BACKGROUND (Clearly Visible, Layered & Smooth)       */}
      {/* ========================================================================= */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* SHARED SVG DEFINITIONS (Glow Filters, Gradients, Dot Matrix Pattern) */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <pattern id="stipple-gold" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="9" cy="9" r="1.1" fill="#E5B842" opacity="0.8" />
            </pattern>

            <radialGradient id="sphere-gold-glow" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#E5B842" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#D4A03D" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </radialGradient>

            <filter id="gold-rim-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="cyan-rim-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* ----------------------------------------------------------------------- */}
        {/* A. FAR LAYER: AMBIENT ATMOSPHERIC GLOW (Parallax Max: ±4px)             */}
        {/* ----------------------------------------------------------------------- */}
        <div
          className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[660px] h-[390px] bg-gradient-to-b from-[#E5B842]/[0.05] via-cyan-950/[0.05] to-transparent rounded-full blur-[120px] anim-glow-breathe"
          style={{ transform: 'translate3d(calc(-50% + var(--plx-far-x, 0px)), var(--plx-far-y, 0px), 0)' }}
        />

        {/* ----------------------------------------------------------------------- */}
        {/* B. GOLD ARCS LAYER: BOTTOM-LEFT & TOP-RIGHT (Parallax Max: ±8px)        */}
        {/* ----------------------------------------------------------------------- */}
        {/* 1. BOTTOM-LEFT GOLDEN SPHERE & ARCS (Independent 19s Drift & Rotation) */}
        <div
          className="absolute -left-44 -bottom-44 w-[780px] h-[780px]"
          style={{ transform: 'translate3d(var(--plx-gold-x, 0px), var(--plx-gold-y, 0px), 0)' }}
        >
          <div className="w-full h-full anim-bottom-left-arc">
            <svg className="w-full h-full" viewBox="0 0 780 780" fill="none">
              {/* Breathing Glow */}
              <circle cx="390" cy="390" r="375" fill="url(#sphere-gold-glow)" className="anim-glow-breathe" />
              {/* Breathing Stippling Field (Opacity 0.25 -> 0.55 -> 0.25) */}
              <circle cx="390" cy="390" r="375" fill="url(#stipple-gold)" className="anim-dots-breathe" />
              {/* Concentric Subtle Orbit Line */}
              <circle cx="390" cy="390" r="435" stroke="#E5B842" strokeWidth="0.75" opacity="0.25" />
              {/* Luminous Golden Crescent Rim */}
              <circle cx="390" cy="390" r="375" stroke="#E5B842" strokeWidth="2.25" opacity="0.9" filter="url(#gold-rim-blur)" />
            </svg>
          </div>
        </div>

        {/* 2. TOP-RIGHT GOLDEN SPHERE & ARCS (Independent 16s Drift & Rotation) */}
        <div
          className="absolute -right-36 -top-36 w-[680px] h-[680px]"
          style={{ transform: 'translate3d(var(--plx-gold-x, 0px), var(--plx-gold-y, 0px), 0)' }}
        >
          <div className="w-full h-full anim-top-right-arc">
            <svg className="w-full h-full" viewBox="0 0 680 680" fill="none">
              {/* Breathing Glow */}
              <circle cx="340" cy="340" r="325" fill="url(#sphere-gold-glow)" className="anim-glow-breathe" />
              {/* Breathing Stippling Field */}
              <circle cx="340" cy="340" r="325" fill="url(#stipple-gold)" className="anim-dots-breathe" />
              {/* Concentric Subtle Orbit Line */}
              <circle cx="340" cy="340" r="385" stroke="#E5B842" strokeWidth="0.75" opacity="0.22" />
              {/* Luminous Golden Crescent Rim */}
              <circle cx="340" cy="340" r="325" stroke="#E5B842" strokeWidth="2" opacity="0.85" filter="url(#gold-rim-blur)" />
            </svg>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* C. TEAL ARCS LAYER: LOWER-RIGHT (Parallax Max: ±12px, 15s Drift)        */}
        {/* ----------------------------------------------------------------------- */}
        <div
          className="absolute -right-36 -bottom-36 w-[720px] h-[720px]"
          style={{ transform: 'translate3d(var(--plx-teal-x, 0px), var(--plx-teal-y, 0px), 0)' }}
        >
          <div className="w-full h-full anim-teal-arc">
            <svg className="w-full h-full" viewBox="0 0 720 720" fill="none">
              <circle cx="360" cy="360" r="350" stroke="#00DFC0" strokeWidth="1.85" opacity="0.8" filter="url(#cyan-rim-blur)" />
              <circle cx="360" cy="360" r="410" stroke="#0891B2" strokeWidth="0.75" opacity="0.32" />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIDE TYPOGRAPHIC TAGLINES (Matches Reference, Stationary Content)       */}
      {/* ========================================================================= */}
      {/* Left Side: Vertical Line + Stacked Tagline */}
      <div className="hidden xl:flex items-center gap-3.5 absolute left-8 2xl:left-14 top-1/2 -translate-y-1/2 z-10 pointer-events-none anim-side-text">
        <div className="w-[1.5px] h-[86px] bg-[#E5B842]/80" />
        <div className="text-[10px] font-mono tracking-[0.25em] text-slate-400 font-medium leading-[1.65]">
          <div>SAFER</div>
          <div>JOURNEYS</div>
          <div>BRIGHTER</div>
          <div>TOMORROWS</div>
        </div>
      </div>

      {/* Right Side: Stacked Tagline + Vertical Line */}
      <div className="hidden xl:flex items-center gap-3.5 absolute right-8 2xl:right-14 bottom-[20%] z-10 pointer-events-none anim-side-text">
        <div className="text-[10px] font-mono tracking-[0.25em] text-slate-400 font-medium leading-[1.65] text-right">
          <div>PEOPLE</div>
          <div>PLACES</div>
          <div>SAFETY</div>
          <div>TOGETHER</div>
        </div>
        <div className="w-[1.5px] h-[86px] bg-[#E5B842]/80" />
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN SAFEROUTE PASSPORT CONTAINER (~760-780px Width, Fully Stationary) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[760px] relative z-20">
        {/* Outer illuminated border surface */}
        <div className="relative rounded-2xl sm:rounded-3xl p-[1.5px] bg-gradient-to-br from-[#E5B842]/45 via-slate-800/60 to-rose-500/25 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(229,184,66,0.08)]">
          {/* Card Glass Interior */}
          <div className="relative rounded-[14.5px] sm:rounded-[22.5px] bg-[#070E1B]/95 backdrop-blur-xl p-6 sm:p-8 lg:p-9 overflow-hidden">
            {/* Faint internal ambient tints */}
            <div className="absolute top-0 left-0 w-44 h-44 bg-[#E5B842]/[0.035] rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-44 h-44 bg-rose-500/[0.045] rounded-full blur-2xl pointer-events-none" />

            {/* CARD TOP EYEBROW */}
            <div className="flex items-center justify-between pb-1 select-none">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] shadow-[0_0_6px_rgba(229,184,66,0.8)] shrink-0" />
                <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.18em] uppercase text-[#E5B842]">
                  SAFEROUTE PASSPORT
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-slate-500 font-medium">
                DIGITAL SAFETY IDENTITY
              </span>
            </div>

            {/* ================================================================= */}
            {/* HERO CONTAINER: AVATAR SQUIRCLE + IDENTITY INFO                   */}
            {/* ================================================================= */}
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0C172B] via-[#0A1426] to-[#070F1E] border border-slate-800/80 p-4 sm:p-5 flex items-center gap-5 sm:gap-6 mt-4 sm:mt-5">
              {/* Avatar Squircle: One-Time Soft Illumination on Mount, Hover on Desktop */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 border-[#E5B842] bg-[#050A14] flex items-center justify-center anim-avatar-load hover:shadow-[0_0_32px_rgba(229,184,66,0.7),inset_0_0_16px_rgba(229,184,66,0.25)] transition-shadow duration-300 overflow-hidden">
                  <span className="text-3xl sm:text-4xl font-bold text-white select-none">
                    {userInitial}
                  </span>
                </div>
              </div>

              {/* Name, Email & SAFEROUTE MEMBER Badge */}
              <div className="min-w-0 flex-1">
                {/* SAFEROUTE MEMBER Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141208] border border-[#E5B842]/50 text-[9.5px] font-mono tracking-wider font-semibold text-[#E5B842] uppercase mb-1.5">
                  <svg className="w-3 h-3 text-[#E5B842]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>SAFEROUTE MEMBER</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                  {profileData.name}
                </h1>

                <p className="text-xs sm:text-sm font-mono text-slate-400 mt-1 truncate">
                  {profileData.email}
                </p>
              </div>
            </div>

            {/* ================================================================= */}
            {/* ACCOUNT DETAILS SECTION                                           */}
            {/* ================================================================= */}
            <div className="mt-7 sm:mt-8">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1 h-3.5 bg-[#E5B842] rounded-full shrink-0" />
                <h2 className="text-[11px] sm:text-xs font-mono tracking-[0.2em] text-slate-400 font-semibold uppercase">
                  ACCOUNT DETAILS
                </h2>
              </div>

              {/* 2-Column Grid matching reference image layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 sm:gap-y-6 gap-x-8">
                {/* Full Name */}
                <div>
                  <p className="text-[10.5px] font-mono tracking-wider text-slate-500 uppercase font-medium">
                    FULL NAME
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1 truncate">
                    {profileData.name}
                  </p>
                </div>

                {/* Mobile Number */}
                <div>
                  <p className="text-[10.5px] font-mono tracking-wider text-slate-500 uppercase font-medium">
                    MOBILE NUMBER
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1 truncate font-mono sm:font-sans">
                    {profileData.mobile || '—'}
                  </p>
                </div>

                {/* Email Address */}
                <div>
                  <p className="text-[10.5px] font-mono tracking-wider text-slate-500 uppercase font-medium">
                    EMAIL ADDRESS
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1 truncate">
                    {profileData.email}
                  </p>
                </div>

                {/* Member Since (with gold indicator dot) */}
                <div>
                  <p className="text-[10.5px] font-mono tracking-wider text-slate-500 uppercase font-medium">
                    MEMBER SINCE
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1 truncate flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842] inline-block shrink-0" />
                    <span>{memberSinceFormatted}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Faint Horizontal Separator */}
            <div className="border-t border-slate-800/70 my-6 sm:my-7" />

            {/* ================================================================= */}
            {/* TRUSTED CONTACTS SECTION                                          */}
            {/* ================================================================= */}
            <div>
              {/* Section Header with EMERGENCY NETWORK indicator */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-rose-500 rounded-full shrink-0" />
                  <h2 className="text-[11px] sm:text-xs font-mono tracking-[0.2em] text-slate-400 font-semibold uppercase">
                    TRUSTED CONTACTS
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-rose-500 font-semibold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>EMERGENCY NETWORK</span>
                </div>
              </div>

              {/* 2 Contact Cards side-by-side */}
              {profileData.trustedContacts && profileData.trustedContacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {profileData.trustedContacts.map((contact: TrustedContact, i: number) => (
                    <div
                      key={i}
                      className="group flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-[#091222] border border-slate-800/80 hover:border-slate-700/90 transition-colors"
                    >
                      {/* Silhouette Icon Container with Red Dot */}
                      <div className="relative shrink-0 w-9 h-9 rounded-lg border border-slate-700/60 bg-[#060D1A] flex items-center justify-center text-slate-300">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        {/* Red Status Dot */}
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 border border-[#091222]" />
                      </div>

                      {/* Contact Details */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {contact.name}
                        </p>
                        <p className="text-[11px] sm:text-xs font-mono text-slate-400 mt-0.5 truncate">
                          {contact.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#091222]/50 border border-slate-800/80 text-center">
                  <p className="text-xs text-slate-500 italic">No trusted contacts registered to this safety pass yet.</p>
                </div>
              )}
            </div>

            {/* ================================================================= */}
            {/* SIGN OUT ACTION (Positioned Bottom-Right)                         */}
            {/* ================================================================= */}
            <div className="mt-6 sm:mt-7 flex justify-end">
              <button
                onClick={handleSignOut}
                className="px-5 py-2.5 rounded-xl border border-rose-500/40 bg-[#14080D]/80 hover:bg-[#1E0B13] hover:border-rose-500/70 text-rose-300 hover:text-rose-200 active:scale-[0.99] font-medium text-xs sm:text-sm transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.12)] cursor-pointer"
              >
                <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
