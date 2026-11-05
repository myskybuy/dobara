import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { categoryLabel, LISTING_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { fmtDate, inr, timeAgo } from '@/lib/format';
import { cardSelect } from '@/lib/listings';
import { userStats } from '@/lib/users';
import { startChatAction } from '@/app/actions/chat';
import { Gallery } from '@/components/Gallery';
import { ProductCard } from '@/components/ProductCard';
import { Avatar, CondBadge, Ic, Notice } from '@/components/ui';

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  const l = await db.listing.findUnique({ where: { id }, include: { seller: true } });
  if (!l) notFound();
  const isOwner = user?.id === l.sellerId;
  if (!['ACTIVE', 'RESERVED', 'SOLD'].includes(l.status) && !isOwner && !user?.isAdmin) notFound();
  if (!isOwner) await db.listing.update({ where: { id }, data: { views: { increment: 1 } } });

  // The buyer whose deal holds this item can carry on from their chat.
  const myDeal = l.status === 'RESERVED' && user && !isOwner
    ? await db.conversation.findFirst({ where: { listingId: l.id, buyerId: user.id, agreedPrice: { not: null } }, select: { id: true } })
    : null;
  const stats = await userStats(l.sellerId);
  const similar = await db.listing.findMany({
    where: { status: 'ACTIVE', category: l.category, city: l.city, id: { not: l.id } },
    select: cardSelect, orderBy: { createdAt: 'desc' }, take: 4,
  });

  return (
    <div className="container col g24" style={{ paddingTop: 20, paddingBottom: 48 }}>
      <nav className="row g6 t-sm muted" aria-label="Breadcrumb">
        <Link href="/">Home</Link><Ic n="chevr" s="xs" />
        <Link href={`/browse?cat=${l.category}`}>{categoryLabel(l.category)}</Link><Ic n="chevr" s="xs" />
        <span className="clamp1">{l.title}</span>
      </nav>

      <div className="split">
        <div className="col g16" style={{ minWidth: 0 }}>
          <Gallery photos={l.photos} title={l.title} />
          <section className="card pad col g16">
            <div className="h4">Description</div>
            <p className="soft" style={{ whiteSpace: 'pre-line' }}>{l.description}</p>
            <div className="grid3 keep-3" style={{ gap: 10 }}>
              <div className="panel col g4"><span className="t-xs muted">Category</span><b>{categoryLabel(l.category)}</b></div>
              <div className="panel col g4"><span className="t-xs muted">Condition</span><b>{l.condition}</b></div>
              <div className="panel col g4"><span className="t-xs muted">Location</span><b>{l.area}, {l.city}</b></div>
              <div className="panel col g4"><span className="t-xs muted">Buyer can</span><b>{[l.canPickup && 'Collect', l.canDeliver && 'Get delivery'].filter(Boolean).join(' · ')}</b></div>
              <div className="panel col g4"><span className="t-xs muted">Posted</span><b>{fmtDate(l.createdAt)}</b></div>
              <div className="panel col g4"><span className="t-xs muted">Views</span><b>{l.views}</b></div>
            </div>
          </section>
        </div>

        <aside className="col g16 sticky">
          <div className="card pad col g12">
            <div className="row between"><span className="badge b-gray"><Ic n="tag" s="xs" />{categoryLabel(l.category)}</span>
              {l.status !== 'ACTIVE' && <span className="badge b-amber">{LISTING_STATUS_LABEL[l.status]}</span>}</div>
            <div className="h2" style={{ fontSize: 22 }}>{l.title}</div>
            <div className="row g8 wrapf"><span className="price" style={{ fontSize: 28 }}>{inr(l.price)}</span><span className="badge b-teal">Negotiable</span></div>
            <div className="row wrapf g12 t-sm soft">
              <span className="row g4"><Ic n="pin" s="sm" />{l.area}, {l.city}</span>
              <span className="row g4"><Ic n="clock" s="sm" />{timeAgo(l.createdAt)}</span>
              <CondBadge c={l.condition} />
            </div>
            <div className="row wrapf g6">
              {l.canDeliver && <span className="badge b-teal"><Ic n="scooter" s="xs" />Delivery available</span>}
              {l.canPickup && <span className="badge b-pri"><Ic n="store" s="xs" />Pickup</span>}
              <span className="badge b-green"><Ic n="shieldc" s="xs" />Secure Pay</span>
            </div>

            {isOwner ? (
              <Notice>This is your listing. Manage it from <Link href="/seller/listings">My listings</Link>.</Notice>
            ) : l.status === 'ACTIVE' ? (
              <div className="col g8">
                <form action={startChatAction}>
                  <input type="hidden" name="listingId" value={l.id} />
                  <button className="btn btn-pri btn-lg btn-block" type="submit"><Ic n="chat" />Chat with seller</button>
                </form>
                <form action={startChatAction}>
                  <input type="hidden" name="listingId" value={l.id} />
                  <input type="hidden" name="offer" value="1" />
                  <button className="btn btn-amber btn-block" type="submit"><Ic n="tag" s="sm" />Make an offer</button>
                </form>
              </div>
            ) : myDeal ? (
              <div className="col g8">
                <Notice>Your deal is agreed — this item is reserved for you.</Notice>
                <Link className="btn btn-pri btn-lg btn-block" href={`/checkout/${myDeal.id}`}>Continue to purchase</Link>
                <Link className="btn btn-sec btn-block" href={`/chat/${myDeal.id}`}><Ic n="chat" s="sm" />Open chat</Link>
              </div>
            ) : l.status === 'RESERVED' ? (
              <div className="col g8">
                <button className="btn btn-sec btn-lg btn-block" disabled><Ic n="lock" s="sm" />Reserved for another buyer</button>
                <span className="t-xs muted">If that deal falls through, the item will be back on sale.</span>
              </div>
            ) : (
              <button className="btn btn-sec btn-lg btn-block" disabled>Sold</button>
            )}
          </div>

          <div className="card pad col g12">
            <div className="row g12">
              <Avatar name={l.seller.name} size="lg" />
              <div className="col g4" style={{ gap: 0 }}>
                <b className="t-lg">{l.seller.name}</b>
                <span className="t-sm muted">{stats.reviews ? <>★ {stats.rating.toFixed(1)} ({stats.reviews} reviews)</> : 'New seller'}</span>
              </div>
            </div>
            <div className="row wrapf g6">
              {l.seller.sellerStatus === 'APPROVED' && <span className="t-vbadge"><Ic n="verified" s="xs" />Verified seller</span>}
              <span className="vbadge"><Ic n="mail" s="xs" />Email verified</span>
              <span className="vbadge" style={{ color: 'var(--ink3)' }}><Ic n="pin" s="xs" />{l.seller.area ?? l.area}, {l.seller.city ?? l.city}</span>
            </div>
            <div className="grid2 keep2" style={{ gap: 8 }}>
              <div className="panel col g4"><span className="t-xs muted">Completed deals</span><b>{stats.deals}</b></div>
              <div className="panel col g4"><span className="t-xs muted">Member since</span><b>{l.seller.createdAt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}</b></div>
            </div>
            {l.seller.sellerStatus === 'APPROVED' && !isOwner && <Link className="btn btn-sec btn-block" href={`/browse?seller=${l.sellerId}`}><Ic n="store" s="sm" />See all items from {l.seller.name.split(' ')[0]}</Link>}
          </div>

          <div className="card pad col g8">
            <b className="row g6"><Ic n="shieldc" s="sm" className="c-teal" />Marketplace safety tips</b>
            <ul className="t-sm soft" style={{ margin: 0, paddingLeft: 18 }}>
              <li>Keep chats and payments on Dobara.</li>
              <li>Inspect the item before you confirm receipt.</li>
              <li>Share your handover OTP only in person.</li>
            </ul>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="col g16">
          <div className="h3">Similar items near you</div>
          <div className="pgrid">{similar.map((x) => <ProductCard key={x.id} l={x} />)}</div>
        </section>
      )}
    </div>
  );
}
