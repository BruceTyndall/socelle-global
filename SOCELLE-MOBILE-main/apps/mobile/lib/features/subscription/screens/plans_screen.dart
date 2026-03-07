// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — Plans Comparison Screen
// ═══════════════════════════════════════════════════════════════════════════
//
// Horizontal scrollable plan cards with monthly/annual toggle.
// Each card: plan name, price, included modules list.
// "Most Popular" badge on featured plan.
// CTA: "Subscribe" / "Current Plan" / "Contact Us"

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_design_system.dart';
import '../../_core/models/module_access.dart';
import '../../_core/providers/subscription_provider.dart';

class PlansScreen extends ConsumerStatefulWidget {
  const PlansScreen({super.key});

  @override
  ConsumerState<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends ConsumerState<PlansScreen> {
  bool _isAnnual = true;

  @override
  Widget build(BuildContext context) {
    final plansAsync = ref.watch(availablePlansProvider);
    final currentSubAsync = ref.watch(accountSubscriptionProvider);

    return Scaffold(
      backgroundColor: SocelleColors.bgMain,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Plans', style: SocelleText.headlineMedium),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          color: SocelleColors.primaryCocoa,
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ── Billing toggle ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: _BillingToggle(
                isAnnual: _isAnnual,
                onChanged: (val) => setState(() => _isAnnual = val),
              ),
            ),

            // ── Plans list ──
            Expanded(
              child: plansAsync.when(
                data: (plans) {
                  if (plans.isEmpty) {
                    return Center(
                      child: Text(
                        'No plans available.',
                        style: SocelleText.bodyMedium,
                      ),
                    );
                  }

                  final currentPlanId = currentSubAsync.whenOrNull(
                    data: (sub) => sub?.subscription.planId,
                  );

                  return ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    itemCount: plans.length,
                    itemBuilder: (context, index) {
                      final plan = plans[index];
                      final isCurrent = plan.id == currentPlanId;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        child: SizedBox(
                          width: MediaQuery.sizeOf(context).width * 0.78,
                          child: _PlanCard(
                            plan: plan,
                            isAnnual: _isAnnual,
                            isCurrent: isCurrent,
                          ),
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(
                  child: CircularProgressIndicator(
                    color: SocelleColors.accent,
                    strokeWidth: 2,
                  ),
                ),
                error: (e, _) => Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: SocelleColors.leakage,
                        size: 40,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Unable to load plans',
                        style: SocelleText.bodyLarge,
                      ),
                      const SizedBox(height: 16),
                      SocellePillButton(
                        label: 'Retry',
                        variant: PillVariant.primary,
                        tone: PillTone.light,
                        size: PillSize.medium,
                        onTap: () =>
                            ref.invalidate(availablePlansProvider),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// ─── BILLING TOGGLE ──────────────────────────────────────────────────────────

class _BillingToggle extends StatelessWidget {
  const _BillingToggle({
    required this.isAnnual,
    required this.onChanged,
  });

  final bool isAnnual;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: SocelleColors.surfaceMuted,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ToggleOption(
              label: 'Monthly',
              isSelected: !isAnnual,
              onTap: () {
                HapticFeedback.selectionClick();
                onChanged(false);
              },
            ),
          ),
          Expanded(
            child: _ToggleOption(
              label: 'Annual',
              badge: 'Save up to 30%',
              isSelected: isAnnual,
              onTap: () {
                HapticFeedback.selectionClick();
                onChanged(true);
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ToggleOption extends StatelessWidget {
  const _ToggleOption({
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.badge,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: SocelleAnimation.dSnap,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? SocelleColors.bgNearWhite : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ]
              : null,
        ),
        child: Column(
          children: [
            Text(
              label,
              style: SocelleText.label.copyWith(
                color: isSelected
                    ? SocelleColors.primaryCocoa
                    : SocelleColors.neutralBeige,
              ),
            ),
            if (badge != null && isSelected) ...[
              const SizedBox(height: 2),
              Text(
                badge!,
                style: SocelleText.bodyMedium.copyWith(
                  fontSize: 10,
                  color: SocelleColors.recovery,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── PLAN CARD ───────────────────────────────────────────────────────────────

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.plan,
    required this.isAnnual,
    required this.isCurrent,
  });

  final SubscriptionPlan plan;
  final bool isAnnual;
  final bool isCurrent;

  @override
  Widget build(BuildContext context) {
    final price = isAnnual ? plan.annualMonthlyEquivalent : plan.priceMonthly;
    final totalPrice = isAnnual ? plan.priceAnnual : plan.priceMonthly;

    return Container(
      decoration: BoxDecoration(
        color: plan.isFeatured
            ? SocelleColors.primaryCocoa
            : SocelleColors.bgNearWhite,
        borderRadius: SocelleRadius.card(context),
        border: plan.isFeatured
            ? null
            : Border.all(color: SocelleColors.borderLight),
        boxShadow: [SocelleColors.shadowLight],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (plan.isFeatured)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: SocelleColors.accent,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Most Popular',
                      style: SocelleText.label.copyWith(
                        fontSize: 11,
                        color: Colors.white,
                      ),
                    ),
                  ),
                Text(
                  plan.name,
                  style: SocelleText.headlineLarge.copyWith(
                    color: plan.isFeatured
                        ? Colors.white
                        : SocelleColors.primaryCocoa,
                  ),
                ),
                if (plan.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    plan.description!,
                    style: SocelleText.bodyMedium.copyWith(
                      color: plan.isFeatured
                          ? SocelleColors.textOnDarkMuted
                          : SocelleColors.neutralBeige,
                      fontSize: 13,
                    ),
                    maxLines: 2,
                  ),
                ],
                const SizedBox(height: 16),

                // Price
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${price.toStringAsFixed(0)}',
                      style: SocelleText.displayMedium.copyWith(
                        color: plan.isFeatured
                            ? Colors.white
                            : SocelleColors.primaryCocoa,
                        fontSize: 40,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6, left: 4),
                      child: Text(
                        '/mo',
                        style: SocelleText.bodyMedium.copyWith(
                          color: plan.isFeatured
                              ? SocelleColors.textOnDarkMuted
                              : SocelleColors.neutralBeige,
                        ),
                      ),
                    ),
                  ],
                ),
                if (isAnnual) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Billed \$${totalPrice.toStringAsFixed(0)}/year',
                    style: SocelleText.bodyMedium.copyWith(
                      fontSize: 12,
                      color: plan.isFeatured
                          ? SocelleColors.textOnDarkMuted
                          : SocelleColors.neutralBeige,
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 20),
          Divider(
            color: plan.isFeatured
                ? Colors.white.withValues(alpha: 0.1)
                : SocelleColors.borderLight,
            height: 1,
          ),

          // Modules list
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: ListView(
                padding: EdgeInsets.zero,
                children: plan.modulesIncluded.map((moduleKey) {
                  final info = ModuleInfo.forKey(moduleKey);
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(
                      children: [
                        Icon(
                          Icons.check_rounded,
                          size: 16,
                          color: plan.isFeatured
                              ? SocelleColors.recovery
                              : SocelleColors.recovery,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          info.name,
                          style: SocelleText.label.copyWith(
                            fontSize: 13,
                            color: plan.isFeatured
                                ? Colors.white
                                : SocelleColors.primaryCocoa,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // CTA button
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
            child: isCurrent
                ? SocellePillButton(
                    label: 'Current Plan',
                    variant: PillVariant.secondary,
                    tone: plan.isFeatured ? PillTone.dark : PillTone.light,
                    size: PillSize.medium,
                    expand: true,
                    isDisabled: true,
                  )
                : SocellePillButton(
                    label: 'Subscribe',
                    variant: PillVariant.primary,
                    tone: plan.isFeatured ? PillTone.dark : PillTone.light,
                    size: PillSize.medium,
                    expand: true,
                    icon: Icons.arrow_forward_rounded,
                    onTap: () {
                      // TODO: Wire to Stripe payment flow
                      HapticFeedback.mediumImpact();
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
