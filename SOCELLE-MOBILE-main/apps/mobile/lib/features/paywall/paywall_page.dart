import '../../services/supabase_client.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/constants.dart';
import '../../core/theme/socelle_colors.dart';
import '../../models/paywall_trigger.dart';
import '../../providers/subscription_provider.dart';
import '../../providers/user_settings_provider.dart';
import '../../services/magic_link_service.dart';

class PaywallPage extends ConsumerStatefulWidget {
  const PaywallPage({
    super.key,
    required this.weeklyLeakage,
    this.trigger,
  });

  final double weeklyLeakage;

  /// Optional contextual trigger that customises headline and CTA copy.
  /// Defaults to generic recovery framing when null.
  final PaywallTrigger? trigger;

  @override
  ConsumerState<PaywallPage> createState() => _PaywallPageState();
}

class _PaywallPageState extends ConsumerState<PaywallPage> {
  bool _annualSelected = true;

  Future<void> _startTrial() async {
    // upgradeToWeb: route to magic-link handoff instead of RevenueCat
    if (widget.trigger?.type == PaywallTriggerType.upgradeToWeb) {
      await _handleUpgradeToWeb();
      return;
    }
    await ref.read(subscriptionProvider.notifier).startTrial();
    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Your 7-day free trial has started!'),
        ),
      );
    }
  }

  /// Called when the upgradeToWeb trigger is active.
  /// Requests a magic link and launches the Web Plan Wizard handoff URL.
  Future<void> _handleUpgradeToWeb() async {
    // For now show a loading snackbar while we fetch the magic link.
    // A future iteration can replace the CTA button with a spinner.
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Opening Socelle Web…')),
    );

    // Retrieve the user's email from Supabase Auth
    final email = SocelleSupabaseClient.isInitialized
        ? SocelleSupabaseClient.client.auth.currentUser?.email
        : null;
    if (email == null || email.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please add your email in settings before exploring brands.'),
          ),
        );
      }
      return;
    }

    final result = await MagicLinkService.buildHandoffUri(email: email);

    if (result == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not generate a link. Please try again.'),
          ),
        );
      }
      return;
    }

    await _launchUrl(result.uri.toString());
    if (mounted) Navigator.pop(context);
  }

  Future<void> _restorePurchase() async {
    try {
      await ref.read(subscriptionProvider.notifier).restorePurchases();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Purchases restored successfully!'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to restore purchases: $e'),
          ),
        );
      }
    }
  }

  Future<void> _launchUrl(String urlString) async {
    final uri = Uri.parse(urlString);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Could not open link: $urlString'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error opening link: $e'),
          ),
        );
      }
    }
  }

  _TriggerCopy _buildTriggerCopy() {
    final t = widget.trigger;
    if (t == null || !t.isActive) {
      return const _TriggerCopy(
        badge: 'Revenue Recovery Forecast',
        ctaAnnual: 'Start 7-Day Trial · Annual',
        ctaMonthly: 'Start 7-Day Trial · Monthly',
        footerNote:
            'One recovered appointment can cover a full year of Socelle.',
      );
    }

    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return switch (t.type) {
      PaywallTriggerType.cumulativeLeakage => _TriggerCopy(
          badge: 'Revenue Recovery Forecast',
          ctaAnnual: 'Stop the Leak · Go Annual',
          ctaMonthly: 'Stop the Leak · Monthly',
          footerNote: t.leakageAmount != null
              ? 'You\'ve already identified ${currency.format(t.leakageAmount)} in leakage. Start recovering it.'
              : 'One recovered appointment can cover a full year of Socelle.',
        ),
      PaywallTriggerType.firstRecovery => _TriggerCopy(
          badge: 'You\'ve Proven It Works',
          ctaAnnual: 'Keep Your Streak · Annual',
          ctaMonthly: 'Keep Your Streak · Monthly',
          footerNote: t.recoveredAmount != null
              ? 'You recovered ${currency.format(t.recoveredAmount)}. Imagine what a full month looks like.'
              : 'Your first recovery is proof. Don\'t stop now.',
        ),
      PaywallTriggerType.repeatedShareUse => _TriggerCopy(
          badge: 'Your Network Sees the Value',
          ctaAnnual: 'Unlock Full Access · Annual',
          ctaMonthly: 'Unlock Full Access · Monthly',
          footerNote:
              'You\'ve shared Socelle ${t.shareCount ?? 3}x. Unlock the full recovery engine for your business.',
        ),
      PaywallTriggerType.missedHighProbGap => _TriggerCopy(
          badge: 'High-Probability Slot Waiting',
          ctaAnnual: 'Never Miss a Slot · Annual',
          ctaMonthly: 'Never Miss a Slot · Monthly',
          footerNote: t.missedGapValue != null
              ? 'That ${currency.format(t.missedGapValue)} slot had a high fill chance. Pro keeps your pipeline visible 24/7.'
              : 'Pro users keep their calendar pipeline visible around the clock.',
        ),
      PaywallTriggerType.trialEndWithRecovery => _TriggerCopy(
          badge: 'Your Trial Proved the ROI',
          ctaAnnual: 'Continue · Lock In Annual Rate',
          ctaMonthly: 'Continue · Monthly Billing',
          footerNote: t.recoveredAmount != null
              ? 'You recovered ${currency.format(t.recoveredAmount)} during your trial. Don\'t lose that momentum.'
              : 'You\'ve already seen what recovery looks like. Don\'t lose momentum.',
        ),
      PaywallTriggerType.upgradeToWeb => _TriggerCopy(
          badge: 'You\'ve Earned It',
          ctaAnnual: 'Explore Brands →',
          ctaMonthly: 'Explore Brands →',
          footerNote: t.recoveredAmount != null
              ? 'You\'ve recovered ${currency.format(t.recoveredAmount)} — solo pros at this level typically find a brand partner on Socelle within 60 days.'
              : 'Unlock the full marketplace. Your recovery track record speaks for itself.',
        ),
      PaywallTriggerType.none => const _TriggerCopy(
          badge: 'Revenue Recovery Forecast',
          ctaAnnual: 'Start 7-Day Trial · Annual',
          ctaMonthly: 'Start 7-Day Trial · Monthly',
          footerNote:
              'One recovered appointment can cover a full year of Socelle.',
        ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final monthlyLeakage = widget.weeklyLeakage * 4.3;
    final bookingValue =
        ref.read(userSettingsProvider).valueOrNull?.avgBookingValue ?? 85;
    final missedBookings = (monthlyLeakage / bookingValue).round();
    final copy = _buildTriggerCopy();

    // For upgradeToWeb, swap the hero card to show recovered revenue
    final isUpgradeToWeb =
        widget.trigger?.type == PaywallTriggerType.upgradeToWeb;
    final heroAmount = isUpgradeToWeb
        ? (widget.trigger?.recoveredAmount ?? monthlyLeakage)
        : monthlyLeakage;
    final heroSubtitle = isUpgradeToWeb
        ? 'recovered in the last 30 days'
        : 'hiding in your monthly calendar flow';
    final heroDetail = isUpgradeToWeb
        ? 'That puts you in the top tier of solo pros on the platform.'
        : 'That is about $missedBookings missed bookings at your current average value.';

    return Scaffold(
      backgroundColor: SocelleColors.surfaceSoft,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(18, 6, 18, 24),
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: SocelleColors.ink,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        copy.badge,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: heroAmount),
                      duration: const Duration(milliseconds: 1200),
                      curve: Curves.easeOutCubic,
                      builder: (context, value, _) => Text(
                        currency.format(value),
                        style: Theme.of(context)
                            .textTheme
                            .displayLarge
                            ?.copyWith(color: Colors.white),
                      ),
                    ),
                    Text(
                      heroSubtitle,
                      style:
                          Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.white.withValues(alpha: 0.84),
                              ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      heroDetail,
                      style:
                          Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.white.withValues(alpha: 0.8),
                              ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              _PlanCard(
                title: 'Annual Pro',
                badge: 'BEST VALUE',
                isSelected: _annualSelected,
                priceLabel:
                    '\$${SocelleConstants.annualPrice.toStringAsFixed(0)}/year',
                subLabel:
                    '\$${SocelleConstants.annualMonthlyEquivalent}/mo · Save \$${SocelleConstants.annualSavings.toStringAsFixed(0)}',
                onTap: () => setState(() => _annualSelected = true),
                accentColor: SocelleColors.primary,
              ),
              const SizedBox(height: 10),
              _PlanCard(
                title: 'Monthly Pro',
                isSelected: !_annualSelected,
                priceLabel:
                    '\$${SocelleConstants.monthlyPrice.toStringAsFixed(0)}/month',
                subLabel: 'Flexible monthly billing',
                onTap: () => setState(() => _annualSelected = false),
                accentColor: SocelleColors.accentBlue,
              ),
              const SizedBox(height: 14),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: SocelleColors.divider),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ValuePoint(
                        text: 'Smart gap feed prioritized by money impact'),
                    _ValuePoint(
                        text:
                            'One-tap fill-slot workflows with streak tracking'),
                    _ValuePoint(
                        text:
                            'Intentional time memory so true leakage stays accurate'),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _startTrial,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(double.infinity, 58),
                  ),
                  child: Text(
                    _annualSelected ? copy.ctaAnnual : copy.ctaMonthly,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                copy.footerNote,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontStyle: FontStyle.italic,
                      color: SocelleColors.textSecondary,
                    ),
              ),
              const SizedBox(height: 14),
              Wrap(
                alignment: WrapAlignment.center,
                children: [
                  TextButton(
                    onPressed: _restorePurchase,
                    child: const Text('Restore purchase'),
                  ),
                  const Text(' · '),
                  TextButton(
                    onPressed: () => _launchUrl('https://socelle.app/terms'),
                    child: const Text('Terms'),
                  ),
                  const Text(' · '),
                  TextButton(
                    onPressed: () => _launchUrl('https://socelle.app/privacy'),
                    child: const Text('Privacy'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Trigger copy data class
// ─────────────────────────────────────────────────────────────

class _TriggerCopy {
  const _TriggerCopy({
    required this.badge,
    required this.ctaAnnual,
    required this.ctaMonthly,
    required this.footerNote,
  });

  final String badge;
  final String ctaAnnual;
  final String ctaMonthly;
  final String footerNote;
}

// ─────────────────────────────────────────────────────────────
// Supporting widgets
// ─────────────────────────────────────────────────────────────

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.title,
    this.badge,
    required this.isSelected,
    required this.priceLabel,
    required this.subLabel,
    required this.onTap,
    required this.accentColor,
  });

  final String title;
  final String? badge;
  final bool isSelected;
  final String priceLabel;
  final String subLabel;
  final VoidCallback onTap;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.92),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isSelected
                ? accentColor.withValues(alpha: 0.8)
                : SocelleColors.divider,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: accentColor.withValues(alpha: 0.18),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (badge != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: accentColor,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      badge!,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                const Spacer(),
                Icon(
                  isSelected
                      ? Icons.radio_button_checked
                      : Icons.radio_button_off_rounded,
                  color: isSelected ? accentColor : SocelleColors.textMuted,
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              priceLabel,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 2),
            Text(subLabel, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _ValuePoint extends StatelessWidget {
  const _ValuePoint({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(
              Icons.check_circle_rounded,
              size: 16,
              color: SocelleColors.recoveredGreen,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: SocelleColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

