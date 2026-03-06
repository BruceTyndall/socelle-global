import 'package:flutter/material.dart';

import '../theme/socelle_colors.dart';

/// Animated progress bar using the glamHeroGradient fill.
///
/// [value] must be 0.0–1.0.
/// Animates smoothly when value changes.
class SfProgressBar extends StatelessWidget {
  const SfProgressBar({
    required this.value,
    this.height = 6,
    this.backgroundColor,
    super.key,
  });

  /// Progress value 0.0–1.0.
  final double value;
  final double height;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    final clamped = value.clamp(0.0, 1.0);
    return Semantics(
      value: '${(clamped * 100).round()}%',
      child: LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          return Stack(
            children: [
              Container(
                height: height,
                width: width,
                decoration: BoxDecoration(
                  color: backgroundColor ?? const Color(0xFFF0EDE9),
                  borderRadius: BorderRadius.circular(height / 2),
                ),
              ),
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                height: height,
                width: width * clamped,
                decoration: BoxDecoration(
                  gradient: clamped > 0 ? SocelleColors.glamHeroGradient : null,
                  borderRadius: BorderRadius.circular(height / 2),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
