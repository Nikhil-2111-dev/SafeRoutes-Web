'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EmergencyContacts from '@/components/EmergencyContacts';

import RadarAnimation from '@/components/RadarAnimation';

export default function ContactsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

  if (authLoading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

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
        .anim-mesh-1 { animation: meshDrift1 25s infinite ease-in-out alternate; }
        .anim-mesh-2 { animation: meshDrift2 28s infinite ease-in-out alternate; }

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

        {/* Full-Screen Radar Animation (Visible on mobile & desktop) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-80 lg:opacity-100 z-10" style={{ transform: 'translate3d(calc(var(--plx-x, 0px) * -0.05), calc(var(--plx-y, 0px) * -0.05), 0)' }}>
           <RadarAnimation />
        </div>
      </div>

      <div className="w-[90%] sm:w-full max-w-[800px] relative z-20 flex flex-col items-center">
        <EmergencyContacts />
      </div>
    </main>
  );
}
