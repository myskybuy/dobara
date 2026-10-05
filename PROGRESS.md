# PROGRESS — Dobara build

**Current phase:** all phases (0–8) written.
**Next step:** run locally (`npm install && npm run setup && npm run dev`) and fix anything that shows up on first run.

## Checklist

- [x] **Phase 0 — Setup.** Next.js 16 + TS, Prisma schema, design CSS, header/footer, tab bar, seed data
- [x] **Phase 1 — Auth, location, profile.**
  - [x] Login and sign-up with email OTP (dev code shown on screen)
  - [x] Location asked once
  - [x] Profile (name, address)
- [x] **Phase 2 — Listings + approval.**
  - [x] One-form "List an item" with photo upload
  - [x] My listings, edit, remove
  - [x] Admin approve / reject
- [x] **Phase 3 — Discovery.** Home rails, Browse (search, category, condition, price, sort, pages), Item page
- [x] **Phase 4 — Chat & offers.**
  - [x] Chat with 5 s polling
  - [x] Offer, counter, accept and decline
  - [x] "Deal agreed" card
  - [x] Seller "Chats & offers" page
- [x] **Phase 5 — Checkout & payment.**
  - [x] Pickup or delivery choice
  - [x] Razorpay test mode, with demo mode as fallback
  - [x] Failed payment, order confirmed
- [x] **Phase 6 — Delivery coordination & receipt.**
  - [x] Seller status buttons and handover OTP
  - [x] Buyer order status, "I have received", check & confirm, report a problem
  - [x] 48 h auto-confirm
- [x] **Phase 7 — Reviews, earnings, admin.**
  - [x] Buyer and seller reviews
  - [x] Earnings & payouts
  - [x] Admin users, orders, payouts and complaints
- [x] **Phase 8 — Pages & polish.** About, Contact, Terms, Privacy, 404, error/loading states, mobile tab bar, README

## Decisions

- Login is by **email OTP** (user request), not mobile.
- Nearby = same city, own area first (no GPS). The delivery fee is a flat ₹79.
- Delivery has **no live tracking**. The seller updates the status with buttons, and handover uses a 4-digit OTP.
- The buyer can also tap "I have received the item" if a courier delivered it.
- Payouts are created when the buyer confirms receipt. The admin marks them paid manually.
- Listing photos are uploaded through `/api/listings`, a route handler. This avoids the Server Action body-size limit.
- Every new or edited listing goes to **Pending review** until an admin approves it.

- Payment is atomic: if two buyers pay at the same moment, only the first gets the item; the second order is cancelled (refund).
- Seller decline / admin cancel puts the listing back live and resets the agreed price in chat.
- All dates are shown in India time (Asia/Kolkata).

## Not built (out of scope by request)

- GPS / maps / live tracking
- Delivery-partner app
- KYC
- Wallet
- Coupons
- Notifications centre
- Wishlist
- Charts
