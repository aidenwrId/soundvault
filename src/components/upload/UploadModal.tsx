'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, FileAudio, CheckCircle2 } from 'lucide-react';
import { validateAudioFile, formatFileSize, cn } from '@/lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: { id: string; title: string }[];
  onUploadComplete?: () => void;
}

interface UploadingFile {
  file: File;
  title: string;
  artist: string;
  projectId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  coverFile?: File;
  coverPreview?: string;
}

export default function UploadModal({ isOpen, onClose, projects = [], onUploadComplete }: UploadModalProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles: UploadingFile[] = Array.from(newFiles).map((file) => {
      const error = validateAudioFile(file);
      return {
        file, title: file.name.replace(/\.[^/.]+$/, ''), artist: '', projectId: '',
        progress: 0, status: error ? 'error' as const : 'pending' as const, error: error || undefined,
      };
    });
    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const handleCoverSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const preview = URL.createObjectURL(file);
    updateFile(index, { coverFile: file, coverPreview: preview });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleUpload = async (index: number) => {
    const item = files[index];
    if (item.status !== 'pending') return;
    setFiles((p) => p.map((f, i) => i === index ? { ...f, status: 'uploading', progress: 0 } : f));
    try {
      const signRes = await fetch('/api/uploads/sign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: item.file.name, contentType: item.file.type || 'audio/mpeg', fileSize: item.file.size, title: item.title, artist: item.artist || undefined, projectId: item.projectId || undefined }),
      });
      if (!signRes.ok) throw new Error((await signRes.json()).error || 'Failed');
      const { uploadUrl, trackId, r2Key } = await signRes.json();
      setFiles((p) => p.map((f, i) => i === index ? { ...f, progress: 10 } : f));
      let coverR2Key: string | undefined;

      if (item.coverFile) {
        try {
          const cRes = await fetch('/api/uploads/sign', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'cover', fileName: item.coverFile.name, contentType: item.coverFile.type, fileSize: item.coverFile.size })
          });
          if (cRes.ok) {
            const { uploadUrl: cUrl, r2Key: cKey } = await cRes.json();
            await fetch(cUrl, { method: 'PUT', headers: { 'Content-Type': item.coverFile.type }, body: item.coverFile });
            coverR2Key = cKey;
          }
        } catch (e) {
          console.warn('Cover upload failed', e);
        }
      }

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => { if (e.lengthComputable) { setFiles((p) => p.map((f, i) => i === index ? { ...f, progress: Math.round((e.loaded / e.total) * 80) + 10 } : f)); } });
        xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed')));
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('PUT', uploadUrl); xhr.setRequestHeader('Content-Type', item.file.type || 'audio/mpeg'); xhr.send(item.file);
      });
      let dur: number | undefined;
      try { const u = URL.createObjectURL(item.file); const a = new Audio(u); dur = await new Promise<number>((r) => { a.addEventListener('loadedmetadata', () => { r(Math.round(a.duration)); URL.revokeObjectURL(u); }); a.addEventListener('error', () => { r(0); URL.revokeObjectURL(u); }); }); } catch {}
      await fetch('/api/uploads/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId, r2Key, coverR2Key, title: item.title, artist: item.artist || undefined, durationSeconds: dur }) });
      setFiles((p) => p.map((f, i) => i === index ? { ...f, progress: 100, status: 'complete' } : f));
      onUploadComplete?.();
    } catch (err) {
      setFiles((p) => p.map((f, i) => i === index ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' } : f));
    }
  };

  const handleUploadAll = () => files.forEach((_, i) => { if (files[i].status === 'pending') handleUpload(i); });
  const removeFile = (index: number) => setFiles((p) => p.filter((_, i) => i !== index));
  const updateFile = (index: number, u: Partial<UploadingFile>) => setFiles((p) => p.map((f, i) => i === index ? { ...f, ...u } : f));

  if (!isOpen) return null;
  const pendingCount = files.filter((f) => f.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-vault-900 border border-vault-700/50 rounded-2xl shadow-2xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-800/60">
          <h2 className="text-lg font-semibold text-vault-50">Upload Tracks</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-vault-800 text-vault-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
            className={cn('border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer', isDragging ? 'border-accent-blue bg-accent-blue/5' : 'border-vault-700 hover:border-vault-500')}
            onClick={() => document.getElementById('file-input')?.click()}>
            <input id="file-input" type="file" multiple accept=".mp3,.wav,.m4a,.flac,audio/*" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
            <Upload className={cn('w-10 h-10 mx-auto mb-3', isDragging ? 'text-accent-blue' : 'text-vault-500')} />
            <p className="text-sm text-vault-300 font-medium">Drag & drop audio files here, or click to browse</p>
            <p className="text-xs text-vault-500 mt-1">MP3, WAV, M4A, FLAC — up to 500MB each</p>
          </div>
          {files.map((item, index) => (
            <div key={index} className="bg-vault-800/50 border border-vault-700/40 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="relative w-14 h-14 rounded-lg bg-vault-700 flex items-center justify-center flex-shrink-0 group overflow-hidden border border-vault-600/30">
                  {item.coverPreview ? (
                    <img src={item.coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : item.status === 'complete' ? (
                    <CheckCircle2 className="w-6 h-6 text-accent-green" />
                  ) : item.status === 'error' ? (
                    <X className="w-6 h-6 text-accent-red" />
                  ) : (
                    <FileAudio className="w-6 h-6 text-vault-400" />
                  )}
                  {item.status === 'pending' && (
                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] text-white text-center leading-tight">
                      <span>Add<br/>Cover</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverSelect(index, e)} />
                    </label>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <input type="text" value={item.title} onChange={(e) => updateFile(index, { title: e.target.value })} placeholder="Track title" disabled={item.status !== 'pending'} className="w-full bg-transparent text-sm text-vault-100 font-medium focus:outline-none disabled:opacity-60" />
                  <div className="flex gap-2">
                    <input type="text" value={item.artist} onChange={(e) => updateFile(index, { artist: e.target.value })} placeholder="Artist name" disabled={item.status !== 'pending'} className="flex-1 bg-vault-800 border border-vault-700/50 rounded-lg px-3 py-1.5 text-xs text-vault-200 focus:outline-none disabled:opacity-60" />
                    {projects.length > 0 && <select value={item.projectId} onChange={(e) => updateFile(index, { projectId: e.target.value })} disabled={item.status !== 'pending'} className="flex-1 bg-vault-800 border border-vault-700/50 rounded-lg px-3 py-1.5 text-xs text-vault-200 focus:outline-none disabled:opacity-60"><option value="">No project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-vault-500"><span>{formatFileSize(item.file.size)}</span>{item.error && <span className="text-accent-red">{item.error}</span>}</div>
                </div>
                <button onClick={() => removeFile(index)} className="p-1 text-vault-500 hover:text-vault-300" disabled={item.status === 'uploading'}><X className="w-4 h-4" /></button>
              </div>
              {(item.status === 'uploading' || item.status === 'complete') && <div className="h-1.5 bg-vault-700 rounded-full overflow-hidden"><div className={cn('h-full rounded-full transition-all duration-300', item.status === 'complete' ? 'bg-accent-green' : 'bg-accent-blue')} style={{ width: `${item.progress}%` }} /></div>}
            </div>
          ))}
        </div>
        {files.length > 0 && (
          <div className="px-6 py-4 border-t border-vault-800/60 flex items-center justify-between">
            <span className="text-sm text-vault-400">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            <button onClick={handleUploadAll} disabled={pendingCount === 0} className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all', pendingCount > 0 ? 'bg-accent-blue hover:bg-accent-blue-light text-white' : 'bg-vault-700 text-vault-500 cursor-not-allowed')}><Upload className="w-4 h-4" />Upload {pendingCount > 0 ? `(${pendingCount})` : 'All'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
