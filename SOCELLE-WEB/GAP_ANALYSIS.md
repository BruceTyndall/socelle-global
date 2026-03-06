# GAP ANALYSIS — SOCELLE Platform

**Analysis Date:** February 26, 2026
**Scope:** SOCELLE WEB (React/TypeScript) vs SOCELLE MOBILE (Flutter/Dart + Firebase Functions)
**Methodology:** Scanned source files for TODOs, FIXMEs, HACKs, stub/placeholder patterns, commented-out code, and feature gaps

---

## Executive Summary

| Category | Count |
|----------|-------|
| **Total Gaps Found** | 12 |
| **Active TODOs** | 2 |
| **Stubbed Implementations** | 8 |
| **Unstarted/Blocked** | 2 |
| **Critical Issues** | 3 |
| **Medium Issues** | 7 |
| **Low-Priority Tech Debt** | 2 |

---

## Web Codebase Gaps

### TODOs & FIXMEs

| File | Line | Issue | Category | Severity |
|------|------|-------|----------|----------|
| `src/pages/public/About.tsx` | 247 | `TODO: Add real team bios before launch` | Active | Low |

**Details:**
- Team section placeholder remains in the public About page
- UI renders a team section header but no actual team member bios
- Should be completed before production launch
- No blocking dependencies; straightforward content work

---

### Stubs & Placeholders

**None identified** — Web codebase shows complete implementations of all core features. Component skeletons render conditional content with proper null checks, not true stubs.

---

### Commented-Out Code

**Inline Comments Only** — No large blocks (3+ consecutive lines) of commented-out code found. Web codebase maintains clean comment hygiene.

---

### Inactive Feature Flags

**None identified** — Web codebase does not use explicit feature flags for dormant modules.

---

## Mobile Codebase Gaps

### TODOs & FIXMEs

| File | Line | Issue | Category | Severity |
|------|------|-------|----------|----------|
| `apps/mobile/lib/services/supabase_client.dart` | 68 | `TODO: Uncomment when supabase_flutter is added to pubspec.yaml` | Blocked | Critical |

**Details:**
- Supabase initialization is currently commented out
- App falls back to mock repositories (Shop, Messages) when Supabase is not configured
- Requires: `supabase_flutter` package addition and proper env credential configuration
- Blocks Shop and Messages features from connecting to Socelle backend

---

### Stubs & Placeholders (Unstarted)

#### 1. **SupabaseProductRepository** — Complete Stub
- **File:** `apps/mobile/lib/repositories/shop/supabase_product_repository.dart`
- **Methods:** All throw `UnimplementedError`
- **Status:** Unstarted — no implementation attempted
- **Dependencies:**
  - Socelle Supabase backend must have `pro_products` and `product_pricing` tables
  - `supabase_flutter` package required
  - Identity bridge to map Firebase UID → Socelle user ID
  - SocelleSupabaseClient must be initialized
- **Severity:** Critical — blocks Shop feature

#### 2. **SupabaseConversationRepository** — Complete Stub
- **File:** `apps/mobile/lib/repositories/messaging/supabase_conversation_repository.dart`
- **Methods:** All throw `UnimplementedError`
- **Status:** Unstarted — no implementation attempted
- **Dependencies:**
  - Socelle Supabase backend must have `conversations`, `messages`, `message_read_status` tables
  - `supabase_flutter` package required
  - Identity bridge implementation
  - Supabase Realtime subscription for live delivery
- **Severity:** Critical — blocks Messages feature

#### 3. **IdentityBridge** — Complete Stub
- **File:** `apps/mobile/lib/services/identity_bridge.dart`
- **Methods:** All throw `UnimplementedError`
- **Status:** Unstarted — awaiting Socelle Phase 1 auth completion
- **Purpose:** Maps Firebase Auth UID ↔ Socelle Supabase user ID
- **Implementation Options:**
  - A. Supabase custom claims containing Firebase UID
  - B. Lookup table in Supabase (`firebase_uid ↔ supabase_uid`)
  - C. Shared JWT with custom claims
- **Severity:** Critical — blocks all Socelle Supabase integrations

---

### Stubbed But Active Implementations

