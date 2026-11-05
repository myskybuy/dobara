'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const INTERVAL = 6000;

/** Auto-sliding home banner. Slides are server-rendered and passed in; this only handles motion.
 *  Pauses on hover, keyboard focus, hidden tab and prefers-reduced-motion; supports swipe and arrow keys. */
export function HeroCarousel({ slides, labels }: { slides: ReactNode[]; labels: string[] }) {
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (paused || reduced || n < 2) return;
    const t = window.setInterval(() => {
      if (!document.hidden) setI((v) => (v + 1) % n);
    }, INTERVAL);
    return () => window.clearInterval(t);
  }, [paused, reduced, n, i]);

  return (
    <section
      className="hero t-hc"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false); }}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest('input,textarea')) return;
        if (e.key === 'ArrowLeft') go(i - 1);
        if (e.key === 'ArrowRight') go(i + 1);
      }}
      onPointerDown={(e) => { if (e.pointerType !== 'mouse') drag.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - d.y)) go(dx < 0 ? i + 1 : i - 1);
      }}
      onPointerCancel={() => { drag.current = null; }}
    >
      <div className="t-hc-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, k) => (
          <div
            key={k}
            className="t-hc-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${k + 1} of ${n}: ${labels[k] ?? ''}`}
            aria-hidden={k !== i}
            inert={k !== i}
          >
            {s}
          </div>
        ))}
      </div>
      {n > 1 && (
        <>
          <button type="button" className="t-hc-arrow l hide-m" aria-label="Previous banner" onClick={() => go(i - 1)}><i className="ic i-chevl" /></button>
          <button type="button" className="t-hc-arrow r hide-m" aria-label="Next banner" onClick={() => go(i + 1)}><i className="ic i-chevr" /></button>
          <div className="t-hc-dots">
            {slides.map((_, k) => (
              <button
                key={k}
                type="button"
                className={k === i ? 'on' : ''}
                aria-label={`Show banner ${k + 1}: ${labels[k] ?? ''}`}
                aria-current={k === i}
                onClick={() => go(k)}
              >
                {k === i && !paused && !reduced && <i key={i} style={{ animationDuration: `${INTERVAL}ms` }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
