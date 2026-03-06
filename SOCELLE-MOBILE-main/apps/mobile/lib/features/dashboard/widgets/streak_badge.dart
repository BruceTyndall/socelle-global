import 'package:flutter/material.dart';

import '../../../core/theme/slotforce_colors.dart';
import '../../../models/streak.dart';

class StreakBadge extends StatelessWidget {
  const StreakBadge({super.key, required this.streak});

  final StreakData streak;

  @override
  Widget build(BuildContext context) {
    if (!streak.hasStreak) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: SlotforceColors.streakOrange.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: SlotforceColors.streakOrange.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('🔥', style: TextStyle(fontSize: 16)),
          const SizedBox(width: 6),
          Text(
            '${streak.currentStreak}-week streak',
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: SlotforceColors.streakOrange,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}
