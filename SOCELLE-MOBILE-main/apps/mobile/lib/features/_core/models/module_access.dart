// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — Module Access & Subscription Data Models
// ═══════════════════════════════════════════════════════════════════════════
//
// Canonical module keys (FOUND-WO-10 — added BOOKING, BRANDS, JOBS, EVENTS, STUDIO):
//   MODULE_SHOP, MODULE_INGREDIENTS, MODULE_EDUCATION, MODULE_SALES,
//   MODULE_MARKETING, MODULE_RESELLER, MODULE_CRM, MODULE_MOBILE,
//   MODULE_BOOKING, MODULE_BRANDS, MODULE_JOBS, MODULE_EVENTS, MODULE_STUDIO
//
// These models map to the Supabase tables:
//   account_module_access, account_subscriptions, subscription_plans

/// Represents a user's access to a specific module.
class ModuleAccess {
  const ModuleAccess({
    required this.moduleKey,
    required this.hasAccess,
    this.accessType,
    this.expiresAt,
  });

  /// One of the canonical MODULE_* keys.
  final String moduleKey;

  /// Whether the current account has access to this module.
  final bool hasAccess;

  /// How access was granted: 'subscription', 'trial', 'addon', 'override'.
  final String? accessType;

  /// When access expires (null = no expiry / perpetual).
  final DateTime? expiresAt;

  /// True if access is granted via a trial period.
  bool get isTrial => accessType == 'trial';

  /// True if access has expired.
  bool get isExpired =>
      expiresAt != null && DateTime.now().isAfter(expiresAt!);

  /// Factory for a locked (no access) state.
  factory ModuleAccess.locked(String moduleKey) {
    return ModuleAccess(moduleKey: moduleKey, hasAccess: false);
  }

  /// Create from Supabase row.
  factory ModuleAccess.fromJson(Map<String, dynamic> json) {
    return ModuleAccess(
      moduleKey: json['module_key'] as String,
      hasAccess: json['has_access'] as bool? ?? false,
      accessType: json['access_type'] as String?,
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'module_key': moduleKey,
        'has_access': hasAccess,
        'access_type': accessType,
        'expires_at': expiresAt?.toIso8601String(),
      };
}

/// A subscription plan available for purchase.
class SubscriptionPlan {
  const SubscriptionPlan({
    required this.id,
    required this.name,
    required this.slug,
    required this.priceMonthly,
    required this.priceAnnual,
    required this.modulesIncluded,
    this.isFeatured = false,
    this.description,
    this.trialDays,
  });

  final String id;
  final String name;
  final String slug;
  final double priceMonthly;
  final double priceAnnual;

  /// List of MODULE_* keys included in this plan.
  final List<String> modulesIncluded;

  /// Whether this plan should be highlighted as "Most Popular".
  final bool isFeatured;

  /// Optional plan description for display.
  final String? description;

  /// Number of free trial days offered (null = no trial).
  final int? trialDays;

  /// Monthly equivalent when billed annually.
  double get annualMonthlyEquivalent => priceAnnual / 12;

  /// Annual savings vs monthly billing.
  double get annualSavings => (priceMonthly * 12) - priceAnnual;

  /// Whether this plan includes a specific module.
  bool includesModule(String moduleKey) =>
      modulesIncluded.contains(moduleKey);

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      priceMonthly: (json['price_monthly'] as num).toDouble(),
      priceAnnual: (json['price_annual'] as num).toDouble(),
      modulesIncluded: List<String>.from(
        json['modules_included'] as List? ?? [],
      ),
      isFeatured: json['is_featured'] as bool? ?? false,
      description: json['description'] as String?,
      trialDays: json['trial_days'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'price_monthly': priceMonthly,
        'price_annual': priceAnnual,
        'modules_included': modulesIncluded,
        'is_featured': isFeatured,
        'description': description,
        'trial_days': trialDays,
      };
}

/// The current account's active subscription.
class AccountSubscription {
  const AccountSubscription({
    required this.id,
    required this.planId,
    required this.status,
    this.currentPeriodEnd,
    this.isTrialing = false,
    this.cancelAtPeriodEnd = false,
  });

  final String id;
  final String planId;

  /// Status: 'active', 'trialing', 'past_due', 'canceled', 'incomplete'.
  final String status;

  /// When the current billing period ends.
  final DateTime? currentPeriodEnd;

  /// Whether the subscription is in a trial period.
  final bool isTrialing;

  /// Whether the subscription will cancel at period end.
  final bool cancelAtPeriodEnd;

  /// True if the subscription is currently active (paid or trialing).
  bool get isActive => status == 'active' || status == 'trialing';

  /// True if the subscription has been canceled.
  bool get isCanceled => status == 'canceled';

