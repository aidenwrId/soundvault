'use client';

import { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2 } from 'lucide-react';

interface CoverUploadProps {
  trackId: string;
  currentCoverKey?: string | null;
  onUploadComplete: (newCoverKey: string) => void;
}

export default function CoverUpload({ trackId, currentCoverKey, onUploadComplete }: CoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to resolve public URL for existing cover
  const coverUrl = currentCoverKey
    ? `/api/images/${currentCoverKey}`
    : null;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG)');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Get signed URL for cover
      const signRes = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cover',
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!signRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, r2Key } = await signRes.json();

      // 2. Upload directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');

      // 3. Update the track record
      const updateRes = await fetch(`/api/tracks/${trackId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverR2Key: r2Key }),
      });

      if (!updateRes.ok) throw new Error('Failed to update track');

      onUploadComplete(r2Key);
    } catch (error) {
      console.error(error);
      alert('There was an error uploading your cover art');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative w-48 h-48 rounded-md overflow-hidden bg-white/5 border-2 border-dashed transition-colors flex flex-col items-center justify-center cursor-pointer group ${
        isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/30'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center text-white/50">
          <Loader2 className="w-8 h-8 mb-2 animate-spin" />
          <span className="text-sm">Uploading...</span>
        </div>
      ) : coverUrl ? (
        <>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10">
            <Upload className="w-6 h-6 text-white mb-1" />
            <span className="text-xs text-white font-medium">Change Cover</span>
          </div>
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        </>
      ) : (
        <div className="flex flex-col items-center text-white/40 group-hover:text-white/70 transition-colors">
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Add Cover Art</span>
          <span className="text-xs mt-1 text-center px-4">Drag image or click</span>
        </div>
      )}
    </div>
  );
}
