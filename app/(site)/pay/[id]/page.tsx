import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { demoPayAction } from '@/app/actions/orders';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr } from '@/lib/format';
import { razorpayEnabled } from '@/lib/payments';
import { CheckoutSteps } from '@/components/CheckoutSteps';
import { PriceDetails } from '@/components/PriceDetails';
import { RazorpayButton } from '@/components/RazorpayButton';
import { FormError, Ic } from '@/components/ui';

export const metadata = { title: 'Confirm & pay' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export default async function PayPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser('/pay/' + id);
  const o = await db.order.findUnique({ where: { id }, include: { listing: true, seller: true } });
  if (!o || o.buyerId !== user.id) notFound();
  if (o.status !== 'PENDING_PAYMENT') redirect('/orders/' + id);
  const live = razorpayEnabled();

  return (
    <>
      <CheckoutSteps at={1} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div className="split">
          <div className="col g16">
            <div className="row between wrapf g8"><div className="h2">Confirm &amp; pay</div><span className="t-sm muted row g6"><Ic n="lock" s="sm" />Secure payment</span></div>
            <FormError msg={error} />

            <div className="card pad col g12">
              <b>Order summary</b>
              <div className="kv">
                <div>Item</div><div>{o.listing.title}</div>
                <div>Seller</div><div>{o.seller.name}</div>
                <div>{o.mode === 'DELIVERY' ? 'Deliver to' : 'Pickup'}</div>
                <div>{o.mode === 'DELIVERY' ? o.address : `${o.pickupPlace} · ${o.pickupTime}`}</div>
              </div>
              <Link className="linkbtn t-sm" href={o.conversationId ? '/checkout/' + o.conversationId : '/orders'}><Ic n="edit" s="sm" />Change pickup / delivery</Link>
            </div>

            {live ? (
              <div className="card pad col g12">
                <b>Pay with Razorpay</b>
                <span className="t-sm soft">UPI, cards and net banking. This uses your Razorpay <b>test</b> keys — use Razorpay test card / UPI details, no real money moves.</span>
                <RazorpayButton orderId={o.id} label={'Pay ' + inr(o.total)} name={user.name} email={user.email} />
              </div>
            ) : (
              <form action={demoPayAction} className="col g12">
                <input type="hidden" name="orderId" value={o.id} />
                <div className="note amber"><Ic n="info" s="sm" /><span><b>Demo payment mode.</b> No Razorpay keys are set, so no money moves. Add test keys in <code>.env</code> to use real Razorpay test checkout.</span></div>
                {[
                  ['upi', 'UPI', 'zap', 'Google Pay, PhonePe, Paytm, BHIM'],
                  ['card', 'Credit / Debit card', 'card', 'Visa, Mastercard, RuPay'],
                  ['nb', 'Net banking', 'bank', 'All major Indian banks'],
                ].map(([k, l, ic, d], i) => (
                  <label key={k} className="opt">
                    <input type="radio" name="method" value={k} defaultChecked={i === 0} />
                    <span className="radio" />
                    <span className="mi-ic"><Ic n={ic!} /></span>
                    <span className="col" style={{ gap: 0 }}><b>{l}</b><span className="t-xs muted">{d}</span></span>
                  </label>
                ))}
                <button className="btn btn-pri btn-lg btn-block" type="submit"><Ic n="lock" s="sm" />Pay {inr(o.total)} (demo)</button>
                <button className="btn btn-ghost btn-sm" type="submit" name="simulate" value="fail" style={{ alignSelf: 'center' }}>Simulate a failed payment</button>
              </form>
            )}
            <span className="t-xs muted">By paying you agree to Dobara’s <Link href="/terms">Terms</Link>. The seller is paid only after you confirm you received the item.</span>
          </div>
          <aside className="col g12 sticky">
            <PriceDetails title={o.listing.title} photo={o.listing.photos[0]} price={o.agreedPrice} fee={o.deliveryFee} />
          </aside>
        </div>
      </div>
    </>
  );
}
