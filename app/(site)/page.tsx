import Link from 'next/link';
import type { CSSProperties } from 'react';
import { redirect } from 'next/navigation';
import { getLocation, getUser, sellerCtaHref } from '@/lib/auth';
import { CATEGORIES, CATEGORY_COLORS, CITY_PHOTOS, LOCATIONS, categoryLabel } from '@/lib/constants';
import { db } from '@/lib/db';
import { avatarCls, initials, inr, timeAgo } from '@/lib/format';
import { cardSelect, nearbyListings, verifiedSellers } from '@/lib/listings';
import { HeroCarousel } from '@/components/HeroCarousel';
import { CountUp, RevealOnScroll } from '@/components/Reveal';
import { ProductCard } from '@/components/ProductCard';
import { Ic, Photo } from '@/components/ui';

const HERO = [
  { src: '/demo/sofa.jpg', tag: 'Furniture' },
  { src: '/demo/dslr-2.jpg', tag: 'Cameras' },
  { src: '/demo/iphone.jpg', tag: 'Mobiles' },
];

const PROMOS: {
  cls: string; icon: string; eyebrow: string; title: string; highlight: string; accent: string; text: string;
  links: { label: string; href: string }[]; photos: { src: string; tag: string }[];
}[] = [
  {
    cls: 't-hc-violet', icon: 'mobile', eyebrow: 'Mobiles & laptops', title: 'Flagship tech,', highlight: 'half the price', accent: '#FFD27A',
    text: 'Phones, laptops and earbuds from verified sellers. Chat, ask for more photos and make an offer before you pay.',
    links: [{ label: 'Shop mobiles', href: '/browse?cat=mobiles' }, { label: 'Laptops', href: '/browse?cat=laptops' }],
    photos: [{ src: '/demo/iphone-2.jpg', tag: 'Mobiles' }, { src: '/demo/macbook.jpg', tag: 'Laptops' }, { src: '/demo/earbuds.jpg', tag: 'Audio' }],
  },
  {
    cls: 't-hc-amber', icon: 'sofa', eyebrow: 'Home & living', title: 'Give your home a', highlight: 'fresh look', accent: '#FFE2A8',
    text: 'Sofas, dining sets and chairs from homes near you. Pick up locally and confirm the handover with an OTP.',
    links: [{ label: 'Shop furniture', href: '/browse?cat=furniture' }, { label: 'Appliances', href: '/browse?cat=appliances' }],
    photos: [{ src: '/demo/sofa-2.jpg', tag: 'Sofas' }, { src: '/demo/lounge-chair.jpg', tag: 'Chairs' }, { src: '/demo/dining.jpg', tag: 'Dining' }],
  },
  {
    cls: 't-hc-night', icon: 'car', eyebrow: 'Bikes & cars', title: 'Your next ride is', highlight: 'around the corner', accent: '#FF9F7A',
    text: 'Motorcycles, cycles and cars listed by owners in your city. See it in person, then pay safely through Dobara.',
    links: [{ label: 'Shop vehicles', href: '/browse?cat=vehicles' }, { label: 'Sports', href: '/browse?cat=sports' }],
    photos: [{ src: '/demo/ktm.jpg', tag: 'Motorcycles' }, { src: '/demo/roadbike.jpg', tag: 'Cycles' }, { src: '/demo/car.jpg', tag: 'Cars' }],
  },
];

const SELL_STEPS = [
  { t: 'Apply once', d: 'Our team verifies your profile', ic: 'verified' },
  { t: 'List in 2 minutes', d: 'Photos, price and pickup area', ic: 'tag' },
  { t: 'Get paid safely', d: 'Released after OTP handover', ic: 'shieldc' },
];

const TRENDING = [
  { q: 'iPhone', src: '/demo/iphone.jpg' },
  { q: 'MacBook', src: '/demo/macbook-2.jpg' },
  { q: 'Sofa', src: '/demo/sofa.jpg' },
  { q: 'DSLR', src: '/demo/dslr.jpg' },
  { q: 'Cycle', src: '/demo/bicycle.jpg' },
  { q: 'Headphones', src: '/demo/headphones.jpg' },
  { q: 'Guitar', src: '/demo/guitar.jpg' },
  { q: 'Watch', src: '/demo/smartwatch.jpg' },
  { q: 'Sneakers', src: '/demo/sneakers.jpg' },
  { q: 'Laptop', src: '/demo/laptop.jpg' },
];

