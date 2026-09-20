'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function ReportPage() {
  const [category, setCategory] = useState('General');
  const [severity, setSeverity] = useState(3);
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get the Cognito JWT session
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        alert("You must be logged in to report an incident.");
        setIsSubmitting(false);
        return;
      }

      // POST to the new secure Incidents endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/incidents`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          category,
          severity,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        })
      });
      
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to submit report');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-8 bg-[#0a0a0a] text-white font-sans min-h-screen">
      <div className="w-full max-w-2xl bg-[#1c1c1c] p-8 rounded-3xl shadow-2xl border border-white/10">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          Report an Incident
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-white/70">Category</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Women Safety', 'Child Safety', 'Theft', 'Poor Lighting', 'Road Hazard', 'General'].map(cat => (
                  <label key={cat} className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === cat ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-transparent hover:bg-white/10 text-white/60'}`}>
                    <input type="radio" name="category" value={cat} checked={category === cat} onChange={() => setCategory(cat)} className="sr-only" />
                    <span className="text-sm font-semibold text-center">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2 flex flex-col items-center justify-center py-4 border border-dashed border-white/20 rounded-xl bg-white/5">
              <p className="text-sm text-white/50 mb-3">Where did this happen?</p>
              <button 
                type="button" 
                onClick={handleLocationDetect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center justify-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Detect Current Location
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-white/70">Latitude</label>
              <input 
                type="number" step="any"
                className="w-full p-4 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-blue-500 transition"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-white/70">Longitude</label>
              <input 
                type="number" step="any"
                className="w-full p-4 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-blue-500 transition"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-white/70">Severity (1 = Minor, 5 = Critical)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="1" max="5" step="1"
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                />
                <span className="text-xl font-bold text-red-500 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">{severity}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white/70">Description</label>
            <textarea 
              rows={4}
              className="w-full p-4 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-blue-500 transition resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the situation..."
              required
            ></textarea>
          </div>
          
          <div className="pt-6 flex gap-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-8 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-grow bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
