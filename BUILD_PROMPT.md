> Note: in the actual build, login/sign-up uses **email OTP** (not mobile), Razorpay runs in test mode with a demo fallback. See PROGRESS.md for decisions.

You are building **Dobara**, a simple OLX-style secondhand goods marketplace web app for India (INR, Indian cities). It connects a **buyer** with an **individual seller**. The scope is **listings, buyer discovery and delivery coordination**. The UI is already designed. Your job is to turn that design into a working website, **phase by phase**, without adding features that are not listed here.

### 0. Golden rules (follow every time)

1. **The design is fixed.** Every screen must look like the matching file in `design/screens/*.png`. Copy the structure and class names from `design/html/*.html`. Use `design/styles/dobara.css` as the global stylesheet, together with `icons.svg`, `products.svg` and `map.svg` from the same folder. **Do not redesign, rename classes, or switch to Tailwind or another UI kit.** `design/screens/000_Flow_map.png` shows which screen belongs to which flow step.
2. **Keep it simple.**
   - No GPS, no live tracking, no maps that need location, no WebSockets, no microservices.
   - Location is chosen **once** (city + area from a list), saved on the user, and shown in the header.
   - Chat refreshes by polling every 5 seconds.
3. **Do not add screens or features** that are not in this prompt or the design. If something is unclear, choose the simplest option and note it in `PROGRESS.md`.
4. **Work in phases (section 4).** Finish one phase completely before starting the next.
5. **Resume system (very important):**
   - Keep a file `PROGRESS.md` at the repo root. It holds:
     - the current phase
     - a checklist of tasks, ticked `[x]` as you finish them
     - files created
     - decisions made
     - the exact next step
   - Update it after **every** finished task, not only at the end of a phase.
   - Make a git commit after every finished task, for example `phase-2: listing form`.
   - Copy this whole prompt into `BUILD_PROMPT.md` in Phase 0 so a new chat can re-read it.
   - When a new chat says *"Read PROGRESS.md and BUILD_PROMPT.md, then continue exactly where you stopped"*, do this:
     - read both files
     - run `git status` and `git log -5`
     - fix any half-finished file
     - continue from the "Next step" line
     - **never restart a phase or redo finished tasks**
6. At the end of each phase, run `npm run build` and `npm run lint` and fix all errors. Seed the database and check the phase's screens in the browser against the PNGs. Then write a short "Phase N done" note in `PROGRESS.md` and continue to the next phase.

### 1. Tech stack (use exactly this)

| Part | Choice |
|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** — one app for buyer, seller and admin |
| Database | **PostgreSQL + Prisma ORM** |
| Styling | Global `dobara.css` from the design kit (plain CSS, Manrope font). No CSS framework. |
| Forms / validation | Server Actions + **zod** |
| Auth | Mobile number + **OTP**, custom. Store an OTP hash in the DB, expires in 5 min. Session = signed JWT in an httpOnly cookie (`jose`). In development, print the OTP to the server console. Use a `sendSms()` stub, so a provider like MSG91 can be plugged in later. |
| Payments | **Razorpay** (test mode) via Checkout + server-side signature verification. Money is "held" by Dobara: it is only a DB status, and admin marks the seller payout as paid manually. |
| Images | Upload to `/public/uploads` (local disk), max 8 photos, 5 MB each. Keep the storage code in one `storage.ts`, so S3/Cloudinary can be swapped in later. |
| Chat | Normal DB tables + polling every 5 s (`/api/conversations/[id]/messages?after=`) |
| Roles | Every logged-in user can buy **and** sell. `isAdmin` flag for admin. |

Folder structure:

