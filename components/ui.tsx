import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { avatarCls, initials } from '@/lib/format';
import { conditionCls } from '@/lib/constants';

/** Icon from the design sprite: <Ic n="chat" s="sm" /> */
export function Ic({ n, s, className, style }: { n: string; s?: 'xs' | 'sm' | 'lg' | 'xl' | 'xxl'; className?: string; style?: CSSProperties }) {
  return <i className={['ic', s, 'i-' + n, className].filter(Boolean).join(' ')} style={style} aria-hidden="true" />;
}

/** Listing photo: uploaded file or demo sprite ("sprite:dslr"). Keeps the 4:3 box from the design. */
export function Photo({ src, alt, style }: { src?: string | null; alt?: string; style?: CSSProperties }) {
  if (!src) return <div className="pimg" style={{ backgroundImage: 'none', ...style }} />;
  if (src.startsWith('sprite:')) return <div className={'pimg pi-' + src.slice(7)} style={style} role="img" aria-label={alt} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt || ''} className="pimg" style={{ objectFit: 'cover', display: 'block', width: '100%', aspectRatio: '4/3', backgroundImage: 'none', ...style }} />;
}

export function Avatar({ name, size }: { name: string; size?: 'sm' | 'lg' | 'xl' }) {
  return <span className={avatarCls(name) + (size ? ' ' + size : '')}>{initials(name)}</span>;
}

export function CondBadge({ c, extra }: { c: string; extra?: string }) {
  return <span className={'badge cond ' + conditionCls(c) + (extra ? ' ' + extra : '')}>{c}</span>;
}

export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="star" aria-label={value.toFixed(1) + ' out of 5'}>
      {'★★★★★'.slice(0, full)}
      <span style={{ opacity: 0.25 }}>{'★★★★★'.slice(full)}</span>
    </span>
  );
}

export function Empty({ icon, title, text, cta }: { icon: string; title: string; text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="card empty" style={{ maxWidth: 'none' }}>
      <div className="empty-ic"><Ic n={icon} s="xxl" /></div>
      <div className="h3">{title}</div>
      <p className="soft">{text}</p>
      {cta && <Link className="btn btn-pri" href={cta.href}>{cta.label}</Link>}
    </div>
  );
}

export function Notice({ kind, children }: { kind?: 'amber' | 'gray' | 'red' | 'teal'; children: ReactNode }) {
  return (
    <div className={'note' + (kind ? ' ' + kind : '')}>
      <Ic n={kind === 'red' ? 'alert' : kind === 'teal' ? 'checkc' : 'info'} s="sm" />
      <span>{children}</span>
    </div>
  );
}

export function FormError({ msg }: { msg?: string | null }) {
  if (!msg) return null;
  return (
    <div className="note red" role="alert">
      <Ic n="alert" s="sm" />
      <span>{msg}</span>
    </div>
  );
}
