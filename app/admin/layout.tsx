import Link from 'next/link';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { avatarCls, initials } from '@/lib/format';
import { DashNav, DashTitle } from '@/components/DashNav';
import { TabBar } from '@/components/TabBar';

export const metadata = { title: { default: 'Admin', template: '%s · Dobara Admin' } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  const [pending, complaints] = await Promise.all([
    db.listing.count({ where: { status: 'PENDING_REVIEW' } }),
    db.complaint.count({ where: { status: 'OPEN' } }),
  ]);
  const items = [
    { href: '/admin', label: 'Dashboard', icon: 'grid', section: 'Overview' },
    { href: '/admin/listings', label: 'Listing approvals', icon: 'tag', badge: pending, section: 'Manage' },
    { href: '/admin/users', label: 'Users', icon: 'users' },
    { href: '/admin/orders', label: 'Orders & payouts', icon: 'package' },
    { href: '/admin/complaints', label: 'Complaints', icon: 'alert', badge: complaints },
  ];
  const titles: [string, string][] = [['/admin/listings', 'Listing approvals'], ['/admin/users', 'Users'], ['/admin/orders', 'Orders & payouts'], ['/admin/complaints', 'Complaints'], ['/admin', 'Dashboard']];
  return (
    <div className="dash-shell">
      <aside className="side" aria-label="Admin navigation" style={{ gap: 0 }}>
        <div className="row between" style={{ padding: '6px 8px 12px' }}><Link className="logo" href="/"><span className="logo-m" />dobara</Link><span className="badge b-dark">Admin</span></div>
        <DashNav items={items} exact="/admin" />
        <div className="grow" />
        <Link className="side-link" href="/"><i className="ic i-store" />Back to website</Link>
      </aside>
      <div className="dash-main">
        <header className="dash-top">
          <DashTitle titles={titles} />
          <div className="row g8 hide-m"><span className={avatarCls(user.name) + ' sm'}>{initials(user.name)}</span><div className="col" style={{ gap: 0 }}><b className="t-sm">{user.name}</b><span className="t-xs muted">Admin</span></div></div>
        </header>
        <div className="dash-body">{children}</div>
        <TabBar items={[
          { href: '/admin', label: 'Home', icon: 'grid' },
          { href: '/admin/listings', label: 'Listings', icon: 'tag' },
          { href: '/admin/users', label: 'Users', icon: 'users' },
          { href: '/admin/orders', label: 'Orders', icon: 'package' },
          { href: '/admin/complaints', label: 'Complaints', icon: 'alert' },
        ]} />
      </div>
    </div>
  );
}
