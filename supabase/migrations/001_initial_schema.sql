-- ============================================================
-- SoundVault Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  username text unique,
  display_name text,
  avatar_url text,
  storage_used_bytes bigint default 0,
  storage_limit_bytes bigint default 5368709120, -- 5 GB default
  created_at timestamptz default now() not null
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- PROJECTS
-- ============================================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  cover_r2_key text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.projects enable row level security;

create policy "Users can CRUD own projects"
  on public.projects for all
  using (auth.uid() = user_id);

-- ============================================================
-- FOLDERS
-- ============================================================
create table public.folders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade,
  parent_folder_id uuid references public.folders(id) on delete cascade,
  name text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.folders enable row level security;

create policy "Users can CRUD own folders"
  on public.folders for all
  using (auth.uid() = user_id);

-- ============================================================
-- TRACKS
-- ============================================================
create type track_status as enum ('uploading', 'processing', 'ready', 'failed');

create table public.tracks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  folder_id uuid references public.folders(id) on delete set null,
  title text not null,
  artist text,
  duration_seconds real,
  original_r2_key text,
  audio_r2_key text,
  cover_r2_key text,
  waveform_r2_key text,
  mime_type text,
  size_bytes bigint default 0,
  status track_status default 'uploading' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.tracks enable row level security;

create policy "Users can CRUD own tracks"
  on public.tracks for all
  using (auth.uid() = user_id);

-- ============================================================
-- TRACK VERSIONS
-- ============================================================
create table public.track_versions (
  id uuid default uuid_generate_v4() primary key,
  track_id uuid references public.tracks(id) on delete cascade not null,
  version_number integer not null,
  title text,
  audio_r2_key text not null,
  original_r2_key text,
  notes text,
  created_at timestamptz default now() not null
);

alter table public.track_versions enable row level security;

create policy "Users can manage own track versions"
  on public.track_versions for all
  using (
    exists (
      select 1 from public.tracks
      where tracks.id = track_versions.track_id
      and tracks.user_id = auth.uid()
    )
  );

-- ============================================================
-- SHARE LINKS
-- ============================================================
create type resource_type as enum ('track', 'project', 'folder');

create table public.share_links (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  resource_type resource_type not null,
  resource_id uuid not null,
  slug text unique not null,
  password_hash text,
  allow_download boolean default false,
  show_artist boolean default true,
  show_versions boolean default false,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.share_links enable row level security;

create policy "Users can CRUD own share links"
  on public.share_links for all
  using (auth.uid() = owner_id);

-- ============================================================
-- COMMENTS
-- ============================================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  track_id uuid references public.tracks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  timestamp_seconds real,
  body text not null,
  created_at timestamptz default now() not null
);

alter table public.comments enable row level security;

create policy "Users can manage own comments"
  on public.comments for all
  using (auth.uid() = user_id);

create policy "Users can view comments on own tracks"
  on public.comments for select
  using (
    exists (
      select 1 from public.tracks
      where tracks.id = comments.track_id
      and tracks.user_id = auth.uid()
    )
  );

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();

create trigger update_folders_updated_at
  before update on public.folders
  for each row execute function public.update_updated_at();

create trigger update_tracks_updated_at
  before update on public.tracks
  for each row execute function public.update_updated_at();

create trigger update_share_links_updated_at
  before update on public.share_links
  for each row execute function public.update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_tracks_user_id on public.tracks(user_id);
create index idx_tracks_project_id on public.tracks(project_id);
create index idx_tracks_status on public.tracks(status);
create index idx_projects_user_id on public.projects(user_id);
create index idx_folders_user_id on public.folders(user_id);
create index idx_folders_project_id on public.folders(project_id);
create index idx_share_links_slug on public.share_links(slug);
create index idx_share_links_owner_id on public.share_links(owner_id);
create index idx_comments_track_id on public.comments(track_id);
