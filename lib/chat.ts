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
    select: { agreedPrice: true, listing: { select: { status: true } }, orders: { select: { id: true, status: true, paymentMode: true, mode: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
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

type OfferAction = { action: 'make' | 'accept' | 'decline' | 'counter' | 'buy' | 'cancel'; messageId?: string; amount?: number };

/**
 * Closes the deal at `price`: the listing becomes RESERVED for this buyer (hidden from everyone else),
 * atomically — if another chat reserved it a moment earlier this returns false. Other chats are told the item is taken.
 */
async function agreeDeal(conversationId: string, listingId: string, userId: string, price: number, buyerName: string, acceptedOfferId?: string) {
  const ok = await db.$transaction(async (tx) => {
    const reserved = await tx.listing.updateMany({ where: { id: listingId, status: 'ACTIVE' }, data: { status: 'RESERVED' } });
    if (reserved.count === 0) return false;
    if (acceptedOfferId) await tx.message.update({ where: { id: acceptedOfferId }, data: { offerStatus: 'ACCEPTED' } });
    await tx.message.updateMany({ where: { conversationId, type: 'OFFER', offerStatus: 'PENDING' }, data: { offerStatus: 'DECLINED' } });
    await tx.conversation.update({ where: { id: conversationId }, data: { agreedPrice: price } });
    // Stale deals in other chats (from before reservations existed) must not be able to check out this item.
    await tx.conversation.updateMany({ where: { listingId, id: { not: conversationId }, agreedPrice: { not: null } }, data: { agreedPrice: null } });
    await tx.message.create({ data: { conversationId, senderId: userId, type: 'SYSTEM', text: `Deal done at ${inr(price)} — the item is now reserved for ${buyerName.split(' ')[0]} and hidden from other buyers.` } });
    return true;
  });
  if (!ok) return false;
  const others = await db.conversation.findMany({ where: { listingId, id: { not: conversationId } }, select: { id: true, sellerId: true } });
  for (const o of others) {
    await db.message.updateMany({ where: { conversationId: o.id, type: 'OFFER', offerStatus: 'PENDING' }, data: { offerStatus: 'DECLINED' } });
    await db.message.create({ data: { conversationId: o.id, senderId: o.sellerId, type: 'SYSTEM', text: 'This item is now reserved for another buyer. If that deal is cancelled it will become available again.' } });
  }
  return true;
}

/** Buyer or seller backs out of an agreed deal before the order is placed: the item goes back on sale. */
async function cancelDeal(conversationId: string, userId: string, userName: string): Promise<{ ok?: true; error?: string }> {
  const c = await db.conversation.findUnique({ where: { id: conversationId }, include: { orders: { where: { status: { notIn: ['PENDING_PAYMENT', 'CANCELLED'] } }, take: 1 } } });
  if (!c || c.agreedPrice == null) return { error: 'There is no deal to cancel' };
  if (c.orders.length) return { error: 'The order is already placed. Cancel it from the order page instead.' };
  await db.order.updateMany({ where: { conversationId, status: 'PENDING_PAYMENT' }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
  await db.conversation.update({ where: { id: conversationId }, data: { agreedPrice: null } });
  const released = await db.listing.updateMany({ where: { id: c.listingId, status: 'RESERVED' }, data: { status: 'ACTIVE' } });
  await db.message.create({ data: { conversationId, senderId: userId, type: 'SYSTEM', text: `Deal cancelled by ${userName.split(' ')[0]}. The item is available to everyone again.` } });
  if (released.count) {
    const others = await db.conversation.findMany({ where: { listingId: c.listingId, id: { not: conversationId } }, select: { id: true, sellerId: true } });
    for (const o of others) await db.message.create({ data: { conversationId: o.id, senderId: o.sellerId, type: 'SYSTEM', text: 'Good news — this item is available again. You can make an offer.' } });
  }
  return { ok: true };
}

/**
 * Offer rules. The buyer can buy at the asking price straight away, or make an offer.
 * Whoever did NOT send a pending offer can accept, decline or counter it. Accepting closes the deal.
 */
export async function handleOffer(conversationId: string, userId: string, a: OfferAction): Promise<{ ok?: true; error?: string }> {
  const c = await db.conversation.findUnique({ where: { id: conversationId }, include: { listing: true, seller: true, buyer: true } });
  if (!c || (c.buyerId !== userId && c.sellerId !== userId)) return { error: 'Conversation not found' };
  if (a.action === 'cancel') return cancelDeal(conversationId, userId, (userId === c.buyerId ? c.buyer : c.seller).name);
  if (c.agreedPrice != null) return { error: 'A price is already agreed for this item' };
  if (c.listing.status === 'RESERVED') return { error: 'This item is reserved for another buyer right now' };
  if (c.listing.status !== 'ACTIVE') return { error: 'This item is no longer available' };

  const pending = await db.message.findMany({ where: { conversationId, type: 'OFFER', offerStatus: 'PENDING' } });
  const validAmount = (n?: number) => !!n && Number.isFinite(n) && n >= 1 && n <= c.listing.price * 2;
  const taken = { error: 'Sorry, another buyer just reserved this item.' };

  if (a.action === 'buy') {
    if (userId !== c.buyerId) return { error: 'Only the buyer can buy' };
    if (!(await agreeDeal(conversationId, c.listingId, userId, c.listing.price, c.buyer.name))) return taken;
  } else if (a.action === 'make') {
    if (userId !== c.buyerId) return { error: 'Only the buyer can make an offer' };
    if (!validAmount(a.amount)) return { error: 'Please enter a valid amount' };
    if (pending.length) await db.message.updateMany({ where: { id: { in: pending.map((p) => p.id) } }, data: { offerStatus: 'COUNTERED' } });
    await db.message.create({ data: { conversationId, senderId: userId, type: 'OFFER', amount: a.amount, offerStatus: 'PENDING' } });
  } else {
    const target = pending.find((p) => p.id === a.messageId);
    if (!target) return { error: 'This offer is no longer open' };
    if (target.senderId === userId) return { error: 'You cannot respond to your own offer' };
    if (a.action === 'accept') {
      if (!(await agreeDeal(conversationId, c.listingId, userId, target.amount!, c.buyer.name, target.id))) return taken;
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
