import Link from 'next/link';
import { getUser, sellerCtaHref } from '@/lib/auth';
import { LOCATIONS } from '@/lib/constants';
import { Ic, Photo } from '@/components/ui';

export const metadata = { title: 'About us' };

const VALUES = [
  { ic: 'shieldc', bg: 'var(--teal-50)', c: 'var(--teal)', t: 'Secure Pay', d: 'Your money is held until you confirm the item arrived as described.' },
  { ic: 'chat', bg: 'var(--pri-50)', c: 'var(--pri)', t: 'Chat & offers', d: 'Ask questions and agree on a fair price right in the app.' },
  { ic: 'key', bg: 'var(--amber-50)', c: 'var(--amber-ink)', t: 'OTP handovers', d: 'Pickup and delivery are confirmed with one-time codes — no disputes about who had it.' },
  { ic: 'pin', bg: 'var(--green-50)', c: 'var(--green)', t: 'Local first', d: 'Items near you come first, so pickups are short and deliveries are quick.' },
];

export default async function AboutPage() {
  const sellHref = sellerCtaHref(await getUser());
  return (
    <div className="container col" style={{ paddingTop: 32, paddingBottom: 24, gap: 56 }}>
      <section className="page-hero">
        <div className="col g16" style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" style={{ color: '#C9C6F5' }}>About Dobara</span>
          <div className="h1" style={{ fontSize: 46, letterSpacing: '-.03em' }}>Giving good things a second life — close to home.</div>
          <p style={{ color: '#C9C6F5', fontSize: 17, lineHeight: 1.7 }}>“Dobara” means “again”. We’re building the most trusted way for people in India to buy and sell pre-loved things with their neighbours — without the haggling anxiety, fake listings or payment scares that usually come with it.</p>
        </div>
      </section>
      <section className="grid2" style={{ gap: 48, alignItems: 'center' }}>
        <div className="col g16">
          <span className="eyebrow">Why we exist</span>
          <div className="h2">Every home has things worth passing on</div>
          <p className="soft" style={{ fontSize: 15.5, lineHeight: 1.75 }}>A camera used on two trips, a study table outgrown, a bicycle replaced by a scooter. These things still have years of use left, but selling them has meant awkward calls, strangers asking for advance payments and meet-ups that don’t feel safe.</p>
          <p className="soft" style={{ fontSize: 15.5, lineHeight: 1.75 }}>Dobara fixes the parts that make second-hand risky. Payments are held until the buyer has the item and every handover is confirmed with a one-time code — so both sides can focus on a fair deal.</p>
        </div>
        <div className="grid2 keep2" style={{ gap: 12 }}>
          {['desk', 'lens', 'tv', 'chair'].map((p) => <div key={p} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)' }}><Photo src={'sprite:' + p} /></div>)}
        </div>
      </section>
      <section className="col g20">
        <div className="col g6" style={{ maxWidth: 640 }}><span className="eyebrow">What makes us different</span><div className="h2">Built around trust, not just listings</div></div>
        <div className="grid4 keep2">
          {VALUES.map((v) => (
            <div key={v.t} className="card pad-l col g12"><span className="value-ic" style={{ background: v.bg, color: v.c }}><Ic n={v.ic} s="lg" /></span><b className="t-lg">{v.t}</b><span className="t-sm soft">{v.d}</span></div>
          ))}
        </div>
      </section>
      <section className="grid2" style={{ gap: 20 }}>
        <div className="card pad-l col g12"><span className="eyebrow c-pri">For buyers</span><b className="t-lg">Buy with confidence</b><span className="t-sm soft">Honest condition grades, chat and offers, and 48 hours to check every item before the seller is paid.</span><Link className="linkbtn" href="/browse">Start browsing<Ic n="chevr" s="sm" /></Link></div>
        <div className="card pad-l col g12"><span className="eyebrow c-amber">For sellers</span><b className="t-lg">Sell without the hassle</b><span className="t-sm soft">Free to list, buyers pay upfront, and you get the full agreed price once the buyer confirms.</span><Link className="linkbtn" href={sellHref}>List an item<Ic n="chevr" s="sm" /></Link></div>
      </section>
      <section className="card pad-l col g16">
        <div className="col g6"><span className="eyebrow">Where we operate</span><div className="h3">Live in {LOCATIONS.length} cities, growing every month</div></div>
        <div className="row wrapf g8">{LOCATIONS.map((l) => <span key={l.city} className="chip"><Ic n="pin" s="xs" className="c-pri" />{l.city}</span>)}</div>
      </section>
      <section className="card pad-l row between wrapf g20" style={{ background: 'var(--amber-50)', borderColor: '#F4DDB5' }}>
        <div className="col g6"><div className="h3">Ready to find something great?</div><span className="soft">Browse what your neighbours are selling, or list something of your own.</span></div>
        <div className="row g8"><Link className="btn btn-pri btn-lg" href="/browse">Start browsing</Link><Link className="btn btn-amber btn-lg" href={sellHref}><Ic n="plus" s="sm" />Sell an Item</Link></div>
      </section>
    </div>
  );
}
