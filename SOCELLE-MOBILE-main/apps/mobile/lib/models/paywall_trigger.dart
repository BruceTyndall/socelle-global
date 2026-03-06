/// The value-triggered paywall events from the blueprint.
enum PaywallTriggerType {
  /// $200+ in cumulative detected leakage since signup.
  cumulativeLeakage,

  /// First successful gap fill (delayed 24h).
  firstRecovery,

  /// User has used the share sheet 3+ times.
  repeatedShareUse,

  /// A high-probability gap (48h+ window) passed unfilled.
  missedHighProbGap,

  /// Trial ending within 48h AND 2+ gaps already filled.
  trialEndWithRecovery,

  /// Graduated Funnel: recovered_30d > $500 — surface the Web upgrade prompt.
  /// This is NOT a RevenueCat paywall trigger; it routes to the magic-link
  /// handoff flow instead of the native subscription sheet.
  upgradeToWeb,

  /// Default / no active trigger — show standard paywall.
  none,
}

/// Carries contextual data for the active paywall trigger so that
/// [PaywallTriggerResolver] can produce the right hero copy.
class PaywallTrigger {
  const PaywallTrigger({
    required this.type,
    this.leakageAmount,
    this.recoveredAmount,
    this.shareCount,
    this.missedGapValue,
    this.recoveryMultiple,
    this.topGapCategories,
  });

  final PaywallTriggerType type;

  /// For [cumulativeLeakage]: total leakage seen.
  final double? leakageAmount;

  /// For [firstRecovery] / [trialEndWithRecovery]: amount recovered.
  final double? recoveredAmount;

  /// For [repeatedShareUse]: number of share-sheet uses.
  final int? shareCount;

  /// For [missedHighProbGap]: leakage value of the missed gap.
  final double? missedGapValue;

  /// For [trialEndWithRecovery]: recoveredAmount / monthly plan price.
  final double? recoveryMultiple;

  /// For [upgradeToWeb]: top N gap service categories (e.g. ["Facial", "Body Massage"]).
  /// Passed to the Web Plan Wizard as query params for pre-population.
  final List<String>? topGapCategories;

  const PaywallTrigger.none() : this(type: PaywallTriggerType.none);

  /// Convenience constructor for the Web upgrade prompt.
  ///
  /// [recoveredAmount] is the 30-day recovered revenue that crossed the
  /// $500 threshold and triggered this promotion.
  /// [topGapCategories] carries the top N gap category strings from Firestore
  /// so the Web Plan Wizard can be pre-populated on handoff.
  const PaywallTrigger.upgradeToWeb({
    required double recoveredAmount,
    required List<String> topGapCategories,
  }) : this(
          type: PaywallTriggerType.upgradeToWeb,
          recoveredAmount: recoveredAmount,
          topGapCategories: topGapCategories,
        );

  bool get isActive => type != PaywallTriggerType.none;
}
