import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sellerCancelAction, sellerOtpAction, sellerStatusAction } from '@/app/actions/orders';
import { requireUser } from '@/lib/auth';
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { inr } from '@/lib/format';
import { canEnterOtp, daysLeftToReport, isCod, orderSteps, payoutAmount, sellerNextActions } from '@/lib/orders';
import { balanceDue, onlinePaid } from '@/lib/payplan';
import { Timeline } from '@/components/Timeline';
import { FormError, Ic, Notice, Photo } from '@/components/ui';

export const metadata = { title: 'Order' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; handed?: string }> };

export default async function SellerOrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser('/seller/orders/' + id);
  const o = await db.order.findUnique({ where: { id }, include: { listing: true, buyer: true, payout: true, complaints: { orderBy: { createdAt: 'desc' }, take: 1 } } });
  if (!o || o.sellerId !== user.id || o.status === 'PENDING_PAYMENT') notFound();
  const next = sellerNextActions(o);
  const buyerFirst = o.buyer.name.split(' ')[0];
  const del = o.mode === 'DELIVERY';
  const cod = isCod(o);
  const due = balanceDue(o); // what the seller collects at handover (whole total for cash on delivery)

  return (
    <div className="col g16" style={{ maxWidth: 1000 }}>
      <div className="row g8"><Link className="icon-btn bd sm" aria-label="Back" href="/seller/orders"><Ic n="chevl" s="sm" /></Link><div className="h2">{del ? 'Arrange delivery' : 'Buyer collects (pickup)'}</div></div>
      <FormError msg={sp.error} />
      {sp.handed && <Notice kind="teal">OTP verified — item handed over. {due > 0 ? `Make sure you collected ${inr(due)} from ${buyerFirst}. ` : ''}{cod ? '' : `Dobara pays you ${inr(payoutAmount(o))} once ${buyerFirst}'s 7-day problem window is over.`}</Notice>}

      <div className="split">
        <div className="col g16">
          <div className="card pad row g16 wrapf">
            <div style={{ width: 96, borderRadius: 10, overflow: 'hidden', flex: 'none' }}><Photo src={o.listing.photos[0]} /></div>
            <div className="col g4 grow">
              <span className={'badge ' + ORDER_STATUS_BADGE[o.status]} style={{ alignSelf: 'flex-start' }}>{ORDER_STATUS_LABEL[o.status]}</span>
              <b>{o.listing.title}</b>
              <span className="t-sm soft">Order {o.code} · Buyer: {o.buyer.name}</span>
              <span className="t-sm"><b>{inr(o.agreedPrice)}</b> <span className="muted">agreed price (you receive this)</span></span>
              <span className={'badge ' + (cod ? 'b-amber' : 'b-green')} style={{ alignSelf: 'flex-start' }}><Ic n={cod ? 'wallet' : 'lock'} s="xs" />{cod ? `Cash on delivery — collect ${inr(o.total)} at handover` : due > 0 ? `${inr(onlinePaid(o))} paid online (${o.advancePct}%) — collect ${inr(due)} at handover` : 'Paid online — Dobara pays you after the 7-day problem window'}</span>
            </div>
          </div>

          <div className="card pad col g8">
            <b>{del ? 'Deliver to' : 'Buyer’s chosen pickup'}</b>
            <div className="row g12">
              <span className="mi-ic" style={{ background: 'var(--pri-50)', color: 'var(--pri)' }}><Ic n={del ? 'home' : 'calendar'} /></span>
              <div className="col" style={{ gap: 0 }}>
                {del ? <><b className="t-sm">{o.buyer.name}</b><span className="t-sm soft">{o.address}</span></> : <><b className="t-sm">{o.pickupTime}</b><span className="t-sm soft">{o.pickupPlace}</span></>}
              </div>
            </div>
          </div>

          {o.status === 'PAID' && (
            <div className="card pad col g12">
              <b>1. Accept the order</b>
              <span className="t-sm soft">{cod ? `${buyerFirst} chose cash on delivery and will pay you ${inr(o.total)} in cash or UPI at handover.` : due > 0 ? `${buyerFirst} has paid ${inr(onlinePaid(o))} online (held by Dobara) and will pay you ${inr(due)} in cash or UPI at handover.` : `${buyerFirst} has paid ${inr(o.total)} (held by Dobara).`} Accept to confirm you will hand it over.</span>
              <div className="row g8 wrapf">
                <form action={sellerStatusAction}><input type="hidden" name="orderId" value={o.id} /><input type="hidden" name="to" value="ACCEPTED" /><button className="btn btn-pri" type="submit"><Ic n="check" s="sm" />Accept order</button></form>
                <form action={sellerCancelAction}><input type="hidden" name="orderId" value={o.id} /><button className="btn btn-ghost c-red" type="submit">I can’t sell it — decline</button></form>
              </div>
            </div>
          )}

          {next.length > 0 && o.status !== 'PAID' && (
            <form action={sellerStatusAction} className="card pad col g12">
              <input type="hidden" name="orderId" value={o.id} />
              <input type="hidden" name="to" value={next[0]!.status} />
              <b>{del ? '2. Send the item' : '2. Mark the item ready'}</b>
              {next[0]!.status === 'HANDED_TO_DELIVERY' && (
                <div className="field"><label className="label" htmlFor="cn">Courier / delivery details <span className="muted">(optional)</span></label><input id="cn" className="input" name="courierNote" placeholder="e.g. Sent via Porter, driver Ramesh 98xxxxxx12" /></div>
              )}
              <span className="t-sm soft">{del ? 'Update the status so the buyer knows where the item is. No tracking needed.' : `${buyerFirst} gets a notification with the meeting point.`}</span>
              <button className="btn btn-pri" type="submit" style={{ alignSelf: 'flex-start' }}>{next[0]!.label}</button>
            </form>
          )}

          {canEnterOtp(o) && o.status !== 'ACCEPTED' && (
            <form action={sellerOtpAction} className="card pad col g12">
              <input type="hidden" name="orderId" value={o.id} />
              <b>3. At handover, enter the buyer’s OTP</b>
              <span className="t-sm soft">Let {buyerFirst} inspect the item first{due > 0 ? `, collect ${inr(due)} in cash or UPI,` : ''} then ask for the 4-digit OTP shown on their order page.</span>
              <div className="row g8 wrapf">
                <input className="input" name="code" inputMode="numeric" maxLength={4} required placeholder="4-digit OTP" style={{ width: 160, fontSize: 20, fontWeight: 800, letterSpacing: 6, textAlign: 'center' }} aria-label="Buyer OTP" />
                <button className="btn btn-teal" type="submit"><Ic n="checkc" s="sm" />Verify OTP &amp; complete handover</button>
              </div>
            </form>
          )}

          {o.status === 'DELIVERED' && <Notice kind="teal">Handed over. Waiting for {buyerFirst} to confirm receipt (auto-confirms after 48 hours).</Notice>}
          {o.status === 'COMPLETED' && <Notice kind="teal">Order complete. {cod ? 'You were paid in cash / UPI at handover.' : o.payout ? <>{due > 0 ? `You collected ${inr(due)} at handover. ` : ''}Payout of {inr(o.payout.amount)} is {o.payout.status === 'PAID' ? 'paid' : 'scheduled'}.</> : <>{due > 0 ? `You collected ${inr(due)} at handover. ` : ''}Payout of {inr(payoutAmount(o))} is released after the 7-day problem window ({daysLeftToReport(o)} {daysLeftToReport(o) === 1 ? 'day' : 'days'} left).</>} <Link href="/seller/reviews">Rate the buyer</Link></Notice>}
          {o.status === 'ISSUE_REPORTED' && <Notice kind="red">{buyerFirst} reported a problem: “{o.complaints[0]?.reason}”. Your payout is on hold while Dobara reviews it.</Notice>}
          {o.status === 'CANCELLED' && <Notice kind="gray">This order was cancelled{cod ? '.' : ' and the buyer refunded.'}</Notice>}
        </div>

        <aside className="col g12 sticky">
          <div className="card pad col g12"><b>Status</b><Timeline steps={orderSteps(o, user.name.split(' ')[0]!)} /></div>
          {o.conversationId && <Link className="btn btn-sec btn-block" href={`/chat/${o.conversationId}`}><Ic n="chat" s="sm" />Message {buyerFirst}</Link>}
        </aside>
      </div>
    </div>
  );
}
