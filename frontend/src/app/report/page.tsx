'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function ReportPage() {
  const [type, setType] = useState('incident');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [latitude, setLatitude] = useState(51.5072);
  const [longitude, setLongitude] = useState(-0.1276);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const awsMapName = process.env.NEXT_PUBLIC_AWS_MAP_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
  const mapStyle = awsMapName 
    ? `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${awsMapName}/style-descriptor`
    : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

  const getAuthToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch (e) {
      console.warn("Could not get auth session for request");
      return null;
    }
  };

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Convert image to base64, compress slightly using Canvas if needed, and analyze with AI
  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setIsAnalyzing(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        const token = await getAuthToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/pins/analyze-image`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ 
            imageBase64: base64data,
            mimeType: file.type 
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.description) setDescription(data.description);
          if (data.tags) setTags(data.tags);
          
          // Auto-select type based on tags
          if (data.tags.includes('dangerous') || data.tags.includes('unsafe')) setType('danger');
          else if (data.tags.includes('safe-area') || data.tags.includes('well-lit')) setType('safe');
          else if (data.tags.includes('hazard') || data.tags.includes('dirty')) setType('warning');
        } else {
          console.error("AI Analysis failed", await res.text());
          alert("Failed to analyze image with AI.");
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      alert('Error analyzing image');
    }
  };

  const handleMapClick = useCallback((e: any) => {
    setLatitude(e.lngLat.lat);
    setLongitude(e.lngLat.lng);
  }, []);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      const trimmed = newTag.trim().toLowerCase();
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = await getAuthToken();
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/pins`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type,
          description,
          tags,
          latitude: latitude,
          longitude: longitude
        })
      });
      
      if (res.ok) {
        router.push('/map');
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
    <main className="flex-grow p-4 md:p-8 bg-background text-foreground overflow-y-auto pb-24">
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary dark:text-white">Report an Incident</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* AI Image Scan Section */}
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
            <h2 className="text-lg font-semibold mb-2">Smart Scan (AI)</h2>
            <p className="text-sm opacity-80 mb-4">Take a photo of the area and AI will automatically fill in the tags and description.</p>
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageCapture}
            />
            
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
                disabled={isAnalyzing}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H8.414a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {isAnalyzing ? 'Scanning with AI...' : 'Take Photo'}
              </button>
              
              {imagePreview && (
                <div className="relative w-24 h-24 rounded-md overflow-hidden border-2 border-blue-500">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
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
            
            <div>
              <label className="block text-sm font-medium mb-1 opacity-80">Tags</label>
              <div className="w-full p-3 min-h-[50px] rounded-md border border-slate-300 dark:border-slate-600 bg-transparent flex flex-wrap gap-2 items-center">
                {tags.map(tag => (
                  <span key={tag} className="bg-slate-200 dark:bg-slate-600 pl-2 pr-1 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="text-slate-500 hover:text-red-500 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                      title="Remove tag"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder={tags.length === 0 ? "Type and press Enter..." : "Add tag..."}
                  className="bg-transparent border-none outline-none text-sm min-w-[120px] flex-grow"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-80">Description</label>
            <textarea 
              rows={3}
              className="w-full p-3 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the situation..."
              required
            ></textarea>
          </div>

          {/* Location Picker */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium opacity-80">Location</label>
              <button 
                type="button" 
                onClick={handleLocationDetect}
                className="text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-3 py-1 rounded transition flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Location
              </button>
            </div>
            
            <p className="text-xs opacity-60 mb-2">Click or drag on the map to manually set the exact location.</p>
            
            <div className="w-full h-64 rounded-md overflow-hidden border border-slate-300 dark:border-slate-600 relative">
              <Map
                initialViewState={{
                  longitude: longitude,
                  latitude: latitude,
                  zoom: 14
                }}
                longitude={longitude}
                latitude={latitude}
                onMove={(e) => {
                  setLongitude(e.viewState.longitude);
                  setLatitude(e.viewState.latitude);
                }}
                onClick={handleMapClick}
                mapStyle={mapStyle}
                style={{ width: '100%', height: '100%' }}
                interactive={true}
              >
                <Marker longitude={longitude} latitude={latitude} anchor="bottom">
                  <div className="text-3xl filter drop-shadow-md">📍</div>
                </Marker>
              </Map>
            </div>
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
