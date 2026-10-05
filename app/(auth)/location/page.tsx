import { setLocationAction } from '@/app/actions/auth';
import { getLocation, safeNext } from '@/lib/auth';
import { LOCATIONS } from '@/lib/constants';
import { FormError, Ic } from '@/components/ui';

export const metadata = { title: 'Select your location' };

type SP = Promise<{ next?: string; error?: string; q?: string }>;

export default async function LocationPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const current = await getLocation();
  const q = (sp.q || '').trim().toLowerCase();
  const rows = LOCATIONS.flatMap((l) => l.areas.map((a) => ({ city: l.city, area: a })))
    .filter((r) => !q || (r.area + ' ' + r.city).toLowerCase().includes(q));

  return (
    <section className="container" style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 48 }}>
      <div className="backbar"><div className="h2">Select your location</div></div>
      <div className="card pad col g16">
        <form className="inwrap" action="/location">
          <input type="hidden" name="next" value={next} />
          <Ic n="search" s="sm" />
          <input className="input" name="q" placeholder="Search area or city" defaultValue={sp.q || ''} aria-label="Search location" />
        </form>
        <FormError msg={sp.error} />
        <form action={setLocationAction} className="col g16">
          <input type="hidden" name="next" value={next} />
          <div className="eyebrow">Areas</div>
          <div className="col g8" style={{ maxHeight: 520, overflowY: 'auto' }}>
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
            {rows.length === 0 && <p className="soft">No area matches “{sp.q}”. Try a city name like Noida or Pune.</p>}
          </div>
          <div className="row between wrapf g12">
            <span className="t-sm muted">We ask only once. You can change it later from the header.</span>
            <button className="btn btn-pri" type="submit">Continue</button>
          </div>
        </form>
      </div>
    </section>
  );
}
