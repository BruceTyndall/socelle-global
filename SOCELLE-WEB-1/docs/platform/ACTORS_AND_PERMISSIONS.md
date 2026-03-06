# ACTORS AND PERMISSIONS
**The PRO Edit — Brand Discovery & Activation Platform**
*Version 1.0 | February 2026 | Principal Product Design + Architecture Review*

---

## Overview

This document defines every human and system actor on the platform, their motivations, trust requirements, data access scope, and permission matrix. It is the authoritative reference for authorization design, row-level security policy, and feature gating.

**Design principle:** Trust flows down. Businesses trust the platform to give honest recommendations. Brands trust the platform not to leak competitive data. Both trust that platform operators are not playing favorites. Every permission decision must reinforce these trusts.

---

## 1. Actor Inventory

### Actor 1 — Business Owner / Decision Maker
**System role:** `business_owner`
**Maps to current codebase:** `business_user` (primary path)

| Attribute | Value |
|---|---|
| **Job title examples** | Spa Owner, MedSpa Founder, Salon Director, Wellness Studio Owner |
| **Primary motivation** | Grow revenue, reduce complexity, look like a smart operator |
| **Fear** | Wasting money on a brand that doesn't fit. Looking bad to staff. |
| **Session frequency** | 2–4× per month (strategic, not daily) |
| **Device** | Desktop 70%, mobile 30% |
| **Technical fluency** | Low–medium. Not afraid of dashboards, hates jargon. |
| **Core JTBD** | "Help me decide if this brand is right for my business and show me exactly how to make money with it." |

**What they own:**
- The business account (tenant)
- Billing and subscription decisions
- Brand selections and final purchase approvals
- All child user accounts (manager, staff)

**What they cannot do:**
- View competitor business data (ever)
- Access platform-wide analytics
- Modify platform catalog

---

### Actor 2 — Business Manager / Operator
**System role:** `business_manager`
**Maps to current codebase:** `business_user` (secondary path — currently not differentiated)

| Attribute | Value |
|---|---|
| **Job title examples** | Spa Manager, Operations Director, Front Desk Lead |
| **Primary motivation** | Execute on decisions the owner has made. Keep things running. |
| **Fear** | Making a mistake the owner blames them for. |
| **Session frequency** | Daily–weekly |
| **Device** | Desktop 60%, tablet/mobile 40% |
| **Technical fluency** | Medium |
| **Core JTBD** | "Help me implement the plan and track that it's working." |

**What they own:**
- Day-to-day plan execution
- Menu uploads, data entry, reorders
- Staff access provisioning (within owner-set limits)

**What they cannot do:**
- Upgrade/downgrade subscriptions
- Approve new brand partnerships
- Delete plans or business data

**ASSUMPTION:** Current codebase collapses `business_owner` and `business_manager` into one `business_user` role. These two actors need to be differentiated in the next auth iteration. Until then, all `business_user` accounts carry full business-side permissions. Flag for P1 build.

---

### Actor 3 — Practitioner / Staff
**System role:** `practitioner`
**Maps to current codebase:** Not yet implemented — new role required

| Attribute | Value |
|---|---|
| **Job title examples** | Esthetician, Massage Therapist, Injector, Nail Tech |
| **Primary motivation** | Do their job well. Know what products to use and recommend. |
| **Fear** | Getting the protocol wrong. Being blamed for a bad client result. |
| **Session frequency** | 3–5× per week (quick, task-specific) |
| **Device** | Mobile-first (between clients, in treatment room) |
| **Technical fluency** | Low–medium |
| **Core JTBD** | "Show me the protocol for this service and which products I need." |

**What they own:**
- Read-only access to protocols assigned to their location
- Personal service performance data (if surfaced)
- Training module completion tracking

**What they cannot do:**
- View pricing, margins, or financial data
- Upload menus or modify mappings
- Place orders
- See other practitioners' performance

**ASSUMPTION:** Staff-facing UI is mobile-optimized, step-by-step protocol viewer. This is a P2 feature that unlocks a new retention vector (practitioners as daily active users).

---

### Actor 4 — Brand Partner Admin
**System role:** `brand_admin`
**Maps to current codebase:** `brand_admin` ✓

| Attribute | Value |
|---|---|
| **Job title examples** | Brand Manager, National Account Director, E-commerce/Digital Lead |
| **Primary motivation** | Grow distribution. Prove brand ROI to internal stakeholders. |
| **Fear** | Competitor seeing their sales data. Bad placement hurting brand perception. |
| **Session frequency** | Weekly (review analytics, respond to activity) |
| **Device** | Desktop-first |
| **Technical fluency** | Medium–high |
| **Core JTBD** | "Show me where my brand is being adopted, how it's performing, and what I can do to grow it." |

