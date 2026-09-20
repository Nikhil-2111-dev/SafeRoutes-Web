'use client';
import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [isAlerting, setIsAlerting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !isAlerting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isOpen && countdown === 0 && !isAlerting) {
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isAlerting]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsAlerting(false);
      setError(null);
    }
  }, [isOpen]);

  const triggerSOS = async () => {
    setIsAlerting(true);
    setError(null);
    
    if (!('geolocation' in navigator)) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          if (!token) throw new Error("Not authenticated");

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/sos`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to trigger SOS'));
          }

          // Open Native SMS App reliably using an anchor click
          if (data.contacts && data.contacts.length > 0) {
            const phoneNumbers = data.contacts.map((c: any) => c.phone).join(',');
            // iOS uses &body= while Android usually uses ?body= but most modern browsers handle ?body= fine
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const bodyParam = isIOS ? '&body=' : '?body=';
            const smsLink = `sms:${phoneNumbers}${bodyParam}${encodeURIComponent(data.smsBody)}`;
            
            // Create hidden link and click it
            const a = document.createElement('a');
            a.href = smsLink;
            a.target = '_top';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }

          toast.success('Emergency SMS app opened successfully!');
          onClose(); // Close the modal
        } catch (err: any) {
          setError(err.message);
          toast.error(`SOS Failed: ${err.message}`);
        }
      },
      (err) => {
        setError(`Failed to get location: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
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
              <p className="text-xl mb-6 font-medium">Alerting trusted contacts in:</p>
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
              {error ? (
                <>
                  <div className="text-danger mb-4">
                    <XCircle className="h-20 w-20 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-danger">SOS Failed</h3>
                  <p className="opacity-80 mb-8">{error}</p>
                  
                  <button 
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded-lg font-bold border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Close Window
                  </button>
                </>
              ) : (
                <>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-danger mx-auto mb-6"></div>
                  <p className="text-lg font-medium">Acquiring live location and preparing SMS...</p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
