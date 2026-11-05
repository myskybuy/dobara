'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { CondBadge, Photo } from './ui';
import type { ChatMsg } from '@/lib/chat';

type State = {
  agreedPrice: number | null;
  listingStatus: string;
  order: { id: string; status: string; paymentMode: string | null; mode: 'PICKUP' | 'DELIVERY' } | null;
  offers: Record<string, string | null>;
};

type Props = {
  conversationId: string;
  initialMessages: ChatMsg[];
  initialState: State;
  isBuyer: boolean;
  otherName: string;
  askingPrice: number;
  openOffer: boolean;
  listing: { id: string; title: string; photo?: string; condition: string };
};

const inr = (n: number | null | undefined) => (n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN'));
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
const QUICK_BUYER = ['Is this still available?', 'Can I see it today?', 'Is the price negotiable?', 'Do you have the bill?'];
const QUICK_SELLER = ['Yes, it is available.', 'I can hand it over today.', 'The bill is included.', 'Price is slightly negotiable.'];

/** What the person looking at the chat should do next, for each order status: [message, button label]. */
function orderNext(o: NonNullable<State['order']>, isBuyer: boolean, other: string): [string, string] {
  const cod = o.paymentMode === 'cod';
  const pickup = o.mode === 'PICKUP';
  const money = cod ? (isBuyer ? 'Pay in cash / UPI only after checking the item.' : 'Collect the cash / UPI payment at handover.') : '';
  if (isBuyer) {
    switch (o.status) {
      case 'PAID': return [`Waiting for ${other} to accept your order. You'll see the update here.`, 'View order'];
      case 'ACCEPTED': return [`${other} accepted your order and is getting it ready.`, 'View order'];
      case 'READY_FOR_PICKUP': return [`Ready for pickup! Go to the meeting point, check the item, then share your OTP. ${money}`, 'Show my OTP'];
      case 'HANDED_TO_DELIVERY': case 'OUT_FOR_DELIVERY': return [`On the way. Check the item at the door, then share your OTP. ${money}`, 'Show my OTP'];
      case 'DELIVERED': return ['You got the item. Please confirm everything is fine (or report a problem).', 'Confirm receipt'];
      case 'ISSUE_REPORTED': return ['You reported a problem. Dobara support is looking into it.', 'View order'];
      default: return ['Order complete. Thanks for buying on Dobara!', 'View order'];
    }
  }
  switch (o.status) {
    case 'PAID': return [`New order! Accept it so ${other} knows you'll hand it over.${cod ? ' Buyer pays you in cash / UPI at handover.' : ''}`, 'Accept order'];
    case 'ACCEPTED': return pickup ? [`When the item is ready, mark it ready for pickup — ${other} gets the meeting point.`, 'Mark ready for pickup'] : ['Send the item and update the delivery status.', 'Update delivery'];
    case 'READY_FOR_PICKUP': case 'HANDED_TO_DELIVERY': case 'OUT_FOR_DELIVERY': return [`At handover: let ${other} check the item. ${money} Then enter their 4-digit OTP.`, 'Enter buyer’s OTP'];
    case 'DELIVERED': return [`Handed over. Waiting for ${other} to confirm.`, 'View order'];
    case 'ISSUE_REPORTED': return [`${other} reported a problem. Dobara support is reviewing it.`, 'View order'];
    default: return [cod ? 'Order complete — you were paid at handover.' : 'Order complete — your payout is on its way.', 'View order'];
  }
}

export function ChatThread(p: Props) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(p.initialMessages);
  const [st, setSt] = useState<State>(p.initialState);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { mode: 'make' | 'counter'; messageId?: string }>(p.openOffer && p.isBuyer ? { mode: 'make' } : null);
  const [amt, setAmt] = useState(String(Math.round((p.askingPrice * 0.85) / 500) * 500 || p.askingPrice));
  const box = useRef<HTMLDivElement>(null);
  const lastAt = useRef<string | undefined>(p.initialMessages[p.initialMessages.length - 1]?.createdAt);

  const poll = useCallback(async () => {
    const q = lastAt.current ? '?after=' + encodeURIComponent(lastAt.current) : '';
    // Network blips (server restarting, offline) just skip this round; the next poll retries.
    const res = await fetch(`/api/conversations/${p.conversationId}/messages${q}`, { cache: 'no-store' }).catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json()) as { messages: ChatMsg[]; state: State };
    setSt(data.state);
    if (data.messages.length) {
      lastAt.current = data.messages[data.messages.length - 1]!.createdAt;
      setMsgs((old) => {
        const seen = new Set(old.map((m) => m.id));
        return [...old, ...data.messages.filter((m) => !seen.has(m.id))];
      });
    }
  }, [p.conversationId]);

  useEffect(() => {
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [msgs.length]);

  async function send(t: string) {
    if (!t.trim()) return;
    setBusy(true); setErr(null);
    const res = await fetch(`/api/conversations/${p.conversationId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: t }) });
    setBusy(false);
    if (!res.ok) { setErr(((await res.json().catch(() => ({}))) as { error?: string }).error || 'Could not send'); return; }
    setText('');
    await poll();
  }

  async function offer(action: 'make' | 'accept' | 'decline' | 'counter' | 'buy' | 'cancel', messageId?: string, amount?: string) {
    if (action === 'buy' && !confirm(`Buy this item at the asking price of ${inr(p.askingPrice)}? It will be reserved for you.`)) return;
    if (action === 'cancel' && !confirm('Cancel this deal? The item will go back on sale for everyone.')) return;
    setBusy(true); setErr(null);
    const res = await fetch(`/api/conversations/${p.conversationId}/offer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, messageId, amount }) });
    setBusy(false);
    if (!res.ok) { setErr(((await res.json().catch(() => ({}))) as { error?: string }).error || 'Something went wrong'); return; }
    setModal(null);
    await poll();
  }

  const offerStatus = (m: ChatMsg) => st.offers[m.id] ?? m.offerStatus;
  const available = st.listingStatus === 'ACTIVE';
  const dealOn = st.agreedPrice != null;
  /** The deal in this chat holds the item (RESERVED until the order is placed). */
  const mine = dealOn && st.listingStatus === 'RESERVED';
  const takenByOther = !dealOn && st.listingStatus === 'RESERVED';
  const step = st.order ? (st.order.status === 'COMPLETED' ? 4 : 3) : dealOn ? 2 : 1;
  const next = st.order ? orderNext(st.order, p.isBuyer, p.otherName.split(' ')[0]!) : null;
  const steps = p.isBuyer
    ? ['Agree a price', 'Pickup / delivery', 'Pay online or cash', 'Get the item']
    : ['Agree a price', 'Buyer places order', 'Hand over the item', 'Get paid'];
  const amtNum = parseInt(amt.replace(/\D/g, ''), 10) || 0;
  const pct = p.askingPrice ? Math.round(((p.askingPrice - amtNum) / p.askingPrice) * 100) : 0;
  const statusBadge: Record<string, [string, string]> = { PENDING: ['b-amber', 'Waiting'], ACCEPTED: ['b-green', 'Accepted'], DECLINED: ['b-red', 'Declined'], COUNTERED: ['b-gray', 'Countered'] };

  return (
    <>
      <div className="row g12" style={{ padding: '10px 16px', background: 'var(--sf2)', borderBottom: '1px solid var(--line2)' }}>
        <Link href={`/item/${p.listing.id}`} style={{ width: 56, borderRadius: 8, overflow: 'hidden', flex: 'none' }}><Photo src={p.listing.photo} alt={p.listing.title} /></Link>
        <div className="col grow" style={{ gap: 0, minWidth: 0 }}>
          <Link href={`/item/${p.listing.id}`} className="t-sm strong clamp1" style={{ color: 'var(--ink)' }}>{p.listing.title}</Link>
          <span className="row g6"><span className="strong num">{inr(p.askingPrice)}</span><CondBadge c={p.listing.condition} />{st.listingStatus === 'RESERVED' && <span className="badge b-pri">Reserved</span>}{st.listingStatus === 'SOLD' && <span className="badge b-gray">Sold</span>}</span>
        </div>
        {p.isBuyer && available && !dealOn && (
          <div className="row g6">
            <button className="btn btn-pri btn-xs" disabled={busy} onClick={() => offer('buy')}><i className="ic xs i-check" />Buy at {inr(p.askingPrice)}</button>
            <button className="btn btn-amber btn-xs" disabled={busy} onClick={() => setModal({ mode: 'make' })}><i className="ic xs i-tag" />Make offer</button>
          </div>
        )}
      </div>

      <ol className="row g6 t-xs" aria-label="Deal progress" style={{ listStyle: 'none', margin: 0, padding: '8px 16px', borderBottom: '1px solid var(--line2)', overflowX: 'auto' }}>
        {steps.map((s, i) => (
          <li key={s} className="row g4" style={{ flex: 'none', color: i < step ? 'var(--green)' : i === step ? 'var(--ink)' : 'var(--ink3)', fontWeight: i === step ? 700 : 400 }}>
            <span className="badge " style={{ minWidth: 20, justifyContent: 'center', background: i < step ? 'var(--green-50)' : i === step ? 'var(--pri-50)' : 'var(--sf2)' }}>{i < step ? '✓' : i + 1}</span>{s}{i < steps.length - 1 && <span className="muted" style={{ marginLeft: 4 }}>›</span>}
          </li>
        ))}
      </ol>

      <div ref={box} className="col g12 chat-scroll" style={{ flex: 1, padding: '18px 16px', background: '#F7F8FB' }}>
        <div className="note gray" style={{ alignSelf: 'center', maxWidth: 460 }}>
          <i className="ic sm i-shieldc c-teal" />
          <span className="t-xs">Keep chats and payments on Dobara. Payments made outside the app are not protected.</span>
        </div>

        {msgs.map((m) => {
          if (m.type === 'SYSTEM') {
            return <div key={m.id} className="t-xs muted" style={{ alignSelf: 'center', background: 'var(--sf)', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--line)' }}>{m.text}</div>;
          }
          const side = m.mine ? { alignSelf: 'flex-end', alignItems: 'flex-end' } : { alignSelf: 'flex-start', alignItems: 'flex-start' };
          if (m.type === 'OFFER') {
            const s = offerStatus(m) || 'PENDING';
            const [cls, label] = statusBadge[s] ?? ['b-gray', s];
            const canRespond = !m.mine && s === 'PENDING' && available && !dealOn;
            return (
              <div key={m.id} className="col g4" style={side as CSSProperties}>
                <div className="offer">
                  <div className="offer-h"><span className="row g6"><i className="ic xs i-tag" />{m.mine ? 'Your offer' : `${m.senderName.split(' ')[0]}’s offer`}</span><span className={'badge ' + cls}>{label}</span></div>
                  <div style={{ padding: 14 }} className="col g8">
                    <span className="price" style={{ fontSize: 26 }}>{inr(m.amount)}</span>
                    <span className="t-xs muted">Asking {inr(p.askingPrice)}{m.amount != null && m.amount < p.askingPrice ? ` · ${inr(p.askingPrice - m.amount)} less` : ''}</span>
                    {canRespond && (
                      <div className="row g6 wrapf">
                        <button className="btn btn-pri btn-sm" disabled={busy} onClick={() => offer('accept', m.id)}>Accept</button>
                        <button className="btn btn-sec btn-sm" disabled={busy} onClick={() => { setAmt(String(m.amount ?? '')); setModal({ mode: 'counter', messageId: m.id }); }}>Counter</button>
                        <button className="btn btn-ghost btn-sm c-red" disabled={busy} onClick={() => offer('decline', m.id)}>Decline</button>
                      </div>
                    )}
                  </div>
                </div>
                <span className="bmeta">{time(m.createdAt)}</span>
              </div>
            );
          }
          return (
            <div key={m.id} className="col g4" style={side as CSSProperties}>
              <div className={'bubble ' + (m.mine ? 'me' : 'them')} style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              <span className="bmeta">{time(m.createdAt)}{m.mine && m.read && <span> · Read</span>}</span>
            </div>
          );
        })}

        {takenByOther && (
          <div className="note amber" style={{ alignSelf: 'center', maxWidth: 460 }}><i className="ic sm i-lock" /><span className="t-sm">This item is reserved for another buyer right now. If their deal is cancelled you’ll be told here.</span></div>
        )}
        {st.listingStatus === 'SOLD' && !st.order && (
          <div className="note gray" style={{ alignSelf: 'center', maxWidth: 460 }}><i className="ic sm i-info" /><span className="t-sm">This item has been sold.</span></div>
        )}

        {dealOn && (
          <div className="sysmsg">
            <span className="mi-ic" style={{ background: '#fff', color: 'var(--green)', borderRadius: '50%' }}><i className="ic i-checkc" /></span>
            <b className="t-lg">Deal agreed at {inr(st.agreedPrice)}</b>
            {st.order ? (
              <>
                <span className="badge b-green">Order placed · {st.order.paymentMode === 'cod' ? (p.isBuyer ? 'pay cash / UPI at handover' : 'collect cash / UPI at handover') : 'paid online'}</span>
                <span className="t-sm soft" style={{ maxWidth: 420, textAlign: 'center' }}><b>Next:</b> {next![0]}</span>
                <Link className="btn btn-pri" href={p.isBuyer ? `/orders/${st.order.id}` : `/seller/orders/${st.order.id}`}>{next![1]}<i className="ic sm i-arrowr" /></Link>
              </>
            ) : mine ? (
              <>
                <span className="t-sm soft">{p.isBuyer
                  ? 'The item is reserved for you. Next: choose pickup or delivery, then pay online or cash on delivery.'
                  : `The item is reserved for ${p.otherName.split(' ')[0]} and hidden from other buyers. Waiting for them to place the order.`}</span>
                {p.isBuyer && <Link className="btn btn-pri" href={`/checkout/${p.conversationId}`}>Continue to purchase<i className="ic sm i-arrowr" /></Link>}
                <button className="btn btn-ghost btn-sm c-red" disabled={busy} onClick={() => offer('cancel')}>Cancel deal</button>
              </>
            ) : (
              <span className="t-sm soft">This item is no longer available.</span>
            )}
          </div>
        )}
      </div>

      {mine && !st.order && p.isBuyer && (
        <div className="row between g12" style={{ padding: '10px 16px', background: 'var(--green-50)', borderTop: '1px solid #CBE7D6' }}>
          <span className="row g8 t-sm"><i className="ic sm i-checkc c-green" /><b>Deal agreed at {inr(st.agreedPrice)}</b></span>
          <Link className="btn btn-pri btn-sm" href={`/checkout/${p.conversationId}`}>Continue to purchase</Link>
        </div>
      )}

      <div className="col g8" style={{ padding: '12px 16px', borderTop: '1px solid var(--line2)' }}>
        {err && <div className="note red" role="alert"><i className="ic sm i-alert" /><span>{err}</span></div>}
        <div className="row g6" style={{ overflowX: 'auto' }}>
          {(p.isBuyer ? QUICK_BUYER : QUICK_SELLER).map((q) => (
            <button key={q} className="chip" style={{ height: 32 }} onClick={() => send(q)} disabled={busy}>{q}</button>
          ))}
        </div>
        <form className="row g8" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <input className="input grow" placeholder="Type a message" aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} />
          <button type="submit" className="icon-btn" style={{ background: 'var(--pri)', color: '#fff' }} aria-label="Send" disabled={busy}><i className="ic i-send" /></button>
        </form>
      </div>

      {modal && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={modal.mode === 'make' ? 'Make an offer' : 'Counter offer'} onClick={(e) => e.stopPropagation()}>
            <div className="mhead"><div className="h3">{modal.mode === 'make' ? 'Make an offer' : 'Send a counter offer'}</div><button className="icon-btn sm" aria-label="Close" onClick={() => setModal(null)}><i className="ic i-x" /></button></div>
            <div className="mbody col g16">
              <span className="t-sm muted">Asking price <b className="num" style={{ color: 'var(--ink)' }}>{inr(p.askingPrice)}</b></span>
              <div className="field">
                <label className="label" htmlFor="of-a">{modal.mode === 'make' ? 'Your offer' : 'Your counter offer'}</label>
                <div className="prefix" style={{ height: 60 }}><span style={{ fontSize: 20 }}>₹</span><input id="of-a" inputMode="numeric" style={{ fontSize: 24, fontWeight: 800 }} value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ''))} autoFocus /></div>
                {amtNum > 0 && <span className="hint">{pct > 0 ? `${pct}% below asking price` : pct < 0 ? `${-pct}% above asking price` : 'Same as asking price'}</span>}
              </div>
              {modal.mode === 'make' && (
                <div className="row wrapf g6"><span className="t-sm muted">Suggested:</span>
                  {[0.85, 0.9, 0.95].map((f) => {
                    const v = Math.round((p.askingPrice * f) / 100) * 100;
                    return <button key={f} className={'chip pri-on' + (amtNum === v ? ' on' : '')} onClick={() => setAmt(String(v))}>{inr(v)}</button>;
                  })}
                </div>
              )}
              <div className="note gray"><i className="ic sm i-info" /><span>The other person can accept, decline or counter. Once accepted, the item is reserved for you and hidden from other buyers.</span></div>
            </div>
            <div className="mfoot">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-amber" disabled={busy || amtNum < 1} onClick={() => offer(modal.mode, modal.messageId, String(amtNum))}><i className="ic sm i-send" />Send offer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
