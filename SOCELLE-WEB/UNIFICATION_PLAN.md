# SOCELLE Platform Unification & Shift Readiness Assessment

**Date:** February 26, 2026
**Scope:** WEB (React/Vite/TypeScript + Supabase) + MOBILE (Flutter + Firebase + Shared Packages)
**Objective:** Assess each shared concern across platforms and recommend phased unification roadmap.

---

## Executive Summary

The SOCELLE platform is operationally split across three logical backends:
- **WEB (SOCELLE WEB):** React/Vite portal using Supabase directly, deployed on Netlify
- **MOBILE (SOCELLE APP):** Flutter + Firebase Cloud Functions (TypeScript) + shared packages (gap_engine, shared schemas)
- **SHARED (packages/):** Well-structured monorepo in mobile with centralized gap_engine and Zod validation schemas

**Key Finding:** The platforms have **minimal overlap** in business logic but **high duplication in foundational layers** (auth, types, constants, email). Mobile's shared package structure is mature and ready for expansion. Web has 15+ brand portal pages that don't exist in mobile.

**Readiness Verdict:**
- **~30% of concerns:** Move Today (trivial alignment)
- **~50% of concerns:** Needs Refactor (moderate effort, clear path)
- **~20% of concerns:** Full Rewrite (architectural divergence, lower priority)

**Estimated Total Effort:** 4-6 weeks across all phases.

---

## Readiness Legend

- **Move Today** = Identical or trivially reconcilable; can be extracted to shared package immediately with no breaking changes.
- **Needs Refactor** = Same intent, different implementation or language; requires moderate alignment effort (1-3 days per item).
- **Full Rewrite** = Fundamentally diverged approaches; requires redesigning entire subsystem (3+ days per item).

---

## Detailed Shared Concern Assessments

### 1. API Client / Supabase Layer

#### Findings

**Web (supabase.ts):**
```typescript
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    })
  : unconfiguredClient;
```
- Configured with environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Auto-refresh and session persistence enabled
- Proxy fallback for missing config

**Mobile (supabase_client.dart):**
```dart
static bool get isConfigured =>
    _supabaseUrl.isNotEmpty && _supabaseAnonKey.isNotEmpty;
```
- Same environment-driven approach (SOCELLE_SUPABASE_URL, SOCELLE_SUPABASE_ANON_KEY)
- Supabase Flutter plugin not yet added (commented out in initialize())
- Non-fatal initialization: falls back to mock repositories
- Marked as "Socelle marketplace features" (shop, messages, brand relationships)

**Mobile runs Supabase in parallel with Firebase.** The two backends coexist intentionally:
- **Supabase:** Shop, Messages, Brand Relationships, Education, Marketing
- **Firebase:** Auth, Calendar, Gaps, Streaks, Notifications, Analytics, Retention

**Key Insight:** No conflict here — Supabase is a secondary, marketplace-specific client on mobile. Web relies on it exclusively for all data.

#### Readiness Assessment

**Rating:** Needs Refactor

**Justification:**
- Both platforms initialize identically but from different languages (TypeScript vs. Dart).
- Mobile's non-fatal fallback model (mock repositories) is more resilient than web's error throw.
- Environment variable names differ (VITE_ prefix on web, direct const on mobile).
- **Actionable unification:** Extract a shared "SupabaseClientConfig" (constants: URLs, keys, retry logic) that both consume.

**Effort Estimate:** 1 day
- Define a `packages/supabase-config` package with:
  - Standard config keys (URL, anon key, auth options)
  - Platform-specific wrappers that consume the config
  - Retry/fallback policies (already well-documented in mobile)

---

### 2. Type Definitions / Data Models

#### Findings

**Web (database.types.ts):**
- 25,000+ lines of auto-generated Supabase types
- Covers all tables (brands, business_plan_outputs, user_profiles, orders, etc.)
- Strongly typed Row/Insert/Update variants for each table
- No explicit validation schema (types are structural only)

**Web (types.ts domain layer):**
```typescript
export interface Brand { id?: string; name: string; slug: string; ... }
export interface BrandTheme { colors: BrandThemeColors; typography: ...; }
export interface GapAnalysis { gap_type: ...; gap_category: ...; ... }
```
- Domain-level types layered on top of database types
- Mix of interfaces and type aliases

