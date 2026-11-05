import Link from 'next/link';
import { sellerOfferAction } from '@/app/actions/chat';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { avatarCls, inr, initials } from '@/lib/format';
import { userStats } from '@/lib/users';
import { Ic } from '@/components/ui';

export const metadata = { title: 'Dashboard' };

export default async function SellerHome() {
  const user = await requireUser('/seller');
  const [active, newOrders, pendingPayout, stats, offers, rejected, toShip] = await Promise.all([
    db.listing.count({ where: { sellerId: user.id, status: 'ACTIVE' } }),
    db.order.count({ where: { sellerId: user.id, status: 'PAID' } }),
    db.payout.aggregate({ where: { sellerId: user.id, status: 'PENDING' }, _sum: { amount: true } }),
    userStats(user.id),
    db.message.findMany({
      where: { type: 'OFFER', offerStatus: 'PENDING', senderId: { not: user.id }, conversation: { sellerId: user.id, listing: { status: 'ACTIVE' } } },
      include: { sender: true, conversation: { include: { listing: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.listing.findMany({ where: { sellerId: user.id, status: 'REJECTED' }, take: 3 }),
    db.order.count({ where: { sellerId: user.id, status: { in: ['ACCEPTED', 'HANDED_TO_DELIVERY', 'READY_FOR_PICKUP'] } } }),
  ]);
  const hour = parseInt(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }), 10);
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const kpis = [
    { l: 'Active listings', v: String(active), ic: 'tag', d: 'Live for buyers', href: '/seller/listings' },
    { l: 'New orders', v: String(newOrders), ic: 'package', d: newOrders ? 'Accept them soon' : 'Nothing new', href: '/seller/orders' },
    { l: 'Pending payout', v: inr(pendingPayout._sum.amount ?? 0), ic: 'wallet', d: 'Paid after buyer confirms', href: '/seller/earnings' },
    { l: 'Average rating', v: stats.reviews ? stats.rating.toFixed(1) : '—', ic: 'star', d: `${stats.reviews} reviews`, href: '/seller/reviews' },
  ];

  return (
    <div className="col g24">
      <div className="row between wrapf g12">
        <div className="col g4" style={{ gap: 0 }}><div className="h2">{greet}, {user.name.split(' ')[0]}</div><span className="soft">Here’s how your listings are doing today.</span></div>
        <Link className="btn btn-pri btn-sm show-m" href="/seller/new"><Ic n="plus" s="sm" />Add</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>
        {kpis.map((k) => (
          <Link key={k.l} className="card stat" href={k.href} style={{ color: 'inherit' }}>
            <span className="row between"><span className="t-sm muted">{k.l}</span><Ic n={k.ic} s="sm" className="c-pri" /></span>
            <span className="stat-v">{k.v}</span>
            <span className="delta muted">{k.d}</span>
          </Link>
        ))}
      </div>
      <div className="grid2">
        <div className="card col" style={{ gap: 0, overflow: 'hidden' }}>
          <div className="pad-s row between" style={{ borderBottom: '1px solid var(--line2)' }}><b>Offers waiting for you</b><Link className="linkbtn t-sm" href="/seller/offers">All offers</Link></div>
          {offers.length === 0 && <div className="pad t-sm muted row g8"><Ic n="checkc" s="sm" className="c-green" />You’ve responded to every offer.</div>}
          {offers.map((o) => (
            <div key={o.id} className="menu-i" style={{ cursor: 'default' }}>
              <span className={avatarCls(o.sender.name)}>{initials(o.sender.name)}</span>
              <span className="col grow" style={{ gap: 0, minWidth: 0 }}>
                <b className="t-sm">{o.sender.name} · {inr(o.amount)}</b>
                <span className="t-xs muted clamp1">{o.conversation.listing.title} · asking {inr(o.conversation.listing.price)}</span>
              </span>
              <Link className="btn btn-soft btn-xs" href={`/chat/${o.conversationId}`}>Counter</Link>
              <form action={sellerOfferAction}>
                <input type="hidden" name="conversationId" value={o.conversationId} />
                <input type="hidden" name="messageId" value={o.id} />
                <input type="hidden" name="action" value="accept" />
                <button className="btn btn-pri btn-xs" type="submit">Accept</button>
              </form>
            </div>
          ))}
        </div>
        <div className="card col" style={{ gap: 0, overflow: 'hidden' }}>
          <div className="pad-s row between" style={{ borderBottom: '1px solid var(--line2)' }}><b>Needs attention</b></div>
          {newOrders > 0 && <Link className="menu-i" href="/seller/orders"><span className="mi-ic" style={{ background: 'var(--amber-50)', color: 'var(--amber-ink)' }}><Ic n="package" /></span><span className="col grow" style={{ gap: 0 }}><b className="t-sm">{newOrders} new order{newOrders > 1 ? 's' : ''}</b><span className="t-xs muted">Buyer has paid — accept and arrange handover</span></span><Ic n="chevr" s="sm" className="muted" /></Link>}
          {toShip > 0 && <Link className="menu-i" href="/seller/orders"><span className="mi-ic"><Ic n="scooter" /></span><span className="col grow" style={{ gap: 0 }}><b className="t-sm">{toShip} order{toShip > 1 ? 's' : ''} to hand over</b><span className="t-xs muted">Update the status as you go</span></span><Ic n="chevr" s="sm" className="muted" /></Link>}
          {rejected.map((l) => (
            <Link key={l.id} className="menu-i" href={`/seller/new?edit=${l.id}`}><span className="mi-ic" style={{ background: 'var(--red-50)', color: 'var(--red)' }}><Ic n="x" /></span><span className="col grow" style={{ gap: 0 }}><b className="t-sm">Listing rejected</b><span className="t-xs muted clamp1">{l.title} — {l.rejectReason || 'please edit and resubmit'}</span></span><Ic n="chevr" s="sm" className="muted" /></Link>
          ))}
          {!newOrders && !toShip && rejected.length === 0 && <div className="pad t-sm muted row g8"><Ic n="checkc" s="sm" className="c-green" />All good — nothing needs your attention.</div>}
        </div>
      </div>
    </div>
  );
}
