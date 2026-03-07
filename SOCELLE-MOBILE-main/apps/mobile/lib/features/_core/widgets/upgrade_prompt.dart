// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — Upgrade Prompt (Full-screen + Inline variants)
// ═══════════════════════════════════════════════════════════════════════════
//
// Shown when a module is locked. Displays module icon, name, description,
// and lists plans that include this module.
//
// Pearl Mineral V2 design: SocelleColors.primaryCocoa text,
// SocelleColors.accent buttons.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_design_system.dart';
import '../models/module_access.dart';
import '../providers/subscription_provider.dart';

/// Upgrade prompt shown when a module is locked.
///
/// Full-screen variant (default): centered with module icon, description,
/// and plan cards.
/// Inline variant: compact card for embedding in lists.
class UpgradePrompt extends ConsumerWidget {
  const UpgradePrompt({
    super.key,
    required this.moduleKey,
    this.isInline = false,
  });

  final String moduleKey;
  final bool isInline;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final moduleInfo = ModuleInfo.forKey(moduleKey);
    final plansAsync = ref.watch(plansForModuleProvider(moduleKey));

    if (isInline) {
      return _InlinePrompt(moduleInfo: moduleInfo);
    }

    return Scaffold(
      backgroundColor: SocelleColors.bgMain,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            children: [
              const SizedBox(height: 48),

              // Module icon
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: SocelleColors.accentSurface,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(
                  _iconForModule(moduleInfo.iconName),
                  size: 40,
                  color: SocelleColors.accent,
                ),
              ),

              const SizedBox(height: 24),

              // Lock badge
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: SocelleColors.intentionalAmberLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.lock_outline_rounded,
                      size: 14,
                      color: SocelleColors.intentionalAmber,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Premium Module',
                      style: SocelleText.label.copyWith(
                        fontSize: 12,
                        color: SocelleColors.intentionalAmber,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Module name
              Text(
                moduleInfo.name,
                style: SocelleText.displayMedium,
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 12),

              // Module description
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  moduleInfo.description,
                  style: SocelleText.bodyLarge.copyWith(
                    color: SocelleColors.inkMuted,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),

              const SizedBox(height: 40),

              // Plans that include this module
              plansAsync.when(
                data: (plans) {
                  if (plans.isEmpty) {
                    return const SizedBox.shrink();
                  }
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SocelleSectionLabel('Available in'),
                      const SizedBox(height: 16),
                      ...plans.map(
                        (plan) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _PlanCard(plan: plan),
                        ),
                      ),
                    ],
                  );
                },
                loading: () => const Center(
                  child: CircularProgressIndicator(
                    color: SocelleColors.accent,
                    strokeWidth: 2,
                  ),
                ),
                error: (_, __) => const SizedBox.shrink(),
              ),

              const SizedBox(height: 32),

              // CTAs
              SocellePillButton(
                label: 'View Plans',
                variant: PillVariant.primary,
                tone: PillTone.light,
                size: PillSize.large,
                expand: true,
                icon: Icons.arrow_forward_rounded,
                onTap: () => context.push('/subscription/plans'),
              ),

              const SizedBox(height: 12),

              SocellePillButton(
                label: 'Start Free Trial',
                variant: PillVariant.secondary,
                tone: PillTone.light,
                size: PillSize.large,
                expand: true,
                onTap: () => context.push(
                  '/subscription/upgrade',
                  extra: moduleKey,
                ),
              ),

              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── INLINE PROMPT ───────────────────────────────────────────────────────────

class _InlinePrompt extends StatelessWidget {
  const _InlinePrompt({required this.moduleInfo});

  final ModuleInfo moduleInfo;

  @override
  Widget build(BuildContext context) {
    return SocelleCard(
      padding: const EdgeInsets.all(20),
      onTap: () => context.push(
        '/subscription/upgrade',
        extra: moduleInfo.key,
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: SocelleColors.accentSurface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              _iconForModule(moduleInfo.iconName),
              size: 24,
              color: SocelleColors.accent,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  moduleInfo.name,
                  style: SocelleText.label,
                ),
                const SizedBox(height: 2),
                Text(
                  'Upgrade to unlock',
                  style: SocelleText.bodyMedium.copyWith(fontSize: 13),
                ),
              ],
            ),
          ),
          Icon(
            Icons.lock_outline_rounded,
            size: 20,
            color: SocelleColors.neutralBeige,
          ),
        ],
      ),
    );
  }
}

// ─── PLAN CARD ───────────────────────────────────────────────────────────────

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan});

  final SubscriptionPlan plan;

  @override
  Widget build(BuildContext context) {
    return SocelleCard(
      padding: const EdgeInsets.all(20),
      onTap: () => context.push('/subscription/plans'),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(plan.name, style: SocelleText.label),
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
                const SizedBox(height: 4),
                Text(
                  '${plan.modulesIncluded.length} modules included',
                  style: SocelleText.bodyMedium.copyWith(fontSize: 13),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '\$${plan.priceMonthly.toStringAsFixed(0)}/mo',
                style: SocelleText.label.copyWith(
                  color: SocelleColors.accent,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '\$${plan.priceAnnual.toStringAsFixed(0)}/yr',
                style: SocelleText.bodyMedium.copyWith(fontSize: 11),
              ),
            ],
          ),
          const SizedBox(width: 8),
          Icon(
            Icons.chevron_right_rounded,
            size: 20,
            color: SocelleColors.neutralBeige,
          ),
        ],
      ),
    );
  }
}

// ─── ICON MAPPER ─────────────────────────────────────────────────────────────

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
