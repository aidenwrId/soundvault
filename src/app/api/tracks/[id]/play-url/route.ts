import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSignedPlaybackUrl } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user owns the track
    if (user) {
      const { data: track } = await supabase
        .from('tracks')
        .select('audio_r2_key, status')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (track?.audio_r2_key && track.status === 'ready') {
        const url = await getSignedPlaybackUrl(track.audio_r2_key);
        return NextResponse.json({ url });
      }
    }

    // Check if there's a valid share link (for public access)
    const shareToken = request.headers.get('x-share-token');
    if (shareToken) {
      const serviceSupabase = await createServiceClient();
      
      // Find a share link that covers this track
      const { data: shareLink } = await serviceSupabase
        .from('share_links')
        .select('*')
        .eq('resource_type', 'track')
        .eq('resource_id', id)
        .eq('is_active', true)
        .single();

      if (shareLink) {
        // Check expiration
        if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
          return NextResponse.json({ error: 'Share link expired' }, { status: 403 });
        }

        const { data: track } = await serviceSupabase
          .from('tracks')
          .select('audio_r2_key, status')
          .eq('id', id)
          .single();

        if (track?.audio_r2_key && track.status === 'ready') {
          const url = await getSignedPlaybackUrl(track.audio_r2_key);
          return NextResponse.json({ url });
        }
      }
    }

    return NextResponse.json({ error: 'Track not found or not accessible' }, { status: 404 });
  } catch (error) {
    console.error('Play URL error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
