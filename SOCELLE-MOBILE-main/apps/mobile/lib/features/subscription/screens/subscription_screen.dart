// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — Subscription Management Screen
// ═══════════════════════════════════════════════════════════════════════════
//
// Shows: current plan card, active modules with checkmarks, locked modules
// with lock icons and "Upgrade" per module, plan status badge, renewal date,
// cancel button.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_design_system.dart';
import '../../_core/models/module_access.dart';
import '../../_core/providers/module_access_provider.dart';
import '../../_core/providers/subscription_provider.dart';

class SubscriptionScreen extends ConsumerWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subAsync = ref.watch(accountSubscriptionProvider);
    final allAccessAsync = ref.watch(allModuleAccessProvider);

    return Scaffold(
      backgroundColor: SocelleColors.bgMain,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Subscription', style: SocelleText.headlineMedium),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          color: SocelleColors.primaryCocoa,
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Current Plan Card ──
              subAsync.when(
                data: (sub) {
                  if (sub == null) return _NoSubscription();
                  return _CurrentPlanCard(sub: sub);
                },
                loading: () => _LoadingCard(),
                error: (_, __) => _ErrorCard(),
              ),

              const SizedBox(height: 32),

              // ── Modules Section ──
              SocelleSectionLabel('Your Modules'),
              const SizedBox(height: 16),

              allAccessAsync.when(
                data: (accessMap) => _ModulesList(accessMap: accessMap),
                loading: () => _LoadingCard(),
                error: (_, __) => _ErrorCard(),
              ),

              const SizedBox(height: 32),

              // ── Manage Subscription ──
              subAsync.when(
                data: (sub) {
                  if (sub == null) return const SizedBox.shrink();
                  return _ManageSection(sub: sub);
                },
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),

              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── CURRENT PLAN CARD ───────────────────────────────────────────────────────

class _CurrentPlanCard extends StatelessWidget {
  const _CurrentPlanCard({required this.sub});

  final SubscriptionWithPlan sub;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            SocelleColors.primaryCocoa,
            SocelleColors.deepCocoa,
          ],
        ),
        borderRadius: SocelleRadius.card(context),
        boxShadow: [SocelleColors.shadowDark],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                sub.planName,
                style: SocelleText.headlineLarge.copyWith(
                  color: Colors.white,
                ),
              ),
              _StatusBadge(status: sub.status, isTrialing: sub.isTrialing),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${sub.modulesIncluded.length} modules included',
            style: SocelleText.bodyMedium.copyWith(
              color: SocelleColors.textOnDarkMuted,
            ),
          ),
          if (sub.subscription.currentPeriodEnd != null) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Icon(
                  Icons.calendar_today_rounded,
                  size: 14,
                  color: SocelleColors.textOnDarkMuted,
                ),
                const SizedBox(width: 6),
                Text(
                  sub.subscription.cancelAtPeriodEnd
                      ? 'Cancels ${_formatDate(sub.subscription.currentPeriodEnd!)}'
                      : 'Renews ${_formatDate(sub.subscription.currentPeriodEnd!)}',
                  style: SocelleText.bodyMedium.copyWith(
                    color: SocelleColors.textOnDarkMuted,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status, required this.isTrialing});

  final String status;
  final bool isTrialing;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      'active' when isTrialing => ('Trial', SocelleColors.intentionalAmber),
      'active' => ('Active', SocelleColors.recovery),
      'past_due' => ('Past Due', SocelleColors.leakage),
      'canceled' => ('Canceled', SocelleColors.neutralBeige),
      _ => ('Unknown', SocelleColors.neutralBeige),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: SocelleText.label.copyWith(
          fontSize: 11,
          color: Colors.white,
        ),
      ),
    );
  }
}

// ─── MODULES LIST ────────────────────────────────────────────────────────────

class _ModulesList extends StatelessWidget {
  const _ModulesList({required this.accessMap});

  final Map<String, ModuleAccess> accessMap;

  static const _allModuleKeys = [
    'MODULE_SHOP',
    'MODULE_INGREDIENTS',
    'MODULE_EDUCATION',
    'MODULE_SALES',
    'MODULE_MARKETING',
    'MODULE_RESELLER',
    'MODULE_CRM',
    'MODULE_MOBILE',
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: _allModuleKeys.map((key) {
        final access = accessMap[key];
        final hasAccess = access?.hasAccess == true && access?.isExpired != true;
        final moduleInfo = ModuleInfo.forKey(key);

        return _ModuleRow(
          moduleInfo: moduleInfo,
          hasAccess: hasAccess,
          accessType: access?.accessType,
        );
      }).toList(),
    );
  }
}

