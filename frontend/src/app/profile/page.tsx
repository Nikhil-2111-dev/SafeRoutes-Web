'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Camera } from 'lucide-react';
import ImageCropModal from '@/components/ImageCropModal';

// =========================================================================
// TEMPORARY DEVELOPMENT-ONLY PROFILE PREVIEW
// =========================================================================
interface TrustedContact {
  name: string;
  phone: string;
}

interface UserProfileData {
  name: string;
  email: string;
  phone_number?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  createdAt: string;
  trustedContacts?: TrustedContact[];
  pictureUrl?: string;
  picture?: string;
}
// =========================================================================

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateProfile } = useAuth();
  const router = useRouter();
  const bgRef = useRef<HTMLDivElement>(null);

  // Profile Image State
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [profilePicBase64, setProfilePicBase64] = useState<string | null>(null);

  useEffect(() => {
    // If auth finishes loading and there's no user, redirect to login
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Noticeable yet restrained Desktop Pointer Parallax
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedFileUrl(imageUrl);
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setProfilePicBase64(croppedBase64);
    setSelectedFileUrl(null);
    
    try {
      // 1. Get auth token
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('No auth token');

      // 2. Convert base64 to Blob
      const res = await fetch(croppedBase64);
      const blob = await res.blob();
      
      // 3. Prepare FormData
      const formData = new FormData();
      formData.append('image', blob, 'profile.png');
      
      // 4. Upload to backend
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        if (updateProfile) {
          updateProfile({ pictureUrl: data.pictureUrl });
        }
      }
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      // Fallback to local state if upload fails
      if (updateProfile) {
        updateProfile({ picture: croppedBase64 });
      }
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-[32px] p-8 bg-[#161618]/80 border border-white/10 shadow-2xl animate-pulse">
          <div className="h-10 w-1/3 bg-white/10 rounded-xl mb-8"></div>
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-3xl bg-white/10"></div>
            <div className="space-y-3 flex-1">
              <div className="h-6 w-1/2 bg-white/10 rounded-md"></div>
              <div className="h-4 w-3/4 bg-white/10 rounded-md"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const profileData: UserProfileData | null = (user as any)?.profile;

  if (!profileData) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[32px] p-8 bg-[#161618]/80 backdrop-blur-2xl border border-white/10 shadow-2xl text-center space-y-4">
          <h2 className="text-xl font-bold">Unable to Load Profile</h2>
          <p className="text-sm text-zinc-400">Could not synchronize identity with the network.</p>
          <button
            onClick={handleSignOut}
            className="w-full mt-4 bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 shadow-[0_0_15px_rgba(0,223,192,0.3)] font-bold py-3.5 rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>
      </main>
    );
  }

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

  const userInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U';
  const currentProfilePic = profilePicBase64 || profileData.pictureUrl || profileData.picture;

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-black text-white relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 font-sans select-none">
      
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
        @keyframes ringSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ringSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes dataPulse {
          0%, 100% { opacity: 0.15; transform: scale(0.95); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
        .anim-mesh-1 { animation: meshDrift1 25s infinite ease-in-out alternate; }
        .anim-mesh-2 { animation: meshDrift2 28s infinite ease-in-out alternate; }
        
        .anim-ring-1 { animation: ringSpin 40s linear infinite; transform-origin: center; }
        .anim-ring-2 { animation: ringSpinReverse 30s linear infinite; transform-origin: center; }
        .anim-ring-3 { animation: ringSpin 60s linear infinite; transform-origin: center; }
        
        .anim-data-1 { animation: dataPulse 4s ease-in-out infinite; transform-origin: center; }
        .anim-data-2 { animation: dataPulse 6s ease-in-out infinite 1.5s; transform-origin: center; }
        .anim-data-3 { animation: dataPulse 5s ease-in-out infinite 3s; transform-origin: center; }

        /* Subtle noise texture overlay to match premium renders */
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
        }
      `}</style>

      {/* Cinematic Animated Background */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-noise mix-blend-overlay z-20 opacity-60"></div>
        
        {/* Soft Glowing Blobs (Deep Background) */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute top-1/2 left-1/2 w-[140vw] h-[140vw] sm:w-[60vw] sm:h-[60vw] max-w-[800px] max-h-[800px] bg-cyan-500/30 sm:bg-cyan-500/20 rounded-full blur-[60px] sm:blur-[80px] anim-mesh-1"
            style={{ transform: 'translate3d(calc(-50% - 10% + var(--plx-x, 0px)), calc(-50% - 10% + var(--plx-y, 0px)), 0)' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-[120vw] h-[120vw] sm:w-[50vw] sm:h-[50vw] max-w-[600px] max-h-[600px] bg-teal-500/25 sm:bg-teal-500/15 rounded-full blur-[50px] sm:blur-[70px] anim-mesh-2"
            style={{ transform: 'translate3d(calc(-50% + 15% + var(--plx-x, 0px)), calc(-50% + 15% + var(--plx-y, 0px)), 0)' }}
          />
        </div>

        {/* Crisp Large Orbital Rings & Data Nodes (Outside the modal) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-80 z-10" style={{ transform: 'translate3d(calc(var(--plx-x, 0px) * 0.2), calc(var(--plx-y, 0px) * 0.2), 0)' }}>
          <svg className="w-[900px] sm:w-[1400px] h-[900px] sm:h-[1400px] max-w-[250vw] sm:max-w-[200vw] max-h-[250vw] sm:max-h-[200vw]" viewBox="0 0 1400 1400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            
            {/* Floating Ambient Data Nodes (Crosses, dots, and text) */}
            <g className="anim-data-1">
              <path d="M180 250 h12 m-6 -6 v12" stroke="#06b6d4" strokeWidth="1.5" />
              <circle cx="205" cy="240" r="2" fill="#2dd4bf" />
              <text x="175" y="275" fill="#06b6d4" fontSize="11" fontFamily="monospace" letterSpacing="2" opacity="0.6">SEC.01</text>
            </g>
            
            <g className="anim-data-2">
              <path d="M1150 320 h10 m-5 -5 v10" stroke="#fff" strokeWidth="1.5" />
              <circle cx="1180" cy="335" r="1.5" fill="#06b6d4" />
              <text x="1145" y="305" fill="#2dd4bf" fontSize="10" fontFamily="monospace" letterSpacing="1" opacity="0.5">NET:ACTIVE</text>
            </g>

            <g className="anim-data-3">
              <path d="M220 1150 h14 m-7 -7 v14" stroke="#2dd4bf" strokeWidth="1.5" />
              <circle cx="195" cy="1160" r="2.5" fill="#fff" opacity="0.8" />
              <text x="240" y="1155" fill="#06b6d4" fontSize="12" fontFamily="monospace" letterSpacing="2" opacity="0.7">LINK:EST</text>
            </g>

            <g className="anim-data-1" style={{ animationDelay: '2.5s' }}>
              <path d="M1220 1080 h8 m-4 -4 v8" stroke="#06b6d4" strokeWidth="1" />
              <circle cx="1200" cy="1090" r="1.5" fill="#fff" />
              <text x="1195" y="1115" fill="#06b6d4" fontSize="9" fontFamily="monospace" letterSpacing="3" opacity="0.5">SYS.RDY</text>
            </g>

            {/* Outer massive orbital ring */}
            <g className="anim-ring-3">
              <circle cx="700" cy="700" r="580" stroke="url(#ringGrad1)" strokeWidth="1.5" strokeDasharray="4 16" opacity="0.6" />
              <circle cx="120" cy="700" r="4" fill="#06b6d4" />
              <circle cx="1280" cy="700" r="4" fill="#2dd4bf" />
            </g>
            
            {/* Middle tracking ring (sweeping arc) */}
            <g className="anim-ring-1">
              <circle cx="700" cy="700" r="500" stroke="#06b6d4" strokeWidth="1" opacity="0.15" />
              <circle cx="700" cy="700" r="500" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="200 1200" strokeLinecap="round" opacity="0.9" />
              <circle cx="700" cy="200" r="6" fill="#fff" />
            </g>

            {/* Inner precise dotted ring (hugs outside of the modal) */}
            <g className="anim-ring-2">
              <circle cx="700" cy="700" r="420" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="2 12" opacity="0.7" />
              <circle cx="700" cy="700" r="420" stroke="#fff" strokeWidth="2" strokeDasharray="10 1000" strokeLinecap="round" opacity="1" />
            </g>
          </svg>
        </div>
      </div>

      {/* Main Glassmorphic Modal */}
      <div className="w-[88%] sm:w-full max-w-[540px] relative z-20 mx-auto">
        <div className="rounded-[32px] bg-[#161618]/80 backdrop-blur-2xl border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.85)] overflow-hidden">
          
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Profile Details</h1>
              <span className="px-3 py-1 bg-white/10 border border-white/5 rounded-full text-[10px] uppercase tracking-widest font-mono text-zinc-300">
                Member
              </span>
            </div>

            {/* Avatar & Hero Info Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/[0.08] mb-6">
              <div className="relative shrink-0 group">
                <label className="w-24 h-24 rounded-[28px] border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer overflow-hidden shadow-inner">
                  {currentProfilePic ? (
                    <img src={currentProfilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white select-none">
                      {userInitial}
                    </span>
                  )}
                  {/* Hover Edit Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight">{profileData.name}</h2>
                <p className="text-sm text-zinc-400 mt-1">{profileData.email}</p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                  Member since {memberSinceFormatted}
                </div>
              </div>
            </div>

            {/* Form layout emulation for Info */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Full Name</p>
                  <p className="text-sm font-semibold">{profileData.name}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Email Address</p>
                  <p className="text-sm font-semibold truncate" title={profileData.email}>{profileData.email}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Mobile Number</p>
                  <p className="text-sm font-semibold">{profileData.phone_number?.replace(/^(\+1|\+91)\s?/, '') || 'Not provided'}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Date of Birth</p>
                  <p className="text-sm font-semibold">{profileData.birthdate || 'Not provided'}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Gender</p>
                  <p className="text-sm font-semibold capitalize">{profileData.gender || 'Not provided'}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 font-medium mb-1">Address</p>
                  <p className="text-sm font-semibold truncate" title={typeof profileData.address === 'object' ? (profileData.address as any).formatted : (profileData.address || '')}>
                    {typeof profileData.address === 'object' ? (profileData.address as any).formatted || 'Not provided' : profileData.address || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-8 opacity-70">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="mx-4 text-[10px] tracking-widest text-zinc-500 font-semibold uppercase">
                Trusted Contacts
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Trusted Contacts */}
            <div className="space-y-3 mb-8">
              {profileData.trustedContacts && profileData.trustedContacts.length > 0 ? (
                profileData.trustedContacts.map((contact: TrustedContact, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-zinc-400">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{contact.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{contact.phone}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-sm text-zinc-500">No trusted contacts added.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                className="w-full py-4 rounded-xl bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 shadow-[0_0_15px_rgba(0,223,192,0.3)] font-bold text-sm tracking-wide hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm transition-all active:scale-[0.98]"
              >
                Sign Out
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {selectedFileUrl && (
        <ImageCropModal 
          imageSrc={selectedFileUrl} 
          onCropComplete={handleCropComplete} 
          onClose={() => setSelectedFileUrl(null)} 
        />
      )}
    </main>
  );
}
