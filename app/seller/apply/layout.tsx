import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from '@/components/SiteHeader';
import { TabBar } from '@/components/TabBar';

export const metadata = { title: 'Become a seller' };

export default function SellerApplyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: '60vh' }}>{children}</main>
      <SiteFooter />
      <TabBar items={[
        { href: '/', label: 'Home', icon: 'home' },
        { href: '/browse', label: 'Browse', icon: 'search' },
        { href: '/seller/apply', label: 'Sell', icon: 'plus', fab: true },
        { href: '/chat', label: 'Chats', icon: 'chat' },
        { href: '/profile', label: 'Account', icon: 'user' },
      ]} />
    </>
  );
}
