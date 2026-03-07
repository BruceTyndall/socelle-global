// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — Upgrade Screen (Per-Module)
// ═══════════════════════════════════════════════════════════════════════════
//
// Shown when tapping a locked module. Displays module name & icon at top,
// "What you get" feature list, and plans that include this module as cards.
// Subscribe button triggers Stripe Flutter payment.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_design_system.dart';
import '../../_core/models/module_access.dart';
import '../../_core/providers/subscription_provider.dart';

class UpgradeScreen extends ConsumerWidget {
  const UpgradeScreen({
    super.key,
    required this.moduleKey,
  });

  final String moduleKey;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final moduleInfo = ModuleInfo.forKey(moduleKey);
    final plansAsync = ref.watch(plansForModuleProvider(moduleKey));

    return Scaffold(
      backgroundColor: SocelleColors.bgMain,
      body: CustomScrollView(
        slivers: [
          // ── Hero Header ──
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              padding: EdgeInsets.only(
                top: MediaQuery.paddingOf(context).top + 16,
                left: 24,
                right: 24,
                bottom: 32,
              ),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    SocelleColors.primaryCocoa,
                    SocelleColors.deepCocoa,
                  ],
                ),
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(32),
                ),
              ),
              child: Column(
                children: [
                  // Back button row
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => context.pop(),
                        child: const Icon(
                          Icons.arrow_back_rounded,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      const Spacer(),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Module icon
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Icon(
                      _iconForModule(moduleInfo.iconName),
                      size: 40,
                      color: Colors.white,
                    ),
                  ),

                  const SizedBox(height: 20),

                  Text(
                    'Unlock ${moduleInfo.name}',
                    style: SocelleText.displayMedium.copyWith(
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 10),

                  Text(
                    moduleInfo.description,
                    style: SocelleText.bodyLarge.copyWith(
                      color: SocelleColors.textOnDarkMuted,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),

          // ── What You Get ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SocelleSectionLabel('What you get'),
                  const SizedBox(height: 16),
                  ..._featuresForModule(moduleKey).map(
                    (feature) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: SocelleColors.recoverySurface,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.check_rounded,
                              size: 16,
                              color: SocelleColors.recovery,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              feature,
                              style: SocelleText.bodyLarge,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Plans ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SocelleSectionLabel('Available plans'),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          plansAsync.when(
            data: (plans) => SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final plan = plans[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _UpgradePlanCard(plan: plan),
                    );
                  },
                  childCount: plans.length,
                ),
              ),
            ),
            loading: () => const SliverToBoxAdapter(
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(
                    color: SocelleColors.accent,
                    strokeWidth: 2,
                  ),
                ),
              ),
            ),
            error: (_, __) => const SliverToBoxAdapter(
              child: SizedBox.shrink(),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 48)),
        ],
      ),
    );
  }
}

// ─── UPGRADE PLAN CARD ───────────────────────────────────────────────────────

class _UpgradePlanCard extends StatelessWidget {
  const _UpgradePlanCard({required this.plan});

  final SubscriptionPlan plan;

  @override
  Widget build(BuildContext context) {
    return SocelleCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(plan.name, style: SocelleText.headlineMedium),
                        if (plan.isFeatured) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: SocelleColors.accent,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Popular',
                              style: SocelleText.label.copyWith(
                                fontSize: 10,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (plan.description != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        plan.description!,
                        style: SocelleText.bodyMedium.copyWith(fontSize: 13),
                        maxLines: 2,
                      ),
                    ],
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${plan.priceMonthly.toStringAsFixed(0)}',
                    style: SocelleText.headlineLarge.copyWith(
                      color: SocelleColors.primaryCocoa,
                    ),
                  ),
                  Text(
                    '/month',
                    style: SocelleText.bodyMedium.copyWith(fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Module count
          Text(
            '${plan.modulesIncluded.length} modules included',
            style: SocelleText.bodyMedium.copyWith(fontSize: 12),
          ),
          if (plan.annualSavings > 0) ...[
            const SizedBox(height: 4),
            Text(
              'Save \$${plan.annualSavings.toStringAsFixed(0)} with annual billing',
              style: SocelleText.label.copyWith(
                fontSize: 12,
                color: SocelleColors.recovery,
              ),
            ),
          ],
          const SizedBox(height: 16),
          SocellePillButton(
            label: 'Subscribe',
            variant: PillVariant.primary,
            tone: PillTone.light,
            size: PillSize.medium,
            expand: true,
            icon: Icons.arrow_forward_rounded,
            onTap: () {
              // TODO: Wire to Stripe Flutter payment flow
              HapticFeedback.mediumImpact();
            },
          ),
          if (plan.trialDays != null) ...[
            const SizedBox(height: 8),
            Center(
              child: Text(
                '${plan.trialDays}-day free trial included',
                style: SocelleText.bodyMedium.copyWith(
                  fontSize: 12,
                  color: SocelleColors.recovery,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── FEATURE LISTS PER MODULE ────────────────────────────────────────────────

List<String> _featuresForModule(String moduleKey) {
  return switch (moduleKey) {
    'MODULE_SHOP' => [
        'Browse wholesale products at professional pricing',
        'Compare products across brands',
        'Track orders and delivery status',
        'Save favorites to your wishlist',
      ],
    'MODULE_INGREDIENTS' => [
        'Search cosmetic ingredients by name or INCI',
        'View safety data and EWG scores',
        'Find alternative ingredients',
        'Cross-reference product formulations',
      ],
    'MODULE_EDUCATION' => [
        'Access brand training and certification courses',
        'Earn CE credits and digital certificates',
        'Track learning progress across brands',
        'Exclusive educational content from industry experts',
      ],
    'MODULE_SALES' => [
        'Manage your sales pipeline and track deals',
        'Revenue forecasting and goal tracking',
        'Client communication history',
        'Performance analytics and insights',
      ],
    'MODULE_MARKETING' => [
        'Create and manage marketing campaigns',
        'Social media content planning',
        'Campaign performance analytics',
        'Audience targeting and segmentation',
      ],
    'MODULE_RESELLER' => [
        'Territory management and prospect mapping',
        'Wholesale revenue tracking',
        'Prospect pipeline and outreach tools',
        'Reseller performance dashboard',
      ],
    'MODULE_CRM' => [
        'Client profiles with service history',
        'Appointment notes and follow-ups',
        'Product recommendations per client',
        'Client communication log',
      ],
    'MODULE_MOBILE' => [
        'Full mobile app access on iOS and Android',
        'Push notifications for important updates',
        'Offline access to key features',
        'Mobile-optimized intelligence dashboard',
      ],
    _ => [
        'Access to premium features',
        'Priority support',
        'Regular updates and improvements',
      ],
  };
}

IconData _iconForModule(String iconName) {
  return switch (iconName) {
    'shopping_bag' => Icons.shopping_bag_outlined,
    'science' => Icons.science_outlined,
    'school' => Icons.school_outlined,
    'trending_up' => Icons.trending_up_rounded,
    'campaign' => Icons.campaign_outlined,
    'storefront' => Icons.storefront_outlined,
    'contacts' => Icons.contacts_outlined,
    'phone_iphone' => Icons.phone_iphone_rounded,
    _ => Icons.extension_outlined,
  };
}
