import Link from 'next/link';
import { getLocation } from '@/lib/auth';
import { CATEGORIES, CONDITIONS, categoryLabel } from '@/lib/constants';
import { browseListings, type BrowseParams } from '@/lib/listings';
import { ProductCard } from '@/components/ProductCard';
import { Ic } from '@/components/ui';

export const metadata = { title: 'Browse items near you' };

type RawSP = Promise<Record<string, string | string[] | undefined>>;

export default async function BrowsePage({ searchParams }: { searchParams: RawSP }) {
  const raw = await searchParams;
  // Normalise query: condition checkboxes arrive as repeated "c" params; keep everything as single strings.
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  const cList = ([] as string[]).concat(raw.c ?? []).concat(one(raw.cond)?.split(',') ?? []).filter(Boolean);
  const sp: BrowseParams = {
    q: one(raw.q), cat: one(raw.cat), cond: cList.length ? Array.from(new Set(cList)).join(',') : undefined,
    min: one(raw.min), max: one(raw.max), sort: one(raw.sort), page: one(raw.page),
  };
  const loc = await getLocation();
  const { rows, total, page, pages } = await browseListings(sp, loc);
  const conds = (sp.cond || '').split(',').filter(Boolean);
  const hasFilters = !!(sp.cat || sp.cond || sp.min || sp.max || sp.q);
  const qs = (patch: Record<string, string | undefined>) => {
    const o: Record<string, string> = {};
    for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) o[k] = String(v);
    return '/browse?' + new URLSearchParams(o).toString();
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="split-l">
        <form className="card pad col g20 sticky hide-t" aria-label="Filters" action="/browse">
          <div className="row between"><div className="h4">Filters</div><Link className="linkbtn t-sm" href="/browse">Clear all</Link></div>
          {sp.q && <input type="hidden" name="q" value={sp.q} />}
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          <div className="col g8">
            <span className="label">Category</span>
            <div className="row wrapf g6">
              <label className="chip" style={{ height: 32 }}><input type="radio" name="cat" value="" defaultChecked={!sp.cat} />All</label>
              {CATEGORIES.map((c) => (
                <label key={c.key} className="chip" style={{ height: 32 }}>
                  <input type="radio" name="cat" value={c.key} defaultChecked={sp.cat === c.key} />{c.label}
                </label>
              ))}
            </div>
          </div>
          <div className="col g8">
            <span className="label">Condition</span>
            <div className="row wrapf g6">
              {CONDITIONS.map((c) => (
                <label key={c.key} className="chip" style={{ height: 32 }}>
                  <input type="checkbox" name="c" value={c.key} defaultChecked={conds.includes(c.key)} />{c.key}
                </label>
              ))}
            </div>
          </div>
          <div className="col g8">
            <span className="label">Price range</span>
            <div className="row g8">
              <div className="prefix grow"><span>₹</span><input name="min" aria-label="Minimum price" placeholder="Min" inputMode="numeric" defaultValue={sp.min || ''} /></div>
              <span className="muted">–</span>
              <div className="prefix grow"><span>₹</span><input name="max" aria-label="Maximum price" placeholder="Max" inputMode="numeric" defaultValue={sp.max || ''} /></div>
            </div>
          </div>
          <button className="btn btn-pri btn-block" type="submit">Show results</button>
        </form>

        <div className="col g16" style={{ minWidth: 0 }}>
          <div className="row between wrapf g12">
            <div className="col g4" style={{ gap: 2 }}>
              <div className="h3">
                {total} {total === 1 ? 'result' : 'results'}
                {sp.q ? <> for “{sp.q}”</> : null}
                {sp.cat ? <> in {categoryLabel(sp.cat)}</> : null}
              </div>
              <span className="t-sm muted">{loc ? `In ${loc.city} · ${loc.area} first` : 'All cities'}</span>
            </div>
            <form className="row g8" action="/browse">
              {Object.entries(sp).filter(([k, v]) => v && k !== 'sort' && k !== 'page').map(([k, v]) => <input key={k} type="hidden" name={k} value={String(v)} />)}
              <select className="select" name="sort" defaultValue={sp.sort || 'nearby'} aria-label="Sort" style={{ height: 36 }}>
                <option value="nearby">Nearest first</option>
                <option value="new">Newest first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
              <button className="btn btn-sec btn-sm" type="submit"><Ic n="sort" s="sm" />Sort</button>
            </form>
          </div>

          {hasFilters && (
            <div className="row wrapf g6">
              {sp.cat && <Link className="chip on" href={qs({ cat: undefined, page: undefined })}>{categoryLabel(sp.cat)}<Ic n="x" s="xs" /></Link>}
              {conds.map((c) => <Link key={c} className="chip on" href={qs({ cond: conds.filter((x) => x !== c).join(',') || undefined, page: undefined })}>{c}<Ic n="x" s="xs" /></Link>)}
              {(sp.min || sp.max) && <Link className="chip on" href={qs({ min: undefined, max: undefined, page: undefined })}>₹{sp.min || 0} – {sp.max ? '₹' + sp.max : 'any'}<Ic n="x" s="xs" /></Link>}
              {sp.q && <Link className="chip on" href={qs({ q: undefined, page: undefined })}>“{sp.q}”<Ic n="x" s="xs" /></Link>}
              <Link className="linkbtn t-sm" href="/browse">Clear all</Link>
            </div>
          )}

          {rows.length ? (
            <div className="pgrid">{rows.map((l) => <ProductCard key={l.id} l={l} />)}</div>
          ) : (
            <div className="card empty" style={{ maxWidth: 'none' }}>
              <div className="empty-ic"><Ic n="search" s="xxl" /></div>
              <div className="h3">No items found</div>
              <p className="soft">Nothing matches your search and filters in {loc?.city || 'this city'}. Try removing a filter.</p>
              <Link className="btn btn-pri" href="/browse">Clear filters</Link>
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              {page > 1 && <Link className="btn btn-sec btn-sm" href={qs({ page: String(page - 1) })}><Ic n="chevl" s="sm" />Previous</Link>}
              <span className="t-sm muted" style={{ alignSelf: 'center' }}>Page {page} of {pages}</span>
              {page < pages && <Link className="btn btn-sec btn-sm" href={qs({ page: String(page + 1) })}>Next<Ic n="chevr" s="sm" /></Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
