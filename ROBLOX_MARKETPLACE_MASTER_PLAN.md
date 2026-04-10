# 🎮 RobloxMarket — Master Build Plan
> **For Cursor Agent** — Read this top to bottom before writing a single line of code. Every section is intentional. Follow the hierarchy strictly.

---

## 0. PROJECT OVERVIEW

**Project Name:** RobloxMarket (working title — can be customized)
**Purpose:** A peer-to-peer marketplace for buying and selling virtual Roblox in-game items across multiple Roblox games, with zero platform fees beyond a small seller commission. Replaces eBay for this niche.
**Target User:** Roblox players ages 13–25, sellers who farm items, and collectors looking for rare drops.
**Revenue Model:** Seller pays a flat 5–8% commission per sale (no buyer fee, no listing fee). Optional seller "Pro" subscription ($4.99/mo) for boosted listings and lower commission (3%).
**Tech Stack:**
- Frontend: Next.js 14 (App Router)
- Styling: Tailwind CSS + custom CSS variables
- Backend: Next.js API Routes + Prisma ORM
- Database: PostgreSQL (via Supabase or PlanetScale)
- Auth: NextAuth.js (Discord OAuth + Email/Password)
- Payments: Stripe (for USD transactions) + Robux honor system (manual delivery)
- File Storage: Cloudinary (item images)
- Search: Algolia (or MeiliSearch self-hosted)
- Deployment: Vercel

---

## 1. DESIGN SYSTEM

### 1.1 Aesthetic Direction
**Theme:** Dark gaming marketplace — NOT generic purple gradient AI slop. Think: deep space black with electric neon green accents, like a terminal crossed with a high-end sneaker marketplace.

**Mood:** Premium, trustworthy, fast, gamer-native. Users should feel like they're on a legitimate professional platform, not a sketchy forum.

### 1.2 Color Palette (CSS Variables)
```css
:root {
  --bg-base:        #0a0a0f;   /* near-black with blue undertone */
  --bg-surface:     #111118;   /* card/panel backgrounds */
  --bg-elevated:    #1a1a24;   /* modals, dropdowns */
  --border:         #2a2a38;   /* subtle borders */
  --border-accent:  #3d3d55;   /* hover/focus borders */

  --brand:          #00e5a0;   /* electric teal-green — primary brand */
  --brand-dim:      #00b87d;   /* hover state of brand */
  --brand-glow:     rgba(0,229,160,0.15); /* glow shadow */

  --accent-gold:    #f5c542;   /* "rare" item badge, Pro seller */
  --accent-red:     #ff4d6d;   /* destructive, out of stock */
  --accent-blue:    #4d9fff;   /* info, Roblox-linked badge */

  --text-primary:   #f0f0f5;
  --text-secondary: #9090a8;
  --text-muted:     #55556a;

  --radius-sm:      6px;
  --radius-md:      12px;
  --radius-lg:      20px;
  --radius-pill:    999px;
}
```

### 1.3 Typography
```
Display / Headings:  "Syne" (Google Fonts) — geometric, modern, strong
Body / UI:           "DM Sans" (Google Fonts) — clean, legible
Monospace / Prices:  "JetBrains Mono" — used for prices, IDs, order numbers
```

Import in `app/layout.tsx`:
```tsx
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
```

### 1.4 Component Design Rules
- All cards: `bg-surface`, `border border-[--border]`, `rounded-[--radius-md]`, subtle `box-shadow: 0 2px 20px rgba(0,0,0,0.4)`
- On hover: border transitions to `--border-accent`, card lifts with `translateY(-2px)` + brand glow shadow
- Buttons (primary): `--brand` background, black text, `font-weight: 700`, pill shape
- Buttons (secondary): transparent, `--brand` border + text
- Buttons (danger): `--accent-red` background
- All inputs: `bg-elevated`, `border border-[--border]`, focus ring `--brand`
- Badge pill style for game names, rarities, categories
- No pure white backgrounds anywhere — everything lives on the dark base

