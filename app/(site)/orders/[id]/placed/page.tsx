import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr } from '@/lib/format';
import { balanceDue, isPartPaid, onlinePaid } from '@/lib/payplan';
import { CheckoutSteps } from '@/components/CheckoutSteps';
import { PriceDetails } from '@/components/PriceDetails';
import { Ic } from '@/components/ui';

export const metadata = { title: 'Order confirmed' };

export default async function OrderPlacedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('/orders/' + id);
  const o = await db.order.findUnique({ where: { id }, include: { listing: true, seller: true } });
  if (!o || o.buyerId !== user.id || o.status === 'PENDING_PAYMENT') notFound();
  const first = o.seller.name.split(' ')[0];
  const cod = o.paymentMode === 'cod';
  return (
    <>
      <CheckoutSteps at={2} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div className="split">
          <div className="col g16">
            <section className="hero" style={{ padding: 28 }}>
              <div className="col g12" style={{ position: 'relative', zIndex: 1 }}>
                <span className="badge b-white" style={{ alignSelf: 'flex-start' }}>Order {o.code}</span>
                <div className="h2" style={{ color: '#fff' }}>Order placed — waiting for {first}</div>
                <p style={{ color: '#C9C6F5', margin: 0 }}>{cod
                  ? <>Cash on delivery — keep {inr(o.total)} ready and pay {first} in cash or UPI only after you check the item. The item is now marked Sold.</>
                  : isPartPaid(o)
                    ? <>{inr(onlinePaid(o))} is held safely by Dobara. Keep {inr(balanceDue(o))} ready and pay it to {first} in cash or UPI after you check the item. {first} usually confirms within a few hours.</>
                    : <>{inr(o.total)} is held safely by Dobara. {first} usually confirms within a few hours. {first} is paid only after you confirm you received the item.</>}</p>
                <div className="row g8 wrapf">
                  <Link className="btn btn-amber" href={`/orders/${o.id}`}><Ic n="package" s="sm" />Track order</Link>
                  {o.conversationId && <Link className="btn btn-sec" href={`/chat/${o.conversationId}`}><Ic n="chat" s="sm" />Message seller</Link>}
                </div>
              </div>
            </section>
            <div className="card pad col g12">
              <b>What happens next</b>
              <div className="tl">
                {(o.mode === 'DELIVERY'
                  ? [['Seller accepts', 'You get an update on the order page'], ['Seller sends it', 'Item is handed to delivery'], ['You receive it', 'Share your OTP at the door'], ['Check & confirm', cod ? 'Pay the seller, then confirm' : 'Then the seller gets paid']]
                  : [['Seller accepts', 'You get an update on the order page'], ['Meet the seller', `${o.pickupPlace} · ${o.pickupTime}`], ['Check & hand over OTP', 'Inspect the item first'], ['Confirm receipt', cod ? 'Pay the seller in cash / UPI' : 'Then the seller gets paid']]
                ).map(([t, d], i) => (
                  <div key={t} className={i === 0 ? 'tl-i now' : 'tl-i'}>
                    <span className="tl-dot t-xs strong">{i + 1}</span>
                    <div className="col g4" style={{ gap: 0 }}><span className="tl-t">{t}</span><span className="t-xs muted">{d}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="col g12 sticky">
            <PriceDetails title={o.listing.title} photo={o.listing.photos[0]} price={o.agreedPrice} fee={o.deliveryFee} />
          </aside>
        </div>
      </div>
    </>
  );
}
