import { notFound, redirect } from 'next/navigation';
import { createOrderAction } from '@/app/actions/orders';
import { requireUser } from '@/lib/auth';
import { DELIVERY_FEE } from '@/lib/constants';
import { db } from '@/lib/db';
import { CheckoutSteps } from '@/components/CheckoutSteps';
import { PriceDetails } from '@/components/PriceDetails';
import { FormError, Ic } from '@/components/ui';

export const metadata = { title: 'Pickup or delivery' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser('/checkout/' + id);
  const c = await db.conversation.findUnique({ where: { id }, include: { listing: true, seller: true } });
  if (!c || c.buyerId !== user.id) notFound();
  if (c.agreedPrice == null || c.listing.status !== 'ACTIVE') redirect('/chat/' + id);
  const pending = await db.order.findFirst({ where: { conversationId: id, status: 'PENDING_PAYMENT' } });
  const l = c.listing;
  const defMode = pending?.mode ?? (l.canDeliver ? 'DELIVERY' : 'PICKUP');
  const sellerFirst = c.seller.name.split(' ')[0];

  return (
    <>
      <CheckoutSteps at={0} />
      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <form action={createOrderAction} className="split">
          <input type="hidden" name="conversationId" value={id} />
          <div className="col g16">
            <div className="col g4"><div className="h2">How do you want to get it?</div><span className="soft">{l.title} · {l.area}, {l.city}</span></div>
            <FormError msg={error} />
            <div className="grid2">
              {l.canPickup && (
                <label className="opt" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12, padding: 20 }}>
                  <input type="radio" name="mode" value="PICKUP" defaultChecked={defMode === 'PICKUP'} />
                  <span className="row between" style={{ width: '100%' }}><span className="mi-ic" style={{ background: 'var(--pri-50)', color: 'var(--pri)', width: 48, height: 48 }}><Ic n="store" s="lg" /></span><span className="radio" /></span>
                  <span className="eyebrow c-pri">Pickup myself</span><b className="t-lg">Collect from the seller</b>
                  <span className="t-sm soft">Meet {sellerFirst} near {l.area} at the place and time you agreed in chat. Check the item, then share your pickup OTP.</span>
                  <span className="row g8 wrapf"><span className="badge b-green">Free</span></span>
                </label>
              )}
              {l.canDeliver && (
                <label className="opt" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12, padding: 20 }}>
                  <input type="radio" name="mode" value="DELIVERY" defaultChecked={defMode === 'DELIVERY'} />
                  <span className="row between" style={{ width: '100%' }}><span className="mi-ic" style={{ background: 'var(--teal-50)', color: 'var(--teal)', width: 48, height: 48 }}><Ic n="scooter" s="lg" /></span><span className="radio" /></span>
                  <span className="eyebrow c-teal">Get it delivered</span><b className="t-lg">Doorstep delivery</b>
                  <span className="t-sm soft">The seller sends it to your address. You get status updates on the order page and share an OTP at handover.</span>
                  <span className="row g8 wrapf"><span className="badge b-amber">₹{DELIVERY_FEE}</span><span className="badge b-gray">Usually same or next day</span></span>
                </label>
              )}
            </div>

            {l.canPickup && (
              <div className="card pad col g12">
                <b className="row g8"><Ic n="store" s="sm" />If you pick up</b>
                <div className="grid2" style={{ gap: 12 }}>
                  <div className="field"><label className="label" htmlFor="pp">Meeting place</label><input id="pp" className="input" name="pickupPlace" placeholder={`e.g. ${l.area} metro station, gate 2`} defaultValue={pending?.pickupPlace ?? ''} /></div>
                  <div className="field"><label className="label" htmlFor="pt">Day &amp; time</label><input id="pt" className="input" name="pickupTime" placeholder="e.g. Today, 6–7 PM" defaultValue={pending?.pickupTime ?? ''} /></div>
                </div>
                <span className="hint">Use what you agreed with {sellerFirst} in chat. Prefer a public place in daylight.</span>
              </div>
            )}
            {l.canDeliver && (
              <div className="card pad col g12">
                <b className="row g8"><Ic n="home" s="sm" />If you get it delivered</b>
                <div className="field"><label className="label" htmlFor="ad">Delivery address</label><textarea id="ad" className="textarea" name="address" rows={2} placeholder="House / flat, building, street, area, city, PIN" defaultValue={pending?.address ?? user.address ?? ''} /></div>
                <label className="row g8 t-sm"><input type="checkbox" name="saveAddress" value="1" defaultChecked /> Save this address to my profile</label>
              </div>
            )}
            <div className="note"><Ic n="info" s="sm" /><span>Flat delivery fee of ₹{DELIVERY_FEE}. Your payment stays on hold until you confirm receipt either way.</span></div>
            <div className="row end"><button className="btn btn-pri btn-lg" type="submit">Continue to payment<Ic n="chevr" s="sm" /></button></div>
          </div>
          <aside className="col g12 sticky">
            <PriceDetails title={l.title} photo={l.photos[0]} price={c.agreedPrice} fee={defMode === 'DELIVERY' ? DELIVERY_FEE : 0} />
            <span className="t-xs muted">Delivery fee is added only if you choose delivery.</span>
          </aside>
        </form>
      </div>
    </>
  );
}
