'use client';
import MapComponent from '@/components/MapComponent';
import SOSModal from '@/components/SOSModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  return (
    <ProtectedRoute>
      <main className="flex-grow relative bg-[#0a0a0a] overflow-hidden flex">
        {/* Sidebar Navigation */}
      <div className="w-20 bg-[#121212] border-r border-white/5 flex flex-col items-center py-6 z-20 h-[calc(100vh-80px)]">
        <div className="flex flex-col space-y-8 flex-grow mt-4">
          <Link href="/map" className="text-white hover:text-white transition bg-white/10 p-3 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg></Link>
          <button className="text-white/40 hover:text-white transition p-3"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z"/></svg></button>
          <button className="text-white/40 hover:text-white transition p-3"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3.5 18.5L9.5 12l-6-6.5L5.5 4l8 8.5-8 8.5-2-2.5z"/></svg></button>
          <Link href="/report" className="text-white/40 hover:text-white transition p-3" title="Report Incident"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></Link>
        </div>
        <button 
          onClick={() => setIsSOSOpen(true)}
          className="mt-auto bg-danger/20 text-danger hover:bg-danger hover:text-white p-3 rounded-xl transition shadow-[0_0_15px_rgba(239,68,68,0.3)]" title="Emergency SOS"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow relative h-[calc(100vh-80px)]">
        
        {/* Full Screen Map */}
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
          <MapComponent />
        </div>

        {/* Floating Top Bar */}
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
          <div className="flex gap-4 pointer-events-auto">
            {/* Top Bar Widgets */}
            <div className="bg-[#1c1c1c]/90 backdrop-blur-md border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
              <span className="text-white/50 text-sm">Active Alerts</span>
              <span className="text-[#e5ff00] font-bold">12</span>
            </div>
            <div className="bg-[#1c1c1c]/90 backdrop-blur-md border border-white/5 text-white/80 rounded-xl px-4 py-2 flex items-center gap-2 font-medium text-sm">
              <svg className="w-4 h-4 text-safe" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Area Secure
            </div>
          </div>
        </div>

        {/* Floating Widgets Panel (Left Side) */}
        <div className="absolute top-24 left-6 w-80 space-y-4 z-10 pointer-events-auto max-h-[calc(100vh-14rem)] overflow-y-auto pb-6" style={{ scrollbarWidth: 'none' }}>
          
          {/* Overview Widget */}
          <div className="bg-[#151515]/95 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Safety Overview
              </h3>
              <div className="text-xs text-white/40 font-mono">16 Jul - 30 Sep</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              94<span className="text-sm font-medium px-2 py-0.5 bg-[#e5ff00]/10 text-[#e5ff00] rounded-full">+2.5%</span>
            </div>
            
            {/* Mock Bar Chart */}
            <div className="flex items-end justify-between h-16 gap-[2px] opacity-80 mt-6">
              {[40, 60, 30, 80, 50, 90, 70, 85, 45, 65, 35, 75, 55, 95].map((h, i) => (
                <div key={i} className="w-full bg-white/80 hover:bg-white rounded-t-sm transition-all duration-300" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-white/30 mt-2 font-mono uppercase">
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </div>

          {/* Activity Widget */}
          <div className="bg-[#151515]/95 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Activity
              </h3>
              <div className="text-xs text-white/40 font-mono">Today, 14 Nov</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-1">
                <div className="text-[11px] text-white/40 mb-1">Active reports</div>
                <div className="text-2xl font-bold text-white flex items-end justify-between">
                  482
                  <svg className="w-8 h-4 opacity-50" viewBox="0 0 40 20"><path d="M0 20L10 10L20 15L40 0" fill="none" stroke="white" strokeWidth="2"/></svg>
                </div>
              </div>
              <div className="p-1 border-l border-white/5 pl-4">
                <div className="text-[11px] text-white/40 mb-1">Resolved today</div>
                <div className="text-2xl font-bold text-white flex items-end justify-between">
                  127
                  <svg className="w-8 h-4 opacity-50" viewBox="0 0 40 20"><path d="M0 20L10 15L20 18L40 5" fill="none" stroke="white" strokeWidth="2"/></svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 mt-4 pt-4">
              <div className="p-1">
                <div className="text-[11px] text-white/40 mb-1">Avg response time</div>
                <div className="text-xl font-bold text-white">4.2 <span className="text-sm font-normal text-white/40">mins</span></div>
              </div>
              <div className="p-1 border-l border-white/5 pl-4">
                <div className="text-[11px] text-white/40 mb-1">Safe zones active</div>
                <div className="text-xl font-bold text-white">1,850</div>
              </div>
            </div>
          </div>
          
          {/* Performance Widget */}
          <div className="bg-[#151515]/95 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl mb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                Total Performance
              </h3>
            </div>
            
            {/* Mock Line Chart */}
            <div className="relative h-20 w-full">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                <path d="M0,25 Q10,15 20,20 T40,15 T50,5 T60,25 T75,15 T100,20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="50" cy="5" r="3" fill="white" className="animate-pulse" />
              </svg>
              {/* Tooltip on chart */}
              <div className="absolute top-0 left-[50%] -translate-x-1/2 -translate-y-[80%] bg-white text-black text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                86%
              </div>
              <div className="absolute left-0 bottom-0 text-[10px] text-white/30 font-mono">0%</div>
              <div className="absolute left-0 top-0 text-[10px] text-white/30 font-mono">100%</div>
            </div>
            <div className="flex justify-between text-[10px] text-white/30 mt-2 font-mono uppercase">
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
            </div>
          </div>
        </div>

        {/* Live Feed Widget (Right Side) */}
        <div className="absolute top-24 right-6 w-[22rem] z-10 pointer-events-auto">
          <div className="bg-[#151515]/95 backdrop-blur-xl border border-white/5 rounded-2xl p-2 shadow-2xl">
            <div className="flex justify-between items-center p-3 mb-1">
              <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Live Feed
              </h3>
              <div className="text-xs text-white/40 font-mono flex items-center gap-2">
                Cam-012 <span className="w-2 h-2 bg-danger rounded-full animate-pulse inline-block"></span>
              </div>
            </div>
            <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-xl overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                 <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform">
                   <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                 </div>
              </div>
              {/* Static blur placeholder resembling a feed */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-30 -z-10 blur-sm"></div>
              
              {/* Fake overlay text */}
              <div className="absolute bottom-3 left-3 text-[10px] text-white/60 font-mono bg-black/50 px-2 py-1 rounded">
                Place de la Bastille, 75012 Paris
              </div>
            </div>
            <button className="w-full mt-2 py-3 bg-[#222] hover:bg-[#333] text-white/80 font-semibold rounded-xl text-sm transition">
              More info
            </button>
          </div>
        </div>
      </div>
      
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      </main>
    </ProtectedRoute>
  );
}
