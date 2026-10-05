import { db } from './db';

export async function userStats(userId: string) {
  const [agg, deals] = await Promise.all([
    db.review.aggregate({ where: { toUserId: userId }, _avg: { rating: true }, _count: true }),
    db.order.count({ where: { sellerId: userId, status: 'COMPLETED' } }),
  ]);
  return { rating: agg._avg.rating ?? 0, reviews: agg._count, deals };
}
