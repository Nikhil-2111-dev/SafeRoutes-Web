import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold max-w-3xl leading-tight">
          Navigate Your City with <span className="text-secondary">Confidence</span>
        </h1>
        <p className="text-xl opacity-80 max-w-2xl">
          Real-time safety insights, community-reported incidents, and intelligent routing to help you find the safest way home.
        </p>
        
        <div className="flex gap-4 pt-4">
          <Link href="/dashboard">
            <button className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition hover:scale-105">
              Explore Map
            </button>
          </Link>
          <button className="bg-danger hover:bg-danger-hover text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition hover:scale-105 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            SOS Alert
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl w-full">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Safer Routing</h3>
            <p className="opacity-70">Our intelligent algorithm prioritizes well-lit, populated streets and avoids known danger zones.</p>
          </div>
          
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-warning/10 text-warning rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Community Alerts</h3>
            <p className="opacity-70">Get real-time notifications about incidents, hazards, or suspicious activity reported by others.</p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Emergency SOS</h3>
            <p className="opacity-70">Instantly alert your trusted contacts and local authorities with your live location.</p>
          </div>
        </div>
      </main>
      
      <footer className="bg-primary text-white p-6 text-center opacity-80 text-sm">
        &copy; {new Date().getFullYear()} SafeRoute. All rights reserved.
      </footer>
    </div>
  );
}
