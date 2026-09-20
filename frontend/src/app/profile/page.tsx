'use client';
import { useEffect, useState } from 'react';
import { fetchUserAttributes, signOut, updateUserAttributes } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';

export default function ProfilePage() {
  const { user, isLoading: authLoading, syncProfile } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again
    e.target.value = '';

    const imageDataUrl = URL.createObjectURL(file);
    setImageSrc(imageDataUrl);
    setShowCropModal(true);
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      setShowCropModal(false);
      
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop image");

      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error("No token");

      const formData = new FormData();
      formData.append('image', croppedBlob, 'profile.jpg');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/users/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      // Update Cognito with the new picture URL
      await updateUserAttributes({
        userAttributes: {
          picture: data.pictureUrl
        }
      });

      // Refresh profile data
      await syncProfile();
    } catch (error) {
      console.error("Failed to upload cropped image:", error);
      alert("Failed to upload cropped image. Please try again.");
    } finally {
      setIsUploading(false);
      setImageSrc(null);
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
      <div className="flex-grow flex flex-col items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Unable to load your profile.</p>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary text-white hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg font-semibold shadow-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow flex items-center justify-center p-6 lg:p-12 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden">
        
        {/* Crop Modal */}
        {showCropModal && imageSrc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b dark:border-slate-800">
                <h2 className="text-xl font-bold">Crop your profile picture</h2>
              </div>
              
              <div className="relative w-full h-80 bg-slate-100 dark:bg-slate-800">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium whitespace-nowrap">Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowCropModal(false);
                      setImageSrc(null);
                    }}
                    className="px-4 py-2 rounded-lg font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCrop}
                    className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    Save & Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-primary p-8 text-center relative">
          <label className={`mx-auto h-24 w-24 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border-2 border-white/50 cursor-pointer overflow-hidden relative group transition-opacity ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:opacity-90'}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
            {(profileData.picture || profileData.pictureUrl) ? (
              <img src={profileData.picture || profileData.pictureUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-white">{profileData.name?.charAt(0).toUpperCase()}</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-semibold">Upload</span>
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </label>
          <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
          <p className="text-primary-foreground/80">{profileData.email}</p>
        </div>

        <div className="p-8">
          <h2 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-6">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Full Name</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profileData.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Phone Number</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {profileData.phone_number ? profileData.phone_number.replace(/^\+1/, '') : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email Address</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{profileData.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Date of Birth</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {profileData.birthdate ? new Date(profileData.birthdate).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Gender</p>
              <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                {profileData.gender ? profileData.gender.replace(/_/g, ' ') : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Address</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {typeof profileData.address === 'object' ? profileData.address.formatted || JSON.stringify(profileData.address) : (profileData.address || 'Not provided')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Member Since</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {new Date(profileData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

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
