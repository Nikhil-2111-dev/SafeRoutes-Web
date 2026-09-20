'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'aws-amplify/auth';
import { useState, useEffect } from 'react';
import SOSModal from '@/components/SOSModal';
import { Menu, X, Home, Map as MapIcon, AlertTriangle, MessageSquare, AlertCircle, Route, Bell, Users, User, Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
    }
  };

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent scrolling when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('sidebar-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('sidebar-open');
    }
  }, [sidebarOpen]);

  return (
    <>
      <nav className="sticky top-0 z-[60] w-full bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Section: Hamburger & Logo */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-white hover:bg-white/10 p-2 rounded-md transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl font-bold text-white tracking-tight">Safe<span className="text-gray-400">Route</span></span>
              </Link>
            </div>

            {/* Center Links (Optional on Desktop) */}
            <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Home
              </Link>
              <Link 
                href="/map" 
                className={`text-sm font-medium transition-colors ${isActive('/map') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Map
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {!isLoading && !user && (
                <>
                  <Link 
                    href="/login" 
                    className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-white hover:bg-gray-200 text-black px-5 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {!isLoading && user && (
                <div className="relative mr-2 md:mr-4">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors font-bold text-sm text-white overflow-hidden" title="Profile"
                  >
                    {(user.profile?.picture || user.profile?.pictureUrl) ? (
                      <img src={user.profile.picture || user.profile.pictureUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : user.profile?.name ? (
                      user.profile.name.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#121212] rounded-xl shadow-2xl py-2 border border-white/10">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white" onClick={() => setDropdownOpen(false)}>
                        Profile
                      </Link>
                      <button 
                        onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 mt-1 border-t border-white/5 pt-3"
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

      {/* Sidebar Overlay (Removed to keep map visible) */}

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-[#0a0a0a] border-r border-white/10 z-[80] transform transition-transform duration-200 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
          <span className="text-xl font-bold text-white tracking-tight">Safe<span className="text-gray-400">Route</span></span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          <Link href="/" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive('/') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`} onClick={() => setSidebarOpen(false)} prefetch={true}>
            <Home className="w-5 h-5" /> <span className="font-medium">Home</span>
          </Link>
          <Link href="/map" className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive('/map') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`} onClick={() => setSidebarOpen(false)} prefetch={true}>
            <MapIcon className="w-5 h-5" /> <span className="font-medium">Map</span>
          </Link>

          <div className="h-px bg-white/10 my-4 mx-3" />

          {/* Primary Actions */}
          <button 
            onClick={() => { setSidebarOpen(false); setIsSOSOpen(true); }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-red-500 hover:bg-red-500/10 font-bold"
          >
            <AlertTriangle className="w-5 h-5" /> <span>Emergency SOS</span>
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-gray-400 hover:bg-white/5 hover:text-white" onClick={() => setSidebarOpen(false)} prefetch={true}>
            <MessageSquare className="w-5 h-5" /> <span className="font-medium">Community Feed</span>
          </Link>
          <Link href="/report" className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-gray-400 hover:bg-white/5 hover:text-white" onClick={() => setSidebarOpen(false)} prefetch={true}>
            <AlertCircle className="w-5 h-5" /> <span className="font-medium">Report Incident</span>
          </Link>

          <div className="h-px bg-white/10 my-4 mx-3" />

          {/* Secondary Actions */}
          <Link href="/contacts" className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-gray-400 hover:bg-white/5 hover:text-white" onClick={() => setSidebarOpen(false)} prefetch={true}>
            <Users className="w-5 h-5" /> <span className="font-medium">Contacts</span>
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-gray-400 hover:bg-white/5 hover:text-white" onClick={() => setSidebarOpen(false)} prefetch={true}>
            <User className="w-5 h-5" /> <span className="font-medium">Profile</span>
          </Link>
        </div>
      </div>

      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </>
  );
}