**What they own:**
- Their brand profile, catalog (protocols, SKUs, assets)
- Their own analytics (adoption, pipeline, revenue)
- Placement/promotional product purchases
- Permissioned benchmark comparisons (anonymized)

**What they cannot do (hard security boundaries):**
- View any other brand's performance data — ever
- Access business-level private data (which specific spa chose them)
- See unanonymized aggregate metrics that could reveal competitor position
- Access platform-level financial data

**Critical constraint:** Brand data isolation is a contractual obligation. Any leakage is a trust-destroying event. Must be enforced at DB level (RLS), not just UI.

---

### Actor 5 — Platform Admin / Ops
**System role:** `admin` | `platform_admin`
**Maps to current codebase:** `admin` + `platform_admin` ✓

| Attribute | Value |
|---|---|
| **Job title examples** | Ops Manager, Data Curator, Catalog Manager, Finance/Billing Lead |
| **Primary motivation** | Keep the platform clean, honest, and profitable |
| **Fear** | Bad data creating bad recommendations. Chargebacks. Angry brands. |
| **Session frequency** | Daily |
| **Device** | Desktop-only |
| **Technical fluency** | High |
| **Core JTBD** | "Give me tools to validate data quality, resolve disputes, and see the health of the whole platform." |

**Sub-roles within Platform Admin:**
| Sub-Role | Focus |
|---|---|
| `catalog_admin` | Protocol/SKU ingestion, QA, corrections |
| `ops_admin` | Tenant management, user issues, fraud |
| `finance_admin` | Orders, commissions, billing reconciliation |
| `platform_admin` | All of the above + platform configuration |

**What they own:**
- Global read access (all tenants, all brands)
- Write access for catalog corrections
- Subscription management
- Commission reconciliation

**What they cannot do without audit log:**
- Modify any financial record
- Delete business or brand data
- Change any published recommendation retroactively

---

### Actor 6 — AI System Actor
**System role:** `system` (internal only, no login)
**Maps to current codebase:** Edge Functions + `src/lib/` engines

| Attribute | Value |
|---|---|
| **What it is** | The recommendation, mapping, and generation layer |
| **Motivations** | Maximize mapping accuracy. Never hallucinate. Surface monetizable gaps. |
| **Trust requirement** | Every output must be explainable and overridable by a human |
| **Operates as** | Service account with narrowly scoped DB read access |

**What it can do:**
- Read: `canonical_protocols`, `pro_products`, `retail_products`, `service_category_benchmarks`, `marketing_calendar`, `treatment_costs`
- Write: `spa_service_mapping`, `service_gap_analysis`, `retail_attach_recommendations`, `business_plan_outputs`, `plan_submissions` (status updates only)
- Call: Supabase Edge Functions (embeddings, Claude API)

**What it cannot do:**
- Read any business's private data outside the plan it's processing
- Write to financial tables
- Override human-approved mappings without flagging for review
- Access brand analytics

---

## 2. Permission Matrix

### Read Permissions

| Resource | `business_owner` | `business_manager` | `practitioner` | `brand_admin` | `admin` | `platform_admin` | `system` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Own business profile | ✅ | ✅ | ✅ | — | ✅ | ✅ | — |
| Other businesses' data | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | scoped |
| Own plans + outputs | ✅ | ✅ | ❌ | — | ✅ | ✅ | scoped |
| Other businesses' plans | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Pricing / margins | ✅ | ✅ | ❌ | — | ✅ | ✅ | read |
| Brand catalog (published) | ✅ | ✅ | ✅ | own only | ✅ | ✅ | ✅ |
| Own brand analytics | — | — | — | ✅ | ✅ | ✅ | ❌ |
| Other brands' analytics | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Anonymized benchmarks | ✅ (paid tier) | ✅ (paid tier) | ❌ | ✅ (permissioned) | ✅ | ✅ | ❌ |
| Platform health metrics | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Orders (own) | ✅ | ✅ | ❌ | — | ✅ | ✅ | ❌ |
| Orders (all) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Protocol steps | ✅ | ✅ | ✅ (read-only) | own brand | ✅ | ✅ | ✅ |

### Write Permissions

