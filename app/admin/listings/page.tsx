import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { approveListingAction, rejectListingAction } from '@/app/actions/listings';
import { requireAdmin } from '@/lib/auth';
import { categoryLabel, LISTING_STATUS_BADGE, LISTING_STATUS_LABEL } from '@/lib/constants';
import { db } from '@/lib/db';
import { fmtDateTime, inr } from '@/lib/format';
import { Ic, Photo } from '@/components/ui';

export const metadata = { title: 'Listing approvals' };

const TABS = ['PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'SOLD'] as const;
const COLS = 'minmax(0,2.4fr) 1.2fr 1fr 1fr 1.1fr 96px';
const PAGE_SIZE = 50;
const REASONS = ['Photos are not of the actual item', 'Price looks unrealistic / suspicious', 'Prohibited or illegal item', 'Description is unclear or misleading', 'Duplicate listing'];

type SP = Promise<{ tab?: string; q?: string; page?: string; view?: string }>;

export default async function AdminListingsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  await requireAdmin();
  const tab = (TABS as readonly string[]).includes(sp.tab || '') ? (sp.tab as (typeof TABS)[number]) : 'PENDING_REVIEW';
  const where: Prisma.ListingWhereInput = { status: tab };
  if (sp.q) where.OR = [{ title: { contains: sp.q, mode: 'insensitive' } }, { seller: { name: { contains: sp.q, mode: 'insensitive' } } }];
  const total = await db.listing.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const [rows, counts] = await Promise.all([
    db.listing.findMany({ where, include: { seller: true }, orderBy: [{ createdAt: tab === 'PENDING_REVIEW' ? 'asc' : 'desc' }, { id: 'asc' }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.listing.groupBy({ by: ['status'], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const view = sp.view ? await db.listing.findUnique({ where: { id: sp.view }, include: { seller: true } }) : null;
  const sellerListings = view ? await db.listing.count({ where: { sellerId: view.sellerId } }) : 0;
  const list = `/admin/listings?tab=${tab}${sp.q ? '&q=' + encodeURIComponent(sp.q) : ''}`;
  const here = list + (page > 1 ? `&page=${page}` : '');

  return (
    <div className="col g16">
      <div className="col" style={{ gap: 0 }}><div className="h2">Listings</div><span className="soft">{countOf('ACTIVE')} active · {countOf('PENDING_REVIEW')} pending review · {countOf('REJECTED')} rejected</span></div>
      <div className="row wrapf g8">
        <form className="inwrap" style={{ minWidth: 260, flex: 1, maxWidth: 380 }} action="/admin/listings">
          <input type="hidden" name="tab" value={tab} />
          <Ic n="search" s="sm" /><input className="input" style={{ height: 40 }} name="q" defaultValue={sp.q || ''} aria-label="Search listings" placeholder="Search title or seller" />
        </form>
        <div className="row wrapf g6">
          {TABS.map((t) => <Link key={t} className={'chip' + (t === tab ? ' on' : '')} style={{ height: 34 }} href={`/admin/listings?tab=${t}`}>{LISTING_STATUS_LABEL[t]}<span className="t-xs" style={{ opacity: 0.7 }}>{countOf(t)}</span></Link>)}
        </div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="dt-scroll"><div className="dt-inner">
          <div className="dt-row dt-head" style={{ gridTemplateColumns: COLS }}><span>Listing</span><span>Seller</span><span>Category</span><span>Price</span><span>Status</span><span /></div>
          {rows.length === 0 && <div className="pad t-sm muted">Nothing here.</div>}
          {rows.map((l) => (
            <div key={l.id} className="dt-row" style={{ gridTemplateColumns: COLS }}>
              <span className="row g8" style={{ minWidth: 0 }}><span style={{ width: 44, borderRadius: 6, overflow: 'hidden', flex: 'none' }}><Photo src={l.photos[0]} /></span><span className="col" style={{ gap: 0, minWidth: 0 }}><b className="clamp1">{l.title}</b><span className="t-xs muted clamp1">{l.area}, {l.city} · {fmtDateTime(l.createdAt)}</span></span></span>
              <span className="clamp1">{l.seller.name}</span>
              <span className="clamp1">{categoryLabel(l.category)}</span>
              <span className="strong num clamp1">{inr(l.price)}</span>
              <span><span className={'badge ' + LISTING_STATUS_BADGE[l.status]}>{LISTING_STATUS_LABEL[l.status]}</span></span>
              <span><Link className="btn btn-sec btn-xs" href={`${here}&view=${l.id}`}>{l.status === 'PENDING_REVIEW' ? 'Review' : 'View'}</Link></span>
            </div>
          ))}
        </div></div>
      </div>
      {pages > 1 && (
        <div className="row g8" style={{ justifyContent: 'center' }}>
          {page > 1 && <Link className="btn btn-sec btn-sm" href={`${list}&page=${page - 1}`}><Ic n="chevl" s="sm" />Previous</Link>}
          <span className="t-sm muted" style={{ alignSelf: 'center' }}>Page {page} of {pages}</span>
          {page < pages && <Link className="btn btn-sec btn-sm" href={`${list}&page=${page + 1}`}>Next<Ic n="chevr" s="sm" /></Link>}
        </div>
      )}

      {view && (
        <div className="overlay right">
          <Link href={here} aria-label="Close" style={{ position: 'absolute', inset: 0 }} />
          <div className="drawer" style={{ maxWidth: 520, position: 'relative' }} role="dialog" aria-modal="true" aria-label="Listing details">
            <div className="mhead">
              <div className="col" style={{ gap: 0, minWidth: 0 }}><span className="eyebrow">Listing</span><div className="h3 clamp1">{view.title}</div><span className="t-sm muted">{inr(view.price)} · {categoryLabel(view.category)}</span></div>
              <Link className="icon-btn sm" aria-label="Close" href={here}><Ic n="x" /></Link>
            </div>
            <div className="mbody col g16" style={{ flex: 1 }}>
              <div className="row g8"><span className="t-sm muted">Status</span><span className={'badge ' + LISTING_STATUS_BADGE[view.status]}>{LISTING_STATUS_LABEL[view.status]}</span></div>
              <div className="grid2 keep2" style={{ gap: 8 }}>{view.photos.slice(0, 4).map((p, i) => <div key={i} style={{ borderRadius: 12, overflow: 'hidden' }}><Photo src={p} /></div>)}</div>
              <div className="kv">
                <div>Seller</div><div>{view.seller.name} ({view.seller.email}) · {sellerListings} listings</div>
                <div>Condition</div><div>{view.condition}</div>
                <div>Location</div><div>{view.area}, {view.city}</div>
                <div>Buyer can</div><div>{[view.canPickup && 'Collect', view.canDeliver && 'Get delivery'].filter(Boolean).join(' · ')}</div>
                <div>Submitted</div><div>{fmtDateTime(view.createdAt)}</div>
              </div>
              <p className="t-sm soft" style={{ whiteSpace: 'pre-line' }}>{view.description}</p>
              {view.rejectReason && <div className="note red"><Ic n="alert" s="sm" /><span>Rejected: {view.rejectReason}</span></div>}
            </div>
            {view.status !== 'SOLD' && (
              <div className="mfoot col g8" style={{ alignItems: 'stretch' }}>
                {view.status !== 'ACTIVE' && (
                  <form action={approveListingAction}>
                    <input type="hidden" name="id" value={view.id} /><input type="hidden" name="back" value={here} />
                    <button className="btn btn-pri btn-block" type="submit"><Ic n="check" s="sm" />Approve — make it live</button>
                  </form>
                )}
                <form action={rejectListingAction} className="row g8">
                  <input type="hidden" name="id" value={view.id} /><input type="hidden" name="back" value={list} />
                  <select className="select grow" name="reason" aria-label="Reason">{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
                  <button className="btn btn-danger" type="submit">{view.status === 'ACTIVE' ? 'Take down' : 'Reject'}</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
