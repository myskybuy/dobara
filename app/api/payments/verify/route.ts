import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { markOrderPaid } from '@/lib/orders';
import { verifyRazorpaySignature } from '@/lib/payments';

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { orderId?: string; razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string };
  const o = await db.order.findUnique({ where: { id: b.orderId || '' } });
  if (!o || o.buyerId !== user.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (!b.razorpay_order_id || b.razorpay_order_id !== o.razorpayOrderId) return NextResponse.json({ error: 'Order mismatch' }, { status: 400 });
  if (!verifyRazorpaySignature(b.razorpay_order_id, b.razorpay_payment_id || '', b.razorpay_signature || '')) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  const res = await markOrderPaid(o.id, 'razorpay', b.razorpay_payment_id!);
  if (res === 'sold_out') return NextResponse.json({ error: 'Sorry, this item was just sold to someone else. Your payment will be refunded.' }, { status: 409 });
  return NextResponse.json({ ok: true });
}
