'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Bottom tab bar shown on phones (the design hides the header nav / sidebar on small screens). */
export function TabBar({ items }: { items: { href: string; label: string; icon: string; fab?: boolean }[] }) {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="Tabs">
      {items.map((t) => {
        const on = t.href === path || (t.href !== '/' && t.href !== '/seller' && path.startsWith(t.href));
        return t.fab ? (
          <Link key={t.href} href={t.href} aria-label={t.label}><span className="sellfab"><i className="ic i-plus" /></span>{t.label}</Link>
        ) : (
          <Link key={t.href} href={t.href} className={on ? 'on' : ''}><i className={'ic i-' + t.icon} />{t.label}</Link>
        );
      })}
    </nav>
  );
}
