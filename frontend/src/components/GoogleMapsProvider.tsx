'use client';

import { APIProvider } from '@vis.gl/react-google-maps';

export default function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#0a0a0a] text-white p-8">
        <div className="max-w-md w-full bg-[#1c1c1c] border border-red-500/30 p-8 rounded-3xl shadow-2xl text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-2xl font-bold mb-4">Google Maps Key Required</h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            Please add a valid Google Maps API Key to your <code className="bg-black px-2 py-1 rounded text-red-400">frontend/.env.local</code> file and restart the development server.
          </p>
          <div className="bg-white/5 p-4 rounded-xl text-left font-mono text-sm overflow-x-auto text-white/50 border border-white/5">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      {children}
    </APIProvider>
  );
}
