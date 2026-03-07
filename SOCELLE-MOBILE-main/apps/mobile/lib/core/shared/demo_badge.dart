import 'package:flutter/material.dart';

import '../theme/socelle_theme.dart';

/// A DEMO / PREVIEW badge for surfaces showing non-live data.
///
/// Per SOCELLE governance: any surface showing hardcoded, mocked,
/// or seeded data must display a visible DEMO or PREVIEW badge.
class DemoBadge extends StatelessWidget {
  const DemoBadge({
    super.key,
    this.label = 'DEMO',
    this.compact = false,
  });

  /// Badge label text. Defaults to "DEMO".
  final String label;

  /// If true, shows a smaller inline badge.
  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: SocelleTheme.demoBadgeBg,
          borderRadius: SocelleTheme.borderRadiusPill,
        ),
        child: Text(
          label,
          style: SocelleTheme.labelSmall.copyWith(
            color: SocelleTheme.demoBadgeText,
            fontWeight: FontWeight.w600,
            fontSize: 9,
            letterSpacing: 0.8,
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: SocelleTheme.demoBadgeBg,
        borderRadius: SocelleTheme.borderRadiusPill,
        border: Border.all(
          color: SocelleTheme.demoBadgeText.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.science_outlined,
            size: 12,
            color: SocelleTheme.demoBadgeText,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: SocelleTheme.labelSmall.copyWith(
              color: SocelleTheme.demoBadgeText,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.8,
            ),
          ),
        ],
      ),
    );
  }
}
