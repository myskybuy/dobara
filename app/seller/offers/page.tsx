import Link from 'next/link';
import { sellerOfferAction } from '@/app/actions/chat';
import { requireUser } from '@/lib/auth';
import { conversationList } from '@/lib/chat';
import { db } from '@/lib/db';
import { avatarCls, inr, initials, timeAgo } from '@/lib/format';
import { Empty, FormError, Notice, Photo } from '@/components/ui';

export const metadata = { title: 'Chats & offers' };

export default async function SellerOffersPage({ searchParams }: { searchParams: Promise<{ error?: string; done?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/seller/offers');
  const offers = await db.message.findMany({
    where: { type: 'OFFER', offerStatus: 'PENDING', senderId: { not: user.id }, conversation: { sellerId: user.id, listing: { status: 'ACTIVE' } } },
    include: { sender: true, conversation: { include: { listing: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const chats = (await conversationList(user.id)).filter((c) => c.role === 'Selling');

  return (
    <div className="col g16" style={{ maxWidth: 1000 }}>
      <div className="h2">Chats &amp; offers</div>
      <FormError msg={sp.error} />
      {sp.done && <Notice kind="teal">{sp.done === 'accept' ? 'Offer accepted — the buyer can now pay.' : sp.done === 'counter' ? 'Counter offer sent.' : 'Offer declined.'}</Notice>}

      <b>Offers waiting for you ({offers.length})</b>
      {offers.length === 0 ? (
        <div className="card pad t-sm muted">No open offers right now. New offers from buyers appear here.</div>
      ) : (
        <div className="col g12">
          {offers.map((o) => {
            const l = o.conversation.listing;
            const below = l.price - (o.amount ?? 0);
            return (
              <div key={o.id} className="card pad-s row g16 wrapf">
                <div style={{ width: 96, borderRadius: 10, overflow: 'hidden', flex: 'none' }}><Photo src={l.photos[0]} /></div>
                <div className="col g6 grow" style={{ minWidth: 220 }}>
                  <span className="row g8"><span className={avatarCls(o.sender.name) + ' sm'}>{initials(o.sender.name)}</span><b className="t-sm">{o.sender.name}</b><span className="t-xs muted">{timeAgo(o.createdAt)}</span></span>
                  <span className="t-sm clamp1">{l.title}</span>
                  <span className="row g8 wrapf"><span className="price" style={{ fontSize: 22 }}>{inr(o.amount)}</span><span className="t-xs muted">asking {inr(l.price)}{below > 0 ? ` · ${Math.round((below / l.price) * 100)}% below` : ''}</span></span>
                </div>
                <div className="col g8" style={{ alignSelf: 'center', minWidth: 260 }}>
                  <div className="row g6">
                    <form action={sellerOfferAction}>
                      <input type="hidden" name="conversationId" value={o.conversationId} /><input type="hidden" name="messageId" value={o.id} /><input type="hidden" name="action" value="accept" />
                      <button className="btn btn-pri btn-sm" type="submit">Accept</button>
                    </form>
                    <form action={sellerOfferAction}>
                      <input type="hidden" name="conversationId" value={o.conversationId} /><input type="hidden" name="messageId" value={o.id} /><input type="hidden" name="action" value="decline" />
                      <button className="btn btn-ghost btn-sm c-red" type="submit">Decline</button>
                    </form>
                    <Link className="btn btn-sec btn-sm" href={`/chat/${o.conversationId}`}>Open chat</Link>
                  </div>
                  <form action={sellerOfferAction} className="row g6">
                    <input type="hidden" name="conversationId" value={o.conversationId} /><input type="hidden" name="messageId" value={o.id} /><input type="hidden" name="action" value="counter" />
                    <div className="prefix grow" style={{ height: 36 }}><span>₹</span><input name="amount" inputMode="numeric" required placeholder="Counter amount" aria-label="Counter amount" defaultValue={Math.round(((o.amount ?? 0) + l.price) / 2 / 100) * 100} /></div>
                    <button className="btn btn-soft btn-sm" type="submit">Counter</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <b style={{ marginTop: 8 }}>Chats with buyers</b>
      {chats.length === 0 ? (
        <Empty icon="chat" title="No chats yet" text="When buyers message you about your listings, the chats appear here." />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {chats.map((c) => (
            <Link key={c.id} className="menu-i" href={`/chat/${c.id}`}>
              <span className={avatarCls(c.otherName)}>{initials(c.otherName)}</span>
              <span className="col grow" style={{ gap: 0, minWidth: 0 }}>
                <span className="row between g8"><b className="t-sm">{c.otherName}</b><span className="t-xs muted">{timeAgo(c.at)}</span></span>
                <span className="t-xs muted clamp1">{c.title}</span>
                <span className={'t-xs clamp1 ' + (c.unread ? 'strong' : 'soft')}>{c.preview}</span>
              </span>
              {c.unread > 0 && <span className="badge b-pri">{c.unread}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
