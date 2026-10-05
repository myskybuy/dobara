import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { chatState, getConversationFor, loadMessages, markRead, sendText } from '@/lib/chat';

type Ctx = { params: Promise<{ id: string }> };

// Polled every 5 seconds by the chat screen (no WebSockets needed).
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });
  const conv = await getConversationFor(id, user.id);
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const afterRaw = new URL(req.url).searchParams.get('after');
  const after = afterRaw ? new Date(afterRaw) : undefined;
  const messages = await loadMessages(id, user.id, after && !isNaN(after.getTime()) ? after : undefined);
  await markRead(id, user.id);
  return NextResponse.json({ messages, state: await chatState(id) });
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please log in' }, { status: 401 });
  const conv = await getConversationFor(id, user.id);
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const res = await sendText(id, user.id, body.text || '');
  return NextResponse.json(res, { status: res.error ? 400 : 200 });
}
