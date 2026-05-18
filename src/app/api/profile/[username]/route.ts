import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const supabase = await createServiceClient();

    // Find profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, banner_url, bio, socials, custom_css, custom_layout')
      .eq('username', username)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get showcased tracks
    const { data: tracks } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_showcased', true)
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    return NextResponse.json({ profile, tracks: tracks || [] });
  } catch (error) {
    console.error('Public profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
