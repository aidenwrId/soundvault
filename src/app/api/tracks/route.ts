import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    let query = supabase
      .from('tracks')
      .select('*, projects(id, title)')
      .eq('user_id', user.id);

    if (search) {
      query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%`);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'name':
        query = query.order('title', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data: tracks, error } = await query;

    if (error) {
      console.error('Fetch tracks error:', error);
      return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
    }

    return NextResponse.json({ tracks: tracks || [] });
  } catch (error) {
    console.error('Tracks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
