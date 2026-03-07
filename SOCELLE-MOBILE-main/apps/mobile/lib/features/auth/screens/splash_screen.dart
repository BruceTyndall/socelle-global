import 'package:flutter/material.dart';

import '../../../core/theme/socelle_theme.dart';

/// Splash screen shown during app initialization.
///
/// Displays the SOCELLE wordmark and a subtle loading indicator
/// on the Pearl Mineral V2 background.
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'SOCELLE',
              style: SocelleTheme.displayMedium.copyWith(
                letterSpacing: 4.0,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: SocelleTheme.spacingSm),
            Text(
              'Professional Beauty Intelligence',
              style: SocelleTheme.bodyMedium.copyWith(
                color: SocelleTheme.accent,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: SocelleTheme.spacingXl),
            SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: SocelleTheme.accent,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
