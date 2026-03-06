import 'package:flutter/material.dart';

import '../theme/socelle_colors.dart';
import 'sf_button.dart';

/// Socelle standard empty state widget.
///
/// Shows an icon, title, body text, and an optional CTA button.
/// Used for: no calendar connected, no gaps found, no messages, etc.
///
/// Example:
/// ```dart
/// SfEmptyState(
///   icon: Icons.calendar_today_outlined,
///   title: 'Connect your calendar',
///   body: 'We\'ll find the gaps and show you the money you\'re leaving behind.',
///   action: SfEmptyStateAction(
///     label: 'Connect calendar',
///     onPressed: () => ...,
///   ),
/// )
/// ```
class SfEmptyState extends StatelessWidget {
  const SfEmptyState({
    required this.icon,
    required this.title,
    required this.body,
    this.action,
    this.iconColor,
    this.iconSize = 72,
    super.key,
  });

  final IconData icon;
  final String title;
  final String body;
  final SfEmptyStateAction? action;
  final Color? iconColor;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: iconSize,
            color: (iconColor ?? SocelleColors.glamPlum).withValues(alpha: 0.6),
          ),
          const SizedBox(height: 24),
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1A1A1A),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            body,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF6B6B6B),
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          if (action != null) ...[
            const SizedBox(height: 32),
            SfButton.primary(
              label: action!.label,
              onPressed: action!.onPressed,
              icon: action!.icon,
            ),
          ],
        ],
      ),
    );
  }
}

class SfEmptyStateAction {
  const SfEmptyStateAction({
    required this.label,
    required this.onPressed,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
}
