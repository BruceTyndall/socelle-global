> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.
> If this file conflicts with V1, the V1 file wins.

# SOCELLE ENTITLEMENTS & PACKAGING
**Version:** 1.1
**Effective:** March 8, 2026
**Authority:** SOCELLE Command Center
**Scope:** All hubs, all roles, all subscription tiers

---

## 1. ROLES

### Primary Roles

| Role | `user_role` Value | Description | Default Landing |
|---|---|---|---|
| **Operator** | `business_user` | Licensed spa/salon/medspa owner or director. Buys wholesale. Uses intelligence. | `/portal/dashboard` |
| **Provider** | `provider` | Licensed esthetician, injector, technician. Employed by an operator or independent. | `/portal/dashboard` |
| **Brand** | `brand_admin` | Professional beauty brand representative. Sells wholesale. Manages storefront. | `/brand/dashboard` |
| **Admin** | `platform_admin` | SOCELLE platform operations. Full access. | `/admin` |

### Role Capabilities Matrix

| Capability | Operator | Provider | Brand | Admin |
|---|---|---|---|---|
| View public intelligence | ✅ | ✅ | ✅ | ✅ |
| View full Intelligence Hub | 🔐 Tier 1+ | 🔐 Tier 1+ | 🔐 Brand Intel | ✅ |
| Browse wholesale catalog | ✅ | ❌ | Own products only | ✅ |
| Place wholesale orders | ✅ | ❌ | ❌ | ✅ |
| Manage brand storefront | ❌ | ❌ | ✅ | ✅ |
| Access Social Studio | 🔐 Studio add-on | ❌ | 🔐 Studio add-on | ✅ |
| Access CRM Studio | ❌ | ❌ | 🔐 Studio add-on | ✅ |
| Access Sales Studio | 🔐 Studio add-on | ❌ | 🔐 Studio add-on | ✅ |
| Access Marketing Studio | 🔐 Studio add-on | ❌ | 🔐 Studio add-on | ✅ |
| Access Education Studio | 🔐 Studio add-on | 🔐 Studio add-on | 🔐 Studio add-on | ✅ |
| Access Education Academy | ✅ Free preview | ✅ Free preview | ✅ Free preview | ✅ |
| Admin operations | ❌ | ❌ | ❌ | ✅ |

---

## 2. FREE PREVIEW RULES

### What Is Visible Pre-Signup (Anonymous)

| Surface | Visible? | Content Limit | Gate Trigger |
|---|---|---|---|
| Public marketing pages | ✅ Full | No limit | — |
| Intelligence Hub — hero + 3 top signals | ✅ Teaser | 3 signal cards only | "Get Intelligence Access" CTA |
| Jobs — listing index | ✅ Full | First 20 results | Job detail requires account |
| Brands — directory grid | ✅ Full | Name + category + thumbnail | Full profile requires account |
| Events — calendar view | ✅ Full | All publicly listed events | "Save to Calendar" requires account |
| Education Academy — course catalog | ✅ Titles only | Module titles + descriptions | Content requires account |
| Market Pulse bar stats | ✅ | Aggregate numbers only | — |
| Any Studio | ❌ Hidden | — | Login + subscription required |
| Wholesale pricing | ❌ Hidden | — | Verified operator account required |
| Brand analytics / signals | ❌ Hidden | — | Brand account required |

### Free-to-Paid Conversion Triggers

| Trigger | Surface | CTA | Destination |
|---|---|---|---|
| View 4th signal | Intelligence Hub | "Access full briefing" | `/request-access` |
| Click job detail | Jobs | "Create a free account to apply" | `/request-access` |
| Click brand profile depth | Brands | "See full brand intelligence" | `/request-access` |
| Save event | Events | "Save to your calendar" | `/request-access` |
| Click academy module | Education | "Start learning free" | `/request-access` |
| Attempt wholesale browse | Marketplace | "Verified operators only" | `/request-access` |

---

## 3. PLAN TIERS

### Operator Plans

| Tier | Monthly | Annual (per mo) | Includes |
|---|---|---|---|
| **Free** | $0 | $0 | 3 intelligence signals/day, job search, brand directory, education catalog preview, events calendar |
| **Professional** | $49 | $39 | Full Intelligence Hub, unlimited signals, full job board, brand profiles, education academy (all free courses), market benchmarks |
| **Business** | $149 | $119 | Everything in Professional + wholesale marketplace access, purchasing benchmarks, peer comparisons, priority support |
| **Enterprise** | Custom | Custom | Everything in Business + API access, custom intelligence feeds, white-label reports, dedicated success manager |

