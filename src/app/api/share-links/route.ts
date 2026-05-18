import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: links, error } = await supabase
      .from('share_links')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch share links' }, { status: 500 });
    }

    return NextResponse.json({ shareLinks: links || [] });
  } catch (error) {
    console.error('Share links error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      resourceType,
      resourceId,
      allowDownload = false,
      showArtist = true,
      showVersions = false,
      password,
      expiresAt,
    } = body;

    if (!resourceType || !resourceId) {
      return NextResponse.json({ error: 'resourceType and resourceId are required' }, { status: 400 });
    }

    // Verify ownership of the resource
    const table = resourceType === 'track' ? 'tracks' : resourceType === 'project' ? 'projects' : 'folders';
    const userField = resourceType === 'track' ? 'user_id' : resourceType === 'project' ? 'user_id' : 'user_id';

    const { data: resource } = await supabase
      .from(table)
      .select('id')
      .eq('id', resourceId)
      .eq(userField, user.id)
      .single();

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const slug = generateSlug();
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const { data: link, error } = await supabase
      .from('share_links')
      .insert({
        owner_id: user.id,
        resource_type: resourceType,
        resource_id: resourceId,
        slug,
        password_hash: passwordHash,
        allow_download: allowDownload,
        show_artist: showArtist,
        show_versions: showVersions,
        expires_at: expiresAt || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Create share link error:', error);
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }

    return NextResponse.json({ shareLink: link }, { status: 201 });
  } catch (error) {
    console.error('Share link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
