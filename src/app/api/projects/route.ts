import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, tracks(count)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Transform count
    const projectsWithCount = (projects || []).map((p: Record<string, unknown>) => ({
      ...p,
      track_count: Array.isArray(p.tracks) && p.tracks.length > 0
        ? (p.tracks[0] as { count: number }).count
        : 0,
      tracks: undefined,
    }));

    return NextResponse.json({ projects: projectsWithCount });
  } catch (error) {
    console.error('Projects error:', error);
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
    const { title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
