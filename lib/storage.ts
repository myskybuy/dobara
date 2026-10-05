import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// Uploaded photos are stored on local disk in ./uploads and served by app/uploads/[file]/route.ts.
// To move to S3/Cloudinary later, only this file needs to change.
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const ALLOWED: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function validatePhoto(f: File): string | null {
  if (!ALLOWED[f.type]) return `${f.name}: only JPG, PNG or WEBP photos are allowed`;
  if (f.size > MAX_PHOTO_BYTES) return `${f.name}: photo is larger than 5 MB`;
  return null;
}

export async function savePhoto(f: File): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = crypto.randomUUID() + ALLOWED[f.type];
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await f.arrayBuffer()));
  return '/uploads/' + name;
}

export function contentTypeFor(file: string) {
  const ext = path.extname(file).toLowerCase();
  return ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
}
