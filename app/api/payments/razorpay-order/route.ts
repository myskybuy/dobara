import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createRazorpayOrder, razorpayEnabled, razorpayKeyId } from '@/lib/payments';
import { advanceAmount, toAdvancePct } from '@/lib/payplan';

export async function POST(req: Request) {
  if (!razorpayEnabled()) return NextResponse.json({ error: 'Razorpay keys are not configured (demo mode is on)' }, { status: 400 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });
  const { orderId, pct } = (await req.json().catch(() => ({}))) as { orderId?: string; pct?: number };
  const o = await db.order.findUnique({ where: { id: orderId || '' }, include: { listing: true } });
  if (!o || o.buyerId !== user.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (o.status !== 'PENDING_PAYMENT') return NextResponse.json({ error: 'This order is already paid' }, { status: 400 });
  if (!['ACTIVE', 'RESERVED'].includes(o.listing.status)) return NextResponse.json({ error: 'Sorry, this item was just sold to someone else.' }, { status: 409 });
  // The chosen share (25 / 50 / 100 %) is saved with this Razorpay order; /api/payments/verify only accepts this order id.
  const advancePct = toAdvancePct(pct);
  const amount = advanceAmount(o.total, o.deliveryFee, advancePct);
  try {
    const rzpOrderId = await createRazorpayOrder(amount, o.code);
    await db.order.update({ where: { id: o.id }, data: { razorpayOrderId: rzpOrderId, advancePct } });
    return NextResponse.json({ keyId: razorpayKeyId(), rzpOrderId, amount, code: o.code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not create the Razorpay order. Check your test keys.' }, { status: 502 });
  }
}
