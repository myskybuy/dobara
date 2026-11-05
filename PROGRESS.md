# PROGRESS — Dobara build

**Current phase:** all phases (0–8) written, plus Phase 9 (seller approval, admin user drawer, contact resolution, location page redesign).
**Next step:** run locally (`npm install && npm run setup && npm run dev`) and fix anything that shows up on first run.

## Phase 9 — Seller approval & admin/QA polish

- [x] **Seller approval by admin.**
  - [x] `/seller/apply` form (full name, phone, location pre-filled, what you'll sell, accept terms) — `app/seller/apply/`
  - [x] `User.sellerStatus` (NONE/PENDING/APPROVED/REJECTED) + `sellerPhone`/`sellerNote`/`sellerRejectReason`/`sellerAppliedAt` on the schema
  - [x] `/seller/*` moved under a `(dash)` route group whose layout redirects to `/seller/apply` unless `sellerStatus === 'APPROVED'`; `/seller/apply` itself redirects approved sellers to `/seller`
  - [x] Admin → Seller approvals (`/admin/sellers`): Pending/Approved/Rejected tabs, approve or reject with a reason, drawer with application details; sidebar badge + dashboard KPI for pending count
  - [x] "Sell an item" buttons (header, footer, tab bars, home, about) resolve to `/seller/apply` or `/seller/new` via `sellerCtaHref(user)` in `lib/auth.ts`
  - [x] Seed: existing demo sellers are `APPROVED`; `manish@dobara.test` seeded as a `PENDING` application for the demo
- [x] **User management.** Admin → Users shows seller status + a details drawer (that user's listings, orders, complaints)
- [x] **Contact message resolution.** `ContactMessage.resolved`; "Mark resolved" button on Admin → Complaints
- [x] **Location page redesign.** City chips (filter), full-width search, responsive area grid (1/2/3 columns), sticky "Continue" bar on mobile
- [x] `npx tsc --noEmit`, `npm run build` and `npm run db:reset` all pass after these changes

## Phase 10 — Seller coverage & QA (2026-10-12)

- [x] 3–4 verified sellers in **every** area (118 approved sellers, ~3 live listings each, real photos) — `prisma/demo-sellers-extra.ts`, shared creator in `prisma/demo-seed-helpers.ts`
- [x] `npm run db:add-sellers` adds them to an existing DB without wiping (also swaps old `sprite:` art for photos); `seed.ts` includes them on a full reset
- [x] Admin → Seller approvals: search + pagination (was capped at 100 rows); Admin → Listings: pagination (was capped at 100)
- [x] Admin approve/reject actions only follow `back` inside `/admin`; "Take down" returns to the same tab
- [x] OTP for `@*.test` demo addresses is shown on screen in dev even when SMTP is set (previously no demo account could log in)
- [x] Seller logins listed in `SELLER_LOGINS.md`

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
- `app/seller/(dash)/` is a route group so its layout (which requires `sellerStatus === 'APPROVED'`) doesn't wrap `/seller/apply`, avoiding a redirect loop; `/seller/apply` has its own small layout instead.
- On this Next.js version, a `redirect()` during a full-page Server Component render returns **HTTP 200** with the original route's HTML plus a `<meta http-equiv="refresh">` tag (and a flight-payload marker) rather than a classic 307 — curl/no-JS tools won't visibly follow it, but every real browser does immediately. Don't mistake that for a broken redirect when testing with curl.

## Not built (out of scope by request)

- GPS / maps / live tracking
- Delivery-partner app
- KYC
- Wallet
- Coupons
- Notifications centre
- Wishlist
- Charts
