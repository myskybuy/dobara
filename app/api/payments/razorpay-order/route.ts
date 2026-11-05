import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { createRazorpayOrder, razorpayEnabled, razorpayKeyId } from '@/lib/payments';

export async function POST(req: Request) {
  if (!razorpayEnabled()) return NextResponse.json({ error: 'Razorpay keys are not configured (demo mode is on)' }, { status: 400 });
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });
  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
  const o = await db.order.findUnique({ where: { id: orderId || '' }, include: { listing: true } });
  if (!o || o.buyerId !== user.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (o.status !== 'PENDING_PAYMENT') return NextResponse.json({ error: 'This order is already paid' }, { status: 400 });
  if (!['ACTIVE', 'RESERVED'].includes(o.listing.status)) return NextResponse.json({ error: 'Sorry, this item was just sold to someone else.' }, { status: 409 });
  try {
    const rzpOrderId = await createRazorpayOrder(o.total, o.code);
    await db.order.update({ where: { id: o.id }, data: { razorpayOrderId: rzpOrderId } });
    return NextResponse.json({ keyId: razorpayKeyId(), rzpOrderId, amount: o.total, code: o.code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not create the Razorpay order. Check your test keys.' }, { status: 502 });
  }
}
