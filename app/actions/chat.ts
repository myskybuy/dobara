'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { handleOffer } from '@/lib/chat';
import { str, toInt } from '@/lib/format';

/** "Chat with seller" / "Make an offer" on the item page. */
export async function startChatAction(fd: FormData) {
  const listingId = str(fd.get('listingId'));
  const offer = str(fd.get('offer')) === '1';
  const user = await getUser();
  if (!user) redirect('/login?next=' + encodeURIComponent('/item/' + listingId));
  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== 'ACTIVE') redirect('/item/' + listingId);
  if (listing.sellerId === user.id) redirect('/item/' + listingId);
  const conv = await db.conversation.upsert({
    where: { listingId_buyerId: { listingId, buyerId: user.id } },
    create: { listingId, buyerId: user.id, sellerId: listing.sellerId },
    update: {},
  });
  redirect(`/chat/${conv.id}${offer ? '?offer=1' : ''}`);
}

/** Seller's "Chats & offers" page: accept / decline / counter without opening the chat. */
export async function sellerOfferAction(fd: FormData) {
  const user = await getUser();
  if (!user) redirect('/login?next=/seller/offers');
  const conversationId = str(fd.get('conversationId'));
  const messageId = str(fd.get('messageId'));
  const action = str(fd.get('action')) as 'accept' | 'decline' | 'counter';
  const amount = toInt(fd.get('amount'));
  const res = await handleOffer(conversationId, user.id, { action, messageId, amount });
  if (res.error) redirect('/seller/offers?error=' + encodeURIComponent(res.error));
  redirect('/seller/offers?done=' + action);
}
