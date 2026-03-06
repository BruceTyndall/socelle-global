// =============================================================================
// SOCELLE ZERO — Flutter Theme System
// Version: 1.0.0  |  March 2026
// =============================================================================
//
// USAGE
//   MaterialApp(
//     theme: SocelleTheme.light,
//     darkTheme: SocelleTheme.dark,
//     themeMode: ThemeMode.light,
//   )
//
// ACCESS CUSTOM TOKENS
//   final ext = Theme.of(context).extension<SocelleThemeExtension>()!;
//   Container(color: ext.glass70)
//
// PHILOSOPHY — NEUTRAL STAGE
//   SOCELLE is the gallery wall. Brands are the art.
//   The UI chrome is achromatic. Color appears only in:
//     1. Brand content / imagery
//     2. Data signal badges (up / warn / down)
//   Never apply decorative color to chrome, nav, or layout surfaces.
//
// =============================================================================

import 'dart:ui';
import 'package:flutter/material.dart';

// =============================================================================
// SECTION 1: RAW TOKENS
// Single source of truth. Same values as --var in index.css and tailwind.config.js
// =============================================================================

abstract class SocelleTokens {
  // --- Core Palette -----------------------------------------------------------
  /// Near-pure black with 0.5% warmth. Used for all text, borders, icons.
  static const Color ink = Color(0xFF0D0D0C);
  static const Color inkAlpha80 = Color(0xCC0D0D0C);  // 80% opacity
  static const Color inkAlpha52 = Color(0x850D0D0C);  // 52% opacity
  static const Color inkAlpha32 = Color(0x520D0D0C);  // 32% opacity
  static const Color inkAlpha12 = Color(0x1F0D0D0C);  // 12% opacity
  static const Color inkAlpha06 = Color(0x0F0D0D0C);  // 6%  opacity

  /// Near-white with 0.8% warm. Primary page background.
  static const Color parchment = Color(0xFFF8F8F6);

  /// Subtle alternate surface. Section backgrounds, input fills.
  static const Color parchmentAlt = Color(0xFFF2F2F0);

  /// Near-black. Used for the ONE dark panel per page (hero, metrics bar).
  static const Color void_ = Color(0xFF111112);

  /// Frosted surface on dark background (7% white).
  static const Color voidSurface = Color(0x12FFFFFF);  // rgba(255,255,255,0.07)

  /// Frosted border on dark background (10% white).
  static const Color voidBorder = Color(0x1AFFFFFF);   // rgba(255,255,255,0.10)

  // --- Chrome (UI Accent, NEVER decorative) ----------------------------------
  /// Mid-slate. Applied ONLY to interactive UI chrome: active tab indicators,
  /// focused borders, selected state rings. Never backgrounds. Never icons.
  static const Color chrome = Color(0xFF4A5568);
  static const Color chromeHover = Color(0xFF374151);
  static const Color chromeTint = Color(0x1A4A5568);   // 10% opacity

  // --- Glass Surfaces --------------------------------------------------------
  static const Color glass70 = Color(0xB3FFFFFF);      // rgba(255,255,255,0.70)
  static const Color glass50 = Color(0x80FFFFFF);      // rgba(255,255,255,0.50)
  static const Color glassTagDark = Color(0x26FFFFFF); // rgba(255,255,255,0.15) — on void
  static const Color glassBorder = Color(0xCCFFFFFF);  // rgba(255,255,255,0.80)
  static const Color glassBorderInk = Color(0x170D0D0C); // rgba(13,13,12,0.09)

  // --- Signal Colors (DATA CONTEXT ONLY) ------------------------------------
  /// Growth / positive trend. Use ONLY in data badges, not UI chrome.
  static const Color signalUp = Color(0xFF15803D);
  static const Color signalUpBg = Color(0x1A15803D);   // 10% opacity

  /// Watch / caution trend. Use ONLY in data badges.
  static const Color signalWarn = Color(0xFFB45309);
  static const Color signalWarnBg = Color(0x1AB45309);

  /// Decline / negative trend. Use ONLY in data badges.
  static const Color signalDown = Color(0xFFB91C1C);
  static const Color signalDownBg = Color(0x1AB91C1C);

  // --- White (card surfaces) -------------------------------------------------
  static const Color cardSurface = Color(0xFFFFFFFF);

  // ==========================================================================
  // GEOMETRY — Border Radii
  // ==========================================================================

  /// Floating nav pill, large frosted panels.
  static const double radiusPanel = 40.0;

  /// Standard card radius. Cards, modal sheets.
  static const double radiusCard = 28.0;

  /// Filter pills, frosted tags.
  static const double radiusTag = 20.0;

  /// Fully pill-shaped: buttons, segmented controls.
  static const double radiusPill = 9999.0;

  /// Circle: icon buttons, avatar containers.
  static const double radiusCircle = 9999.0; // Use with BoxShape.circle

  // Convenience BorderRadius objects
  static final BorderRadius brPanel = BorderRadius.circular(radiusPanel);
  static final BorderRadius brCard  = BorderRadius.circular(radiusCard);
  static final BorderRadius brTag   = BorderRadius.circular(radiusTag);
  static final BorderRadius brPill  = BorderRadius.circular(radiusPill);

  // ==========================================================================
  // ELEVATION / BLUR
  // ==========================================================================

  /// Standard glass blur for nav, panels, cards.
  static const double blurPanel = 24.0;

