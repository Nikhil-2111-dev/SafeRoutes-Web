'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signIn } from 'aws-amplify/auth';

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
        setSuccess('Sign In Successful! Redirecting to map...');
        setError('');
        await syncProfile(); // This now fetches the current user and sets state safely
        setTimeout(() => {
          router.push('/map');
        }, 800);
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err.message?.includes('Invalid user pool id')) {
        setError("AWS Cognito is not deployed yet! Please run 'npx cdk deploy' in the infrastructure folder and check your .env.local");
      } else {
        setError(err.message || 'Error signing in');
      }
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-6 lg:p-12 bg-background relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 z-10">
        
        <div className="text-center mb-8">
          <div className="bg-primary/5 p-3 rounded-2xl inline-block mb-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-primary dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border-l-4 border-danger text-danger rounded-r-md text-sm font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-secondary/10 border-l-4 border-secondary text-secondary rounded-r-md text-sm font-medium flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <button className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md mb-6">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="mx-4 text-sm text-slate-400">OR</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-xs text-secondary hover:underline font-medium">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account? <Link href="/register" className="text-secondary font-bold hover:underline ml-1">Create one</Link>
        </p>
      </div>
    </main>
  );
}
