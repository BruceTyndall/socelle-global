import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants.dart';
import '../core/feature_flags.dart';
import '../models/paywall_trigger.dart';
import '../providers/subscription_provider.dart';
import '../providers/user_settings_provider.dart';
import '../services/ab_test_service.dart';
import '../services/gap_handoff_service.dart';

/// Evaluates which paywall trigger (if any) is currently active.
///
/// Checks are done in priority order. The first active trigger wins.
/// Once a trigger is shown (via [markTriggerSeen]), it is suppressed
/// until the underlying state changes.
final paywallTriggerProvider =
    AsyncNotifierProvider<PaywallTriggerNotifier, PaywallTrigger>(
  PaywallTriggerNotifier.new,
);

class PaywallTriggerNotifier extends AsyncNotifier<PaywallTrigger> {
  @override
  Future<PaywallTrigger> build() async {
    return _evaluate();
  }

  Future<PaywallTrigger> _evaluate() async {
    final storage = ref.read(settingsStorageProvider);
    final subscription = await ref.read(subscriptionProvider.future);

    // Only evaluate triggers for free/trial users
    if (subscription.isActive && !subscription.isTrial) {
      return const PaywallTrigger.none();
    }

    // ── Trigger 1: Cumulative leakage >= $200 ────────────────────────────
    final firedTriggers = await storage.getFiredPaywallTriggers();
    if (!firedTriggers.contains(PaywallTriggerType.cumulativeLeakage.name)) {
      // Use leakage_200 variant from A/B test (default to true when feature disabled)
      final shouldTriggerLeakage200 = FeatureFlags.kEnableAbTest
          ? AbTestService.paywallTriggerTiming() == 'leakage_200'
          : true;
      if (shouldTriggerLeakage200) {
        final leakage = await storage.getCumulativeLeakageSeen();
        if (leakage >= 200) {
          return PaywallTrigger(
            type: PaywallTriggerType.cumulativeLeakage,
            leakageAmount: leakage,
          );
        }
      }
    }

    // ── Trigger 2: First recovery (24h delay) ────────────────────────────
    if (!firedTriggers.contains(PaywallTriggerType.firstRecovery.name)) {
      final firstRecoveryDate = await storage.getFirstRecoveryDate();
      if (firstRecoveryDate != null) {
        final hoursSince =
            DateTime.now().difference(firstRecoveryDate).inHours;
        if (hoursSince >= 24) {
          final recovered = await storage.getRecoveredRevenue();
          if (recovered > 0) {
            return PaywallTrigger(
              type: PaywallTriggerType.firstRecovery,
              recoveredAmount: recovered,
            );
          }
        }
      }
    }

    // ── Trigger 3: 3+ share-sheet uses ──────────────────────────────────
    if (!firedTriggers.contains(PaywallTriggerType.repeatedShareUse.name)) {
      final shareCount = await storage.getShareSheetUseCount();
      if (shareCount >= 3) {
        return PaywallTrigger(
          type: PaywallTriggerType.repeatedShareUse,
          shareCount: shareCount,
        );
      }
    }

    // ── Trigger 4: Missed high-probability gap ──────────────────────────
    if (!firedTriggers.contains(PaywallTriggerType.missedHighProbGap.name)) {
      final missedValue = await storage.getMissedHighProbGapValue();
      if (missedValue != null && missedValue > 0) {
        return PaywallTrigger(
          type: PaywallTriggerType.missedHighProbGap,
          missedGapValue: missedValue,
        );
      }
    }

    // ── Trigger 5: Trial ending + 2+ recovered gaps ──────────────────────
    if (!firedTriggers.contains(PaywallTriggerType.trialEndWithRecovery.name)) {
      if (subscription.isTrial &&
          subscription.trialDaysRemaining <= 2) {
        final recoveredGapCount = await storage.getRecoveredGapCount();
        if (recoveredGapCount >= 2) {
          final recovered = await storage.getRecoveredRevenue();
          const monthlyPrice = SocelleConstants.monthlyPrice;
          final multiple =
              monthlyPrice > 0 ? (recovered / monthlyPrice) : 0.0;
          return PaywallTrigger(
            type: PaywallTriggerType.trialEndWithRecovery,
            recoveredAmount: recovered,
            recoveryMultiple: double.parse(multiple.toStringAsFixed(1)),
          );
        }
      }
    }

    // ── Trigger 6: Graduated Funnel — upgrade to Socelle Web ─────────────
    // Fires when recovered revenue crosses $500 threshold.
    // Routes to magic-link handoff rather than RevenueCat subscription sheet.
    if (!firedTriggers.contains(PaywallTriggerType.upgradeToWeb.name)) {
      final recovered = await storage.getRecoveredRevenue();
      if (recovered >= SocelleConstants.webUpgradeRevenueThreshold) {
        final topGaps = await GapHandoffService.getTopGapCategories();
        return PaywallTrigger.upgradeToWeb(
          recoveredAmount: recovered,
          topGapCategories: topGaps,
        );
      }
    }

    return const PaywallTrigger.none();
  }

  /// Call after showing the paywall so the same trigger doesn't fire again.
  Future<void> markTriggerSeen(PaywallTriggerType type) async {
    if (type == PaywallTriggerType.none) return;
    final storage = ref.read(settingsStorageProvider);
    await storage.addFiredPaywallTrigger(type.name);
    // Clear context state that triggered it
    if (type == PaywallTriggerType.missedHighProbGap) {
      await storage.clearMissedHighProbGapValue();
    }
    state = const AsyncData(PaywallTrigger.none());
  }

  /// Called on each sync completion to record a missed high-prob gap.
  Future<void> recordMissedHighProbGap(double leakageValue) async {
    final storage = ref.read(settingsStorageProvider);
    await storage.setMissedHighProbGapValue(leakageValue);
    ref.invalidateSelf();
  }

  /// Called on each sync completion to accumulate leakage.
  Future<void> addLeakageSeen(double amount) async {
    final storage = ref.read(settingsStorageProvider);
    await storage.addCumulativeLeakageSeen(amount);
    ref.invalidateSelf();
  }
}