  /// Lighter blur for tags and small glass chips.
  static const double blurTag = 12.0;

  // ==========================================================================
  // SPACING SCALE (4pt grid)
  // ==========================================================================
  static const double space2  = 2.0;
  static const double space4  = 4.0;
  static const double space6  = 6.0;
  static const double space8  = 8.0;
  static const double space12 = 12.0;
  static const double space16 = 16.0;
  static const double space20 = 20.0;
  static const double space24 = 24.0;
  static const double space32 = 32.0;
  static const double space40 = 40.0;
  static const double space48 = 48.0;
  static const double space64 = 64.0;

  // ==========================================================================
  // MOTION
  // ==========================================================================
  static const Duration durFast     = Duration(milliseconds: 150);
  static const Duration durStandard = Duration(milliseconds: 300);
  static const Duration durCinematic = Duration(milliseconds: 600);

  static const Curve easeStandard  = Cubic(0.4, 0.0, 0.2, 1.0);
  static const Curve easeCinematic = Cubic(0.75, 0.0, 0.25, 1.0);
  static const Curve easeEmphasized = Cubic(0.2, 0.0, 0.0, 1.0);

  // ==========================================================================
  // TYPE SCALE — General Sans
  // Font loading: Add 'general_sans' to pubspec.yaml fonts section
  // Download from: https://www.fontshare.com/fonts/general-sans
  // ==========================================================================
  static const String fontMain = 'GeneralSans';
  static const String fontData = 'JetBrainsMono'; // Monospace for data values only

  // Display
  static const TextStyle typeDisplay = TextStyle(
    fontFamily: fontMain,
    fontSize: 48.0,
    fontWeight: FontWeight.w600,
    letterSpacing: -1.5,
    height: 1.1,
    color: ink,
  );

  // Hero / Large heading
  static const TextStyle typeHero = TextStyle(
    fontFamily: fontMain,
    fontSize: 36.0,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.8,
    height: 1.15,
    color: ink,
  );

  // H1
  static const TextStyle typeH1 = TextStyle(
    fontFamily: fontMain,
    fontSize: 28.0,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.5,
    height: 1.2,
    color: ink,
  );

  // H2
  static const TextStyle typeH2 = TextStyle(
    fontFamily: fontMain,
    fontSize: 22.0,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.3,
    height: 1.25,
    color: ink,
  );

  // H3
  static const TextStyle typeH3 = TextStyle(
    fontFamily: fontMain,
    fontSize: 18.0,
    fontWeight: FontWeight.w500,
    letterSpacing: -0.1,
    height: 1.3,
    color: ink,
  );

  // Body Large
  static const TextStyle typeBodyLg = TextStyle(
    fontFamily: fontMain,
    fontSize: 16.0,
    fontWeight: FontWeight.w400,
    height: 1.65,
    color: inkAlpha80,
  );

  // Body Default
  static const TextStyle typeBody = TextStyle(
    fontFamily: fontMain,
    fontSize: 14.0,
    fontWeight: FontWeight.w400,
    height: 1.6,
    color: inkAlpha80,
  );

  // Body Small
  static const TextStyle typeBodySm = TextStyle(
    fontFamily: fontMain,
    fontSize: 13.0,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: inkAlpha52,
  );

  // Label (uppercase tracking — for tags, overlines, nav labels)
  static const TextStyle typeLabel = TextStyle(
    fontFamily: fontMain,
    fontSize: 11.0,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.8,
    height: 1.0,
    color: inkAlpha52,
  );

  // Data / Metric (JetBrains Mono)
  static const TextStyle typeData = TextStyle(
    fontFamily: fontData,
    fontSize: 14.0,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.2,
    height: 1.4,
    color: ink,
  );

  // Large Metric
  static const TextStyle typeMetric = TextStyle(
    fontFamily: fontData,
    fontSize: 28.0,
    fontWeight: FontWeight.w600,
    letterSpacing: -1.0,
    height: 1.0,
    color: ink,
  );

  // ==========================================================================
  // SHADOWS
  // ==========================================================================
  static const List<BoxShadow> shadowPanel = [
    BoxShadow(
      color: Color(0x120D0D0C),  // 7% ink
      blurRadius: 48,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: Color(0x0A0D0D0C),  // 4% ink
      blurRadius: 12,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> shadowCard = [
    BoxShadow(
      color: Color(0x0D0D0D0C),  // 5% ink
      blurRadius: 24,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x080D0D0C),  // 3% ink
      blurRadius: 8,
      offset: Offset(0, 1),
    ),
  ];

  static const List<BoxShadow> shadowCardHover = [
    BoxShadow(
      color: Color(0x170D0D0C),  // 9% ink
      blurRadius: 40,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: Color(0x0D0D0D0C),
      blurRadius: 16,
      offset: Offset(0, 2),
    ),
  ];
}

// =============================================================================
// SECTION 2: THEME EXTENSION
// Exposes SOCELLE-specific tokens via Theme.of(context).extension<>()
// =============================================================================

@immutable
class SocelleThemeExtension extends ThemeExtension<SocelleThemeExtension> {
  const SocelleThemeExtension({
    required this.ink,
    required this.inkAlpha80,
    required this.inkAlpha52,
    required this.inkAlpha32,
    required this.inkAlpha12,
    required this.inkAlpha06,
    required this.parchment,
    required this.parchmentAlt,
    required this.void_,
    required this.voidSurface,
    required this.voidBorder,
    required this.chrome,
    required this.chromeHover,
    required this.chromeTint,
    required this.glass70,
    required this.glass50,
    required this.glassTagDark,
    required this.glassBorder,
    required this.glassBorderInk,
    required this.signalUp,
    required this.signalUpBg,
    required this.signalWarn,
    required this.signalWarnBg,
    required this.signalDown,
    required this.signalDownBg,
    required this.cardSurface,
  });

