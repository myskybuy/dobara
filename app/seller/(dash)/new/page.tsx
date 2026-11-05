import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { CATEGORIES, CONDITIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { PhotoPicker } from '@/components/PhotoPicker';
import { FormError, Ic, Notice } from '@/components/ui';

export const metadata = { title: 'List an item' };

type SP = Promise<{ edit?: string; error?: string }>;

export default async function NewListingPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const user = await requireUser('/seller/new');
  if (!user.city || !user.area) redirect('/location?next=/seller/new');
  const l = sp.edit ? await db.listing.findUnique({ where: { id: sp.edit } }) : null;
  if (sp.edit && (!l || l.sellerId !== user.id)) notFound();
  if (l && l.status === 'SOLD') redirect('/seller/listings');

  return (
    <form className="col g16" style={{ maxWidth: 860 }} method="post" action="/api/listings" encType="multipart/form-data">
      {l && <input type="hidden" name="id" value={l.id} />}
      <div className="col g4" style={{ gap: 0 }}>
        <div className="h2">{l ? 'Edit listing' : 'List an item'}</div>
        <span className="soft">One simple form. Your listing goes live after a quick check by our team.</span>
      </div>
      <FormError msg={sp.error} />
      {l?.status === 'REJECTED' && <Notice kind="red">Rejected: {l.rejectReason || 'please check the photos and description'}. Fix it and save to send it for review again.</Notice>}
      <div className="card pad-l col g20">
        <PhotoPicker existing={l?.photos ?? []} />
        <div className="grid2" style={{ gap: 16 }}>
          <div className="field"><label className="label" htmlFor="ad-t">Title</label><input id="ad-t" className="input" name="title" required minLength={5} maxLength={90} defaultValue={l?.title ?? ''} placeholder="e.g. Hero Sprint hybrid bicycle, 21-speed" /></div>
          <div className="field">
            <label className="label" htmlFor="ad-c">Category</label>
            <select id="ad-c" className="select" name="category" defaultValue={l?.category ?? 'electronics'}>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className="col g8">
          <span className="label">Condition</span>
          <div className="grid4 keep2" style={{ gap: 8 }}>
            {CONDITIONS.map((c, i) => (
              <label key={c.key} className="opt" style={{ padding: '10px 12px' }}>
                <input type="radio" name="condition" value={c.key} defaultChecked={l ? l.condition === c.key : i === 2} />
                <span className="radio" />
                <span className="col" style={{ gap: 0 }}><b className="t-sm">{c.key}</b><span className="t-xs muted">{c.hint}</span></span>
              </label>
            ))}
          </div>
        </div>
        <div className="field"><label className="label" htmlFor="ad-d">Description</label><textarea id="ad-d" className="textarea" name="description" rows={4} required minLength={20} maxLength={3000} defaultValue={l?.description ?? ''} placeholder="When did you buy it, how much was it used, any marks or faults, what’s included (box, bill, charger)…" /></div>
        <div className="grid2" style={{ gap: 16 }}>
          <div className="field">
            <label className="label" htmlFor="ad-p">Price</label>
            <div className="prefix"><span>₹</span><input id="ad-p" name="price" inputMode="numeric" required defaultValue={l?.price ?? ''} aria-label="Price" placeholder="9500" /></div>
            <span className="hint">Buyers can make offers in chat.</span>
          </div>
          <div className="col g8">
            <span className="label">How can the buyer get it?</span>
            <div className="row wrapf g6">
              <label className="chip"><input type="checkbox" name="canPickup" value="1" defaultChecked={l ? l.canPickup : true} /><Ic n="check" s="xs" />Buyer collects</label>
              <label className="chip"><input type="checkbox" name="canDeliver" value="1" defaultChecked={l ? l.canDeliver : true} /><Ic n="check" s="xs" />Delivery</label>
            </div>
            <span className="hint">Location: {user.area}, {user.city} (from your profile)</span>
          </div>
        </div>
      </div>
      <div className="row between wrapf g12">
        <Link className="btn btn-ghost" href="/seller/listings">Cancel</Link>
        <button className="btn btn-pri btn-lg" type="submit"><Ic n="check" s="sm" />{l ? 'Save & send for review' : 'Publish listing'}</button>
      </div>
    </form>
  );
}
