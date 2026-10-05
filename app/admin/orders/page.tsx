import Link from 'next/link';
import { adminCancelOrderAction, markPayoutPaidAction } from '@/app/actions/admin';
import { requireAdmin } from '@/lib/auth';
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { fmtDateTime, inr } from '@/lib/format';
import { autoCompleteOrders } from '@/lib/orders';

export const metadata = { title: 'Orders & payouts' };

const COLS = 'minmax(0,2fr) 1.2fr 1.2fr 0.9fr 1.3fr 110px';

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = 'orders' } = await searchParams;
  await requireAdmin();
  await autoCompleteOrders();
  const orders = tab === 'orders'
    ? await db.order.findMany({ where: { status: { not: 'PENDING_PAYMENT' } }, include: { listing: true, buyer: true, seller: true }, orderBy: { createdAt: 'desc' }, take: 200 })
    : [];
  const payouts = tab === 'payouts'
    ? await db.payout.findMany({ include: { seller: true, order: { include: { listing: true } } }, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 200 })
    : [];

  return (
    <div className="col g16">
      <div className="h2">Orders &amp; payouts</div>
      <div className="tabs">
        <Link className={tab === 'orders' ? 'tab on' : 'tab'} href="/admin/orders">Orders</Link>
        <Link className={tab === 'payouts' ? 'tab on' : 'tab'} href="/admin/orders?tab=payouts">Seller payouts</Link>
      </div>
      {tab === 'orders' ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="dt-scroll"><div className="dt-inner">
            <div className="dt-row dt-head" style={{ gridTemplateColumns: COLS }}><span>Order</span><span>Buyer</span><span>Seller</span><span>Total</span><span>Status</span><span /></div>
            {orders.length === 0 && <div className="pad t-sm muted">No orders yet.</div>}
            {orders.map((o) => (
              <div key={o.id} className="dt-row" style={{ gridTemplateColumns: COLS }}>
                <span className="col" style={{ gap: 0, minWidth: 0 }}><b className="clamp1">{o.listing.title}</b><span className="t-xs muted">{o.code} · {o.mode === 'DELIVERY' ? 'Delivery' : 'Pickup'} · {fmtDateTime(o.paidAt ?? o.createdAt)} · {o.paymentMode === 'razorpay' ? 'Razorpay' : 'Demo pay'}</span></span>
                <span className="clamp1">{o.buyer.name}</span>
                <span className="clamp1">{o.seller.name}</span>
                <span className="num strong">{inr(o.total)}</span>
                <span><span className={'badge ' + ORDER_STATUS_BADGE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</span></span>
                <span>
                  {!['COMPLETED', 'CANCELLED'].includes(o.status) && (
                    <form action={adminCancelOrderAction}><input type="hidden" name="id" value={o.id} /><button className="btn btn-ghost btn-xs c-red" type="submit">Cancel &amp; refund</button></form>
                  )}
                </span>
              </div>
            ))}
          </div></div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="dt-scroll"><div className="dt-inner">
            <div className="dt-row dt-head" style={{ gridTemplateColumns: 'minmax(0,2fr) 1.3fr 1fr 1fr 130px' }}><span>Order</span><span>Seller</span><span>Amount</span><span>Status</span><span /></div>
            {payouts.length === 0 && <div className="pad t-sm muted">No payouts yet. A payout is created when the buyer confirms receipt.</div>}
            {payouts.map((p) => (
              <div key={p.id} className="dt-row" style={{ gridTemplateColumns: 'minmax(0,2fr) 1.3fr 1fr 1fr 130px' }}>
                <span className="col" style={{ gap: 0, minWidth: 0 }}><b className="clamp1">{p.order.listing.title}</b><span className="t-xs muted">{p.order.code}</span></span>
                <span className="col" style={{ gap: 0, minWidth: 0 }}><span className="clamp1">{p.seller.name}</span><span className="t-xs muted clamp1">{p.seller.email}</span></span>
                <span className="num strong">{inr(p.amount)}</span>
                <span><span className={'badge ' + (p.status === 'PAID' ? 'b-green' : 'b-amber')}>{p.status === 'PAID' ? 'Paid ' + fmtDateTime(p.paidAt) : 'Pending'}</span></span>
                <span>{p.status === 'PENDING' && <form action={markPayoutPaidAction}><input type="hidden" name="id" value={p.id} /><button className="btn btn-pri btn-xs" type="submit">Mark as paid</button></form>}</span>
              </div>
            ))}
          </div></div>
        </div>
      )}
    </div>
  );
}
