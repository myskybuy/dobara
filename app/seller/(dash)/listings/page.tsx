import Link from 'next/link';
import { deleteListingAction } from '@/app/actions/listings';
import { requireUser } from '@/lib/auth';
import { LISTING_STATUS_BADGE, LISTING_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { inr, timeAgo } from '@/lib/format';
import { Empty, FormError, Ic, Notice, Photo } from '@/components/ui';

export const metadata = { title: 'My listings' };

const TABS = ['ACTIVE', 'PENDING_REVIEW', 'SOLD', 'REJECTED'] as const;

type SP = Promise<{ tab?: string; saved?: string; removed?: string; error?: string }>;

export default async function MyListingsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const user = await requireUser('/seller/listings');
  const tab = (TABS as readonly string[]).includes(sp.tab || '') ? (sp.tab as (typeof TABS)[number]) : 'ACTIVE';
  const all = await db.listing.findMany({
    where: { sellerId: user.id },
    include: { _count: { select: { conversations: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const shown = all.filter((l) => l.status === tab);

  return (
    <div className="col g16">
      <div className="row between wrapf g12"><div className="h2">My listings</div><Link className="btn btn-pri" href="/seller/new"><Ic n="plus" s="sm" />List an item</Link></div>
      {sp.saved && <Notice kind="teal">Saved! Your listing is waiting for a quick review and will go live once approved.</Notice>}
      {sp.removed && <Notice>Listing removed.</Notice>}
      <FormError msg={sp.error} />
      <div className="tabs">
        {TABS.map((t) => (
          <Link key={t} className={t === tab ? 'tab on' : 'tab'} href={`/seller/listings?tab=${t}`}>
            {LISTING_STATUS_LABEL[t]}<span className="count">{all.filter((l) => l.status === t).length}</span>
          </Link>
        ))}
      </div>
      {shown.length === 0 ? (
        <Empty icon="tag" title="Nothing here yet" text="List something you no longer use — it takes about two minutes." cta={{ href: '/seller/new', label: 'List an item' }} />
      ) : (
        <div className="col g12">
          {shown.map((l) => (
            <div key={l.id} className="card pad-s row g16 wrapf">
              <div style={{ width: 112, borderRadius: 10, overflow: 'hidden', flex: 'none' }}><Photo src={l.photos[0]} /></div>
              <div className="col g6 grow" style={{ minWidth: 220 }}>
                <div className="row g8 wrapf"><span className={'badge ' + LISTING_STATUS_BADGE[l.status]}>{LISTING_STATUS_LABEL[l.status]}</span><span className="t-xs muted">{l.condition} · Posted {timeAgo(l.createdAt)}</span></div>
                <b className="clamp1">{l.title}</b>
                <span className="price">{inr(l.price)}</span>
                <span className="row g12 t-xs muted"><span className="row g4"><Ic n="eye" s="xs" />{l.views} views</span><span className="row g4"><Ic n="chat" s="xs" />{l._count.conversations} chats</span></span>
                {l.status === 'REJECTED' && <span className="t-sm c-red">Reason: {l.rejectReason}</span>}
              </div>
              <div className="row g6" style={{ alignSelf: 'center' }}>
                {l.status === 'ACTIVE' && <Link className="btn btn-ghost btn-sm" href={`/item/${l.id}`}><Ic n="eye" s="sm" />View</Link>}
                {l.status !== 'SOLD' && <Link className="btn btn-ghost btn-sm" href={`/seller/new?edit=${l.id}`}><Ic n="edit" s="sm" />Edit</Link>}
                {l.status !== 'SOLD' && (
                  <form action={deleteListingAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <button className="btn btn-ghost btn-sm c-red" type="submit" aria-label="Remove listing"><Ic n="trash" s="sm" /></button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
