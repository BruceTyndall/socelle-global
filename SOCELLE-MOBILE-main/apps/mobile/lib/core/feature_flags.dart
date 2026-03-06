/// Socelle feature flags — dormant modules gated for Phase 2+.
///
/// All flags default to `false`. Do not enable without an explicit directive
/// and a corresponding activation plan in docs/modules_dormant.md.
class FeatureFlags {
  FeatureFlags._();

  static const bool kEnableStudio = false;

  /// When enabled, Shop connects to Socelle Supabase product catalog.
  /// Requires: SocelleSupabaseClient initialized, IdentityBridge implemented,
  /// shopRepositoryProvider swapped to SupabaseProductRepository.
  static const bool kEnableShop = false;

  /// When enabled, Messages connects to Socelle Supabase conversations.
  /// Requires: SocelleSupabaseClient initialized, IdentityBridge implemented,
  /// messagingRepositoryProvider swapped to SupabaseConversationRepository,
  /// Supabase Realtime subscription wired for live message delivery.
  static const bool kEnableMessages = false;

  static const bool kEnableShare = false;
  static const bool kEnableDashboards = false;
  static const bool kEnableAbTest = false;
  static const bool kEnableStreaks = false;

  /// When enabled, shows the Socelle Design System visual QA showcase page.
  /// For development and design review only. Never enable in production builds.
  static const bool kEnableSocelleShowcase = false;

  // ── M1–M9 Intelligence Portal flags ───────────────────────────────────────

  /// Feed tab (Tab 0) — enables intelligence feed content from Supabase.
  /// Prerequisite: kEnableSupabaseIntelligence must also be true.
  static const bool kEnableFeedTab = false;

  /// Discover tab (Tab 1) — enables brands, events, and education discovery.
  /// Prerequisite: kEnableSupabaseIntelligence must also be true.
  static const bool kEnableDiscoverTab = false;

  /// Industry events within Discover — reads from socelle.events table.
  /// Requires: kEnableDiscoverTab = true.
  static const bool kEnableEventsTab = false;

  /// CE quizzes and brand polls within Discover.
  /// Requires: kEnableDiscoverTab = true.
  static const bool kEnableQuizzesTab = false;

  /// Affiliate commerce — product placements from socelle.affiliate_products.
  /// Can appear on Feed, Discover, and brand profile surfaces.
  static const bool kEnableAffiliateShop = false;

  /// Public brand intelligence pages from socelle.brand_profiles.
  /// Requires: kEnableDiscoverTab = true.
  static const bool kEnableBrandProfiles = false;

  /// Master gate for all Supabase intelligence repositories.
  /// When false, all M1–M9 features that read from Supabase return empty/mock data.
  /// Enable this first before enabling any individual intelligence feature.
  static const bool kEnableSupabaseIntelligence = false;

  /// Personalization engine — specialty-based feed ranking and filtering.
  /// Requires: kEnableFeedTab = true, user specialty profile complete.
  static const bool kEnablePersonalization = false;
}