### 1.5 Motion & Animations
- Page transitions: fade + slight upward slide (150ms ease-out)
- Card hover: `transition: all 200ms ease`
- Loading skeletons: animated shimmer using `@keyframes shimmer`
- Modals: scale from 0.95 → 1.0 + fade in (120ms)
- Toast notifications: slide in from top-right
- Number counters on stats: count-up animation on mount

---

## 2. SITE ARCHITECTURE & PAGE HIERARCHY

```
/                          → Homepage (Hero + Featured + Game Grid)
/browse                    → All Listings (filterable, sortable)
/browse/[game]             → Game-specific listing page
/item/[id]                 → Single Item Detail Page
/sell                      → Seller Dashboard hub (protected)
/sell/new                  → Create New Listing (protected)
/sell/listings             → Manage My Listings (protected)
/sell/orders               → My Sales / Order History (protected)
/orders                    → Buyer Order History (protected)
/orders/[id]               → Order Detail + Delivery Chat
/profile/[username]        → Public Seller Profile
/auth/login                → Login page
/auth/register             → Register page
/admin                     → Admin Panel (role-gated)
/admin/users               → User management
/admin/listings            → Listing moderation
/admin/reports             → Reports queue
/admin/payouts             → Payout management
/legal/terms               → Terms of Service
/legal/privacy             → Privacy Policy
/legal/refund              → Refund Policy
```

---

## 3. DATABASE SCHEMA (Prisma)

