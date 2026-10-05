import { requireUser } from '@/lib/auth';
import { ChatList } from '@/components/ChatList';
import { Ic } from '@/components/ui';

export const metadata = { title: 'Chats' };

export default async function ChatsPage() {
  const user = await requireUser('/chat');
  return (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 24 }}>
      <div className="split-l" style={{ gridTemplateColumns: '320px minmax(0,1fr)' }}>
        <ChatList userId={user.id} />
        <section className="card hide-t" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480 }}>
          <div className="empty">
            <div className="empty-ic"><Ic n="chat" s="xxl" /></div>
            <div className="h3">Select a chat</div>
            <p className="soft">Ask the seller questions, make an offer and agree on pickup or delivery — all in one place.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
