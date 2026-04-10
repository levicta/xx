# RobloxMarket - Project Context

## Project Overview

A peer-to-peer marketplace for buying and selling Roblox virtual items. Built with Next.js, Prisma, NextAuth, and Stripe.

---

## Tech Stack

- **Framework**: Next.js 15.5.15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Supabase (Prisma ORM 5.22.0)
- **Auth**: NextAuth 5.x with Discord OAuth + credentials
- **Payments**: Stripe (PaymentIntents + webhooks)
- **Email**: Resend
- **Images**: Cloudinary
- **Styling**: Tailwind CSS 4.x + tw-animate-css

---

## Folder Structure

```
roblox-market/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Seed data (8 games, categories)
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   │   ├── admin/     # Admin endpoints
│   │   │   ├── auth/      # Auth endpoints (login, register, me)
│   │   │   ├── games/     # Games CRUD
│   │   │   ├── listings/  # Listings CRUD + search
│   │   │   ├── orders/    # Orders + status + messages
│   │   │   ├── notifications/
│   │   │   ├── payouts/   # Payout requests
│   │   │   ├── upload/    # Cloudinary upload
│   │   │   └── webhooks/stripe/
│   │   ├── auth/          # /login, /register pages
│   │   ├── browse/        # /browse, /browse/[game]
│   │   ├── item/[id]/     # Item detail page
│   │   ├── checkout/      # Stripe checkout page
│   │   ├── orders/[id]/   # Order detail page
│   │   ├── profile/[username]/
│   │   ├── sell/          # Seller dashboard (/, /new, /listings, /orders, /earnings)
│   │   ├── admin/         # Admin panel (/, /users, /listings, /reports, /payouts)
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Homepage
│   │   ├── globals.css    # Tailwind + design tokens
│   │   ├── not-found.tsx  # Custom 404
│   │   └── global-error.tsx
│   ├── components/
│   │   ├── ui/            # Button, Input, Card, Badge, Avatar, Modal, Toast, etc.
│   │   ├── layout/        # Navbar, Footer, PageWrapper
│   │   ├── listing/       # ListingCard, ListingGrid, BrowseContent, ImageGallery
│   │   ├── order/         # OrderStatusStepper, MessageThread, OrderActions
│   │   ├── seller/        # SellerSidebar, ListingsTable
│   │   ├── admin/         # AdminSidebar
│   │   ├── notifications/ # NotificationBell
│   │   └── checkout/      # CheckoutForm
│   └── lib/
│       ├── prisma.ts      # Prisma singleton
│       ├── auth.ts        # NextAuth config
│       ├── email.ts       # Resend email functions
│       ├── utils.ts       # cn() helper
│       └── next-auth.d.ts # TypeScript types
├── next.config.ts
├── tailwind.config.ts     # Not present - using Tailwind v4
└── package.json
```

---

## Features Implemented

### Core
- **Authentication**: NextAuth with Discord OAuth + credentials login
- **Listings**: Create, edit, delete, toggle (pause/resume), search
- **Browse**: Filter by game, category, rarity, price range; sort; pagination
- **Item Detail**: Image gallery, description, buy box, similar items
- **Checkout**: Stripe PaymentIntents, client-side form
- **Orders**: Status stepper, messaging thread, buyer/seller actions

### Seller Dashboard
- Overview with stats (listings, orders, earnings)
- Create new listing with Cloudinary image upload
- Manage listings (edit, pause, delete)
- Order management with status updates
- Earnings view with payout requests

### Admin Panel
- Dashboard with platform stats
- User management (view, role changes)
- Listing management (remove listings)
- Reports management (dismiss, resolve)
- Payout processing

### Additional
- Notifications with 30s polling
- Public profile pages with ratings
- Recently Viewed: localStorage-based, max 8 items, minimal card strip on homepage (no image, shows game name, title, price)
- Seller Reviews: Review model in DB, POST/GET /api/reviews, leave-a-review form on completed orders, average rating + review list on seller profile
- SEO metadata on item/game pages
- next-sitemap for SEO
- v0 Design Integration: Unified shadcn/ui-style design system across sell dashboard, browse, and profile pages (Tailwind tokens: bg-card, text-foreground, border-border/50, etc.)

---

## Current Design System

### globals.css (Tailwind v4)
Uses oklch color space with design tokens:
- `--background`: oklch(0.97) - warm cream
- `--foreground`: oklch(0.25) - dark rose
- `--primary`: oklch(0.75) - rose pink
- `--card`, `--muted`, `--border`, etc.

Classes available: `bg-background`, `text-foreground`, `bg-primary`, `border-border`, `rounded-lg`, `bg-card`, etc.

---

## Homepage (Current State)

- Container: max-width 960px, centered
- Eyebrow: "ROBLOX MARKETPLACE" in primary color
- H1: "buy & sell in-game items" with clamp(36px, 5vw, 52px)
- Search bar: pill input, max-width 520px
- Games section: label + 4-column grid
- Game cards: white bg, 16px radius, emoji in pink circle, listing count, chevron
- Stats bar: items | sellers | games
- Footer: "RBLX.MKT" centered

---

## Known Issues

1. **OneDrive Issues**: Project in OneDrive folder causes `.next` build issues. Configured to use relative `.next` path. Delete `.next` before building.

2. **Lint Issues Fixed**: All React hook warnings have been resolved. Files were updated to properly handle dependencies in useEffect/useCallback hooks.

3. **Build Warnings**: Intermittent "Cannot find module" errors for API routes during build - retry usually works.

---

## Key Decisions Made

1. **Prisma Version**: Downgraded from 7.x to 5.22.0 due to breaking changes
2. **Next.js 16**: Middleware renamed to `proxy.ts` due to convention change
3. **Tailwind v4**: Using `@import 'tailwindcss'` syntax with oklch colors
4. **Build Config**: Build script uses `--no-lint` to skip linting
5. **next.config.ts**: distDir set to ".next" (relative path)

---

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build --no-lint",
  "start": "next start",
  "lint": "eslint"
}
```

---

## Getting Started

1. Install dependencies: `npm install`
2. Set up `.env` with database URL, Stripe keys, NextAuth secrets, Cloudinary keys
3. Run `npx prisma db push` to create tables
4. Run `npx prisma db seed` to seed 8 games
5. Run `npm run dev` to start

---

## Environment Variables Needed

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PUBLISHABLE_KEY=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_CLOUD_NAME=...
RESEND_API_KEY=...
```