```prisma
// schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String?
  discordId     String?   @unique
  robloxId      String?
  avatarUrl     String?
  bio           String?
  role          Role      @default(BUYER)
  isPro         Boolean   @default(false)
  proExpiresAt  DateTime?
  commissionRate Float    @default(0.07) // 7% default, 3% for Pro
  balance       Float     @default(0)    // pending payout balance
  createdAt     DateTime  @default(now())
  listings      Listing[]
  orders        Order[]   @relation("BuyerOrders")
  sales         Order[]   @relation("SellerOrders")
  reviews       Review[]  @relation("ReviewsGiven")
  receivedReviews Review[] @relation("ReviewsReceived")
  reports       Report[]
}

enum Role {
  BUYER
  SELLER
  ADMIN
}

model Game {
  id          String    @id @default(cuid())
  name        String    @unique   // e.g. "Bee Swarm Simulator"
  slug        String    @unique   // e.g. "bee-swarm-simulator"
  coverUrl    String
  iconUrl     String
  description String?
  isActive    Boolean   @default(true)
  listings    Listing[]
  categories  Category[]
  createdAt   DateTime  @default(now())
}

model Category {
  id        String    @id @default(cuid())
  name      String    // e.g. "Eggs", "Weapons", "Pets", "Currency"
  slug      String
  gameId    String
  game      Game      @relation(fields: [gameId], references: [id])
  listings  Listing[]
  @@unique([slug, gameId])
}

model Listing {
  id            String        @id @default(cuid())
  title         String
  description   String
  price         Float         // USD
  quantity      Int           @default(1)
  quantitySold  Int           @default(0)
  rarity        Rarity        @default(COMMON)
  images        String[]      // Cloudinary URLs
  gameId        String
  game          Game          @relation(fields: [gameId], references: [id])
  categoryId    String
  category      Category      @relation(fields: [categoryId], references: [id])
  sellerId      String
  seller        User          @relation(fields: [sellerId], references: [id])
  status        ListingStatus @default(ACTIVE)
  isBoosted     Boolean       @default(false)
  boostExpiresAt DateTime?
  deliveryMethod String       // "manual", "auto_code", "in_game_trade"
  deliveryInstructions String? // shown after purchase
  tags          String[]
  viewCount     Int           @default(0)
  orders        Order[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum Rarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
  MYTHIC
}

enum ListingStatus {
  ACTIVE
  PAUSED
  SOLD_OUT
  REMOVED
  PENDING_REVIEW
}

model Order {
  id              String      @id @default(cuid())
  listingId       String
  listing         Listing     @relation(fields: [listingId], references: [id])
  buyerId         String
  buyer           User        @relation("BuyerOrders", fields: [buyerId], references: [id])
  sellerId        String
  seller          User        @relation("SellerOrders", fields: [sellerId], references: [id])
  quantity        Int         @default(1)
  totalPrice      Float
  commission      Float
  sellerEarnings  Float
  status          OrderStatus @default(PENDING_PAYMENT)
  stripePaymentId String?
  deliveredAt     DateTime?
  completedAt     DateTime?
  notes           String?
  messages        Message[]
  review          Review?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  DELIVERING
  DELIVERED
  COMPLETED
  DISPUTED
  REFUNDED
  CANCELLED
}

model Message {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  senderId  String
  content   String
  createdAt DateTime @default(now())
}

model Review {
  id         String   @id @default(cuid())
  orderId    String   @unique
  order      Order    @relation(fields: [orderId], references: [id])
  reviewerId String
  reviewer   User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  sellerId   String
  seller     User     @relation("ReviewsReceived", fields: [sellerId], references: [id])
  rating     Int      // 1–5
  comment    String?
  createdAt  DateTime @default(now())
}

model Report {
  id         String       @id @default(cuid())
  reporterId String
  reporter   User         @relation(fields: [reporterId], references: [id])
  targetType String       // "listing" | "user" | "order"
  targetId   String
  reason     String
  details    String?
  status     ReportStatus @default(OPEN)
  createdAt  DateTime     @default(now())
}

enum ReportStatus {
  OPEN
  REVIEWING
  RESOLVED
  DISMISSED
}

model Payout {
  id        String       @id @default(cuid())
  userId    String
  amount    Float
  method    String       // "paypal" | "cashapp" | "crypto"
  address   String
  status    PayoutStatus @default(PENDING)
  processedAt DateTime?
  createdAt DateTime     @default(now())
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 4. PAGE-BY-PAGE SPECIFICATIONS

---

### 4.1 HOMEPAGE `/`

**Layout:** Full-width, no sidebar.

**Sections (top to bottom):**

#### Section A — Hero
- Full-width section, min-height 80vh
- Background: dark base with a subtle animated noise texture overlay + faint grid pattern
- Left side (60%): 
  - Eyebrow tag: `"The #1 Roblox Item Marketplace"` in brand color, small caps
  - H1: `"Buy & Sell Roblox Items — No eBay Fees"` — large Syne font, ~72px
  - Subtext: `"Instant listings. Secure checkout. Keep more of what you earn."` — DM Sans, muted color
  - CTA buttons row: `[Browse Items]` (primary) + `[Start Selling]` (secondary)
  - Trust strip below CTAs: small icons + text — "🔒 Secure Payments · ⭐ Verified Sellers · 💸 Low 5% Fee"
- Right side (40%): 
  - Floating card mockup of a sample listing (animated, slight float animation)
  - Decorative glowing orb behind it in brand color at 10% opacity

#### Section B — Stats Bar
- Full-width dark strip (bg-elevated)
- 4 stats in a row: `Total Listings`, `Active Sellers`, `Games Supported`, `Items Sold`
- Each stat: large JetBrains Mono number (count-up animation), small DM Sans label below
- Subtle left/right separator lines between stats

#### Section C — Featured Listings
- Section title: `"🔥 Hot Right Now"`
- Horizontal scrolling row of 8–10 ListingCards on mobile, 4-column grid on desktop
- "View All →" link on the right of the title

#### Section D — Browse by Game
- Section title: `"Shop by Game"`
- Grid of GameCards: 3 columns desktop, 2 tablet, 1 mobile
- Each GameCard: full-bleed cover image, dark gradient overlay, game name, listing count badge
- Clicking navigates to `/browse/[game]`

#### Section E — How It Works (for sellers)
- 3-step horizontal layout with icons:
  1. `List Your Items` — create a listing in 60 seconds
  2. `Buyer Pays Securely` — Stripe-protected checkout
  3. `Deliver & Get Paid` — mark delivered, funds released
- Clean card design, brand-colored step numbers

#### Section F — Seller CTA Banner
- Wide banner: dark with brand border glow
- Headline: `"Tired of eBay's 13% fees?"` 
- Subline: `"We charge just 5%. List for free. Keep more."`
- Button: `[Start Selling Today]`

#### Section G — Recent Reviews
- 3 review cards in a row, randomly selected from `Review` table, rating ≥ 4
- Each: avatar, username, stars, comment excerpt, item bought

#### Footer
- 3-column layout: Logo + tagline | Navigation links | Legal links
- Social icons: Discord, Twitter/X
- Copyright line

---

### 4.2 BROWSE PAGE `/browse`

**Layout:** Left sidebar (filters) + main content area

**Left Sidebar (sticky, 260px wide desktop, collapsible on mobile):**
- Search input (debounced, syncs to URL params)
- Filter: Game (checkbox list, shows game icon)
- Filter: Category (dynamic based on selected games)
- Filter: Rarity (checkbox: Common → Mythic, each with colored dot)
- Filter: Price Range (dual-handle slider, min/max inputs)
- Filter: Delivery Method (checkbox: Manual, Auto Code, In-Game Trade)
- Filter: Seller Type (All, Verified, Pro Sellers)
- `[Clear All Filters]` button at bottom

**Main Content:**
- Top bar: Result count + Sort dropdown (`Newest · Price: Low–High · Price: High–Low · Most Popular · Ending Soon`)
- View toggle: Grid view (default) / List view
- **Grid View:** 4 columns desktop, 2 tablet, 1 mobile — ListingCards
- **List View:** Full-width rows with thumbnail left, details right, price far right
- Pagination (or infinite scroll — prefer pagination for SEO)

**ListingCard Component:**
```
┌─────────────────────────┐
│  [Game Badge] [Rarity]  │
│                         │
│   [Item Image 1:1]      │
│                         │
│  Item Title             │
│  Seller ⭐ 4.9 (128)    │
│                         │
│  $4.99    [Buy Now]     │
│  x3 available           │
└─────────────────────────┘
```
- Rarity badge color-coded: Common=gray, Uncommon=green, Rare=blue, Epic=purple, Legendary=gold, Mythic=red+glow
- "🔥 Hot" badge if viewCount > 500 in last 24h
- "⚡ Fast Delivery" badge if seller avg delivery < 1hr
- Boosted listings get a subtle brand-colored glow border

---

### 4.3 GAME PAGE `/browse/[game]`

Same layout as `/browse` but:
- Hero banner at top with game's cover image (blurred + darkened), game name, category pills, listing count
- Sidebar filter pre-filtered to that game
- Categories shown as horizontal pill tabs below hero

---

### 4.4 ITEM DETAIL PAGE `/item/[id]`

**Layout:** Two-column (60/40 split), full-width below

**Left Column:**
- Image gallery: main image large, thumbnails below (clickable, keyboard navigable)
- Below gallery: item description (rendered markdown)
- Seller Reviews section (paginated, sortable)

**Right Column (sticky on scroll):**
- Game badge + Category badge
- Rarity badge (colored)
- Item title (H1, Syne font)
- Price (large, JetBrains Mono, brand color)
- Quantity selector (if quantity > 1)
- Stock indicator: "3 available" or "Only 1 left!" (red if ≤ 2)
- Delivery method indicator with icon + estimated time
- `[Buy Now — $X.XX]` button (full width, large, primary)
- Trust badges row: 🔒 Secure · ✅ Verified Item · 🔄 Refund Policy
- Divider
- Seller card:
  - Avatar + username
  - Star rating + review count
  - "Pro Seller" badge if applicable
  - Member since date
  - Response time avg
  - `[View Profile]` button
- Divider
- Item tags (pill tags)
- Report listing link (small, muted)

**Below fold:**
- "More from this seller" — horizontal scroll of their other listings
- "Similar items" — related listings from same game/category

---

### 4.5 CHECKOUT FLOW

**Step 1 — Cart Review (modal or dedicated page `/checkout`):**
- Item summary, quantity, subtotal
- Promo code input (optional feature)
- Order total breakdown: Subtotal + Platform fee (buyer side = $0) = Total

**Step 2 — Payment (Stripe Elements embedded):**
- Card number input (Stripe Elements, themed dark)
- PayPal option (Stripe PayPal gateway)
- Order summary in sidebar
- "By purchasing you agree to our Terms" disclaimer

**Step 3 — Confirmation:**
- Order ID (JetBrains Mono)
- "Your seller has been notified and will deliver your item."
- Link to `/orders/[id]` to track and communicate
- Confetti animation on success ✨

---

### 4.6 ORDER DETAIL PAGE `/orders/[id]`

**Layout:** Single column, max-width 760px, centered

**Sections:**
1. Order status stepper (horizontal): `Paid → Delivering → Delivered → Complete`
   - Current step highlighted in brand color
2. Item summary card
3. Delivery Instructions box (revealed after payment, shown to buyer only)
4. In-order messaging thread:
   - Buyer ↔ Seller chat (polling or SSE for live updates)
   - Message input at bottom
5. Action buttons:
   - Seller sees: `[Mark as Delivered]` when status = PAID
   - Buyer sees: `[Confirm Receipt]` when status = DELIVERING → triggers completion + payout
   - Either sees: `[Open Dispute]` button
6. Review section (shown after COMPLETED, if no review yet)

---

### 4.7 SELLER DASHBOARD `/sell`

**Layout:** Left nav sidebar (icons + labels) + main area

**Sidebar nav items:**
- Overview
- My Listings
- Create Listing
- Orders
- Earnings
- Settings

#### /sell (Overview)
- Stats cards row: Active Listings · Pending Orders · Total Earned · This Month Earned
- Chart: Earnings over last 30 days (line chart, Recharts)
- Recent orders table (last 5)
- Quick actions: `[+ New Listing]` `[View All Orders]`

#### /sell/listings
- Table with columns: Image | Title | Game | Price | Stock | Status | Views | Actions
- Actions per row: Edit · Pause/Resume · Delete
- Bulk actions: Pause selected · Delete selected
- "New Listing" button top-right
- Filter tabs: All · Active · Paused · Sold Out

#### /sell/new (Create Listing Form)
Form fields in order:
1. Select Game (searchable dropdown with game icons)
2. Select Category (updates based on game)
3. Item Title
4. Description (markdown editor — use `@uiw/react-md-editor`)
5. Rarity (select with colored preview)
6. Price (USD, number input, shows commission estimate in real-time: "You'll receive: $X.XX")
7. Quantity available
8. Images (drag-and-drop upload, max 5, Cloudinary upload)
9. Delivery Method (radio: Manual / Auto Code / In-Game Trade)
10. Delivery Instructions (textarea, shown to buyer after purchase — keep secret from listing page)
11. Tags (comma-separated or tag input component)
12. Preview button → shows ListingCard preview in sidebar

Validation: All required fields, price must be > $0.50, at least 1 image required.

#### /sell/orders
- Table: Order ID | Item | Buyer | Date | Amount | Status | Actions
- Status filter tabs: All · Pending · Delivering · Disputes
- Click row → `/orders/[id]`

#### Earnings `/sell/earnings`
- Total balance (pending payout)
- Lifetime earned
- Earnings chart (30/60/90 day toggle)
- Payout history table
- `[Request Payout]` button → opens modal:
  - Select method: PayPal / CashApp / Crypto
  - Enter address/handle
  - Enter amount (min $10)
  - Confirm → creates Payout record, admin processes manually

---

### 4.8 SELLER PROFILE `/profile/[username]`

**Layout:** Full-width hero + content below

**Hero:**
- Banner image (default gradient, seller can upload)
- Avatar (overlapping banner bottom)
- Username + Pro badge
- Star rating + review count + member since
- `[Follow]` button (stretch feature)
- Quick stats: X Listings · X Sales · X% Positive Reviews

**Tabs below hero:**
1. **Listings** — grid of their active listings (same ListingCard)
2. **Reviews** — all reviews received, sorted by newest
3. **About** — seller bio

---

### 4.9 AUTH PAGES

#### `/auth/login`
- Centered card, max-width 420px
- Logo at top
- "Sign in with Discord" button (brand, Discord purple)
- Divider "or"
- Email + Password inputs
- `[Sign In]` button
- "Forgot password?" link
- "Don't have an account? Register →"

#### `/auth/register`
- Same card style
- Fields: Email, Username, Password, Confirm Password
- "Sign up with Discord" option
- Terms checkbox: "I agree to the Terms of Service and am 13 or older"
- `[Create Account]` button
- "Already have an account? Sign in →"

---

### 4.10 ADMIN PANEL `/admin`

Role-gated: `role === 'ADMIN'` only, redirect otherwise.

**Sidebar nav:** Dashboard · Users · Listings · Reports · Payouts · Games/Categories

**Admin Dashboard:**
- Platform stats: Total users, total listings, GMV (gross merchandise value), revenue (commissions), pending payouts
- Charts: signups over time, revenue over time
- Pending items requiring action (unprocessed payouts, open reports)

**Listings Moderation:**
- Table of all listings, filterable by status
- Quick actions: Approve / Remove / Flag
- Listings in `PENDING_REVIEW` status shown first

**Reports Queue:**
- Table of open reports with reporter, target, reason, date
- Actions: View target · Dismiss · Take action (warn/ban user, remove listing)

**Payouts:**
- Table of pending payouts: user, amount, method, address, date requested
- `[Mark Processed]` button per row
- Bulk processing

**Games & Categories Management:**
- CRUD interface for adding new games (name, slug, cover image, icon)
- CRUD for categories per game

---

## 5. COMPONENT LIBRARY

Build these as reusable components in `/components/`:

```
/components
  /ui
    Button.tsx          (variants: primary, secondary, danger, ghost)
    Input.tsx           (with label, error state, helper text)
    Select.tsx          (custom styled)
    Badge.tsx           (rarity, game, status variants)
    Card.tsx            (base card wrapper)
    Modal.tsx           (portal-based, focus trap)
    Toast.tsx           (top-right, auto-dismiss)
    Skeleton.tsx        (shimmer loading state)
    Avatar.tsx          (with fallback initials)
    StarRating.tsx      (display + interactive)
    Tabs.tsx
    Slider.tsx          (price range)
    ProgressSteps.tsx   (order status stepper)
    Tooltip.tsx
    Spinner.tsx
  /listing
    ListingCard.tsx
    ListingGrid.tsx
    ListingFilters.tsx
    RarityBadge.tsx
  /order
    OrderStatusStepper.tsx
    MessageThread.tsx
    MessageBubble.tsx
  /seller
    SellerCard.tsx
    EarningsChart.tsx
    ListingsTable.tsx
  /layout
    Navbar.tsx
    Footer.tsx
    Sidebar.tsx         (admin + seller)
    PageWrapper.tsx