class _ModuleRow extends StatelessWidget {
  const _ModuleRow({
    required this.moduleInfo,
    required this.hasAccess,
    this.accessType,
  });

  final ModuleInfo moduleInfo;
  final bool hasAccess;
  final String? accessType;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: SocelleCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: hasAccess
                    ? SocelleColors.recoverySurface
                    : SocelleColors.surfaceMuted,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                _iconForKey(moduleInfo.iconName),
                size: 20,
                color: hasAccess
                    ? SocelleColors.recovery
                    : SocelleColors.neutralBeige,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(moduleInfo.name, style: SocelleText.label),
                  if (accessType != null && hasAccess)
                    Text(
                      accessType == 'trial' ? 'Trial' : 'Included',
                      style: SocelleText.bodyMedium.copyWith(fontSize: 12),
                    ),
                ],
              ),
            ),
            if (hasAccess)
              const Icon(
                Icons.check_circle_rounded,
                size: 22,
                color: SocelleColors.recovery,
              )
            else
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  context.push(
                    '/subscription/upgrade',
                    extra: moduleInfo.key,
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: SocelleColors.accentSurface,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.lock_outline_rounded,
                        size: 13,
                        color: SocelleColors.accent,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Upgrade',
                        style: SocelleText.label.copyWith(
                          fontSize: 12,
                          color: SocelleColors.accent,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ─── MANAGE SECTION ──────────────────────────────────────────────────────────

class _ManageSection extends StatelessWidget {
  const _ManageSection({required this.sub});

  final SubscriptionWithPlan sub;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SocelleSectionLabel('Manage'),
        const SizedBox(height: 16),

        // Change Plan
        SocelleCard(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          onTap: () => context.push('/subscription/plans'),
          child: Row(
            children: [
              const Icon(
                Icons.swap_horiz_rounded,
                size: 20,
                color: SocelleColors.accent,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text('Change Plan', style: SocelleText.label),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                size: 20,
                color: SocelleColors.neutralBeige,
              ),
            ],
          ),
        ),

        const SizedBox(height: 8),

        // Cancel
        if (!sub.subscription.cancelAtPeriodEnd)
          SocelleCard(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            onTap: () => _showCancelDialog(context),
            child: Row(
              children: [
                Icon(
                  Icons.cancel_outlined,
                  size: 20,
                  color: SocelleColors.leakage,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Cancel Subscription',
                    style: SocelleText.label.copyWith(
                      color: SocelleColors.leakage,
                    ),
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: SocelleColors.neutralBeige,
                ),
              ],
            ),
          ),
      ],
    );
  }

  void _showCancelDialog(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: SocelleColors.bgMain,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Text(
          'Cancel Subscription?',
          style: SocelleText.headlineMedium,
        ),
        content: Text(
          'You will retain access until the end of your current billing period.',
          style: SocelleText.bodyLarge,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(
              'Keep Plan',
              style: SocelleText.label.copyWith(
                color: SocelleColors.accent,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              // TODO: Wire to Stripe cancellation endpoint
            },
            child: Text(
              'Cancel',
              style: SocelleText.label.copyWith(
                color: SocelleColors.leakage,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── NO SUBSCRIPTION ─────────────────────────────────────────────────────────

class _NoSubscription extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SocelleCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Icon(
            Icons.card_membership_rounded,
            size: 48,
            color: SocelleColors.neutralBeige,
          ),
          const SizedBox(height: 16),
          Text(
            'No Active Plan',
            style: SocelleText.headlineMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Subscribe to unlock premium modules and features.',
            style: SocelleText.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          SocellePillButton(
            label: 'View Plans',
            variant: PillVariant.primary,
            tone: PillTone.light,
            size: PillSize.medium,
            expand: true,
            onTap: () => context.push('/subscription/plans'),
          ),
        ],
      ),
    );
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

class _LoadingCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      decoration: BoxDecoration(
        color: SocelleColors.surfaceMuted,
        borderRadius: SocelleRadius.card(context),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SocelleCard(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: SocelleColors.leakage, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Unable to load subscription data.',
              style: SocelleText.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

String _formatDate(DateTime date) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return '${months[date.month - 1]} ${date.day}, ${date.year}';
}

IconData _iconForKey(String iconName) {
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