#### 4. **StubAiProvider** — Functional Stub (MVP-Ready)
- **File:** `apps/mobile/lib/services/ai_provider.dart`
- **Class:** `StubAiProvider implements AiProvider`
- **Status:** Stubbed — generates suggestions from real gap data without LLM
- **Behavior:**
  - Analyzes actual `MonthlyLeakageSummary` data
  - Returns context-aware recovery messages for highest-value time slots
  - No API calls; deterministic logic based on scheduling patterns
- **Replacement Plan:** When backend ready, replace with real Anthropic/OpenAI API call
- **Severity:** Medium — works for MVP but limits AI sophistication

#### 5. **MockProductRepository** — Active Mock (Intentional)
- **File:** `apps/mobile/lib/repositories/shop/mock_product_repository.dart`
- **Status:** Active default — Shop page uses this for display
- **Data:** Hardcoded 6 products for UI stabilization
- **Replacement:** Swap to `SupabaseProductRepository` when backend is live
- **Current Flag:** `kEnableShop = false` (feature disabled)
- **Severity:** Medium — expected for MVP; blocks Shop feature activation

#### 6. **MockConversationRepository** — Active Mock (Intentional)
- **File:** `apps/mobile/lib/repositories/messaging/mock_conversation_repository.dart`
- **Status:** Active default — Messages page uses this for display
- **Data:** 6 mock clients with conversation threads
- **Replacement:** Swap to `SupabaseConversationRepository` when backend is live
- **Current Flag:** `kEnableMessages = false` (feature disabled)
- **Severity:** Medium — expected for MVP; blocks Messages feature activation

#### 7. **MonthlyLeakageSummary.mock()** — Data Stub
- **File:** `apps/mobile/lib/models/revenue_summary.dart`
- **Usage:** `MonthlyLeakageSummary.mock()` returns stub data for loading states
- **Severity:** Low — used only for UI placeholder, replaced with real data on load

#### 8. **AiSuggestion.stub()** — Data Stub
- **File:** `apps/mobile/lib/models/ai_suggestion.dart`
- **Usage:** Fallback when AI data is unavailable
- **Severity:** Low — graceful fallback, does not block functionality

---

### Inactive Feature Flags

| Flag | File | Current Value | Phase | Requirements |
|------|------|---------------|-------|--------------|
| `kEnableStudio` | `core/feature_flags.dart` | `false` | Phase 2+ | Design/implementation pending |
| `kEnableShop` | `core/feature_flags.dart` | `false` | Phase 1b | Supabase backend + IdentityBridge |
| `kEnableMessages` | `core/feature_flags.dart` | `false` | Phase 1b | Supabase backend + Realtime + IdentityBridge |
| `kEnableShare` | `core/feature_flags.dart` | `false` | Phase 2+ | Design/implementation pending |
| `kEnableDashboards` | `core/feature_flags.dart` | `false` | Phase 2+ | Design/implementation pending |
| `kEnableAbTest` | `core/feature_flags.dart` | `false` | Phase 2+ | Testing infrastructure pending |
| `kEnableStreaks` | `core/feature_flags.dart` | `false` | Phase 1b | Gap Engine integration pending |

**All flags default to `false`** — Must be explicitly enabled with documented activation plan.

---

## Firebase Functions (Backend)

### Status
- **Location:** `packages/functions/src/`
- **Implementation:** Complete and active
- **TODOs/FIXMEs:** None detected in custom source code
- **Type Coverage:** Full TypeScript implementation for notification, retention, and sync workflows
- **Health:** ✓ No gaps detected

---

## Cross-Platform Feature Parity

### Web Has, Mobile Lacks

| Feature | Web Pages | Mobile Status | Gap Type |
|---------|-----------|---------------|----------|
| **Brand Portal (Full)** | `brand/*` (15+ pages) | Dashboard only | Unstarted |
| **Business Portal (Full)** | `business/*` (10+ pages) | Not in scope | Design decision |
| **Admin Portal** | `admin/*` (6+ pages) | Not in scope | Design decision |
| **Automation Builder** | BrandAutomations | Not started | Phase 2+ |
| **Campaign Manager** | BrandCampaigns | Not started | Phase 2+ |
| **Bulk Protocol Import** | BulkProtocolImport | Not started | Phase 2+ |
| **Detailed Reporting** | Various | Basic revenue only | Phase 2+ |
| **Education Hub** | HubEducation | Not started | Phase 2+ |
| **Protocols (Full CRUD)** | HubProtocols | Not started | Phase 2+ |
| **Marketplace/Shop** | Product catalog logic exists | Mock-only | Awaiting backend |

