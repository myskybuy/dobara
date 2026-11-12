import type { ReactNode } from 'react';
import { inr } from '@/lib/format';
import { Ic, Photo } from './ui';

export function PriceDetails({ title, photo, price, fee, children }: { title: string; photo?: string; price: number; fee: number; children?: ReactNode }) {
  return (
    <div className="card pad col g12">
      <b className="t-lg">Price details</b>
      <div className="row g12">
        <div style={{ width: 56, borderRadius: 8, overflow: 'hidden', flex: 'none' }}><Photo src={photo} alt={title} /></div>
        <span className="t-sm clamp2 grow">{title}</span>
      </div>
      <div className="hr" />
      <div className="row between t-sm"><span className="soft">Item price (agreed)</span><span className="num strong">{inr(price)}</span></div>
      <div className="row between t-sm"><span className="soft">Delivery fee</span><span className="num">{fee ? inr(fee) : 'Free'}</span></div>
      <div className="hr" />
      <div className="row between"><b>Total</b><b className="num" style={{ fontSize: 22 }}>{inr(price + fee)}</b></div>
      <span className="t-xs muted row g6"><Ic n="shieldc" s="xs" className="c-teal" />Online payment held by Dobara · report problems within 7 days of delivery</span>
      {children}
    </div>
  );
}
