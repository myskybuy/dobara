import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { avatarCls, initials } from '@/lib/format';
import { DashNav, DashTitle } from '@/components/DashNav';
import { TabBar } from '@/components/TabBar';

export const metadata = { title: { default: 'Seller', template: '%s · Dobara Seller' } };

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const user = await requireUser('/seller');
  if (user.sellerStatus !== 'APPROVED') redirect('/seller/apply');
  const [pendingOffers, newOrders] = await Promise.all([
    db.message.count({ where: { type: 'OFFER', offerStatus: 'PENDING', senderId: { not: user.id }, conversation: { sellerId: user.id } } }),
    db.order.count({ where: { sellerId: user.id, status: 'PAID' } }),
  ]);
  const items = [
    { href: '/seller', label: 'Home', icon: 'grid' },
    { href: '/seller/listings', label: 'My listings', icon: 'tag' },
    { href: '/seller/offers', label: 'Chats & offers', icon: 'chat', badge: pendingOffers },
    { href: '/seller/orders', label: 'Orders', icon: 'package', badge: newOrders },
    { href: '/seller/earnings', label: 'Earnings', icon: 'wallet' },
    { href: '/seller/reviews', label: 'Reviews', icon: 'star' },
  ];
  const titles: [string, string][] = [
    ['/seller/new', 'List an item'], ['/seller/listings', 'My listings'], ['/seller/offers', 'Chats & offers'],
    ['/seller/orders', 'Orders'], ['/seller/earnings', 'Earnings & payouts'], ['/seller/reviews', 'Reviews'], ['/seller', 'Dashboard'],
  ];
  return (
    <div className="dash-shell">
      <aside className="side" aria-label="Seller navigation">
        <div className="row between" style={{ padding: '6px 8px 18px' }}>
          <Link className="logo" href="/"><span className="logo-m" />dobara</Link><span className="badge b-amber">Seller</span>
        </div>
        <DashNav items={items} exact="/seller" />
        <Link className="side-link" href="/"><i className="ic i-store" />Switch to buying</Link>
        <div className="grow" />
        <div className="panel row g8" style={{ marginTop: 12 }}>
          <span className={avatarCls(user.name) + ' sm'}>{initials(user.name)}</span>
          <div className="col grow" style={{ gap: 0, minWidth: 0 }}><b className="t-sm clamp1">{user.name}</b><span className="vbadge"><i className="ic xs i-mail" />Email verified</span></div>
        </div>
      </aside>
      <div className="dash-main">
        <header className="dash-top">
          <DashTitle titles={titles} />
          <Link className="btn btn-amber hide-m" href="/seller/new"><i className="ic sm i-plus" />List an item</Link>
          <Link className="icon-btn" aria-label="Profile" href="/profile"><span className={avatarCls(user.name) + ' sm'}>{initials(user.name)}</span></Link>
        </header>
        <div className="dash-body">{children}</div>
        <TabBar items={[
          { href: '/seller', label: 'Home', icon: 'grid' },
          { href: '/seller/listings', label: 'Listings', icon: 'tag' },
          { href: '/seller/new', label: 'Add', icon: 'plus', fab: true },
          { href: '/seller/orders', label: 'Orders', icon: 'package' },
          { href: '/seller/offers', label: 'Chats', icon: 'chat' },
        ]} />
      </div>
    </div>
  );
}