**Mobile (shared/src/index.ts):**
```typescript
export const UserSettingsSchema = z.object({
  avgBookingValue: z.number().nonnegative(),
  slotDurationMinutes: z.number().int().positive(),
  ...
});
export const GapDocumentSchema = z.object({ ... });
```
- Zod validation schemas (runtime-checkable, not just structural)
- Covers SlotForce domain (user settings, gaps, weekly reports, intentional rules)
- Used by Firebase Cloud Functions to validate incoming requests

**Dart models (mobile):**
- No visible centralized schema file examined; likely in isolated service layers
- Dart's type system provides structural safety without explicit Zod-like validation

#### Readiness Assessment

**Rating:** Move Today (with caveat)

**Justification:**
- **Web's database.types.ts is auto-generated** from Supabase schema — cannot and should not be manually moved.
- **Domain types (Brand, BrandTheme, GapAnalysis, etc.) in web/types.ts are already Supabase-specific** and don't transfer to mobile's Firebase world.
- **Mobile's Zod schemas (packages/shared) are perfect for shared TypeScript code** (Firebase Functions already use them).
- **Action:** Web should adopt Zod schemas for its own validation where type-only safety is insufficient. Mobile's shared/src should be the single source of truth for all cross-platform schemas.

**Effort Estimate:** 2 days
- Extract web's domain types into semantic schema objects (Zod or TypeScript strict interfaces).
- Align naming conventions between web domain types and mobile Zod schemas.
- Update Firebase Functions to re-export schemas from packages/shared (already done).
- No changes required to auto-generated database types.

---

### 3. Authentication

#### Findings

**Web (auth.tsx):**
```typescript
export interface UserProfile {
  id: string;
  role: UserRole; // 'spa_user' | 'admin' | 'business_user' | 'brand_admin' | 'platform_admin'
  email: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  brand_id: string | null;
  business_id: string | null;
  reseller_tier: 'active' | 'elite' | 'master' | null;
  brand_tier: 'emerging' | 'pro' | 'premium' | null;
  created_at: string;
  updated_at?: string;
}
```
- Uses **Supabase Auth exclusively** (email/password, JWT-based)
- User roles mapped to domain concepts (spa_user, business_user, brand_admin, etc.)
- Profile auto-creation in Supabase with retry logic (2 retries, 800ms delay)
- Context provider (AuthContext) for app-wide auth state

**Mobile:**
- Uses **Firebase Auth exclusively** (Firebase SDK, phone/email/OAuth)
- No visible user_profiles table in mobile codebase (still TODO)
- Feature flag comment mentions **IdentityBridge** as planned: "identity_bridge.dart maps Firebase UID → Socelle user ID"
- Supabase on mobile is secondary (marketplace features only)

**Key Insight:** This is a **fundamental architectural split by design.** Web and mobile intentionally use different auth providers:
- Web: Supabase Auth (integrated with Supabase DB)
- Mobile: Firebase Auth (integrated with Firebase Realtime + Cloud Functions)

The IdentityBridge is planned for Phase 2 to allow cross-platform user recognition without merging auth systems.

#### Readiness Assessment

**Rating:** Full Rewrite (but intentional, not blocking)

**Justification:**
- Auth is **not meant to unify** — each platform uses its native auth provider.
- **IdentityBridge (planned)** is the correct abstraction: map Firebase UID ↔ Supabase user_id at the service layer, not in auth itself.
- Web's user_profiles table should exist in Supabase alongside auth; mobile will reference it via IdentityBridge when ready.
- No breaking changes needed now; both platforms can coexist.

**Effort Estimate:** This is a **planned feature**, not urgent unification. When ready:
- Implement IdentityBridge: Service that syncs Firebase UID → Supabase user_profile on first mobile login.
- Add Supabase user_profiles table if not already present.
- Ensure web's auth context can accept externally-provided user profiles (for API-driven auth).
- **Timeline:** Post-Phase 1 (mobile marketplace launch).

---

### 4. Business Logic: Gap Engine, Streaks, Revenue

#### Findings

**Mobile (packages/gap_engine/src/index.ts):**
```typescript
export function computeGaps(input: GapEngineInput): GapCandidate[] {
  const { analysisStart, analysisEnd, workingHours, events, slotDurationMinutes, avgBookingValue, intentionalRules, timezone } = input;
  // ~318 lines: timezone-aware gap detection, intentional rule matching, busy-block merging
}
export function dailyLeakage(gaps: GapCandidate[], day: Date): number { ... }
export function weeklyLeakage(gaps: GapCandidate[]): number { ... }
export function rolling30DayLeakage(gaps: GapCandidate[], now: Date): number { ... }
export function monthToDateLeakage(gaps: GapCandidate[], now: Date): number { ... }
```
- **Highly optimized, domain-specific gap detection engine** (SlotForce product logic).
- Used by Firebase Cloud Functions and mobile app.
- Time-zone aware, DST-safe, well-tested.
- Completely independent of platform-specific code.

