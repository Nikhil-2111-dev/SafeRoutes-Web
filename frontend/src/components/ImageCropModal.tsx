'use client';
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';
import { X, Crop as CropIcon } from 'lucide-react';

interface ImageCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onClose: () => void;
}

export default function ImageCropModal({ imageSrc, onCropComplete, onClose }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBase64) {
        onCropComplete(croppedBase64);
      }
    } catch (e) {
      console.error('Error cropping image:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-black border border-white/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold tracking-widest text-white uppercase">Crop Image</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[300px] sm:h-[400px] bg-[#050505]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square aspect ratio
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-zinc-500 font-bold uppercase tracking-wider">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full sm:w-1/3 py-3 rounded-xl font-bold border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all uppercase text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="w-full sm:flex-1 py-3 rounded-xl font-bold bg-[#00dfc0] hover:bg-[#00c9ad] text-slate-950 shadow-[0_0_15px_rgba(0,223,192,0.3)] hover:shadow-[0_0_25px_rgba(0,223,192,0.5)] transition-all disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest text-xs active:scale-[0.98] cursor-pointer"
            >
              {isProcessing ? 'Processing...' : 'Crop & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
