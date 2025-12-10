import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';
import { PolaroidPhoto } from '../types';

interface PolaroidProps {
  photo: PolaroidPhoto;
  onDelete: (id: string) => void;
}

export const Polaroid: React.FC<PolaroidProps> = ({ photo, onDelete }) => {
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Trigger the developing effect on mount
  useEffect(() => {
    // Start the developing process. 
    // The photo starts dark/blurry and slowly resolves.
    const timer = setTimeout(() => {
      setIsDeveloped(true);
    }, 500); // Start developing shortly after ejection starts
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag start
    
    // Create a temporary canvas to composite the Polaroid
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 780; // Classic ratio approx
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load image
    const img = new Image();
    img.src = photo.dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Draw Photo
    const margin = 40;
    const photoSize = 560; // 640 - 40 - 40
    ctx.drawImage(img, margin, margin, photoSize, photoSize);

    // Draw Text (Timestamp)
    ctx.fillStyle = '#555555';
    ctx.font = '30px "Permanent Marker", cursive';
    const dateStr = new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(dateStr, margin + 20, 740);

    // Trigger Download
    const link = document.createElement('a');
    link.download = `polaroid-${photo.id}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  // Camera slot calculation for "Start" position.
  // Camera is bottom-left. Center X approx 192px. 
  // Photo width 240px. Left = 192 - 120 = 72px.
  // Camera top edge approx windowHeight - 480px.
  // We spawn deep inside the camera.
  const startX = 72;
  const startY = typeof window !== 'undefined' ? window.innerHeight - 300 : 0;

  return (
    <motion.div
      layoutId={photo.id}
      initial={{ 
        x: startX, 
        y: startY, 
        rotate: 0, 
        scale: 0.9, 
        zIndex: 20 // Behind camera (which is z-50)
      }}
      animate={{ 
        x: photo.x, 
        y: photo.y, 
        rotate: photo.rotation, 
        scale: 1,
        zIndex: 20 // Stays relatively low until dragged
      }}
      transition={{
        duration: 1.8, // Slow mechanical ejection
        ease: [0.2, 0.8, 0.2, 1], // Custom ease for "pushing out" feel
      }}
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.05, zIndex: 100, rotate: 0, cursor: 'grabbing' }}
      whileHover={{ scale: 1.02, zIndex: 60, cursor: 'grab' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="absolute flex flex-col items-center bg-white p-3 pb-8 shadow-xl origin-bottom"
      style={{
        width: '240px',
        height: '290px',
        borderRadius: '2px',
        boxShadow: '2px 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {/* The Photo Area */}
      <div className="relative w-full aspect-square bg-gray-900 overflow-hidden mb-2 border border-gray-100">
        <img
          src={photo.dataUrl}
          alt="Polaroid"
          className={`w-full h-full object-cover transition-all duration-[5000ms] ease-out ${
            isDeveloped 
              ? 'brightness-100 blur-0 grayscale-0 contrast-100 sepia-[0.2]' 
              : 'brightness-[0.1] blur-[8px] grayscale-[0.8] contrast-[2] sepia-[0.6]'
          }`}
          draggable={false}
        />
        
        {/* Glossy Overlay Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        
        {/* Developing Chemistry Texture (Subtle pattern overlay while developing) */}
        {!isDeveloped && (
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        )}
      </div>

      {/* Handwritten Label placeholder or Timestamp */}
      <div className="w-full px-2 flex justify-between items-center mt-1">
        <span className="font-['Permanent_Marker'] text-gray-500 text-sm opacity-80 select-none">
          {new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        
        {/* Actions (Only visible on hover) */}
        <div className={`flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={handleDownload}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            title="Save Image"
          >
            <Download size={14} />
          </button>
          <button 
            onPointerDown={(e) => {
                e.stopPropagation();
                onDelete(photo.id);
            }}
            className="p-1.5 bg-red-50 hover:bg-red-100 rounded-full text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};