  final Color ink;
  final Color inkAlpha80;
  final Color inkAlpha52;
  final Color inkAlpha32;
  final Color inkAlpha12;
  final Color inkAlpha06;
  final Color parchment;
  final Color parchmentAlt;
  final Color void_;
  final Color voidSurface;
  final Color voidBorder;
  final Color chrome;
  final Color chromeHover;
  final Color chromeTint;
  final Color glass70;
  final Color glass50;
  final Color glassTagDark;
  final Color glassBorder;
  final Color glassBorderInk;
  final Color signalUp;
  final Color signalUpBg;
  final Color signalWarn;
  final Color signalWarnBg;
  final Color signalDown;
  final Color signalDownBg;
  final Color cardSurface;

  static const SocelleThemeExtension light = SocelleThemeExtension(
    ink:           SocelleTokens.ink,
    inkAlpha80:    SocelleTokens.inkAlpha80,
    inkAlpha52:    SocelleTokens.inkAlpha52,
    inkAlpha32:    SocelleTokens.inkAlpha32,
    inkAlpha12:    SocelleTokens.inkAlpha12,
    inkAlpha06:    SocelleTokens.inkAlpha06,
    parchment:     SocelleTokens.parchment,
    parchmentAlt:  SocelleTokens.parchmentAlt,
    void_:         SocelleTokens.void_,
    voidSurface:   SocelleTokens.voidSurface,
    voidBorder:    SocelleTokens.voidBorder,
    chrome:        SocelleTokens.chrome,
    chromeHover:   SocelleTokens.chromeHover,
    chromeTint:    SocelleTokens.chromeTint,
    glass70:       SocelleTokens.glass70,
    glass50:       SocelleTokens.glass50,
    glassTagDark:  SocelleTokens.glassTagDark,
    glassBorder:   SocelleTokens.glassBorder,
    glassBorderInk: SocelleTokens.glassBorderInk,
    signalUp:      SocelleTokens.signalUp,
    signalUpBg:    SocelleTokens.signalUpBg,
    signalWarn:    SocelleTokens.signalWarn,
    signalWarnBg:  SocelleTokens.signalWarnBg,
    signalDown:    SocelleTokens.signalDown,
    signalDownBg:  SocelleTokens.signalDownBg,
    cardSurface:   SocelleTokens.cardSurface,
  );

  @override
  SocelleThemeExtension copyWith({
    Color? ink, Color? inkAlpha80, Color? inkAlpha52, Color? inkAlpha32,
    Color? inkAlpha12, Color? inkAlpha06, Color? parchment, Color? parchmentAlt,
    Color? void_, Color? voidSurface, Color? voidBorder, Color? chrome,
    Color? chromeHover, Color? chromeTint, Color? glass70, Color? glass50,
    Color? glassTagDark, Color? glassBorder, Color? glassBorderInk,
    Color? signalUp, Color? signalUpBg, Color? signalWarn, Color? signalWarnBg,
    Color? signalDown, Color? signalDownBg, Color? cardSurface,
  }) {
    return SocelleThemeExtension(
      ink:           ink           ?? this.ink,
      inkAlpha80:    inkAlpha80    ?? this.inkAlpha80,
      inkAlpha52:    inkAlpha52    ?? this.inkAlpha52,
      inkAlpha32:    inkAlpha32    ?? this.inkAlpha32,
      inkAlpha12:    inkAlpha12    ?? this.inkAlpha12,
      inkAlpha06:    inkAlpha06    ?? this.inkAlpha06,
      parchment:     parchment     ?? this.parchment,
      parchmentAlt:  parchmentAlt  ?? this.parchmentAlt,
      void_:         void_         ?? this.void_,
      voidSurface:   voidSurface   ?? this.voidSurface,
      voidBorder:    voidBorder    ?? this.voidBorder,
      chrome:        chrome        ?? this.chrome,
      chromeHover:   chromeHover   ?? this.chromeHover,
      chromeTint:    chromeTint    ?? this.chromeTint,
      glass70:       glass70       ?? this.glass70,
      glass50:       glass50       ?? this.glass50,
      glassTagDark:  glassTagDark  ?? this.glassTagDark,
      glassBorder:   glassBorder   ?? this.glassBorder,
      glassBorderInk: glassBorderInk ?? this.glassBorderInk,
      signalUp:      signalUp      ?? this.signalUp,
      signalUpBg:    signalUpBg    ?? this.signalUpBg,
      signalWarn:    signalWarn    ?? this.signalWarn,
      signalWarnBg:  signalWarnBg  ?? this.signalWarnBg,
      signalDown:    signalDown    ?? this.signalDown,
      signalDownBg:  signalDownBg  ?? this.signalDownBg,
      cardSurface:   cardSurface   ?? this.cardSurface,
    );
  }

