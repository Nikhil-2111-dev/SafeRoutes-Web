'use client';
import { useEffect, useState } from 'react';
import { fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth finishes loading and there's no user, redirect to login
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  // If we are logged in, we expect the DynamoDB profile to be populated on user.profile
  const profileData = (user as any)?.profile;

  if (!profileData) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background text-foreground">
        <p>Error loading profile data.</p>
      </div>
    );
  }

  return (
    <main className="flex-grow flex items-center justify-center p-6 lg:p-12 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden">
        <div className="bg-primary p-8 text-center relative">
          <div className="mx-auto h-24 w-24 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border-2 border-white/50">
            <span className="text-4xl font-bold text-white">{profileData.name?.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
          <p className="text-primary-foreground/80">{profileData.email}</p>
        </div>

        <div className="p-8">
          <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-6">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Full Name</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profileData.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Mobile Number</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profileData.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email Address</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profileData.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Member Since</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {new Date(profileData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-6">Trusted Contacts</h2>
          {profileData.trustedContacts?.length > 0 ? (
            <ul className="space-y-3 mb-8">
              {profileData.trustedContacts.map((contact: any, i: number) => (
                <li key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-sm text-slate-500">{contact.phone}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 italic mb-8">No trusted contacts added yet.</p>
          )}

          <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={handleSignOut}
              className="px-6 py-2.5 border-2 border-danger text-danger hover:bg-danger hover:text-white rounded-lg font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