```

---

## 6. API ROUTES SPECIFICATION

All under `/app/api/`:

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/games                     → list all active games
GET    /api/games/[slug]              → game + categories
POST   /api/games                     → admin only: create game

GET    /api/listings                  → paginated, filterable (query params)
GET    /api/listings/[id]             → single listing detail
POST   /api/listings                  → create (seller auth required)
PATCH  /api/listings/[id]             → update own listing
DELETE /api/listings/[id]             → delete own listing

POST   /api/orders                    → create order + initiate Stripe PaymentIntent
GET    /api/orders/[id]               → get order (buyer or seller only)
PATCH  /api/orders/[id]/status        → update status (deliver, confirm, dispute)
GET    /api/orders/my                 → buyer's orders
GET    /api/orders/sales              → seller's sales

POST   /api/orders/[id]/messages      → send message
GET    /api/orders/[id]/messages      → get messages

POST   /api/reviews                   → submit review (buyer, order must be COMPLETED)
GET    /api/reviews/seller/[userId]   → seller reviews

POST   /api/payouts/request           → seller requests payout
GET    /api/payouts/my                → seller's payout history
PATCH  /api/payouts/[id]/process      → admin marks processed

GET    /api/users/[username]          → public profile
PATCH  /api/users/me                  → update own profile

POST   /api/reports                   → submit report
GET    /api/admin/reports             → admin: all reports
PATCH  /api/admin/reports/[id]        → admin: resolve report

POST   /api/webhooks/stripe           → Stripe webhook (payment confirmed → update order)

GET    /api/search                    → search listings (proxy to Algolia or MeiliSearch)
```

