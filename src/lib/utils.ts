import { clsx, type ClassValue } from 'clsx';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format seconds into MM:SS or H:MM:SS
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format bytes into human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date to relative or absolute string
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Generate a random slug for share links
 */
export function generateSlug(length: number = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Try to use crypto if available (browser or Node 18+)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback to Math.random for environments where crypto is undefined
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

/**
 * Generate a safe R2 object key from filename
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Allowed audio MIME types
 */
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',        // MP3
  'audio/mp3',         // MP3 alt
  'audio/wav',         // WAV
  'audio/wave',        // WAV alt
  'audio/x-wav',       // WAV alt
  'audio/mp4',         // M4A
  'audio/x-m4a',       // M4A alt
  'audio/flac',        // FLAC
  'audio/x-flac',      // FLAC alt
  'video/mp4',         // MP4 Video
  'video/quicktime',   // MOV Video
  'application/zip',   // ZIP
  'application/x-zip-compressed' // ZIP alt
];

/**
 * Allowed audio file extensions
 */
export const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac', '.mp4', '.mov', '.zip'];

/**
 * Max file size: 500MB
 */
export const MAX_FILE_SIZE = 500 * 1024 * 1024;

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): string | null {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_AUDIO_EXTENSIONS.includes(`.${ext}`)) {
      return 'Invalid file type. Please upload audio, video (MP4/MOV), or ZIP files.';
    }
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`;
  }
  return null;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the app URL
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
