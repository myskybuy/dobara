import Link from 'next/link';
import type { LegalDoc } from '@/lib/legal';
import { Ic } from './ui';

export function LegalPage({ doc, active }: { doc: LegalDoc; active: 'terms' | 'privacy' }) {
  return (
    <div className="container col g24" style={{ paddingTop: 32, paddingBottom: 24 }}>
      <div className="col g8" style={{ padding: '8px 0 4px' }}>
        <div className="row g6 t-sm muted"><Link href="/">Home</Link><Ic n="chevr" s="xs" /><span>Legal</span></div>
        <div className="h1">{doc.title}</div>
        <span className="t-sm muted">Last updated {doc.updated}</span>
        <div className="row wrapf g6" style={{ marginTop: 8 }}>
          <Link className={'chip' + (active === 'terms' ? ' on' : '')} href="/terms">Terms &amp; conditions</Link>
          <Link className={'chip' + (active === 'privacy' ? ' on' : '')} href="/privacy">Privacy policy</Link>
        </div>
      </div>
      <div className="legal">
        <nav className="legal-toc card pad-s" aria-label="On this page">
          <span className="eyebrow" style={{ padding: '6px 12px' }}>On this page</span>
          {doc.sections.map((s) => <a key={s.id} href={'#' + s.id}>{s.h}</a>)}
        </nav>
        <article className="card pad-l legal-body">
          <p style={{ fontSize: 16, color: 'var(--ink)', marginBottom: 28 }}>{doc.intro}</p>
          {doc.sections.map((s) => (
            <section key={s.id} className="legal-sec" id={s.id}>
              <h2>{s.h}</h2>
              {s.p.map((t, i) => <p key={i}>{t}</p>)}
              {s.list.length > 0 && <ul>{s.list.map((t, i) => <li key={i}>{t}</li>)}</ul>}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
