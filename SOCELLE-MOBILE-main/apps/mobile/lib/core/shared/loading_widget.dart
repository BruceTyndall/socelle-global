import 'package:flutter/material.dart';

import '../theme/socelle_theme.dart';

/// A centered loading indicator styled with SOCELLE Pearl Mineral V2 tokens.
///
/// Use this as the default loading state for all screens.
class SocelleLoadingWidget extends StatelessWidget {
  const SocelleLoadingWidget({
    super.key,
    this.message,
    this.compact = false,
  });

  /// Optional message to display below the spinner.
  final String? message;

  /// If true, shows a smaller inline spinner without centering.
  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: SocelleTheme.accent,
            ),
          ),
          if (message != null) ...[
            const SizedBox(width: SocelleTheme.spacingSm),
            Text(message!, style: SocelleTheme.bodySmall),
          ],
        ],
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(SocelleTheme.spacingLg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: SocelleTheme.accent,
              ),
            ),
            if (message != null) ...[
              const SizedBox(height: SocelleTheme.spacingMd),
              Text(
                message!,
                style: SocelleTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
