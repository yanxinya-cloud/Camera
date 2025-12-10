import { useEffect, useRef, useState, useCallback } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setIsLoading(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 640 },
            aspectRatio: 1, // Square for polaroid
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          // If component unmounted while we were waiting, stop tracks immediately
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);
      } catch (err: any) {
        if (isMounted) {
          console.error("Error accessing camera:", err);
          setError("Could not access camera. Please allow permissions.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Separate effect to attach stream to video element
  // This ensures videoRef is populated (after render) before we try to assign srcObject
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    // Set explicit size to ensure quality
    canvas.width = 600;
    canvas.height = 600; 
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const video = videoRef.current;
    
    // Calculate sizing to cover (center crop)
    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    // Flip horizontally for "mirror" effect (standard for selfies)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
      video,
      startX, startY, size, size, // Source
      0, 0, canvas.width, canvas.height // Dest
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  return { videoRef, error, isLoading, captureImage, hasStream: !!stream };
};