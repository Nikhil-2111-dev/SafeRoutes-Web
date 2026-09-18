'use client';
import { useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await resetPassword({ username: email });
      setStep('confirm');
      setMessage('A verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Error requesting password reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await confirmResetPassword({ 
        username: email, 
        confirmationCode: code, 
        newPassword 
      });
      router.push('/login?reset=true');
    } catch (err: any) {
      setError(err.message || 'Error confirming new password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-6 bg-background relative overflow-hidden min-h-[calc(100vh-80px)]">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden">
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Reset Password</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {step === 'request' ? "Enter your email to recover your account" : "Enter the code and your new password"}
          </p>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="p-8 space-y-6">
            {error && (
              <div className="bg-danger/10 border-l-4 border-danger p-4 text-danger rounded">
                <p>{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-secondary outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Sending...' : 'Send Recovery Code'}
            </button>
          </form>
        ) : (
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
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Verification Code</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-secondary outline-none transition"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">New Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-secondary outline-none transition"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-secondary-hover text-white py-3.5 rounded-xl font-bold shadow-lg shadow-secondary/30 transition hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        <div className="px-8 pb-8 text-center space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
