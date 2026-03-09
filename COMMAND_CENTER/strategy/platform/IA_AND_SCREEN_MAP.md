# INFORMATION ARCHITECTURE & SCREEN MAP
**The PRO Edit — Brand Discovery & Activation Platform**
*Version 1.0 | February 2026 | Principal Product Design + Architecture Review*

---

## Overview

This document defines the full information architecture (IA) for each actor type. It covers the primary navigation model, every screen, its hierarchy within the IA, and the critical "money moments" — interactions that directly drive paid conversion, purchase, or brand monetization.

**Design philosophy:** Navigation should reflect the user's mental model, not our database schema. Business users think in outcomes ("my revenue," "my gaps," "my plan"), not in entities ("protocols," "SKU catalog"). The IA must mirror intent.

---

## Part 1 — Business Portal IA
*Roles: `business_owner`, `business_manager`*

### Navigation Model
**Persistent left sidebar** (Faire-style) on desktop. Bottom tab bar on mobile (max 5 items).

The sidebar communicates progress and value at a glance: how far along is this business? What's their next best action? The "activation progress" percentage lives in the sidebar header.

### Top-Level Navigation Groups

```
BUSINESS PORTAL SIDEBAR
━━━━━━━━━━━━━━━━━━━━━━━
[Business Name]          ← tenant identity
[Activation: 42%] ●●●○○  ← progress ring

DISCOVER
  ├── Brand Directory      /portal/brands
  └── Brand Profile        /portal/brands/:slug

MY WORKSPACE
  ├── Dashboard            /portal/dashboard
  ├── My Plans             /portal/plans
  └── Plan Detail          /portal/plans/:id

ANALYSIS (unlocked after first plan)
  ├── Gap Analysis         /portal/plans/:id/gaps
  ├── Revenue Simulator    /portal/plans/:id/simulate
  └── Comparisons          /portal/plans/:id/compare

ACTIVATION
  ├── Activation Kit       /portal/plans/:id/kit
  └── Export Center        /portal/plans/:id/export

COMMERCE
  ├── Order PRO            /portal/shop/pro
  ├── Order Retail         /portal/shop/retail
  └── Order History        /portal/orders

ACCOUNT
  ├── Settings             /portal/settings
  ├── Team                 /portal/team
  └── Billing              /portal/billing
━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Business Portal Screen Inventory

| # | Screen Name | Route | Purpose | Money Moment? |
|---|---|---|---|:---:|
| B-01 | Signup | `/portal/signup` | Create account + business profile | — |
| B-02 | Login | `/portal/login` | Authenticate | — |
| B-03 | Onboarding Wizard | `/portal/onboarding` | Business type → menu upload → brand interest → goals | ⭐ Entry to value |
| B-04 | Dashboard | `/portal/dashboard` | KPI summary, next actions, plan progress | ⭐ First WOW moment |
| B-05 | Brand Directory | `/portal/brands` | Browse + filter all published brands | ⭐ Discovery |
| B-06 | Brand Profile | `/portal/brands/:slug` | Deep brand evaluation (fit, economics, complexity) | ⭐⭐ Highest-intent screen |
| B-07 | Plans List | `/portal/plans` | All plans created, status, outcomes | — |
| B-08 | Plan Wizard | `/portal/plans/new` | 4-step plan creation flow | ⭐ Triggers AI engine |
| B-09 | Plan Results — Overview | `/portal/plans/:id` | Summary of entire analysis | ⭐⭐ First value delivery |
| B-10 | Plan Results — Matches | `/portal/plans/:id?tab=matches` | Service ↔ protocol mapping results | — |
| B-11 | Plan Results — Gaps | `/portal/plans/:id?tab=gaps` | Revenue opportunity list | ⭐⭐ Paywall trigger |
| B-12 | Plan Results — Retail | `/portal/plans/:id?tab=retail` | Product attach recommendations | ⭐ Commerce entry |
| B-13 | Plan Results — Kit | `/portal/plans/:id?tab=kit` | Marketing/training assets | ⭐ Activation value |
| B-14 | Gap Detail | `/portal/plans/:id/gaps/:gapId` | Single gap → protocol → SKUs → revenue model | ⭐⭐ ROI narrative |
| B-15 | Revenue Simulator | `/portal/plans/:id/simulate` | Editable assumptions → projected uplift | ⭐⭐⭐ Conversion trigger |
| B-16 | Brand Comparison | `/portal/plans/:id/compare` | Side-by-side brand evaluation | ⭐ Decision support |
| B-17 | Activation Kit | `/portal/plans/:id/kit` | Generated menu, pricing, scripts, training plan | ⭐⭐ Paid-tier value |
| B-18 | Export Center | `/portal/plans/:id/export` | Download/share assets | ⭐ Retention (shareability) |
| B-19 | PRO Shop | `/portal/shop/pro` | Browse + order professional (backbar) products | ⭐⭐ Transaction revenue |
| B-20 | Retail Shop | `/portal/shop/retail` | Browse + order retail products | ⭐⭐ Transaction revenue |
| B-21 | Order Detail | `/portal/orders/:id` | Order status + invoice | — |
| B-22 | Order History | `/portal/orders` | All orders, reorder triggers | ⭐ Repeat purchase |
| B-23 | Settings | `/portal/settings` | Business profile, integrations | — |
| B-24 | Team Management | `/portal/team` | Invite manager/staff, set roles | ⭐ Expansion (seat-based) |
| B-25 | Billing | `/portal/billing` | Subscription, invoices, usage | — |

---

### Business Portal Money Moments (Ranked)

| Rank | Screen | Moment | Lever |
|---|---|---|---|
| 1 | Revenue Simulator (B-15) | User sees "$X,XXX/month additional revenue" | Subscription conversion |
| 2 | Gap Detail (B-14) | User understands exactly one missed revenue opportunity | Upgrade to see all gaps |
| 3 | Brand Profile (B-06) | User sees fit score + economic model for a specific brand | Trust → purchase intent |
| 4 | Plan Results — Gaps (B-11) | Full gap list visible only to paid tier | Paywall hit |
| 5 | PRO Shop (B-19) | Protocols linked directly to "Buy these SKUs" | Transaction |
| 6 | Activation Kit (B-17) | Menu redesign ready to print/send → real urgency | Paid tier retention |
| 7 | Order History (B-22) | "Time to reorder" alert | Repeat transaction |

---

## Part 2 — Brand Partner Portal IA
*Role: `brand_admin`*

### Navigation Model
**Persistent left sidebar**. Simpler than business portal — brand admins are power users who need data density, not guided flows.

```
BRAND PORTAL SIDEBAR
━━━━━━━━━━━━━━━━━━━
[Brand Name + Logo]
[Status: Live ●]