  @override
  SocelleThemeExtension lerp(ThemeExtension<SocelleThemeExtension>? other, double t) {
    if (other is! SocelleThemeExtension) return this;
    return SocelleThemeExtension(
      ink:           Color.lerp(ink, other.ink, t)!,
      inkAlpha80:    Color.lerp(inkAlpha80, other.inkAlpha80, t)!,
      inkAlpha52:    Color.lerp(inkAlpha52, other.inkAlpha52, t)!,
      inkAlpha32:    Color.lerp(inkAlpha32, other.inkAlpha32, t)!,
      inkAlpha12:    Color.lerp(inkAlpha12, other.inkAlpha12, t)!,
      inkAlpha06:    Color.lerp(inkAlpha06, other.inkAlpha06, t)!,
      parchment:     Color.lerp(parchment, other.parchment, t)!,
      parchmentAlt:  Color.lerp(parchmentAlt, other.parchmentAlt, t)!,
      void_:         Color.lerp(void_, other.void_, t)!,
      voidSurface:   Color.lerp(voidSurface, other.voidSurface, t)!,
      voidBorder:    Color.lerp(voidBorder, other.voidBorder, t)!,
      chrome:        Color.lerp(chrome, other.chrome, t)!,
      chromeHover:   Color.lerp(chromeHover, other.chromeHover, t)!,
      chromeTint:    Color.lerp(chromeTint, other.chromeTint, t)!,
      glass70:       Color.lerp(glass70, other.glass70, t)!,
      glass50:       Color.lerp(glass50, other.glass50, t)!,
      glassTagDark:  Color.lerp(glassTagDark, other.glassTagDark, t)!,
      glassBorder:   Color.lerp(glassBorder, other.glassBorder, t)!,
      glassBorderInk: Color.lerp(glassBorderInk, other.glassBorderInk, t)!,
      signalUp:      Color.lerp(signalUp, other.signalUp, t)!,
      signalUpBg:    Color.lerp(signalUpBg, other.signalUpBg, t)!,
      signalWarn:    Color.lerp(signalWarn, other.signalWarn, t)!,
      signalWarnBg:  Color.lerp(signalWarnBg, other.signalWarnBg, t)!,
      signalDown:    Color.lerp(signalDown, other.signalDown, t)!,
      signalDownBg:  Color.lerp(signalDownBg, other.signalDownBg, t)!,
      cardSurface:   Color.lerp(cardSurface, other.cardSurface, t)!,
    );
  }
}

// =============================================================================
// SECTION 3: MATERIAL 3 THEME DATA
// =============================================================================

abstract class SocelleTheme {
  // --------------------------------------------------------------------------
  // Text Theme (General Sans)
  // --------------------------------------------------------------------------
  static TextTheme _buildTextTheme() {
    const String f = SocelleTokens.fontMain;
    return const TextTheme(
      displayLarge:  TextStyle(fontFamily: f, fontSize: 57, fontWeight: FontWeight.w600, letterSpacing: -2.0, height: 1.05),
      displayMedium: TextStyle(fontFamily: f, fontSize: 45, fontWeight: FontWeight.w600, letterSpacing: -1.5, height: 1.1),
      displaySmall:  TextStyle(fontFamily: f, fontSize: 36, fontWeight: FontWeight.w600, letterSpacing: -0.8, height: 1.15),

      headlineLarge:  TextStyle(fontFamily: f, fontSize: 32, fontWeight: FontWeight.w600, letterSpacing: -0.5, height: 1.2),
      headlineMedium: TextStyle(fontFamily: f, fontSize: 28, fontWeight: FontWeight.w600, letterSpacing: -0.4, height: 1.2),
      headlineSmall:  TextStyle(fontFamily: f, fontSize: 24, fontWeight: FontWeight.w500, letterSpacing: -0.2, height: 1.25),

      titleLarge:  TextStyle(fontFamily: f, fontSize: 22, fontWeight: FontWeight.w500, letterSpacing: -0.2, height: 1.3),
      titleMedium: TextStyle(fontFamily: f, fontSize: 16, fontWeight: FontWeight.w500, letterSpacing: 0.0,  height: 1.4),
      titleSmall:  TextStyle(fontFamily: f, fontSize: 14, fontWeight: FontWeight.w500, letterSpacing: 0.0,  height: 1.4),

      bodyLarge:  TextStyle(fontFamily: f, fontSize: 16, fontWeight: FontWeight.w400, letterSpacing: 0.0, height: 1.65),
      bodyMedium: TextStyle(fontFamily: f, fontSize: 14, fontWeight: FontWeight.w400, letterSpacing: 0.0, height: 1.6),
      bodySmall:  TextStyle(fontFamily: f, fontSize: 12, fontWeight: FontWeight.w400, letterSpacing: 0.0, height: 1.5),

      labelLarge:  TextStyle(fontFamily: f, fontSize: 14, fontWeight: FontWeight.w500, letterSpacing: 0.1, height: 1.4),
      labelMedium: TextStyle(fontFamily: f, fontSize: 12, fontWeight: FontWeight.w500, letterSpacing: 0.5, height: 1.3),
      labelSmall:  TextStyle(fontFamily: f, fontSize: 11, fontWeight: FontWeight.w500, letterSpacing: 0.8, height: 1.0),
    ).apply(
      bodyColor:    SocelleTokens.inkAlpha80,
      displayColor: SocelleTokens.ink,
    );
  }

