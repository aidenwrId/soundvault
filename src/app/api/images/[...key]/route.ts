import { NextRequest, NextResponse } from 'next/server';
import { getSignedPlaybackUrl } from '@/lib/r2';
import { redirect } from 'next/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const r2Key = key.join('/');
    
    if (!r2Key) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const signedUrl = await getSignedPlaybackUrl(r2Key, 86400); // 24 hours
    redirect(signedUrl);
  } catch (error) {
    console.error('Image fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
