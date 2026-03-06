# SOCELLE PRO — DAILY BUILD TRACKER
# Save as /docs/build_tracker.md in your Socelle Pro repo
# Claude Code reads this at the start of every session
# Claude Code updates this at the end of every session

Last Updated: 2026-02-25
Current Phase: Phase 8 — SHIP
Next Milestone: First real subscription payment received
Source of Truth: /docs/master_prompt.md

---

## PHASE 8 STATUS — SHIP

| Task | Status | Notes |
|------|--------|-------|
| Fix BUG-003 (package-lock.json) | ✅ Complete | 18 Cloud Functions live on us-central1 |
| Add POSTMARK_API_KEY to Secret Manager | ⬜ Not Started | |
| Swap RevenueCat test key → production | ⬜ Not Started | Needs `appl_` key from RevenueCat dashboard |
| Create App Store products | ⬜ Not Started | socelle_monthly $29.99, socelle_annual $249.99 |
| Configure Android RevenueCat (BUG-008) | ⬜ Not Started | |
| Fix BUG-002 (timezone) | ✅ Complete | Flutter TZ + backend localHHMMtoUTC. Awaiting CF deploy. |
| Confirm dormant tabs unreachable | ✅ Complete | 3-tab only, all Phase 2 flags false |
| flutter analyze — zero errors | ✅ Complete | 0 errors, 0 warnings, 49 infos |
| flutter test — baseline documented | ✅ Complete | 1 stub test passing |
| Submit to TestFlight | ⬜ Not Started | |

**Phase 8 DONE when:** ✅ First real payment received

---

## PHASE 9 STATUS — GAP-FILL LOOP (Highest Revenue Impact)

**Goal:** Close the loop. Gap detected → client contacted → slot filled → calendar updated.
This is the single most important phase for product-market fit.

| # | Task | Status | Est. | Notes |
|---|------|--------|------|-------|
| 9.1 | Revenue Goal Setting | ⬜ Not Started | 1 day | Weekly/monthly goals, progress bar, celebration animation |
| 9.2 | Google Sign-In Linking (BUG-004) | ⬜ Not Started | 3 days | linkWithCredential, preserves Firestore data, optional |
| 9.3 | Smart Waitlist + Contact Import | ⬜ Not Started | 5 days | Phone import, preferred services/times, gap matching, one-tap text |
| 9.4 | Flash Offer + Shareable Link | ⬜ Not Started | 4 days | Discount picker, expiry, booking URL, Instagram copy, native SMS |
| 9.5 | Google Review Request | ⬜ Not Started | 2 days | Google Business URL in Settings, post-fill SMS with review link |
| 9.6 | Google Calendar Write Access | ⬜ Not Started | 3 days | OAuth scope upgrade, create event on gap fill, additive to read sync |

**Phase 9 DONE when:** Provider detects gap → texts waitlist client →
client claims slot → calendar event created. End-to-end pipeline works.

---

## PHASE 10 STATUS — CLIENT DATABASE (Smart Recovery)

**Goal:** The app knows the provider's clients and recommends who to contact.

| # | Task | Status | Est. | Notes |
|---|------|--------|------|-------|
| 10.1 | Client Profiles | ⬜ Not Started | 4 days | `clients/{uid}/contacts/`, phone import upgrade, manual add, visit logging → `visits/{uid}/log/` |
| 10.2 | Visit Frequency + Overdue Detection | ⬜ Not Started | 3 days | Calculate typical_interval_days, flag is_overdue at 50%+, daily CF scan |
| 10.3 | Client Value Scoring | ⬜ Not Started | 2 days | Auto value_tier: high/medium/low/new from revenue × frequency × recency |
| 10.4 | Smart Gap Matching | ⬜ Not Started | 3 days | Cross-reference clients to gaps by day/time/service/overdue/value, ranked suggestions |

**Phase 10 DONE when:** App flags overdue clients and recommends the right
person to contact for each specific gap.

---

## PHASE 11 STATUS — AUTOMATED OUTREACH (Scale the Provider)

**Goal:** Gap detected at 10pm → clients notified by 7am → slot filled before
the provider wakes up.

| # | Task | Status | Est. | Notes |
|---|------|--------|------|-------|
| 11.1 | Outreach Preferences | ⬜ Not Started | 1 day | `outreach_settings/{uid}`, toggles, quiet hours, daily limits |
| 11.2 | Auto Gap-Fill Suggestions | ⬜ Not Started | 4 days | CF: new gap → find matches → push to provider → one-tap SMS |
| 11.3 | Overdue Client Digest | ⬜ Not Started | 3 days | Weekly digest, in-app overdue list, pre-populated texts |
| 11.4 | Post-Visit Rebook Reminder | ⬜ Not Started | 2 days | CF: daily check for due reminders → push to provider |

**Phase 11 DONE when:** App proactively surfaces opportunities without
provider initiating anything.

---