  // --------------------------------------------------------------------------
  // Color Scheme
  // --------------------------------------------------------------------------
  static ColorScheme get _colorScheme => ColorScheme.fromSeed(
    seedColor: SocelleTokens.chrome,       // Mid-slate — neutral M3 seed
    brightness: Brightness.light,
  ).copyWith(
    // Override M3 generated colors with ZERO tokens
    surface:          SocelleTokens.parchment,
    onSurface:        SocelleTokens.ink,
    surfaceContainerLowest:  SocelleTokens.cardSurface,
    surfaceContainerLow:     SocelleTokens.cardSurface,
    surfaceContainer:        SocelleTokens.parchmentAlt,
    surfaceContainerHigh:    SocelleTokens.parchmentAlt,
    surfaceContainerHighest: SocelleTokens.parchmentAlt,
    primary:          SocelleTokens.chrome,
    onPrimary:        SocelleTokens.cardSurface,
    primaryContainer: SocelleTokens.chromeTint,
    onPrimaryContainer: SocelleTokens.chrome,
    secondary:        SocelleTokens.inkAlpha52,
    onSecondary:      SocelleTokens.cardSurface,
    secondaryContainer: SocelleTokens.inkAlpha06,
    onSecondaryContainer: SocelleTokens.ink,
    error:            SocelleTokens.signalDown,
    onError:          SocelleTokens.cardSurface,
    outline:          SocelleTokens.inkAlpha12,
    outlineVariant:   SocelleTokens.inkAlpha06,
    shadow:           SocelleTokens.ink,
    scrim:            SocelleTokens.ink,
  );

