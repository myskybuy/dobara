// Part-payment rules. Pure functions (no database), so client components can use them too.
// The buyer pays 25%, 50% or 100% online; the rest is paid to the seller in cash / UPI at handover.

export const ADVANCE_OPTIONS = [25, 50, 100] as const;
export type AdvancePct = (typeof ADVANCE_OPTIONS)[number];

/** Days after delivery during which the buyer can still report a problem (seller payout waits until then). */
export const ISSUE_WINDOW_DAYS = 7;

export function toAdvancePct(v: unknown): AdvancePct {
  const n = Number(v);
  return n === 25 || n === 50 ? n : 100;
}

/**
 * Amount paid online for a given share. Never less than the delivery fee, so Dobara always
 * collects the fee and the seller payout can't go negative.
 */
export function advanceAmount(total: number, deliveryFee: number, pct: number) {
  if (pct >= 100) return total;
  return Math.min(total, Math.max(Math.ceil((total * pct) / 100), deliveryFee));
}

type PayInfo = { paymentMode: string | null; advancePct: number; paidOnline: number; total: number };

/** Rupees the buyer paid online for this order. */
export function onlinePaid(o: PayInfo) {
  if (o.paymentMode === 'cod') return 0;
  // Orders placed before part-payments existed have advancePct 100 and paidOnline 0.
  return o.advancePct >= 100 ? o.total : o.paidOnline;
}

/** Rupees the buyer still pays the seller at handover. */
export function balanceDue(o: PayInfo) {
  return o.total - onlinePaid(o);
}

export const isPartPaid = (o: PayInfo) => o.paymentMode !== 'cod' && o.advancePct < 100;
