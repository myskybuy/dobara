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

export type BrowseParams = { q?: string; cat?: string; cond?: string; min?: string; max?: string; sort?: string; page?: string; seller?: string };

export const PAGE_SIZE = 16;

export async function browseListings(p: BrowseParams, loc: Loc | null) {
  const where: Prisma.ListingWhereInput = { status: 'ACTIVE' };
  // A seller's shop page (?seller=) shows all their live items, wherever they are.
  if (p.seller) where.sellerId = p.seller;
  else if (loc) where.city = loc.city;
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

/** Approved sellers with live listings in a city — most-reviewed first. Used for the "Verified sellers" home section. */
export async function verifiedSellers(city: string, take = 6, excludeUserId?: string) {
  const sellers = await db.user.findMany({
    where: { sellerStatus: 'APPROVED', isBlocked: false, ...(excludeUserId ? { id: { not: excludeUserId } } : {}), listings: { some: { status: 'ACTIVE', city } } },
    select: {
      id: true, name: true, area: true, city: true, createdAt: true,
      listings: { where: { status: 'ACTIVE', city }, select: { photos: true, category: true }, orderBy: { createdAt: 'desc' } },
      _count: { select: { sellerOrders: { where: { status: 'COMPLETED' } } } },
    },
  });
  const ratings = await db.review.groupBy({ by: ['toUserId'], where: { toUserId: { in: sellers.map((s) => s.id) } }, _avg: { rating: true }, _count: true });
  const byId = new Map(ratings.map((r) => [r.toUserId, r]));
  return sellers
    .map((s) => ({
      id: s.id, name: s.name, area: s.area, city: s.city, since: s.createdAt,
      live: s.listings.length, deals: s._count.sellerOrders,
      photos: s.listings.slice(0, 3).map((l) => l.photos[0]),
      categories: Array.from(new Set(s.listings.map((l) => l.category))).slice(0, 3),
      rating: byId.get(s.id)?._avg.rating ?? 0, reviews: byId.get(s.id)?._count ?? 0,
    }))
    .sort((a, b) => b.reviews - a.reviews || b.live - a.live)
    .slice(0, take);
}
