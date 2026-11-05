import Link from 'next/link';
import type { ReactNode } from 'react';
import { Ic } from '@/components/ui';
import { Logo } from '@/components/Logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="top">
        <div className="container row between" style={{ height: 68 }}>
          <Link className="logo" href="/" aria-label="Dobara home"><Logo /></Link>
          <Link className="btn btn-sec btn-sm" href="/"><Ic n="chevl" s="sm" />Back to Dobara</Link>
        </div>
      </header>
      <main className="t-auth-bg" style={{ minHeight: '60vh' }}>{children}</main>
    </>
  );
}
