'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string; icon: string; badge?: number; section?: string };

/** Sidebar links for the seller and admin panels (highlights the current page). */
export function DashNav({ items, exact }: { items: NavItem[]; exact: string }) {
  const path = usePathname();
  return (
    <>
      {items.map((n) => {
        const on = n.href === exact ? path === n.href : path === n.href || path.startsWith(n.href + '/');
        return (
          <div key={n.href} style={{ display: 'contents' }}>
            {n.section && <div className="side-sec">{n.section}</div>}
            <Link className={'side-link' + (on ? ' on' : '')} href={n.href}>
              <i className={'ic i-' + n.icon} />
              <span className="grow">{n.label}</span>
              {!!n.badge && <span className="count" style={{ background: 'var(--amber)', color: '#2A1A00' }}>{n.badge}</span>}
            </Link>
          </div>
        );
      })}
    </>
  );
}

export function DashTitle({ titles }: { titles: [string, string][] }) {
  const path = usePathname();
  const found = titles.find(([p]) => path === p || path.startsWith(p + '/'));
  return <div className="h3 grow clamp1">{found ? found[1] : ''}</div>;
}
