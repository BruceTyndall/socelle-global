import '../core/constants.dart';

enum SubscriptionTier { free, trial, monthly, annual }

class SubscriptionState {
  const SubscriptionState({
    required this.tier,
    this.trialStartDate,
    this.expirationDate,
  });

  final SubscriptionTier tier;
  final DateTime? trialStartDate;
  final DateTime? expirationDate;

  factory SubscriptionState.freeTier() {
    return const SubscriptionState(tier: SubscriptionTier.free);
  }

  factory SubscriptionState.startTrial() {
    final now = DateTime.now();
    return SubscriptionState(
      tier: SubscriptionTier.trial,
      trialStartDate: now,
      expirationDate: now.add(
        const Duration(days: SocelleConstants.trialDays),
      ),
    );
  }

  bool get isActive =>
      tier == SubscriptionTier.monthly ||
      tier == SubscriptionTier.annual ||
      (tier == SubscriptionTier.trial && !isTrialExpired);

  bool get isTrial => tier == SubscriptionTier.trial;

  bool get isTrialExpired {
    if (tier != SubscriptionTier.trial || expirationDate == null) return false;
    return DateTime.now().isAfter(expirationDate!);
  }

  int get trialDaysRemaining {
    if (expirationDate == null) return 0;
    final remaining = expirationDate!.difference(DateTime.now()).inDays;
    return remaining.clamp(0, SocelleConstants.trialDays);
  }

  /// Urgency level for trial countdown display.
  /// 0 = calm (4+ days), 1 = warning (2-3 days), 2 = critical (0-1 days)
  int get trialUrgencyLevel {
    final days = trialDaysRemaining;
    if (days <= 1) return 2;
    if (days <= 3) return 1;
    return 0;
  }

  double get annualSubscriptionCost => SocelleConstants.annualPrice;
}
