'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const [type, setType] = useState('incident');
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
      const res = await fetch('http://localhost:5000/api/v1/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id', // Would come from Auth in production
          type,
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
    <main className="flex-grow flex items-center justify-center p-8 bg-background text-foreground">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-primary dark:text-white">Report an Incident</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Incident Type</label>
              <select 
                className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="incident">General Incident</option>
                <option value="danger">Danger Zone</option>
                <option value="safe">Safe Area / Police Presence</option>
                <option value="warning">Hazard / Warning</option>
              </select>
            </div>
            
            <div className="flex flex-col justify-end">
              <button 
                type="button" 
                onClick={handleLocationDetect}
                className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 p-3 rounded-md font-medium transition flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use Current Location
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Latitude</label>
              <input 
                type="number" step="any"
                className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Longitude</label>
              <input 
                type="number" step="any"
                className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Description</label>
            <textarea 
              rows={4}
              className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the situation..."
              required
            ></textarea>
          </div>
          
          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-3 rounded-md border border-slate-300 dark:border-slate-600 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-grow bg-secondary hover:bg-secondary-hover text-white py-3 rounded-md font-semibold transition disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
