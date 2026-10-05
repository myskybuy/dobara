import Link from 'next/link';
import { reviewAction } from '@/app/actions/orders';
import { requireUser } from '@/lib/auth';
import { REVIEW_TAGS_FOR_BUYER } from '@/lib/constants';
import { db } from '@/lib/db';
import { avatarCls, initials, timeAgo } from '@/lib/format';
import { StarPicker } from '@/components/StarPicker';
import { FormError, Notice, Stars } from '@/components/ui';

export const metadata = { title: 'Reviews' };

type SP = Promise<{ tab?: string; error?: string; done?: string }>;

export default async function SellerReviewsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const user = await requireUser('/seller/reviews');
  const received = await db.review.findMany({ where: { toUserId: user.id }, include: { fromUser: true, order: { include: { listing: true } } }, orderBy: { createdAt: 'desc' } });
  const toRate = await db.order.findMany({
    where: { sellerId: user.id, status: 'COMPLETED', reviews: { none: { fromUserId: user.id } } },
    include: { buyer: true, listing: true },
    orderBy: { completedAt: 'desc' },
  });
  const tab = sp.tab === 'received' ? 'received' : toRate.length ? 'give' : 'received';
  const avg = received.length ? received.reduce((a, r) => a + r.rating, 0) / received.length : 0;

  return (
    <div className="col g16" style={{ maxWidth: 900 }}>
      <div className="h2">Reviews</div>
      <div className="tabs">
        <Link className={tab === 'received' ? 'tab on' : 'tab'} href="/seller/reviews?tab=received">Reviews received<span className="count">{received.length}</span></Link>
        <Link className={tab === 'give' ? 'tab on' : 'tab'} href="/seller/reviews?tab=give">Rate your buyers<span className="count">{toRate.length}</span></Link>
      </div>
      <FormError msg={sp.error} />
      {sp.done && <Notice kind="teal">Thanks — your rating was saved.</Notice>}

      {tab === 'received' ? (
        received.length === 0 ? (
          <div className="card pad t-sm muted">No reviews yet. Buyers can review you after a completed order.</div>
        ) : (
          <>
            <div className="card pad row g16"><span style={{ fontSize: 40, fontWeight: 800 }}>{avg.toFixed(1)}</span><div className="col g4"><Stars value={avg} /><span className="t-sm muted">{received.length} reviews from completed orders</span></div></div>
            {received.map((r) => (
              <div key={r.id} className="card pad col g8">
                <div className="row g12"><span className={avatarCls(r.fromUser.name)}>{initials(r.fromUser.name)}</span><div className="col grow" style={{ gap: 0 }}><b>{r.fromUser.name}</b><span className="t-xs muted">{timeAgo(r.createdAt)} · Bought: {r.order.listing.title}</span></div><span className="badge b-green">Verified purchase</span></div>
                <Stars value={r.rating} />
                {r.text && <p className="soft">{r.text}</p>}
                {r.tags.length > 0 && <div className="row wrapf g6">{r.tags.map((t) => <span key={t} className="badge b-gray">{t}</span>)}</div>}
              </div>
            ))}
          </>
        )
      ) : toRate.length === 0 ? (
        <div className="card pad t-sm muted">You have rated all your buyers.</div>
      ) : (
        toRate.map((o) => (
          <form key={o.id} action={reviewAction} className="card pad col g12">
            <input type="hidden" name="orderId" value={o.id} />
            <input type="hidden" name="as" value="seller" />
            <div className="row g12"><span className={avatarCls(o.buyer.name) + ' lg'}>{initials(o.buyer.name)}</span><div className="col g4" style={{ gap: 0 }}><b>How was {o.buyer.name} as a buyer?</b><span className="t-xs muted">{o.listing.title} · Order {o.code}</span></div></div>
            <StarPicker idPrefix={'b' + o.id} />
            <div className="row wrapf g6">{REVIEW_TAGS_FOR_BUYER.map((t) => <label key={t} className="chip"><input type="checkbox" name="tags" value={t} />{t}</label>)}</div>
            <textarea className="textarea" name="text" rows={2} placeholder="Optional: a few words about the buyer" />
            <button className="btn btn-pri" type="submit" style={{ alignSelf: 'flex-start' }}>Submit rating</button>
          </form>
        ))
      )}
    </div>
  );
}
