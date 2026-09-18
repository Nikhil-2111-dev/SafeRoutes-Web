'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-secondary p-2 rounded-xl group-hover:bg-secondary-hover transition-colors shadow-[0_0_10px_rgba(13,148,136,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Safe<span className="text-secondary">Route</span></span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex space-x-8">
            <Link 
              href="/map" 
              className={`text-sm font-semibold transition-colors ${isActive('/map') ? 'text-secondary' : 'text-slate-300 hover:text-white'}`}
            >
              Map
            </Link>
            <Link 
              href="/report" 
              className={`text-sm font-semibold transition-colors ${isActive('/report') ? 'text-secondary' : 'text-slate-300 hover:text-white'}`}
            >
              Report Incident
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {!isLoading && !user && (
              <>
                <Link 
                  href="/login" 
                  className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="bg-secondary hover:bg-secondary-hover text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(13,148,136,0.4)] transition-transform hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}

            {!isLoading && user && (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-700/50 hover:bg-slate-600 border border-slate-600 transition-colors" title="Profile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 border border-slate-200 dark:border-slate-700">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                      Profile
                    </Link>
                    <Link href="/map" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                      Map
                    </Link>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                      Settings
                    </Link>
                    <button 
                      onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                      className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}
