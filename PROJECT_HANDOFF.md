# Project Context Handoff
**Generated:** 2026-04-10T16:53:23-04:00
**Project Name:** RobloxMarket
**Root Directory:** C:\Users\Glada\OneDrive\Desktop\New folder\roblox-market

## 1. Executive Summary
A peer-to-peer marketplace for buying and selling Roblox virtual items. Users can browse items by game, purchase via Stripe, and sellers can manage listings, orders, and request payouts. Currently in active development with v0 design integration completed.

## 2. Technical Architecture
- **Framework:** Next.js 15.5.15 (App Router)
- **Language:** TypeScript
- **Router Type:** App Router (Next.js 15)
- **Styling:** Tailwind CSS 4.2.2 (oklch color space, CSS variables in globals.css)
- **State Management:** React Query not used; relies on Server Components + client-side hooks
- **Database/ORM:** Prisma 5.22.0 with PostgreSQL (Supabase)
- **Auth:** NextAuth 5.x (beta) with Discord OAuth + credentials login
- **Payments:** Stripe (PaymentIntents + webhooks)
- **Key Dependencies:**
  - `next-auth@^5.0.0-beta.30` - Authentication
  - `@prisma/client@5.22.0` - Database ORM
  - `stripe@^22.0.0` - Payments
  - `cloudinary@^2.9.0` - Image uploads
  - `resend@^6.10.0` - Email
  - `lucide-react@^1.8.0` - Icons
  - `@radix-ui/react-*` - UI primitives (Avatar, Slot)

## 3. Project Structure
```
roblox-market/
├── prisma/
│   ├── schema.prisma          # Database models (User, Listing, Order, Review, Game, etc.)
│   ├── seed.ts               # Seed 8 games + categories
│   └── migrations/           # Prisma migrations
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes (REST endpoints)
│   │   │   ├── admin/        # Admin endpoints (/stats, /users, /listings, /reports, /payouts)
│   │   │   ├── auth/         # Auth (/login, /register, /me, [...nextauth])
│   │   │   ├── games/        # Games CRUD
│   │   │   ├── listings/     # Listings CRUD + /toggle, /delete
│   │   │   ├── orders/       # Orders CRUD + /status, /messages
│   │   │   ├── payouts/      # Payout requests
│   │   │   ├── reviews/      # Seller reviews
│   │   │   ├── notifications/# Polling endpoint (30s interval)
│   │   │   ├── upload/       # Cloudinary upload
│   │   │   └── webhooks/stripe/
│   │   ├── auth/             # /login, /register pages
│   │   ├── browse/          # /browse, /browse/[game] with filters
│   │   ├── item/[id]/       # Item detail page
│   │   ├── checkout/        # Stripe checkout page
│   │   ├── orders/[id]/     # Order detail with messaging
│   │   ├── profile/[username]/ # Public seller profile
│   │   ├── sell/            # Seller dashboard (overview, new listing, listings, orders, earnings)
│   │   ├── admin/           # Admin panel (dashboard, users, listings, reports, payouts)
│   │   ├── layout.tsx       # Root layout with Navbar/Footer
│   │   ├── page.tsx         # Homepage (games grid, search, stats)
│   │   ├── globals.css      # Tailwind v4 + design tokens
│   │   ├── not-found.tsx    # Custom 404
│   │   └── global-error.tsx  # Error boundary
│   ├── components/
│   │   ├── ui/              # shadcn/ui-style components (Button, Input, Card, Modal, etc.)
│   │   ├── layout/          # Navbar, Footer, PageWrapper
│   │   ├── listing/         # ListingCard, ListingGrid, BrowseContent, ImageGallery
│   │   ├── order/           # OrderStatusStepper, MessageThread, OrderActions
│   │   ├── seller/          # SellerSidebar, ListingsTable, OnboardingWizard
│   │   ├── admin/           # AdminSidebar
│   │   ├── notifications/   # NotificationBell
│   │   └── checkout/        # CheckoutForm
│   └── lib/
│       ├── prisma.ts        # Prisma client singleton
│       ├── auth.ts          # NextAuth configuration
│       ├── email.ts         # Resend email functions
│       ├── utils.ts         # cn() helper for classnames
│       └── recentlyViewed.ts # localStorage recently viewed (max 8)
├── public/                  # Static assets
├── next.config.ts          # Next.js config (distDir: ".next")
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

## 4. Current Work State (CRITICAL)

### What we just accomplished:
- Created GitHub repository at https://github.com/levicta/xx
- Pushed full project (116 files) including all source code, configs, and database schema

### What was IN PROGRESS before handoff:
- v0 Design Integration across sell dashboard, browse, and profile pages
- Unified shadcn/ui-style design system using Tailwind tokens

### Known Blockers/Issues:
1. **OneDrive build issue**: Project in OneDrive folder causes `.next` build issues. Delete `.next` folder before building.
2. **Build warnings**: Intermittent "Cannot find module" errors for API routes during build - retry usually works.
3. **Middleware file**: Named `proxy.ts` instead of `middleware.ts` due to Next.js 16 convention change (project uses Next.js 15.5.15).

## 6. Code Patterns & Conventions
- **File naming:** camelCase for files (e.g., `listingCard.tsx`, `recentlyViewed.ts`)
- **Component exports:** Default exports for pages, named exports for components
- **Data fetching:** Mix of Server Components (async) and Client Components (`"use client"`)
- **TypeScript:** Strict mode enabled; types in `src/lib/next-auth.d.ts`
- **Tailwind classes:** Use design tokens (`bg-card`, `text-foreground`, `border-border`)
- **API routes:** RESTful with dynamic segments (`[id]`, `[slug]`)

## 7. Environment & Config
**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth secret
- `NEXTAUTH_URL` - App URL (http://localhost:3000)
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` - OAuth
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PUBLISHABLE_KEY`
- `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `CLOUDINARY_CLOUD_NAME`
- `RESEND_API_KEY`

**Commands:**
- `npm run dev` - Development server
- `npm run build` - Build with `--no-lint` flag
- `npm run start` - Production server

**Config notes:**
- `next.config.ts`: `distDir: ".next"` (relative path for OneDrive)
- Tailwind v4: Uses `@import 'tailwindcss'` in globals.css (no tailwind.config.ts)

## 8. Next Steps (Prioritized)
1. Verify build works locally: `rm -rf .next && npm run build`
2. Test authentication flow (Discord OAuth + credentials)
3. Complete Stripe webhook handling for order fulfillment
4. Deploy to Vercel (recommended for Next.js)

## 9. Decision Log
- **Prisma downgrade**: v7.x had breaking changes, pinned to 5.22.0
- **Middleware naming**: Named `proxy.ts` instead of `middleware.ts` for Next.js 16 compatibility
- **Tailwind v4**: Using `@import 'tailwindcss'` with oklch colors in globals.css
- **Build optimization**: Using `--no-lint` flag to skip linting during build

## 10. Testing/Verification Checklist
- [ ] Homepage loads at http://localhost:3000 with game grid
- [ ] Authentication flow works (login/register pages)
- [ ] Browse page shows listings with filters
- [ ] Seller dashboard accessible at /sell
- [ ] Admin panel accessible at /admin
- [ ] Database seeded with 8 games (run `npx prisma db seed`)
- [ ] Cloudinary upload works for new listings
- [ ] Stripe checkout form renders
- [ ] No console errors on main pages