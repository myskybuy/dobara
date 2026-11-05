import Link from 'next/link';
import { setLocationAction } from '@/app/actions/auth';
import { getLocation, safeNext } from '@/lib/auth';
import { LOCATIONS } from '@/lib/constants';
import { FormError, Ic } from '@/components/ui';

export const metadata = { title: 'Select your location' };

type SP = Promise<{ next?: string; error?: string; q?: string; city?: string }>;

export default async function LocationPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const current = await getLocation();
  const q = (sp.q || '').trim().toLowerCase();
  const activeCity = sp.city && LOCATIONS.some((l) => l.city === sp.city) ? sp.city : '';
  const rows = LOCATIONS.flatMap((l) => l.areas.map((a) => ({ city: l.city, area: a })))
    .filter((r) => !activeCity || r.city === activeCity)
    .filter((r) => !q || (r.area + ' ' + r.city).toLowerCase().includes(q));

  const cityHref = (city: string) => {
    const p = new URLSearchParams();
    p.set('next', next);
    if (sp.q) p.set('q', sp.q);
    if (city) p.set('city', city);
    return '/location?' + p.toString();
  };

  return (
    <section className="container loc-page" style={{ maxWidth: 820, paddingTop: 32, paddingBottom: 48 }}>
      <div className="backbar"><div className="h2">Select your location</div></div>
      <div className="card pad col g16">
        <form className="inwrap" action="/location">
          <input type="hidden" name="next" value={next} />
          {activeCity && <input type="hidden" name="city" value={activeCity} />}
          <Ic n="search" s="sm" />
          <input className="input" name="q" placeholder="Search area or city" defaultValue={sp.q || ''} aria-label="Search location" />
        </form>
        <FormError msg={sp.error} />

        <div className="loc-citychips">
          <Link className={'chip' + (!activeCity ? ' on' : '')} href={cityHref('')}>All cities</Link>
          {LOCATIONS.map((l) => (
            <Link key={l.city} className={'chip' + (activeCity === l.city ? ' on' : '')} href={cityHref(l.city)}>{l.city}</Link>
          ))}
        </div>

        <form action={setLocationAction} className="col g16">
          <input type="hidden" name="next" value={next} />
          <div className="eyebrow">Areas{activeCity ? ` in ${activeCity}` : ''}</div>
          <div className="loc-areas">
            {rows.map((r) => {
              const v = r.city + '|' + r.area;
              const on = current?.city === r.city && current?.area === r.area;
              return (
                <label key={v} className="opt" style={{ padding: '12px 14px' }}>
                  <input type="radio" name="loc" value={v} defaultChecked={on} required />
                  <span className="radio" />
                  <Ic n="pin" s="sm" className="muted" />
                  <span className="grow"><b>{r.area}</b><span className="muted">, {r.city}</span></span>
                </label>
              );
            })}
            {rows.length === 0 && <p className="soft">No area matches your search. Try a city name like Noida or Pune.</p>}
          </div>
          <div className="row between wrapf g12 hide-m">
            <span className="t-sm muted">We ask only once. You can change it later from the header.</span>
            <button className="btn btn-pri" type="submit">Continue</button>
          </div>
          <div className="loc-ctabar show-m">
            <button className="btn btn-pri btn-block" type="submit">Continue</button>
          </div>
        </form>
      </div>
    </section>
  );
}
