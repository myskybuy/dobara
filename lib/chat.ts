import { db } from './db';
import { inr } from './format';

export async function getConversationFor(conversationId: string, userId: string) {
  const c = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { listing: true, buyer: true, seller: true, orders: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  if (!c || (c.buyerId !== userId && c.sellerId !== userId)) return null;
  return c;
}

export type ChatMsg = {
  id: string;
  type: 'TEXT' | 'OFFER' | 'SYSTEM';
  text: string | null;
  amount: number | null;
  offerStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COUNTERED' | null;
  mine: boolean;
  senderName: string;
  createdAt: string;
  read: boolean;
};

export async function loadMessages(conversationId: string, userId: string, after?: Date) {
  const rows = await db.message.findMany({
    where: { conversationId, ...(after ? { createdAt: { gte: after } } : {}) },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
    take: 500,
  });
  return rows.map<ChatMsg>((m) => ({
    id: m.id,
    type: m.type,
    text: m.text,
    amount: m.amount,
    offerStatus: m.offerStatus,
    mine: m.senderId === userId,
    senderName: m.sender.name,
    createdAt: m.createdAt.toISOString(),
    read: !!m.readAt,
  }));
}

export async function markRead(conversationId: string, userId: string) {
  await db.message.updateMany({ where: { conversationId, senderId: { not: userId }, readAt: null }, data: { readAt: new Date() } });
}

/** Snapshot the client needs besides the messages. Offer statuses can change on old messages, so they are sent too. */
export async function chatState(conversationId: string) {
  const c = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { agreedPrice: true, listing: { select: { status: true } }, orders: { select: { id: true, status: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  const offers = await db.message.findMany({ where: { conversationId, type: 'OFFER' }, select: { id: true, offerStatus: true } });
  const order = c?.orders[0];
  return {
    agreedPrice: c?.agreedPrice ?? null,
    listingStatus: c?.listing.status ?? 'ACTIVE',
    order: order && order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED' ? order : null,
    offers: Object.fromEntries(offers.map((o) => [o.id, o.offerStatus])),
  };
}

export async function sendText(conversationId: string, userId: string, text: string) {
  const t = text.trim().slice(0, 2000);
  if (!t) return { error: 'Message is empty' };
  await db.message.create({ data: { conversationId, senderId: userId, type: 'TEXT', text: t } });
  await db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
  return { ok: true };
}

type OfferAction = { action: 'make' | 'accept' | 'decline' | 'counter'; messageId?: string; amount?: number };

/** Offer / counter-offer rules. Whoever did NOT send the pending offer can accept, decline or counter it. */
export async function handleOffer(conversationId: string, userId: string, a: OfferAction): Promise<{ ok?: true; error?: string }> {
  const c = await db.conversation.findUnique({ where: { id: conversationId }, include: { listing: true, seller: true, buyer: true } });
  if (!c || (c.buyerId !== userId && c.sellerId !== userId)) return { error: 'Conversation not found' };
  if (c.listing.status !== 'ACTIVE') return { error: 'This item is no longer available' };
  if (c.agreedPrice != null) return { error: 'A price is already agreed for this item' };

  const pending = await db.message.findMany({ where: { conversationId, type: 'OFFER', offerStatus: 'PENDING' } });
  const validAmount = (n?: number) => !!n && Number.isFinite(n) && n >= 1 && n <= c.listing.price * 2;

  if (a.action === 'make') {
    if (userId !== c.buyerId) return { error: 'Only the buyer can make an offer' };
    if (!validAmount(a.amount)) return { error: 'Please enter a valid amount' };
    if (pending.length) await db.message.updateMany({ where: { id: { in: pending.map((p) => p.id) } }, data: { offerStatus: 'COUNTERED' } });
    await db.message.create({ data: { conversationId, senderId: userId, type: 'OFFER', amount: a.amount, offerStatus: 'PENDING' } });
  } else {
    const target = pending.find((p) => p.id === a.messageId);
    if (!target) return { error: 'This offer is no longer open' };
    if (target.senderId === userId) return { error: 'You cannot respond to your own offer' };
    if (a.action === 'accept') {
      await db.message.update({ where: { id: target.id }, data: { offerStatus: 'ACCEPTED' } });
      await db.conversation.update({ where: { id: conversationId }, data: { agreedPrice: target.amount } });
      await db.message.create({ data: { conversationId, senderId: userId, type: 'SYSTEM', text: `Deal agreed at ${inr(target.amount)}` } });
    } else if (a.action === 'decline') {
      await db.message.update({ where: { id: target.id }, data: { offerStatus: 'DECLINED' } });
    } else {
      if (!validAmount(a.amount)) return { error: 'Please enter a valid amount' };
      await db.message.update({ where: { id: target.id }, data: { offerStatus: 'COUNTERED' } });
      await db.message.create({ data: { conversationId, senderId: userId, type: 'OFFER', amount: a.amount, offerStatus: 'PENDING' } });
    }
  }
  await db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
  return { ok: true };
}

/** Sidebar list of the user's chats (buyer or seller side). */
export async function conversationList(userId: string) {
  const list = await db.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { select: { title: true, photos: true } },
      buyer: { select: { name: true } },
      seller: { select: { name: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });
  const unread = await db.message.groupBy({
    by: ['conversationId'],
    where: { readAt: null, senderId: { not: userId }, type: { not: 'SYSTEM' }, conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] } },
    _count: true,
  });
  const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count] as const));
  return list.map((c) => {
    const last = c.messages[0];
    const preview = !last ? 'No messages yet' : last.type === 'OFFER' ? `Offer: ${inr(last.amount)}` : last.text || '';
    return {
      id: c.id,
      otherName: c.buyerId === userId ? c.seller.name : c.buyer.name,
      role: c.buyerId === userId ? 'Buying' : 'Selling',
      title: c.listing.title,
      preview,
      at: last?.createdAt ?? c.updatedAt,
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
}
