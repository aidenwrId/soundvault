import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Get the authenticated user from server context.
 * Returns the user or null.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Require authentication. Returns user or throws a 401 response.
 */
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

/**
 * Get the user's profile from the database.
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}