const BUDGETS = [
  { label: 'Under ₹2,000', note: 'Pocket-friendly finds', min: 0, max: 1999, src: '/demo/books.jpg', cls: 't-bd-1' },
  { label: '₹2,000 – ₹10,000', note: 'Everyday upgrades', min: 2000, max: 9999, src: '/demo/headphones-2.jpg', cls: 't-bd-2' },
  { label: '₹10,000 – ₹40,000', note: 'Big-ticket savings', min: 10000, max: 39999, src: '/demo/tv.jpg', cls: 't-bd-3' },
  { label: 'Above ₹40,000', note: 'Premium, pre-loved', min: 40000, max: 0, src: '/demo/sportbike.jpg', cls: 't-bd-4' },
];

const budgetHref = (b: (typeof BUDGETS)[number]) =>
  '/browse?' + new URLSearchParams({ ...(b.min ? { min: String(b.min) } : {}), ...(b.max ? { max: String(b.max) } : {}), sort: 'price_asc' }).toString();

const TRUST = [
  { ic: 'shieldc', bg: 'var(--teal-50)', c: 'var(--teal)', t: 'Secure Pay', d: 'Money released only after you confirm receipt' },
  { ic: 'verified', bg: 'var(--pri-50)', c: 'var(--pri)', t: 'Verified sellers', d: 'Every seller is approved by our team' },
  { ic: 'chat', bg: '#F3EEFE', c: '#6A3FC8', t: 'Chat & agree a price', d: 'Ask questions and make offers in the app' },
  { ic: 'key', bg: 'var(--amber-50)', c: 'var(--amber-ink)', t: 'OTP handover', d: 'Pickup and delivery confirmed with a code' },
];

