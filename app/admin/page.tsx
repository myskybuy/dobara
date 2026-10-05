import Link from 'next/link';
import { approveListingAction } from '@/app/actions/listings';
import { requireAdmin } from '@/lib/auth';
import { categoryLabel } from '@/lib/constants';
import { db } from '@/lib/db';
import { inr, timeAgo } from '@/lib/format';
import { Ic, Photo } from '@/components/ui';

export const metadata = { title: 'Dashboard' };

export default async function AdminHome() {
  await requireAdmin();
  const monthAgo = new Date(Date.now() - 30 * 86_400_000);
  const [users, pendingCount, orders30, complaints, pending, payoutsDue] = await Promise.all([
    db.user.count(),
    db.listing.count({ where: { status: 'PENDING_REVIEW' } }),
    db.order.count({ where: { status: { notIn: ['PENDING_PAYMENT', 'CANCELLED'] }, createdAt: { gte: monthAgo } } }),
    db.complaint.count({ where: { status: 'OPEN' } }),
    db.listing.findMany({ where: { status: 'PENDING_REVIEW' }, include: { seller: true }, orderBy: { createdAt: 'asc' }, take: 6 }),
    db.payout.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: true }),
  ]);
  const kpis = [
    { l: 'Total users', v: users.toLocaleString('en-IN'), ic: 'users', d: 'All accounts', href: '/admin/users' },
    { l: 'Pending approvals', v: String(pendingCount), ic: 'verified', d: 'Listings waiting for review', href: '/admin/listings' },
    { l: 'Orders (30d)', v: String(orders30), ic: 'package', d: `${payoutsDue._count} payouts due · ${inr(payoutsDue._sum.amount ?? 0)}`, href: '/admin/orders' },
    { l: 'Open complaints', v: String(complaints), ic: 'alert', d: 'Payout on hold for these', href: '/admin/complaints' },
  ];
  return (
    <div className="col g24">
      <div className="col" style={{ gap: 0 }}><div className="h2">Marketplace overview</div><span className="soft">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 14 }}>
        {kpis.map((k) => (
          <Link key={k.l} className="card stat" href={k.href} style={{ color: 'inherit' }}>
            <span className="row between"><span className="t-sm muted">{k.l}</span><Ic n={k.ic} s="sm" className="c-pri" /></span>
            <span className="stat-v">{k.v}</span><span className="delta muted">{k.d}</span>
          </Link>
        ))}
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
