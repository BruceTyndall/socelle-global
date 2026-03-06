import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/socelle_colors.dart';
import '../../models/paywall_trigger.dart';
import '../../providers/subscription_provider.dart';
import '../../providers/sync_provider.dart';
import '../../services/analytics_service.dart';
import '../paywall/paywall_page.dart';
import 'exit_survey_sheet.dart';

/// Shown before cancellation is confirmed. Displays account summary and
/// routes user to exit survey per the blueprint.
///
/// Blueprint copy: "Before you go — here's your account at a glance."
class CancelInterceptPage extends ConsumerStatefulWidget {
  const CancelInterceptPage({super.key});

  @override
  ConsumerState<CancelInterceptPage> createState() =>
      _CancelInterceptPageState();
}

class _CancelInterceptPageState extends ConsumerState<CancelInterceptPage> {
  bool _cancelling = false;

  @override
  void initState() {
    super.initState();
    AnalyticsService.cancellationFlowStarted();
  }

  Future<void> _cancelAnyway() async {
    setState(() => _cancelling = true);
    try {
      await ref.read(subscriptionProvider.notifier).cancelSubscription();
      if (mounted) {
        Navigator.popUntil(context, (route) => route.isFirst);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Subscription cancelled.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not cancel: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    // Recovered revenue — sourced from the dedicated provider (persisted locally).
    final recovered = ref.watch(recoveredRevenueProvider).valueOrNull ?? 0.0;

    // Current-week leakage and open gap count from the last sync result.
    final syncResult = ref.watch(syncResultProvider).valueOrNull;
    final weeklyLeakage = syncResult?.totals.weeklyLeakage ?? 0.0;
    final openGaps = syncResult?.currentWeekGapCount() ?? 0;

    return Scaffold(
      backgroundColor: SocelleColors.surfaceSoft,
      appBar: AppBar(
        title: const Text('Cancel Subscription'),
        centerTitle: false,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Before you go',
                style:
                    Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
              ),
              const SizedBox(height: 4),
              Text(
                'Here\'s your account at a glance.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: SocelleColors.textSecondary,
                    ),
              ),
              const SizedBox(height: 24),

              // Account summary card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: SocelleColors.divider),
                ),
                child: Column(
                  children: [
                    _SummaryRow(
                      label: 'Total recovered since signup',
                      value: currency.format(recovered),
                      valueColor: SocelleColors.recoveredGreen,
                    ),
                    const Divider(height: 24),
                    _SummaryRow(
                      label: 'Leakage detected this week',
                      value: currency.format(weeklyLeakage),
                      valueColor: SocelleColors.leakageRed,
                    ),
                    const Divider(height: 24),
                    _SummaryRow(
                      label: 'Current open gaps this week',
                      value: '$openGaps gaps',
                      valueColor: SocelleColors.accentBlue,
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Primary CTA: Tell us what's not working
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () async {
                    final reason = await ExitSurveySheet.show(context);
                    if (reason != null && mounted) {
                      await AnalyticsService.exitSurveyCompleted(reason);
                      if (mounted) {
                        _handleExitSurveyResult(reason);
                      }
                    }
                  },
                  child: const Text('Tell us what\'s not working'),
                ),
              ),
              const SizedBox(height: 10),

              // Secondary: Cancel anyway
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: _cancelling ? null : _cancelAnyway,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: SocelleColors.leakageRed,
                    side: const BorderSide(color: SocelleColors.leakageRed),
                  ),
                  child: _cancelling
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Cancel anyway'),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  void _handleExitSurveyResult(String reason) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    switch (reason) {
      case 'not_using_consistently':
        AnalyticsService.cancellationPrevented('downgrade');
        _showRetentionDialog(
          title: 'Take a break instead?',
          body:
              'Sometimes a lower-touch plan fits better. You can pause your '
              'subscription for 30 days — your gaps and history will still be here.',
          actionLabel: 'Keep my account',
          onAction: () => Navigator.pop(context),
        );

      case 'didnt_see_results':
        AnalyticsService.cancellationPrevented('support');
        _showRetentionDialog(
          title: 'That\'s on us to fix.',
          body:
              'Can we look at your account and tell you what\'s happening? '
              'Reply to our support email and we\'ll review your setup personally.',
          actionLabel: 'Contact support',
          onAction: () {
            // Open mail client pre-addressed to support.
            unawaited(launchUrl(
              Uri(
                scheme: 'mailto',
                path: 'support@socelle.app',
                queryParameters: {
                  'subject': 'Account Review Request',
                },
              ),
              mode: LaunchMode.externalApplication,
            ));
          },
        );

      case 'too_expensive':
        AnalyticsService.cancellationPrevented('annual');
        _showRetentionDialog(
          title: 'Annual plan is ${currency.format(20)}/month',
          body:
              'Annual billing works out to \$20.75/month — 28% less than monthly. '
              'No other changes to your account.',
          actionLabel: 'Switch to Annual',
          onAction: () {
            // Navigate to paywall — annual plan is shown first by default.
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => const PaywallPage(
                  weeklyLeakage: 0,
                  trigger: PaywallTrigger.none(),
                ),
              ),
            );
          },
        );

      case 'switched_tool':
        AnalyticsService.subscriptionCancelled(reason);
        _cancelAnyway();

      default:
        // 'something_else' or unknown
        AnalyticsService.subscriptionCancelled(reason);
        _cancelAnyway();
    }
  }

  void _showRetentionDialog({
    required String title,
    required String body,
    required String actionLabel,
    required VoidCallback onAction,
  }) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18)),
        title: Text(title),
        content: Text(body),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _cancelAnyway();
            },
            child: const Text('Cancel anyway'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(ctx);
              onAction();
            },
            child: Text(actionLabel),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    required this.valueColor,
  });

  final String label;
  final String value;
  final Color valueColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SocelleColors.textSecondary,
                ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          value,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w800,
                color: valueColor,
              ),
        ),
      ],
    );
  }
}
