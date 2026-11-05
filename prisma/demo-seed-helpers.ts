/* Creates one verified demo seller with live listings and a completed, reviewed sale.
 * Shared by prisma/seed.ts and prisma/add-demo-sellers.ts.
 */
import type { PrismaClient, User } from '@prisma/client';
import { demoPhoto, type DemoSeller } from './demo-sellers';

const ago = (mins: number) => new Date(Date.now() - mins * 60_000);

/** `k` is the seller's 1-based position in the demo list — keeps dates and order codes deterministic and unique. */
export async function createDemoSeller(db: PrismaClient, s: DemoSeller, k: number, buyerPool: User[]) {
  const seller = await db.user.create({
    data: {
      email: s.email, name: s.name, city: s.city, area: s.area, createdAt: ago(60 * 24 * (120 + ((k * 23) % 500))),
      sellerStatus: 'APPROVED', sellerPhone: s.phone, sellerNote: s.bio, sellerAppliedAt: ago(60 * 24 * (110 + ((k * 23) % 500))),
    },
  });
  let i = 0;
  for (const [title, category, condition, price, photos, description, canDeliver] of s.items) {
    i++;
    await db.listing.create({
      data: {
        sellerId: seller.id, title, category, condition, price, description, photos: photos.map(demoPhoto), canPickup: true, canDeliver,
        city: s.city, area: s.area, status: 'ACTIVE', views: 40 + ((k * 37 + i * 53) % 400), createdAt: ago(60 * ((k * 7 + i * 11) % 96) + i * 13),
      },
    });
  }
  let j = 0;
  for (const [title, category, price, photo, rating, text] of s.sold) {
    j++;
    const buyer = buyerPool[(k + j) % buyerPool.length]!;
    const days = 12 + ((k * 5 + j * 3) % 40);
    const l = await db.listing.create({ data: { sellerId: seller.id, title, category, condition: 'Good', price, description: title + ' in good condition.', photos: [demoPhoto(photo)], city: s.city, area: s.area, status: 'SOLD', createdAt: ago(60 * 24 * (days + 3)) } });
    const o = await db.order.create({
      data: {
        code: 'DB-2026-2' + String(k * 10 + j).padStart(5, '0'), listingId: l.id, buyerId: buyer.id, sellerId: seller.id, agreedPrice: price, deliveryFee: 0, total: price, mode: 'PICKUP',
        pickupPlace: s.area + ', ' + s.city, pickupTime: 'Evening', status: 'COMPLETED', handoverOtp: '2222', paymentMode: 'demo',
        paidAt: ago(60 * 24 * (days + 1)), acceptedAt: ago(60 * 24 * (days + 1)), readyAt: ago(60 * 24 * days), deliveredAt: ago(60 * 24 * days), completedAt: ago(60 * 24 * days), createdAt: ago(60 * 24 * (days + 1)),
      },
    });
    await db.payout.create({ data: { orderId: o.id, sellerId: seller.id, amount: price, status: 'PAID', paidAt: ago(60 * 24 * (days - 1)) } });
    await db.review.create({ data: { orderId: o.id, fromUserId: buyer.id, toUserId: seller.id, rating, tags: rating >= 5 ? ['As described', 'Quick replies', 'Friendly'] : ['As described'], text } });
  }
  return seller;
}