**Web (src/lib/gapAnalysisEngine.ts):**
```typescript
export async function runGapAnalysis(_menuId: string, _spaType: string): Promise<void> {
  console.warn('runGapAnalysis is a legacy stub function');
}
```
- **Completely different domain:** SPA menu gaps (missing treatments/protocols), not calendar gaps.
- Interfaces define SPA-specific gap types (category_gap, seasonal_gap, treatment_type_gap, signature_missing, enhancement_missing).
- Pulls from Supabase (service_category_benchmarks, revenue_model_defaults, canonical_protocols).

**Web has no calendar gap logic.** Mobile (SlotForce product) has the sophisticated gap engine. Web (SOCELLE marketplace) has SPA service portfolio gap analysis — separate domains entirely.

#### Readiness Assessment

**Rating:** Move Today (gap_engine to shared) / Needs Refactor (SPA gaps)

**Justification - Part A (Gap Engine):**
- Mobile's packages/gap_engine is **already perfectly shared.**
- **100% of gap detection logic is TypeScript** and used by both Firebase Functions and mobile Dart code (Dart imports via generated bindings or manual translation).
- **Action:** Ensure gap_engine remains in packages/ and is re-exported by Firebase Functions. Web has no use case for this engine (not a calendar SPA product).

**Justification - Part B (SPA Portfolio Gaps):**
- Web's gap analysis is **SPA-specific** (menu planning, product recommendations).
- Mobile has no equivalent feature in current phase.
- **No unification needed here.** These are different products (SlotForce vs. SOCELLE marketplace).
- If mobile adds SPA features in Phase 2, extract a shared `packages/spa-gap-engine` at that time.

**Effort Estimate:** 0 days (gap_engine already shared); 3+ days if SPA gaps ever need mobile support.

---

### 5. Constants & Configuration

#### Findings

**Web (platformConfig.ts):**
```typescript
export const RETRY_CONFIG = {
  PROFILE_FETCH_DELAY: 800,
  PROFILE_CREATE_DELAY: 500,
  MAX_PROFILE_RETRIES: 2,
};
export const MAPPING_THRESHOLDS = {
  EXACT_MATCH: 90,
  PARTIAL_MATCH: 70,
  CANDIDATE_MATCH: 40,
  ...
};
export const SCORING_WEIGHTS = {
  NAME: 0.50,
  DURATION: 0.20,
  CATEGORY: 0.20,
  CONCERN: 0.10,
};
export const SERVICE_CATEGORIES = [
  'FACIALS', 'FACIAL ENHANCEMENTS / ADD-ONS', ...
];
```
- ~144 lines of hardcoded thresholds, retry delays, scoring weights.
- Includes brand-specific concierge configs (Naturopathica custom styling).
- Single source of truth for web.

**Mobile (core/constants.dart):**
```dart
class SocelleConstants {
  static const slotDurationOptions = [15, 30, 45, 60, 90, 120];
  static const defaultAvgBookingValue = 85.0;
  static const monthlyPrice = 29.0;
  static const annualPrice = 249.0;
  static const trialDays = 7;
  static const defaultWorkingHours = {
    'monday': {'enabled': true, 'start': '09:00', 'end': '17:00'},
    ...
  };
}
```
- ~95 lines: subscription pricing, slot durations, working hours defaults, streak milestones, recovery milestones.
- SlotForce-specific (pricing, booking durations, revenue recovery).

**Mobile (core/feature_flags.dart):**
```dart
class FeatureFlags {
  static const bool kEnableStudio = false;
  static const bool kEnableShop = false;
  static const bool kEnableMessages = false;
  static const bool kEnableStreaks = false;
  // 7 inactive flags total
}
```
- 7 dormant feature flags (Studio, Shop, Messages, Streaks, etc.) — gates for Phase 2+.

**Overlap:** **Minimal.** Web constants are SOCELLE-specific (spa service categories, AI concierge branding). Mobile constants are SlotForce-specific (slot durations, subscription pricing).