### Brand Plans

| Tier | Monthly | Annual (per mo) | Includes |
|---|---|---|---|
| **Free** | $0 | $0 | Brand profile listing, basic analytics, marketplace presence |
| **Growth** | $99 | $79 | Full brand intelligence, storefront customization, reseller analytics, campaign insights |
| **Scale** | $299 | $239 | Everything in Growth + featured placement, advanced analytics, API access, custom integrations |

### Studio Add-Ons (Per Module)

| Studio | Monthly | Annual (per mo) | Who Can Purchase |
|---|---|---|---|
| **Social Studio** | $29 | $23 | Operators, Brands |
| **CRM Studio** | $39 | $31 | Brands only |
| **Sales Studio** | $29 | $23 | Operators, Brands |
| **Marketing Studio** | $39 | $31 | Operators, Brands |
| **Education Studio** | $49 | $39 | Operators, Providers, Brands |

### Studio Bundles

| Bundle | Includes | Monthly | Annual (per mo) | Savings |
|---|---|---|---|---|
| **Creator Bundle** | Social + Marketing | $59 | $47 | 13% off |
| **Growth Bundle** | Social + CRM + Sales | $79 | $63 | 18% off |
| **Full Studio Suite** | All 5 Studios | $149 | $119 | 22% off |

---

## 4. HUB UNLOCK MAP

### What Each Hub Unlocks by Tier

> **Note:** V1 master defines a credit-based system (Free = 0 credits, Starter = 500, Pro = 2,500, Enterprise = 10,000). The detailed studio add-on pricing in this file remains valid for per-hub upsells. Credit costs per AI action are defined in the credit economy and enforced at the edge function layer.

| Mini-App | Free | Professional / Growth | Business / Scale | Enterprise |
|---|---|---|---|---|
| **Intelligence Hub** | 3 signals/day | Full signals + benchmarks | + peer comparisons + API | + custom feeds |
| **Jobs Intelligence** | Browse all, limited detail | Full detail + saved searches | + salary benchmarks + alerts | + API + bulk export |
| **Brand Intelligence** | Directory browse | Full profiles + signals | + competitive analysis | + API |
| **Events Radar** | Calendar view | Full detail + save + alerts | + networking features | + private events |
| **Education Academy** | Catalog preview | All free courses | + premium courses | + custom training |
| **Social Studio** | — | Add-on ($29/mo) | Add-on ($29/mo) | Included |
| **CRM Studio** | — | Add-on ($39/mo) | Add-on ($39/mo) | Included |
| **Sales Studio** | — | Add-on ($29/mo) | Add-on ($29/mo) | Included |
| **Marketing Studio** | — | Add-on ($39/mo) | Add-on ($39/mo) | Included |
| **Education Studio** | — | Add-on ($49/mo) | Add-on ($49/mo) | Included |
| **Ecommerce** | — | — | Full wholesale access | + API + bulk ordering |
| **AI Layer** | Basic assistant | Full assistant + summaries | + personalization | + custom models |

---

## 5. DEFAULT ROUTING & CTAs BY ROLE

### Post-Login Routing

```typescript
function getDefaultRoute(role: UserRole, tier: PlanTier): string {
  switch (role) {
    case 'business_user':
      return '/portal/dashboard';       // Intelligence briefing → marketplace
    case 'provider':
      return '/portal/dashboard';       // Education → jobs → intelligence
    case 'brand_admin':
      return '/brand/dashboard';        // Storefront → analytics → CRM
    case 'platform_admin':
      return '/admin';                  // Operations overview
    default:
      return '/intelligence';           // Public intelligence teaser
  }
}
```

### Role-Specific CTAs

| Context | Operator | Provider | Brand | Anonymous |
|---|---|---|---|---|
| Homepage hero | "View Today's Briefing" | "View Today's Briefing" | "List Your Brand" | "Get Intelligence Access" |
| Nav right pill | "My Portal →" | "My Portal →" | "Brand Portal →" | "Request Access" |
| Intelligence page | "Upgrade for full signals" | "Upgrade for full signals" | "View brand intelligence" | "Sign up for access" |
| Job listing | "Apply Now" / "Save Job" | "Apply Now" / "Save Job" | — | "Create account to apply" |
| Brand profile | "Shop Wholesale" | — | "Edit Profile" | "See full profile" |

---

## 6. SUBSCRIPTION HOOKS & SELLABLE VALUE PROPS

### Mini-App Value Propositions (For Pricing Pages & Upgrade Modals)

