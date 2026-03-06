import 'package:flutter/material.dart';

import '../../../core/theme/slotforce_colors.dart';
import '../../../models/sync_models.dart';

class InsightCard extends StatelessWidget {
  const InsightCard({super.key, required this.gaps});

  final List<GapItem> gaps;

  String? _generateInsight() {
    if (gaps.isEmpty) return null;

    // Find the day with most leakage
    final byDay = <String, double>{};
    for (final gap in gaps) {
      if (gap.isOpen) {
        byDay[gap.dayOfWeek] = (byDay[gap.dayOfWeek] ?? 0) + gap.leakageValue;
      }
    }

    if (byDay.isEmpty) return null;

    final worstDay = byDay.entries.reduce((a, b) => a.value > b.value ? a : b);
    final dayName = worstDay.key[0].toUpperCase() + worstDay.key.substring(1);

    final openGaps = gaps.where((g) => g.isOpen).length;
    if (openGaps >= 3) {
      return '$dayName is your strongest revenue day. Fill one priority slot and recover \$${worstDay.value.toStringAsFixed(0)}.';
    }

    return 'You have $openGaps open windows this week. Fill each one to protect your revenue.';
  }

  @override
  Widget build(BuildContext context) {
    final insight = _generateInsight();
    if (insight == null) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withValues(alpha: 0.95),
            SlotforceColors.glamGold.withValues(alpha: 0.14),
          ],
        ),
        borderRadius: BorderRadius.circular(14),
        border:
            Border.all(color: SlotforceColors.glamGold.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: SlotforceColors.glamPink.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.lightbulb_outline_rounded,
              color: SlotforceColors.glamPlum,
              size: 18,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              insight,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: SlotforceColors.glamInk,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
