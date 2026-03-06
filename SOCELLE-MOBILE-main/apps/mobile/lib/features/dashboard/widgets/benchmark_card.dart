import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/constants.dart';
import '../../../core/theme/slotforce_colors.dart';

class BenchmarkCard extends StatelessWidget {
  const BenchmarkCard({
    super.key,
    required this.userMonthlyLeakage,
  });

  final double userMonthlyLeakage;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    const benchmark = SocelleConstants.avgMonthlyLeakageStylist;

    // Calculate percentile (simplified)
    final percentile = userMonthlyLeakage < benchmark
        ? ((1 - userMonthlyLeakage / benchmark) * 100).round()
        : 0;

    final isBetter = userMonthlyLeakage < benchmark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withValues(alpha: 0.95),
            SlotforceColors.glamCardGradient.last,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: SlotforceColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: const Icon(
                  Icons.people_outline_rounded,
                  color: SlotforceColors.primaryDark,
                  size: 18,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Baddie Budget Benchmark',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: SlotforceColors.primaryDark,
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          RichText(
            text: TextSpan(
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: SlotforceColors.glamInk,
                    fontWeight: FontWeight.w500,
                  ),
              children: [
                const TextSpan(text: 'Most stylists leak about '),
                TextSpan(
                  text: '${currency.format(benchmark)}/month',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const TextSpan(text: '. '),
                if (isBetter) ...[
                  TextSpan(
                    text:
                        "You're at ${currency.format(userMonthlyLeakage)}. That's broke-but-booked energy, better than $percentile% of stylists.",
                    style: const TextStyle(
                      color: SlotforceColors.recoveredGreen,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ] else ...[
                  TextSpan(
                    text:
                        "You're at ${currency.format(userMonthlyLeakage)}. Let's make those empty hours look expensive.",
                    style: const TextStyle(
                      color: SlotforceColors.leakageRed,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
