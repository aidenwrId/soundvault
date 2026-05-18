import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteR2Object } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: track, error } = await supabase
      .from('tracks')
      .select('*, projects(id, title), track_versions(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json({ track });
  } catch (error) {
    console.error('Get track error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, artist, projectId, folderId, coverR2Key } = body;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (artist !== undefined) updates.artist = artist;
    if (projectId !== undefined) updates.project_id = projectId;
    if (folderId !== undefined) updates.folder_id = folderId;
    if (coverR2Key !== undefined) updates.cover_r2_key = coverR2Key;

    const { data: track, error } = await supabase
      .from('tracks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json({ track });
  } catch (error) {
    console.error('Update track error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get track to find R2 keys
    const { data: track } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Delete from R2
    const keysToDelete = [
      track.original_r2_key,
      track.audio_r2_key,
      track.cover_r2_key,
      track.waveform_r2_key,
    ].filter(Boolean) as string[];

    await Promise.allSettled(keysToDelete.map((key) => deleteR2Object(key)));

    // Delete from database
    await supabase.from('tracks').delete().eq('id', id).eq('user_id', user.id);

    // Update storage
    const { data: allTracks } = await supabase
      .from('tracks')
      .select('size_bytes')
      .eq('user_id', user.id);
    
    const totalStorage = allTracks?.reduce((acc, t) => acc + (t.size_bytes || 0), 0) || 0;

    await supabase
      .from('profiles')
      .update({ storage_used_bytes: totalStorage })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete track error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
