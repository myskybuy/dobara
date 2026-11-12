import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { fmtDate, inr } from '@/lib/format';
import { autoCompleteOrders, payoutAmount } from '@/lib/orders';
import { Empty, Ic } from '@/components/ui';

export const metadata = { title: 'Earnings & payouts' };

export default async function EarningsPage() {
  const user = await requireUser('/seller/earnings');
  await autoCompleteOrders();
  const payouts = await db.payout.findMany({ where: { sellerId: user.id }, include: { order: { include: { listing: true } } }, orderBy: { createdAt: 'desc' } });
  // Online money Dobara still holds for this seller: open orders, plus completed ones still inside the 7-day problem window.
  const heldOrders = await db.order.findMany({
    where: {
      sellerId: user.id,
      NOT: { paymentMode: 'cod' },
      OR: [
        { status: { in: ['PAID', 'ACCEPTED', 'HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DELIVERED', 'ISSUE_REPORTED'] } },
        { status: 'COMPLETED', payout: { is: null } },
      ],
    },
  });
  const held = heldOrders.reduce((a, o) => a + payoutAmount(o), 0);
  const sum = (f: (p: (typeof payouts)[number]) => boolean) => payouts.filter(f).reduce((a, p) => a + p.amount, 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  return (
    <div className="col g16" style={{ maxWidth: 1120 }}>
      <div className="row between wrapf g8"><div className="h2">Earnings &amp; payouts</div><span className="t-sm soft row g6"><Ic n="bank" s="sm" />Paid to your bank account by the Dobara team</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
        <div className="card stat"><span className="t-sm muted">Lifetime earnings</span><span className="stat-v">{inr(sum(() => true))}</span><span className="t-xs muted">{payouts.length} sales</span></div>
        <div className="card stat"><span className="t-sm muted">This month</span><span className="stat-v">{inr(sum((p) => p.createdAt >= monthStart))}</span><span className="t-xs muted">Completed orders</span></div>
        <div className="card stat"><span className="t-sm muted">Held in Secure Pay</span><span className="stat-v">{inr(held)}</span><span className="t-xs muted">Released 7 days after delivery</span></div>
        <div className="card stat"><span className="t-sm muted">Pending payout</span><span className="stat-v">{inr(sum((p) => p.status === 'PENDING'))}</span><span className="t-xs muted">Usually next working day</span></div>
      </div>
      {payouts.length === 0 ? (
        <Empty icon="wallet" title="No payouts yet" text="Your payout appears here 7 days after delivery, once the buyer’s problem-report window is over." />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="pad-s"><b>Payouts</b></div>
          {payouts.map((p) => (
            <div key={p.id} className="row between g12" style={{ padding: '14px 16px', borderTop: '1px solid var(--line2)' }}>
              <span className="col" style={{ gap: 0 }}><b className="t-sm">{p.order.listing.title}</b><span className="t-xs muted">{p.order.code} · {fmtDate(p.paidAt ?? p.createdAt)}</span></span>
              <span className="row g12"><b className="num">{inr(p.amount)}</b><span className={'badge ' + (p.status === 'PAID' ? 'b-green' : 'b-amber')}>{p.status === 'PAID' ? 'Paid' : 'Pending'}</span></span>
            </div>
          ))}
        </div>
      )}
      <div className="note gray"><Ic n="info" s="sm" /><span>Listing is free. You receive the full agreed price: anything the buyer pays you at handover (part-payment or cash on delivery) plus the online part, which Dobara pays out 7 days after delivery. Buyers pay the delivery fee.</span></div>
    </div>
  );
}
