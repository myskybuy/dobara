import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buyerReceivedAction } from '@/app/actions/orders';
import { requireUser } from '@/lib/auth';
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { inr } from '@/lib/format';
import { autoCompleteOrders, hoursLeftToConfirm, isCod, orderSteps } from '@/lib/orders';
import { PriceDetails } from '@/components/PriceDetails';
import { Timeline } from '@/components/Timeline';
import { FormError, Ic, Notice } from '@/components/ui';

export const metadata = { title: 'Order status' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; reported?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser('/orders/' + id);
  await autoCompleteOrders();
  const o = await db.order.findUnique({ where: { id }, include: { listing: true, seller: true, reviews: true, complaints: { orderBy: { createdAt: 'desc' }, take: 1 } } });
  if (!o || o.buyerId !== user.id || o.status === 'PENDING_PAYMENT') notFound();
  const steps = orderSteps(o, o.seller.name.split(' ')[0]!);
  const current = steps.find((s) => s.state === 'now') ?? steps[steps.length - 1]!;
  const showOtp = ['PAID', 'ACCEPTED', 'HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.status);
  const canSayReceived = ['ACCEPTED', 'HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.status);
  const reviewed = o.reviews.some((r) => r.fromUserId === user.id);
  const complaint = o.complaints[0];
  const cod = isCod(o);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="split">
        <div className="col g16">
          <div className="row g8"><Link className="icon-btn bd sm" aria-label="Back" href="/orders"><Ic n="chevl" s="sm" /></Link><span className="t-sm muted">Order {o.code}</span></div>
          <FormError msg={sp.error} />
          {sp.reported && <Notice kind="amber">Thanks — your problem was reported. The seller’s payment is on hold and our team will reply within 24 hours.</Notice>}

          <div className="card pad col g8">
            <span className={'badge ' + ORDER_STATUS_BADGE[o.status]} style={{ alignSelf: 'flex-start' }}>{ORDER_STATUS_LABEL[o.status]}</span>
            <div className="h2">{o.status === 'COMPLETED' ? 'Order complete' : o.status === 'CANCELLED' ? 'Order cancelled' : o.status === 'ISSUE_REPORTED' ? 'Problem reported' : current.title}</div>
            <p className="soft">
              {o.status === 'CANCELLED' ? (cod ? 'This order was cancelled. Nothing was charged.' : 'The seller could not complete this order. Your payment will be refunded.') :
                o.status === 'ISSUE_REPORTED' ? 'Our team is looking into it. The seller is not paid until it is resolved.' :
                o.status === 'COMPLETED' ? (cod ? 'You confirmed receipt. Thanks for using Dobara!' : 'You confirmed receipt and the seller has been paid. Thanks for using Dobara!') : current.desc}
            </p>
            <span className={'badge ' + (cod ? 'b-amber' : 'b-green')} style={{ alignSelf: 'flex-start' }}><Ic n={cod ? 'wallet' : 'lock'} s="xs" />{cod ? (o.status === 'COMPLETED' || o.status === 'DELIVERED' ? 'Cash on delivery' : `Cash on delivery — pay ${inr(o.total)} at handover`) : `Paid online — ${inr(o.total)} held by Dobara`}</span>
            <span className="t-sm muted">{o.mode === 'DELIVERY' ? <>Deliver to: {o.address}</> : <>Pickup: {o.pickupPlace} · {o.pickupTime}</>}</span>
          </div>

          {showOtp && (
            <div className="card pad row between wrapf g16" style={{ borderColor: 'var(--pri-100)', background: 'var(--pri-50)' }}>
              <div className="col g4" style={{ gap: 2 }}>
                <b className="c-pri">Your {o.mode === 'DELIVERY' ? 'delivery' : 'pickup'} OTP</b>
                <span className="t-sm soft">Share it only when the item is in front of you.</span>
              </div>
              <div className="otp">{o.handoverOtp.split('').map((d, i) => <span key={i} className="otpbox">{d}</span>)}</div>
            </div>
          )}

          {o.status === 'DELIVERED' && (
            <div className="card pad row between wrapf g12" style={{ background: 'var(--green-50)', borderColor: '#CBE7D6' }}>
              <div className="row g12"><Ic n="checkc" s="lg" className="c-green" />
                <div className="col g4" style={{ gap: 0 }}><b>Item handed over</b><span className="t-sm soft">Check it and confirm within {hoursLeftToConfirm(o)} hours, or report a problem.</span></div>
              </div>
              <Link className="btn btn-pri" href={`/orders/${o.id}/check`}>Check &amp; confirm</Link>
            </div>
          )}

          {o.status === 'COMPLETED' && !reviewed && (
            <div className="card pad row between wrapf g12">
              <div className="col g4" style={{ gap: 0 }}><b>How was {o.seller.name.split(' ')[0]}?</b><span className="t-sm soft">Your review helps other buyers.</span></div>
              <Link className="btn btn-amber" href={`/orders/${o.id}/review`}><Ic n="star" s="sm" />Leave a review</Link>
            </div>
          )}

          {complaint && (
            <div className="card pad col g6">
              <b>Your report: {complaint.reason}</b>
              <span className="t-sm soft">{complaint.text}</span>
              <span className={'badge ' + (complaint.status === 'OPEN' ? 'b-amber' : 'b-green')} style={{ alignSelf: 'flex-start' }}>{complaint.status === 'OPEN' ? 'Under review' : 'Resolved'}</span>
              {complaint.adminNote && <span className="t-sm">Dobara: {complaint.adminNote}</span>}
            </div>
          )}

          <div className="card pad col g12">
            <b>Order status</b>
            <Timeline steps={steps} />
          </div>

          {canSayReceived && (
            <form action={buyerReceivedAction} className="row between wrapf g12 panel">
              <input type="hidden" name="orderId" value={o.id} />
              <span className="t-sm soft">Already have the item in your hands?</span>
              <button className="btn btn-sec btn-sm" type="submit"><Ic n="package" s="sm" />I have received the item</button>
            </form>
          )}
        </div>

        <aside className="col g12 sticky">
          <PriceDetails title={o.listing.title} photo={o.listing.photos[0]} price={o.agreedPrice} fee={o.deliveryFee} />
          <div className="card" style={{ overflow: 'hidden' }}>
            {o.conversationId && <Link className="menu-i" href={`/chat/${o.conversationId}`}><span className="mi-ic"><Ic n="chat" /></span><span className="grow">Message {o.seller.name}</span><Ic n="chevr" s="sm" className="muted" /></Link>}
            {['PAID', 'ACCEPTED', 'HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DELIVERED'].includes(o.status) && (
              <Link className="menu-i" href={`/orders/${o.id}/report`}><span className="mi-ic"><Ic n="alert" /></span><span className="grow">Report a problem</span><Ic n="chevr" s="sm" className="muted" /></Link>
            )}
            <Link className="menu-i" href={`/item/${o.listingId}`}><span className="mi-ic"><Ic n="tag" /></span><span className="grow">View listing</span><Ic n="chevr" s="sm" className="muted" /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
