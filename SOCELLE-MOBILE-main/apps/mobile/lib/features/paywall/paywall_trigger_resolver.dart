import 'package:intl/intl.dart';

import '../../models/paywall_trigger.dart';

/// Resolved copy for the paywall hero section, specific to each trigger.
class PaywallCopy {
  const PaywallCopy({
    required this.heroLabel,
    required this.heroValue,
    required this.subText,
    required this.ctaLabel,
  });

  /// Short label above the hero number (e.g. "Detected Leakage").
  final String heroLabel;

  /// The formatted dollar value shown as the hero number (or a sentence).
  final String heroValue;

  /// Supporting text below the hero.
  final String subText;

  /// CTA button label.
  final String ctaLabel;
}

/// Maps a [PaywallTrigger] to the correct hero copy per the blueprint.
class PaywallTriggerResolver {
  static final _currency =
      NumberFormat.currency(symbol: '\$', decimalDigits: 0);

  static PaywallCopy resolve(PaywallTrigger trigger) {
    switch (trigger.type) {
      case PaywallTriggerType.cumulativeLeakage:
        final amount = trigger.leakageAmount ?? 0;
        final recovered = (amount * 0.6).round();
        return PaywallCopy(
          heroLabel: 'Detectable gaps since you started',
          heroValue: _currency.format(amount),
          subText:
              'Pro users who act on gaps like these recover an average of 60% of that. '
              'At your rate, that\'s roughly \$$recovered back.',
          ctaLabel: 'Start 7-Day Trial',
        );

      case PaywallTriggerType.firstRecovery:
        final amount = trigger.recoveredAmount ?? 0;
        return PaywallCopy(
          heroLabel: 'Just recovered',
          heroValue: _currency.format(amount),
          subText:
              'Pro unlocks client broadcast so you can fill gaps directly from the app — '
              'without leaving to text manually.',
          ctaLabel: 'Keep the momentum going',
        );

      case PaywallTriggerType.repeatedShareUse:
        final count = trigger.shareCount ?? 3;
        return PaywallCopy(
          heroLabel: 'You\'ve reached out $count times',
          heroValue: 'Time to level up',
          subText:
              'Pro lets you broadcast to your full client list in one tap, '
              'with message templates that work. No more copy-paste.',
          ctaLabel: 'Upgrade to Pro',
        );

      case PaywallTriggerType.missedHighProbGap:
        final missed = trigger.missedGapValue ?? 0;
        return PaywallCopy(
          heroLabel: 'That gap closed unfilled',
          heroValue: _currency.format(missed),
          subText:
              'It had a strong fill window. Pro adds a client waitlist so '
              'your next high-probability gap gets filled before you have to think about it.',
          ctaLabel: 'Don\'t miss the next one',
        );

      case PaywallTriggerType.trialEndWithRecovery:
        final amount = trigger.recoveredAmount ?? 0;
        final multiple = trigger.recoveryMultiple ?? 0;
        final multipleStr =
            multiple >= 1 ? '${multiple.toStringAsFixed(1)}x' : 'more than';
        return PaywallCopy(
          heroLabel: 'Recovered in your trial',
          heroValue: _currency.format(amount),
          subText:
              'That\'s $multipleStr the cost of Pro for a full month. Keep going? '
              'If you don\'t recover at least \$29 in your first paid month, email us. '
              'We\'ll make it right.',
          ctaLabel: 'Continue with Pro',
        );

      case PaywallTriggerType.upgradeToWeb:
        final amount = trigger.recoveredAmount ?? 0;
        return PaywallCopy(
          heroLabel: 'Recovered in the last 30 days',
          heroValue: _currency.format(amount),
          subText:
              'Solo pros who cross \$500 typically find a brand partner through '
              'Socelle within 60 days. Your gap data is ready — '
              'see which professional brands match your exact service menu.',
          ctaLabel: 'Explore Brands →',
        );

      case PaywallTriggerType.none:
        return const PaywallCopy(
          heroLabel: 'Revenue Recovery Forecast',
          heroValue: '',
          subText: '',
          ctaLabel: 'Start 7-Day Trial',
        );
    }
  }
}
