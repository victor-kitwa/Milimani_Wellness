# Milimani Wellness Center

A custom e-commerce platform for Milimani Wellness Center: storefront, cart, checkout with
M-Pesa (via IntaSend), inventory, discount codes, and an admin dashboard. Built with Next.js
(React + Node, one app for both the storefront and the API), PostgreSQL, and Drizzle ORM.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack) — storefront, admin, and API in one app
- **PostgreSQL** + **Drizzle ORM** — schema in `src/db/schema.ts`
- **Custom auth** — email/password, JWT session in an httpOnly cookie (no third-party auth service)
- **IntaSend** — M-Pesa STK push + payment status, chosen as the payment aggregator instead of
  integrating Safaricom's Daraja API directly
- **Tailwind CSS v4** for styling

## Getting started locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a PostgreSQL database and copy `.env.example` to `.env.local`, filling in `DATABASE_URL`
   and the other values (see **Environment variables** below).
3. Run migrations and seed demo data:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   This creates an admin account (`admin@milimaniwellness.co.ke` / `ChangeMe123!` by default —
   **change this password immediately**, or set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` before
   seeding), six wellness categories (Supplements, Herbal Teas, Essential Oils, Yoga & Fitness,
   Natural Skincare, Wellness Home), and fifteen demo products with placeholder images so the
   storefront isn't empty.
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin` for the
   dashboard.

## Environment variables

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret used to sign session cookies — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | The public URL of the site (used for sitemap/metadata links) |
| `STORE_NAME` | Shown in the header, footer, and page titles |
| `STORE_CURRENCY` | Defaults to `KES` |
| `STORE_WHATSAPP_NUMBER` | Number (with country code, no `+`) for the WhatsApp chat button/link |
| `INTASEND_PUBLISHABLE_KEY` / `INTASEND_SECRET_KEY` | From your IntaSend dashboard |
| `INTASEND_TEST_MODE` | `"true"` uses sandbox.intasend.com, `"false"` uses payment.intasend.com (live) |
| `INTASEND_WEBHOOK_CHALLENGE` | A secret string you also set when registering the webhook in IntaSend — confirms webhook calls really came from them |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional, enables Google Analytics (GA4) |

## Database

Schema changes go in `src/db/schema.ts`. After editing it:

```bash
npm run db:generate   # writes a new SQL migration into drizzle/
npm run db:migrate    # applies pending migrations
npm run db:studio     # opens Drizzle Studio, a GUI for browsing/editing data
```

## Setting up M-Pesa payments (IntaSend)

1. Create an account at [intasend.com](https://intasend.com). You'll get **sandbox** keys
   immediately for testing, and can apply for **live** keys (requires business verification) when
   ready to accept real payments.
2. Put the sandbox keys in `.env.local` (`INTASEND_TEST_MODE="true"`) and place a real test order
   to confirm the STK push flow works end to end.
3. Once deployed with a public HTTPS domain, register a webhook in the IntaSend dashboard pointing
   at `https://yourdomain.com/api/payments/intasend/webhook`, and set the same challenge string in
   both the dashboard and `INTASEND_WEBHOOK_CHALLENGE`. This lets payment confirmations arrive
   instantly instead of relying only on the polling fallback described below.
4. Switch to live keys and `INTASEND_TEST_MODE="false"` when you're ready to go live.

Note: even without the webhook configured, checkout still works — the order confirmation page
actively polls IntaSend for the payment status every few seconds as a fallback. The webhook just
makes that update instant and removes the polling delay.

**Card payments**: the quote mentioned "M-Pesa/online payment integration" — this build wired up
M-Pesa (the main request) and cash on delivery. IntaSend also supports card payments through a
separate hosted checkout-link API; the payment code in `src/lib/intasend.ts` is written so that's a
follow-up addition rather than a rebuild, once there's a concrete need for it.

## Admin dashboard

`/admin` — products (with optional variants like size/color), categories, orders, discount codes,
and a reports page (sales chart, top products, low stock alerts). Access requires a user with
`role = "admin"` in the `users` table (the seed script creates one).

## Deploying

This is a standard Next.js app, so any Node-capable host works. Two common paths:

- **A VPS** (DigitalOcean, Linode, a local Kenyan provider, etc.): install Node 20+, PostgreSQL,
  run `npm run build && npm run start` behind Nginx (for TLS and the domain), and use `pm2` or a
  systemd service to keep it running. This matches the "hosting + domain, KSh 4,000/month
  maintenance" model from the quote.
- **A managed platform** (Vercel, Railway, Render, etc.) with a managed Postgres add-on: push the
  repo, set the environment variables above, and it builds and deploys automatically. Usually
  faster to get running but has its own monthly cost on top of what's quoted.

Either way, before going live:

- [ ] Change the seeded admin password (or delete that account and create a new admin user)
- [ ] Set a strong random `AUTH_SECRET`
- [ ] Point `NEXTAUTH_URL` at the real domain
- [ ] Switch IntaSend to live keys and register the production webhook
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` and verify the domain in Google Search Console (submit
      `/sitemap.xml`, which is generated automatically from live products and categories)
- [ ] Replace the placeholder demo products/images with the real catalogue
- [ ] Move uploaded images off local disk (e.g. to S3/Cloudinary) if you deploy across multiple
      servers or containers, since local uploads only persist on a single machine's disk

## Project structure

```
src/
  app/              storefront pages, admin pages, API routes (App Router)
  server/           Server Actions (cart, checkout, admin CRUD) — the app's "backend"
  lib/               shared logic: auth, cart, inventory, discounts, IntaSend client
  db/                Drizzle schema and client
  components/        UI components (storefront/, admin/, ui/)
scripts/
  seed.ts            demo wellness categories and products
  gen_placeholders.py  generates placeholder product images (Python + PIL)
  smoke-test.mjs      end-to-end Playwright check (storefront + admin flow)
  smoke-test-mpesa.mjs  checks the M-Pesa checkout path degrades gracefully
```

## Known limitations / good next steps

- No automated test suite beyond the two Playwright smoke scripts in `scripts/` — worth building
  out further as the catalogue and admin flows grow.
- Auth endpoints (`/api/auth/login`, `/register`) have no rate limiting yet — worth adding before
  a public launch to blunt brute-force attempts.
- Search is a simple `ILIKE` match on name/description — fine for a catalogue of a few hundred
  products; consider Postgres full-text search or a hosted search service if it grows much larger.
- Shipping is currently a flat KSh 300 fee (free above KSh 10,000), set in
  `src/server/checkout-actions.ts` — replace with real rate logic (by county, weight, courier
  API) when that's defined.