OVERVIEW
  └── Dashboard              /brand/dashboard

MY BRAND
  ├── Profile + Catalog      /brand/catalog
  ├── Protocols              /brand/protocols
  ├── Products               /brand/products
  ├── Assets + Training      /brand/assets
  └── Storefront Preview     /brand/storefront

PERFORMANCE
  ├── Adoption Analytics     /brand/analytics
  ├── Pipeline Value         /brand/analytics/pipeline
  ├── Retailer Insights      /brand/retailers
  └── Benchmarks             /brand/benchmarks

MARKETING
  ├── Campaigns              /brand/campaigns
  ├── Promotions             /brand/promotions
  └── Automations            /brand/automations

COMMERCE
  ├── Orders                 /brand/orders
  └── Customers              /brand/customers

ACCOUNT
  ├── Settings               /brand/settings
  └── Billing                /brand/billing
━━━━━━━━━━━━━━━━━━━
```

---

### Brand Portal Screen Inventory

| # | Screen Name | Route | Purpose | Money Moment? |
|---|---|---|---|:---:|
| BR-01 | Login | `/brand/login` | Authenticate | — |
| BR-02 | Dashboard | `/brand/dashboard` | Performance KPIs, activity feed, alerts | — |
| BR-03 | Catalog Manager | `/brand/catalog` | Overview of all brand content | — |
| BR-04 | Protocols Manager | `/brand/protocols` | Edit canonical protocol library | ⭐ Catalog quality = match rate |
| BR-05 | Products Manager | `/brand/products` | PRO + retail SKU management | — |
| BR-06 | Assets + Training | `/brand/assets` | Upload education assets | — |
| BR-07 | Storefront Preview | `/brand/storefront` | Preview public-facing brand page | — |
| BR-08 | Adoption Analytics | `/brand/analytics` | Plans generated, adoption rate, services mapped | ⭐⭐ Data product |
| BR-09 | Pipeline Value | `/brand/analytics/pipeline` | Estimated revenue in pipeline (protocol → order) | ⭐⭐ Brand ROI proof |
| BR-10 | Retailer Insights | `/brand/retailers` | Anonymized list of adopting businesses by tier | ⭐ Benchmark product |
| BR-11 | Benchmarks | `/brand/benchmarks` | Anonymized category comparisons | ⭐ Premium data product |
| BR-12 | Campaigns | `/brand/campaigns` | Create/manage business-targeted campaigns | ⭐ Placement product |
| BR-13 | Promotions | `/brand/promotions` | Promo codes + bundle deals | — |
| BR-14 | Automations | `/brand/automations` | Trigger-based messaging rules | ⭐ Engagement product |
| BR-15 | Orders | `/brand/orders` | PRO + retail orders from businesses | ⭐ Revenue signal |
| BR-16 | Customers | `/brand/customers` | Retailer accounts, LTV, order history | — |
| BR-17 | Settings | `/brand/settings` | Brand profile, team, integrations | — |
| BR-18 | Billing | `/brand/billing` | Brand subscription, placement spend | — |

---

### Brand Portal Money Moments (Ranked)

| Rank | Screen | Moment | Lever |
|---|---|---|---|
| 1 | Pipeline Value (BR-09) | Brand sees "$X,XXX estimated pipeline from businesses using this protocol" | Brand subscription renewal |
| 2 | Adoption Analytics (BR-08) | Brand sees rising adoption curve → proof their catalog investment works | Upsell to data product |
| 3 | Benchmarks (BR-11) | Brand sees "your match rate is below category average" → action required | Premium benchmark tier |
| 4 | Campaigns (BR-12) | Brand creates targeted push to unconverted businesses → drives orders | Placement fee |

---

## Part 3 — Admin Portal IA
*Roles: `admin`, `platform_admin`*

### Navigation Model
**Persistent left sidebar** with grouped sections. Dense, data-heavy. Function over form. No empty states — if there's no data, something is wrong.

```
ADMIN PORTAL SIDEBAR
━━━━━━━━━━━━━━━━━━━━
[Platform Admin]
[Health: ●●●○ 78%]

