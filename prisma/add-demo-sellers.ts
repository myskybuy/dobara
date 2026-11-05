/* Adds the verified demo sellers (DEMO_SELLERS + EXTRA_SELLERS) to an existing database WITHOUT wiping it.
 * Sellers whose email already exists are skipped, so it is safe to run more than once.
 *   npm run db:add-sellers
 */
import { PrismaClient, type User } from '@prisma/client';
import { DEMO_BUYERS, DEMO_SELLERS, photosForSprite } from './demo-sellers';
import { EXTRA_SELLERS } from './demo-sellers-extra';
import { createDemoSeller } from './demo-seed-helpers';

const db = new PrismaClient();

async function main() {
  const buyerPool: User[] = await db.user.findMany({ where: { email: { in: ['aarav@dobara.test', 'rhea@dobara.test'] } } });
  for (const b of DEMO_BUYERS) {
    buyerPool.push((await db.user.findUnique({ where: { email: b.email } })) ?? (await db.user.create({ data: { ...b, address: `${b.area}, ${b.city}` } })));
  }

  const all = [...DEMO_SELLERS, ...EXTRA_SELLERS];
  let added = 0;
  for (const [idx, s] of all.entries()) {
    if (await db.user.findUnique({ where: { email: s.email } })) continue;
    await createDemoSeller(db, s, idx + 1, buyerPool);
    added++;
  }
  console.log(`Added ${added} verified sellers (${all.length - added} already existed).`);

  // Databases seeded by older versions still have "sprite:<name>" art on demo listings — swap in the real photos.
  const old = await db.listing.findMany({ where: { seller: { email: { endsWith: '@dobara.test' } } }, select: { id: true, photos: true } });
  let fixed = 0;
  for (const [n, l] of old.entries()) {
    const sprite = l.photos.find((p) => p.startsWith('sprite:'));
    if (!sprite) continue;
    const photos = photosForSprite(sprite.slice('sprite:'.length), n);
    if (photos[0]!.startsWith('sprite:')) continue;
    await db.listing.update({ where: { id: l.id }, data: { photos } });
    fixed++;
  }
  if (fixed) console.log(`Replaced placeholder art with photos on ${fixed} demo listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
