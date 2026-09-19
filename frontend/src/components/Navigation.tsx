'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close menus during render when pathname changes
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }

  const isActive = (path: string) => pathname === path;

  // Track window scroll for subtle background opacity adjustment
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Escape key to close open menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        /* Architectural active bottom line draw animation (280ms) */
        @keyframes activeLineDraw {
          from {
            width: 0%;
            opacity: 0;
          }
          to {
            width: 68%;
            opacity: 1;
          }
        }
        .anim-line-draw {
          animation: activeLineDraw 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Luminous corner node entrance */
        @keyframes nodeIlluminate {
          from {
            transform: scale(0.6);
            opacity: 0.5;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .anim-node-glow {
          animation: nodeIlluminate 280ms ease-out forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-line-draw,
          .anim-node-glow {
            animation: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* NAVBAR CONTAINER: DEEP NAVY / NEAR-BLACK BACKGROUND                       */}
      {/* ========================================================================= */}
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 font-sans relative ${
          isScrolled
            ? 'bg-[#030712]/92 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.65)]'
            : 'bg-[#030712]/80 backdrop-blur-md border-b border-slate-800/50 shadow-none'
        }`}
        aria-label="SafeRoute Main Navigation"
      >
        {/* Extremely subtle 1px horizontal teal route trace across the navbar background */}
        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#00DFC0]/[0.06] to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16 sm:h-[68px]">
            
            {/* ================================================================= */}
            {/* ZONE 1 (LEFT): CRISP SAFEROUTE BRAND & LOGO                       */}
            {/* ================================================================= */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DFC0]/50 rounded-lg p-1 -ml-1 transition-transform active:scale-[0.98]"
              aria-label="SafeRoute Home"
            >
              {/* Crisp Shield Icon Container (Reduced surrounding glow for precision) */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-[#00DFC0]/10 border border-[#00DFC0]/30 shadow-[0_0_10px_rgba(0,223,192,0.18)] group-hover:border-[#00DFC0]/50 group-hover:bg-[#00DFC0]/15 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-[#00DFC0] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              {/* Crisp Wordmark */}
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight select-none">
                Safe<span className="text-[#00DFC0]">Route</span>
              </span>
            </Link>

            {/* ================================================================= */}
            {/* ZONE 2 (CENTER): INDIVIDUAL RECTANGULAR NAVIGATION MODULES        */}
            {/* ================================================================= */}
            <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
              {/* [ Map ] Navigation Module */}
              <Link
                href="/map"
                className={`group relative h-11 px-5 rounded-[6px] transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00DFC0]/50 ${
                  isActive('/map')
                    ? 'bg-[#060D1A]/90 border border-[#00DFC0]/50 text-white font-semibold shadow-[0_0_14px_rgba(0,223,192,0.12)]'
                    : 'bg-[#060D1A]/70 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-[#081224]/80'
                }`}
              >
                {/* Signature Corner Node (Top-Right) */}
                <span
                  className={`absolute top-2 right-2 w-[4px] h-[4px] rounded-full transition-all duration-200 ${
                    isActive('/map')
                      ? 'bg-[#00DFC0] shadow-[0_0_6px_#00DFC0] anim-node-glow'
                      : 'bg-slate-600/50 group-hover:bg-[#00DFC0]/70 group-hover:shadow-[0_0_4px_rgba(0,223,192,0.6)]'
                  }`}
                />

                <span>Map</span>

                {/* Active Bottom Luminous Line (68% width, centered) */}
                {isActive('/map') && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[68%] h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#00DFC0] to-transparent shadow-[0_0_8px_rgba(0,223,192,0.85)] anim-line-draw" />
                )}
              </Link>

              {/* [ Report Incident ] Navigation Module */}
              <Link
                href="/report"
                className={`group relative h-11 px-5 rounded-[6px] transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00DFC0]/50 ${
                  isActive('/report')
                    ? 'bg-[#060D1A]/90 border border-[#00DFC0]/50 text-white font-semibold shadow-[0_0_14px_rgba(0,223,192,0.12)]'
                    : 'bg-[#060D1A]/70 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-[#081224]/80'
                }`}
              >
                {/* Signature Corner Node (Top-Right) */}
                <span
                  className={`absolute top-2 right-2 w-[4px] h-[4px] rounded-full transition-all duration-200 ${
                    isActive('/report')
                      ? 'bg-[#00DFC0] shadow-[0_0_6px_#00DFC0] anim-node-glow'
                      : 'bg-slate-600/50 group-hover:bg-[#00DFC0]/70 group-hover:shadow-[0_0_4px_rgba(0,223,192,0.6)]'
                  }`}
                />

                <span>Report Incident</span>

                {/* Active Bottom Luminous Line (68% width, centered) */}
                {isActive('/report') && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[68%] h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#00DFC0] to-transparent shadow-[0_0_8px_rgba(0,223,192,0.85)] anim-line-draw" />
                )}
              </Link>
            </div>

            {/* ================================================================= */}
            {/* ZONE 3 (RIGHT): ARCHITECTURAL PROFILE & AUTH ACTIONS              */}
            {/* ================================================================= */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* DESKTOP ACTIONS: UNAUTHENTICATED */}
              {!isLoading && !user && (
                <div className="hidden sm:flex items-center gap-2.5">
                  <Link
                    href="/login"
                    className="group relative h-11 px-4.5 rounded-[6px] bg-[#060D1A]/70 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-[#081224]/80 transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00DFC0]/50"
                  >
                    <span className="absolute top-2 right-2 w-[4px] h-[4px] rounded-full bg-slate-600/40 group-hover:bg-slate-400 transition-colors" />
                    <span>Log in</span>
                  </Link>

                  <Link
                    href="/register"
                    className="group relative h-11 px-5 rounded-[6px] bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs sm:text-sm shadow-[0_0_14px_rgba(13,148,136,0.3)] hover:shadow-[0_0_20px_rgba(13,148,136,0.5)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DFC0]/50"
                  >
                    <span className="absolute top-2 right-2 w-[4px] h-[4px] rounded-full bg-white/70 shadow-[0_0_4px_white]" />
                    <span>Get Started</span>
                  </Link>
                </div>
              )}

              {/* AUTHENTICATED: RECTANGULAR PROFILE MODULE [ user icon • ] */}
              {!isLoading && user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="group relative flex items-center justify-center w-11 h-11 rounded-[6px] bg-[#060D1A]/85 hover:bg-[#091428]/90 border border-slate-700/60 hover:border-[#00DFC0]/55 text-slate-300 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DFC0]/50 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_0_12px_rgba(0,223,192,0.2)]"
                    title="Account Options"
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-slate-300 group-hover:text-white transition-colors" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>

                    {/* Signature Corner Node */}
                    <span className="absolute top-2 right-2 w-[4px] h-[4px] rounded-full bg-slate-600/50 group-hover:bg-[#00DFC0] group-hover:shadow-[0_0_6px_#00DFC0] transition-all duration-200" />
                  </button>

                  {/* DESKTOP PROFILE DROPDOWN */}
                  {dropdownOpen && (
                    <>
                      {/* Backdrop to close on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />

                      <div className="absolute right-0 mt-2 w-52 rounded-[8px] bg-[#060D1A]/95 backdrop-blur-2xl border border-slate-800/90 shadow-[0_15px_40px_rgba(0,0,0,0.7)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {/* Profile Item */}
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E5B842]/70" />
                          <span>Profile</span>
                        </Link>

                        {/* Map Item */}
                        <Link
                          href="/map"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00DFC0]/60" />
                          <span>Map</span>
                        </Link>

                        {/* Settings Item */}
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500/60" />
                          <span>Settings</span>
                        </Link>

                        {/* Divider */}
                        <div className="border-t border-slate-800/80 my-1" />

                        {/* Logout Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            handleSignOut();
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs sm:text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* MOBILE HAMBURGER MODULE (Square module matching desktop language) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden group relative flex items-center justify-center w-11 h-11 rounded-[6px] bg-[#060D1A]/85 hover:bg-[#091428]/90 border border-slate-700/60 hover:border-[#00DFC0]/55 text-slate-300 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DFC0]/50 cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  /* Close Icon (X) */
                  <svg className="w-5 h-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  /* Hamburger Icon */
                  <svg className="w-5 h-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}

                {/* Signature Corner Node */}
                <span className="absolute top-2 right-2 w-[4px] h-[4px] rounded-full bg-slate-600/50 group-hover:bg-[#00DFC0] group-hover:shadow-[0_0_6px_#00DFC0] transition-all duration-200" />
              </button>
            </div>

          </div>
        </div>

        {/* ===================================================================== */}
        {/* MOBILE NAVIGATION SHEET: RECTANGULAR MODULES                          */}
        {/* ===================================================================== */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="relative z-50 md:hidden bg-[#060D1A]/98 backdrop-blur-2xl border-b border-slate-800/90 shadow-[0_20px_40px_rgba(0,0,0,0.85)] px-4 py-4 space-y-2 animate-in slide-in-from-top-3 duration-200">
              {/* [ Map ] Mobile Module */}
              <Link
                href="/map"
                onClick={() => setMobileMenuOpen(false)}
                className={`group relative flex items-center justify-between min-h-[46px] px-4 rounded-[6px] text-sm font-medium transition-all duration-200 ${
                  isActive('/map')
                    ? 'bg-[#060D1A] border border-[#00DFC0]/50 text-white font-semibold'
                    : 'bg-[#060D1A]/70 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>Map</span>
                <span
                  className={`w-[4px] h-[4px] rounded-full ${
                    isActive('/map')
                      ? 'bg-[#00DFC0] shadow-[0_0_6px_#00DFC0]'
                      : 'bg-slate-600/50'
                  }`}
                />
              </Link>

              {/* [ Report Incident ] Mobile Module */}
              <Link
                href="/report"
                onClick={() => setMobileMenuOpen(false)}
                className={`group relative flex items-center justify-between min-h-[46px] px-4 rounded-[6px] text-sm font-medium transition-all duration-200 ${
                  isActive('/report')
                    ? 'bg-[#060D1A] border border-[#00DFC0]/50 text-white font-semibold'
                    : 'bg-[#060D1A]/70 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>Report Incident</span>
                <span
                  className={`w-[4px] h-[4px] rounded-full ${
                    isActive('/report')
                      ? 'bg-[#00DFC0] shadow-[0_0_6px_#00DFC0]'
                      : 'bg-slate-600/50'
                  }`}
                />
              </Link>

              {/* Mobile Auth Actions */}
              {!isLoading && !user && (
                <div className="pt-3 mt-2 border-t border-slate-800/80 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center min-h-[46px] px-4 rounded-[6px] text-sm font-medium text-slate-300 hover:text-white bg-[#060D1A]/70 border border-slate-800/80 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center min-h-[46px] px-4 rounded-[6px] text-sm font-semibold bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-[0_0_12px_rgba(13,148,136,0.35)] transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {!isLoading && user && (
                <div className="pt-3 mt-2 border-t border-slate-800/80 space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between min-h-[46px] px-4 rounded-[6px] text-sm font-medium transition-colors ${
                      isActive('/profile')
                        ? 'bg-[#060D1A] border border-[#00DFC0]/50 text-white font-semibold'
                        : 'bg-[#060D1A]/70 border border-slate-800/80 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>Profile</span>
                    <span
                      className={`w-[4px] h-[4px] rounded-full ${
                        isActive('/profile')
                          ? 'bg-[#00DFC0] shadow-[0_0_6px_#00DFC0]'
                          : 'bg-slate-600/50'
                      }`}
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center min-h-[46px] w-full px-4 rounded-[6px] text-sm font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </>
  );
}
