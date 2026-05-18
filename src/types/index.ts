// ============================================================
// SoundVault Type Definitions
// ============================================================

export type TrackStatus = 'uploading' | 'processing' | 'ready' | 'failed';
export type ResourceType = 'track' | 'project' | 'folder';
export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'name';

// ---- Database row types ----

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_r2_key: string | null;
  created_at: string;
  updated_at: string;
  track_count?: number;
}

export interface Folder {
  id: string;
  user_id: string;
  project_id: string | null;
  parent_folder_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  user_id: string;
  project_id: string | null;
  folder_id: string | null;
  title: string;
  artist: string | null;
  duration_seconds: number | null;
  original_r2_key: string | null;
  audio_r2_key: string | null;
  cover_r2_key: string | null;
  waveform_r2_key: string | null;
  mime_type: string | null;
  size_bytes: number;
  status: TrackStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  project?: Project;
}

export interface TrackVersion {
  id: string;
  track_id: string;
  version_number: number;
  title: string | null;
  audio_r2_key: string;
  original_r2_key: string | null;
  notes: string | null;
  created_at: string;
}

export interface ShareLink {
  id: string;
  owner_id: string;
  resource_type: ResourceType;
  resource_id: string;
  slug: string;
  password_hash: string | null;
  allow_download: boolean;
  show_artist: boolean;
  show_versions: boolean;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  track?: Track;
  project?: Project;
}

export interface Comment {
  id: string;
  track_id: string;
  user_id: string;
  timestamp_seconds: number | null;
  body: string;
  created_at: string;
  // Joined
  profile?: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>;
}

// ---- API request/response types ----

export interface SignUploadRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
  title?: string;
  artist?: string;
  projectId?: string;
  folderId?: string;
}

export interface SignUploadResponse {
  uploadUrl: string;
  trackId: string;
  r2Key: string;
}

export interface CompleteUploadRequest {
  trackId: string;
  r2Key: string;
  title: string;
  artist?: string;
  durationSeconds?: number;
}

export interface CreateShareLinkRequest {
  resourceType: ResourceType;
  resourceId: string;
  allowDownload?: boolean;
  showArtist?: boolean;
  showVersions?: boolean;
  password?: string;
  expiresAt?: string;
}

export interface PublicShareData {
  shareLink: ShareLink;
  track?: Track;
  project?: Project & { tracks?: Track[] };
  requiresPassword: boolean;
  isExpired: boolean;
}

// ---- Audio player types ----

export interface PlayerState {
  track: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  speed: number;
  isLooped: boolean;
  error: string | null;
  playbackUrl: string | null;
}

export interface PlayerActions {
  playTrack: (track: Track, url?: string) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setSpeed: (speed: number) => void;
  toggleLoop: () => void;
  stop: () => void;
}
