'use client';

import { useEffect, useRef, useState } from 'react';

/** Fades/slides `[data-reveal]` blocks in as they scroll into view; `data-reveal="stagger"` staggers its children.
 *  Content is fully visible without JS, and whatever is already on screen at mount is never hidden (no flash). */
export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
    els.forEach((el) => {
      if (el.dataset.reveal === 'stagger') Array.from(el.children).forEach((c, k) => (c as HTMLElement).style.setProperty('--i', String(Math.min(k, 10))));
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in', 'rv-now');
    });
    document.documentElement.classList.add('js-rv');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => { if (!el.classList.contains('is-in')) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return null;
}

/** Number that counts up from 0 the first time it scrolls into view. Server HTML already has the final value. */
export function CountUp({ value, ms = 1200, decimals = 0, prefix = '', suffix = '' }: { value: number; ms?: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / ms);
        const f = 10 ** decimals;
        setShown(Math.round(value * (1 - Math.pow(1 - p, 3)) * f) / f);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { io.disconnect(); run(); } });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, ms, decimals]);

  return <b ref={ref}>{prefix}{shown.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</b>;
}
