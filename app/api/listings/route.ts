import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { CATEGORIES, CONDITIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { str, toInt } from '@/lib/format';
import { savePhoto, validatePhoto } from '@/lib/storage';

// Create or edit a listing (multipart form with photos). A route handler is used instead of a
// Server Action so large photo uploads are not limited by the Server Action body size.
export async function POST(req: Request) {
  const base = new URL(req.url).origin;
  const go = (path: string) => NextResponse.redirect(new URL(path, base), 303);
  const user = await getUser();
  if (!user) return go('/login?next=/seller/new');
  if (!user.city || !user.area) return go('/location?next=/seller/new');

  const fd = await req.formData();
  const id = str(fd.get('id'));
  const back = (msg: string) => go(`/seller/new?${id ? 'edit=' + id + '&' : ''}error=${encodeURIComponent(msg)}`);

  const title = str(fd.get('title')).replace(/\s+/g, ' ');
  const category = str(fd.get('category'));
  const condition = str(fd.get('condition'));
  const description = str(fd.get('description'));
  const price = toInt(fd.get('price'));
  const canPickup = str(fd.get('canPickup')) === '1';
  const canDeliver = str(fd.get('canDeliver')) === '1';

  if (title.length < 5) return back('Please write a title of at least 5 characters.');
  if (!CATEGORIES.some((c) => c.key === category)) return back('Please choose a category.');
  if (!CONDITIONS.some((c) => c.key === condition)) return back('Please choose the condition.');
  if (description.length < 20) return back('Please describe the item in at least 20 characters.');
  if (!(price >= 1 && price <= 10_000_000)) return back('Please enter a valid price.');
  if (!canPickup && !canDeliver) return back('Choose at least one way for the buyer to get the item.');

  const files = fd.getAll('photos').filter((f): f is File => typeof f === 'object' && 'size' in f && (f as File).size > 0);
  if (files.length > 8) return back('Please add at most 8 photos.');
  for (const f of files) {
    const e = validatePhoto(f);
    if (e) return back(e);
  }

  const existing = id ? await db.listing.findUnique({ where: { id } }) : null;
  if (id && (!existing || existing.sellerId !== user.id)) return go('/seller/listings');
  if (existing?.status === 'SOLD' || existing?.status === 'RESERVED') return go('/seller/listings');
  if (!existing && files.length === 0) return back('Please add at least one photo.');

  const photos = files.length ? await Promise.all(files.map(savePhoto)) : existing!.photos;
  const data = { title, category, condition, description, price, canPickup, canDeliver, photos, city: user.city, area: user.area, status: 'PENDING_REVIEW' as const, rejectReason: null };

  if (existing) await db.listing.update({ where: { id }, data });
  else await db.listing.create({ data: { ...data, sellerId: user.id } });
  return go('/seller/listings?tab=PENDING_REVIEW&saved=1');
}
