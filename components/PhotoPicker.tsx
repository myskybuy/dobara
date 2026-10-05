'use client';

import { useState } from 'react';

/** File input with previews. Existing photos (when editing) are shown and kept unless new ones are chosen. */
export function PhotoPicker({ existing }: { existing: string[] }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="col g8">
      <span className="label">Photos <span className="muted">(up to 8, JPG / PNG / WEBP, max 5 MB each)</span></span>
      <div className="photo-preview">
        {(previews.length ? previews : existing.filter((p) => !p.startsWith('sprite:'))).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt={`Photo ${i + 1}`} />
        ))}
        <label className="upl" style={{ minHeight: 120, cursor: 'pointer' }}>
          <i className="ic lg i-imgplus" />{previews.length || existing.length ? 'Replace photos' : 'Add photos'}
          <input
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden-input"
            onChange={(e) => {
              const files: File[] = Array.from((e.target.files ?? []) as ArrayLike<File>);
              if (files.length > 8) setErr('Please choose at most 8 photos.');
              else if (files.some((f) => f.size > 5 * 1024 * 1024)) setErr('Each photo must be 5 MB or smaller.');
              else setErr(null);
              setPreviews(files.slice(0, 8).map((f) => URL.createObjectURL(f)));
            }}
          />
        </label>
      </div>
      {err ? <span className="hint c-red">{err}</span> : <span className="hint">Add a clear front photo and a close-up of any marks or damage.{existing.length ? ' Choosing new photos replaces the current ones.' : ''}</span>}
    </div>
  );
}