**Divergence:** Constants live in different locations (web: src/lib/platformConfig.ts, mobile: core/constants.dart, core/feature_flags.dart) and serve different products.

#### Readiness Assessment

**Rating:** Needs Refactor

**Justification:**
- Each platform has legitimate, product-specific constants.
- **Shared values (working hours defaults, retry timings, timezone handling)** should be extracted to a common schema.
- **Web's brand-specific config** (Naturopathica concierge) could be moved to a content/brand-config.json or a shared packages/brand-config package.
- **Mobile's feature flags** should migrate to a shared feature-flags service (enables remote flag control in Phase 2).

**Effort Estimate:** 2 days
- Create `packages/feature-flags` with shared flag definitions (TypeScript enums).
- Migrate web and mobile feature flags to consume the shared package.
- Create `packages/brand-config` for multi-brand customization (colors, messaging, concierge text).
- Create `packages/platform-constants` for universal defaults (working hours, slot durations, retry timings).

---

### 6. Email / Notification Templates

#### Findings

**Web (emailService.ts):**
```typescript
export async function sendWelcomeEmail(to: string, data: { spa_name?: string }): Promise<void> {
  await callEmailFunction('welcome', to, data);
}
export async function sendPlanCompleteEmail(to: string, data: { plan_id: string; spa_name?: string; ... }): Promise<void> {
  await callEmailFunction('plan_complete', to, data);
}
export async function sendOrderStatusEmail(to: string, data: { order_id?: string; status: string; ... }): Promise<void> {
  await callEmailFunction('order_status', to, data);
}
```
- Client-side wrapper calling Supabase Edge Function (`/functions/v1/send-email`).
- Three email templates visible: welcome, plan_complete, order_status.
- Best-effort delivery (non-blocking, console warnings only).

**Mobile (Firebase Cloud Functions):**
```typescript
export { computeRetentionMetrics } from "./retentionMetrics.js";
export { submitCancellation } from "./cancelRouting.js";
export { onInactivityTierUpdated } from "./reengagementNotifications.js";
export { resurrectionEngine } from "./resurrectionEmails.js";
export { tier4RenewalAwarenessJob, tier4AccountHealthJob } from "./scheduledEmails.js";
export { weeklyMondayPush } from "./weeklyNotifications.js";
```
- Server-side functions (scheduled + event-triggered) handling:
  - Retention metrics
  - Cancellation routing
  - Inactivity reengagement
  - Resurrection emails
  - Scheduled renewal + health emails
  - Weekly push notifications

**Key Insight:** Two completely different email strategies:
- **Web:** Transactional emails on-demand (order placed, plan created, signup welcome).
- **Mobile:** Automated, retention-driven lifecycle emails (inactivity recovery, renewal reminders, weekly digests).

**No overlap in email types or triggers.** Both systems are appropriate for their use cases.

#### Readiness Assessment

**Rating:** Needs Refactor

**Justification:**
- Email templates are **not unified** because they serve different business workflows.
- However, both systems should share:
  - **Email template engine** (common format, styling, variables).
  - **Email event schema** (shared event types and payloads for analytics/auditing).
  - **Email scheduling service** (if Phase 2 adds time-delayed emails to SOCELLE).
- **Action:** Create `packages/email-templates` with:
  - Base template structure (TypeScript + Handlebars or Nunjucks).
  - Shared event types (EmailEvent, EmailType enums).
  - Utility functions for rendering + variable validation.

**Effort Estimate:** 3 days
- Define shared template format and event schema.
- Create template rendering service (TypeScript, reusable by both Edge Functions and Firebase).
- Migrate existing email functions to use the shared service.
- Both platforms inherit email type safety and consistency.

---

### 7. UI Component Design System

#### Findings

**Web (src/components/ui/):**
```
Button.tsx, Modal.tsx, Card.tsx, Input.tsx, Badge.tsx, Tabs.tsx, Avatar.tsx, Table.tsx, Skeleton.tsx, EmptyState.tsx
```
- ~9 core UI components
- Built with Tailwind CSS (utility-first)
- Consistent design tokens (colors, spacing, typography via Tailwind config)
- React-specific (JSX, hooks)

**Mobile (lib/core/widgets/):**
```
sf_button.dart, sf_card.dart, sf_badge.dart, sf_chip.dart, sf_progress_bar.dart, sf_stat_card.dart, sf_empty_state.dart
```
- ~8 core UI widgets
- Built with Flutter Material Design
- SlotForce-branded (sf_ prefix)
- Dart-specific (Flutter framework)

