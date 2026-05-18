import { NextRequest, NextResponse } from 'next/server';
import { getSignedPlaybackUrl } from '@/lib/r2';
import { redirect } from 'next/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  let signedUrl: string;
  try {
    const { key } = await params;
    const r2Key = key.join('/');
    
    if (!r2Key) {
      return new NextResponse('Not Found', { status: 404 });
    }

    signedUrl = await getSignedPlaybackUrl(r2Key, 86400); // 24 hours
  } catch (error) {
    console.error('Image fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
  
  redirect(signedUrl);
}
