import 'package:flutter/material.dart';

/// SOCELLE Pearl Mineral V2 Design System
///
/// All color, typography, radius, and shadow tokens for the mobile app.
/// Mirrors the web design system defined in tailwind.config.js.
/// No hardcoded hex values anywhere else — use SocelleTheme constants.
class SocelleTheme {
  SocelleTheme._();

  // ─── COLORS ──────────────────────────────────────────────────────────────────

  static const graphite = Color(0xFF141418);
  static const mnBg = Color(0xFFF6F3EF);
  static const mnDark = Color(0xFF1F2428);
  static const accent = Color(0xFF6E879B);
  static const warmIvory = Color(0xFFF7F5F2);
  static const signalUp = Color(0xFF22C55E);
  static const signalDown = Color(0xFFEF4444);
  static const signalWarn = Color(0xFFF59E0B);
  static const pearlWhite = Color(0xFFFFFFFF);

  // Extended palette
  static const borderLight = Color(0xFFE5E1DB);
  static const borderMedium = Color(0xFFD4CFC8);
  static const textMuted = Color(0xFF6B7280);
  static const textFaint = Color(0xFF9CA3AF);
  static const surfaceElevated = Color(0xFFFFFFFF);
  static const overlayDark = Color(0x8A141418);
  static const accentLight = Color(0xFFE8EDF1);
  static const demoBadgeBg = Color(0xFFFEF3C7);
  static const demoBadgeText = Color(0xFF92400E);

  // ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────

  static const String fontFamily = 'GeneralSans';