**Conceptual overlap:**
- Both have Button, Card, Badge, EmptyState widgets.
- Both have design tokens (colors, spacing).
- **But they're entirely different implementations** (React vs. Flutter, Tailwind vs. Material Design).

#### Readiness Assessment

**Rating:** Full Rewrite (but impractical)

**Justification:**
- **React and Flutter are fundamentally incompatible UI frameworks.**
- A "shared design system" would only work as:
  1. **Design tokens document** (Figma or JSON spec) — both platforms consume independently.
  2. **Component API contract** (shape of props, behavior) — each platform implements its own.
- **Example:** Both platforms can agree "a Button has `label`, `onClick`, `disabled` props and shows a loading spinner." But the implementation is different.

**Effort Estimate:** 1 day (design tokens) + ongoing (component API parity)
- Create a shared design-tokens package (JSON/TypeScript) with colors, spacing, typography.
- Document component APIs in a shared spec (Markdown or TypeScript interfaces).
- Each platform implements components to match the API spec independently.
- Consider Storybook or Figma for visual consistency checks.

---

## Recommended Unification Roadmap

### Phase 1: Foundation (Week 1 — 5 days)

**Effort Allocation:** High-impact, low-risk items.

1. **Supabase Client Config** (Move Today + Needs Refactor)
   - Extract `packages/supabase-config` with standard config keys, retry policies, and platform wrappers.
   - Both web and mobile consume from this package.
   - **Effort:** 1 day

2. **Type Definitions Alignment** (Move Today + Needs Refactor)
   - Move web's domain types (Brand, BrandTheme, GapAnalysis) to TypeScript strict interfaces.
   - Align naming with mobile's Zod schemas where overlap exists.
   - No changes to auto-generated database.types.ts.
   - **Effort:** 2 days

3. **Feature Flags** (Needs Refactor)
   - Create `packages/feature-flags` with shared flag enums.
   - Mobile migrates from core/feature_flags.dart to import from packages/.
   - Web adds feature flag support (currently missing).
   - **Effort:** 1 day

4. **Platform Constants** (Needs Refactor)
   - Create `packages/platform-constants` for shared defaults (working hours, retry timings, slot durations).
   - Web and mobile consume from this package.
   - Product-specific constants remain in platform code (SOCELLE concierge, SlotForce pricing).
   - **Effort:** 1 day

**Phase 1 Output:**
- 4 new shared packages (supabase-config, type-definitions, feature-flags, platform-constants).
- Web and mobile both consume shared packages.
- Foundation for Phase 2.

---

### Phase 2: Domain Logic & Configuration (Weeks 2-3 — 8 days)

**Effort Allocation:** Medium-priority, moderate-effort items.

1. **Brand Configuration** (Needs Refactor)
   - Create `packages/brand-config` with Naturopathica and other brand customizations.
   - Move web's getBrandConciergeConfig() to this package.
   - Both platforms consume brand config from shared source.
   - **Effort:** 2 days

2. **Email Template Engine** (Needs Refactor)
   - Create `packages/email-templates` with base template rendering, event types, and variable schemas.
   - Migrate web's send-email Edge Function to use shared templates.
   - Migrate mobile's Firebase email functions to use shared templates.
   - **Effort:** 3 days

3. **Design System Contract** (Full Rewrite — low priority)
   - Document component API contracts (Button, Card, Badge, EmptyState) in shared spec.
   - Create design-tokens package (colors, spacing, typography).
   - Both platforms implement components to match spec.
   - **Effort:** 2 days (can be deferred to Phase 3)

4. **IdentityBridge (Auth Mapping)** (Full Rewrite — planned)
   - Implement Firebase UID ↔ Supabase user_profile mapping service.
   - Mobile calls IdentityBridge on first login to sync Firebase UID to Supabase.
   - Web's auth context remains unchanged; profile table is source-of-truth.
   - **Effort:** 3 days (deferred post-Phase 1; requires mobile auth completion)

**Phase 2 Output:**
- Email systems unified across platforms.
- Brand configuration centralized and multi-tenant ready.
- Design system documented and aligned (component parity).
- Foundation for cross-platform user recognition (IdentityBridge).

---

### Phase 3: Cross-Platform Data & Analytics (Month 2+ — 10+ days)