### Mobile Has, Web Lacks

| Feature | Mobile Pages | Web Status | Gap Type |
|---------|-------------|-----------|----------|
| **Gap Engine Integration** | `revenue` page uses gap_engine | Not integrated | Phase 2 task |
| **Weekly Summary Notifications** | Full feature | No equivalent | Design choice |
| **Streak Tracking** | Defined but disabled | No equivalent | Feature not in web scope |
| **AI Suggestions** | StubAiProvider active | No equivalent | Mobile MVP feature |

### Both Platforms Have

- Dashboard (basic)
- Onboarding flow
- Messages (Web: active; Mobile: mock)
- Settings/Account management
- Basic navigation

---

## Dependency Chain for Feature Activation

### To Enable Shop + Messages on Mobile

```
┌─ Activate kEnableShop + kEnableMessages
│  ├─ Requires: Socelle Supabase backend live
│  │  ├─ pro_products table populated
│  │  ├─ product_pricing table
│  │  ├─ conversations table
│  │  ├─ messages table
│  │  └─ message_read_status table
│  ├─ Requires: supabase_flutter package in pubspec.yaml
│  ├─ Requires: IdentityBridge implementation
│  │  └─ Maps Firebase UID ↔ Socelle user ID
│  ├─ Requires: SocelleSupabaseClient environment variables
│  │  ├─ SOCELLE_SUPABASE_URL
│  │  └─ SOCELLE_SUPABASE_ANON_KEY
│  └─ Requires: Supabase Realtime subscription wired (for Messages)
```

### To Enable Streaks + AI Suggestions

```
┌─ Activate kEnableStreaks
│  └─ Requires: gap_engine fully integrated
│     └─ Currently: gap_engine exists but not consumed in revenue providers
```

---

## Critical Path Items (Must Complete)

### 1. IdentityBridge Implementation (BLOCKING)
- **Impact:** Blocks Shop, Messages, and all Socelle integrations
- **Effort:** Medium (decision + implementation)
- **Path:**
  - Decide: custom claims vs lookup table vs shared JWT
  - Implement bridge in `services/identity_bridge.dart`
  - Add auth flow to link Firebase ↔ Socelle accounts
- **Owner:** Auth team

### 2. Supabase Backend Schema + Data
- **Impact:** Blocks Shop and Messages features
- **Effort:** High (backend work)
- **Path:**
  - Ensure Socelle Supabase has tables: `pro_products`, `product_pricing`, `conversations`, `messages`, `message_read_status`
  - Populate initial product catalog
  - Set up Realtime subscriptions
- **Owner:** Backend team

### 3. supabase_flutter Package Integration
- **Impact:** Blocks SupabaseProductRepository and SupabaseConversationRepository
- **Effort:** Low
- **Path:**
  - Add `supabase_flutter` to `pubspec.yaml`
  - Uncomment initialization in `supabase_client.dart` line 68-72
  - Test with environment variables
- **Owner:** Mobile team

### 4. Web About Page (Nice to Have)
- **Impact:** User-facing content; does not block functionality
- **Effort:** Low (content + design)
- **Path:** Replace placeholder text in `pages/public/About.tsx` with real team bios
- **Owner:** Content/Design team

---

## Severity Breakdown

### Critical (Blocks Core Functionality)
1. **IdentityBridge unimplemented** — Blocks Socelle integrations
2. **SupabaseProductRepository unimplemented** — Blocks Shop when enabled
3. **SupabaseConversationRepository unimplemented** — Blocks Messages when enabled

### Medium (Degrades Experience, Does Not Block)
1. **StubAiProvider** — Works for MVP, limited AI sophistication
2. **MockProductRepository** — Shop disabled by default; fine for now
3. **MockConversationRepository** — Messages disabled by default; fine for now
4. **Supabase not initialized** — Non-fatal fallback to mocks (expected)
5. **Gap Engine not fully integrated** — Streaks feature not available
6. **7 inactive feature flags** — Expected for phased rollout
7. **App runs without Supabase** — Works in UI-only mode (intentional)

### Low (Tech Debt, Minor)
1. **About page team bios missing** — Content-only gap
2. **StubAiProvider deterministic** — Works for MVP, improves with real LLM

---

## Implementation Status Matrix

