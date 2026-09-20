'use client';
import { useState } from 'react';
import Link from 'next/link';
import MapComponent from '@/components/MapComponent';
import ProtectedRoute from '@/components/ProtectedRoute';
import SOSModal from '@/components/SOSModal';

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
        </div>
      </main>
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </ProtectedRoute>
  );
}