  // --------------------------------------------------------------------------
  // LIGHT THEME  (primary target)
  // --------------------------------------------------------------------------
  static ThemeData get light {
    final cs = _colorScheme;
    final tt = _buildTextTheme();

    return ThemeData(
      useMaterial3: true,
      colorScheme: cs,
      textTheme: tt,

      extensions: const <ThemeExtension<dynamic>>[
        SocelleThemeExtension.light,
      ],

      // Scaffold
      scaffoldBackgroundColor: SocelleTokens.parchment,

      // App Bar — transparent, floats over parchment bg
      appBarTheme: AppBarTheme(
        backgroundColor: SocelleTokens.parchment,
        surfaceTintColor: Colors.transparent,
        foregroundColor: SocelleTokens.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: tt.titleLarge?.copyWith(
          color: SocelleTokens.ink,
          fontWeight: FontWeight.w600,
        ),
      ),

      // Bottom Navigation Bar — matches floating nav pill pattern
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: SocelleTokens.glass70,
        surfaceTintColor: Colors.transparent,
        indicatorColor: SocelleTokens.chromeTint,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: SocelleTokens.chrome, size: 22);
          }
          return const IconThemeData(color: SocelleTokens.inkAlpha52, size: 22);
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final base = tt.labelSmall?.copyWith(letterSpacing: 0.3);
          if (states.contains(WidgetState.selected)) {
            return base?.copyWith(
              color: SocelleTokens.chrome,
              fontWeight: FontWeight.w600,
            );
          }
          return base?.copyWith(color: SocelleTokens.inkAlpha52);
        }),
        elevation: 0,
        height: 72,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
      ),

      // Filled Button → Primary action (pill shape)
      filledButtonTheme: FilledButtonThemeData(
        style: ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) return SocelleTokens.inkAlpha12;
            if (states.contains(WidgetState.pressed))  return SocelleTokens.chromeHover;
            if (states.contains(WidgetState.hovered))  return SocelleTokens.chromeHover;
            return SocelleTokens.ink;
          }),
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) return SocelleTokens.inkAlpha32;
            return SocelleTokens.cardSurface;
          }),
          textStyle: WidgetStatePropertyAll(
            tt.labelLarge?.copyWith(fontWeight: FontWeight.w500),
          ),
          padding: const WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          ),
          shape: const WidgetStatePropertyAll(
            StadiumBorder(), // Fully pill-shaped
          ),
          animationDuration: SocelleTokens.durStandard,
          elevation: const WidgetStatePropertyAll(0),
        ),
      ),

      // Outlined Button → Secondary action (pill shape, ink border)
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.hovered))  return SocelleTokens.inkAlpha06;
            if (states.contains(WidgetState.pressed))  return SocelleTokens.inkAlpha12;
            return Colors.transparent;
          }),
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) return SocelleTokens.inkAlpha32;
            return SocelleTokens.ink;
          }),
          side: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return BorderSide(color: SocelleTokens.inkAlpha12);
            }
            if (states.contains(WidgetState.hovered) || states.contains(WidgetState.focused)) {
              return BorderSide(color: SocelleTokens.chrome);
            }
            return BorderSide(color: SocelleTokens.inkAlpha32);
          }),
          textStyle: WidgetStatePropertyAll(
            tt.labelLarge?.copyWith(fontWeight: FontWeight.w500),
          ),
          padding: const WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          ),
          shape: const WidgetStatePropertyAll(StadiumBorder()),
          animationDuration: SocelleTokens.durStandard,
          elevation: const WidgetStatePropertyAll(0),
        ),
      ),

      // Text Button → Ghost action
      textButtonTheme: TextButtonThemeData(
        style: ButtonStyle(
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.hovered))  return SocelleTokens.ink;
            return SocelleTokens.inkAlpha52;
          }),
          overlayColor: WidgetStatePropertyAll(SocelleTokens.inkAlpha06),
          textStyle: WidgetStatePropertyAll(
            tt.labelLarge?.copyWith(fontWeight: FontWeight.w500),
          ),
          padding: const WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          ),
          shape: const WidgetStatePropertyAll(StadiumBorder()),
          animationDuration: SocelleTokens.durStandard,
        ),
      ),

      // Card — white surface, 28px radius, soft shadow
      cardTheme: const CardThemeData(
        color: SocelleTokens.cardSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(SocelleTokens.radiusCard)),
          side: BorderSide(color: SocelleTokens.glassBorderInk, width: 1),
        ),
        clipBehavior: Clip.antiAlias,
      ),

      // Chip — pill shape, parchment fill, ink text
      chipTheme: ChipThemeData(
        backgroundColor: SocelleTokens.parchmentAlt,
        selectedColor: SocelleTokens.chromeTint,
        disabledColor: SocelleTokens.inkAlpha06,
        labelStyle: tt.labelMedium?.copyWith(color: SocelleTokens.inkAlpha80),
        secondaryLabelStyle: tt.labelMedium?.copyWith(color: SocelleTokens.chrome),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: const StadiumBorder(side: BorderSide(color: SocelleTokens.glassBorderInk)),
        elevation: 0,
        pressElevation: 0,
      ),

      // Input Decoration — clean, minimal, parchment fill
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: SocelleTokens.parchmentAlt,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SocelleTokens.radiusTag),
          borderSide: BorderSide(color: SocelleTokens.inkAlpha12),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SocelleTokens.radiusTag),
          borderSide: BorderSide(color: SocelleTokens.inkAlpha12),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SocelleTokens.radiusTag),
          borderSide: BorderSide(color: SocelleTokens.chrome, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SocelleTokens.radiusTag),
          borderSide: BorderSide(color: SocelleTokens.signalDown),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: tt.bodyMedium?.copyWith(color: SocelleTokens.inkAlpha32),
        labelStyle: tt.bodyMedium?.copyWith(color: SocelleTokens.inkAlpha52),
      ),

      // Divider
      dividerTheme: const DividerThemeData(
        color: SocelleTokens.inkAlpha06,
        thickness: 1,
        space: 0,
      ),

      // Dialog — white, 28px radius, soft shadow
      dialogTheme: DialogThemeData(
        backgroundColor: SocelleTokens.cardSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(SocelleTokens.radiusCard)),
        ),
        titleTextStyle: tt.titleLarge?.copyWith(
          color: SocelleTokens.ink,
          fontWeight: FontWeight.w600,
        ),
        contentTextStyle: tt.bodyMedium?.copyWith(color: SocelleTokens.inkAlpha80),
      ),

      // Bottom Sheet — parchment, 40px top radius (panel radius)
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: SocelleTokens.parchment,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(SocelleTokens.radiusPanel),
          ),
        ),
        dragHandleColor: SocelleTokens.inkAlpha32,
        dragHandleSize: Size(40, 4),
        showDragHandle: true,
        clipBehavior: Clip.antiAlias,
      ),

      // Snack Bar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: SocelleTokens.void_,
        contentTextStyle: tt.bodyMedium?.copyWith(color: SocelleTokens.cardSurface),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SocelleTokens.radiusCard),
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 0,
        insetPadding: const EdgeInsets.all(16),
      ),

      // Progress Indicator
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: SocelleTokens.chrome,
        linearTrackColor: SocelleTokens.inkAlpha06,
        circularTrackColor: SocelleTokens.inkAlpha06,
      ),

      // Switch
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return SocelleTokens.cardSurface;
          return SocelleTokens.inkAlpha52;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return SocelleTokens.chrome;
          return SocelleTokens.inkAlpha12;
        }),
        trackOutlineColor: const WidgetStatePropertyAll(Colors.transparent),
      ),

      // Tab Bar → Segmented pill control (see SocelleSegmentedTab widget below)
      tabBarTheme: TabBarThemeData(
        labelColor: SocelleTokens.ink,
        unselectedLabelColor: SocelleTokens.inkAlpha52,
        labelStyle: tt.labelMedium?.copyWith(fontWeight: FontWeight.w600),
        unselectedLabelStyle: tt.labelMedium?.copyWith(fontWeight: FontWeight.w400),
        indicatorColor: SocelleTokens.cardSurface,
        dividerColor: Colors.transparent,
        indicatorSize: TabBarIndicatorSize.tab,
        splashFactory: NoSplash.splashFactory,
      ),

      // Icon
      iconTheme: const IconThemeData(
        color: SocelleTokens.inkAlpha80,
        size: 20,
      ),

      // Page Transitions — cinematic slide
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.iOS:     CupertinoPageTransitionsBuilder(),
          TargetPlatform.android: FadeUpwardsPageTransitionsBuilder(),
        },
      ),

      // Visual density — compact for data-rich screens
      visualDensity: VisualDensity.adaptivePlatformDensity,
    );
  }

  // --------------------------------------------------------------------------
  // DARK THEME — (future: void_ as background, glass white surfaces)
  // --------------------------------------------------------------------------
  // Note: The ZERO system's "dark mode" uses void (#111112) as the scaffold
  // with glass-white surfaces. This is intentionally left as a stub — implement
  // when the app adds dark mode support. The ONE dark panel per page rule
  // means light mode already has a dark panel; avoid full dark mode initially.
  static ThemeData get dark => light; // Stub — replace when dark mode ships
}