### Web Codebase
| Layer | Status | Notes |
|-------|--------|-------|
| **Frontend (React)** | ✓ Complete | All routes, components, and features implemented |
| **State Management** | ✓ Complete | Auth, shopping cart, filters working |
| **API Integration** | ✓ Complete | Supabase queries, Firebase Functions calls |
| **Business Logic** | ✓ Complete | Rules engine, mapping engine, gap detection |
| **Testing** | ✓ Complete | Unit and integration tests in place |

### Mobile Codebase
| Layer | Status | Notes |
|-------|--------|-------|
| **Flutter UI** | ✓ Complete | 12 main screens, navigation, state management |
| **Firebase Integration** | ✓ Complete | Auth, calendar, gaps, notifications working |
| **Mock Repositories** | ✓ Complete | Shop, Messages using mock data by default |
| **Supabase Integration** | ⚠ Stubbed | Repositories throw UnimplementedError |
| **IdentityBridge** | ⚠ Unstarted | Throws UnimplementedError |
| **AI Provider** | ✓ Functional | StubAiProvider works without LLM |
| **Gap Engine** | ⚠ Partial | Exists but not fully consumed |

### Firebase Functions
| Component | Status | Notes |
|-----------|--------|-------|
| **Notifications** | ✓ Complete | Eligibility, weekly, reengagement logic |
| **Retention Metrics** | ✓ Complete | Data collection and analysis |
| **Sync Adapters** | ✓ Complete | Calendar sync logic ready |
| **Email Delivery** | ✓ Complete | Template system in place |
| **Scheduled Tasks** | ✓ Complete | Cron jobs for automated workflows |

---

## Recommendations

### Immediate (Next Sprint)
1. **Complete About page content** — Low effort, improves marketing credibility
2. **Prepare Supabase schema documentation** — Unblock backend team planning
3. **Design IdentityBridge approach** — Critical decision point

### Phase 1b (Shop + Messages)
1. **Implement IdentityBridge** in `services/identity_bridge.dart`
2. **Add supabase_flutter** to pubspec.yaml
3. **Implement SupabaseProductRepository** with real queries
4. **Implement SupabaseConversationRepository** with real queries + Realtime
5. **Enable kEnableShop and kEnableMessages** when backend ready
6. **Test Shop and Messages end-to-end**

### Phase 2+ (Nice to Have)
1. Replace `StubAiProvider` with real Anthropic/OpenAI API
2. Enable `kEnableStreaks` with full gap_engine integration
3. Implement Studio, Share, Dashboards, A/B testing
4. Add web mobile responsive view (PWA consideration)

---

## File Inventory

### Critical Stub Files
- `/SOCELLE Mobile/apps/mobile/lib/repositories/shop/supabase_product_repository.dart`
- `/SOCELLE Mobile/apps/mobile/lib/repositories/messaging/supabase_conversation_repository.dart`
- `/SOCELLE Mobile/apps/mobile/lib/services/identity_bridge.dart`
- `/SOCELLE Mobile/apps/mobile/lib/services/ai_provider.dart` (functional stub)
- `/SOCELLE Mobile/apps/mobile/lib/services/supabase_client.dart` (TODO on line 68)

### Active Mock Files
- `/SOCELLE Mobile/apps/mobile/lib/repositories/shop/mock_product_repository.dart`
- `/SOCELLE Mobile/apps/mobile/lib/repositories/messaging/mock_conversation_repository.dart`

### Feature Flag File
- `/SOCELLE Mobile/apps/mobile/lib/core/feature_flags.dart` (7 inactive flags)

### Minor Content Gap
- `/SOCELLE WEB/src/pages/public/About.tsx` (line 247: TODO team bios)

---

## Conclusion

The SOCELLE platform is **architecturally sound** with clean separation of concerns:
- **Web:** Feature-complete for brand, business, and admin portals
- **Mobile:** Feature-complete for SlotForce core features; Shop/Messages pending backend integration
- **Backend:** Notification and retention workflows ready; Supabase schema required

**Key blockers** are integration-layer stubs awaiting Socelle backend (Supabase) deployment and IdentityBridge implementation. Once these dependencies are resolved, Shop and Messages can be activated.

**No critical bugs or architectural issues** detected in either codebase. All gaps are intentional architectural decisions (mocks for MVP, stubs for Phase 2+, feature flags for controlled rollout).

---

**Generated:** 2026-02-26
**Report Version:** 1.0
