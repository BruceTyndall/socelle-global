import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/slotforce_colors.dart';

class RecoveredBadge extends StatelessWidget {
  const RecoveredBadge({
    super.key,
    required this.recoveredTotal,
    this.subscriptionCost,
  });

  final double recoveredTotal;
  final double? subscriptionCost;

  @override
  Widget build(BuildContext context) {
    if (recoveredTotal <= 0) return const SizedBox.shrink();

    final currencyFormat = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 0,
    );

    final roi = subscriptionCost != null && subscriptionCost! > 0
        ? recoveredTotal / subscriptionCost!
        : null;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SlotforceColors.recoveredGreenLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: SlotforceColors.recoveredGreen.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: SlotforceColors.recoveredGreen.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.trending_up_rounded,
              color: SlotforceColors.recoveredGreen,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Recovered: ',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: SlotforceColors.recoveredGreenDark,
                          ),
                    ),
                    Text(
                      currencyFormat.format(recoveredTotal),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: SlotforceColors.recoveredGreenDark,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ],
                ),
                if (roi != null && roi >= 1.0)
                  Text(
                    'ROI: ${roi.toStringAsFixed(1)}x your subscription',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SlotforceColors.recoveredGreenDark.withValues(alpha: 0.7),
                        ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