| Resource | `business_owner` | `business_manager` | `practitioner` | `brand_admin` | `admin` | `platform_admin` | `system` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Business profile | ✅ | limited | ❌ | — | ✅ | ✅ | ❌ |
| Menu uploads | ✅ | ✅ | ❌ | — | ✅ | ✅ | ❌ |
| Plan creation | ✅ | ✅ | ❌ | — | ✅ | ✅ | ❌ |
| Mapping overrides | ✅ | ✅ | ❌ | — | ✅ | ✅ | flagged |
| Orders (place) | ✅ | ✅ | ❌ | — | ✅ | ✅ | ❌ |
| Brand catalog | — | — | — | ✅ | ✅ | ✅ | ❌ |
| Brand analytics | — | — | — | own only | ✅ | ✅ | ❌ |
| Canonical protocols | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | write-only |
| Plan outputs | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| User management (own) | ✅ | limited | ❌ | ✅ (own brand users) | ✅ | ✅ | ❌ |
| Platform config | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Billing/subscriptions | ✅ | ❌ | ❌ | ✅ (own brand) | ✅ | ✅ | ❌ |

---

## 3. Multi-Tenant Data Boundaries

### Tenant Types
```
Platform (1)
├── Brands (N)  →  Each brand is a tenant
│   ├── brand_id partitions all brand data
│   └── brand_admin users are scoped to their brand_id
└── Businesses (N)  →  Each business is a tenant
    ├── business_id partitions all business data
    └── business_user accounts are scoped to their business_id
```

### Hard Isolation Rules

1. **Brand ↔ Brand:** Zero visibility. `brand_id` RLS on all brand analytics tables.
2. **Business ↔ Business:** Zero visibility. `business_id` RLS on all plan, order, and user data.
3. **Brand → Business:** Brands see only anonymized aggregate metrics (e.g., "47 businesses have adopted this protocol"). Never named. Never linked.
4. **Business → Brand:** Businesses see brand catalog data (published). Brands cannot see which business viewed them unless the business places an order.
5. **AI System → Data:** System reads only the data necessary for the active job (scoped by `plan_id` and `brand_id`). Never cross-tenant reads.
6. **Admin → Everything:** Full read access with audit logging on sensitive reads. No silent access.

### Row-Level Security Policy Summary

```sql
-- Business data: owned by business_id
-- business_user_id must match auth.uid() OR user must be admin

-- Brand data: owned by brand_id
-- brand_admin must have user_profiles.brand_id = brands.id

-- Plan outputs: scoped to business_user_id
-- Only creator or admin can read

-- AI system writes: service account with write-only to output tables
-- Never reads from other businesses' plans
```

---

## 4. Role Capability Summary

| Capability | Owner | Manager | Practitioner | Brand Admin | Admin | Platform Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Full business portal access | ✅ | ✅ | ❌ | — | ✅ | ✅ |
| Protocol viewer only | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Financial data visible | ✅ | ✅ | ❌ | own brand | ✅ | ✅ |
| Place orders | ✅ | ✅ | ❌ | — | ✅ | ✅ |
| Manage subscriptions | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Brand catalog management | — | — | — | ✅ | ✅ | ✅ |
| Brand analytics access | — | — | — | ✅ | ✅ | ✅ |
| Invite team members | ✅ | limited | ❌ | ✅ | ✅ | ✅ |
| Override AI mappings | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Admin console access | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Platform configuration | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 5. Actor Onboarding Entry Points

| Actor | Entry URL | Auth Method | First-Session Goal |
|---|---|---|---|
| Business Owner | `/portal/signup` | Email + password | Complete profile → upload menu → see first recommendation |
| Business Manager | Invite link from owner | Magic link or set password | Access existing business dashboard |
| Practitioner | Invite link from manager | PIN or magic link | View assigned protocols |
| Brand Admin | `/brand/login` (invite only) | Email + password | Complete brand catalog → go live |
| Platform Admin | `/admin/login` | Email + password + MFA (ASSUMPTION) | Platform health overview |

---

## 6. Future Actors (Logged for Roadmap)

| Actor | Rationale | Priority |
|---|---|---|
| **Distributor / Sales Rep** | Reps who pitch brands to spas; need aggregate adoption data, no individual business data | P2 |
| **Educator / Trainer** | Brand educators running training events; read-only protocol/training module access | P2 |
| **Accountant / Finance Viewer** | Read-only order/billing exports for business accounting | P3 |
| **API Consumer (external system)** | Webhooks/API for POS integration (Mindbody, Vagaro) | P3 |

---

*Last updated: 2026-02-22 | Owner: Platform Architecture*
