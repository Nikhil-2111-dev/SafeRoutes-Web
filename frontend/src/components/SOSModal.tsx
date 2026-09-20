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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050914]/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/25 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        
        <div className="text-xs font-mono text-rose-400 tracking-widest uppercase mb-4 flex items-center justify-between w-full">
          <span>EMERGENCY SOS</span>
          <span className="text-slate-400">{countdown}.00 SEC GRACE</span>
        </div>

        {/* Circular Countdown Dial with Pulsing Halos */}
        <div className="my-6 relative flex items-center justify-center">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-rose-500/40 flex flex-col items-center justify-center relative shadow-[0_0_40px_rgba(225,29,72,0.25)]">
            <div className="absolute inset-0 rounded-full border border-rose-500/50 animate-ping opacity-20" />
            <div className="text-5xl sm:text-6xl font-black font-mono text-rose-500 drop-shadow-[0_0_20px_rgba(225,29,72,0.8)] tabular-nums">
              {countdown.toFixed(1)}
            </div>
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-1">
              SECONDS
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 w-full flex flex-col items-center gap-3">
          {!isAlerting ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm tracking-wide border border-slate-700/80 text-slate-300 hover:bg-slate-900 transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button 
                onClick={triggerSOS}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>SEND NOW</span>
              </button>
            </div>
          ) : (
            <div className="text-center w-full min-h-[60px] flex flex-col items-center justify-center">
              {error ? (
                <>
                  <div className="text-rose-500 mb-2 font-bold text-lg">SOS Failed</div>
                  <div className="text-slate-400 text-xs mb-6 max-w-xs">{error}</div>
                  <button 
                    onClick={onClose}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm border border-slate-700/80 text-slate-300 hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    Close Window
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-rose-400 font-mono text-xs uppercase tracking-widest animate-pulse">
                    Broadcasting Alert...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