## PHASE 12 STATUS — ENGAGEMENT + MONETIZATION

| # | Task | Status | Est. | Notes |
|---|------|--------|------|-------|
| 12.1 | Activate streak system | ⬜ Not Started | 0.5 day | Flip feature flag |
| 12.2 | Unhide Weekly Summary page | ⬜ Not Started | 0.5 day | Already built |
| 12.3 | Friday weekly summary card | ⬜ Not Started | 1 day | Revenue tab card |
| 12.4 | Deep links from push to gaps | ⬜ Not Started | 1 day | |
| 12.5 | Fix Apple Calendar sync | ⬜ Not Started | 2 days | Info banner says "improvements pending" |
| 12.6 | Thursday momentum push | ⬜ Not Started | 1 day | "You've recovered $X. N gaps still open." |
| 12.7 | Pro+ tier ($49/month) | ⬜ Not Started | 3 days | Unlocks: client DB, outreach, goals, weekly summary, snapshot |
| 12.8 | Income + tip tracking | ⬜ Not Started | 2 days | Uses `visits/` from Phase 10 |
| 12.9 | Tax estimator | ⬜ Not Started | 2 days | Quarterly estimate from logged income |
| 12.10 | Referral rewards | ⬜ Not Started | 2 days | 3 referrals → 1 month free |
| 12.11 | Annual plan launch promo | ⬜ Not Started | 1 day | First year 50% off |

**Phase 12 DONE when:** Pro+ tier live, 10% upgrade rate.

---

## PHASE 13 STATUS — SOCELLE ECOSYSTEM INTEGRATION

⚠️ DO NOT START until: 200+ Pro subscribers AND B2B Phase 1 complete

| # | Task | Status | Notes |
|---|------|--------|-------|
| 13.1 | Firebase Auth ↔ Supabase JWT bridge | ⬜ Not Started | identity_bridge.dart |
| 13.2 | ecosystem_links/{uid} activated | ⬜ Not Started | |
| 13.3 | Wire Shop → Socelle product catalog | ⬜ Not Started | SupabaseProductRepository |
| 13.4 | Wire Messages → Socelle conversations | ⬜ Not Started | SupabaseConversationRepository |
| 13.5 | Product recommendations by service | ⬜ Not Started | |
| 13.6 | Cross-sell banner (B2B → App Store) | ⬜ Not Started | |
| 13.7 | Service menu sync (B2B → Pro, read-only) | ⬜ Not Started | service_menu on users/{uid}.settings |
| 13.8 | Utilization reporting (Pro → B2B) | ⬜ Not Started | Aggregated |
| 13.9 | Bundle pricing | ⬜ Not Started | |

---

## PHASE 14 STATUS — GROWTH + PAYMENTS

| # | Task | Status | Notes |
|---|------|--------|-------|
| 14.1 | Payment processing for gap-fill bookings | ⬜ Not Started | Deposits, card on file |
| 14.2 | Multi-calendar support | ⬜ Not Started | |
| 14.3 | Team dashboard tier ($99-149/month) | ⬜ Not Started | |
| 14.4 | Instagram Story generator | ⬜ Not Started | For flash offers |
| 14.5 | AI voice detection for missed calls | ⬜ Not Started | |
| 14.6 | Offline mode | ⬜ Not Started | Local cache |

---

## KNOWN BUGS TRACKER

| ID | Bug | Status | Fixed In |
|----|-----|--------|----------|
| BUG-001 | rolling_30d_leakage wrong | ⚠️ Code fixed | Phase 8 — awaiting CF deploy |
| BUG-002 | Timezone UTC bug | ⚠️ Code fixed | Phase 8 — awaiting CF deploy |
| BUG-003 | package-lock.json deploy fail | ✅ Fixed | Phase 8 |
| BUG-004 | Anonymous auth data loss | ⬜ Open | Phase 9 (task 9.2) |
| BUG-008 | Android RevenueCat missing | ⬜ Open | Phase 8 |

---

## DECISIONS LOG