  /// Days remaining in current period.
  int get daysRemaining {
    if (currentPeriodEnd == null) return 0;
    final remaining =
        currentPeriodEnd!.difference(DateTime.now()).inDays;
    return remaining.clamp(0, 365);
  }

  factory AccountSubscription.fromJson(Map<String, dynamic> json) {
    return AccountSubscription(
      id: json['id'] as String,
      planId: json['plan_id'] as String,
      status: json['status'] as String,
      currentPeriodEnd: json['current_period_end'] != null
          ? DateTime.parse(json['current_period_end'] as String)
          : null,
      isTrialing: json['is_trialing'] as bool? ?? false,
      cancelAtPeriodEnd:
          json['cancel_at_period_end'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'plan_id': planId,
        'status': status,
        'current_period_end': currentPeriodEnd?.toIso8601String(),
        'is_trialing': isTrialing,
        'cancel_at_period_end': cancelAtPeriodEnd,
      };
}

/// Metadata for each module (icon, name, description) for UI display.
class ModuleInfo {
  const ModuleInfo({
    required this.key,
    required this.name,
    required this.description,
    required this.iconName,
  });

  final String key;
  final String name;
  final String description;
  final String iconName;

  /// Canonical module metadata registry.
  static const Map<String, ModuleInfo> registry = {
    'MODULE_SHOP': ModuleInfo(
      key: 'MODULE_SHOP',
      name: 'Shop',
      description:
          'Browse and purchase professional beauty products at wholesale pricing.',
      iconName: 'shopping_bag',
    ),
    'MODULE_INGREDIENTS': ModuleInfo(
      key: 'MODULE_INGREDIENTS',
      name: 'Ingredients',
      description:
          'Search and analyze cosmetic ingredients with safety data and alternatives.',
      iconName: 'science',
    ),
    'MODULE_EDUCATION': ModuleInfo(
      key: 'MODULE_EDUCATION',
      name: 'Education',
      description:
          'Access brand training modules, earn certificates, and track CE credits.',
      iconName: 'school',
    ),
    'MODULE_SALES': ModuleInfo(
      key: 'MODULE_SALES',
      name: 'Sales',
      description:
          'Manage your sales pipeline, track deals, and forecast revenue.',
      iconName: 'trending_up',
    ),
    'MODULE_MARKETING': ModuleInfo(
      key: 'MODULE_MARKETING',
      name: 'Marketing',
      description:
          'Create and manage marketing campaigns with performance analytics.',
      iconName: 'campaign',
    ),
    'MODULE_RESELLER': ModuleInfo(
      key: 'MODULE_RESELLER',
      name: 'Reseller',
      description:
          'Manage reseller prospects, territory maps, and wholesale revenue.',
      iconName: 'storefront',
    ),
    'MODULE_CRM': ModuleInfo(
      key: 'MODULE_CRM',
      name: 'CRM',
      description:
          'Client management with service history, notes, and appointment tracking.',
      iconName: 'contacts',
    ),
    'MODULE_MOBILE': ModuleInfo(
      key: 'MODULE_MOBILE',
      name: 'Mobile Access',
      description:
          'Full mobile app access with push notifications and offline support.',
      iconName: 'phone_iphone',
    ),
    // ── FOUND-WO-10: Added missing module keys ──
    'MODULE_BOOKING': ModuleInfo(
      key: 'MODULE_BOOKING',
      name: 'Booking',
      description:
          'Appointment scheduling, calendar management, and client booking flows.',
      iconName: 'calendar_today',
    ),
    'MODULE_BRANDS': ModuleInfo(
      key: 'MODULE_BRANDS',
      name: 'Brands',
      description:
          'Brand directory, competitive intelligence, and product catalogs.',
      iconName: 'verified',
    ),
    'MODULE_JOBS': ModuleInfo(
      key: 'MODULE_JOBS',
      name: 'Jobs',
      description:
          'Job board for professional beauty roles with talent matching.',
      iconName: 'work',
    ),
    'MODULE_EVENTS': ModuleInfo(
      key: 'MODULE_EVENTS',
      name: 'Events',
      description:
          'Industry events, trade shows, and continuing education workshops.',
      iconName: 'event',
    ),
    'MODULE_STUDIO': ModuleInfo(
      key: 'MODULE_STUDIO',
      name: 'Studio',
      description:
          'Content authoring studio for creating branded materials and courses.',
      iconName: 'design_services',
    ),
  };

  /// Look up module info by key, with fallback.
  static ModuleInfo forKey(String key) {
    return registry[key] ??
        ModuleInfo(
          key: key,
          name: key.replaceAll('MODULE_', '').replaceAll('_', ' '),
          description: 'Access to $key features.',
          iconName: 'extension',
        );
  }
}
