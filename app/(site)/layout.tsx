import type { ReactNode } from 'react';
import { getUser, sellerCtaHref } from '@/lib/auth';
import { SiteFooter, SiteHeader } from '@/components/SiteHeader';
import { TabBar } from '@/components/TabBar';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const sellHref = sellerCtaHref(await getUser());
  return (
    <>
      <SiteHeader />
      <main style={{ minHeight: '60vh' }}>{children}</main>
      <SiteFooter />
      <TabBar items={[
        { href: '/', label: 'Home', icon: 'home' },
        { href: '/browse', label: 'Browse', icon: 'search' },
        { href: sellHref, label: 'Sell', icon: 'plus', fab: true },
        { href: '/chat', label: 'Chats', icon: 'chat' },
        { href: '/profile', label: 'Account', icon: 'user' },
      ]} />
    </>
  );
}
