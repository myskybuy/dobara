import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { confirmReceiptAction } from '@/app/actions/orders';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { fmtDateTime, inr } from '@/lib/format';
import { daysLeftToReport, hoursLeftToConfirm } from '@/lib/orders';
import { PriceDetails } from '@/components/PriceDetails';
import { FormError, Ic, Photo } from '@/components/ui';

export const metadata = { title: 'Check the item' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export default async function CheckItemPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser('/orders/' + id + '/check');
  const o = await db.order.findUnique({ where: { id }, include: { listing: true, seller: true } });
  if (!o || o.buyerId !== user.id) notFound();
  if (o.status !== 'DELIVERED') redirect('/orders/' + id);
  const first = o.seller.name.split(' ')[0];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="split">
        <div className="col g16">
          <div className="card pad row g12" style={{ background: 'var(--green-50)', borderColor: '#CBE7D6' }}>
            <Ic n="checkc" s="lg" className="c-green" />
            <div className="col g4" style={{ gap: 0 }}>
              <b className="t-lg">Your item has been handed over</b>
              <span className="t-sm soft">{fmtDateTime(o.deliveredAt)} · Check it now — confirm within {hoursLeftToConfirm(o)} hours. You can report a problem for {daysLeftToReport(o)} more days.</span>
            </div>
          </div>
          <FormError msg={error} />

          <div className="card pad row g16 wrapf">
            <div style={{ width: 160, borderRadius: 12, overflow: 'hidden' }}><Photo src={o.listing.photos[0]} /></div>
            <div className="col g6 t-sm">
              <b>{o.listing.title}</b>
              <span className="soft">Condition listed: {o.listing.condition}</span>
              <span className="soft">{o.mode === 'DELIVERY' ? o.address : `${o.pickupPlace} · ${o.pickupTime}`}</span>
            </div>
          </div>

          <form action={confirmReceiptAction} className="card pad col g12">
            <input type="hidden" name="orderId" value={o.id} />
            <b>Before you confirm, check that:</b>
            {['It matches the photos and description', 'It powers on and works as expected', 'All listed accessories are included', 'Serial / IMEI matches the bill (if any)'].map((t) => (
              <label key={t} className="row g8 t-sm"><input type="checkbox" required /> {t}</label>
            ))}
            <div className="note amber"><Ic n="alert" s="sm" /><span>Confirming completes the order and {first} is paid after the 7-day problem window. If something is wrong later, you can still report it within 7 days of delivery.</span></div>
            <div className="row wrapf g8">
              <button className="btn btn-pri" type="submit"><Ic n="checkc" s="sm" />Everything’s fine — confirm receipt</button>
              <Link className="btn btn-sec" href={`/orders/${o.id}/report`}><Ic n="alert" s="sm" />Report a problem</Link>
            </div>
            <span className="t-xs muted row g6"><Ic n="clock" s="xs" />If you take no action, the order is confirmed automatically after 48 hours.</span>
          </form>
        </div>
        <aside className="col g12 sticky">
          <PriceDetails title={o.listing.title} photo={o.listing.photos[0]} price={o.agreedPrice} fee={o.deliveryFee} />
        </aside>
      </div>
    </div>
  );
}
