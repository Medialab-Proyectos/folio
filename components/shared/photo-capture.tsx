'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Plus } from 'lucide-react';

interface PhotoCaptureProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
}

export default function PhotoCapture({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 4,
  label = 'Photos'
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (photos.length >= maxPhotos) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (photos.length < maxPhotos) {
          onPhotosChange([...photos, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label} ({photos.length}/{maxPhotos})
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-border hover:border-accent rounded-lg flex flex-col items-center justify-center gap-2 transition-colors bg-muted/20 hover:bg-muted/40"
          >
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {photos.length === 0 ? 'Add Photo' : 'Add More'}
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCapture}
        className="hidden"
        multiple={maxPhotos > 1}
      />

      {photos.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Capture up to {maxPhotos} photos using your device camera
        </p>
      )}
    </div>
  );
}
