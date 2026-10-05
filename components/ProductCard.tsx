import Link from 'next/link';
import { CondBadge, Ic, Photo } from './ui';
import { inr, timeAgo } from '@/lib/format';

export type CardListing = {
  id: string;
  title: string;
  price: number;
  condition: string;
  photos: string[];
  area: string;
  city: string;
  canDeliver: boolean;
  createdAt: Date;
};

export function ProductCard({ l }: { l: CardListing }) {
  return (
    <article className="pc">
      <div className="pc-media">
        <Photo src={l.photos[0]} alt={l.title} />
        <Link className="pc-hit" href={`/item/${l.id}`} aria-label={'Open ' + l.title} />
        <CondBadge c={l.condition} extra="pc-cond" />
        {l.canDeliver && (
          <span className="badge b-white pc-del"><Ic n="scooter" s="xs" className="c-teal" />Delivery</span>
        )}
      </div>
      <Link className="pc-body" href={`/item/${l.id}`} style={{ color: 'inherit' }}>
        <span className="pc-title clamp2">{l.title}</span>
        <span className="row g6 wrapf" style={{ marginTop: 2, rowGap: 0 }}>
          <span className="price">{inr(l.price)}</span>
          <span className="t-xs strong c-teal">Negotiable</span>
        </span>
        <span className="pc-meta"><Ic n="pin" s="xs" /><span className="clamp1">{l.area}, {l.city}</span></span>
        <span className="pc-meta">Posted {timeAgo(l.createdAt)}</span>
      </Link>
    </article>
  );
}
