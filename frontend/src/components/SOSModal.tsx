'use client';
import { useState, useEffect } from 'react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [isAlerting, setIsAlerting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !isAlerting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isOpen && countdown === 0 && !isAlerting) {
      setIsAlerting(true);
      // Automatically trigger SOS logic here
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isAlerting]);

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsAlerting(false);
    }
  }, [isOpen]);

  const triggerSOS = () => {
    setIsAlerting(true);
    // TODO: Send SOS to backend which triggers SMS/Push notifications via AWS SNS/Pinpoint
    console.log("SOS Alert Triggered!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-danger/30">
        <div className="bg-danger p-6 text-white text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-3xl font-bold">EMERGENCY SOS</h2>
        </div>
        
        <div className="p-8 text-center">
          {!isAlerting ? (
            <>
              <p className="text-xl mb-6 font-medium">Alerting trusted contacts and authorities in:</p>
              <div className="text-6xl font-black text-danger mb-8">{countdown}</div>
              
              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-lg font-bold border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  CANCEL
                </button>
                <button 
                  onClick={triggerSOS}
                  className="flex-1 py-3 px-4 rounded-lg font-bold bg-danger text-white hover:bg-danger-hover transition"
                >
                  SEND NOW
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-safe mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-safe">Alert Sent!</h3>
              <p className="opacity-80 mb-8">Your live location has been shared with your trusted contacts and local emergency services.</p>
              
              <button 
                onClick={onClose}
                className="w-full py-3 px-4 rounded-lg font-bold border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close Window
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
