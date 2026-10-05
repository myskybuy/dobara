import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <header className="top">
        <div className="container row between" style={{ height: 68 }}>
          <Link className="logo" href="/" aria-label="Dobara home"><span className="logo-m" /><span>dobara</span></Link>
        </div>
      </header>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div className="card empty">
          <div className="empty-ic"><i className="ic xxl i-search" /></div>
          <div className="h2">Page not found</div>
          <p className="soft">The page you’re looking for doesn’t exist, or the item has been removed.</p>
          <div className="row g8 wrapf" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-pri" href="/">Go to home</Link>
            <Link className="btn btn-sec" href="/browse">Browse items</Link>
          </div>
        </div>
      </div>
    </>
  );
}
