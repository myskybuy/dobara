import { Fragment } from 'react';

/** Pure-CSS star rating input (no JS). Submits "rating" = 1..5. Inputs/labels must be siblings for the CSS to work. */
export function StarPicker({ name = 'rating', value = 0, idPrefix = 'st' }: { name?: string; value?: number; idPrefix?: string }) {
  return (
    <div className="star-pick" role="radiogroup" aria-label="Rating">
      {[5, 4, 3, 2, 1].map((n) => (
        <Fragment key={n}>
          <input type="radio" id={`${idPrefix}-${n}`} name={name} value={n} defaultChecked={value === n} required />
          <label htmlFor={`${idPrefix}-${n}`} aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</label>
        </Fragment>
      ))}
    </div>
  );
}
