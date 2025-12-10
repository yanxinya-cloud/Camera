import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Aperture } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { PolaroidPhoto } from '../types';

interface RetroCameraProps {
  onPhotoTaken: (photoDataUrl: string) => void;
}

export const RetroCamera: React.FC<RetroCameraProps> = ({ onPhotoTaken }) => {
  const { videoRef, captureImage, hasStream, isLoading } = useCamera();
  const [isFlashing, setIsFlashing] = useState(false);
  const [ejectingPhoto, setEjectingPhoto] = useState<string | null>(null);

  const handleShutter = () => {
    if (!hasStream || ejectingPhoto) return; // Prevent double click while ejecting

    // 1. Flash Effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    // 2. Capture Logic
    const dataUrl = captureImage();
    if (dataUrl) {
      // 3. Start Ejection Animation
      setEjectingPhoto(dataUrl);

      // 4. After ejection animation is done, hand it off to the parent
      setTimeout(() => {
        onPhotoTaken(dataUrl);
        setEjectingPhoto(null);
      }, 1500); // Matches the animation duration
    }
  };

  return (
    <div className="relative w-[320px] z-50">
      
      {/* EJECTING PHOTO LAYER (Behind the camera body but moving up) */}
      <div className="absolute top-0 left-0 w-full h-full flex justify-center pointer-events-none overflow-visible">
        <AnimatePresence>
          {ejectingPhoto && (
            <motion.div
              initial={{ y: 80, opacity: 0 }} // Start slightly inside
              animate={{ y: -220, opacity: 1 }} // Move UP out of the camera
              exit={{ opacity: 0 }} // Fade out when handed off (optional, instant removal is fine too)
              transition={{ 
                duration: 1.5, 
                ease: [0.2, 0.8, 0.2, 1] // Custom ease for "mechanical" feel
              }}
              className="absolute z-[-1] w-[200px] h-[240px] bg-white p-2 pb-6 shadow-md"
            >
              <div className="w-full h-full bg-gray-900 overflow-hidden">
                <img 
                   src={ejectingPhoto} 
                   alt="Developing" 
                   className="w-full h-full object-cover opacity-80 blur-sm brightness-50"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CAMERA BODY */}
      <div className="relative bg-gradient-to-b from-stone-100 to-stone-200 rounded-[3rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-b-8 border-stone-300">
        
        {/* Top Stripe (Retro rainbow stripe) */}
        <div className="absolute top-8 left-0 w-full h-4 flex opacity-80">
          <div className="h-full w-1/5 bg-red-500"></div>
          <div className="h-full w-1/5 bg-orange-400"></div>
          <div className="h-full w-1/5 bg-yellow-400"></div>
          <div className="h-full w-1/5 bg-green-500"></div>
          <div className="h-full w-1/5 bg-blue-500"></div>
        </div>

        {/* Viewfinder Area */}
        <div className="mt-12 mb-6 mx-auto w-64 h-64 bg-black rounded-full border-[12px] border-stone-300 shadow-inner overflow-hidden relative group">
          
          {/* Lens Reflection / Glass Effect */}
          <div className="absolute inset-0 z-20 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
          
          {/* The Video Feed */}
          {hasStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
              {isLoading ? (
                <div className="animate-spin text-stone-300"><Aperture size={32} /></div>
              ) : (
                <div className="text-center p-4">
                  <Camera size={32} className="mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Allow Camera Access</span>
                </div>
              )}
            </div>
          )}

          {/* Flash Overlay */}
          <div 
            className={`absolute inset-0 z-30 bg-white transition-opacity duration-75 ${
              isFlashing ? 'opacity-90' : 'opacity-0 pointer-events-none'
            }`} 
          />
        </div>

        {/* Controls Area */}
        <div className="flex justify-between items-center px-4">
          
          {/* Flash Indicator */}
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" title="Flash Ready" />

          {/* Shutter Button */}
          <button
            onClick={handleShutter}
            disabled={!hasStream || !!ejectingPhoto}
            className={`
              w-16 h-16 rounded-full border-4 border-stone-300 shadow-lg
              flex items-center justify-center transition-all active:scale-95
              ${ejectingPhoto ? 'bg-red-300 cursor-wait' : 'bg-red-500 hover:bg-red-600 cursor-pointer'}
            `}
            aria-label="Take Photo"
          >
            <div className="w-12 h-12 rounded-full border-2 border-red-400/50" />
          </button>

          {/* Viewfinder Fake Element */}
          <div className="w-8 h-8 rounded-lg bg-gray-800 border-2 border-gray-600" />
        </div>

        {/* Output Slot Visualization */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-48 h-2 bg-black/20 rounded-full" />
      </div>
    </div>
  );
};