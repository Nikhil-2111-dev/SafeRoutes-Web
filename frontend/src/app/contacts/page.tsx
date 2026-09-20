'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EmergencyContacts from '@/components/EmergencyContacts';
import RadarAnimation from '@/components/RadarAnimation';

export default function ContactsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <main className="flex-grow flex w-full h-full bg-[#050B14] relative overflow-hidden">
      
      {/* Radar Animation: Absolute background on mobile, Left half on desktop */}
      <div className="absolute inset-0 lg:relative lg:flex lg:w-1/2 lg:h-full items-center justify-center lg:border-r border-[#00F2FE]/10 lg:shadow-[20px_0_50px_rgba(0,0,0,0.5)] z-0 lg:bg-[#03060A] overflow-hidden">
        <div className="absolute inset-0 lg:relative scale-[1.2] lg:scale-100 flex items-center justify-center opacity-60 lg:opacity-100 pointer-events-none">
          <RadarAnimation />
        </div>
      </div>

      {/* Contacts Component: Frosted glass island on mobile */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-start lg:justify-center p-4 sm:p-8 lg:p-12 relative z-10 overflow-y-auto hide-scrollbar bg-transparent">
        {/* Subtle ambient glow behind the card */}
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00F2FE]/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="w-[92%] sm:w-[95%] max-w-2xl relative mt-8 mb-12 lg:my-0">
          <EmergencyContacts />
        </div>
      </div>
    </main>
  );
}