OVERVIEW
  └── Dashboard              /admin/dashboard

BRANDS
  ├── Brand List             /admin/brands
  ├── Brand Hub              /admin/brands/:id
  │   ├── Profile            /admin/brands/:id/profile
  │   ├── Products           /admin/brands/:id/products
  │   ├── Protocols          /admin/brands/:id/protocols
  │   ├── Education          /admin/brands/:id/education
  │   ├── Orders             /admin/brands/:id/orders
  │   ├── Retailers          /admin/brands/:id/retailers
  │   ├── Analytics          /admin/brands/:id/analytics
  │   └── Settings           /admin/brands/:id/settings
  └── Brand Create           /admin/brands/new

BUSINESSES
  ├── Business List          /admin/businesses
  ├── Business Detail        /admin/businesses/:id
  └── Plan Inbox             /admin/inbox

CATALOG
  ├── Protocol Library       /admin/protocols
  ├── Schema Health          /admin/schema
  └── Ingestion Console      /admin/ingestion

COMMERCE
  ├── Orders                 /admin/orders
  └── Order Detail           /admin/orders/:id

PLATFORM
  ├── User Management        /admin/users
  ├── Audit Log              /admin/audit
  ├── Platform Health        /admin/health
  └── System Config          /admin/config
━━━━━━━━━━━━━━━━━━━━
```

---

### Admin Portal Screen Inventory

| # | Screen Name | Route | Purpose | Critical? |
|---|---|---|---|:---:|
| A-01 | Login | `/admin/login` | Authenticate | — |
| A-02 | Platform Dashboard | `/admin/dashboard` | Cross-platform health: tenants, revenue, errors | ⭐ Daily start |
| A-03 | Brand List | `/admin/brands` | All brands, status, last activity | — |
| A-04 | Brand Hub | `/admin/brands/:id` | Full brand management hub | ⭐ Primary brand tool |
| A-05 | Brand Create | `/admin/brands/new` | Onboard new brand | ⭐ New revenue |
| A-06 | Business List | `/admin/businesses` | All businesses, plan count, subscription tier | — |
| A-07 | Business Detail | `/admin/businesses/:id` | Single business view, plans, orders, history | ⭐ Support tool |
| A-08 | Plan Inbox | `/admin/inbox` | Queue of submitted plans for QA review | ⭐ Quality control |
| A-09 | Protocol Library | `/admin/protocols` | Master canonical protocol management | ⭐⭐ Catalog integrity |
| A-10 | Schema Health | `/admin/schema` | DB completeness check, table health | ⭐ Ops monitoring |
| A-11 | Ingestion Console | `/admin/ingestion` | Batch ingestion pipeline, phase control | ⭐ Ops |
| A-12 | Orders (All) | `/admin/orders` | Cross-platform order list, commissions | ⭐ Revenue |
| A-13 | Order Detail | `/admin/orders/:id` | Single order: items, status, commission | — |
| A-14 | User Management | `/admin/users` | All user profiles, role assignment | ⭐ Security |
| A-15 | Audit Log | `/admin/audit` | All write operations with actor + timestamp | ⭐⭐ Compliance |
| A-16 | Platform Health | `/admin/health` | Error rates, latency, DB load | — |
| A-17 | System Config | `/admin/config` | Feature flags, tier limits, commission rates | ⭐ Platform ops |

---

## Part 4 — Practitioner Portal IA
*Role: `practitioner` — FUTURE STATE (P2)*

### Navigation Model
**Bottom tab bar** (mobile-first). Maximum 4 items. Zero friction — practitioners are between clients.

```
PRACTITIONER BOTTOM NAV
━━━━━━━━━━━━━━━━━━━━━━━
[Home]  [Protocols]  [Training]  [Me]
```

### Practitioner Screen Inventory (P2)

| # | Screen Name | Route | Purpose |
|---|---|---|---|
| P-01 | Home | `/staff/home` | Today's services, quick-access protocols |
| P-02 | Protocol Browser | `/staff/protocols` | Search/browse protocols by service type |
| P-03 | Protocol Detail | `/staff/protocols/:id` | Step-by-step guide + products for current service |
| P-04 | Training Modules | `/staff/training` | Assigned courses, completion tracking |
| P-05 | Profile | `/staff/profile` | Personal completion stats |

---

## Part 5 — Public / Pre-Auth IA

### Navigation Model
**Minimal top nav**: Logo | Brands | For Brands | Pricing | Sign In | Get Started

```
PUBLIC ROUTES
━━━━━━━━━━━━━
/                    Landing page
/brands              Public brand directory
/brands/:slug        Public brand profile (limited)
/pricing             Subscription tiers + brand plans
/forgot-password     Password reset
/reset-password      Set new password
/about               (future)
/blog                (future)
```

### Public Screen Inventory

| # | Screen Name | Route | Purpose | Money Moment? |
|---|---|---|---|:---:|
| PUB-01 | Home / Landing | `/` | Hero, value prop, social proof, CTAs | ⭐⭐ Acquisition |
| PUB-02 | Brand Directory | `/brands` | Browse brands — requires sign-up for deep access | ⭐ Sign-up trigger |
| PUB-03 | Brand Profile (public) | `/brands/:slug` | Teaser brand view → full access requires account | ⭐⭐ Sign-up trigger |
| PUB-04 | Pricing Page | `/pricing` | Business + brand subscription tiers | ⭐⭐⭐ Conversion |
| PUB-05 | Forgot Password | `/forgot-password` | Auth recovery | — |
| PUB-06 | Reset Password | `/reset-password` | Set new password | — |

---

## Part 6 — Screen Hierarchy Summary (All Portals)

```
Total screens defined: 61
  Business portal:     25 screens
  Brand portal:        18 screens
  Admin portal:        17 screens
  Practitioner:         5 screens (P2)
  Public:               6 screens

