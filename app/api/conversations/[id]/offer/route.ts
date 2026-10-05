import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { handleOffer } from '@/lib/chat';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { action?: string; messageId?: string; amount?: number | string };
  const action = body.action as 'make' | 'accept' | 'decline' | 'counter';
  if (!['make', 'accept', 'decline', 'counter'].includes(action)) return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  const amount = typeof body.amount === 'string' ? parseInt(body.amount.replace(/\D/g, ''), 10) : body.amount;
  const res = await handleOffer(id, user.id, { action, messageId: body.messageId, amount });
  return NextResponse.json(res, { status: res.error ? 400 : 200 });
}
