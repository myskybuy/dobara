import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { toggleBlockAction } from '@/app/actions/admin';
import { requireAdmin } from '@/lib/auth';
import { LISTING_STATUS_BADGE, LISTING_STATUS_LABEL, ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { avatarCls, fmtDate, fmtDateTime, inr, initials } from '@/lib/format';
import { FormError, Ic } from '@/components/ui';

export const metadata = { title: 'Users' };

const COLS = 'minmax(0,1.8fr) 1.1fr 0.9fr 0.7fr 0.7fr 0.9fr 110px';

const SELLER_BADGE: Record<string, string> = { NONE: 'b-gray', PENDING: 'b-amber', APPROVED: 'b-green', REJECTED: 'b-red' };
const SELLER_LABEL: Record<string, string> = { NONE: 'Buyer only', PENDING: 'Seller pending', APPROVED: 'Seller', REJECTED: 'Seller rejected' };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; error?: string; view?: string }> }) {
  const sp = await searchParams;
  const admin = await requireAdmin();
  const where: Prisma.UserWhereInput = sp.q ? { OR: [{ name: { contains: sp.q, mode: 'insensitive' } }, { email: { contains: sp.q, mode: 'insensitive' } }] } : {};
  const users = await db.user.findMany({
    where,
    include: { _count: { select: { listings: true, buyerOrders: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const here = '/admin/users' + (sp.q ? '?q=' + encodeURIComponent(sp.q) : '');
  const view = sp.view ? await db.user.findUnique({ where: { id: sp.view } }) : null;
  const [viewListings, viewOrders, viewComplaints] = view
    ? await Promise.all([
        db.listing.findMany({ where: { sellerId: view.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
        db.order.findMany({ where: { OR: [{ buyerId: view.id }, { sellerId: view.id }] }, include: { listing: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
        db.complaint.findMany({ where: { userId: view.id }, include: { order: { include: { listing: true } } }, orderBy: { createdAt: 'desc' }, take: 20 }),
      ])
    : [[], [], []];

  return (
    <div className="col g16">
      <div className="col" style={{ gap: 0 }}><div className="h2">Users</div><span className="soft">{users.length} shown</span></div>
      <FormError msg={sp.error} />
      <form className="inwrap" style={{ maxWidth: 380 }} action="/admin/users"><Ic n="search" s="sm" /><input className="input" style={{ height: 40 }} name="q" defaultValue={sp.q || ''} placeholder="Search name or email" aria-label="Search users" /></form>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="dt-scroll"><div className="dt-inner">
          <div className="dt-row dt-head" style={{ gridTemplateColumns: COLS }}><span>User</span><span>Area</span><span>Seller</span><span>Listings</span><span>Orders</span><span>Joined</span><span /></div>
          {users.map((u) => (
            <div key={u.id} className="dt-row" style={{ gridTemplateColumns: COLS }}>
              <span className="row g8" style={{ minWidth: 0 }}><span className={avatarCls(u.name) + ' sm'}>{initials(u.name)}</span><span className="col" style={{ gap: 0, minWidth: 0 }}><b className="clamp1">{u.name} {u.isAdmin && <span className="badge b-dark">Admin</span>}</b><span className="t-xs muted clamp1">{u.email}</span></span></span>
              <span className="clamp1">{u.area ? `${u.area}, ${u.city}` : '—'}</span>
              <span><span className={'badge ' + SELLER_BADGE[u.sellerStatus]}>{SELLER_LABEL[u.sellerStatus]}</span></span>
              <span>{u._count.listings}</span>
              <span>{u._count.buyerOrders}</span>
              <span>{fmtDate(u.createdAt)}</span>
              <span className="row g6">
                <Link className="btn btn-ghost btn-xs" href={`${here}${sp.q ? '&' : '?'}view=${u.id}`}>View</Link>
                {u.id !== admin.id && (
                  <form action={toggleBlockAction}>
                    <input type="hidden" name="id" value={u.id} /><input type="hidden" name="q" value={sp.q || ''} />
                    <button className={'btn btn-xs ' + (u.isBlocked ? 'btn-sec' : 'btn-ghost c-red')} type="submit">{u.isBlocked ? 'Unblock' : 'Block'}</button>
                  </form>
                )}
                {u.isBlocked && <span className="badge b-red">Blocked</span>}
              </span>
            </div>
          ))}
        </div></div>
      </div>

      {view && (
        <div className="overlay right">
          <Link href={here} aria-label="Close" style={{ position: 'absolute', inset: 0 }} />
          <div className="drawer" style={{ maxWidth: 560, position: 'relative' }} role="dialog" aria-modal="true" aria-label="User details">
            <div className="mhead">
              <div className="row g12" style={{ minWidth: 0 }}>
                <span className={avatarCls(view.name)}>{initials(view.name)}</span>
                <div className="col" style={{ gap: 0, minWidth: 0 }}><div className="h3 clamp1">{view.name}</div><span className="t-sm muted clamp1">{view.email}</span></div>
              </div>
              <Link className="icon-btn sm" aria-label="Close" href={here}><Ic n="x" /></Link>
            </div>
            <div className="mbody col g20" style={{ flex: 1 }}>
              <div className="kv">
                <div>Area</div><div>{view.area ? `${view.area}, ${view.city}` : '—'}</div>
                <div>Seller status</div><div><span className={'badge ' + SELLER_BADGE[view.sellerStatus]}>{SELLER_LABEL[view.sellerStatus]}</span></div>
                <div>Joined</div><div>{fmtDateTime(view.createdAt)}</div>
                <div>Account</div><div>{view.isBlocked ? <span className="badge b-red">Blocked</span> : <span className="badge b-green">Active</span>}</div>
              </div>

              <div className="col g8">
                <b className="t-sm">Listings ({viewListings.length})</b>
                {viewListings.length === 0 && <span className="t-xs muted">No listings.</span>}
                {viewListings.map((l) => (
                  <div key={l.id} className="row between g8" style={{ padding: '8px 0', borderBottom: '1px solid var(--line2)' }}>
                    <span className="col" style={{ gap: 0, minWidth: 0 }}><b className="t-sm clamp1">{l.title}</b><span className="t-xs muted">{inr(l.price)}</span></span>
                    <span className={'badge ' + LISTING_STATUS_BADGE[l.status]}>{LISTING_STATUS_LABEL[l.status]}</span>
                  </div>
                ))}
              </div>

              <div className="col g8">
                <b className="t-sm">Orders ({viewOrders.length})</b>
                {viewOrders.length === 0 && <span className="t-xs muted">No orders.</span>}
                {viewOrders.map((o) => (
                  <div key={o.id} className="row between g8" style={{ padding: '8px 0', borderBottom: '1px solid var(--line2)' }}>
                    <span className="col" style={{ gap: 0, minWidth: 0 }}><b className="t-sm clamp1">{o.listing.title}</b><span className="t-xs muted">{o.code} · {o.buyerId === view.id ? 'as buyer' : 'as seller'}</span></span>
                    <span className={'badge ' + ORDER_STATUS_BADGE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</span>
                  </div>
                ))}
              </div>

              <div className="col g8">
                <b className="t-sm">Complaints ({viewComplaints.length})</b>
                {viewComplaints.length === 0 && <span className="t-xs muted">No complaints.</span>}
                {viewComplaints.map((c) => (
                  <div key={c.id} className="row between g8" style={{ padding: '8px 0', borderBottom: '1px solid var(--line2)' }}>
                    <span className="col" style={{ gap: 0, minWidth: 0 }}><b className="t-sm clamp1">{c.reason}</b><span className="t-xs muted clamp1">{c.order.listing.title}</span></span>
                    <span className={'badge ' + (c.status === 'OPEN' ? 'b-amber' : 'b-green')}>{c.status === 'OPEN' ? 'Open' : 'Resolved'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
