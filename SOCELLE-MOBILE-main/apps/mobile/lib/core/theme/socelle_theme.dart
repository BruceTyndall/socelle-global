import 'package:flutter/material.dart';
import 'socelle_colors.dart';

/// Socelle Mobile Theme — Revenue Intelligence OS
///
/// Inter font throughout. Editorial, calm, financial, minimal.
/// No decorative weights. No playful elements.
class SocelleTheme {
  SocelleTheme._();

  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: SocelleColors.ink,
      primary: SocelleColors.ink,
      onPrimary: SocelleColors.background,
      secondary: SocelleColors.accent,
      onSecondary: Colors.white,
      error: SocelleColors.error,
      surface: SocelleColors.background,
      onSurface: SocelleColors.ink,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: SocelleColors.background,
      fontFamily: 'Inter',
      splashFactory: InkSplash.splashFactory,
      splashColor: SocelleColors.ink.withValues(alpha: 0.06),
      highlightColor: Colors.transparent,

      appBarTheme: const AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: SocelleColors.ink,
        titleTextStyle: TextStyle(
          fontFamily: 'Inter',
          fontSize: 17,
          fontWeight: FontWeight.w600,
          color: SocelleColors.ink,
        ),
      ),

      cardTheme: CardThemeData(
        elevation: 0,
        color: SocelleColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: SocelleColors.borderLight, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: SocelleColors.ink,
          foregroundColor: SocelleColors.background,
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          elevation: 0,
          textStyle: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: SocelleColors.ink,
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          side: const BorderSide(color: SocelleColors.borderLight, width: 1),
          textStyle: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: SocelleColors.background,
        selectedItemColor: SocelleColors.ink,
        unselectedItemColor: SocelleColors.inkFaint,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(
          fontFamily: 'Inter',
          fontWeight: FontWeight.w600,
          fontSize: 11,
        ),
        unselectedLabelStyle: TextStyle(
          fontFamily: 'Inter',
          fontWeight: FontWeight.w400,
          fontSize: 11,
        ),
      ),

      dividerTheme: const DividerThemeData(
        color: SocelleColors.borderLight,
        thickness: 1,
        space: 0,
      ),

      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        backgroundColor: SocelleColors.ink,
        contentTextStyle: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
      ),

      textTheme: _textTheme,
    );
  }

  static const _textTheme = TextTheme(
    // Revenue hero number: 48pt SemiBold
    displayLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 48,
      fontWeight: FontWeight.w600,
      color: SocelleColors.ink,
      height: 1.0,
      letterSpacing: -1.5,
    ),
    // Section header: 20pt
    headlineSmall: TextStyle(
      fontFamily: 'Inter',
      fontSize: 20,
      fontWeight: FontWeight.w600,
      color: SocelleColors.ink,
      height: 1.2,
      letterSpacing: -0.2,
    ),
    // Card titles: 16pt
    titleMedium: TextStyle(
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: FontWeight.w600,
      color: SocelleColors.ink,
    ),
    // Body: 15pt
    bodyLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 15,
      fontWeight: FontWeight.w400,
      color: SocelleColors.ink,
      height: 1.5,
    ),
    // Body secondary: 14pt
    bodyMedium: TextStyle(
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: SocelleColors.inkMuted,
      height: 1.5,
    ),
    // Small: 12pt
    bodySmall: TextStyle(
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: SocelleColors.inkFaint,
      height: 1.4,
    ),
    // Section label: 13pt Medium, title case with letter spacing
    labelMedium: TextStyle(
      fontFamily: 'Inter',
      fontSize: 13,
      fontWeight: FontWeight.w500,
      color: SocelleColors.inkMuted,
      letterSpacing: 0.3,
    ),
    // Button label
    labelLarge: TextStyle(
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: FontWeight.w600,
      color: SocelleColors.ink,
    ),
  );
}
