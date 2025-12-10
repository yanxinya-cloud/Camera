import React, { useState } from 'react';
import { RetroCamera } from './components/RetroCamera';
import { Polaroid } from './components/Polaroid';
import { PolaroidPhoto } from './types';
import { Info } from 'lucide-react';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PolaroidPhoto[]>([]);

  const handlePhotoTaken = (dataUrl: string) => {
    // Reverted calculation logic
    const randomRotation = Math.random() * 6 - 3; 
    
    const newPhoto: PolaroidPhoto = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: Date.now(),
      // Revert Y position to original lower value (approx 450px from bottom)
      x: 72 + (Math.random() * 10 - 5), 
      y: window.innerHeight - 450 - (Math.random() * 20),
      rotation: randomRotation,
    };

    setPhotos((prev) => [...prev, newPhoto]);
  };

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter(p => p.id !== id));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-100">
      
      {/* Background Texture (Corkboard or Wall) */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#d6d3d1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} 
      />

      {/* Header / Info */}
      <div className="absolute top-4 left-6 z-10">
         <h1 className="text-2xl font-['Permanent_Marker'] text-stone-600 flex items-center gap-2">
           RetroInsta <span className="text-xs font-sans bg-stone-200 px-2 py-1 rounded text-stone-500">v1.0</span>
         </h1>
      </div>

      <div className="absolute top-4 right-6 z-10 group">
        <button className="p-2 bg-white/50 backdrop-blur rounded-full hover:bg-white text-stone-500 shadow-sm transition-all">
          <Info size={20} />
        </button>
        <div className="absolute right-0 top-12 w-64 p-4 bg-white shadow-xl rounded-lg text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          <p>1. Allow camera access.</p>
          <p>2. Click the red button to snap.</p>
          <p>3. Wait for the photo to eject.</p>
          <p>4. Drag photos around the wall.</p>
          <p>5. Hover to download or delete.</p>
        </div>
      </div>

      {/* Photo Wall Area */}
      <div className="absolute inset-0 z-10">
        {photos.map((photo) => (
          <Polaroid 
            key={photo.id} 
            photo={photo} 
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Camera UI Fixed to Bottom Left */}
      <div className="absolute bottom-8 left-8 z-50">
        <RetroCamera onPhotoTaken={handlePhotoTaken} />
      </div>

    </div>
  );
};

export default App;