```
/app
  (site)/            → buyer website: home, browse, item, chat, checkout, orders, profile, about, contact, terms, privacy
  (auth)/            → login, otp, select-location
  seller/            → seller panel (own sidebar layout)
  admin/             → admin panel (own sidebar layout, isAdmin only)
  api/               → only what Server Actions cannot do (chat polling, Razorpay verify, uploads)
/components          → Header, Footer, ProductCard, SellerSidebar, AdminSidebar, StatusTimeline, OtpInput, StarRating, etc.
/lib                 → db.ts, auth.ts, otp.ts, payments.ts, storage.ts, money.ts (₹ formatting), validators.ts
/prisma              → schema.prisma, seed.ts (Indian demo data matching the design: Aarav Mehta, Karan Malhotra, Canon EOS 1500D…)
/design              → design kit (do not edit)
PROGRESS.md, BUILD_PROMPT.md, README.md, .env.example
```

### 2. Data model (Prisma)

- **User**: id, phone (unique), name, cityId, area, address (text), isAdmin, isBlocked, createdAt
- **City** and **Area**: seeded list, for example Noida → Sector 18, Sector 62…
- **Listing**:
  - id, sellerId, title, category (enum), condition (LIKE_NEW / GOOD / FAIR / NEEDS_REPAIR)
  - price, description, photos (string[])
  - canPickup, canDeliver
  - city, area
  - status (PENDING_REVIEW / ACTIVE / REJECTED / SOLD), rejectReason, createdAt
- **Conversation**: id, listingId, buyerId, sellerId (unique on listingId + buyerId)
- **Message**:
  - id, conversationId, senderId, type (TEXT / OFFER / SYSTEM), text, amount
  - offerStatus (PENDING / ACCEPTED / DECLINED / COUNTERED), createdAt, readAt
- **Order**:
  - id, code (e.g. DB-2026-104872), listingId, buyerId, sellerId
  - agreedPrice, deliveryFee (flat ₹79, or ₹0 for pickup), total
  - mode (PICKUP / DELIVERY), address, pickupPlace, pickupTime
  - status (see section 3), handoverOtp (4 digits)
  - razorpayOrderId, paymentId, timestamps for each status
- **Review**: orderId, fromUserId, toUserId, rating 1–5, tags[], text. One per side per order.
- **Complaint**: orderId, userId, reason, text, photos[], status (OPEN / RESOLVED), adminNote
- **Payout**: orderId, sellerId, amount (= agreedPrice), status (PENDING / PAID), paidAt

### 3. The flow to implement (do not change it)

1. **User visits platform**: Home.
2. **Selects location**: asked **once** after first visit or login (city + area list). After that it is only shown and changed from the header chip.
3. **Browses nearby items**:
   - Home rails "Near you" and "Recently added", plus the Browse page.
   - Browse has filters for category, condition and price range, plus search and sort.
   - "Nearby" = same city, same area first. **Show the area name, not km.**
4. **Selects an item**: Item page.
5. **Checks photos, condition and price**: gallery, condition badge, description, seller card.
6. **Chats with seller**: "Chat with seller" opens or creates a Conversation.
7. **Agrees on final price and pickup/delivery**:
   - Offer and counter-offer messages in chat. When an offer is accepted, show a "Deal agreed at ₹X" card and a "Continue to purchase" button.
   - Buyer picks **Pickup** (meeting place + time typed or agreed in chat) or **Delivery** (saved profile address).
8. **Confirms purchase** and 9. **Makes payment**: the "Confirm & pay" page with price details, then Razorpay, then Order confirmed. The listing becomes SOLD.
10. **Seller arranges delivery or buyer collects**:
    - The seller sees the order and presses status buttons. **All status changes are manual buttons**, with no tracking.
    - Delivery: Accept → Handed to delivery (optional courier name / tracking text) → Out for delivery.
    - Pickup: Accept → Ready for pickup.
11. **Buyer receives and checks item**:
    - The buyer sees a 4-digit OTP on the order page. The seller or courier enters it at handover, and the status becomes DELIVERED.
    - The buyer has a checklist and can use "Report a problem", which creates a Complaint and holds the payout.
12. **Confirms receipt**: the buyer presses "Confirm receipt", which sets COMPLETED and creates a Payout (PENDING). If the buyer does nothing, it auto-completes 48 h after DELIVERED (a simple check on page load or a cron route is enough).
13. **Both leave a review**: the buyer rates the seller and the seller rates the buyer.