---

## 7. STRIPE INTEGRATION FLOW

1. Buyer clicks "Buy Now" → frontend calls `POST /api/orders` 
2. API creates Order record (status: `PENDING_PAYMENT`), creates Stripe `PaymentIntent`, returns `client_secret`
3. Frontend renders Stripe Elements with `client_secret`
4. Buyer completes payment in-browser (no card data touches your server)
5. Stripe sends webhook to `POST /api/webhooks/stripe`
6. Webhook handler: verify signature → update Order status to `PAID` → notify seller (email/in-app)
7. Seller marks delivered → Order → `DELIVERING`
8. Buyer confirms receipt → Order → `COMPLETED` → `seller.balance += sellerEarnings`
9. Seller requests payout → admin processes → `Payout` marked `COMPLETED`

---

## 8. SECURITY REQUIREMENTS

- All protected routes check session via `getServerSession()` (NextAuth)
- Sellers can only edit/delete their own listings (verify `sellerId === session.user.id`)
- Buyers can only view their own orders (verify `buyerId === session.user.id`)
- Admins: separate role check middleware
- Stripe webhook: verify `stripe.webhooks.constructEvent()` signature — NEVER skip this
- Input sanitization on all text fields (DOMPurify for markdown)
- Rate limiting on auth endpoints: 10 requests/minute per IP (use `upstash/ratelimit`)
- Images: only accept uploads through Cloudinary signed uploads — never store raw user files locally
- Delivery instructions: never expose in GET `/api/listings/[id]` — only after order is PAID

