import { resolveComplaintAction, resolveContactMessageAction } from '@/app/actions/admin';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { fmtDateTime, inr } from '@/lib/format';
import { balanceDue, onlinePaid } from '@/lib/payplan';
import { Empty, Notice, Photo } from '@/components/ui';

export const metadata = { title: 'Complaints' };

export default async function AdminComplaintsPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const { done } = await searchParams;
  await requireAdmin();
  const list = await db.complaint.findMany({
    include: { user: true, order: { include: { listing: true, seller: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
  });
  const contact = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });

  return (
    <div className="col g16" style={{ maxWidth: 1000 }}>
      <div className="h2">Complaints</div>
      {done && <Notice kind="teal">Complaint resolved.</Notice>}
      {list.length === 0 ? (
        <Empty icon="checkc" title="No complaints" text="When a buyer reports a problem with an order, it shows up here and the seller payout is held." />
      ) : (
        list.map((c) => (
          <div key={c.id} className="card pad col g12">
            <div className="row g12 wrapf">
              <div style={{ width: 72, borderRadius: 8, overflow: 'hidden', flex: 'none' }}><Photo src={c.order.listing.photos[0]} /></div>
              <div className="col g4 grow" style={{ minWidth: 220 }}>
                <span className="row g8"><span className={'badge ' + (c.status === 'OPEN' ? 'b-amber' : 'b-green')}>{c.status === 'OPEN' ? 'Open' : 'Resolved'}</span><span className="t-xs muted">{fmtDateTime(c.createdAt)} · Order {c.order.code}</span></span>
                <b>{c.reason}</b>
                <span className="t-sm soft">{c.order.listing.title} · {inr(c.order.total)} · Buyer {c.user.name} · Seller {c.order.seller.name}</span>
                <span className="t-xs muted">Paid online (refundable by Dobara): {inr(onlinePaid(c.order))}{balanceDue(c.order) > 0 ? ` · ${inr(balanceDue(c.order))} paid to the seller directly` : ''}</span>
              </div>
            </div>
            <p className="t-sm" style={{ whiteSpace: 'pre-line' }}>“{c.text}”</p>
            {c.status === 'OPEN' ? (
              <form action={resolveComplaintAction} className="col g8">
                <input type="hidden" name="id" value={c.id} />
                <input className="input" name="note" placeholder="Note to the buyer (optional)" />
                <div className="row g8 wrapf">
                  <button className="btn btn-danger btn-sm" type="submit" name="outcome" value="refund_buyer">Refund buyer (cancel order)</button>
                  <button className="btn btn-sec btn-sm" type="submit" name="outcome" value="release_seller">Release payment to seller</button>
                </div>
              </form>
            ) : (
              <span className="t-sm muted">Outcome: {c.outcome === 'refund_buyer' ? 'Buyer refunded' : 'Paid to seller'}{c.adminNote ? ` · ${c.adminNote}` : ''}</span>
            )}
          </div>
        ))
      )}

      <div className="h3" style={{ marginTop: 12 }}>Contact form messages</div>
      {contact.length === 0 ? <div className="card pad t-sm muted">No messages yet.</div> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {contact.map((m) => (
            <div key={m.id} className="col g4" style={{ padding: '14px 16px', borderTop: '1px solid var(--line2)' }}>
              <span className="row between g8 wrapf">
                <b className="t-sm">{m.name} · {m.email}</b>
                <span className="row g8"><span className="t-xs muted">{fmtDateTime(m.createdAt)}</span><span className={'badge ' + (m.resolved ? 'b-green' : 'b-amber')}>{m.resolved ? 'Resolved' : 'Open'}</span></span>
              </span>
              <span className="t-xs muted">{m.topic}{m.orderCode ? ' · ' + m.orderCode : ''}</span>
              <span className="t-sm soft">{m.message}</span>
              {!m.resolved && (
                <form action={resolveContactMessageAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="btn btn-sec btn-xs" type="submit">Mark resolved</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
