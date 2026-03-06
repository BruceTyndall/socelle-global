import 'package:flutter/material.dart';

import '../../../core/theme/socelle_colors.dart';

class TrialBadge extends StatelessWidget {
  const TrialBadge({super.key, required this.daysLeft});

  final int daysLeft;

  Color get _color {
    if (daysLeft <= 1) return SocelleColors.trialRed;
    if (daysLeft <= 3) return SocelleColors.trialAmber;
    return SocelleColors.textSecondary;
  }

  String get _text {
    if (daysLeft <= 0) return 'Trial ended';
    if (daysLeft == 1) return 'Last day!';
    return 'Trial: ${daysLeft}d left';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: daysLeft <= 1
            ? Border.all(color: _color.withValues(alpha: 0.3))
            : null,
      ),
      child: Text(
        _text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: _color,
        ),
      ),
    );
  }
}