| Mini-App | Sellable Hook (1 sentence) |
|---|---|
| **Intelligence Hub** | "Market signals from 130+ sources, benchmarked against your category, updated daily." |
| **Jobs Intelligence** | "The only professional beauty job board with salary benchmarks and demand intelligence." |
| **Brand Intelligence** | "Track every brand in professional beauty — adoption signals, ingredient trends, reseller sentiment." |
| **Events Radar** | "Never miss an industry event. Conference calendar with networking and category filtering." |
| **Education Academy** | "Professional beauty education from verified brands and industry experts. Earn certifications." |
| **Social Studio** | "Create, schedule, and repurpose content across platforms. Monitor your brand mentions." |
| **CRM Studio** | "Build your brand attraction pipeline. Segment, score, and plan outreach to resellers." |
| **Sales Studio** | "Build pitch decks, handle objections, and practice scripts with AI tutoring. Export ready." |
| **Marketing Studio** | "Campaign builder with landing kit generator. From strategy to execution in one workspace." |
| **Education Studio** | "Build courses, create certifications, design quizzes. Tutoring tools for professional development." |
| **Ecommerce** | "Wholesale marketplace with tiered pricing, multi-brand checkout, and affiliate tracking." |

### Upgrade Prompt Patterns

```typescript
// Pattern for entitlement-gated content
interface UpgradePrompt {
  trigger: string;           // What action triggered the gate
  currentTier: string;       // User's current tier
  requiredTier: string;      // Minimum tier for access
  valueProp: string;         // One-sentence value hook
  cta: string;               // Button text
  destination: string;       // Upgrade page URL
}

// Example
{
  trigger: 'view_4th_signal',
  currentTier: 'free',
  requiredTier: 'professional',
  valueProp: 'Access your full daily intelligence briefing across 130+ sources.',
  cta: 'Upgrade to Professional',
  destination: '/settings/billing?upgrade=professional'
}
```

---

## 7. ENTITLEMENT ENFORCEMENT

### Row-Level Security Pattern

```sql
-- Check user's active subscription tier
CREATE OR REPLACE FUNCTION get_user_tier(user_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT tier FROM subscriptions 
     WHERE user_id = $1 AND status = 'active' 
     ORDER BY created_at DESC LIMIT 1),
    'free'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Example: Intelligence signals limited by tier
CREATE POLICY "intelligence_signal_access" ON intelligence_signals
  FOR SELECT
  USING (
    CASE get_user_tier(auth.uid())
      WHEN 'free' THEN created_at > NOW() - INTERVAL '24 hours' 
                       AND row_number() OVER (ORDER BY created_at DESC) <= 3
      WHEN 'professional' THEN TRUE
      WHEN 'business' THEN TRUE
      WHEN 'enterprise' THEN TRUE
      ELSE FALSE
    END
  );
```

### Client-Side Entitlement Check

```typescript
// Shared hook for all mini-apps
function useEntitlement(feature: string): {
  hasAccess: boolean;
  currentTier: string;
  requiredTier: string;
  showUpgrade: () => void;
} {
  const { user } = useAuth();
  const { tier, addons } = useSubscription(user?.id);
  
  const featureMap = getFeatureMap();
  const required = featureMap[feature];
  const hasAccess = tierIncludes(tier, required) || addons.includes(feature);
  
  return {
    hasAccess,
    currentTier: tier,
    requiredTier: required,
    showUpgrade: () => openUpgradeModal(feature, tier, required),
  };
}
```

---

### Anti-Shell Requirement

Every hub listed above must satisfy the V1 anti-shell rule: Create action, Library view, Detail view, Edit + Delete, Permissions (RLS + TierGuard), Intelligence input, Proof/metrics, Export (CSV minimum; PDF for Pro+), Error/empty/loading states, and Observability (Sentry/logs). If a hub is not yet functional, it must not be rendered to users. See V1 §D for the complete checklist.

### Credit Economy (V1 Alignment)

V1 defines a credit-based system alongside subscription tiers:

| Tier | Credits/mo | AI Tools |
|------|-----------|----------|
| Free | 0 | Demo only |
| Starter ($49) | 500 | Explain Signal + Search |
| Pro ($149) | 2,500 | All 6 tools + briefs + plans |
| Enterprise ($499) | 10,000 | Unlimited + R&D Scout + MoCRA |

Credits deduct on every AI action. The credit economy hub and affiliate engine must both be wired before launch (V1 §J).

---

*SOCELLE ENTITLEMENTS & PACKAGING v1.1 — March 8, 2026 — Command Center Authority*
*Aligned to V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md*
