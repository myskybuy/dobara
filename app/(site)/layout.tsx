import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from '@/components/SiteHeader';
import { TabBar } from '@/components/TabBar';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: '60vh' }}>{children}</main>
      <SiteFooter />
      <TabBar items={[
        { href: '/', label: 'Home', icon: 'home' },
        { href: '/browse', label: 'Browse', icon: 'search' },
        { href: '/seller/new', label: 'Sell', icon: 'plus', fab: true },
        { href: '/chat', label: 'Chats', icon: 'chat' },
        { href: '/profile', label: 'Account', icon: 'user' },
      ]} />
    </>
  );
}
