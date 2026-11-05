import Link from 'next/link';
import { approveListingAction } from '@/app/actions/listings';
import { requireAdmin } from '@/lib/auth';
import { LOCATIONS, categoryLabel } from '@/lib/constants';
import { db } from '@/lib/db';
import { inr, timeAgo } from '@/lib/format';
import { Ic, Photo } from '@/components/ui';

export const metadata = { title: 'Dashboard' };

export default async function AdminHome() {
  await requireAdmin();
  const monthAgo = new Date(Date.now() - 30 * 86_400_000);
  const [users, pendingCount, orders30, complaints, pending, payoutsDue, pendingSellers] = await Promise.all([
    db.user.count(),
    db.listing.count({ where: { status: 'PENDING_REVIEW' } }),
    db.order.count({ where: { status: { notIn: ['PENDING_PAYMENT', 'CANCELLED'] }, createdAt: { gte: monthAgo } } }),
    db.complaint.count({ where: { status: 'OPEN' } }),
    db.listing.findMany({ where: { status: 'PENDING_REVIEW' }, include: { seller: true }, orderBy: { createdAt: 'asc' }, take: 6 }),
    db.payout.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: true }),
    db.user.count({ where: { sellerStatus: 'PENDING' } }),
  ]);
  const [sellersByCity, listingsByCity, listingsByCat, liveTotal] = await Promise.all([
    db.user.groupBy({ by: ['city'], where: { sellerStatus: 'APPROVED' }, _count: true }),
    db.listing.groupBy({ by: ['city'], where: { status: 'ACTIVE' }, _count: true }),
    db.listing.groupBy({ by: ['category'], where: { status: 'ACTIVE' }, _count: true, orderBy: { _count: { category: 'desc' } } }),
    db.listing.count({ where: { status: 'ACTIVE' } }),
  ]);
  const sellerCount = new Map(sellersByCity.map((r) => [r.city, r._count]));
  const liveCount = new Map(listingsByCity.map((r) => [r.city, r._count]));
  const cities = LOCATIONS.map((l) => ({ city: l.city, sellers: sellerCount.get(l.city) ?? 0, live: liveCount.get(l.city) ?? 0 })).sort((a, b) => b.live - a.live);
  const maxCity = Math.max(1, ...cities.map((c) => c.live));
  const maxCat = Math.max(1, ...listingsByCat.map((c) => c._count));
  const kpis = [
    { l: 'Total users', v: users.toLocaleString('en-IN'), ic: 'users', d: 'All accounts', href: '/admin/users', tone: 't-k-pri' },
    { l: 'Live listings', v: String(liveTotal), ic: 'tag', d: `Across ${listingsByCity.length} cities`, href: '/admin/listings?tab=ACTIVE', tone: 't-k-teal' },
    { l: 'Pending approvals', v: String(pendingCount), ic: 'verified', d: 'Listings waiting for review', href: '/admin/listings', tone: 't-k-amber' },
    { l: 'Seller applications', v: String(pendingSellers), ic: 'store', d: 'Waiting to become sellers', href: '/admin/sellers', tone: 't-k-violet' },
    { l: 'Orders (30d)', v: String(orders30), ic: 'package', d: `${payoutsDue._count} payouts due · ${inr(payoutsDue._sum.amount ?? 0)}`, href: '/admin/orders', tone: 't-k-green' },
    { l: 'Open complaints', v: String(complaints), ic: 'alert', d: 'Payout on hold for these', href: '/admin/complaints', tone: 't-k-red' },
  ];
  return (
    <div className="col g24">
      <section className="t-welcome">
        <div className="t-welcome-txt">
          <span className="t-pill"><Ic n="calendar" s="xs" />{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}</span>
          <div className="h2">Marketplace overview</div>
          <p>{pendingCount + pendingSellers + complaints > 0 ? `${pendingCount} listing${pendingCount === 1 ? '' : 's'}, ${pendingSellers} seller application${pendingSellers === 1 ? '' : 's'} and ${complaints} complaint${complaints === 1 ? '' : 's'} waiting for you.` : 'All caught up — nothing needs your attention right now.'}</p>
        </div>
        <div className="t-welcome-img" style={{ backgroundImage: 'url(/demo/store.jpg)' }} />
      </section>
      <div className="t-kpis">
        {kpis.map((k) => (
          <Link key={k.l} className={'t-kpi ' + k.tone} href={k.href}>
            <span className="t-kpi-ic"><Ic n={k.ic} /></span>
            <span className="t-sm muted strong">{k.l}</span>
            <span className="stat-v">{k.v}</span><span className="t-xs muted">{k.d}</span>
          </Link>
        ))}
      </div>
      <div className="grid2">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="t-panel-h"><div className="col" style={{ gap: 0 }}><b className="t-lg">Verified sellers by city</b><span className="t-sm muted">Approved sellers · live listings</span></div><Link className="btn btn-sec btn-sm" href="/admin/sellers?tab=APPROVED">Sellers</Link></div>
          <div className="t-bars">
            {cities.map((c) => (
              <div key={c.city} className="t-bar-row">
                <b className="clamp1">{c.city}</b>
                <span className="t-bar"><i style={{ width: `${(c.live / maxCity) * 100}%` }} /></span>
                <span className="t-xs muted num">{c.sellers} sellers · {c.live} live</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="t-panel-h"><div className="col" style={{ gap: 0 }}><b className="t-lg">Live listings by category</b><span className="t-sm muted">{liveTotal} items for sale right now</span></div><Link className="btn btn-sec btn-sm" href="/admin/listings?tab=ACTIVE">Listings</Link></div>
          <div className="t-bars">
            {listingsByCat.map((c) => (
              <div key={c.category} className="t-bar-row">
                <b className="clamp1">{categoryLabel(c.category)}</b>
                <span className="t-bar amber"><i style={{ width: `${(c._count / maxCat) * 100}%` }} /></span>
                <span className="t-xs muted num">{c._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="row between wrapf g8" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)' }}>
          <div className="col" style={{ gap: 0 }}><b className="t-lg">Pending approvals</b><span className="t-sm muted">{pendingCount} waiting · approve right here or review details</span></div>
          <Link className="btn btn-sec btn-sm" href="/admin/listings">All listings</Link>
        </div>
        {pending.length === 0 && <div className="pad t-sm row g8 c-green"><Ic n="checkc" s="sm" />All caught up — nothing waiting for approval.</div>}
        {pending.map((l) => (
          <div key={l.id} className="row wrapf g12" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line2)' }}>
            <span style={{ width: 52, borderRadius: 8, overflow: 'hidden', flex: 'none' }}><Photo src={l.photos[0]} /></span>
            <div className="col grow" style={{ gap: 2, minWidth: 200 }}>
              <span className="row g8"><span className="badge b-gray">Listing</span><span className="t-xs muted">{timeAgo(l.createdAt)}</span></span>
              <b className="clamp1">{l.title}</b>
              <span className="t-xs muted">{l.seller.name} · {inr(l.price)} · {categoryLabel(l.category)} · {l.area}, {l.city}</span>
            </div>
            <Link className="btn btn-ghost btn-sm" href={`/admin/listings?tab=PENDING_REVIEW&view=${l.id}`}>Review</Link>
            <form action={approveListingAction}>
              <input type="hidden" name="id" value={l.id} /><input type="hidden" name="back" value="/admin" />
              <button className="btn btn-pri btn-sm" type="submit"><Ic n="check" s="sm" />Approve</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
