import 'package:flutter/material.dart';

import '../theme/socelle_theme.dart';

/// A styled error state widget for SOCELLE screens.
///
/// Shows an icon, message, and optional retry button.
class SocelleErrorWidget extends StatelessWidget {
  const SocelleErrorWidget({
    super.key,
    required this.message,
    this.onRetry,
    this.icon,
  });

  /// The error message to display.
  final String message;

  /// Optional retry callback. If provided, shows a "Try Again" button.
  final VoidCallback? onRetry;

  /// Custom icon. Defaults to error_outline.
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(SocelleTheme.spacingLg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon ?? Icons.error_outline_rounded,
              size: 48,
              color: SocelleTheme.signalDown,
            ),
            const SizedBox(height: SocelleTheme.spacingMd),
            Text(
              message,
              style: SocelleTheme.bodyLarge.copyWith(color: SocelleTheme.graphite),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: SocelleTheme.spacingLg),
              OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Try Again'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