Money moment screens:  18 (29%)
  Business:            14 money moment screens
  Brand:                4 money moment screens

Critical path screens (must work perfectly before launch):
  B-03 Onboarding Wizard
  B-05 Brand Directory
  B-06 Brand Profile
  B-08 Plan Wizard
  B-09 Plan Results Overview
  B-14 Gap Detail
  B-15 Revenue Simulator
  B-19 PRO Shop
  BR-08 Adoption Analytics
  A-09 Protocol Library
```

---

## Part 7 — Navigation Anti-Patterns to Avoid

| Anti-Pattern | Why It Kills Conversion | Correct Pattern |
|---|---|---|
| Showing AI output tabs before value summary | Users skip past the "so what" | Always lead with Overview tab (financial summary first) |
| Putting "Order" CTA behind multiple clicks | Friction kills purchase intent | "Add to Order" inline on Gap Detail and Protocol pages |
| Flat admin navigation with no hierarchy | Admins can't find brand-specific tools | Brand Hub pattern: each brand = isolated mini-portal |
| Separate login portals with no cross-link | Users end up on wrong login | Unified `/login` that detects role and routes correctly |
| Empty "coming soon" sections visible to free tier | Signals incomplete product | Progressive disclosure: show locked but not empty |
| Sidebar showing all items regardless of completion | Overwhelms new users | Onboarding mode: only show relevant nav items until plan created |

---

## Part 8 — Progressive Disclosure Model

The business sidebar should evolve with the user's progress, not show everything at once.

```
STATE 0: Just signed up, no plan
  Visible: Dashboard (empty), Brand Directory
  Hidden: Analysis, Activation, Commerce
  CTA: "Upload your menu to unlock your personalized analysis"

STATE 1: Plan created, analysis running/complete
  Visible: + Plans, Plan Detail, Matches, Gaps (2 shown, rest locked)
  CTA: "Upgrade to see all 8 revenue gaps"

STATE 2: Paid subscriber, no orders placed
  Visible: + Full Gap Analysis, Revenue Simulator, Activation Kit
  CTA: "Your activation kit is ready — order your opening products"

STATE 3: First order placed
  Visible: + Commerce (PRO Shop, Retail Shop, Orders)
  CTA: "Track your adoption outcomes"

STATE 4: Ongoing (1+ months)
  Visible: Full nav + Monthly insights, Reorder alerts
```

---

*Last updated: 2026-02-22 | Owner: Platform Architecture + Product Design*
