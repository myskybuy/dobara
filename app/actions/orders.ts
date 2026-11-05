'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { DELIVERY_FEE, ISSUE_REASONS } from '@/lib/constants';
import { str, toInt } from '@/lib/format';
import { cancelOrder, completeOrder, isCod, markOrderPaid, newHandoverOtp, newOrderCode, sellerNextActions, canEnterOtp } from '@/lib/orders';
import { razorpayEnabled } from '@/lib/payments';

async function me(next: string) {
  const u = await getUser();
  if (!u) redirect('/login?next=' + encodeURIComponent(next));
  return u;
}

function err(path: string, msg: string): never {
  redirect(path + (path.includes('?') ? '&' : '?') + 'error=' + encodeURIComponent(msg));
}

/* ---------- Buyer: checkout ---------- */

export async function createOrderAction(fd: FormData) {
  const conversationId = str(fd.get('conversationId'));
  const back = '/checkout/' + conversationId;
  const user = await me(back);
  const c = await db.conversation.findUnique({ where: { id: conversationId }, include: { listing: true } });
  if (!c || c.buyerId !== user.id) redirect('/chat');
  if (c.agreedPrice == null) err('/chat/' + conversationId, 'Agree on a price with the seller first.');
  if (!['ACTIVE', 'RESERVED'].includes(c.listing.status)) err('/chat/' + conversationId, 'This item is no longer available.');

  const mode = str(fd.get('mode')) === 'PICKUP' ? 'PICKUP' : 'DELIVERY';
  if (mode === 'PICKUP' && !c.listing.canPickup) err(back, 'The seller does not offer pickup for this item.');
  if (mode === 'DELIVERY' && !c.listing.canDeliver) err(back, 'The seller does not offer delivery for this item.');
  const address = str(fd.get('address'));
  const pickupPlace = str(fd.get('pickupPlace'));
  const pickupTime = str(fd.get('pickupTime'));
  if (mode === 'DELIVERY' && address.length < 10) err(back, 'Please enter your full delivery address.');
  if (mode === 'PICKUP' && (!pickupPlace || !pickupTime)) err(back, 'Please enter the pickup place and time you agreed in chat.');

  if (mode === 'DELIVERY' && str(fd.get('saveAddress')) === '1') await db.user.update({ where: { id: user.id }, data: { address } });

  const fee = mode === 'DELIVERY' ? DELIVERY_FEE : 0;
  const data = {
    agreedPrice: c.agreedPrice!,
    deliveryFee: fee,
    total: c.agreedPrice! + fee,
    mode: mode as 'PICKUP' | 'DELIVERY',
    address: mode === 'DELIVERY' ? address : null,
    pickupPlace: mode === 'PICKUP' ? pickupPlace : null,
    pickupTime: mode === 'PICKUP' ? pickupTime : null,
  };
  // Re-use an unpaid order for this chat if the buyer comes back to checkout.
  const existing = await db.order.findFirst({ where: { conversationId, status: 'PENDING_PAYMENT' } });
  const order = existing
    ? await db.order.update({ where: { id: existing.id }, data })
    : await db.order.create({
        data: { ...data, code: newOrderCode(), listingId: c.listingId, conversationId, buyerId: user.id, sellerId: c.sellerId, handoverOtp: newHandoverOtp() },
      });
  redirect('/pay/' + order.id);
}

/** Demo payment (used when no Razorpay keys are configured). */
export async function demoPayAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const user = await me('/pay/' + orderId);
  if (razorpayEnabled()) redirect('/pay/' + orderId);
  const o = await db.order.findUnique({ where: { id: orderId }, include: { listing: true } });
  if (!o || o.buyerId !== user.id) redirect('/orders');
  if (o.status !== 'PENDING_PAYMENT') redirect('/orders/' + orderId);
  if (!['ACTIVE', 'RESERVED'].includes(o.listing.status)) err('/pay/' + orderId, 'Sorry, this item was just sold to someone else. You have not been charged.');
  if (str(fd.get('simulate')) === 'fail') err('/pay/' + orderId, 'Payment failed (demo). No money was taken. Please try again.');
  const res = await markOrderPaid(orderId, 'demo', 'demo_' + Date.now());
  if (res === 'sold_out') err('/orders', 'Sorry, this item was just sold to someone else. Your payment will be refunded.');
  redirect('/orders/' + orderId + '/placed');
}

/** Cash on delivery (or cash / UPI at pickup): the order is confirmed now and the buyer pays the seller at handover. */
export async function codOrderAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const user = await me('/pay/' + orderId);
  const o = await db.order.findUnique({ where: { id: orderId }, include: { listing: true } });
  if (!o || o.buyerId !== user.id) redirect('/orders');
  if (o.status !== 'PENDING_PAYMENT') redirect('/orders/' + orderId);
  if (!['ACTIVE', 'RESERVED'].includes(o.listing.status)) err('/pay/' + orderId, 'Sorry, this item was just sold to someone else.');
  const res = await markOrderPaid(orderId, 'cod', 'cod_' + Date.now());
  if (res === 'sold_out') err('/orders', 'Sorry, this item was just sold to someone else.');
  redirect('/orders/' + orderId + '/placed');
}

/* ---------- Buyer: after delivery ---------- */

