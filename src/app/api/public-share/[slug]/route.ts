import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createServiceClient();

    const { data: shareLink, error } = await supabase
      .from('share_links')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !shareLink) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
    }

    // Check if active
    if (!shareLink.is_active) {
      return NextResponse.json({ error: 'This link is no longer active' }, { status: 410 });
    }

    // Check expiration
    const isExpired = shareLink.expires_at && new Date(shareLink.expires_at) < new Date();
    if (isExpired) {
      return NextResponse.json({
        error: 'This link has expired',
        isExpired: true,
      }, { status: 410 });
    }

    const requiresPassword = !!shareLink.password_hash;

    // Fetch the resource
    let resource = null;
    if (shareLink.resource_type === 'track') {
      const { data: track } = await supabase
        .from('tracks')
        .select('id, title, artist, duration_seconds, cover_r2_key, status, created_at')
        .eq('id', shareLink.resource_id)
        .single();
      resource = track;
    } else if (shareLink.resource_type === 'project') {
      const { data: project } = await supabase
        .from('projects')
        .select('id, title, description, cover_r2_key, created_at')
        .eq('id', shareLink.resource_id)
        .single();

      if (project) {
        const { data: tracks } = await supabase
          .from('tracks')
          .select('id, title, artist, duration_seconds, cover_r2_key, status, created_at')
          .eq('project_id', project.id)
          .eq('status', 'ready')
          .order('created_at', { ascending: true });

        resource = { ...project, tracks: tracks || [] };
      }
    }

    // Strip sensitive info from share link
    const safeShareLink = {
      id: shareLink.id,
      resource_type: shareLink.resource_type,
      allow_download: shareLink.allow_download,
      show_artist: shareLink.show_artist,
      show_versions: shareLink.show_versions,
      slug: shareLink.slug,
    };

    return NextResponse.json({
      shareLink: safeShareLink,
      resource,
      requiresPassword,
      isExpired: false,
    });
  } catch (error) {
    console.error('Public share error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
