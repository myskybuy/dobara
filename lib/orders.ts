import { db } from './db';
import { randomDigits } from './otp';
import { inr } from './format';
import { advanceAmount, balanceDue, isPartPaid, ISSUE_WINDOW_DAYS, onlinePaid } from './payplan';
import type { Order } from '@prisma/client';

const AUTO_CONFIRM_HOURS = 48;
const ISSUE_WINDOW_MS = ISSUE_WINDOW_DAYS * 24 * 3_600_000;

export function newOrderCode() {
  return 'DB-' + new Date().getFullYear() + '-' + randomDigits(6);
}

export const newHandoverOtp = () => randomDigits(4);

export const isCod = (o: Pick<Order, 'paymentMode'>) => o.paymentMode === 'cod';

/**
 * Order placed — paid online (Razorpay / demo) or Cash on delivery: confirm the order and mark the listing SOLD,
 * atomically, so two buyers can never both get the same item. Returns "sold_out" if someone else bought it first
 * (the order is cancelled and, if paid online, must be refunded).
 */
export async function markOrderPaid(orderId: string, mode: 'razorpay' | 'demo' | 'cod', paymentId: string): Promise<'ok' | 'already' | 'sold_out'> {
  const result = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return 'already' as const;
    const paidOnline = mode === 'cod' ? 0 : advanceAmount(order.total, order.deliveryFee, order.advancePct);
    const paid = await tx.order.updateMany({
      where: { id: orderId, status: 'PENDING_PAYMENT' },
      data: { status: 'PAID', paidAt: new Date(), paymentMode: mode, paymentId, paidOnline },
    });
    if (paid.count === 0) return 'already' as const;
    const reserved = await tx.listing.updateMany({ where: { id: order.listingId, status: { in: ['ACTIVE', 'RESERVED'] } }, data: { status: 'SOLD' } });
    if (reserved.count === 0) {
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
      return 'sold_out' as const;
    }
    if (order.conversationId) {
      const how = mode === 'cod'
        ? `Cash on delivery — ${inr(order.total)} to be paid to the seller at handover.`
        : paidOnline < order.total
          ? `${inr(paidOnline)} (${order.advancePct}%) paid online and held safely by Dobara. ${inr(order.total - paidOnline)} to be paid to the seller at handover.`
          : `${inr(order.total)} paid online and held safely by Dobara.`;
      await tx.message.create({
        data: { conversationId: order.conversationId, senderId: order.buyerId, type: 'SYSTEM', text: `Order ${order.code} placed. ${how} The item is now marked SOLD.` },
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
  await db.listing.updateMany({ where: { id: o.listingId, status: { in: ['SOLD', 'RESERVED'] } }, data: { status: 'ACTIVE' } });
  await db.complaint.updateMany({ where: { orderId, status: 'OPEN' }, data: { status: 'RESOLVED', outcome: 'refund_buyer', adminNote: note } });
  if (o.conversationId) {
    await db.conversation.update({ where: { id: o.conversationId }, data: { agreedPrice: null } });
    await db.message.create({ data: { conversationId: o.conversationId, senderId: o.sellerId, type: 'SYSTEM', text: `Order ${o.code} was cancelled — ${note}` } });
  }
}

/**
 * Buyer confirmed receipt (or 48 h passed): complete the order. The seller payout is created later by
 * releasePayouts(), once the 7-day problem-report window after delivery is over.
 */
export async function completeOrder(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || (order.status !== 'DELIVERED' && order.status !== 'ISSUE_REPORTED')) return;
  await db.order.update({ where: { id: orderId }, data: { status: 'COMPLETED', completedAt: order.completedAt ?? new Date() } });
  await releasePayouts();
}

/** What Dobara owes the seller: the online part minus the delivery fee (the seller already got the rest at handover). */
export const payoutAmount = (o: Order) => Math.max(0, onlinePaid(o) - o.deliveryFee);

/** Creates seller payouts for completed orders whose 7-day problem window has ended. None for cash on delivery. */
export async function releasePayouts() {
  const cutoff = new Date(Date.now() - ISSUE_WINDOW_MS);
  const due = await db.order.findMany({
    where: { status: 'COMPLETED', deliveredAt: { lt: cutoff }, payout: { is: null }, NOT: { paymentMode: 'cod' } },
  });
  for (const o of due) {
    const amount = payoutAmount(o);
    if (amount <= 0) continue;
    await db.payout.upsert({ where: { orderId: o.id }, create: { orderId: o.id, sellerId: o.sellerId, amount }, update: {} });
  }
}

/** Orders delivered more than 48 h ago without a confirmation or complaint are completed automatically; due payouts are released. */
export async function autoCompleteOrders() {
  const cutoff = new Date(Date.now() - AUTO_CONFIRM_HOURS * 3_600_000);
  const due = await db.order.findMany({ where: { status: 'DELIVERED', deliveredAt: { lt: cutoff } }, select: { id: true } });
  for (const o of due) await completeOrder(o.id);
  await releasePayouts();
}

/** Buyer can report a problem before delivery, and for 7 days after it (even after confirming receipt). */
export function canReportIssue(o: Pick<Order, 'status' | 'deliveredAt'> & { payout?: unknown }) {
  if (['PAID', 'ACCEPTED', 'HANDED_TO_DELIVERY', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP'].includes(o.status)) return true;
  if (o.status !== 'DELIVERED' && o.status !== 'COMPLETED') return false;
  if (!o.deliveredAt || o.payout) return false;
  return Date.now() - o.deliveredAt.getTime() < ISSUE_WINDOW_MS;
}

/** Whole days left to report a problem after delivery (0 when the window is over). */
export function daysLeftToReport(o: Pick<Order, 'deliveredAt'>) {
  if (!o.deliveredAt) return ISSUE_WINDOW_DAYS;
  return Math.max(0, Math.ceil((ISSUE_WINDOW_MS - (Date.now() - o.deliveredAt.getTime())) / (24 * 3_600_000)));
}

/** Short payment line used on order pages: who has paid what. */
export function paymentLine(o: Order) {
  if (isCod(o)) return `Cash on delivery — ${inr(o.total)} to the seller at handover`;
  if (isPartPaid(o)) return `${inr(onlinePaid(o))} paid online (${o.advancePct}%) · ${inr(balanceDue(o))} to the seller at handover`;
  return `Paid online — ${inr(o.total)} held by Dobara`;
}

export function hoursLeftToConfirm(o: Pick<Order, 'deliveredAt'>) {
  if (!o.deliveredAt) return AUTO_CONFIRM_HOURS;
  return Math.max(0, Math.ceil(AUTO_CONFIRM_HOURS - (Date.now() - o.deliveredAt.getTime()) / 3_600_000));
}

export type Step = { title: string; desc: string; at: Date | null; state: 'done' | 'now' | 'todo' };

/** Timeline shown on the order page. Simple status steps — no tracking. */
export function orderSteps(o: Order, sellerFirst: string): Step[] {
  const del = o.mode === 'DELIVERY';
  const pay = isCod(o)
    ? `Cash on delivery — pay ${inr(o.total)} at handover`
    : isPartPaid(o)
      ? `${inr(onlinePaid(o))} held safely by Dobara · pay ${inr(balanceDue(o))} at handover`
      : `Payment of ${inr(o.total)} held safely by Dobara`;
  const raw: [string, string, Date | null][] = del
    ? [
        ['Order confirmed', pay, o.paidAt],
        ['Seller accepted', `${sellerFirst} is packing the item`, o.acceptedAt],
        ['Handed to delivery', o.courierNote ? o.courierNote : 'Seller has sent the item', o.shippedAt],
        ['Out for delivery', 'You will get a call before delivery', o.outAt],
        ['Delivered', 'Handed over after OTP check', o.deliveredAt],
        ['Confirm receipt', `Check the item and confirm within ${AUTO_CONFIRM_HOURS} hours`, o.completedAt],
      ]
    : [
        ['Order confirmed', pay, o.paidAt],
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
