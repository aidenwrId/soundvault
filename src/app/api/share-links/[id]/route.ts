import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

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
    const updates: Record<string, unknown> = {};

    if (body.allowDownload !== undefined) updates.allow_download = body.allowDownload;
    if (body.showArtist !== undefined) updates.show_artist = body.showArtist;
    if (body.showVersions !== undefined) updates.show_versions = body.showVersions;
    if (body.isActive !== undefined) updates.is_active = body.isActive;
    if (body.expiresAt !== undefined) updates.expires_at = body.expiresAt;
    if (body.password !== undefined) {
      updates.password_hash = body.password ? await bcrypt.hash(body.password, 10) : null;
    }

    const { data: link, error } = await supabase
      .from('share_links')
      .update(updates)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error || !link) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
    }

    return NextResponse.json({ shareLink: link });
  } catch (error) {
    console.error('Update share link error:', error);
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

    const { error } = await supabase
      .from('share_links')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete share link' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete share link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
