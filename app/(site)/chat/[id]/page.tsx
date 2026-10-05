import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { chatState, getConversationFor, loadMessages, markRead } from '@/lib/chat';
import { avatarCls, initials } from '@/lib/format';
import { ChatList } from '@/components/ChatList';
import { ChatThread } from '@/components/ChatThread';
import { Ic } from '@/components/ui';

export const metadata = { title: 'Chat' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ offer?: string }> };

export default async function ChatPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { offer } = await searchParams;
  const user = await requireUser('/chat/' + id);
  const c = await getConversationFor(id, user.id);
  if (!c) notFound();
  await markRead(id, user.id);
  const [messages, state] = await Promise.all([loadMessages(id, user.id), chatState(id)]);
  const isBuyer = c.buyerId === user.id;
  const other = isBuyer ? c.seller : c.buyer;

  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 24 }}>
      <div className="split-l" style={{ gridTemplateColumns: '320px minmax(0,1fr)' }}>
        <ChatList userId={user.id} activeId={id} />
        <section className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 640, overflow: 'hidden' }}>
          <div className="row g12" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line2)' }}>
            <Link className="icon-btn sm show-m" aria-label="Back to chats" href="/chat"><Ic n="chevl" s="sm" /></Link>
            <span className={avatarCls(other.name)}>{initials(other.name)}</span>
            <div className="col grow" style={{ gap: 0, minWidth: 0 }}>
              <b className="clamp1">{other.name}</b>
              <span className="t-xs muted">{isBuyer ? 'Seller' : 'Buyer'} · {c.listing.area}, {c.listing.city}</span>
            </div>
            <Link className="icon-btn sm" aria-label="Report a problem" href="/contact"><Ic n="flag" s="sm" /></Link>
          </div>
          <ChatThread
            conversationId={id}
            initialMessages={messages}
            initialState={state}
            isBuyer={isBuyer}
            otherName={other.name}
            askingPrice={c.listing.price}
            openOffer={offer === '1'}
            listing={{ id: c.listing.id, title: c.listing.title, photo: c.listing.photos[0], condition: c.listing.condition }}
          />
        </section>
      </div>
    </div>
  );
}
