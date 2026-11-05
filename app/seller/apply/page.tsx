import { redirect } from 'next/navigation';
import Link from 'next/link';
import { applySellerAction } from '@/app/actions/seller';
import { getLocation, requireUser } from '@/lib/auth';
import { fmtDateTime } from '@/lib/format';
import { FormError, Ic, Notice } from '@/components/ui';

export const metadata = { title: 'Become a seller' };

type SP = Promise<{ error?: string; sent?: string }>;

export default async function SellerApplyPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const user = await requireUser('/seller/apply');
  if (user.sellerStatus === 'APPROVED') redirect('/seller');
  const loc = await getLocation();
  if (!loc) redirect('/location?next=/seller/apply');

  const pending = user.sellerStatus === 'PENDING';
  const rejected = user.sellerStatus === 'REJECTED';

  return (
    <section className="container" style={{ maxWidth: 640, paddingTop: 32, paddingBottom: 48 }}>
      <div className="backbar"><div className="h2">Become a seller</div></div>

      {pending ? (
        <div className="card pad-l col g12">
          <Notice kind="amber">Your seller application is under review. We’ll let you know once it’s approved.</Notice>
          <div className="kv">
            <div>Full name</div><div>{user.name}</div>
            <div>Phone</div><div>{user.sellerPhone}</div>
            <div>Location</div><div>{loc.area}, {loc.city}</div>
            <div>What you’ll sell</div><div style={{ whiteSpace: 'pre-line' }}>{user.sellerNote}</div>
            <div>Applied on</div><div>{user.sellerAppliedAt ? fmtDateTime(user.sellerAppliedAt) : '—'}</div>
          </div>
        </div>
      ) : (
        <div className="col g16">
          {rejected && (
            <Notice kind="red">Your last application was rejected: {user.sellerRejectReason || 'please review and apply again.'}</Notice>
          )}
          {sp.sent && <Notice kind="amber">Thanks! Your application has been sent for review.</Notice>}
          <div className="col g4" style={{ gap: 0 }}>
            <span className="soft">
              {rejected
                ? 'You can apply again below.'
                : 'Tell us a bit about yourself. Our team reviews every application before you can start listing items.'}
            </span>
          </div>
          <FormError msg={sp.error} />
          <form className="card pad-l col g16" action={applySellerAction}>
            <div className="field"><label className="label" htmlFor="sa-n">Full name</label><input id="sa-n" className="input" name="fullName" required minLength={2} maxLength={80} defaultValue={user.name} placeholder="Your full name" /></div>
            <div className="field"><label className="label" htmlFor="sa-p">Phone number</label><input id="sa-p" className="input" name="phone" inputMode="numeric" required defaultValue={user.sellerPhone ?? ''} placeholder="98765 43210" /></div>
            <div className="field">
              <span className="label">Your location</span>
              <div className="row g8" style={{ height: 44 }}><Ic n="pin" s="sm" className="muted" /><span className="t-sm">{loc.area}, {loc.city}</span></div>
              <span className="hint">From your account. <Link className="linkbtn" href="/location?next=/seller/apply">Change it</Link></span>
            </div>
            <div className="field"><label className="label" htmlFor="sa-note">What will you sell?</label><textarea id="sa-note" className="textarea" name="note" rows={4} required minLength={10} maxLength={500} defaultValue={user.sellerNote ?? ''} placeholder="e.g. Used mobile phones, cameras and accessories I no longer need" /></div>
            <label className="opt" style={{ padding: '12px 14px' }}>
              <input type="checkbox" name="acceptTerms" value="1" required />
              <span className="check"><Ic n="check" s="xs" /></span>
              <span className="t-sm">I agree to the <Link className="linkbtn" href="/terms">seller terms</Link> and will describe my items honestly.</span>
            </label>
            <button className="btn btn-pri btn-lg" type="submit"><Ic n="check" s="sm" />{rejected ? 'Submit application again' : 'Submit application'}</button>
          </form>
        </div>
      )}
    </section>
  );
}
