# Dobara — secondhand goods marketplace (buyer → individual seller)

A simple OLX-style web app built from the **NEW (Basic)** Dobara design.
Scope: **listings, buyer discovery and delivery coordination.** No GPS, no live tracking, no maps.

**Tech:** Next.js 16 (App Router) · TypeScript · PostgreSQL · Prisma 6 · plain CSS from the design kit.

Built-in features:

- **Login and sign-up** with an email OTP. You don't need an email account to test locally: in dev mode the code is shown on screen.
- **Payments** through Razorpay test mode. With no keys set, the app uses a built-in **demo payment** screen instead.

---

## 1. Run it locally (first time)

What you need: **Node.js 20.9+** and **PostgreSQL 14+** running on your computer.

```bash
# 1) install packages
npm install

# 2) create the database (any name works — match it in .env)
createdb dobara            # or create "dobara" in pgAdmin

# 3) settings
cp .env.example .env       # then open .env and check DATABASE_URL (user / password / port)

# 4) create tables + demo data
npm run setup              # = prisma generate + prisma db push + seed

# 5) start
npm run dev                # open http://localhost:3000
```

### Demo logins

When you log in, the OTP appears on the "Enter the code" screen and in the terminal.

| Role | Email | What to try |
|---|---|---|
| Buyer | `aarav@dobara.test` | Chat about the Canon camera → accept Karan's ₹16,500 counter offer → checkout → pay (demo) |
| Seller (approved) | `karan@dobara.test` | `/seller` → new order from Rhea → accept → hand over → enter OTP **4827** |
| Buyer with a pending seller application | `manish@dobara.test` | `/seller/apply` → shows "under review" status (already applied in the seed data) |
| Admin | `admin@dobara.test` | `/admin` → approve/reject listings, approve/reject seller applications, manage users |

Other demo users: `rhea@dobara.test`, plus approved sellers like `rohan@dobara.test` and `priya@dobara.test`.

### Becoming a seller

Anyone can sign up and buy right away. To **sell**, a user applies once at `/seller/apply` (full name, phone, location, what they plan to sell, accept seller terms). An admin then approves or rejects the application from **Admin → Seller approvals** (`/admin/sellers`). Only after approval can the user list items — `/seller/*` and `/seller/new` send unapproved users back to `/seller/apply`, which shows a pending/rejected status message as appropriate. All "Sell an item" buttons across the site point to `/seller/apply` until the user is approved, then to `/seller/new`. Demo sellers in the seed data are pre-approved; `manish@dobara.test` is seeded with a **pending** application so you can see the review flow immediately.

Useful commands:

- `npm run db:reset` — wipe the database and load the demo data again
- `npm run db:add-sellers` — add the verified demo sellers (3–4 in every area) to an existing database without wiping it; safe to run again

All demo seller logins are listed in `SELLER_LOGINS.md`. Demo accounts use `@dobara.test` addresses, which can't receive email, so in development their OTP is always shown on the Verify screen (even when SMTP is configured).
- `npx prisma studio` — browse the database in your browser
- `npm run build && npm start` — production build

---

## 2. Optional settings (`.env`)

**Real emails.** Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `MAIL_FROM`.

- For Gmail, use an "App password" with `smtp.gmail.com` on port 465.
- When SMTP is set, the code is no longer shown on screen.

