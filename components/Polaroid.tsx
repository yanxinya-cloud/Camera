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
    // Start the developing process slightly after mount
    const timer = setTimeout(() => {
      setIsDeveloped(true);
    }, 100);
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
    
    // Draw texture (subtle noise) - optional, skipping for performance/simplicity
    
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

  return (
    <motion.div
      layoutId={photo.id}
      // Restore previous entrance animation
      initial={{ 
        x: photo.x, 
        y: photo.y, 
        rotate: photo.rotation, 
        scale: 0.8, 
        opacity: 0 
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
      }}
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.1, zIndex: 100, rotate: 0, cursor: 'grabbing' }}
      whileHover={{ scale: 1.02, zIndex: 50, cursor: 'grab' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="absolute flex flex-col items-center bg-white p-3 pb-8 shadow-xl"
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
              ? 'brightness-100 blur-0 grayscale-0 contrast-100' 
              : 'brightness-[0.2] blur-[4px] grayscale-[0.8] contrast-[1.5]'
          }`}
          draggable={false}
        />
        
        {/* Glossy Overlay Reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
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