---

## 9. SEO & PERFORMANCE

- All listing pages use Next.js `generateMetadata()` with item title, image, price, game name
- Game browse pages: static metadata templates
- Sitemap: auto-generate via `next-sitemap` for all public listing and game pages
- OpenGraph tags on all pages (title, description, image)
- Image optimization: `next/image` everywhere with proper `sizes` props
- Skeleton loaders for all async data — never show blank screens
- Avoid layout shift: set explicit width/height on all images
- Listing pages: ISR (Incremental Static Regeneration) with 60s revalidation

---

## 10. NOTIFICATION SYSTEM

**In-app notifications** (stored in DB, shown in navbar bell icon):
- New order received (seller)
- Order delivered / marked delivered (buyer)
- Message received on order
- Review left on your listing
- Payout processed
- Listing approved / removed (admin action)

**Email notifications** (via Resend or Nodemailer):
- Order confirmation (buyer)
- New sale alert (seller) with item + buyer + amount
- Delivery confirmation
- Payout processed

Notification table:
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  body      String
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 11. GAMES TO LAUNCH WITH (pre-seed database)

| Game Name | Categories |
|---|---|
| Bee Swarm Simulator | Eggs, Honey, Tickets, Badges, Boosts |
| Adopt Me | Pets, Vehicles, Toys, Strollers, Neons |
| Blox Fruits | Fruits, Accessories, Weapons, Gamepasses |
| Pet Simulator X | Pets, Diamonds, Eggs, Enchants |
| Murder Mystery 2 | Knives, Guns, Godlys, Pets |
| Royale High | Diamonds, Sets, Accessories, Halos |
| Anime Adventures | Units, Gems, Codes |
| King Legacy | Fruits, Items, Beli |