export default async function HomePage() {
  const loc = await getLocation();
  // Step 2 of the flow: location is asked once, on the first visit.
  if (!loc) redirect('/location?next=/');
  const user = await getUser();
  const sellHref = sellerCtaHref(user);

  const [near, recent, nearCount, sellers, cityCounts] = await Promise.all([
    nearbyListings(loc, 8, user?.id),
    db.listing.findMany({
      where: { status: 'ACTIVE', city: loc.city, ...(user ? { sellerId: { not: user.id } } : {}) },
      select: cardSelect,
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    db.listing.count({ where: { status: 'ACTIVE', city: loc.city } }),
    verifiedSellers(loc.city, 6, user?.id),
    db.listing.groupBy({ by: ['city'], where: { status: 'ACTIVE' }, _count: true }),
  ]);
  const budgetCounts = await Promise.all(
    BUDGETS.map((b) => db.listing.count({
      where: { status: 'ACTIVE', city: loc.city, price: { ...(b.min ? { gte: b.min } : {}), ...(b.max ? { lte: b.max } : {}) } },
    })),
  );
  const verifiedInCity = await db.user.count({ where: { sellerStatus: 'APPROVED', listings: { some: { status: 'ACTIVE', city: loc.city } } } });
  const countByCity = new Map(cityCounts.map((c) => [c.city, c._count]));

  const DONE = { status: { in: ['DELIVERED', 'COMPLETED'] as ('DELIVERED' | 'COMPLETED')[] } };
  const [premium, reviewRows, dealsDone, traded, ratingAvg, sellersTotal] = await Promise.all([
    db.listing.findMany({
      where: { status: 'ACTIVE', city: loc.city, ...(user ? { sellerId: { not: user.id } } : {}) },
      select: { ...cardSelect, seller: { select: { name: true } } },
      orderBy: { price: 'desc' },
      take: 3,
    }),
    db.review.findMany({
      where: { rating: { gte: 4 }, text: { not: null } },
      select: { id: true, text: true, rating: true, toUserId: true, fromUser: { select: { name: true, city: true } }, order: { select: { listing: { select: { title: true, sellerId: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 60,
    }),
    db.order.count({ where: DONE }),
    db.order.aggregate({ where: DONE, _sum: { agreedPrice: true } }),
    db.review.aggregate({ _avg: { rating: true } }),
    db.user.count({ where: { sellerStatus: 'APPROVED' } }),
  ]);
  // Only buyer → seller reviews with a real sentence make good testimonials.
  const testimonials = reviewRows.filter((r) => r.toUserId === r.order.listing.sellerId && (r.text ?? '').trim().length > 24).slice(0, 12);
  const tRows = [testimonials.filter((_, k) => k % 2 === 0), testimonials.filter((_, k) => k % 2 === 1)];
  const tradedLakh = Math.round((traded._sum.agreedPrice ?? 0) / 10_000) / 10;

  return (
    <div className="container col g32 t-home" style={{ paddingTop: 28, paddingBottom: 56 }}>
      <HeroCarousel
        labels={['Welcome', ...PROMOS.map((p) => p.eyebrow), 'Sell on Dobara']}
        slides={[
          <div key="welcome" className="t-hc-in t-hc-deep">
            <div className="grid2" style={{ gap: 36, alignItems: 'center' }}>
              <div className="col g16">
                <span className="t-pill"><Ic n="pin" s="xs" />{loc.area}, {loc.city}</span>
                <div className="h1 t-hc-h">Find great pre-loved things <span style={{ color: '#F2A93B' }}>near you</span></div>
                <form className="search" style={{ background: '#fff', height: 56, border: 0, boxShadow: '0 14px 30px -16px rgba(0,0,0,.6)' }} action="/browse" role="search">
                  <Ic n="search" className="muted" />
                  <input name="q" aria-label="Search listings" placeholder="What are you looking for?" />
                  <button className="btn btn-amber" type="submit">Search</button>
                </form>
                <p className="t-hc-p">
                  Phones, furniture, cameras and more from verified sellers in your area. Pay safely — the seller gets paid only after you confirm.
                </p>
                <div className="t-hero-stats">
                  <Link href="/browse" style={{ textDecoration: 'none' }}><CountUp value={nearCount} /><span>items in {loc.city}</span></Link>
                  <div><CountUp value={verifiedInCity} /><span>verified sellers</span></div>
                  <div><CountUp value={LOCATIONS.length} /><span>cities</span></div>
                </div>
              </div>
              <Collage photos={HERO} />
            </div>
          </div>,
          ...PROMOS.map((p) => (
            <div key={p.eyebrow} className={'t-hc-in ' + p.cls}>
              <div className="grid2" style={{ gap: 36, alignItems: 'center' }}>
                <div className="col g16">
                  <span className="t-pill"><Ic n={p.icon} s="xs" />{p.eyebrow}</span>
                  <div className="h1 t-hc-h">{p.title} <span style={{ color: p.accent }}>{p.highlight}</span></div>
                  <p className="t-hc-p">{p.text}</p>
                  <div className="row wrapf g8">
                    {p.links.map((l, k) => (
                      <Link key={l.href} className={k === 0 ? 'btn btn-amber btn-lg' : 'btn btn-lg t-hc-ghost'} href={l.href}>
                        {l.label}{k === 0 && <Ic n="arrowr" s="sm" />}
                      </Link>
                    ))}
                  </div>
                </div>
                <Collage photos={p.photos} />
              </div>
            </div>
          )),
          <div key="sell" className="t-hc-in t-hc-teal">
            <div className="grid2" style={{ gap: 36, alignItems: 'center' }}>
              <div className="col g16">
                <span className="t-pill"><Ic n="verified" s="xs" />Become a seller</span>
                <div className="h1 t-hc-h">Turn unused things into <span style={{ color: '#FFD27A' }}>cash</span></div>
                <p className="t-hc-p">Apply once, get verified by our team and list an item in about two minutes. Money reaches you after the buyer confirms the handover.</p>
                <div className="row wrapf g8">
                  <Link className="btn btn-amber btn-lg" href={sellHref}><Ic n="plus" s="sm" />Sell an Item</Link>
                  <Link className="btn btn-lg t-hc-ghost" href="/about">How it works</Link>
                </div>
              </div>
              <div className="hide-m">
                <ol className="t-hc-steps">
                  {SELL_STEPS.map((st, k) => (
                    <li key={st.t}>
                      <span className="t-hc-num">{k + 1}</span>
                      <div className="col" style={{ gap: 2 }}><b>{st.t}</b><span>{st.d}</span></div>
                      <Ic n={st.ic} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>,
        ]}
      />

      {recent.length > 0 && (
        <section className="t-ticker" aria-label={`Just listed in ${loc.city}`}>
          <span className="t-ticker-live"><i />Just listed</span>
          <div className="t-ticker-vp">
            <div className="t-ticker-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="t-ticker-set" aria-hidden={copy === 1 || undefined}>
                  {recent.map((l) => (
                    <Link key={l.id} className="t-ticker-i" href={`/item/${l.id}`} tabIndex={copy === 1 ? -1 : undefined}>
                      <span className="t-ticker-ph"><Photo src={l.photos[0]} alt="" /></span>
                      <b className="clamp1">{l.title}</b>
                      <em>{inr(l.price)}</em>
                      <span>{l.area} · {timeAgo(l.createdAt)}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="col g16">
        <div className="row between">
          <div className="t-sec-h" data-reveal><div className="h3">Browse categories</div></div>
          <Link className="linkbtn" href="/browse">All categories<Ic n="chevr" s="sm" /></Link>
        </div>
        <div className="cats" data-reveal="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 10 }}>
          {CATEGORIES.map((c) => {
            const [bg, fg] = CATEGORY_COLORS[c.key] ?? CATEGORY_COLORS.other!;
            return (
              <Link key={c.key} className="cat" href={`/browse?cat=${c.key}`} style={{ '--cc-bg': bg, '--cc': fg } as CSSProperties}>
                <span className="cat-ic"><Ic n={c.icon} /></span>{c.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="t-trust" data-reveal="stagger">
        {TRUST.map((t) => (
          <div key={t.t} className="card">
            <span className="mi-ic" style={{ background: t.bg, color: t.c }}><Ic n={t.ic} /></span>
            <div className="col" style={{ gap: 0 }}><b className="t-sm">{t.t}</b><span className="t-xs muted">{t.d}</span></div>
          </div>
        ))}
      </section>

      <section className="col g16">
        <div className="t-sec-h" data-reveal><div className="h3">Trending in {loc.city}</div><span className="t-sm muted">What people near you are searching for</span></div>
        <div className="t-trend" data-reveal="stagger">
          {TRENDING.map((t) => (
            <Link key={t.q} className="t-trend-i" href={`/browse?q=${encodeURIComponent(t.q)}`}>
              <span className="t-trend-ph" style={{ backgroundImage: `url(${t.src})` }} />
              <b>{t.q}</b>
            </Link>
          ))}
        </div>
      </section>

      <Rail title="Near you" sub={`Closest to ${loc.area} first`} items={near} more="/browse?sort=nearby" city={loc.city} sellHref={sellHref} />

      <section className="t-bento" data-reveal="stagger">
        <Link className="t-promo t-promo-big" href="/browse?cat=gaming">
          <span className="t-promo-bg" style={{ backgroundImage: 'url(/demo/gaming-setup.jpg)' }} />
          <div className="t-promo-tx">
            <span className="t-promo-eb">Gaming zone</span>
            <b>Level up for less</b>
            <span>Consoles, controllers and full setups from gamers near you.</span>
            <span className="t-promo-go">Explore gaming<Ic n="arrowr" s="sm" /></span>
          </div>
        </Link>
        <Link className="t-promo" href={`/browse?cond=${encodeURIComponent('Like New')}`}>
          <span className="t-promo-bg" style={{ backgroundImage: 'url(/demo/watch.jpg)' }} />
          <div className="t-promo-tx">
            <span className="t-promo-eb">Like New</span>
            <b>Barely used, often boxed</b>
            <span className="t-promo-go">See items<Ic n="arrowr" s="sm" /></span>
          </div>
        </Link>
        <Link className="t-promo" href="/browse?cat=cameras">
          <span className="t-promo-bg" style={{ backgroundImage: 'url(/demo/camera-kit.jpg)' }} />
          <div className="t-promo-tx">
            <span className="t-promo-eb">Cameras & lenses</span>
            <b>Shoot more, spend less</b>
            <span className="t-promo-go">Shop cameras<Ic n="arrowr" s="sm" /></span>
          </div>
        </Link>
      </section>

      {premium.length > 0 && (
        <section className="t-prem">
          <div className="t-prem-head" data-reveal>
            <span className="t-prem-eb">✦ Premium picks</span>
            <div className="h2">The finest finds in {loc.city}</div>
            <p>Top-value listings from verified sellers. Inspect in person, pay through Dobara, and the money moves only after you confirm.</p>
          </div>
          <div className="t-prem-grid" data-reveal="stagger">
            {premium.map((l, k) => (
              <Link key={l.id} className={'t-prem-card' + (k === 0 ? ' big' : '')} href={`/item/${l.id}`}>
                <div className="t-prem-in">
                  <div className="t-prem-ph">
                    <Photo src={l.photos[0]} alt={l.title} />
                    <span className="t-prem-rank">#{k + 1}</span>
                  </div>
                  <div className="col" style={{ gap: 6, padding: '14px 16px 16px' }}>
                    <b className="clamp1">{l.title}</b>
                    <span className="t-prem-meta"><Ic n="verified" s="xs" />{l.seller.name} · {l.area}</span>
                    <div className="row between" style={{ alignItems: 'center' }}>
                      <em>{inr(l.price)}</em>
                      <span className="t-prem-go">View<Ic n="arrowr" s="xs" /></span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {sellers.length > 0 && (
        <section className="col g16">
          <div className="row between start">
            <div className="t-sec-h" data-reveal><div className="h3">Verified sellers in {loc.city}</div><span className="t-sm muted">Approved by Dobara · rated by real buyers</span></div>
          </div>
          <div className="t-sellers" data-reveal="stagger">
            {sellers.map((s) => (
              <Link key={s.id} className="t-seller" href={`/browse?seller=${s.id}`}>
                <div className="row g12">
                  <span className={avatarCls(s.name) + ' lg'}>{initials(s.name)}</span>
                  <div className="col" style={{ gap: 2, minWidth: 0 }}>
                    <b className="t-lg clamp1">{s.name}</b>
                    <span className="t-vbadge"><Ic n="verified" s="xs" />Verified seller</span>
                  </div>
                </div>
                <div className="row wrapf g12 t-sm soft">
                  <span className="row g4"><Ic n="pin" s="xs" />{s.area}</span>
                  <span className="row g4"><span className="star">★</span>{s.reviews ? `${s.rating.toFixed(1)} (${s.reviews})` : 'New'}</span>
                  <span className="row g4"><Ic n="tag" s="xs" />{s.live} live</span>
                </div>
                <div className="t-seller-thumbs">
                  {s.photos.map((p, i) => <Photo key={i} src={p} alt="" />)}
                </div>
                <div className="t-catchips">{s.categories.map((c) => <span key={c}>{categoryLabel(c)}</span>)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="col g16">
        <div className="t-sec-h" data-reveal><div className="h3">Shop by budget</div><span className="t-sm muted">Live listings in {loc.city} for every pocket</span></div>
        <div className="t-budgets" data-reveal="stagger">
          {BUDGETS.map((b, k) => (
            <Link key={b.label} className={'t-budget ' + b.cls} href={budgetHref(b)}>
              <div className="col" style={{ gap: 2, minWidth: 0 }}>
                <b>{b.label}</b>
                <span>{b.note}</span>
                <em>{budgetCounts[k]} {budgetCounts[k] === 1 ? 'item' : 'items'}<Ic n="chevr" s="xs" /></em>
              </div>
              <span className="t-budget-ph" style={{ backgroundImage: `url(${b.src})` }} />
            </Link>
          ))}
        </div>
      </section>

      <Rail title="Recently added" sub={'Fresh listings in ' + loc.city} items={recent} more="/browse?sort=new" city={loc.city} sellHref={sellHref} />

      <section className="t-love">
        <div className="t-love-head" data-reveal>
          <span className="t-prem-eb" style={{ color: 'var(--pri)' }}>♥ Loved across India</span>
          <div className="h2">Real deals, real people</div>
          <p className="soft">Every review below comes from a buyer who paid through Dobara and confirmed the handover.</p>
        </div>
        <div className="t-love-stats" data-reveal="stagger">
          <div><CountUp value={dealsDone} /><span>deals completed</span></div>
          <div><CountUp value={tradedLakh} decimals={1} prefix="₹" suffix="L" /><span>worth of things reused</span></div>
          <div><CountUp value={Math.round((ratingAvg._avg.rating ?? 0) * 10) / 10} decimals={1} suffix="★" /><span>average seller rating</span></div>
          <div><CountUp value={sellersTotal} /><span>verified sellers</span></div>
        </div>
        {testimonials.length >= 4 && (
          <div className="t-love-wall">
            {tRows.map((row, ri) => (
              <div key={ri} className={'t-love-row' + (ri ? ' rev' : '')}>
                <div className="t-love-track">
                  {[0, 1].map((copy) => (
                    <div key={copy} className="t-love-set" aria-hidden={copy === 1 || undefined}>
                      {row.map((r) => (
                        <figure key={r.id} className="t-quote">
                          <span className="star" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}</span>
                          <blockquote>“{r.text}”</blockquote>
                          <figcaption>
                            <span className={avatarCls(r.fromUser.name) + ' sm'}>{initials(r.fromUser.name)}</span>
                            <span className="col" style={{ gap: 0, minWidth: 0 }}>
                              <b>{r.fromUser.name}</b>
                              <small className="clamp1">Bought {r.order.listing.title}</small>
                            </span>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="t-wide" data-reveal>
        <div className="t-wide-tx">
          <span className="t-promo-eb">Work from home</span>
          <div className="h2" style={{ color: '#fff' }}>Build your desk setup for less</div>
          <p>Desks, chairs, monitors and laptops — pre-loved, checked by you in person, paid for safely.</p>
          <div className="row wrapf g8">
            <Link className="btn btn-amber" href="/browse?cat=furniture">Desks & chairs</Link>
            <Link className="btn t-hc-ghost" href="/browse?cat=electronics">Monitors</Link>
            <Link className="btn t-hc-ghost" href="/browse?cat=laptops">Laptops</Link>
          </div>
        </div>
        <div className="t-wide-ph hide-m">
          <span style={{ backgroundImage: 'url(/demo/office-setup.jpg)' }} />
          <span style={{ backgroundImage: 'url(/demo/monitor.jpg)' }} />
          <span style={{ backgroundImage: 'url(/demo/chair.jpg)' }} />
        </div>
      </section>

      <section className="col g16">
        <div className="t-sec-h" data-reveal><div className="h3">Dobara across India</div><span className="t-sm muted">Switch city to see what’s listed there</span></div>
        <div className="t-cities" data-reveal="stagger">
          {LOCATIONS.map((l) => (
            <Link key={l.city} className={'t-city' + (l.city === loc.city ? ' on' : '')} href={`/location?city=${encodeURIComponent(l.city)}&next=/`} style={{ backgroundImage: `url(${CITY_PHOTOS[l.city] ?? ''})` }}>
              <div><b>{l.city}</b><span>{countByCity.get(l.city) ?? 0} items · {l.areas.length} areas</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="t-cta" data-reveal>
        <div className="col g12" style={{ padding: '28px 0' }}>
          <span className="eyebrow" style={{ color: 'var(--amber-ink)' }}>Become a seller</span>
          <div className="h2">Got something you no longer use?</div>
          <p className="soft" style={{ maxWidth: 520 }}>Apply once, get verified, and list items in about two minutes. Buyers nearby can chat, make offers and pay securely.</p>
          <div><Link className="btn btn-amber btn-lg" href={sellHref}><Ic n="plus" />Sell an Item</Link></div>
        </div>
        <div className="t-cta-img" style={{ backgroundImage: 'url(/demo/seller.jpg)' }} />
      </section>
      <RevealOnScroll />
    </div>
  );
}

function Collage({ photos }: { photos: { src: string; tag: string }[] }) {
  return (
    <div className="hide-m">
      <div className="t-hero-collage">
        {photos.map((h) => (
          <div key={h.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={h.src} alt={h.tag} decoding="async" />
            <span className="t-tag">{h.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rail({ title, sub, items, more, city, sellHref }: { title: string; sub: string; items: Parameters<typeof ProductCard>[0]['l'][]; more: string; city: string; sellHref: string }) {
  return (
    <section className="col g16">
      <div className="row between start">
        <div className="t-sec-h" data-reveal><div className="h3">{title}</div><span className="t-sm muted">{sub}</span></div>
        <Link className="linkbtn" href={more}>See all<Ic n="chevr" s="sm" /></Link>
      </div>
      {items.length ? (
        <div className="rail" data-reveal="stagger">{items.map((l) => <ProductCard key={l.id} l={l} />)}</div>
      ) : (
        <p className="soft">No items in {city} yet. Be the first to <Link href={sellHref}>list something</Link>.</p>
      )}
    </section>
  );
}
