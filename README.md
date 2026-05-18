# SoundVault — Private Music Sharing Platform

A full-stack music sharing web app for artists to upload, organize, preview, and share unreleased music. Built with Next.js 14+, Supabase, and Cloudflare R2.

## Features

- **Authentication** — Email/password signup, login, and password reset via Supabase Auth
- **Upload** — Drag-and-drop audio uploads (MP3, WAV, M4A, FLAC) directly to Cloudflare R2 via signed URLs
- **Library** — Grid/list view of all tracks with search, sort, and filter
- **Audio Player** — Global sticky player with play/pause, seek, volume, speed control, and loop
- **Projects** — Organize tracks into projects with descriptions
- **Share Links** — Generate public shareable links with password protection, download controls, and expiration
- **Public Playback** — Clean public player for shared tracks/projects (no login required)
- **Settings** — Profile management, storage usage tracking
- **Security** — Signed URLs for uploads/playback, RLS policies, password hashing, short-lived URLs

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase (PostgreSQL + Auth)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Icons**: Lucide React

## Setup

### 1. Clone and Install

```bash
cd soundvault
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Settings > Database** and copy the connection string → `DATABASE_URL`
5. In **Authentication > URL Configuration**, add your app URL as a redirect URL

### 3. Cloudflare R2 Setup

1. Go to [Cloudflare Dashboard > R2](https://dash.cloudflare.com/)
2. Create a new R2 bucket (e.g., `soundvault`)
3. Create an API token with **Object Read & Write** permissions
4. Copy your Account ID, Access Key ID, and Secret Access Key
5. Configure CORS on your bucket:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
soundvault/
├── middleware.ts                    # Auth session refresh + route protection
├── supabase/migrations/            # Database schema SQL
├── src/
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── (auth)/                 # Login, signup, forgot password
│   │   ├── (dashboard)/            # Authenticated pages with sidebar
│   │   │   ├── library/            # Track library
│   │   │   ├── projects/           # Projects list + detail
│   │   │   ├── track/[trackId]/    # Track detail
│   │   │   ├── shared/             # Share links management
│   │   │   └── settings/           # User settings
│   │   ├── s/[slug]/               # Public share pages
│   │   └── api/                    # API routes
│   ├── components/                 # React components
│   │   ├── layout/                 # Sidebar, Topbar
│   │   ├── player/                 # AudioPlayer, Provider
│   │   ├── tracks/                 # TrackCard, TrackList, Waveform
│   │   ├── upload/                 # UploadModal
│   │   ├── projects/               # ProjectCard, CreateProjectModal
│   │   ├── share/                  # ShareModal, PasswordGate
│   │   └── ui/                     # EmptyState, ConfirmDelete, Storage, Skeleton
│   ├── lib/                        # Utilities and clients
│   │   ├── supabase/               # Browser, server, middleware clients
│   │   ├── r2.ts                   # Cloudflare R2 signed URL helpers
│   │   ├── auth.ts                 # Auth helpers
│   │   └── utils.ts                # Formatting, validation, utilities
│   └── types/                      # TypeScript type definitions
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/uploads/sign` | Yes | Get signed upload URL |
| POST | `/api/uploads/complete` | Yes | Mark upload complete |
| GET | `/api/tracks` | Yes | List user's tracks |
| GET | `/api/tracks/[id]` | Yes | Get track detail |
| GET | `/api/tracks/[id]/play-url` | Yes/Share | Get signed playback URL |
| DELETE | `/api/tracks/[id]` | Yes | Delete track |
| GET/POST | `/api/projects` | Yes | List/create projects |
| GET/PATCH/DELETE | `/api/projects/[id]` | Yes | Project CRUD |
| GET/POST | `/api/share-links` | Yes | List/create share links |
| PATCH/DELETE | `/api/share-links/[id]` | Yes | Update/delete share link |
| GET | `/api/public-share/[slug]` | No | Get public share data |
| POST | `/api/public-share/[slug]/verify-password` | No | Verify share password |
| GET/PATCH | `/api/profile` | Yes | Get/update profile |

## Security

- R2 bucket is **private** — all access via signed URLs
- Upload URLs expire in 1 hour
- Playback URLs expire in 15 minutes
- All R2 credentials are server-only (never sent to client)
- Share passwords are bcrypt-hashed
- Row Level Security on all tables
- Users can only access their own data
- File type and size validation on both client and server

## License

MIT