Order status enum:
- PAID → ACCEPTED → (HANDED_TO_DELIVERY → OUT_FOR_DELIVERY | READY_FOR_PICKUP) → DELIVERED → COMPLETED
- plus ISSUE_REPORTED and CANCELLED

### 4. Phases (build in this order)

**Phase 0 — Setup**
- Next.js + TS, Prisma + Postgres, `.env.example`, global CSS from the kit, fonts, icon sprites.
- Header (logo, location chip, search, "Sell an item", chat icon, account menu: My orders, Chats, My listings, Profile, Log out) and footer (Buy / Sell / Company / Legal) exactly as in the design.
- Seed script, `PROGRESS.md`, `BUILD_PROMPT.md`.

**Phase 1 — Auth, location, profile**
- Screens: Login with mobile, Verify OTP, Select location (once), Profile (name, mobile, address, links, log out).
- Route protection for /seller and /admin.

**Phase 2 — Listings (seller) + approval (admin)**
- Seller: Seller home (4 stat cards, offers waiting, needs attention), List an item (one form, photo upload), My listings (Active / Pending review / Sold / Rejected).
- Admin: Dashboard, Listing approvals table, Approve / reject drawer with reason.
- New listings start as PENDING_REVIEW.

**Phase 3 — Discovery (buyer)**
- Home, Browse (filters, search, sort, pagination), Item page.
- Only ACTIVE listings are shown.

**Phase 4 — Chat & offers**
- Buyer: Chat page with a conversation list on the left, Make offer modal, Deal agreed card.
- Seller: Chats & offers page and Reply to offer (accept / decline / counter).
- Polling every 5 s. Quick-reply chips as in the design.

**Phase 5 — Checkout & payment**
- Pickup or delivery → Confirm & pay → Razorpay → Order confirmed.
- Handle payment failure with a simple retry message on the same page.

**Phase 6 — Delivery coordination & receipt**
- Buyer: Order status page (status timeline + OTP, no map), Receive & check, Confirm receipt, Report a problem, My orders.
- Seller: Orders list, Arrange delivery, Buyer collects (OTP entry).

**Phase 7 — Reviews, earnings, admin basics**
- Leave a review (buyer), Rate the buyer (seller), seller Earnings & payouts.
- Admin: Users (block / unblock), Orders (view, cancel), Complaints (resolve with note, release or hold payout), mark payout as paid.

**Phase 8 — Website pages & polish**
- About, Contact (form saves to DB), Terms, Privacy, 404.
- Loading, empty and error states.
- Mobile responsive, as the CSS already supports.
- Final `npm run build`, a README with setup steps, and a demo login (seeded buyer, seller and admin phone numbers).

### 5. Screen list (match these files exactly)

Website (buyer):
- 001 Home
- 002 Select location
- 003 Browse
- 004 Item (product)
- 005 Login
- 006 OTP
- 007 Chat
- 008 Make offer
- 009 Deal agreed
- 010 Pickup or delivery
- 011 Confirm & pay
- 012 Order confirmed
- 013 Order status
- 014 Receive & check
- 015 Confirm receipt
- 016 Review
- 017 Report problem
- 018 My orders
- 019 Profile
- 020 About
- 021 Contact
- 022 Terms
- 023 Privacy

Seller:
- 024 Seller home
- 025 List an item
- 026 My listings
- 027 Chats & offers
- 028 Reply to offer
- 029 Orders
- 030 Arrange delivery
- 031 Buyer collects
- 032 Earnings & payouts
- 033 Rate buyer

Admin:
- 034 Dashboard
- 035 Listing approvals
- 036 Approve / reject
- 037 Users
- 038 Orders
- 039 Complaints

File names: `design/screens/NNN_*.png` and `design/html/NNN_*.html`.

### 6. Not in scope (do not build)
- GPS or live tracking
- delivery-partner app
- KYC
- wallet
- coupons engine
- notifications centre
- wishlist
- multi-language
- native mobile apps
- analytics charts

Start now with **Phase 0**. First create `PROGRESS.md` with the full phase checklist, then begin.
