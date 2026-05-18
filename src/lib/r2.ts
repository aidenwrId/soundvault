import 'server-only';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

/**
 * Generate a signed URL for uploading a file to R2
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a signed URL for reading/playing a file from R2
 */
export async function getSignedPlaybackUrl(
  key: string,
  expiresIn: number = 900 // 15 minutes
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete an object from R2
 */
export async function deleteR2Object(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3Client.send(command);
}

/**
 * Generate R2 key for a track's original file
 */
export function getOriginalR2Key(userId: string, trackId: string, fileName: string): string {
  return `users/${userId}/tracks/${trackId}/original/${fileName}`;
}

/**
 * Generate R2 key for a track's processed audio
 */
export function getProcessedR2Key(userId: string, trackId: string): string {
  return `users/${userId}/tracks/${trackId}/processed/audio.mp3`;
}

/**
 * Generate R2 key for a track's cover image
 */
export function getCoverR2Key(userId: string, trackId: string): string {
  return `users/${userId}/tracks/${trackId}/cover/cover.jpg`;
}

/**
 * Generate R2 key for a track's waveform data
 */
export function getWaveformR2Key(userId: string, trackId: string): string {
  return `users/${userId}/tracks/${trackId}/waveform/waveform.json`;
}
