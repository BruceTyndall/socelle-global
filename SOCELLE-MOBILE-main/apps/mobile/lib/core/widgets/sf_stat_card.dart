import 'package:flutter/material.dart';

import '../theme/socelle_colors.dart';

/// Socelle stat card — icon + value + label in a white rounded container.
///
/// Used in: Shop stats row, Studio stats row, Weekly Summary.
///
/// Example:
/// ```dart
/// SfStatCard(
///   icon: Icons.attach_money_rounded,
///   value: '\$1,240',
///   label: 'This month',
/// )
/// ```
class SfStatCard extends StatelessWidget {
  const SfStatCard({
    required this.icon,
    required this.value,
    required this.label,
    this.iconColor,
    this.valueColor,
    this.onTap,
    super.key,
  });

  final IconData icon;
  final String value;
  final String label;
  final Color? iconColor;
  final Color? valueColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: SocelleColors.pureWhite,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0F000000),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              icon,
              size: 20,
              color: iconColor ?? SocelleColors.glamPlum,
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: valueColor ?? const Color(0xFF1A1A1A),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: Color(0xFF9E9E9E),
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A horizontal row of [SfStatCard]s with equal flex distribution.
class SfStatRow extends StatelessWidget {
  const SfStatRow({required this.stats, super.key});

  final List<SfStatCard> stats;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (int i = 0; i < stats.length; i++) ...[
          Expanded(child: stats[i]),
          if (i < stats.length - 1) const SizedBox(width: 8),
        ],
      ],
    );
  }
}