// =============================================================================
// SECTION 4: REUSABLE SOCELLE WIDGETS
// Ready-to-use widgets implementing the ZERO design patterns
// =============================================================================

// -----------------------------------------------------------------------------
// 4.1  GlassPanel — Frosted glass container (nav, modals, overlays)
// -----------------------------------------------------------------------------
// Usage:
//   GlassPanel(
//     child: Row(...),
//   )
class GlassPanel extends StatelessWidget {
  const GlassPanel({
    super.key,
    required this.child,
    this.onDark = false,
    this.padding = const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
    this.borderRadius,
    this.blur = SocelleTokens.blurPanel,
  });

  final Widget child;
  final bool onDark;          // true = glass-tag-dark (for void panels)
  final EdgeInsets padding;
  final BorderRadius? borderRadius;
  final double blur;

  @override
  Widget build(BuildContext context) {
    final br = borderRadius ?? SocelleTokens.brPanel;
    final bg = onDark ? SocelleTokens.glassTagDark : SocelleTokens.glass70;
    final border = onDark ? SocelleTokens.voidBorder : SocelleTokens.glassBorder;

    return ClipRRect(
      borderRadius: br,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: br,
            border: Border.all(color: border, width: 1),
          ),
          child: child,
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 4.2  SocelleCard — White card with ink border and soft shadow
// -----------------------------------------------------------------------------
// Usage:
//   SocelleCard(
//     child: Column(...),
//   )
class SocelleCard extends StatelessWidget {
  const SocelleCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(SocelleTokens.space24),
    this.onTap,
    this.radius = SocelleTokens.radiusCard,
  });

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: SocelleTokens.durStandard,
      curve: SocelleTokens.easeStandard,
      decoration: BoxDecoration(
        color: SocelleTokens.cardSurface,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: SocelleTokens.glassBorderInk),
        boxShadow: SocelleTokens.shadowCard,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: onTap != null
            ? InkWell(
                onTap: onTap,
                splashColor: SocelleTokens.inkAlpha06,
                highlightColor: SocelleTokens.inkAlpha06,
                child: Padding(padding: padding, child: child),
              )
            : Padding(padding: padding, child: child),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 4.3  SocelleSegmentedTab — Pill segmented control (replaces underline tabs)
// -----------------------------------------------------------------------------
// Usage:
//   SocelleSegmentedTab(
//     segments: ['Overview', 'Market', 'Peers'],
//     selectedIndex: _tabIndex,
//     onChanged: (i) => setState(() => _tabIndex = i),
//   )
class SocelleSegmentedTab extends StatelessWidget {
  const SocelleSegmentedTab({
    super.key,
    required this.segments,
    required this.selectedIndex,
    required this.onChanged,
    this.compact = false,
  });

