import Link from 'next/link';
import { conversationList } from '@/lib/chat';
import { avatarCls, fmtTime, initials, timeAgo } from '@/lib/format';

export async function ChatList({ userId, activeId }: { userId: string; activeId?: string }) {
  const list = await conversationList(userId);
  return (
    <aside className={'card' + (activeId ? ' hide-t' : '')} style={{ overflow: 'hidden', alignSelf: 'stretch' }}>
      <div className="pad-s row between" style={{ borderBottom: '1px solid var(--line2)' }}>
        <b>Chats</b>
        <Link className="linkbtn t-sm" href="/seller/offers">Offers</Link>
      </div>
      {list.length === 0 && <p className="pad t-sm muted">No chats yet. Open an item and tap “Chat with seller”.</p>}
      {list.map((c) => {
        const today = new Date(c.at).toDateString() === new Date().toDateString();
        return (
          <Link key={c.id} className="menu-i" href={`/chat/${c.id}`} style={c.id === activeId ? { background: 'var(--pri-50)' } : undefined}>
            <span className={avatarCls(c.otherName) + ' sm'}>{initials(c.otherName)}</span>
            <span className="col grow" style={{ gap: 0, minWidth: 0 }}>
              <span className="row between g8">
                <b className="t-sm clamp1">{c.otherName}</b>
                <span className="t-xs muted">{today ? fmtTime(c.at) : timeAgo(c.at)}</span>
              </span>
              <span className="t-xs muted clamp1">{c.role} · {c.title}</span>
              <span className="row between g8">
                <span className={'t-xs clamp1 ' + (c.unread ? 'strong' : 'soft')}>{c.preview}</span>
                {c.unread > 0 && <span className="badge b-pri">{c.unread}</span>}
              </span>
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
