import { contactAction } from '@/app/actions/misc';
import { getUser } from '@/lib/auth';
import { COMPANY } from '@/lib/company';
import { FormError, Ic, Notice } from '@/components/ui';

export const metadata = { title: 'Contact us' };

const TOPICS = ['Order or delivery issue', 'Payment or refund', 'Account and login', 'Selling on Dobara', 'Report a safety issue', 'Something else'];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const sp = await searchParams;
  const user = await getUser();
  return (
    <div className="container col g32" style={{ paddingTop: 32, paddingBottom: 24 }}>
      <section className="page-hero" style={{ padding: '44px 48px' }}>
        <div className="col g12" style={{ maxWidth: 720, position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" style={{ color: '#C9C6F5' }}>Contact us</span>
          <div className="h1">We’re here to help</div>
          <p style={{ color: '#C9C6F5', fontSize: 16 }}>Most order questions are answered fastest from your order page. For anything else, send us a message and we’ll reply within 24 hours.</p>
        </div>
      </section>
      <div className="split" style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' }}>
        <div className="card pad-l col g16">
          <form className="col g16" action={contactAction}>
            <div className="col g4"><div className="h3">Send us a message</div><span className="t-sm muted">Fields marked * are required.</span></div>
            <FormError msg={sp.error} />
            {sp.sent && <Notice kind="teal">Thanks! Your message has been sent. We’ll reply by email within 24 hours.</Notice>}
            <div className="grid2">
              <div className="field"><label className="label" htmlFor="ct-n">Full name *</label><input id="ct-n" name="name" className="input" required defaultValue={user?.name ?? ''} placeholder="Aarav Mehta" /></div>
              <div className="field"><label className="label" htmlFor="ct-e">Email *</label><input id="ct-e" name="email" type="email" className="input" required defaultValue={user?.email ?? ''} placeholder="you@example.com" /></div>
            </div>
            <div className="grid2">
              <div className="field"><label className="label" htmlFor="ct-t">What is this about? *</label><select id="ct-t" name="topic" className="select">{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div className="field"><label className="label" htmlFor="ct-o">Order ID <span className="muted" style={{ fontWeight: 500 }}>(if any)</span></label><input id="ct-o" name="orderCode" className="input" placeholder="DB-2026-104872" /></div>
            </div>
            <div className="field"><label className="label" htmlFor="ct-m">Message *</label><textarea id="ct-m" name="message" className="textarea" style={{ minHeight: 150 }} required minLength={10} maxLength={1000} placeholder="Tell us what happened and how we can help." /></div>
            <div className="row between wrapf g12">
              <span className="t-xs muted" style={{ maxWidth: 420 }}>By sending this you agree that we may use these details to respond, as described in our Privacy policy.</span>
              <button className="btn btn-pri btn-lg" type="submit"><Ic n="send" s="sm" />Send message</button>
            </div>
          </form>
        </div>
        <aside className="col g12">
          <div className="card pad row start g12"><span className="mi-ic" style={{ background: 'var(--amber-50)', color: 'var(--amber-ink)' }}><Ic n="mail" /></span><div className="col" style={{ gap: 2 }}><b>Email</b><a className="t-sm soft" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></div></div>
          <div className="card pad row start g12"><span className="mi-ic"><Ic n="home" /></span><div className="col" style={{ gap: 2 }}><b>Registered office</b><span className="t-sm soft">{COMPANY.legalName}, {COMPANY.address}</span></div></div>
          <div className="card pad row start g12"><span className="mi-ic" style={{ background: 'var(--red-50)', color: 'var(--red)' }}><Ic n="flag" /></span><div className="col" style={{ gap: 2 }}><b>Grievance Officer</b><a className="t-sm soft" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><span className="t-xs muted">Acknowledged within 24 hours, resolved within 15 days.</span></div></div>
        </aside>
      </div>
    </div>
  );
}
