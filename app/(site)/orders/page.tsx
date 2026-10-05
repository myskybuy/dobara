import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { fmtDateTime, inr } from '@/lib/format';
import { autoCompleteOrders } from '@/lib/orders';
import { Empty, Photo } from '@/components/ui';

export const metadata = { title: 'My orders' };

const TABS = [
  { key: 'active', label: 'Active', statuses: ['PAID', 'ACCEPTED', 'HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DELIVERED', 'ISSUE_REPORTED'] },
  { key: 'completed', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
] as const;

export default async function MyOrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = 'active' } = await searchParams;
  const user = await requireUser('/orders');
  await autoCompleteOrders();
  const all = await db.order.findMany({
    where: { buyerId: user.id, status: { not: 'PENDING_PAYMENT' } },
    include: { listing: true, seller: true },
    orderBy: { createdAt: 'desc' },
  });
  const t = TABS.find((x) => x.key === tab) ?? TABS[0];
  const shown = all.filter((o) => (t.statuses as readonly string[]).includes(o.status));

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 24, paddingBottom: 48 }}>
      <div className="h2" style={{ marginBottom: 12 }}>My orders</div>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map((x) => (
          <Link key={x.key} className={x.key === t.key ? 'tab on' : 'tab'} href={`/orders?tab=${x.key}`}>
            {x.label}<span className="count">{all.filter((o) => (x.statuses as readonly string[]).includes(o.status)).length}</span>
          </Link>
        ))}
      </div>
      {shown.length === 0 ? (
        <Empty icon="package" title="No orders here" text="When you buy something, it shows up here with its status." cta={{ href: '/browse', label: 'Browse items' }} />
      ) : (
        <div className="col g12">
          {shown.map((o) => (
            <div key={o.id} className="card pad-s row g16 wrapf">
              <div style={{ width: 72, borderRadius: 10, overflow: 'hidden', flex: 'none' }}><Photo src={o.listing.photos[0]} /></div>
              <div className="col g4 grow" style={{ minWidth: 200 }}>
                <span className="t-xs muted">{o.code} · {fmtDateTime(o.paidAt ?? o.createdAt)}</span>
                <b className="clamp1">{o.listing.title}</b>
                <span className="t-sm soft">Seller: {o.seller.name} · {o.mode === 'DELIVERY' ? 'Delivery' : 'Pickup'}</span>
                <span className={'badge ' + ORDER_STATUS_BADGE[o.status]} style={{ alignSelf: 'flex-start' }}>{ORDER_STATUS_LABEL[o.status]}</span>
              </div>
              <div className="col g8" style={{ alignItems: 'flex-end' }}>
                <b className="num">{inr(o.total)}</b>
                <Link className="btn btn-sec btn-sm" href={`/orders/${o.id}`}>View details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
