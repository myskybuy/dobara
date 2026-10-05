'use client';

import { useState } from 'react';
import { Photo } from './ui';

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [i, setI] = useState(0);
  const list = photos.length ? photos : [''];
  const go = (d: number) => setI((i + d + list.length) % list.length);
  return (
    <div className="col g12">
      <div className="gal-main" style={{ position: 'relative' }}>
        <Photo src={list[i]} alt={title} />
        {list.length > 1 && (
          <>
            <button className="icon-btn bd" style={{ position: 'absolute', left: 12, top: '50%', borderRadius: '50%' }} aria-label="Previous photo" onClick={() => go(-1)}><i className="ic i-chevl" /></button>
            <button className="icon-btn bd" style={{ position: 'absolute', right: 12, top: '50%', borderRadius: '50%' }} aria-label="Next photo" onClick={() => go(1)}><i className="ic i-chevr" /></button>
          </>
        )}
        <span className="badge b-dark" style={{ position: 'absolute', left: 12, bottom: 12 }}>{i + 1} / {list.length}</span>
      </div>
      {list.length > 1 && (
        <div className="row g8 wrapf">
          {list.map((p, k) => (
            <button key={k} className={'thumb' + (k === i ? ' on' : '')} onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} style={{ width: 84, padding: 0, overflow: 'hidden' }}>
              <Photo src={p} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