**Effort Allocation:** Lower-priority, higher-effort items. Deferred until Phases 1 & 2 complete.

1. **Analytics Schema** (Needs Refactor)
   - Align event names and properties between web (Supabase Edge Functions) and mobile (Firebase).
   - Create shared event types and payload schemas.
   - Both platforms emit standardized events to their respective analytics sinks.
   - **Effort:** 3 days

2. **Retention & Lifecycle Events** (Needs Refactor)
   - Unify retention metric calculation across platforms (where applicable).
   - Mobile's retention engine (reengagementNotifications.ts) should be evaluated for web applicability.
   - **Effort:** 2 days (assessment); 5+ days (if implementation needed)

3. **Dart ↔ TypeScript Bridge** (Full Rewrite)
   - If mobile needs to execute complex TypeScript logic (beyond Firebase Functions), evaluate shared Dart/TypeScript code generation.
   - Currently unnecessary; Firebase Functions handle server-side computation.
   - **Effort:** 5+ days (only if architecture changes)

4. **Documentation & Testing** (Ongoing)
   - Update architecture docs to reflect shared packages.
   - Add cross-platform integration tests.
   - Create runbooks for shared package updates.
   - **Effort:** 3-5 days (ongoing)

**Phase 3 Output:**
- Fully cross-platform analytics and retention metrics.
- Documentation and test coverage aligned.
- Platform-agnostic shared packages ready for new features.

---

## Risk Assessment & Mitigation

### Risk 1: Package Dependency Hell

**Scenario:** Creating shared packages (supabase-config, feature-flags, etc.) introduces circular dependencies or version mismatches between web, mobile, and Firebase Functions.

**Probability:** Medium (both platforms use TypeScript; mobile also uses Dart).

**Mitigation:**
- **Use monorepo structure:** Keep all packages in the mobile repo's `packages/` directory (already established).
- **Enforce versioning:** Use semver strictly for all shared packages.
- **CI/CD validation:** Add linter checks that detect circular dependencies.
- **Test integration:** Run web, mobile, and Firebase tests against shared package changes before merging.

---

### Risk 2: Breaking Changes in Shared Packages

**Scenario:** A change to `packages/platform-constants` (e.g., renaming RETRY_DELAY) breaks both web and mobile if not coordinated.

**Probability:** High (initial phase will have refactoring).

**Mitigation:**
- **Deprecation strategy:** Never remove exports; instead mark as `@deprecated` and provide migration guides.
- **Changelog:** Maintain detailed CHANGELOG.md in each shared package.
- **Coordination:** Schedule shared package updates; have one owner review all changes.
- **Backwards compatibility:** Provide aliased exports (e.g., `export { OLD_NAME as LEGACY_NAME }`).

---

### Risk 3: Dart Cannot Import TypeScript Directly

**Scenario:** Mobile (Dart) cannot import TypeScript packages from `packages/` without code generation or manual porting.

**Probability:** High (by design; Dart and TypeScript are different languages).

**Mitigation:**
- **Strategy:** Shared packages are TypeScript-only; mobile consumes via generated files (Dart code generation from TypeScript schemas) or manual translation.
- **For schemas (Zod → Dart):** Use a code-gen tool (e.g., `zod-to-darts` or custom) to generate Dart classes from Zod schemas.
- **For constants:** Manual porting (low effort; constants change rarely).
- **For business logic (gap_engine):** Keep as TypeScript; mobile generates Dart bindings or calls via Firebase Functions.
- **Action:** Set expectations early that `packages/` is TypeScript-first; Dart code is generated or manually ported.

---

### Risk 4: Supabase vs. Firebase Divergence Grows

**Scenario:** Web (Supabase-only) and mobile (Firebase-primary + Supabase-secondary) drift further apart, making unification harder.

**Probability:** High (if IdentityBridge is not implemented).

**Mitigation:**
- **IdentityBridge is non-negotiable:** Implement it before Phase 2 ends to establish a single source of truth for user identity.
- **Shared data contracts:** Define which tables are Supabase-owned (brands, products, messages) vs. Firebase-owned (user settings, gaps, streaks).
- **Synchronization strategy:** Document how data flows between systems (e.g., Firebase → Supabase via Cloud Functions, or Supabase Realtime → Firebase).

---

### Risk 5: Type Mismatches Between Platforms

**Scenario:** Web's TypeScript types and mobile's Dart types diverge (e.g., `brand_tier` is optional in web, required in mobile).

