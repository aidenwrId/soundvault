import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { trackId, r2Key, title, artist, durationSeconds } = body;

    if (!trackId || !r2Key) {
      return NextResponse.json({ error: 'Missing trackId or r2Key' }, { status: 400 });
    }

    // Verify the track belongs to the user
    const { data: existingTrack } = await supabase
      .from('tracks')
      .select('id, user_id, size_bytes')
      .eq('id', trackId)
      .eq('user_id', user.id)
      .single();

    if (!existingTrack) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Update track status to ready
    const updates: Record<string, unknown> = {
      original_r2_key: r2Key,
      audio_r2_key: r2Key, // For MVP, original is also the playback file
      status: 'ready',
    };

    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (durationSeconds) updates.duration_seconds = durationSeconds;

    const { data: track, error } = await supabase
      .from('tracks')
      .update(updates)
      .eq('id', trackId)
      .select()
      .single();

    if (error) {
      console.error('Complete upload error:', error);
      return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
    }

    // Update storage usage
    try {
      const { data: allTracks } = await supabase
        .from('tracks')
        .select('size_bytes')
        .eq('user_id', user.id);
      
      const totalStorage = allTracks?.reduce((acc, t) => acc + (t.size_bytes || 0), 0) || 0;

      await supabase
        .from('profiles')
        .update({ storage_used_bytes: totalStorage })
        .eq('id', user.id);
    } catch {
      // Storage update failed, non-critical
    }

    return NextResponse.json({ track });
  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
