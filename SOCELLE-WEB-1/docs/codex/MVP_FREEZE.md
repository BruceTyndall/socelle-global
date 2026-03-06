# MVP FREEZE LINE
**The PRO Edit — Minimum Viable Platform Definition**
*February 2026 | Codex Recovery Mode*

---

## The Rule

If it is not required to generate one dollar of revenue from one paying customer, it does not ship in MVP.

---

## MVP consists of ONLY these capabilities:

### 1. Business User Can Discover and Evaluate a Brand
- Public brand directory (browse, filter by category)
- Brand profile page (protocols, products, fit indicators)
- **Required for:** acquisition, intent qualification
- **Already built:** ✅ (minor polish only)

### 2. Business User Can Run an AI Analysis of Their Menu Against a Brand
- Account creation + basic business profile
- Menu upload (PDF/DOCX/paste)
- AI mapping → gap analysis → plan results (5 tabs)
- **Required for:** delivering the core product value
- **Already built:** ✅ with one critical bug (race condition — must fix)

### 3. Business User Sees 3 Gaps Free, Hits a Paywall for the Rest
- Gap analysis tab: 3 results visible, remainder behind Growth paywall
- Paywall shows aggregate dollar range for locked gaps
- Upgrade flow → billing page
- **Required for:** converting free → paid
- **NOT built:** ❌ subscriptions table + tier gate + billing page

### 4. Paid Business User Can Access Full Gap Analysis + Revenue Simulator
- All gaps visible after upgrade
- Revenue simulator (editable assumptions → projected uplift range)
- **Required for:** converting paid tier → order intent
- **NOT built:** ❌ revenue simulator

### 5. Business User Can Place a PRO Product Order
- PRO shop: browse products filtered by brand + protocol
- Add to cart → checkout (address + notes) → order confirmation
- Order record created in DB
- **Required for:** transaction revenue (platform's most important revenue stream at launch)
- **NOT built:** ❌ commerce layer, order_items table

### 6. Brand Admin Can Manage Their Catalog
- Protocols, products, assets management
- Profile + storefront preview
- **Required for:** brand activation, catalog quality
- **Already built:** ✅ (admin-side via BrandAdminEditor)

### 7. Brand Admin Can See Real Performance Analytics
- Plans generated using their brand (count)
- Services mapped to their protocols (count + match rate)
- Orders placed for their products
- **Required for:** selling brand subscriptions
- **NOT built:** ❌ analytics are mock data

### 8. Platform Admin Can Onboard Brands + Approve Catalog Quality
- Brand create/edit/publish
- Catalog completeness check before brand goes live
- Order management
- **Required for:** ops function, platform quality
- **Already built:** ✅ (minor gap: no completeness gate)

---

## What Is NOT in MVP — Cut These Now

| Feature | Why It's Cut |
|---|---|
| Activation Kit Generator (AI-generated menu redesign, training plan, scripts) | High complexity, not on critical purchase path. P1 after commerce works. |
| Monthly Optimization Loop (automated insights email) | Retention feature, not acquisition. Build after you have users. |
| Reorder Triggers | Requires order history. Can't build reorder before first order. |
| Brand Placement Products (paid placement/campaigns) | Brand monetization, not launch-blocking. |
| Brand Benchmarks / Competitor Anonymized Data | Premium data product. Build after analytics are real. |
| Brand-to-Business Messaging | Nice to have. Not on critical path. |
| Practitioner Portal (staff protocol viewer) | Separate product, separate audience. P2. |
| Plan Comparison Tool (side-by-side brands) | Decision-support polish. Not launch-blocking. |
| Seasonal Promotion Automation | Retention, not acquisition. P2. |
| Stripe Payment Integration | Manual billing is fine for launch. Real Stripe integration is P2 after first 20 paying customers. |
| Business Manager / Practitioner roles | One business role is fine for launch. Expansion later. |
| PDF Export from Activation Kit | Kit itself isn't built. |
| API / webhook integrations | Enterprise feature, P3. |

---

## MVP Success Criteria

The MVP is shippable when:

1. ✅ Business user can sign up, upload a menu, and see AI analysis results — first try, no manual refresh needed (race condition fixed)
2. ✅ Business user hits a paywall after 3 gaps, sees a compelling upgrade prompt with a dollar value
3. ✅ Paid business user can access full gap analysis and revenue simulator
4. ✅ Paid business user can browse PRO products and place an order
5. ✅ Brand admin sees real data (not hardcoded) in their analytics dashboard
6. ✅ Platform admin can onboard a brand and approve it for discovery
7. ✅ Admin has role guard (security non-negotiable)
8. ✅ Multi-tenant isolation tests pass

**MVP does NOT require:**
- More than 1 paying brand at launch (1 is enough to prove the model)
- More than 10 paying businesses at launch (enough to validate willingness to pay)
- Any feature not listed above

---

## Revenue at MVP

| Revenue Stream | MVP Status | Est. Revenue Potential |
|---|---|---|
| Business subscription (Growth tier) | ✅ Required | $79/mo × customers |
| Transaction commission (PRO orders) | ✅ Required | 8–12% × GMV |
| Brand subscription | ✅ Required (1 brand) | $299/mo |
| Brand placement products | ❌ Cut from MVP | — |
| Data products (benchmarks) | ❌ Cut from MVP | — |

---

*Last updated: 2026-02-22 | Codex Recovery Mode*