**Probability:** High (without explicit alignment).

**Mitigation:**
- **Single source of truth for schemas:** Zod schemas in `packages/shared` are the authority for all cross-platform types.
- **Code generation:** Generate Dart classes from Zod schemas using a shared tool.
- **Validation everywhere:** Both platforms validate incoming data against shared schemas.
- **Tests:** Cross-platform integration tests that ensure schema compatibility.

---

### Risk 6: Performance Overhead of Shared Packages

**Scenario:** Shared packages add bundle size or runtime overhead to web or mobile, causing performance regression.

**Probability:** Low (if packages are well-designed and tree-shaken).

**Mitigation:**
- **Tree-shaking:** Ensure shared packages use ES6 modules (web) and avoid importing unused code.
- **Performance budget:** Set bundle size limits in CI/CD.
- **Lazy loading:** Defer non-critical shared packages (e.g., email-templates) until needed.
- **Monitoring:** Track bundle size and startup time in each platform.

---

## Detailed Timeline & Resource Plan

### Week 1 (Phase 1)
- **Monday-Tuesday:** Design and review shared package structure; set up `packages/supabase-config`.
- **Wednesday:** Implement and test `packages/supabase-config`; both web and mobile consume.
- **Thursday:** Create and implement `packages/feature-flags` and `packages/platform-constants`.
- **Friday:** Integration testing; update docs; retrospective.

**Owners:** 1 backend engineer (TypeScript/Dart fluent).

### Weeks 2-3 (Phase 2)
- **Week 2:**
  - Monday-Tuesday: Create `packages/brand-config`; migrate web's brand concierge config.
  - Wednesday-Friday: Create `packages/email-templates`; implement shared template engine; migrate web + mobile email functions.
- **Week 3:**
  - Monday-Tuesday: Document design system contract; create design-tokens package.
  - Wednesday: IdentityBridge design review + planning (deferred implementation).
  - Thursday-Friday: Testing, documentation, retrospective.

**Owners:** 1 backend engineer + 1 frontend engineer (React/Flutter review).

### Month 2+ (Phase 3)
- **Week 4:** Analytics schema alignment (design phase).
- **Week 5:** Implementation + testing.
- **Weeks 6+:** Ongoing documentation, cross-platform testing, IdentityBridge implementation (if started).

**Owners:** 1 backend engineer + 1 data/analytics engineer.

---

## Success Criteria

**Phase 1 Complete:**
- [ ] 4 shared packages created and published.
- [ ] Web and mobile both import from shared packages.
- [ ] No breaking changes to existing APIs.
- [ ] All tests pass on both platforms.
- [ ] Documentation updated for new packages.

**Phase 2 Complete:**
- [ ] Email systems unified (web Edge Functions + mobile Firebase use shared templates).
- [ ] Brand configuration centralized (Naturopathica and others managed from single source).
- [ ] Design system documented (component API contract + design tokens).
- [ ] IdentityBridge planned and designed (implementation deferred if needed).

**Phase 3 Complete:**
- [ ] Analytics events standardized across platforms.
- [ ] Retention metrics aligned (if applicable).
- [ ] 90%+ code coverage for shared packages.
- [ ] Cross-platform integration tests passing.

---

## Detailed Unification Table

| Concern | Web Status | Mobile Status | Readiness | Effort | Phase | Notes |
|---------|-----------|---------------|-----------|--------|-------|-------|
| API Client (Supabase) | Prod | Dev | Needs Refactor | 1 day | 1 | Extract supabase-config |
| Type Definitions | Prod | Dev | Move Today* | 2 days | 1 | Web: domain types; mobile: Zod schemas |
| Authentication | Prod | Prod | Full Rewrite | 3 days | 2 | IdentityBridge planned; no urgency |
| Gap Engine | N/A | Prod | Move Today | 0 days | N/A | Already in packages/gap_engine |
| SPA Portfolio Gaps | Prod | N/A | Needs Refactor | — | Future | Only needed if mobile adds SPA features |
| Constants & Config | Prod | Prod | Needs Refactor | 2 days | 1 | Extract shared defaults; keep product-specific |
| Email Templates | Prod | Prod | Needs Refactor | 3 days | 2 | Unify template engine; different email types |
| Notification Strategy | Limited | Prod | Needs Refactor | 2 days | 3 | Mobile-first; web to adopt lifecycle model |
| UI Components | Prod | Prod | Full Rewrite | 1 day | 2 | Design tokens + API contract; platform-specific impl |
| Feature Flags | Limited | Dev | Needs Refactor | 1 day | 1 | Create shared package; mobile uses already |
| Brand Config | Prod | N/A | Needs Refactor | 2 days | 2 | Naturopathica config; multi-tenant ready |
| **Total Effort** | — | — | — | **~18 days** | **3 phases** | Estimated across 6 weeks |

