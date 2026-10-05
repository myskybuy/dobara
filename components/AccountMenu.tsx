'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { avatarCls, initials } from '@/lib/format';

export function AccountMenu({ name, email, isAdmin }: { name: string; email: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const close = () => setOpen(false);
  return (
    <div className="acct" ref={ref}>
      <button className="acct-btn" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={avatarCls(name) + ' sm'}>{initials(name)}</span>
        <span className="t-sm strong hide-m">{name.split(' ')[0]}</span>
        <i className="ic xs i-chevd muted" />
      </button>
      {open && (
        <div className="acct-menu" role="menu">
          <div className="row g12" style={{ padding: '14px 16px', borderBottom: '1px solid var(--line2)' }}>
            <span className={avatarCls(name)}>{initials(name)}</span>
            <div className="col" style={{ gap: 0, minWidth: 0 }}>
              <b>{name}</b>
              <span className="t-xs muted clamp1">{email} · Email verified</span>
            </div>
          </div>
          <div style={{ padding: '4px 0' }}>
            <Link className="menu-i" href="/orders" onClick={close}><i className="ic sm i-package" />My orders</Link>
            <Link className="menu-i" href="/chat" onClick={close}><i className="ic sm i-chat" />Chats</Link>
            <Link className="menu-i" href="/seller" onClick={close}><i className="ic sm i-store" />My listings (sell)</Link>
            <Link className="menu-i" href="/profile" onClick={close}><i className="ic sm i-user" />Profile</Link>
            {isAdmin && <Link className="menu-i" href="/admin" onClick={close}><i className="ic sm i-shieldc" />Admin panel</Link>}
            <div className="acct-sep" />
            <form action={logoutAction}>
              <button className="menu-i c-red" type="submit"><i className="ic sm i-logout" style={{ color: 'var(--red)' }} />Log out</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
