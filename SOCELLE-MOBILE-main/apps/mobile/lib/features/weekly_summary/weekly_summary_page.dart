import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/theme/slotforce_colors.dart';
import '../../services/analytics_service.dart';

/// Weekly summary bottom sheet — shows recovered vs. leaked for the current
/// week, with a forward-looking frame. Accessible from the dashboard share
/// icon or the Friday in-app prompt.
class WeeklySummarySheet extends StatefulWidget {
  const WeeklySummarySheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const WeeklySummarySheet(),
    );
  }

  @override
  State<WeeklySummarySheet> createState() => _WeeklySummarySheetState();
}

class _WeeklySummarySheetState extends State<WeeklySummarySheet> {
  _WeeklyData? _data;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    AnalyticsService.weeklySummaryViewed();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final result = await FirebaseFunctions.instance
          .httpsCallable('getWeeklySummary')
          .call();
      final data = result.data as Map<String, dynamic>;
      setState(() {
        _data = _WeeklyData.fromMap(data);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Could not load this week\'s summary.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      builder: (ctx, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: SlotforceColors.surfaceSoft,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: SlotforceColors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                  child: _loading
                      ? const Center(
                          child: Padding(
                            padding: EdgeInsets.all(40),
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        )
                      : _error != null
                          ? _ErrorState(message: _error!)
                          : _data != null
                              ? _SummaryContent(data: _data!)
                              : const SizedBox(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SummaryContent extends StatelessWidget {
  const _SummaryContent({required this.data});

  final _WeeklyData data;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final hasRecovery = data.recoveredRevenue > 0;
    final prevDiff = data.recoveredRevenue - data.prevWeekRecovered;
    final prevPositive = prevDiff >= 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Text(
          'This Week',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        Text(
          data.weekLabel,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: SlotforceColors.textMuted,
              ),
        ),
        const SizedBox(height: 20),

        // Metric row
        Row(
          children: [
            Expanded(
              child: _MetricTile(
                label: 'Recovered',
                value: currency.format(data.recoveredRevenue),
                color: SlotforceColors.recoveredGreen,
                icon: Icons.trending_up_rounded,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricTile(
                label: 'Leaked',
                value: currency.format(data.totalLeakage),
                color: SlotforceColors.leakageRed,
                icon: Icons.water_drop_outlined,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _MetricTile(
                label: 'Open gaps',
                value: '${data.openGaps}',
                color: SlotforceColors.accentBlue,
                icon: Icons.calendar_today_outlined,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricTile(
                label: 'Intentional',
                value: '${data.intentionalBlocks}',
                color: SlotforceColors.intentionalAmber,
                icon: Icons.shield_outlined,
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Forward-looking copy
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: SlotforceColors.divider),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    hasRecovery
                        ? Icons.emoji_events_rounded
                        : Icons.arrow_forward_rounded,
                    size: 18,
                    color: hasRecovery
                        ? SlotforceColors.streakOrange
                        : SlotforceColors.primary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    hasRecovery ? 'Strong week' : 'Looking ahead',
                    style:
                        Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (hasRecovery) ...[
                Text(
                  'You recovered ${currency.format(data.recoveredRevenue)} this week.'
                  '${prevPositive && prevDiff > 0 ? ' That\'s ${currency.format(prevDiff.abs())} more than last week.' : ''}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: SlotforceColors.textSecondary,
                      ),
                ),
              ] else ...[
                Text(
                  data.nextWeekGapCount > 0
                      ? 'This week stayed flat on recovery. Next week has '
                          '${data.nextWeekGapCount} gaps already visible — '
                          'early action fills better.'
                      : 'New week, clean slate. Early outreach fills 2x more gaps than same-day.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: SlotforceColors.textSecondary,
                      ),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Close / view next week CTA
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ),
      ],
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  final String label;
  final String value;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 4),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: SlotforceColors.textMuted,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
          ),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Center(
        child: Text(
          message,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SlotforceColors.textMuted,
              ),
        ),
      ),
    );
  }
}

class _WeeklyData {
  const _WeeklyData({
    required this.weekLabel,
    required this.recoveredRevenue,
    required this.totalLeakage,
    required this.openGaps,
    required this.intentionalBlocks,
    required this.prevWeekRecovered,
    required this.nextWeekGapCount,
  });

  final String weekLabel;
  final double recoveredRevenue;
  final double totalLeakage;
  final int openGaps;
  final int intentionalBlocks;
  final double prevWeekRecovered;
  final int nextWeekGapCount;

  factory _WeeklyData.fromMap(Map<String, dynamic> map) {
    return _WeeklyData(
      weekLabel: map['week_label'] as String? ?? 'This week',
      recoveredRevenue:
          (map['recovered_revenue_self_reported'] as num?)?.toDouble() ?? 0,
      totalLeakage: (map['total_leakage'] as num?)?.toDouble() ?? 0,
      openGaps: (map['open_gaps'] as num?)?.toInt() ?? 0,
      intentionalBlocks: (map['intentional_blocks'] as num?)?.toInt() ?? 0,
      prevWeekRecovered: (map['prev_week_recovered'] as num?)?.toDouble() ?? 0,
      nextWeekGapCount: (map['next_week_gap_count'] as num?)?.toInt() ?? 0,
    );
  }
}
