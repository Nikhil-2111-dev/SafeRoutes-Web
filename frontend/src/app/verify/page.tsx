'use client';
import { useState, useEffect, Suspense } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyForm() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      router.push('/register');
    }
  }, [email, router]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      // Redirect to login after successful verification
      router.push('/login?verified=true');
    } catch (err: any) {
      setError(err.message || 'Error confirming sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendSignUpCode({ username: email });
      setMessage('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Error resending code');
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden">
      <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Verify Email</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          We sent a verification code to {email}
        </p>
      </div>

      <form onSubmit={handleConfirm} className="p-8 space-y-6">
        {error && (
          <div className="bg-danger/10 border-l-4 border-danger p-4 text-danger rounded">
            <p>{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-secondary/10 border-l-4 border-secondary p-4 text-secondary rounded">
            <p>{message}</p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300 text-center">Verification Code</label>
          <input 
            type="text" 
            className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition text-center tracking-[0.5em] text-2xl font-bold"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
            placeholder="••••••"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-secondary hover:bg-secondary-hover text-white py-3.5 rounded-xl font-bold shadow-lg shadow-secondary/30 transition hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isLoading ? 'Verifying...' : 'Verify & Complete'}
        </button>
      </form>
      
      <div className="px-8 pb-8 text-center space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Didn't receive it?{' '}
          <button onClick={handleResend} type="button" className="text-secondary font-bold hover:underline">
            Resend Code
          </button>
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="flex-grow flex items-center justify-center p-6 bg-background relative overflow-hidden min-h-[calc(100vh-80px)]">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </main>
  );
}
