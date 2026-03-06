import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/constants.dart';
import '../../../core/theme/slotforce_colors.dart';
import '../../../models/sync_models.dart';
import '../../../models/user_settings.dart';

class WeekDayBar extends StatelessWidget {
  const WeekDayBar({
    super.key,
    required this.gaps,
    required this.workingHours,
  });

  final List<GapItem> gaps;
  final Map<String, WorkingDay> workingHours;

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 0,
    );

    // Only show enabled working days
    final enabledDays = SocelleConstants.dayNames
        .where((d) => workingHours[d]?.enabled == true)
        .toList();

    if (enabledDays.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            'Weekly Chair Flow',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
        ),
        ...enabledDays.map((day) {
          final dayGaps = gaps.where((g) => g.dayOfWeek == day).toList();
          final wh = workingHours[day]!;
          final totalMinutes = wh.totalMinutes;
          final gapMinutes =
              dayGaps.fold(0, (sum, g) => sum + g.durationMinutes);
          final dayLeakage =
              dayGaps.fold(0.0, (sum, g) => sum + g.leakageValue);

          final gapPercent = totalMinutes > 0
              ? (gapMinutes / totalMinutes).clamp(0.0, 1.0)
              : 0.0;
          final busyPercent = 1.0 - gapPercent;

          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                SizedBox(
                  width: 36,
                  child: Text(
                    SocelleConstants.dayAbbreviations[day]!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: SlotforceColors.textSecondary,
                        ),
                  ),
                ),
                Expanded(
                  child: Container(
                    height: 22,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(999),
                      color: SlotforceColors.divider.withValues(alpha: 0.8),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(999),
                      child: Row(
                        children: [
                          if (busyPercent > 0)
                            Flexible(
                              flex: (busyPercent * 100).round(),
                              child: Container(
                                color: SlotforceColors.primary
                                    .withValues(alpha: 0.66),
                              ),
                            ),
                          if (gapPercent > 0)
                            Flexible(
                              flex: (gapPercent * 100).round(),
                              child: Container(
                                color: SlotforceColors.glamPink
                                    .withValues(alpha: 0.58),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                SizedBox(
                  width: 56,
                  child: Text(
                    dayLeakage > 0 ? currencyFormat.format(dayLeakage) : '--',
                    textAlign: TextAlign.right,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: dayLeakage > 0
                              ? SlotforceColors.leakageRed
                              : SlotforceColors.textMuted,
                        ),
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 4),
        Row(
          children: [
            const SizedBox(width: 36),
            _Legend(
                color: SlotforceColors.primary.withValues(alpha: 0.66),
                label: 'Booked'),
            const SizedBox(width: 16),
            _Legend(
                color: SlotforceColors.glamPink.withValues(alpha: 0.58),
                label: 'Open'),
          ],
        ),
      ],
    );
  }
}

class _Legend extends StatelessWidget {
  const _Legend({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}