| Date | Decision | Why | Alternative Considered |
|------|----------|-----|----------------------|
| 2026-02-25 | Phases restructured around revenue gap analysis | Gap-fill loop is #1 revenue driver; client DB → outreach → monetize → integrate | Keep original order (rejected: delays highest-impact feature) |
| 2026-02-25 | Client database moved to Phase 10 | Client intelligence makes gap-filling 10x smarter | Keep late (rejected: everything depends on it) |
| 2026-02-25 | Shareable booking link added to flash offers | No claim mechanism = broken loop, no conversion tracking | Text-only (rejected) |
| 2026-02-25 | Calendar write in Phase 9 | Core loop requires creating events, not just reading | Defer (rejected: loop broken without it) |
| 2026-02-25 | Socelle B2B integration → Phase 13 | Need proven gap-fill loop + 200 subscribers first | Earlier (rejected: premature) |
| 2026-02-25 | Service menu → Phase 13 schema, not Phase 10 | B2B owns this data structure; sync don't duplicate | Build early (rejected: premature without B2B) |
| 2026-02-25 | Color tokens added to socelle_colors.dart | Rebrand left SocelleColors incomplete | Derive from SlotforceColors (rejected) |
| 2026-02-25 | glamHeroGradientColors: ink→forest→sage | Fits Socelle editorial palette | Go flat (deferred) |
| 2026-02-25 | accentGold #C5A265 added | Champagne gold for leakage_reveal | Remove gold (rejected: editorial intent) |
| 2026-02-23 | flutter_timezone: ^3.0.0 | Reliable IANA timezone | DateTime.timeZoneOffset (rejected) |
| 2026-02-23 | BUG-002: Intl.DateTimeFormat for TZ | Zero new npm packages | date-fns-tz (rejected: unnecessary) |
| 2026-02-23 | BUG-001: Firestore 30d lookback, non-fatal | Graceful degradation | Expand sync window (rejected: expensive) |

---

## DISCOVERIES LOG

| Date | Finding | Priority | Status |
|------|---------|----------|--------|
| 2026-02-25 | benchmark_card + week_day_bar still use SlotforceColors, old copy | Medium | Open — dormant |
| 2026-02-25 | Onboarding intro hero uses LinearGradient (design rule: no gradients) | Low | Open — deferred |
| 2026-02-25 | 32 packages have newer incompatible versions | Medium | Open — needs audit session |
| 2026-02-23 | ai_provider.dart unused `roundedValue` var | Low | ✅ Fixed |

---

## DAILY STANDUP FORMAT

```
---DAILY STANDUP---
Date:
Session Goal:
Current Phase:
Last Session:
Time Available:
Blocker?:
---END STANDUP---
```

---

## STATUS KEY

- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ❌ Blocked — needs decision
- ⚠️ Complete but needs testing
- 🔁 Needs revision

---

## WEEKLY REVIEW PROMPT

```
Weekly review time. Do the following:

1. Read /docs/build_tracker.md
2. Read /docs/master_prompt.md (Build Plan + Known Bugs sections)
3. Check all file changes from this week (git log --since="7 days ago")
4. Produce a weekly summary:
   - What phases progressed
   - What tasks were completed
   - What bugs were fixed
   - What is currently blocked
   - What the next 5 tasks are in priority order
5. Update build_tracker.md with current status
6. Are we on track for current Phase completion?
   If not, what should we cut or descope?
```

---

## MILESTONE TRACKER

| Milestone | Target | Status |
|-----------|--------|--------|
| Cloud Functions deployed | Phase 8 | ✅ |
| First TestFlight beta user | Phase 8 | ⬜ |
| First real subscription payment | Phase 8 | ⬜ |
| Gap-fill loop closed end-to-end | Phase 9 | ⬜ |
| Shareable booking link live | Phase 9 | ⬜ |
| Smart waitlist matching gaps to clients | Phase 9 | ⬜ |
| App Store public launch | Phase 9 | ⬜ |
| 10 paying subscribers | Phase 9 | ⬜ |
| Full client database with visit history | Phase 10 | ⬜ |
| Overdue client detection live | Phase 10 | ⬜ |
| Smart gap matching live | Phase 10 | ⬜ |
| 50 paying subscribers | Phase 10 | ⬜ |
| Automated gap-fill outreach live | Phase 11 | ⬜ |
| Overdue digest live | Phase 11 | ⬜ |
| 100 paying subscribers | Phase 11 | ⬜ |
| Streak feature activated | Phase 12 | ⬜ |
| Pro+ tier live ($49/month) | Phase 12 | ⬜ |
| Income tracking live | Phase 12 | ⬜ |
| 200 paying subscribers | Phase 12 | ⬜ |
| Socelle B2B Shop integration live | Phase 13 | ⬜ |
| Socelle B2B Messages integration live | Phase 13 | ⬜ |
| 500 paying subscribers | Phase 13 | ⬜ |
| Payment processing live | Phase 14 | ⬜ |

---

## EXTERNAL SETUP REQUIRED (Owner: Human)

| Item | Needed For | Status |
|------|-----------|--------|
| RevenueCat production key | Phase 8 | ⬜ |
| App Store Connect products | Phase 8 | ⬜ |
| Postmark API key in Secret Manager | Phase 8 | ⬜ |
| Google OAuth calendar write scope | Phase 9 | ⬜ |
| Booking link hosting (Firebase Hosting or Vercel) | Phase 9 | ⬜ |
| Google Business Profile URL (per provider) | Phase 9 | ⬜ Provider configures |
| Supabase project credentials | Phase 13 | ⬜ Not needed yet |
| Stripe account | Phase 14 | ⬜ Not needed yet |

---

*Update this file at the end of every Claude Code session.
It is the first thing Claude Code reads at the start of every session.
An outdated tracker means a confused Claude Code and wasted build time.*
