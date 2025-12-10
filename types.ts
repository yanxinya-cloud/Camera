export interface PolaroidPhoto {
  id: string;
  dataUrl: string; // The captured image data
  timestamp: number;
  x: number; // Initial X position on the wall
  y: number; // Initial Y position on the wall
  rotation: number; // Random rotation for natural feel
}

export interface CameraDimensions {
  width: number;
  height: number;
  slotY: number; // The Y position where the photo ejects from
}