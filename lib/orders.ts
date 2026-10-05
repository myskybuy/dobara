import { db } from './db';
import { randomDigits } from './otp';
import { inr } from './format';
import type { Order } from '@prisma/client';

const AUTO_CONFIRM_HOURS = 48;

export function newOrderCode() {
  return 'DB-' + new Date().getFullYear() + '-' + randomDigits(6);
}

export const newHandoverOtp = () => randomDigits(4);

/**
 * Payment succeeded (Razorpay or demo): mark the order paid and reserve the listing — atomically,
 * so two buyers can never both pay for the same item. Returns "sold_out" if someone else bought it first
 * (the order is cancelled and must be refunded).
 */
export async function markOrderPaid(orderId: string, mode: 'razorpay' | 'demo', paymentId: string): Promise<'ok' | 'already' | 'sold_out'> {
  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return 'already' as const;
    const paid = await tx.order.updateMany({
      where: { id: orderId, status: 'PENDING_PAYMENT' },
      data: { status: 'PAID', paidAt: new Date(), paymentMode: mode, paymentId },
    });
    if (paid.count === 0) return 'already' as const;
    const reserved = await tx.listing.updateMany({ where: { id: order.listingId, status: 'ACTIVE' }, data: { status: 'SOLD' } });
    if (reserved.count === 0) {
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
      return 'sold_out' as const;
    }
    if (order.conversationId) {
      await tx.message.create({
        data: { conversationId: order.conversationId, senderId: order.buyerId, type: 'SYSTEM', text: `Order ${order.code} placed. ${inr(order.total)} paid and held safely by Dobara.` },
      });
    }
    return 'ok' as const;
  });
  return result;
}

/** Order cancelled (seller declined / admin cancelled): put the listing back and reset the agreed deal in chat. */
export async function cancelOrder(orderId: string, note: string) {
  const o = await db.order.findUnique({ where: { id: orderId } });
  if (!o || ['COMPLETED', 'CANCELLED'].includes(o.status)) return;
  await db.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
  await db.listing.updateMany({ where: { id: o.listingId, status: 'SOLD' }, data: { status: 'ACTIVE' } });
  await db.complaint.updateMany({ where: { orderId, status: 'OPEN' }, data: { status: 'RESOLVED', outcome: 'refund_buyer', adminNote: note } });
  if (o.conversationId) {
    await db.conversation.update({ where: { id: o.conversationId }, data: { agreedPrice: null } });
    await db.message.create({ data: { conversationId: o.conversationId, senderId: o.sellerId, type: 'SYSTEM', text: `Order ${o.code} was cancelled — ${note}` } });
  }
}

/** Buyer confirmed receipt (or 48 h passed): complete the order and create the seller payout. */
export async function completeOrder(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || (order.status !== 'DELIVERED' && order.status !== 'ISSUE_REPORTED')) return;
  await db.order.update({ where: { id: orderId }, data: { status: 'COMPLETED', completedAt: new Date() } });
  await db.payout.upsert({
    where: { orderId },
    create: { orderId, sellerId: order.sellerId, amount: order.agreedPrice },
    update: {},
  });
}

/** Orders delivered more than 48 h ago without a confirmation or complaint are completed automatically. */
export async function autoCompleteOrders() {
  const cutoff = new Date(Date.now() - AUTO_CONFIRM_HOURS * 3_600_000);
  const due = await db.order.findMany({ where: { status: 'DELIVERED', deliveredAt: { lt: cutoff } }, select: { id: true } });
  for (const o of due) await completeOrder(o.id);
}

export function hoursLeftToConfirm(o: Pick<Order, 'deliveredAt'>) {
  if (!o.deliveredAt) return AUTO_CONFIRM_HOURS;
  return Math.max(0, Math.ceil(AUTO_CONFIRM_HOURS - (Date.now() - o.deliveredAt.getTime()) / 3_600_000));
}

export type Step = { title: string; desc: string; at: Date | null; state: 'done' | 'now' | 'todo' };

/** Timeline shown on the order page. Simple status steps — no tracking. */
export function orderSteps(o: Order, sellerFirst: string): Step[] {
  const del = o.mode === 'DELIVERY';
  const raw: [string, string, Date | null][] = del
    ? [
        ['Order confirmed', `Payment of ${inr(o.total)} held safely by Dobara`, o.paidAt],
        ['Seller accepted', `${sellerFirst} is packing the item`, o.acceptedAt],
        ['Handed to delivery', o.courierNote ? o.courierNote : 'Seller has sent the item', o.shippedAt],
        ['Out for delivery', 'You will get a call before delivery', o.outAt],
        ['Delivered', 'Handed over after OTP check', o.deliveredAt],
        ['Confirm receipt', `Check the item and confirm within ${AUTO_CONFIRM_HOURS} hours`, o.completedAt],
      ]
    : [
        ['Order confirmed', `Payment of ${inr(o.total)} held safely by Dobara`, o.paidAt],
        ['Seller accepted', `${sellerFirst} confirmed the pickup`, o.acceptedAt],
        ['Ready for pickup', [o.pickupPlace, o.pickupTime].filter(Boolean).join(' · ') || 'Meet the seller at the agreed place', o.readyAt],
        ['Collected', 'Pickup OTP checked at handover', o.deliveredAt],
        ['Confirm receipt', `Check the item and confirm within ${AUTO_CONFIRM_HOURS} hours`, o.completedAt],
      ];
  // Current step = the one after the last finished step (steps can be skipped, e.g. OTP entered right after "accepted").
  const lastDone = raw.map((r) => !!r[2]).lastIndexOf(true);
  let firstTodo = lastDone + 1 >= raw.length ? -1 : lastDone + 1;
  if (o.status === 'COMPLETED') firstTodo = -1;
  return raw.map(([title, desc, at], i) => ({
    title,
    desc,
    at,
    state: firstTodo === -1 || i < firstTodo ? 'done' : i === firstTodo ? 'now' : 'todo',
  }));
}

/** Which status the seller can move the order to next. */
export function sellerNextActions(o: Order): { status: string; label: string }[] {
  if (o.status === 'PAID') return [{ status: 'ACCEPTED', label: 'Accept order' }];
  if (o.mode === 'DELIVERY') {
    if (o.status === 'ACCEPTED') return [{ status: 'HANDED_TO_DELIVERY', label: 'Mark handed to delivery' }];
    if (o.status === 'HANDED_TO_DELIVERY') return [{ status: 'OUT_FOR_DELIVERY', label: 'Mark out for delivery' }];
  } else if (o.status === 'ACCEPTED') {
    return [{ status: 'READY_FOR_PICKUP', label: 'Mark ready for pickup' }];
  }
  return [];
}

export const canEnterOtp = (o: Order) => ['HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'ACCEPTED'].includes(o.status);