---

## 12. ENVIRONMENT VARIABLES (.env.local)

```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Search (pick one)
ALGOLIA_APP_ID=
ALGOLIA_ADMIN_KEY=
ALGOLIA_SEARCH_KEY=
# OR
MEILISEARCH_URL=
MEILISEARCH_KEY=

# Email
RESEND_API_KEY=

# Rate Limiting (optional, Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 13. BUILD ORDER FOR CURSOR

Follow this exact order to avoid dependency headaches:

1. **Project setup** — `npx create-next-app@latest` with TypeScript + Tailwind + App Router
2. **Database** — Set up Supabase PostgreSQL, configure Prisma, run migrations
3. **Auth** — Install and configure NextAuth.js with credentials + Discord provider
4. **Design system** — Set up CSS variables, import fonts, build base UI components (Button, Input, Card, Badge)
5. **Layout** — Build Navbar, Footer, PageWrapper
6. **Games API + DB seed** — Create games and categories, build `/api/games`, seed the 8 launch games
7. **Listing creation** — Build `/sell/new` form, Cloudinary upload, `POST /api/listings`
8. **Browse pages** — Build `/browse` with filters and ListingCard, then `/browse/[game]`
9. **Item detail page** — Build `/item/[id]`
10. **Stripe checkout** — Integrate Stripe Elements, build `/checkout`, webhook handler
11. **Orders system** — Build order detail page, status stepper, messaging thread
12. **Seller dashboard** — Overview, listings management, orders, earnings
13. **Profile pages** — `/profile/[username]`
14. **Admin panel** — Role-gated, moderation tools
15. **Notifications** — In-app bell + email via Resend
16. **Search** — Integrate Algolia or MeiliSearch, hook up to browse filters
17. **SEO** — `generateMetadata`, sitemap, OpenGraph
18. **Testing & polish** — Error boundaries, loading states, empty states, mobile responsiveness

---

## 14. MOBILE RESPONSIVENESS RULES

- Navbar: hamburger menu on mobile, slides in from left
- Filter sidebar: hidden on mobile, opens as bottom sheet when "Filter" button tapped
- ListingGrid: 2 columns on mobile, 3 on tablet, 4 on desktop
- Item detail: single column stack on mobile (image → buy box → description)
- Seller dashboard sidebar: becomes bottom tab bar on mobile
- All tables: horizontally scrollable on mobile, key columns always visible
- Touch targets: minimum 44px height for all interactive elements

---

## 15. EMPTY STATES & ERROR HANDLING

Every list/grid MUST have an empty state:
- No listings found: illustration + "No items found. Try adjusting your filters."
- No orders: "You haven't bought anything yet. [Browse Items]"
- No sales: "No sales yet. [Create Your First Listing]"
- Search no results: "No results for '[query]'. Try different keywords."
- Error boundary: catch errors gracefully, show "Something went wrong. Try refreshing." with retry button
- 404 page: custom branded, links back to homepage and browse

---

*End of Master Plan — Hand this document to Cursor and instruct it to implement section by section in the build order specified in Section 13.*
