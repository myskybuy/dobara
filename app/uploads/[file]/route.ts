import { promises as fs } from 'fs';
import path from 'path';
import { contentTypeFor, UPLOAD_DIR } from '@/lib/storage';

// Serves uploaded listing photos from ./uploads (works in both `next dev` and `next start`).
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-zA-Z0-9-]+\.(jpg|png|webp)$/.test(file)) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), { headers: { 'Content-Type': contentTypeFor(file), 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
