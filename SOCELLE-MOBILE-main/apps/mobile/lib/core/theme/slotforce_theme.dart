import 'package:flutter/material.dart';
import 'slotforce_colors.dart';

/// SLOTFORCE Theme — Goop × Chanel Edition
///
/// Design principles:
/// • Warmth first: every surface is ivory, not cold white
/// • Gold not green: accent interactions use champagne gold
/// • Ink not navy: primary actions use deep editorial black
/// • Generous space: rounded corners, breathing room
/// • Refined urgency: terracotta replaces alarm-red
class SlotforceTheme {
  SlotforceTheme._();

  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: SlotforceColors.primary,
      primary: SlotforceColors.primary,
      onPrimary: Colors.white,
      secondary: SlotforceColors.accentGold,
      onSecondary: Colors.white,
      error: SlotforceColors.leakageRed,
      surface: SlotforceColors.surfaceSoft,
      onSurface: SlotforceColors.textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: SlotforceColors.surfaceSoft,
      textTheme: _textTheme,
      fontFamily: 'Avenir',
      splashFactory: InkSparkle.splashFactory,
      splashColor: SlotforceColors.accentGoldLight.withValues(alpha: 0.3),
      highlightColor: Colors.transparent,

      // ── AppBar ────────────────────────────────────────────────────────
      appBarTheme: const AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: SlotforceColors.textPrimary,
        titleTextStyle: TextStyle(
          fontFamily: 'Avenir Next',
          fontSize: 17,
          fontWeight: FontWeight.w800,
          color: SlotforceColors.textPrimary,
          letterSpacing: 0.6,
        ),
      ),

      // ── Cards ─────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        elevation: 0,
        color: SlotforceColors.cardBackground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: SlotforceColors.divider, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      // ── Filled Button — editorial ink with crisp white text ───────────
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: SlotforceColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(0, 54),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          elevation: 0,
          textStyle: const TextStyle(
            fontFamily: 'Avenir Next',
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
          ),
        ),
      ),

      // ── Outlined Button — ink border, ink text ────────────────────────
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: SlotforceColors.primary,
          minimumSize: const Size(0, 50),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          side: const BorderSide(
              color: SlotforceColors.primary, width: 1.2),
          textStyle: const TextStyle(
            fontFamily: 'Avenir Next',
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.1,
          ),
        ),
      ),

      // ── Text Button ───────────────────────────────────────────────────
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: SlotforceColors.textSecondary,
          textStyle: const TextStyle(
            fontFamily: 'Avenir Next',
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ── Bottom Nav — warm with gold selected state ────────────────────
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: SlotforceColors.surfaceSoft,
        selectedItemColor: SlotforceColors.primary,
        unselectedItemColor: SlotforceColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(
          fontFamily: 'Avenir Next',
          fontWeight: FontWeight.w700,
          fontSize: 11,
          letterSpacing: 0.2,
        ),
        unselectedLabelStyle: TextStyle(
          fontFamily: 'Avenir',
          fontWeight: FontWeight.w400,
          fontSize: 11,
        ),
      ),

      // ── Divider ───────────────────────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: SlotforceColors.divider,
        thickness: 1,
        space: 0,
      ),

      // ── Chips ─────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        backgroundColor: SlotforceColors.surface,
        selectedColor: SlotforceColors.primary,
        labelStyle: const TextStyle(
          fontFamily: 'Avenir Next',
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: SlotforceColors.border),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      ),

      // ── Snack Bar — warm ink, not cold navy ───────────────────────────
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
        backgroundColor: SlotforceColors.primary,
        contentTextStyle: const TextStyle(
          fontFamily: 'Avenir Next',
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),

      // ── Input ─────────────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: SlotforceColors.cardBackground,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SlotforceColors.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide:
              const BorderSide(color: SlotforceColors.primary, width: 1.4),
        ),
        hintStyle: const TextStyle(
          fontFamily: 'Avenir',
          color: SlotforceColors.textMuted,
          fontSize: 15,
        ),
      ),

      // ── Switch ────────────────────────────────────────────────────────
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected)
                ? SlotforceColors.primary
                : SlotforceColors.textMuted),
        trackColor: WidgetStateProperty.resolveWith((states) =>
            states.contains(WidgetState.selected)
                ? SlotforceColors.primaryLight
                : SlotforceColors.divider),
      ),
    );
  }

  static const _textTheme = TextTheme(
    // ── Dollar figures — warm terracotta (urgent but refined) ──────────
    displayLarge: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 52,
      fontWeight: FontWeight.w900,
      color: SlotforceColors.leakageRed,
      height: 1.0,
      letterSpacing: -1.6,
    ),
    // Leakage reveal hero
    displayMedium: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 60,
      fontWeight: FontWeight.w900,
      color: SlotforceColors.leakageRed,
      height: 1.0,
      letterSpacing: -2.2,
    ),
    // Recovered counter — sage green
    headlineLarge: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 34,
      fontWeight: FontWeight.w800,
      color: SlotforceColors.recoveredGreen,
      height: 1.1,
      letterSpacing: -0.5,
    ),
    // Section headers — editorial weight
    headlineMedium: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 26,
      fontWeight: FontWeight.w800,
      color: SlotforceColors.textPrimary,
      height: 1.15,
      letterSpacing: -0.4,
    ),
    headlineSmall: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 21,
      fontWeight: FontWeight.w700,
      color: SlotforceColors.textPrimary,
      height: 1.2,
      letterSpacing: -0.2,
    ),
    // Card titles
    titleMedium: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 16,
      fontWeight: FontWeight.w700,
      color: SlotforceColors.textPrimary,
      letterSpacing: 0.0,
    ),
    titleSmall: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 14,
      fontWeight: FontWeight.w700,
      color: SlotforceColors.textPrimary,
    ),
    // Body
    bodyLarge: TextStyle(
      fontFamily: 'Avenir',
      fontSize: 16,
      fontWeight: FontWeight.w400,
      color: SlotforceColors.textPrimary,
      height: 1.5,
    ),
    bodyMedium: TextStyle(
      fontFamily: 'Avenir',
      fontSize: 14,
      fontWeight: FontWeight.w400,
      color: SlotforceColors.textSecondary,
      height: 1.5,
    ),
    bodySmall: TextStyle(
      fontFamily: 'Avenir',
      fontSize: 12,
      fontWeight: FontWeight.w400,
      color: SlotforceColors.textMuted,
      height: 1.4,
    ),
    // Labels
    labelLarge: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 14,
      fontWeight: FontWeight.w700,
      color: SlotforceColors.primary,
      letterSpacing: 0.2,
    ),
    labelMedium: TextStyle(
      fontFamily: 'Avenir',
      fontSize: 12,
      fontWeight: FontWeight.w500,
      color: SlotforceColors.textSecondary,
    ),
    labelSmall: TextStyle(
      fontFamily: 'Avenir Next',
      fontSize: 10,
      fontWeight: FontWeight.w700,
      color: SlotforceColors.textMuted,
      letterSpacing: 0.8,
    ),
  );
}