export async function buyerReceivedAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const user = await me('/orders/' + orderId);
  const o = await db.order.findUnique({ where: { id: orderId } });
  if (!o || o.buyerId !== user.id) redirect('/orders');
  if (['ACCEPTED', 'HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.status)) {
    await db.order.update({ where: { id: orderId }, data: { status: 'DELIVERED', deliveredAt: new Date() } });
  }
  redirect('/orders/' + orderId + '/check');
}

export async function confirmReceiptAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const user = await me('/orders/' + orderId);
  const o = await db.order.findUnique({ where: { id: orderId } });
  if (!o || o.buyerId !== user.id) redirect('/orders');
  if (o.status !== 'DELIVERED') err('/orders/' + orderId, 'You can confirm receipt once the item is delivered.');
  await completeOrder(orderId);
  redirect('/orders/' + orderId + '/review?confirmed=1');
}

export async function reportIssueAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const back = '/orders/' + orderId + '/report';
  const user = await me(back);
  const o = await db.order.findUnique({ where: { id: orderId } });
  if (!o || o.buyerId !== user.id) redirect('/orders');
  if (!['DELIVERED', 'OUT_FOR_DELIVERY', 'HANDED_TO_DELIVERY', 'READY_FOR_PICKUP', 'ACCEPTED', 'PAID'].includes(o.status)) err(back, 'A problem can no longer be reported for this order.');
  const reason = str(fd.get('reason'));
  const text = str(fd.get('text'));
  if (!ISSUE_REASONS.includes(reason)) err(back, 'Please choose what the problem is.');
  if (text.length < 10) err(back, 'Please describe the problem in a few words.');
  await db.complaint.create({ data: { orderId, userId: user.id, reason, text, photos: [] } });
  await db.order.update({ where: { id: orderId }, data: { status: 'ISSUE_REPORTED' } });
  redirect('/orders/' + orderId + '?reported=1');
}

export async function reviewAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const asSeller = str(fd.get('as')) === 'seller';
  const back = asSeller ? '/seller/reviews' : '/orders/' + orderId + '/review';
  const user = await me(back);
  const o = await db.order.findUnique({ where: { id: orderId } });
  if (!o || (asSeller ? o.sellerId : o.buyerId) !== user.id) redirect(asSeller ? '/seller/reviews' : '/orders');
  if (o.status !== 'COMPLETED') err(back, 'You can leave a review after the order is completed.');
  const rating = toInt(fd.get('rating'));
  if (!(rating >= 1 && rating <= 5)) err(back, 'Please choose a star rating.');
  const tags = fd.getAll('tags').map((t) => String(t)).slice(0, 6);
  const text = str(fd.get('text')).slice(0, 1000);
  await db.review.upsert({
    where: { orderId_fromUserId: { orderId, fromUserId: user.id } },
    create: { orderId, fromUserId: user.id, toUserId: asSeller ? o.buyerId : o.sellerId, rating, tags, text: text || null },
    update: { rating, tags, text: text || null },
  });
  redirect(asSeller ? '/seller/reviews?done=1' : '/orders/' + orderId + '/review?done=1');
}

/* ---------- Seller: fulfilment ---------- */

export async function sellerStatusAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const to = str(fd.get('to'));
  const back = '/seller/orders/' + orderId;
  const user = await me(back);
  const o = await db.order.findUnique({ where: { id: orderId } });
  if (!o || o.sellerId !== user.id) redirect('/seller/orders');
  if (!sellerNextActions(o).some((a) => a.status === to)) err(back, 'This step is not available right now.');
  const now = new Date();
  const stamp: Record<string, object> = {
    ACCEPTED: { acceptedAt: now },
    HANDED_TO_DELIVERY: { shippedAt: now, courierNote: str(fd.get('courierNote')) || null },
    OUT_FOR_DELIVERY: { outAt: now },
    READY_FOR_PICKUP: { readyAt: now },
  };
  await db.order.update({ where: { id: orderId }, data: { status: to as 'ACCEPTED', ...stamp[to] } });
  redirect(back);
}

export async function sellerOtpAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const back = '/seller/orders/' + orderId;
  const user = await me(back);
  const o = await db.order.findUnique({ where: { id: orderId } });
  if (!o || o.sellerId !== user.id) redirect('/seller/orders');
  if (!canEnterOtp(o)) err(back, 'Handover is not possible in the current status.');
  const otp = str(fd.get('code')).replace(/\D/g, '');
  if (otp !== o.handoverOtp) err(back, 'Wrong OTP. Ask the buyer to read out the 4-digit code from their order page.');
  await db.order.update({ where: { id: orderId }, data: { status: 'DELIVERED', deliveredAt: new Date(), acceptedAt: o.acceptedAt ?? new Date() } });
  redirect(back + '?handed=1');
}

export async function sellerCancelAction(fd: FormData) {
  const orderId = str(fd.get('orderId'));
  const user = await me('/seller/orders/' + orderId);
  const o = await db.order.findUnique({ where: { id: orderId } });
  if (!o || o.sellerId !== user.id) redirect('/seller/orders');
  if (o.status !== 'PAID') err('/seller/orders/' + orderId, 'Only new orders can be declined.');
  await cancelOrder(orderId, 'the seller could not complete it.' + (isCod(o) ? '' : ' Your payment will be refunded.'));
  redirect('/seller/orders?declined=1');
}
