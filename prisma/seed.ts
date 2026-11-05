/* Demo data for local development: run `npm run db:seed` (or `npm run db:reset` to wipe and reseed).
 * Log in with any of these emails — the OTP is shown on screen / in the terminal in dev mode:
 *   buyer  aarav@dobara.test   seller karan@dobara.test   admin admin@dobara.test
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import path from 'path';
import { DEMO_BUYERS, DEMO_SELLERS, photosForSprite } from './demo-sellers';
import { EXTRA_SELLERS } from './demo-sellers-extra';
import { createDemoSeller } from './demo-seed-helpers';

const db = new PrismaClient();

type Seller = { name: string; area: string; bio: string };
type Row = [string, string, string, string, number, number, string, string, string, string, number, number, string, boolean, boolean, number, string, string, string, string, string, unknown, (string | null)?, string?];

const data = JSON.parse(readFileSync(path.join(__dirname, 'demo-data.json'), 'utf8')) as { S: Record<string, Seller>; P: Row[] };

const COND: Record<string, string> = { 'Brand New': 'Like New', Used: 'Fair' };
const splitArea = (s: string) => {
  const [area, cityRaw] = s.split(',').map((x) => x.trim());
  return { area: area!, city: cityRaw === 'New Delhi' ? 'Delhi' : cityRaw! };
};
const emailOf = (name: string) => name.split(' ')[0]!.toLowerCase() + '@dobara.test';
const ago = (mins: number) => new Date(Date.now() - mins * 60_000);

async function main() {
  console.log('Clearing old data…');
  await db.payout.deleteMany();
  await db.review.deleteMany();
  await db.complaint.deleteMany();
  await db.order.deleteMany();
  await db.message.deleteMany();
  await db.conversation.deleteMany();
  await db.listing.deleteMany();
  await db.session.deleteMany();
  await db.emailOtp.deleteMany();
  await db.contactMessage.deleteMany();
  await db.user.deleteMany();

  console.log('Creating users…');
  const admin = await db.user.create({ data: { email: 'admin@dobara.test', name: 'Ritu Sharma', isAdmin: true, city: 'Noida', area: 'Sector 62', createdAt: ago(60 * 24 * 400) } });
  const aarav = await db.user.create({ data: { email: 'aarav@dobara.test', name: 'Aarav Mehta', city: 'Noida', area: 'Sector 62', address: 'B-204, Supertech Capetown, Sector 74, Noida 201301', createdAt: ago(60 * 24 * 600) } });
  const rhea = await db.user.create({ data: { email: 'rhea@dobara.test', name: 'Rhea Kapoor', city: 'Noida', area: 'Sector 50', address: 'C-12, Sector 50, Noida 201301' } });
  const manish = await db.user.create({ data: { email: 'manish@dobara.test', name: 'Manish Tiwari', city: 'Noida', area: 'Sector 137', address: 'Tower 4, Paras Tierea, Sector 137, Noida' } });

  const sellers: Record<string, string> = {};
  for (const [key, s] of Object.entries(data.S)) {
    const { area, city } = splitArea(s.area);
    const email = emailOf(s.name);
    const existing = await db.user.findUnique({ where: { email } });
    const u = existing ?? (await db.user.create({
      data: {
        email, name: s.name, city, area, createdAt: ago(60 * 24 * (300 + Object.keys(sellers).length * 40)),
        sellerStatus: 'APPROVED', sellerPhone: '98' + String(10000000 + Object.keys(sellers).length).slice(-8), sellerNote: s.bio, sellerAppliedAt: ago(60 * 24 * (290 + Object.keys(sellers).length * 40)),
      },
    }));
    sellers[key] = u.id;
  }

  // One buyer applying to become a seller — shows the pending-approval demo flow
  await db.user.update({
    where: { id: manish.id },
    data: {
      sellerStatus: 'PENDING', sellerPhone: '9811022334',
      sellerNote: 'I want to sell a few old kitchen appliances and a study table I no longer need.',
      sellerAppliedAt: ago(90),
    },
  });

  console.log('Creating listings…');
  const listingIds: Record<string, string> = {};
  for (const r of data.P) {
    const [id, title, img, cat, price, , cond, , sid, place, , mins, , , del, views, , , , reason, desc, , status] = r;
    const { area, city } = splitArea(place);
    const l = await db.listing.create({
      data: {
        sellerId: sellers[sid]!, title, category: cat, condition: COND[cond] ?? cond, price,
        description: desc + (reason ? `\n\nReason for selling: ${reason}` : ''),
        photos: photosForSprite(img, Object.keys(listingIds).length), canPickup: true, canDeliver: del, city, area, views,
        status: status === 'sold' ? 'SOLD' : 'ACTIVE', createdAt: ago(mins),
      },
    });
    listingIds[id] = l.id;
  }
  // Two listings waiting for admin approval
  const karan = sellers['s1']!;
  await db.listing.create({ data: { sellerId: karan, title: 'Gaming chair with footrest', category: 'furniture', condition: 'Good', price: 7400, description: 'Ergonomic gaming chair with lumbar pillow and footrest. Used for a year, no tears in the leatherette.', photos: photosForSprite('chair', 1), city: 'Noida', area: 'Sector 18', status: 'PENDING_REVIEW', createdAt: ago(45) } });
  await db.listing.create({ data: { sellerId: sellers['s2']!, title: 'iPhone 14 Pro — ₹9,999 only!!', category: 'mobiles', condition: 'Like New', price: 9999, description: 'Urgent sale, brand new condition, no bill. Pay advance to book.', photos: photosForSprite('phone', 2), city: 'Noida', area: 'Sector 50', status: 'PENDING_REVIEW', createdAt: ago(30) } });

  console.log('Creating a chat with offers…');
  const p1 = listingIds['p1']!;
  const conv = await db.conversation.create({ data: { listingId: p1, buyerId: aarav.id, sellerId: karan } });
  const msgs: [string, 'TEXT' | 'OFFER', string | null, number | null, 'PENDING' | 'COUNTERED' | null, number][] = [
    [aarav.id, 'TEXT', 'Hi Karan, is the Canon 1500D still available?', null, null, 95],
    [karan, 'TEXT', 'Hi Aarav! Yes, it is. Shutter count is around 6,200 and it comes with the original box, charger and a 32 GB card.', null, null, 93],
    [aarav.id, 'TEXT', 'Any scratches on the body or fungus in the lens?', null, null, 92],
    [karan, 'TEXT', 'No fungus, the glass is clear. There is one tiny mark near the grip.', null, null, 90],
    [aarav.id, 'OFFER', null, 15000, 'COUNTERED', 86],
    [karan, 'OFFER', null, 16500, 'PENDING', 83],
    [karan, 'TEXT', 'I can do ₹16,500 — the box, card and bill are all included.', null, null, 83],
  ];
  for (const [sender, type, text, amount, offerStatus, m] of msgs) {
    await db.message.create({ data: { conversationId: conv.id, senderId: sender, type, text, amount, offerStatus, createdAt: ago(m), readAt: ago(m - 1) } });
  }

  console.log('Creating orders and reviews…');
  // 1) A completed, reviewed order (Aarav bought from Rohan) with a paid payout
  const p21 = listingIds['p21']!;
  await db.listing.update({ where: { id: p21 }, data: { status: 'SOLD' } });
  const done = await db.order.create({
    data: {
      code: 'DB-2026-100231', listingId: p21, buyerId: aarav.id, sellerId: sellers['s2']!, agreedPrice: 1200, deliveryFee: 79, total: 1279,
      mode: 'DELIVERY', address: aarav.address, status: 'COMPLETED', handoverOtp: '4821', paymentMode: 'demo', paymentId: 'demo_seed',
      paidAt: ago(60 * 24 * 9), acceptedAt: ago(60 * 24 * 9 - 30), shippedAt: ago(60 * 24 * 8), outAt: ago(60 * 24 * 8 - 60), deliveredAt: ago(60 * 24 * 8 - 120), completedAt: ago(60 * 24 * 7), createdAt: ago(60 * 24 * 9),
    },
  });
  await db.payout.create({ data: { orderId: done.id, sellerId: sellers['s2']!, amount: 1200, status: 'PAID', paidAt: ago(60 * 24 * 6) } });
  await db.review.create({ data: { orderId: done.id, fromUserId: aarav.id, toUserId: sellers['s2']!, rating: 5, tags: ['As described', 'Well packed'], text: 'Sealed box as promised, quick delivery.' } });
  await db.review.create({ data: { orderId: done.id, fromUserId: sellers['s2']!, toUserId: aarav.id, rating: 5, tags: ['Paid on time', 'Clear communication'] } });

  // 2) Past orders for Karan so his profile shows reviews
  const extras: [string, string, number, number, string][] = [
    ['Canon EF-S 55–250mm lens', 'lens', 9800, 5, 'Lens exactly as described, even packed it with silica gel. Karan answered every question within minutes.'],
    ['GoPro Hero 9', 'dslr', 14500, 5, 'Smooth handover at the metro station. Bill and box were included as promised.'],
    ['Tripod — Digitek DTR 550', 'lens', 1500, 4, 'Good tripod, one leg lock is slightly stiff which he had mentioned. Fair deal.'],
  ];
  let n = 0;
  for (const [title, img, price, rating, text] of extras) {
    n++;
    const buyer = n % 2 ? rhea : manish;
    const l = await db.listing.create({ data: { sellerId: karan, title, category: 'cameras', condition: 'Good', price, description: title + ' in good condition.', photos: photosForSprite(img, n), city: 'Noida', area: 'Sector 18', status: 'SOLD', createdAt: ago(60 * 24 * (40 + n * 15)) } });
    const o = await db.order.create({
      data: {
        code: 'DB-2026-0900' + n, listingId: l.id, buyerId: buyer.id, sellerId: karan, agreedPrice: price, deliveryFee: 0, total: price, mode: 'PICKUP',
        pickupPlace: 'Sector 18 Metro Station, Gate 2', pickupTime: 'Evening', status: 'COMPLETED', handoverOtp: '1111', paymentMode: 'demo',
        paidAt: ago(60 * 24 * (38 + n * 15)), acceptedAt: ago(60 * 24 * (38 + n * 15)), readyAt: ago(60 * 24 * (37 + n * 15)), deliveredAt: ago(60 * 24 * (37 + n * 15)), completedAt: ago(60 * 24 * (36 + n * 15)), createdAt: ago(60 * 24 * (38 + n * 15)),
      },
    });
    await db.payout.create({ data: { orderId: o.id, sellerId: karan, amount: price, status: 'PAID', paidAt: ago(60 * 24 * (35 + n * 15)) } });
    await db.review.create({ data: { orderId: o.id, fromUserId: buyer.id, toUserId: karan, rating, tags: ['As described', 'Quick replies'], text } });
  }

  // 3) A new paid order waiting for Karan to accept (Rhea bought the TV) — shows the seller flow
  const p11 = listingIds['p11']!;
  await db.listing.update({ where: { id: p11 }, data: { status: 'SOLD' } });
  const conv2 = await db.conversation.create({ data: { listingId: p11, buyerId: rhea.id, sellerId: karan, agreedPrice: 16000 } });
  await db.message.create({ data: { conversationId: conv2.id, senderId: rhea.id, type: 'OFFER', amount: 16000, offerStatus: 'ACCEPTED', createdAt: ago(70) } });
  await db.message.create({ data: { conversationId: conv2.id, senderId: karan, type: 'SYSTEM', text: 'Deal agreed at ₹16,000', createdAt: ago(65) } });
  await db.order.create({
    data: {
      code: 'DB-2026-104872', listingId: p11, conversationId: conv2.id, buyerId: rhea.id, sellerId: karan, agreedPrice: 16000, deliveryFee: 79, total: 16079,
      mode: 'DELIVERY', address: rhea.address, status: 'PAID', handoverOtp: '4827', paymentMode: 'demo', paymentId: 'demo_seed2', paidAt: ago(60), createdAt: ago(62),
    },
  });

  console.log('Creating verified sellers in every city…');
  const buyerPool = [aarav, rhea];
  for (const b of DEMO_BUYERS) {
    buyerPool.push(await db.user.create({ data: { ...b, address: `${b.area}, ${b.city}`, createdAt: ago(60 * 24 * 200) } }));
  }
  const allSellers = [...DEMO_SELLERS, ...EXTRA_SELLERS];
  for (const [idx, s] of allSellers.entries()) await createDemoSeller(db, s, idx + 1, buyerPool);
  console.log(`  ${allSellers.length} verified sellers, ${allSellers.reduce((a, s) => a + s.items.length, 0)} live listings across ${new Set(allSellers.map((s) => s.city)).size} cities`);

  console.log(`Done. Users: admin@dobara.test (admin), aarav@dobara.test (buyer), karan@dobara.test (seller). Admin id ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
