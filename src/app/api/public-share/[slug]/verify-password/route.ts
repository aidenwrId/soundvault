import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: shareLink } = await supabase
      .from('share_links')
      .select('password_hash, is_active, expires_at')
      .eq('slug', slug)
      .single();

    if (!shareLink) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
    }

    if (!shareLink.is_active) {
      return NextResponse.json({ error: 'This link is no longer active' }, { status: 410 });
    }

    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
    }

    if (!shareLink.password_hash) {
      return NextResponse.json({ verified: true });
    }

    const isValid = await bcrypt.compare(password, shareLink.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
    }

    // Return a simple token (slug + timestamp hash) for session
    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Verify password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
