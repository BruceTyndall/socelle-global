import 'package:flutter/material.dart';

import '../../../core/constants.dart';
import '../../../core/theme/socelle_colors.dart';

class SlotDurationStep extends StatelessWidget {
  const SlotDurationStep({
    super.key,
    required this.selectedMinutes,
    required this.onChanged,
  });

  final int selectedMinutes;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 48),
          Text(
            'How long is a typical\nappointment?',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 12),
          Text(
            'We use this to figure out how many bookings fit into each gap.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 48),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: SocelleConstants.slotDurationOptions.map((minutes) {
              final isSelected = minutes == selectedMinutes;
              return GestureDetector(
                onTap: () => onChanged(minutes),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? SocelleColors.primary
                        : SocelleColors.cardBackground,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isSelected
                          ? SocelleColors.primary
                          : SocelleColors.border,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        '$minutes',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: isSelected
                              ? Colors.white
                              : SocelleColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'min',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: isSelected
                              ? Colors.white70
                              : SocelleColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: SocelleColors.primaryLight.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  color: SocelleColors.primaryDark,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Pick your most common service length. A 90-minute gap with 60-minute appointments = 1 bookable slot.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SocelleColors.primaryDark,
                        ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
