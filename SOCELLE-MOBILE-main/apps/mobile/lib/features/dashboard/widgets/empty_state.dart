import 'package:flutter/material.dart';

import '../../../core/theme/slotforce_colors.dart';

enum EmptyStateType {
  noSync,
  noGaps,
  allIntentional,
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.type});

  final EmptyStateType type;

  @override
  Widget build(BuildContext context) {
    final (icon, title, subtitle) = switch (type) {
      EmptyStateType.noSync => (
          Icons.calendar_month_rounded,
          'Ready to make money from your calendar?',
          'Run your first sync and surface every high-value open slot.',
        ),
      EmptyStateType.noGaps => (
          Icons.celebration_rounded,
          'Booked and unbothered.',
          'No open gaps this week. You made broke look iconic.',
        ),
      EmptyStateType.allIntentional => (
          Icons.check_circle_outline_rounded,
          'Every gap is intentional',
          'Every open window is tagged. Clean, controlled, and still hot.',
        ),
    };

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 64),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    SlotforceColors.glamPink.withValues(alpha: 0.15),
                    SlotforceColors.glamGold.withValues(alpha: 0.22),
                  ],
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 48,
                color: SlotforceColors.glamPlum,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
