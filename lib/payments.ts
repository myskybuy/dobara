import crypto from 'crypto';

// Razorpay in TEST mode when keys are present, otherwise a built-in DEMO payment screen.
export const razorpayEnabled = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
export const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID || '';

/** Creates a Razorpay order (amount in rupees). Uses the REST API directly, no SDK needed. */
export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  const auth = Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + auth },
    body: JSON.stringify({ amount: amountRupees * 100, currency: 'INR', receipt }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Razorpay order failed: ' + (await res.text()));
  const data = (await res.json()) as { id: string };
  return data.id;
}

/** Checks the signature Razorpay sends to the browser after a successful payment. */
export function verifyRazorpaySignature(razorpayOrderId: string, paymentId: string, signature: string) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(razorpayOrderId + '|' + paymentId)
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
