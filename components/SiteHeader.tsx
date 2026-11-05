import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';
import { getLocation, getUser, sellerCtaHref } from '@/lib/auth';
import { db } from '@/lib/db';
import { Ic } from './ui';
import { AccountMenu } from './AccountMenu';

export async function unreadCount(userId: string) {
  return db.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      type: { not: 'SYSTEM' },
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
}

export async function SiteHeader({ activeCat }: { activeCat?: string }) {
  const user = await getUser();
  const loc = await getLocation();
  const unread = user ? await unreadCount(user.id) : 0;
  const sellHref = sellerCtaHref(user);

  return (
    <header className="top">
      <div className="container">
        <div className="top-in">
          <Link className="logo" href="/" aria-label="Dobara home">
            <span className="logo-m" />
            <span>dobara</span>
          </Link>
          <Link className="locbtn" href="/location" aria-label="Change location">
            <Ic n="pin" s="sm" className="c-pri" />
            <span className="col g4" style={{ gap: 0, minWidth: 0 }}>
              <span className="t-xs muted" style={{ lineHeight: 1.1 }}>Near</span>
              <span className="t-sm strong clamp1" style={{ lineHeight: 1.3 }}>{loc ? `${loc.area}, ${loc.city}` : 'Select location'}</span>
            </span>
            <Ic n="chevd" s="xs" className="muted" />
          </Link>
          <form className="search" role="search" action="/browse">
            <Ic n="search" s="sm" className="muted" />
            <input type="search" name="q" aria-label="Search" placeholder="Search phones, cameras, furniture and more" />
            <button className="btn btn-pri btn-sm" type="submit">Search</button>
          </form>
          <div className="row g4">
            <Link className="btn btn-amber hide-m" href={sellHref}><Ic n="plus" s="sm" />Sell an Item</Link>
            {user ? (
              <>
                <Link className="icon-btn hide-m" aria-label="Chats" href="/chat" style={{ position: 'relative' }}>
                  <Ic n="chat" />
                  {unread > 0 && <span className="dotn">{unread > 9 ? '9+' : unread}</span>}
                </Link>
                <AccountMenu name={user.name} email={user.email} isAdmin={user.isAdmin} sellerDashHref={user.sellerStatus === 'APPROVED' ? '/seller' : '/seller/apply'} />
              </>
            ) : (
              <Link className="btn btn-pri" href="/login">Log in</Link>
            )}
          </div>
        </div>
      </div>
      <div className="hide-m" style={{ borderTop: '1px solid var(--line2)' }}>
        <div className="container">
          <nav className="catnav" aria-label="Categories">
            <Link className={activeCat === 'all' ? 'on' : ''} href="/browse"><Ic n="grid" s="sm" />All categories</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.key} className={activeCat === c.key ? 'on' : ''} href={`/browse?cat=${c.key}`}>{c.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const sellHref = sellerCtaHref(await getUser());
  return (
    <footer className="site-foot">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 8 }}>
        <div className="foot-grid">
          <div className="col g12 foot-brand">
            <span className="logo" style={{ color: '#fff' }}><span className="logo-m" />dobara</span>
            <p className="t-sm" style={{ maxWidth: 320, lineHeight: 1.7 }}>
              India’s trusted marketplace for pre-loved things. Buy and sell nearby with secure payments, pickup or doorstep delivery.
            </p>
            <div className="col g6 t-sm">
              <span className="row g8"><Ic n="mail" s="sm" />support@dobara.in</span>
              <span className="row g8"><Ic n="phone" s="sm" />1800-120-4410 · 9 AM – 9 PM, all days</span>
            </div>
          </div>
          <div className="col g8"><span className="fh">Buy</span><Link className="fl" href="/browse">All categories</Link><Link className="fl" href="/browse?sort=nearby">Items near you</Link><Link className="fl" href="/orders">My orders</Link></div>
          <div className="col g8"><span className="fh">Sell</span><Link className="fl" href={sellHref}>List an item</Link><Link className="fl" href="/seller/listings">My listings</Link></div>
          <div className="col g8"><span className="fh">Company</span><Link className="fl" href="/about">About us</Link><Link className="fl" href="/contact">Contact us</Link></div>
          <div className="col g8"><span className="fh">Legal</span><Link className="fl" href="/terms">Terms &amp; conditions</Link><Link className="fl" href="/privacy">Privacy policy</Link></div>
        </div>
        <div className="foot-bottom" style={{ marginTop: 36 }}>
          <span>© {new Date().getFullYear()} Dobara Marketplace Pvt. Ltd. All rights reserved.</span>
          <div className="row wrapf g6">
            {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net banking'].map((p) => <span key={p} className="paychip">{p}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
