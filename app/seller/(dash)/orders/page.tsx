import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { fmtDateTime, inr } from '@/lib/format';
import { autoCompleteOrders } from '@/lib/orders';
import { Empty, Notice, Photo } from '@/components/ui';

export const metadata = { title: 'Orders' };

const TABS = [
  { key: 'new', label: 'New', statuses: ['PAID'] },
  { key: 'progress', label: 'In progress', statuses: ['ACCEPTED', 'HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DELIVERED', 'ISSUE_REPORTED'] },
  { key: 'completed', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
] as const;

export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string; declined?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/seller/orders');
  await autoCompleteOrders();
  const all = await db.order.findMany({
    where: { sellerId: user.id, status: { not: 'PENDING_PAYMENT' } },
    include: { listing: true, buyer: true },
    orderBy: { createdAt: 'desc' },
  });
  const count = (s: readonly string[]) => all.filter((o) => s.includes(o.status)).length;
  const t = TABS.find((x) => x.key === sp.tab) ?? (count(TABS[0].statuses) ? TABS[0] : TABS[1]);
  const shown = all.filter((o) => (t.statuses as readonly string[]).includes(o.status));

  return (
    <div className="col g16" style={{ maxWidth: 1000 }}>
      <div className="h2">Orders</div>
      {sp.declined && <Notice>Order declined. The buyer will be refunded and your listing is live again.</Notice>}
      <div className="tabs">
        {TABS.map((x) => <Link key={x.key} className={x.key === t.key ? 'tab on' : 'tab'} href={`/seller/orders?tab=${x.key}`}>{x.label}<span className="count">{count(x.statuses)}</span></Link>)}
      </div>
      {shown.length === 0 ? (
        <Empty icon="package" title="No orders here" text="When a buyer pays for one of your items, the order shows up here." />
      ) : (
        <div className="card tblwrap" style={{ overflow: 'hidden' }}>
          {shown.map((o) => (
            <Link key={o.id} className="menu-i" href={`/seller/orders/${o.id}`} style={{ alignItems: 'center' }}>
              <span style={{ width: 64, borderRadius: 8, overflow: 'hidden', flex: 'none' }}><Photo src={o.listing.photos[0]} /></span>
              <span className="col grow" style={{ gap: 2, minWidth: 0 }}>
                <b className="t-sm clamp1">{o.listing.title}</b>
                <span className="t-xs muted">{o.code} · {fmtDateTime(o.paidAt ?? o.createdAt)} · Buyer: {o.buyer.name}</span>
                <span className="row g6"><span className={'badge ' + ORDER_STATUS_BADGE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</span><span className="badge b-gray">{o.mode === 'DELIVERY' ? 'Delivery' : 'Pickup'}</span></span>
              </span>
              <b className="num">{inr(o.agreedPrice)}</b>
              <i className="ic sm i-chevr muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
