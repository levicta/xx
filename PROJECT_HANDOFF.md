# Project Context Handoff
**Generated:** 2026-04-10T16:12:35-04:00  
**Project Name:** RBLX.MKT - Roblox Marketplace  
**Root Directory:** C:\Users\Glada\OneDrive\Desktop\New folder\roblox-market

## 1. Executive Summary
A peer-to-peer marketplace for buying and selling Roblox virtual items. Users can browse listings across multiple games (Adopt Me, Blox Fruits, Bee Swarm Simulator, etc.), purchase items securely via Stripe, and sellers can list items with delivery options (manual, auto-code, in-game trade). The platform takes a 7% commission on sales.

**Current Phase:** Building/Refactoring  
**Immediate Goal:** Polish the /sell onboarding and marketing pages to match premium marketplace standards

## 2. Technical Architecture
- Framework: Next.js 15.5.15 (App Router)
- React: 19.2.4
- Styling: Tailwind CSS 4.2.2 with custom design tokens (bg-card, text-foreground, border-border/50)
- Database: PostgreSQL via Supabase
- ORM: Prisma 5.22.0
- Auth: NextAuth 5.0.0-beta.30 (with custom credentials adapter)
- Payments: Stripe (Payment Intents API, webhooks)
- Image Upload: Cloudinary (v2 API)

## 3. Project Structure
Full tree structure with key directories - see original for complete tree. Key paths:
- src/app/api/auth/route.ts - NextAuth handler
- src/app/sell/page.tsx - Dashboard OR marketing landing
- src/app/sell/onboarding/page.tsx - 4-step wizard
- src/components/seller/OnboardingWizard.tsx - Wizard component
- src/middleware.ts - Route protection + security headers
- src/lib/auth.ts - NextAuth config with sellerOnboardingComplete in callbacks

## 4. Current Work State
### What We Just Accomplished:
1. Seller Onboarding Flow at /sell/onboarding (4-step wizard)
2. Marketing Landing Page at /sell for non-sellers
3. Route Protection via middleware (only /sell/, not /sell)
4. Added sellerOnboardingComplete to NextAuth session
5. Bug fixes: registration creates BUYER, upload needs auth, removed skip button

### What is IN PROGRESS:
- Polishing the /sell/onboarding page

### Known Issues:
- Payout API missing seller role check
- No rate limiting

## 5. Database Schema
Key User fields: id, email, username, role (BUYER/SELLER/ADMIN), isVerified, verificationLevel, onboardingCompleted, onboardingStep, payoutMethod, payoutAddress

## 6. Code Patterns & Conventions
- File naming: kebab-case
- Styling: Tailwind with tokens
- Text: lowercase throughout
- Type definitions: src/lib/next-auth.d.ts
- Auth: JWT strategy (not database session)

## 7. Environment & Config
Required: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, STRIPE_SECRET_KEY, CLOUDINARY_*

## 8. Next Steps
1. Polish /sell/onboarding
2. Fix Payout API seller role check
3. Test full seller flow

## 9. Decision Log
- Registration creates BUYER (must complete onboarding)
- Middleware doesn't intercept /sell (marketing page handles)
- No skip button (must complete for trust)
- Stripe for payments, PayPal/CashApp for payouts

## 10. Testing/Verification
1. Register new account → role=BUYER
2. /sell → shows marketing landing
3. Click start selling → /sell/onboarding
4. Complete onboarding → role=SELLER
5. /sell → shows dashboard with sidebar