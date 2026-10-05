import type { Prisma } from '@prisma/client';
import { db } from './db';
import type { Loc } from './auth';

export const cardSelect = {
  id: true, title: true, price: true, condition: true, photos: true, area: true, city: true, canDeliver: true, createdAt: true,
} satisfies Prisma.ListingSelect;

/** Active listings in the user's city — same area first, then newest. (No GPS: "nearby" = same city/area.) */
export async function nearbyListings(loc: Loc | null, take = 8, excludeSellerId?: string) {
  const where: Prisma.ListingWhereInput = { status: 'ACTIVE', ...(loc ? { city: loc.city } : {}), ...(excludeSellerId ? { sellerId: { not: excludeSellerId } } : {}) };
  const rows = await db.listing.findMany({ where, select: cardSelect, orderBy: { createdAt: 'desc' }, take: take * 3 });
  if (loc) rows.sort((a, b) => Number(b.area === loc.area) - Number(a.area === loc.area));
  return rows.slice(0, take);
}

export type BrowseParams = { q?: string; cat?: string; cond?: string; min?: string; max?: string; sort?: string; page?: string };

export const PAGE_SIZE = 16;

export async function browseListings(p: BrowseParams, loc: Loc | null) {
  const where: Prisma.ListingWhereInput = { status: 'ACTIVE' };
  if (loc) where.city = loc.city;
  if (p.q) where.OR = [{ title: { contains: p.q, mode: 'insensitive' } }, { description: { contains: p.q, mode: 'insensitive' } }];
  if (p.cat) where.category = p.cat;
  if (p.cond) where.condition = { in: p.cond.split(',') };
  const min = parseInt(p.min || '', 10);
  const max = parseInt(p.max || '', 10);
  if (Number.isFinite(min) || Number.isFinite(max)) where.price = { ...(Number.isFinite(min) ? { gte: min } : {}), ...(Number.isFinite(max) ? { lte: max } : {}) };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    p.sort === 'price_asc' ? { price: 'asc' } : p.sort === 'price_desc' ? { price: 'desc' } : { createdAt: 'desc' };
  const page = Math.max(1, parseInt(p.page || '1', 10) || 1);

  const total = await db.listing.count({ where });
  let rows = await db.listing.findMany({ where, select: cardSelect, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });
  if ((!p.sort || p.sort === 'nearby') && loc) rows = rows.sort((a, b) => Number(b.area === loc.area) - Number(a.area === loc.area));
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