  final List<String> segments;
  final int selectedIndex;
  final ValueChanged<int> onChanged;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: SocelleTokens.parchmentAlt,
        borderRadius: SocelleTokens.brPill,
        border: Border.all(color: SocelleTokens.glassBorderInk),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(segments.length, (i) {
          final isSelected = i == selectedIndex;
          return GestureDetector(
            onTap: () => onChanged(i),
            child: AnimatedContainer(
              duration: SocelleTokens.durStandard,
              curve: SocelleTokens.easeStandard,
              padding: EdgeInsets.symmetric(
                horizontal: compact ? 12 : 16,
                vertical: compact ? 6 : 8,
              ),
              decoration: BoxDecoration(
                color: isSelected ? SocelleTokens.cardSurface : Colors.transparent,
                borderRadius: SocelleTokens.brPill,
                boxShadow: isSelected ? SocelleTokens.shadowCard : null,
              ),
              child: Text(
                segments[i],
                style: (compact ? tt.labelSmall : tt.labelMedium)?.copyWith(
                  color: isSelected ? SocelleTokens.ink : SocelleTokens.inkAlpha52,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 4.4  SignalChip — Data signal badge (up/warn/down, DATA CONTEXT ONLY)
// -----------------------------------------------------------------------------
// Usage:
//   SignalChip(value: '+12.4%', type: SignalType.up)
enum SignalType { up, warn, down }

class SignalChip extends StatelessWidget {
  const SignalChip({
    super.key,
    required this.value,
    required this.type,
    this.showIcon = true,
  });

  final String value;
  final SignalType type;
  final bool showIcon;

  @override
  Widget build(BuildContext context) {
    final (Color fg, Color bg, IconData icon) = switch (type) {
      SignalType.up   => (SocelleTokens.signalUp, SocelleTokens.signalUpBg, Icons.trending_up_rounded),
      SignalType.warn => (SocelleTokens.signalWarn, SocelleTokens.signalWarnBg, Icons.remove_rounded),
      SignalType.down => (SocelleTokens.signalDown, SocelleTokens.signalDownBg, Icons.trending_down_rounded),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: SocelleTokens.brPill,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            value,
            style: SocelleTokens.typeLabel.copyWith(
              color: fg,
              fontFamily: SocelleTokens.fontData,
              letterSpacing: 0.0,
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 4.5  VoidPanel — Dark background panel (ONE per page rule)
// -----------------------------------------------------------------------------
// Usage:
//   VoidPanel(
//     child: Column(...),
//   )
// CRITICAL: Use at most once per screen. This is the hero or metrics bar.
class VoidPanel extends StatelessWidget {
  const VoidPanel({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(SocelleTokens.space32),
    this.radius = SocelleTokens.radiusCard,
  });

  final Widget child;
  final EdgeInsets padding;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: SocelleTokens.void_,
        borderRadius: BorderRadius.circular(radius),
      ),
      child: child,
    );
  }
}

// -----------------------------------------------------------------------------
// 4.6  FrostedTag — Glass pill filter / category tag
// -----------------------------------------------------------------------------
// Usage:
//   FrostedTag(label: 'PEPTIDES', onDark: false)
class FrostedTag extends StatelessWidget {
  const FrostedTag({
    super.key,
    required this.label,
    this.onDark = false,
    this.selected = false,
    this.onTap,
  });

  final String label;
  final bool onDark;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final bg = selected
        ? (onDark ? SocelleTokens.glass70 : SocelleTokens.ink)
        : (onDark ? SocelleTokens.glassTagDark : SocelleTokens.parchmentAlt);
    final textColor = selected
        ? (onDark ? SocelleTokens.ink : SocelleTokens.cardSurface)
        : (onDark ? SocelleTokens.cardSurface : SocelleTokens.inkAlpha52);
    final borderColor = onDark ? SocelleTokens.voidBorder : SocelleTokens.glassBorderInk;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: SocelleTokens.durStandard,
        curve: SocelleTokens.easeStandard,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: SocelleTokens.brTag,
          border: Border.all(color: borderColor),
        ),
        child: Text(
          label.toUpperCase(),
          style: SocelleTokens.typeLabel.copyWith(color: textColor),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 4.7  SocelleFloatingNav — Floating pill navigation bar
// -----------------------------------------------------------------------------
// Wraps the bottom NavigationBar in the floating pill style.
// Use inside a Stack at the bottom of your scaffold:
//
//   Scaffold(
//     body: Stack(
//       children: [
//         _pageContent,
//         Positioned(
//           left: 16, right: 16, bottom: 24,
//           child: SocelleFloatingNav(
//             selectedIndex: _index,
//             onChanged: (i) => setState(() => _index = i),
//             destinations: [...],
//           ),
//         ),
//       ],
//     ),
//   )
class SocelleFloatingNav extends StatelessWidget {
  const SocelleFloatingNav({
    super.key,
    required this.selectedIndex,
    required this.onChanged,
    required this.destinations,
  });

  final int selectedIndex;
  final ValueChanged<int> onChanged;
  final List<NavigationDestination> destinations;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: SocelleTokens.brPanel,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: SocelleTokens.blurPanel, sigmaY: SocelleTokens.blurPanel),
        child: Container(
          decoration: BoxDecoration(
            color: SocelleTokens.glass70,
            borderRadius: SocelleTokens.brPanel,
            border: Border.all(color: SocelleTokens.glassBorder),
            boxShadow: SocelleTokens.shadowPanel,
          ),
          child: NavigationBar(
            selectedIndex: selectedIndex,
            onDestinationSelected: onChanged,
            destinations: destinations,
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            height: 64,
            labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 4.8  SocelleMetricTile — Data metric display (JetBrains Mono)
// -----------------------------------------------------------------------------
// Usage:
//   SocelleMetricTile(
//     label: 'AVG ORDER VALUE',
//     value: '\$284',
//     signal: SignalChip(value: '+8.3%', type: SignalType.up),
//   )
class SocelleMetricTile extends StatelessWidget {
  const SocelleMetricTile({
    super.key,
    required this.label,
    required this.value,
    this.signal,
    this.onDark = false,
  });

  final String label;
  final String value;
  final Widget? signal;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final labelColor = onDark ? SocelleTokens.voidBorder : SocelleTokens.inkAlpha52;
    final valueColor = onDark ? SocelleTokens.cardSurface : SocelleTokens.ink;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: SocelleTokens.typeLabel.copyWith(color: labelColor),
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(value, style: SocelleTokens.typeMetric.copyWith(color: valueColor)),
            if (signal != null) ...[
              const SizedBox(width: 8),
              signal!,
            ],
          ],
        ),
      ],
    );
  }
}

// =============================================================================
// SECTION 5: PUBSPEC.YAML ADDITIONS (reference — not executable Dart)
// =============================================================================
//
// Add to pubspec.yaml:
//
// flutter:
//   fonts:
//     - family: GeneralSans
//       fonts:
//         - asset: assets/fonts/GeneralSans-Regular.otf
//           weight: 400
//         - asset: assets/fonts/GeneralSans-Medium.otf
//           weight: 500
//         - asset: assets/fonts/GeneralSans-Semibold.otf
//           weight: 600
//         - asset: assets/fonts/GeneralSans-Bold.otf
//           weight: 700
//         - asset: assets/fonts/GeneralSans-Italic.otf
//           weight: 400
//           style: italic
//     - family: JetBrainsMono
//       fonts:
//         - asset: assets/fonts/JetBrainsMono-Regular.ttf
//           weight: 400
//         - asset: assets/fonts/JetBrainsMono-SemiBold.ttf
//           weight: 600
//
// Font sources:
//   GeneralSans: https://www.fontshare.com/fonts/general-sans (free for commercial use)
//   JetBrainsMono: https://www.jetbrains.com/lp/mono/ (free, open source)
//
// =============================================================================
// END OF FILE
// =============================================================================
