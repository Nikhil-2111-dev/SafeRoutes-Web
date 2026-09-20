'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signIn, signInWithRedirect } from 'aws-amplify/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { syncProfile } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      
      if (isSignedIn) {
        setSuccess('Authentication Verified. Accessing...');
        setError('');
        await syncProfile();
        setTimeout(() => {
          router.push('/map');
        }, 800);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const errorObj = err as Error;
      if (errorObj?.message?.includes('Invalid user pool id')) {
        setError("Backend services not yet deployed.");
      } else {
        setError(errorObj?.message || 'Error signing in');
      }
    }
  };

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-black text-white relative overflow-hidden flex items-center justify-center p-4 py-10 font-sans select-none">
      
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

        /* Subtle noise texture overlay */
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
        }
      `}</style>

      {/* Cinematic Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center bg-black">
        <div className="absolute inset-0 bg-noise mix-blend-overlay z-20 opacity-60"></div>
        
        {/* Soft Glowing Blobs */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute top-1/2 left-1/2 w-[140vw] h-[140vw] sm:w-[60vw] sm:h-[60vw] max-w-[800px] max-h-[800px] bg-cyan-500/30 sm:bg-cyan-500/20 rounded-full blur-[60px] sm:blur-[80px] anim-mesh-1"
            style={{ transform: 'translate3d(-50%, -50%, 0)' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-[120vw] h-[120vw] sm:w-[50vw] sm:h-[50vw] max-w-[600px] max-h-[600px] bg-teal-500/25 sm:bg-teal-500/15 rounded-full blur-[50px] sm:blur-[70px] anim-mesh-2"
            style={{ transform: 'translate3d(-50%, -50%, 0)' }}
          />
        </div>

        {/* Rings & Data Nodes */}
        <div className="absolute inset-0 flex items-center justify-center opacity-80 z-10">
          <svg className="w-[900px] sm:w-[1400px] h-[900px] sm:h-[1400px] max-w-[250vw] sm:max-w-[200vw] max-h-[250vw] sm:max-h-[200vw]" viewBox="0 0 1400 1400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            
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

            <g className="anim-ring-3">
              <circle cx="700" cy="700" r="580" stroke="url(#ringGrad1)" strokeWidth="1.5" strokeDasharray="4 16" opacity="0.6" />
              <circle cx="700" cy="120" r="8" fill="#06b6d4" />
            </g>

            <g className="anim-ring-1">
              <circle cx="700" cy="700" r="500" stroke="#06b6d4" strokeWidth="1" opacity="0.15" />
              <circle cx="700" cy="700" r="500" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="200 1200" strokeLinecap="round" opacity="0.9" />
              <circle cx="700" cy="200" r="6" fill="#fff" />
            </g>

            <g className="anim-ring-2">
              <circle cx="700" cy="700" r="420" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="2 12" opacity="0.7" />
              <circle cx="700" cy="700" r="420" stroke="#fff" strokeWidth="2" strokeDasharray="10 1000" strokeLinecap="round" opacity="1" />
            </g>
          </svg>
        </div>
      </div>
      {/* Premium Form Container */}
      <div className="w-full max-w-md bg-black border-2 border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
        
        {/* Subtle top edge glow */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
              Secure Login
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your credentials to access your safety dashboard.
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">{error}</div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-800/30 border border-white/30 text-zinc-300 text-sm flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 font-medium">{success}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase mb-2 text-zinc-500">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full bg-black border-2 border-white/20 focus:border-white text-white placeholder-zinc-500 px-4 py-3.5 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-mono font-bold tracking-wider uppercase text-zinc-500">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-white hover:text-zinc-300 hover:underline font-medium">
                Reset?
              </Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-black border-2 border-white/20 focus:border-white text-white placeholder-zinc-500 px-4 py-3.5 rounded-xl text-sm transition-all outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 mt-2 rounded-xl font-bold bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 shadow-[0_0_15px_rgba(0,223,192,0.3)] hover:shadow-[0_0_25px_rgba(0,223,192,0.5)] transition-all disabled:opacity-50 text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="mx-4 text-xs font-mono text-zinc-600 uppercase tracking-widest">Or</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={() => signInWithRedirect({ provider: 'Google' })}
          className="w-full flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 border-2 border-white/20 text-white py-3.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Footer Link */}
        <p className="mt-8 text-center text-sm text-zinc-500">
          New to SafeRoute?{' '}
          <Link href="/register" className="text-white hover:text-zinc-300 font-medium">
            Create an account
          </Link>
        </p>

      </div>
    </main>
  );
}
