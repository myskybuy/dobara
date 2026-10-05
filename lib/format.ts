// Small formatting helpers (₹, dates, initials).

export const TZ = 'Asia/Kolkata';

export function inr(n: number | null | undefined) {
  if (n == null) return '—';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** Stable avatar colour class (av-1 … av-6) from any string. */
export function avatarCls(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 'av av-' + ((h % 6) + 1);
}

export function timeAgo(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  const s = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60);
  if (h < 24) return h + 'h ago';
  const days = Math.round(h / 24);
  if (days < 30) return days + 'd ago';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
}

export function fmtTime(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ });
}

export function fmtDateTime(d: Date | string | null | undefined) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ });
}

export function fmtDate(d: Date | string | null | undefined) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
}

export function str(v: FormDataEntryValue | null | undefined) {
  return typeof v === 'string' ? v.trim() : '';
}

export function toInt(v: FormDataEntryValue | string | null | undefined) {
  const s = typeof v === 'string' ? v.replace(/[^0-9]/g, '') : '';
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : NaN;
}
