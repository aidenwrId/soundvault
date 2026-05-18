import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSignedUploadUrl, getOriginalR2Key } from '@/lib/r2';
import { sanitizeFileName, ALLOWED_AUDIO_TYPES, MAX_FILE_SIZE } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, contentType, fileSize, title, artist, projectId, folderId, type = 'track' } = body;

    if (type === 'cover') {
      if (!contentType.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type for cover. Must be an image.' }, { status: 400 });
      }
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit for covers
        return NextResponse.json({ error: 'Cover image too large. Maximum 10MB.' }, { status: 400 });
      }
      
      const safeFileName = sanitizeFileName(fileName);
      const r2Key = `users/${user.id}/covers/${Date.now()}_${safeFileName}`;
      const uploadUrl = await getSignedUploadUrl(r2Key, contentType);
      
      return NextResponse.json({ uploadUrl, r2Key });
    }

    // Validate file type
    if (!ALLOWED_AUDIO_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Accepted: Audio, Video, ZIP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum 500MB.' },
        { status: 400 }
      );
    }

    // Check storage limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used_bytes, storage_limit_bytes')
      .eq('id', user.id)
      .single();

    if (profile && (profile.storage_used_bytes + fileSize) > profile.storage_limit_bytes) {
      return NextResponse.json(
        { error: 'Storage limit exceeded. Upgrade your plan or delete files.' },
        { status: 400 }
      );
    }

    // Create track record with uploading status
    const trackTitle = title || fileName.replace(/\.[^/.]+$/, '');
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .insert({
        user_id: user.id,
        title: trackTitle,
        artist: artist || null,
        project_id: projectId || null,
        folder_id: folderId || null,
        mime_type: contentType,
        size_bytes: fileSize,
        status: 'uploading',
      })
      .select()
      .single();

    if (trackError || !track) {
      console.error('Track creation error:', trackError);
      return NextResponse.json({ error: 'Failed to create track' }, { status: 500 });
    }

    // Generate R2 key and signed URL
    const safeFileName = sanitizeFileName(fileName);
    const r2Key = getOriginalR2Key(user.id, track.id, safeFileName);
    const uploadUrl = await getSignedUploadUrl(r2Key, contentType);

    return NextResponse.json({
      uploadUrl,
      trackId: track.id,
      r2Key,
    });
  } catch (error) {
    console.error('Sign upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
