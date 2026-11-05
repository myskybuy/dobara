import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLocation, getUser, sellerCtaHref } from '@/lib/auth';
import { CATEGORIES } from '@/lib/constants';
import { db } from '@/lib/db';
import { cardSelect, nearbyListings } from '@/lib/listings';
import { ProductCard } from '@/components/ProductCard';
import { Ic, Photo } from '@/components/ui';

export default async function HomePage() {
  const loc = await getLocation();
  // Step 2 of the flow: location is asked once, on the first visit.
  if (!loc) redirect('/location?next=/');
  const user = await getUser();
  const sellHref = sellerCtaHref(user);

  const near = await nearbyListings(loc, 8, user?.id);
  const recent = await db.listing.findMany({
    where: { status: 'ACTIVE', city: loc.city, ...(user ? { sellerId: { not: user.id } } : {}) },
    select: cardSelect,
    orderBy: { createdAt: 'desc' },
    take: 8,
  });
  const nearCount = await db.listing.count({ where: { status: 'ACTIVE', city: loc.city } });
  const heroPhotos = ['sprite:dslr', 'sprite:sofa', 'sprite:phone', 'sprite:bicycle'];

  return (
    <div className="container col g32" style={{ paddingTop: 28, paddingBottom: 48 }}>
      <section className="hero">
        <div className="grid2" style={{ gap: 32, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div className="col g16">
            <div className="h1" style={{ color: '#fff', fontSize: 40 }}>Find great things near you</div>
            <form className="search" style={{ background: '#fff', height: 54, border: 0 }} action="/browse" role="search">
              <Ic n="search" className="muted" />
              <input name="q" aria-label="Search listings" placeholder="What are you looking for?" />
              <button className="btn btn-amber" type="submit">Search</button>
            </form>
            <p style={{ color: '#C9C6F5', fontSize: 15, margin: 0 }}>
              Pre-loved phones, furniture, cameras and more from people in your area. Pay safely — the seller gets paid only after you confirm.
            </p>
            <Link href="/browse" className="t-sm strong" style={{ color: '#F2A93B' }}>{nearCount} items in {loc.city} <Ic n="chevr" s="xs" /></Link>
          </div>
          <div className="hide-m">
            <div className="grid2 keep2" style={{ gap: 10 }}>
              {heroPhotos.map((p) => (
                <div key={p} style={{ borderRadius: 14, overflow: 'hidden', background: '#fff' }}><Photo src={p} /></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="col g16">
        <div className="row between">
          <div className="h3">Browse categories</div>
          <Link className="linkbtn" href="/browse">All categories<Ic n="chevr" s="sm" /></Link>
        </div>
        <div className="cats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 10 }}>
          {CATEGORIES.map((c) => (
            <Link key={c.key} className="cat" href={`/browse?cat=${c.key}`}>
              <span className="cat-ic"><Ic n={c.icon} /></span>{c.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid3 keep-3" style={{ gap: 12 }}>
        <div className="card pad-s row g12"><span className="mi-ic" style={{ background: 'var(--teal-50)', color: 'var(--teal)' }}><Ic n="shieldc" /></span><div className="col g4" style={{ gap: 0 }}><b className="t-sm">Secure Pay</b><span className="t-xs muted">Money released only after you confirm receipt</span></div></div>
        <div className="card pad-s row g12"><span className="mi-ic" style={{ background: 'var(--pri-50)', color: 'var(--pri)' }}><Ic n="chat" /></span><div className="col g4" style={{ gap: 0 }}><b className="t-sm">Chat &amp; agree a price</b><span className="t-xs muted">Ask questions and make offers in the app</span></div></div>
        <div className="card pad-s row g12"><span className="mi-ic" style={{ background: 'var(--amber-50)', color: 'var(--amber-ink)' }}><Ic n="key" /></span><div className="col g4" style={{ gap: 0 }}><b className="t-sm">OTP handover</b><span className="t-xs muted">Pickup and delivery confirmed with a one-time code</span></div></div>
      </section>

      {[
        { title: 'Near you', sub: `Closest to ${loc.area} first`, items: near, more: '/browse?sort=nearby' },
        { title: 'Recently added', sub: 'Fresh listings in ' + loc.city, items: recent, more: '/browse?sort=new' },
      ].map((s) => (
        <section key={s.title} className="col g16">
          <div className="row between start">
            <div className="col g4" style={{ gap: 2 }}><div className="h3">{s.title}</div><span className="t-sm muted">{s.sub}</span></div>
            <Link className="linkbtn" href={s.more}>See all<Ic n="chevr" s="sm" /></Link>
          </div>
          {s.items.length ? (
            <div className="rail">{s.items.map((l) => <ProductCard key={l.id} l={l} />)}</div>
          ) : (
            <p className="soft">No items in {loc.city} yet. Be the first to <Link href={sellHref}>list something</Link>.</p>
          )}
        </section>
      ))}

      <section className="card pad-l row between wrapf g16" style={{ background: 'var(--amber-50)', borderColor: '#F4DDB5' }}>
        <div className="col g6" style={{ maxWidth: 560 }}>
          <div className="h3">Got something you no longer use?</div>
          <p className="soft">List it in about two minutes. Buyers nearby can chat, make offers and pay securely.</p>
        </div>
        <Link className="btn btn-amber btn-lg" href={sellHref}><Ic n="plus" />Sell an Item</Link>
      </section>
    </div>
  );
}
