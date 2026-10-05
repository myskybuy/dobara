import Link from 'next/link';
import { notFound } from 'next/navigation';
import { reportIssueAction } from '@/app/actions/orders';
import { requireUser } from '@/lib/auth';
import { ISSUE_REASONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { FormError, Ic, Photo } from '@/components/ui';

export const metadata = { title: 'Report a problem' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export default async function ReportPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser('/orders/' + id + '/report');
  const o = await db.order.findUnique({ where: { id }, include: { listing: true } });
  if (!o || o.buyerId !== user.id) notFound();

  return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 24, paddingBottom: 48 }}>
      <div className="backbar"><Link className="icon-btn bd sm" aria-label="Back" href={`/orders/${o.id}`}><Ic n="chevl" s="sm" /></Link><div className="h2">Report a problem</div></div>
      <form action={reportIssueAction} className="card pad-l col g16">
        <input type="hidden" name="orderId" value={o.id} />
        <div className="row g12">
          <div style={{ width: 56, borderRadius: 8, overflow: 'hidden', flex: 'none' }}><Photo src={o.listing.photos[0]} /></div>
          <div className="col" style={{ gap: 0 }}><b className="t-sm">{o.listing.title}</b><span className="t-xs muted">Order {o.code}</span></div>
        </div>
        <FormError msg={error} />
        <b>What’s the problem?</b>
        <div className="col g8">
          {ISSUE_REASONS.map((r, i) => (
            <label key={r} className="opt"><input type="radio" name="reason" value={r} defaultChecked={i === 0} /><span className="radio" /><span>{r}</span></label>
          ))}
        </div>
        <div className="field">
          <label className="label" htmlFor="ri-d">Describe the issue</label>
          <textarea id="ri-d" className="textarea" name="text" rows={4} required minLength={10} placeholder="For example: the listing said no scratches, but there is a deep scratch on the screen." />
          <span className="hint">Be specific — our team compares this with the listing and chat history.</span>
        </div>
        <div className="note"><Ic n="shieldc" s="sm" /><span>As soon as you submit, the seller’s payment is put on hold. Our team replies within 24 hours.</span></div>
        <div className="row end g8">
          <Link className="btn btn-ghost" href={`/orders/${o.id}`}>Cancel</Link>
          <button className="btn btn-danger" type="submit">Submit report</button>
        </div>
      </form>
    </div>
  );
}
