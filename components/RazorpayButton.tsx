'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RzpInstance = { open: () => void; on: (ev: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window { Razorpay?: new (opts: Record<string, unknown>) => RzpInstance }
}

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** Razorpay TEST checkout. Creates the Razorpay order on the server, opens the popup, verifies the signature on the server. */
export function RazorpayButton({ orderId, label, name, email }: { orderId: string; label: string; name: string; email: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function pay() {
    setBusy(true); setErr(null);
    const ok = await loadScript();
    if (!ok || !window.Razorpay) { setBusy(false); setErr('Could not load Razorpay. Check your internet connection.'); return; }
    const res = await fetch('/api/payments/razorpay-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
    const data = (await res.json().catch(() => ({}))) as { keyId?: string; rzpOrderId?: string; amount?: number; code?: string; error?: string };
    if (!res.ok || !data.rzpOrderId) { setBusy(false); setErr(data.error || 'Could not start payment'); return; }

    const rzp = new window.Razorpay({
      key: data.keyId,
      order_id: data.rzpOrderId,
      amount: (data.amount || 0) * 100,
      currency: 'INR',
      name: 'Dobara',
      description: 'Order ' + data.code,
      prefill: { name, email },
      theme: { color: '#3B35C3' },
      handler: async (r: RzpResponse) => {
        const v = await fetch('/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, ...r }) });
        if (v.ok) router.push(`/orders/${orderId}/placed`);
        else {
          const j = (await v.json().catch(() => ({}))) as { error?: string };
          setBusy(false);
          setErr(j.error || 'Payment could not be verified. If money was deducted it will be refunded.');
        }
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    rzp.on('payment.failed', (r) => { setBusy(false); setErr('Payment failed: ' + (r.error?.description || 'please try again')); });
    rzp.open();
  }

  return (
    <div className="col g8">
      {err && <div className="note red" role="alert"><i className="ic sm i-alert" /><span>{err}</span></div>}
      <button className="btn btn-pri btn-lg btn-block" onClick={pay} disabled={busy}><i className="ic sm i-lock" />{busy ? 'Opening Razorpay…' : label}</button>
    </div>
  );
}
