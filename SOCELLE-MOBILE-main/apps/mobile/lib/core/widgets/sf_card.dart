import 'package:flutter/material.dart';

import '../theme/socelle_colors.dart';

/// Standard Socelle card surface.
///
/// White background, 16px border radius, subtle drop shadow, optional tap.
/// For the gradient dark variant, use [SfHeroCard].
///
/// Example:
/// ```dart
/// SfCard(
///   child: Text('Hello'),
///   onTap: () {},
/// )
/// ```
class SfCard extends StatelessWidget {
  const SfCard({
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.margin,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        color: SocelleColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x14000000), // black @ 8%
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: padding,
            child: child,
          ),
        ),
      ),
    );
  }
}

/// Gradient hero card — dark plum-to-gold background, light text.
///
/// Used for: leakage hero, campaign cards, paywall hero section.
class SfHeroCard extends StatelessWidget {
  const SfHeroCard({
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.onTap,
    this.margin,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        gradient: SocelleColors.glamHeroGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: SocelleColors.glamPlum.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          splashColor: Colors.white.withValues(alpha: 0.1),
          child: Padding(
            padding: padding,
            child: child,
          ),
        ),
      ),
    );
  }
}
