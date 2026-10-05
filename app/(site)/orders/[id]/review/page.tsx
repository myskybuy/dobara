import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { reviewAction } from '@/app/actions/orders';
import { requireUser } from '@/lib/auth';
import { REVIEW_TAGS_FOR_SELLER } from '@/lib/constants';
import { db } from '@/lib/db';
import { avatarCls, initials } from '@/lib/format';
import { StarPicker } from '@/components/StarPicker';
import { FormError, Ic, Notice } from '@/components/ui';

export const metadata = { title: 'Leave a review' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; done?: string; confirmed?: string }> };

export default async function ReviewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser('/orders/' + id + '/review');
  const o = await db.order.findUnique({ where: { id }, include: { seller: true, reviews: true } });
  if (!o || o.buyerId !== user.id) notFound();
  if (o.status !== 'COMPLETED') redirect('/orders/' + id);
  const mine = o.reviews.find((r) => r.fromUserId === user.id);
  const first = o.seller.name.split(' ')[0];

  if (sp.done || mine) {
    return (
      <div className="container" style={{ maxWidth: 680, paddingTop: 32, paddingBottom: 48 }}>
        <div className="card pad-l col g16" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div className="empty-ic" style={{ background: 'var(--green-50)', color: 'var(--green)' }}><Ic n="checkc" s="xxl" /></div>
          <div className="h2">Thanks for your review!</div>
          <p className="soft">Your order is complete. {first} has been paid and your review now appears on their profile.</p>
          {mine && <span className="star" style={{ fontSize: 22 }}>{'★'.repeat(mine.rating)}<span style={{ opacity: 0.25 }}>{'★'.repeat(5 - mine.rating)}</span></span>}
          <div className="row g8 wrapf center"><Link className="btn btn-pri" href="/browse">Continue browsing</Link><Link className="btn btn-sec" href="/orders?tab=completed">My orders</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 680, paddingTop: 32, paddingBottom: 48 }}>
      {sp.confirmed && <div style={{ marginBottom: 12 }}><Notice kind="teal">Receipt confirmed — {first} will now be paid. One last step: rate your purchase.</Notice></div>}
      <form action={reviewAction} className="card pad-l col g16">
        <input type="hidden" name="orderId" value={o.id} />
        <div className="row between"><span className="eyebrow">Rate your purchase</span><span className="badge b-green"><Ic n="checkc" s="xs" />Transaction completed</span></div>
        <div className="row g12">
          <span className={avatarCls(o.seller.name) + ' lg'} style={{ width: 56, height: 56 }}>{initials(o.seller.name)}</span>
          <div className="col g4" style={{ gap: 0 }}><div className="h3">How was {o.seller.name}?</div><span className="t-sm muted">Your review appears on their profile with a verified-purchase badge.</span></div>
        </div>
        <FormError msg={sp.error} />
        <StarPicker />
        <div className="col g8">
          <span className="label">What went well?</span>
          <div className="row wrapf g6">
            {REVIEW_TAGS_FOR_SELLER.map((t) => <label key={t} className="chip"><input type="checkbox" name="tags" value={t} />{t}</label>)}
          </div>
        </div>
        <div className="field"><label className="label" htmlFor="rv-s">Write a review</label><textarea id="rv-s" className="textarea" name="text" rows={3} placeholder={`${first} replied quickly and the item was packed well.`} /></div>
        <div className="row g8 end"><Link className="btn btn-ghost" href="/orders">Skip for now</Link><button className="btn btn-pri" type="submit">Submit review</button></div>
      </form>
    </div>
  );
}