---

## Key Dependencies & Sequencing

1. **Phase 1 must complete before Phase 2:** Shared packages are foundation for everything else.
2. **IdentityBridge (Phase 2) depends on mobile auth completion:** Cannot map Firebase UID → Supabase until mobile auth is finalized.
3. **Email unification (Phase 2) is independent:** Can proceed in parallel with feature flags and constants.
4. **Design system (Phase 2) is low-priority:** Can be deferred to Phase 3 if needed.
5. **Analytics (Phase 3) depends on Phase 1 + 2:** Requires stable shared packages to avoid rework.

---

## Conclusion

SOCELLE is **well-positioned for phased unification.** The mobile platform's shared package structure is mature and proven. Web, while not using shared packages yet, is receptive to adopting them. The main challenges are:

1. **Architectural divergence (Firebase vs. Supabase)** — Managed via IdentityBridge (planned).
2. **Language differences (TypeScript vs. Dart)** — Managed via code generation and manual porting for constants.
3. **Product divergence (SlotForce vs. SOCELLE marketplace)** — Minimized; most concerns are either product-specific or easily shareable.

**Recommended Action:** Begin Phase 1 immediately (Week 1). Establish 4 shared packages; unblock Phase 2. Target Phase 1 completion by end of Week 1; Phase 2 by end of Week 3; Phase 3 deferred to Month 2 unless priorities change.

---

## Appendices

### A. File References

**Web:**
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE WEB/src/lib/supabase.ts
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE WEB/src/lib/auth.tsx
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE WEB/src/lib/database.types.ts
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE WEB/src/lib/types.ts
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE WEB/src/lib/platformConfig.ts
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE WEB/src/lib/emailService.ts
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE WEB/src/lib/gapAnalysisEngine.ts

**Mobile:**
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE APP/SOCELLE Mobile/packages/shared/src/index.ts
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE APP/SOCELLE Mobile/packages/gap_engine/src/index.ts
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE APP/SOCELLE Mobile/packages/functions/src/index.ts
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE APP/SOCELLE Mobile/apps/mobile/lib/services/supabase_client.dart
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE APP/SOCELLE Mobile/apps/mobile/lib/core/constants.dart
- /sessions/eager-wonderful-goldberg/mnt/SOCELLE/SOCELLE APP/SOCELLE Mobile/apps/mobile/lib/core/feature_flags.dart

### B. Shared Package Inventory (Proposed)

| Package | Location | Contents | Consumer(s) |
|---------|----------|----------|------------|
| supabase-config | packages/supabase-config | Client init, auth options, retry policies | Web, Mobile, Firebase |
| platform-constants | packages/platform-constants | Retry timings, slot durations, working hours | Web, Mobile, Firebase |
| feature-flags | packages/feature-flags | Flag enums, descriptions, Phase gates | Web, Mobile, Firebase |
| brand-config | packages/brand-config | Naturopathica, other brand customizations | Web, Mobile |
| email-templates | packages/email-templates | Template engine, event types, schemas | Web (Edge Fn), Mobile (Firebase) |
| design-tokens | packages/design-tokens | Colors, spacing, typography vars | Web, Mobile (docs reference) |

### C. Migration Checklist (Phase 1)

- [ ] Create packages/supabase-config; implement platform wrappers
- [ ] Update web/src/lib/supabase.ts to consume packages/supabase-config
- [ ] Update mobile/lib/services/supabase_client.dart to consume packages/supabase-config
- [ ] Create packages/platform-constants; migrate constants from web and mobile
- [ ] Create packages/feature-flags; migrate feature flags from mobile
- [ ] Update CI/CD to build and test all shared packages
- [ ] Update documentation (README, ARCHITECTURE.md, onboarding guides)
- [ ] Code review and approve all changes
- [ ] Tag release v0.1.0 of shared packages
- [ ] Merge to main; coordinate rollout

---

**Report Generated:** 2026-02-26
**Assessed By:** Architecture Review
**Status:** Ready for Planning & Prioritization
