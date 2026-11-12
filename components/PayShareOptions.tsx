'use client';

import { useState } from 'react';
import { inr } from '@/lib/format';
import { ADVANCE_OPTIONS, advanceAmount, type AdvancePct } from '@/lib/payplan';
import { RazorpayButton } from './RazorpayButton';
import { Ic } from './ui';

type Props = {
  orderId: string;
  total: number;
  deliveryFee: number;
  live: boolean; // Razorpay keys set
  sellerFirst: string;
  handoverWord: string; // "on delivery" | "at pickup"
  name: string;
  email: string;
  demoAction: (fd: FormData) => Promise<void>;
};

const LABEL: Record<AdvancePct, string> = { 25: 'Pay 25% now', 50: 'Pay 50% now', 100: 'Pay full amount now' };

/** "Pay online now" card: the buyer picks 25 / 50 / 100 %, the rest is paid to the seller at handover. */
export function PayShareOptions({ orderId, total, deliveryFee, live, sellerFirst, handoverWord, name, email, demoAction }: Props) {
  const [pct, setPct] = useState<AdvancePct>(100);
  const now = advanceAmount(total, deliveryFee, pct);
  const later = total - now;

  const choices = (
    <div className="col g8" role="radiogroup" aria-label="How much to pay now">
      {ADVANCE_OPTIONS.map((p) => {
        const a = advanceAmount(total, deliveryFee, p);
        return (
          <label key={p} className="opt">
            <input type="radio" name="pct" value={p} checked={pct === p} onChange={() => setPct(p)} />
            <span className="radio" />
            <span className="col" style={{ gap: 0 }}>
              <b>{LABEL[p]} — {inr(a)}</b>
              <span className="t-xs muted">{p === 100 ? 'Nothing to pay at handover' : `${inr(total - a)} to ${sellerFirst} ${handoverWord}, in cash or UPI`}</span>
            </span>
          </label>
        );
      })}
    </div>
  );

  const summary = later > 0 && (
    <div className="note gray"><Ic n="info" s="sm" /><span>Pay <b>{inr(now)}</b> now. Keep <b>{inr(later)}</b> ready and pay it to {sellerFirst} {handoverWord} after you check the item.</span></div>
  );

  if (live) {
    return (
      <div className="col g12">
        <span className="t-sm soft">UPI, cards and net banking via Razorpay. Dobara holds the online amount and pays the seller only after you confirm you got the item.</span>
        {choices}
        {summary}
        <RazorpayButton key={pct} orderId={orderId} pct={pct} label={'Pay ' + inr(now) + ' online'} name={name} email={email} />
      </div>
    );
  }

  return (
    <form action={demoAction} className="col g12">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="note amber"><Ic n="info" s="sm" /><span><b>Demo payment mode.</b> No Razorpay keys are set, so no money moves. Add test keys in <code>.env</code> to use real Razorpay test checkout.</span></div>
      {choices}
      {summary}
      <button className="btn btn-pri btn-lg btn-block" type="submit"><Ic n="lock" s="sm" />Pay {inr(now)} (demo)</button>
      <button className="btn btn-ghost btn-sm" type="submit" name="simulate" value="fail" style={{ alignSelf: 'center' }}>Simulate a failed payment</button>
    </form>
  );
}