  static const TextStyle displayLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 48,
    fontWeight: FontWeight.w600,
    color: graphite,
    height: 1.0,
    letterSpacing: -1.5,
  );

  static const TextStyle displayMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 36,
    fontWeight: FontWeight.w600,
    color: graphite,
    height: 1.1,
    letterSpacing: -1.0,
  );

  static const TextStyle headlineLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 28,
    fontWeight: FontWeight.w600,
    color: graphite,
    height: 1.2,
    letterSpacing: -0.5,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: graphite,
    height: 1.2,
    letterSpacing: -0.3,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: graphite,
    height: 1.2,
    letterSpacing: -0.2,
  );

  static const TextStyle titleLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: graphite,
  );

  static const TextStyle titleMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: graphite,
  );

  static const TextStyle titleSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: graphite,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: graphite,
    height: 1.5,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: textMuted,
    height: 1.5,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: textFaint,
    height: 1.4,
  );

  static const TextStyle labelLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: graphite,
  );

  static const TextStyle labelMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: textMuted,
    letterSpacing: 0.3,
  );

  static const TextStyle labelSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 11,
    fontWeight: FontWeight.w500,
    color: textFaint,
    letterSpacing: 0.5,
  );

  // ─── BORDER RADIUS ───────────────────────────────────────────────────────────

  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 20.0;
  static const double radiusPill = 9999.0;

  static final BorderRadius borderRadiusSm = BorderRadius.circular(radiusSm);
  static final BorderRadius borderRadiusMd = BorderRadius.circular(radiusMd);
  static final BorderRadius borderRadiusLg = BorderRadius.circular(radiusLg);
  static final BorderRadius borderRadiusXl = BorderRadius.circular(radiusXl);
  static final BorderRadius borderRadiusPill = BorderRadius.circular(radiusPill);

  // ─── SHADOWS (matching web's 9 shadow tokens) ────────────────────────────────

  static const List<BoxShadow> shadowXs = [
    BoxShadow(color: Color(0x08000000), blurRadius: 2, offset: Offset(0, 1)),
  ];

  static const List<BoxShadow> shadowSm = [
    BoxShadow(color: Color(0x0D000000), blurRadius: 4, offset: Offset(0, 1)),
    BoxShadow(color: Color(0x08000000), blurRadius: 2, offset: Offset(0, 1)),
  ];

  static const List<BoxShadow> shadowMd = [
    BoxShadow(color: Color(0x0D000000), blurRadius: 8, offset: Offset(0, 4)),
    BoxShadow(color: Color(0x08000000), blurRadius: 4, offset: Offset(0, 2)),
  ];

  static const List<BoxShadow> shadowLg = [
    BoxShadow(color: Color(0x0D000000), blurRadius: 16, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x08000000), blurRadius: 6, offset: Offset(0, 4)),
  ];

  static const List<BoxShadow> shadowXl = [
    BoxShadow(color: Color(0x14000000), blurRadius: 24, offset: Offset(0, 12)),
    BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 4)),
  ];

  static const List<BoxShadow> shadow2xl = [
    BoxShadow(color: Color(0x1A000000), blurRadius: 32, offset: Offset(0, 16)),
  ];

  static const List<BoxShadow> shadowGlass = [
    BoxShadow(color: Color(0x0D000000), blurRadius: 12, offset: Offset(0, 4)),
    BoxShadow(color: Color(0x05FFFFFF), blurRadius: 1, offset: Offset(0, -1)),
  ];

  static const List<BoxShadow> shadowInner = [
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 4,
      offset: Offset(0, 2),
      blurStyle: BlurStyle.inner,
    ),
  ];

  static const List<BoxShadow> shadowGlow = [
    BoxShadow(color: Color(0x1A6E879B), blurRadius: 20, spreadRadius: 2),
  ];

  // ─── SPACING ─────────────────────────────────────────────────────────────────

  static const double spacingXs = 4.0;
  static const double spacingSm = 8.0;
  static const double spacingMd = 16.0;
  static const double spacingLg = 24.0;
  static const double spacingXl = 32.0;
  static const double spacing2xl = 48.0;
  static const double spacing3xl = 64.0;

  // ─── THEME DATA ──────────────────────────────────────────────────────────────

  static ThemeData get light {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: graphite,
      primary: graphite,
      onPrimary: pearlWhite,
      secondary: accent,
      onSecondary: pearlWhite,
      error: signalDown,
      surface: mnBg,
      onSurface: graphite,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: mnBg,
      fontFamily: fontFamily,
      splashFactory: InkSplash.splashFactory,
      splashColor: graphite.withValues(alpha: 0.06),
      highlightColor: Colors.transparent,

      appBarTheme: const AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: graphite,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: fontFamily,
          fontSize: 17,
          fontWeight: FontWeight.w600,
          color: graphite,
        ),
      ),

      cardTheme: CardThemeData(
        elevation: 0,
        color: surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: borderRadiusMd,
          side: const BorderSide(color: borderLight, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: graphite,
          foregroundColor: pearlWhite,
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(
            borderRadius: borderRadiusMd,
          ),
          elevation: 0,
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: graphite,
          foregroundColor: pearlWhite,
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(
            borderRadius: borderRadiusMd,
          ),
          elevation: 0,
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: graphite,
          minimumSize: const Size(0, 52),
          shape: RoundedRectangleBorder(
            borderRadius: borderRadiusMd,
          ),
          side: const BorderSide(color: borderLight, width: 1),
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: accent,
          textStyle: const TextStyle(
            fontFamily: fontFamily,
            fontSize: 15,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceElevated,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: borderRadiusMd,
          borderSide: const BorderSide(color: borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: borderRadiusMd,
          borderSide: const BorderSide(color: borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: borderRadiusMd,
          borderSide: const BorderSide(color: accent, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: borderRadiusMd,
          borderSide: const BorderSide(color: signalDown),
        ),
        hintStyle: bodyMedium.copyWith(color: textFaint),
        labelStyle: bodyMedium,
      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: mnBg,
        selectedItemColor: graphite,
        unselectedItemColor: textFaint,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: TextStyle(
          fontFamily: fontFamily,
          fontWeight: FontWeight.w600,
          fontSize: 11,
        ),
        unselectedLabelStyle: TextStyle(
          fontFamily: fontFamily,
          fontWeight: FontWeight.w400,
          fontSize: 11,
        ),
      ),

      dividerTheme: const DividerThemeData(
        color: borderLight,
        thickness: 1,
        space: 0,
      ),

      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: borderRadiusMd),
        backgroundColor: graphite,
        contentTextStyle: const TextStyle(
          fontFamily: fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: pearlWhite,
        ),
      ),

      chipTheme: ChipThemeData(
        backgroundColor: accentLight,
        labelStyle: labelMedium.copyWith(color: graphite),
        shape: RoundedRectangleBorder(borderRadius: borderRadiusPill),
        side: BorderSide.none,
      ),

      tabBarTheme: TabBarThemeData(
        labelColor: graphite,
        unselectedLabelColor: textMuted,
        indicatorColor: graphite,
        labelStyle: const TextStyle(
          fontFamily: fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontFamily: fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w400,
        ),
      ),

      textTheme: const TextTheme(
        displayLarge: SocelleTheme.displayLarge,
        displayMedium: SocelleTheme.displayMedium,
        headlineLarge: SocelleTheme.headlineLarge,
        headlineMedium: SocelleTheme.headlineMedium,
        headlineSmall: SocelleTheme.headlineSmall,
        titleLarge: SocelleTheme.titleLarge,
        titleMedium: SocelleTheme.titleMedium,
        titleSmall: SocelleTheme.titleSmall,
        bodyLarge: SocelleTheme.bodyLarge,
        bodyMedium: SocelleTheme.bodyMedium,
        bodySmall: SocelleTheme.bodySmall,
        labelLarge: SocelleTheme.labelLarge,
        labelMedium: SocelleTheme.labelMedium,
        labelSmall: SocelleTheme.labelSmall,
      ),
    );
  }
}
