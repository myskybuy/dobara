import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { approveSellerAction, rejectSellerAction } from '@/app/actions/admin';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { fmtDateTime } from '@/lib/format';
import { Empty, Ic } from '@/components/ui';

export const metadata = { title: 'Seller approvals' };

const TABS = ['PENDING', 'APPROVED', 'REJECTED'] as const;
const TAB_LABEL: Record<(typeof TABS)[number], string> = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' };
const COLS = 'minmax(0,2fr) 1.2fr 1.4fr 1fr 120px';
const REASONS = ['Phone number could not be verified', 'Incomplete or unclear seller note', 'Suspicious or duplicate application', 'Does not meet our seller requirements'];

type SP = Promise<{ tab?: string; view?: string }>;

export default async function AdminSellersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  await requireAdmin();
  const tab = (TABS as readonly string[]).includes(sp.tab || '') ? (sp.tab as (typeof TABS)[number]) : 'PENDING';
  const where: Prisma.UserWhereInput = { sellerStatus: tab };
  const [rows, counts] = await Promise.all([
    db.user.findMany({ where, orderBy: { sellerAppliedAt: tab === 'PENDING' ? 'asc' : 'desc' }, take: 100 }),
    db.user.groupBy({ by: ['sellerStatus'], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.sellerStatus === s)?._count ?? 0;
  const view = sp.view ? await db.user.findUnique({ where: { id: sp.view }, include: { _count: { select: { listings: true, buyerOrders: true, sellerOrders: true } } } }) : null;
  const here = `/admin/sellers?tab=${tab}`;

  return (
    <div className="col g16">
      <div className="col" style={{ gap: 0 }}><div className="h2">Seller approvals</div><span className="soft">{countOf('PENDING')} waiting · {countOf('APPROVED')} approved · {countOf('REJECTED')} rejected</span></div>
      <div className="row wrapf g6">
        {TABS.map((t) => <Link key={t} className={'chip' + (t === tab ? ' on' : '')} style={{ height: 34 }} href={`/admin/sellers?tab=${t}`}>{TAB_LABEL[t]}<span className="t-xs" style={{ opacity: 0.7 }}>{countOf(t)}</span></Link>)}
      </div>
      {rows.length === 0 ? (
        <Empty icon="store" title={`No ${TAB_LABEL[tab].toLowerCase()} applications`} text="New seller applications will show up here for review." />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="dt-scroll"><div className="dt-inner">
            <div className="dt-row dt-head" style={{ gridTemplateColumns: COLS }}><span>Applicant</span><span>Phone</span><span>Location</span><span>Applied</span><span /></div>
            {rows.map((u) => (
              <div key={u.id} className="dt-row" style={{ gridTemplateColumns: COLS }}>
                <span className="col" style={{ gap: 0, minWidth: 0 }}><b className="clamp1">{u.name}</b><span className="t-xs muted clamp1">{u.email}</span></span>
                <span className="clamp1">{u.sellerPhone || '—'}</span>
                <span className="clamp1">{u.area ? `${u.area}, ${u.city}` : '—'}</span>
                <span className="t-xs muted">{u.sellerAppliedAt ? fmtDateTime(u.sellerAppliedAt) : '—'}</span>
                <span><Link className="btn btn-sec btn-xs" href={`${here}&view=${u.id}`}>{tab === 'PENDING' ? 'Review' : 'View'}</Link></span>
              </div>
            ))}
          </div></div>
        </div>
      )}

      {view && (
        <div className="overlay right">
          <Link href={here} aria-label="Close" style={{ position: 'absolute', inset: 0 }} />
          <div className="drawer" style={{ maxWidth: 480, position: 'relative' }} role="dialog" aria-modal="true" aria-label="Seller application">
            <div className="mhead">
              <div className="col" style={{ gap: 0, minWidth: 0 }}><span className="eyebrow">Seller application</span><div className="h3 clamp1">{view.name}</div><span className="t-sm muted">{view.email}</span></div>
              <Link className="icon-btn sm" aria-label="Close" href={here}><Ic n="x" /></Link>
            </div>
            <div className="mbody col g16" style={{ flex: 1 }}>
              <div className="row g8"><span className="t-sm muted">Status</span><span className={'badge ' + (view.sellerStatus === 'APPROVED' ? 'b-green' : view.sellerStatus === 'REJECTED' ? 'b-red' : 'b-amber')}>{TAB_LABEL[view.sellerStatus as (typeof TABS)[number]] ?? view.sellerStatus}</span></div>
              <div className="kv">
                <div>Phone</div><div>{view.sellerPhone || '—'}</div>
                <div>Location</div><div>{view.area ? `${view.area}, ${view.city}` : '—'}</div>
                <div>Applied</div><div>{view.sellerAppliedAt ? fmtDateTime(view.sellerAppliedAt) : '—'}</div>
                <div>Account since</div><div>{fmtDateTime(view.createdAt)}</div>
                <div>Listings so far</div><div>{view._count.listings}</div>
              </div>
              <div className="col g4"><span className="label">What they plan to sell</span><p className="t-sm soft" style={{ whiteSpace: 'pre-line' }}>{view.sellerNote || '—'}</p></div>
              {view.sellerRejectReason && <div className="note red"><Ic n="alert" s="sm" /><span>Previously rejected: {view.sellerRejectReason}</span></div>}
            </div>
            {view.sellerStatus !== 'APPROVED' && (
              <div className="mfoot col g8" style={{ alignItems: 'stretch' }}>
                <form action={approveSellerAction}>
                  <input type="hidden" name="id" value={view.id} /><input type="hidden" name="back" value={here} />
                  <button className="btn btn-pri btn-block" type="submit"><Ic n="check" s="sm" />Approve seller</button>
                </form>
                <form action={rejectSellerAction} className="row g8">
                  <input type="hidden" name="id" value={view.id} />
                  <select className="select grow" name="reason" aria-label="Reason">{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
                  <button className="btn btn-danger" type="submit">Reject</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