**Razorpay test mode.** Put your **test** keys in `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (Razorpay Dashboard → Test mode → API keys).

- The pay button then opens the real Razorpay checkout.
- Pay with Razorpay's test cards or UPI (`success@razorpay`).
- The server checks the payment signature before marking the order paid.

Leave both blank to keep using the demo payment screen. It also has a "Simulate a failed payment" button.

---

## 3. The flow (each step → page)

| # | Step | Page / route |
|---|---|---|
| 1 | User visits platform | `/` Home |
| 2 | Selects location (asked **once**; shown in header) | `/location` |
| 3 | Browses nearby items (same city, own area first) | `/` rails, `/browse` (search, category, condition, price, sort) |
| 4–5 | Selects an item; checks photos, condition, price | `/item/[id]` |
| 6 | Chats with seller | `/chat`, `/chat/[id]` (refreshes every 5 s) |
| 7 | Agrees on final price and pickup/delivery | Offer / counter / accept in chat → "Deal agreed" → `/checkout/[chatId]` |
| 8–9 | Confirms purchase, makes payment | `/pay/[orderId]` (Razorpay test or demo) → `/orders/[id]/placed` |
| 10 | Seller arranges delivery or buyer collects | Seller: `/seller/orders/[id]` (Accept → Handed to delivery → Out for delivery, or Ready for pickup) |
| 11 | Buyer receives and checks the item | Buyer shows the 4-digit OTP from `/orders/[id]`; seller enters it (or buyer taps "I have received the item") → `/orders/[id]/check` |
| 12 | Confirms receipt | "Confirm receipt" → order completed → seller payout created. Auto-confirms after 48 h. Problems go to `/orders/[id]/report` |
| 13 | Both leave a review | Buyer: `/orders/[id]/review` · Seller: `/seller/reviews` (rate the buyer) |

### Seller (`/seller`)

Requires an **approved** seller application (see "Becoming a seller" above) — otherwise every `/seller/*` route redirects to `/seller/apply`.

- Home dashboard
- List an item (one form with photos)
- My listings
- Chats & offers (accept, decline or counter)
- Orders
- Earnings & payouts
- Reviews

### Admin (`/admin`)

- Dashboard
- Listing approvals: new listings start as **Pending review**; approve or reject them with a reason
- Seller approvals: Pending / Approved / Rejected tabs; approve a seller application or reject it with a reason
- Users: seller status, block or unblock, and a details drawer (their listings, orders, complaints)
- Orders & payouts (cancel and refund; mark payout paid)
- Complaints (refund the buyer or release payment to the seller), plus messages from the contact form (mark resolved)

### Website pages

About, Contact (saved to the database), Terms, Privacy and 404.

---

## 4. Project structure

```
app/
  (site)/      buyer website: home, browse, item, chat, checkout, pay, orders, profile, about, contact, terms, privacy
  (auth)/      login, signup, verify (email OTP), location
  seller/      seller panel (apply/ is open to any logged-in user; (dash)/ requires an approved seller)
  admin/       admin panel (users with isAdmin = true)
  api/         chat polling + offers, listing upload, Razorpay order/verify
  actions/     server actions (auth, chat, orders, listings, admin, contact)
  uploads/     serves uploaded photos from ./uploads
components/    Header/Footer, ProductCard, ChatThread, Timeline, PriceDetails, …
lib/           db, auth (sessions + location), otp, mail, payments, orders, chat, listings, constants
prisma/        schema.prisma, seed.ts, demo-data.json
public/        dobara.css (design system — do not edit), icons.svg, products.svg, app.css (small app additions)
design/        the design kit: screen PNGs + static HTML for every screen (reference only)
uploads/       uploaded listing photos (local disk)
```

### Keeping it simple (by design)

- **No GPS or maps.** "Nearby" means the same city, with your area first. The delivery fee is a flat ₹79.
- **No WebSockets.** Chat checks for new messages every 5 seconds.
- **Order statuses are buttons.** The seller updates them; there is no live tracking. Handover is confirmed with a 4-digit OTP.
- **Money is "held" as a database status.**
  - When the buyer confirms receipt, a payout is created for the seller.
  - The admin marks payouts as paid after sending the money manually.
- **Photos are stored in `./uploads`.** To use S3 or Cloudinary later, change only `lib/storage.ts`.

### Moving to a server later

1. Set `DATABASE_URL`, `APP_URL`, SMTP and Razorpay **live** keys.
2. Run `npm run build && npm start` behind Nginx.
3. Keep the `uploads/` folder on persistent disk.
#   d o b a r a  
 