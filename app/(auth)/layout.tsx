import Link from 'next/link';
import type { ReactNode } from 'react';
import { Ic } from '@/components/ui';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="top">
        <div className="container row between" style={{ height: 68 }}>
          <Link className="logo" href="/" aria-label="Dobara home"><span className="logo-m" /><span>dobara</span></Link>
          <Link className="btn btn-sec btn-sm" href="/"><Ic n="chevl" s="sm" />Back to Dobara</Link>
        </div>
      </header>
      <main style={{ minHeight: '60vh' }}>{children}</main>
    </>
  );
}
