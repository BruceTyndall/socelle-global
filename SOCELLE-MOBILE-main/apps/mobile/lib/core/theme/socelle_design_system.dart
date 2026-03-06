// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE DESIGN SYSTEM — FLUTTER TRANSLATION
// Warm cocoa glassmorphism · Shimmer pill buttons · Editorial typography
// ═══════════════════════════════════════════════════════════════════════════
//
// This file translates the Socelle web design system into Flutter widgets
// and tokens. It is ADDITIVE to the existing SocelleColors/SocelleTheme.
// Use SocelleTheme for new intelligence surfaces (Feed, Discover, Profile).
// Existing gap-recovery surfaces (Revenue, Schedule) keep SocelleTheme.
//
// Usage:
//   import 'package:socelle_mobile/core/theme/socelle_design_system.dart';
//
//   SocelleColors.primaryCocoa
//   SocelleText.heading(text)
//   SocellePillButton(label: 'Get Started', variant: PillVariant.primary, tone: PillTone.glass)
//   SocelleCard(child: ...)
//   SocelleGlassCard(child: ...)

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ─────────────────────────────────────────────────────────────────────────────
// 1. COLOR TOKENS
// ─────────────────────────────────────────────────────────────────────────────

class SocelleColors {
  SocelleColors._();

  // ── Core brand ──
  static const primaryCocoa = Color(0xFF47201C);   // primary text & brand
  static const deepCocoa    = Color(0xFF29120F);   // darkest bg (footer, dark sections)
  static const neutralBeige = Color(0xFFAC9B98);   // placeholder, muted

  // ── Page backgrounds ──
  static const bgMain       = Color(0xFFF8F6F2);   // warm off-white scaffold
  static const bgAlt        = Color(0xFFF3E9E3);   // peach section tint
  static const bgNearWhite  = Color(0xFFFAF9F5);   // card bg

  // ── Palette ──
  static const red400       = Color(0xFFFF6568);
  static const orange400    = Color(0xFFFF8B1A);
  static const orange700    = Color(0xFFC53C00);
  static const yellow400    = Color(0xFFFAC800);
  static const green400     = Color(0xFF05DF72);
  static const green600     = Color(0xFF00A544);
  static const green900     = Color(0xFF0D542B);
  static const teal400      = Color(0xFF00D3BD);
  static const blue400      = Color(0xFF54A2FF);
  static const purple400    = Color(0xFFC07EFF);

  // ── Glass tints ──
  static const glassLight   = Color(0x1A868686);   // rgba(134,134,134,0.1)
  static const glassDark    = Color(0x6647201C);   // rgba(71,32,28,0.4)
  static const glassWhite   = Color(0x33FFFFFF);   // rgba(255,255,255,0.2)
  static const glassDarkBg  = Color(0x1A29120F);   // rgba(41,18,16,0.1)

  // ── Text on dark ──
  static const textOnDark       = Colors.white;
  static const textOnDarkMuted  = Color(0xCCFFFFFF); // rgba(255,255,255,0.8)

  // ── Shadows ──
  static final shadowLight = BoxShadow(
    color: Colors.black.withValues(alpha: 0.10),
    blurRadius: 12,
    offset: const Offset(0, 6),
  );
  static final shadowMedium = BoxShadow(
    color: Colors.black.withValues(alpha: 0.15),
    blurRadius: 14,
    offset: const Offset(0, 4),
  );
  static final shadowDark = BoxShadow(
    color: Colors.black.withValues(alpha: 0.18),
    blurRadius: 12,
    offset: const Offset(0, 6),
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // Gap-Recovery Surface Colors (Revenue, Schedule, Onboarding, Paywall)
  // Merged from former socelle_colors.dart — revenue-intelligence palette.
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Ink system ─────────────────────────────────────────────────────────
  static const ink = Color(0xFF1A1714);           // primary text, CTAs
  static const inkMuted = Color(0xFF6E6A66);      // secondary text, labels
  static const inkFaint = Color(0xFF706A65);      // tertiary, disabled — WCAG 2.2 AA ≥4.5:1

  // ── Surface system ─────────────────────────────────────────────────────
  static const background = Color(0xFFF5F3F0);    // scaffold background
  static const surface = Color(0xFFFFFFFF);        // card backgrounds
  static const surfaceMuted = Color(0xFFF0EDEA);   // inset areas, code blocks
  static const borderLight = Color(0xFFE8E5E1);   // card borders, dividers

  // ── Accent — muted deep green ──────────────────────────────────────────
  static const accent = Color(0xFF3D6B52);         // primary accent
  static const accentMuted = Color(0xFF5A8A6A);    // softer accent
  static const accentSurface = Color(0xFFEAF2EC);  // accent background wash

  // ── Leakage — muted terracotta ─────────────────────────────────────────
  static const leakage = Color(0xFFA85038);        // leakage numbers
  static const leakageMuted = Color(0xFFC47A5A);   // lighter terracotta
  static const leakageSurface = Color(0xFFFAEDE8); // leakage background wash

  // ── Recovery — sage green ──────────────────────────────────────────────
  static const recovery = Color(0xFF3D6B52);       // recovery numbers
  static const recoverySurface = Color(0xFFEAF2EC);

  // ── System states ──────────────────────────────────────────────────────
  static const error = Color(0xFFC62828);

  // ── Semantic aliases (legacy compatibility) ────────────────────────────
  static const textPrimary = ink;
  static const textSecondary = inkMuted;
  static const textMuted = inkFaint;
  static const cardBackground = surface;
  static const pureWhite = surface;
  static const surfaceSoft = surfaceMuted;
  static const divider = borderLight;
  static const border = borderLight;
  static const primary = accent;
  static const primaryDark = Color(0xFF2D5040);
  static const primaryLight = accentSurface;          // sage mist — info box backgrounds
  static const leakageRed = leakage;
  static const leakageRedLight = leakageSurface;      // terracotta wash — info box bg
  static const leakageRedDark = Color(0xFF7A3020);    // fired clay — text on light bg
  static const recoveredGreen = recovery;
  static const recoveredGreenLight = recoverySurface;
  static const recoveredGreenDark = Color(0xFF2D5040);
  static const intentionalAmber = Color(0xFFD97706);
  static const intentionalAmberLight = Color(0xFFFEF3C7);
  static const errorRed = error;
  static const accentBlue = Color(0xFF2563EB);
  static const accentRose = Color(0xFFE11D48);
  static const accentSun = Color(0xFFD97706);

  // ── Gold accent — editorial "money moment" screens only ───────────────
  static const accentGold = Color(0xFFC5A265);
  static const accentGoldLight = accentSurface;       // sage mist — icon container bg
  static const accentGoldDark = primaryDark;          // forest green — icon color

  // ── Trial urgency ──────────────────────────────────────────────────────
  static const trialRed = leakage;                    // terracotta — "Last day!" badge
  static const trialAmber = Color(0xFFC49A3A);        // muted warm amber — "3 days left"

  // ── Brand gradient (primary buttons, progress bars) ────────────────────
  static const glamPlum = accent;
  static const glamInk = ink;                         // warm editorial near-black
  static const glamHeroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF3D6B52), Color(0xFF5A8A6A)],
  );

  /// 3-stop: warm ink → forest green → Socelle sage.
  /// Used on the onboarding intro hero card.
  static const glamHeroGradientColors = <Color>[
    Color(0xFF1A1714),
    Color(0xFF2D5040),
    Color(0xFF3D6B52),
  ];

  /// Used as the `colors:` list inside a LinearGradient widget.
  static const actionGradient = [Color(0xFF3D6B52), Color(0xFF5A8A6A)];
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BORDER RADIUS TOKENS (responsive)
// ─────────────────────────────────────────────────────────────────────────────

class SocelleRadius {
  SocelleRadius._();

  // Use these and the system figures out mobile vs tablet via MediaQuery
  static BorderRadius small(BuildContext context) =>
      BorderRadius.circular(_isTablet(context) ? 24 : 16);

  static BorderRadius medium(BuildContext context) =>
      BorderRadius.circular(_isTablet(context) ? 32 : 24);

  static BorderRadius large(BuildContext context) =>
      BorderRadius.circular(_isTablet(context) ? 80 : 48);

  static BorderRadius card(BuildContext context) =>
      BorderRadius.circular(_isTablet(context) ? 48 : 32);

  // Pill — always height / 2 (computed per button)
  static BorderRadius pill(double height) =>
      BorderRadius.circular(height / 2);

  static bool _isTablet(BuildContext context) =>
      MediaQuery.sizeOf(context).shortestSide >= 600;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────

class SocelleText {
  SocelleText._();

  // Socelle uses PPNeueMontreal — we substitute with a geometric sans that ships
  // with Flutter or can be bundled. For now, use the existing Inter with Socelle
  // optical weights. Replace with PPNeueMontreal when the font asset is added.
  static const _fontFamily = 'Inter';

  // ── Styles ──
  static const displayLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 48,     // --text-2xl mapped to mobile
    fontWeight: FontWeight.w300,  // Socelle uses light for headings
    color: SocelleColors.primaryCocoa,
    height: 1.08,
    letterSpacing: -1.5,
  );

  static const displayMedium = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 32,     // --text-xl
    fontWeight: FontWeight.w300,
    color: SocelleColors.primaryCocoa,
    height: 1.125,
    letterSpacing: -0.8,
  );

  static const headlineLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 24,     // --text-lg
    fontWeight: FontWeight.w300,
    color: SocelleColors.primaryCocoa,
    height: 1.167,
    letterSpacing: -0.3,
  );

  static const headlineMedium = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 20,     // --text-base
    fontWeight: FontWeight.w400, // slightly heavier for h3 equivalent
    color: SocelleColors.primaryCocoa,
    height: 1.2,
  );

  static const bodyLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: SocelleColors.primaryCocoa,
    height: 1.5,
  );

  static const bodyMedium = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: SocelleColors.neutralBeige,
    height: 1.5,
  );

  static const label = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 13.8,
    fontWeight: FontWeight.w500, // Socelle uses 450, closest in Flutter is w500
    color: SocelleColors.primaryCocoa,
    letterSpacing: 0,
  );

  static const labelUppercase = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 13.8,
    fontWeight: FontWeight.w500,
    color: SocelleColors.neutralBeige,
    letterSpacing: 0,  // Socelle notably has no letter-spacing on uppercase
  );

  static const buttonLabel = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w500, // 450 → w500
    color: SocelleColors.primaryCocoa,
    height: 1.2,
  );

  // ── Convenience constructors ──
  static Widget heading(String text, {TextStyle? style, Color? color}) {
    return Text(
      text,
      style: (style ?? displayMedium).copyWith(color: color),
    );
  }

  static Widget eyebrow(String text, {Color? color}) {
    return Text(
      text.toUpperCase(),
      style: labelUppercase.copyWith(color: color ?? SocelleColors.neutralBeige),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ANIMATION CURVES & DURATIONS
// ─────────────────────────────────────────────────────────────────────────────

class SocelleAnimation {
  SocelleAnimation._();

  // Socelle easing curves
  static const snap      = Curves.linear;                           // state changes
  static const cinematic = Cubic(0.75, 0, 0.25, 1);                // scroll reveals
  static const standard  = Cubic(0.4, 0, 0.2, 1);                  // default

  // Durations
  static const dSnap     = Duration(milliseconds: 200);
  static const dReveal   = Duration(milliseconds: 1200);
  static const dTransform = Duration(milliseconds: 800);
  static const dFill     = Duration(milliseconds: 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PILL BUTTON SYSTEM (The Socelle Button Component)
// ─────────────────────────────────────────────────────────────────────────────

enum PillVariant { primary, secondary, tertiary }
enum PillTone { light, dark, glass }
enum PillSize { extraLarge, large, betweenLargeAndMedium, medium, small }

class _PillSizeData {
  final double height;
  final double fontSize;
  final EdgeInsets padding;
  final EdgeInsets iconPadding;
  final double iconGap;

  const _PillSizeData({
    required this.height,
    required this.fontSize,
    required this.padding,
    required this.iconPadding,
    required this.iconGap,
  });
}

const _pillSizes = <PillSize, _PillSizeData>{
  PillSize.extraLarge: _PillSizeData(
    height: 80, fontSize: 20,
    padding: EdgeInsets.symmetric(horizontal: 60),
    iconPadding: EdgeInsets.symmetric(horizontal: 40),
    iconGap: 12,
  ),
  PillSize.large: _PillSizeData(
    height: 60, fontSize: 16,
    padding: EdgeInsets.symmetric(horizontal: 48),
    iconPadding: EdgeInsets.symmetric(horizontal: 20),
    iconGap: 12,
  ),
  PillSize.betweenLargeAndMedium: _PillSizeData(
    height: 56, fontSize: 16,
    padding: EdgeInsets.symmetric(horizontal: 44),
    iconPadding: EdgeInsets.symmetric(horizontal: 36),
    iconGap: 10,
  ),
  PillSize.medium: _PillSizeData(
    height: 48, fontSize: 16,
    padding: EdgeInsets.symmetric(horizontal: 38),
    iconPadding: EdgeInsets.symmetric(horizontal: 16),
    iconGap: 10,
  ),
  PillSize.small: _PillSizeData(
    height: 40, fontSize: 16,
    padding: EdgeInsets.symmetric(horizontal: 22),
    iconPadding: EdgeInsets.symmetric(horizontal: 16),
    iconGap: 10,
  ),
};

/// Socelle-style glassmorphic pill button.
///
/// ```dart
/// SocellePillButton(
///   label: 'Get the app',
///   variant: PillVariant.primary,
///   tone: PillTone.glass,
///   size: PillSize.betweenLargeAndMedium,
///   onTap: () {},
/// )
/// ```
class SocellePillButton extends StatefulWidget {
  const SocellePillButton({
    super.key,
    required this.label,
    this.variant = PillVariant.primary,
    this.tone = PillTone.glass,
    this.size = PillSize.medium,
    this.icon,
    this.iconPosition = IconAlignment.end,
    this.onTap,
    this.isActive = false,
    this.isDisabled = false,
    this.enableBlur = true,
    this.isDarkTheme = false,
    this.expand = false,
  });

  final String label;
  final PillVariant variant;
  final PillTone tone;
  final PillSize size;
  final IconData? icon;
  final IconAlignment iconPosition;
  final VoidCallback? onTap;
  final bool isActive;
  final bool isDisabled;
  final bool enableBlur;
  final bool isDarkTheme;
  final bool expand;

  @override
  State<SocellePillButton> createState() => _SocellePillButtonState();
}

class _SocellePillButtonState extends State<SocellePillButton> {
  bool _isPressed = false;

  _PillSizeData get _size => _pillSizes[widget.size]!;
  double get _radius => _size.height / 2;
  bool get _hasIcon => widget.icon != null;
  bool get _isLight => widget.tone == PillTone.light ||
      (widget.tone == PillTone.glass && !widget.isDarkTheme);

  Color get _textColor {
    if (widget.isDisabled) {
      return _isLight
          ? SocelleColors.primaryCocoa.withValues(alpha: 0.2)
          : Colors.white.withValues(alpha: 0.2);
    }
    return _isLight ? SocelleColors.primaryCocoa : Colors.white;
  }

  // ── Background color by variant × tone × state ──
  Color get _backgroundColor {
    if (widget.isDisabled) return SocelleColors.glassLight;

    if (_isPressed) {
      return switch ((widget.variant, widget.tone)) {
        (PillVariant.primary, PillTone.light) => SocelleColors.primaryCocoa.withValues(alpha: 0.4),
        (PillVariant.primary, PillTone.dark) => Colors.white.withValues(alpha: 0.15),
        (PillVariant.primary, PillTone.glass) when !widget.isDarkTheme =>
            SocelleColors.bgMain.withValues(alpha: 0.3),
        (PillVariant.primary, PillTone.glass) => Colors.black.withValues(alpha: 0.2),
        (PillVariant.secondary, PillTone.light) => SocelleColors.primaryCocoa.withValues(alpha: 0.4),
        (PillVariant.secondary, PillTone.dark) => Colors.white.withValues(alpha: 0.15),
        (_, _) => Colors.transparent,
      };
    }

    if (widget.isActive) {
      return switch ((widget.variant, widget.tone)) {
        (PillVariant.primary, PillTone.light) => SocelleColors.bgMain.withValues(alpha: 0.4),
        (PillVariant.primary, PillTone.dark) => Colors.white.withValues(alpha: 0.3),
        (PillVariant.primary, PillTone.glass) when !widget.isDarkTheme =>
            SocelleColors.bgMain.withValues(alpha: 0.4),
        (PillVariant.primary, PillTone.glass) => Colors.black.withValues(alpha: 0.4),
        (_, _) => Colors.transparent,
      };
    }

    return switch ((widget.variant, widget.tone)) {
      (PillVariant.primary, PillTone.light) => SocelleColors.glassLight,
      (PillVariant.primary, PillTone.dark) => SocelleColors.glassDark,
      (PillVariant.primary, PillTone.glass) when !widget.isDarkTheme => SocelleColors.glassLight,
      (PillVariant.primary, PillTone.glass) => SocelleColors.glassDarkBg,
      (PillVariant.secondary, PillTone.light) => SocelleColors.bgMain.withValues(alpha: 0.1),
      (PillVariant.secondary, PillTone.dark) => SocelleColors.glassLight,
      (PillVariant.secondary, PillTone.glass) => Colors.transparent,
      (PillVariant.tertiary, _) => Colors.transparent,
    };
  }

  Border? get _border {
    return switch ((widget.variant, widget.tone)) {
      (PillVariant.secondary, PillTone.light) =>
          Border.all(color: SocelleColors.bgMain.withValues(alpha: 0.8), width: 1),
      (PillVariant.secondary, PillTone.dark) =>
          Border.all(color: const Color(0x1AFFE3D1), width: 0.8),
      (PillVariant.primary, PillTone.dark) =>
          Border.all(color: Colors.black.withValues(alpha: 0.2), width: 0.8),
      _ => null,
    };
  }

  List<BoxShadow>? get _shadows {
    if (widget.variant == PillVariant.tertiary && !widget.isActive && !_isPressed) {
      return null; // tertiary has no shadow by default
    }
    return switch ((widget.variant, widget.tone)) {
      (PillVariant.primary, _) => [SocelleColors.shadowLight],
      (PillVariant.secondary, _) => [SocelleColors.shadowMedium],
      _ => null,
    };
  }

  @override
  Widget build(BuildContext context) {
    final sizeData = _size;

    return GestureDetector(
      onTapDown: widget.isDisabled ? null : (_) => setState(() => _isPressed = true),
      onTapUp: widget.isDisabled ? null : (_) {
        setState(() => _isPressed = false);
        HapticFeedback.lightImpact();
        widget.onTap?.call();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedContainer(
        duration: SocelleAnimation.dSnap,
        curve: SocelleAnimation.snap,
        height: sizeData.height,
        width: widget.expand ? double.infinity : null,
        decoration: BoxDecoration(
          color: _backgroundColor,
          borderRadius: BorderRadius.circular(_radius),
          border: _border,
          boxShadow: _shadows,
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // ── Shimmer border gradient (primary glass only) ──
            if (widget.variant == PillVariant.primary &&
                widget.tone == PillTone.glass)
              Positioned.fill(
                child: CustomPaint(
                  painter: _ShimmerBorderPainter(
                    radius: _radius,
                    color: widget.isDarkTheme
                        ? SocelleColors.bgMain
                        : SocelleColors.neutralBeige,
                  ),
                ),
              ),

            // ── Blur layer ──
            if (widget.enableBlur &&
                widget.variant != PillVariant.tertiary)
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(_radius),
                  child: BackdropFilter(
                    filter: ImageFilter.blur(
                      sigmaX: widget.tone == PillTone.dark ? 3 : 1.5,
                      sigmaY: widget.tone == PillTone.dark ? 3 : 1.5,
                    ),
                    child: const SizedBox.expand(),
                  ),
                ),
              ),

            // ── Inner pill content ──
            Center(
              child: Padding(
                padding: _hasIcon ? sizeData.iconPadding : sizeData.padding,
                child: Row(
                  mainAxisSize: widget.expand ? MainAxisSize.max : MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_hasIcon && widget.iconPosition == IconAlignment.start) ...[
                      Icon(widget.icon, size: 20, color: _textColor),
                      SizedBox(width: sizeData.iconGap),
                    ],
                    Text(
                      widget.label,
                      style: SocelleText.buttonLabel.copyWith(
                        color: _textColor,
                        fontSize: sizeData.fontSize,
                      ),
                    ),
                    if (_hasIcon && widget.iconPosition == IconAlignment.end) ...[
                      SizedBox(width: sizeData.iconGap),
                      Icon(widget.icon, size: 20, color: _textColor),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Paints the Socelle shimmer gradient border — a vertical gradient that
/// fades from transparent to [color] at 41.5% and back to transparent.
class _ShimmerBorderPainter extends CustomPainter {
  _ShimmerBorderPainter({required this.radius, required this.color});

  final double radius;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final rrect = RRect.fromRectAndRadius(rect, Radius.circular(radius));

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Colors.transparent,
          color.withValues(alpha: 0.6),
          Colors.transparent,
        ],
        stops: const [0.0, 0.415, 1.0],
      ).createShader(rect);

    canvas.drawRRect(rrect, paint);
  }

  @override
  bool shouldRepaint(covariant _ShimmerBorderPainter old) =>
      old.color != color || old.radius != radius;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GLASS CARD
// ─────────────────────────────────────────────────────────────────────────────

/// Frosted glass card with subtle border and backdrop blur.
class SocelleGlassCard extends StatelessWidget {
  const SocelleGlassCard({
    super.key,
    required this.child,
    this.isDark = false,
    this.padding = const EdgeInsets.all(24),
    this.borderRadius,
    this.blur = 6.0,
  });

  final Widget child;
  final bool isDark;
  final EdgeInsets padding;
  final BorderRadius? borderRadius;
  final double blur;

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? SocelleRadius.card(context);

    return ClipRRect(
      borderRadius: radius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: isDark
                ? SocelleColors.glassDark
                : SocelleColors.glassLight,
            borderRadius: radius,
            border: Border.all(
              color: isDark
                  ? const Color(0x1AFFE3D1) // warm highlight
                  : Colors.white.withValues(alpha: 0.3),
              width: 0.8,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.18 : 0.10),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. STANDARD CARD (warm off-white)
// ─────────────────────────────────────────────────────────────────────────────

class SocelleCard extends StatelessWidget {
  const SocelleCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(24),
    this.borderRadius,
    this.color,
    this.onTap,
  });

  final Widget child;
  final EdgeInsets padding;
  final BorderRadius? borderRadius;
  final Color? color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? SocelleRadius.card(context);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: SocelleAnimation.dSnap,
        padding: padding,
        decoration: BoxDecoration(
          color: color ?? SocelleColors.bgNearWhite,
          borderRadius: radius,
          border: Border.all(
            color: SocelleColors.neutralBeige.withValues(alpha: 0.2),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: child,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SECTION LABEL (eyebrow)
// ─────────────────────────────────────────────────────────────────────────────

class SocelleSectionLabel extends StatelessWidget {
  const SocelleSectionLabel(this.text, {super.key, this.color});

  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Text(
      text.toUpperCase(),
      style: SocelleText.labelUppercase.copyWith(
        color: color ?? SocelleColors.neutralBeige,
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. CHIP (category filter, specialty tag)
// ─────────────────────────────────────────────────────────────────────────────

class SocelleChip extends StatelessWidget {
  const SocelleChip({
    super.key,
    required this.label,
    this.isSelected = false,
    this.onTap,
    this.isDark = false,
  });

  final String label;
  final bool isSelected;
  final VoidCallback? onTap;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap?.call();
      },
      child: AnimatedContainer(
        duration: SocelleAnimation.dSnap,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? Colors.white.withValues(alpha: 0.2) : SocelleColors.primaryCocoa)
              : (isDark ? Colors.white.withValues(alpha: 0.05) : SocelleColors.glassLight),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? Colors.transparent
                : (isDark
                    ? Colors.white.withValues(alpha: 0.1)
                    : SocelleColors.neutralBeige.withValues(alpha: 0.3)),
            width: 0.8,
          ),
        ),
        child: Text(
          label,
          style: SocelleText.label.copyWith(
            fontSize: 14,
            color: isSelected
                ? (isDark ? Colors.white : SocelleColors.bgMain)
                : (isDark ? Colors.white.withValues(alpha: 0.7) : SocelleColors.primaryCocoa),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. NAV PILL BAR (horizontal pill navigation — Socelle nav style)
// ─────────────────────────────────────────────────────────────────────────────

class SocelleNavPill extends StatelessWidget {
  const SocelleNavPill({
    super.key,
    required this.items,
    required this.selectedIndex,
    required this.onTap,
  });

  final List<String> items;
  final int selectedIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(28),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: SocelleColors.glassLight,
            borderRadius: BorderRadius.circular(28),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < items.length; i++)
                GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    onTap(i);
                  },
                  child: AnimatedContainer(
                    duration: SocelleAnimation.dSnap,
                    padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
                    decoration: BoxDecoration(
                      color: i == selectedIndex
                          ? SocelleColors.primaryCocoa.withValues(alpha: 0.1)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Text(
                      items[i],
                      style: SocelleText.label.copyWith(
                        color: i == selectedIndex
                            ? SocelleColors.primaryCocoa
                            : SocelleColors.neutralBeige,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. SCAFFOLD WRAPPER (warm background + safe area)
// ─────────────────────────────────────────────────────────────────────────────

class SocelleScaffold extends StatelessWidget {
  const SocelleScaffold({
    super.key,
    required this.body,
    this.backgroundColor,
    this.isDark = false,
    this.appBar,
  });

  final Widget body;
  final Color? backgroundColor;
  final bool isDark;
  final PreferredSizeWidget? appBar;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor ??
          (isDark ? SocelleColors.deepCocoa : SocelleColors.bgMain),
      appBar: appBar,
      body: body,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. THEME DATA EXTENSION (for MaterialApp use)
// ─────────────────────────────────────────────────────────────────────────────

class SocelleTheme {
  SocelleTheme._();

  /// Light theme with Socelle design tokens.
  /// Use alongside existing SocelleTheme — apply SocelleTheme to new
  /// intelligence surfaces, keep SocelleTheme for gap-recovery surfaces.
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: SocelleColors.bgMain,
      fontFamily: 'Inter',
      splashFactory: NoSplash.splashFactory, // Socelle uses no ripple
      highlightColor: Colors.transparent,

      colorScheme: ColorScheme.fromSeed(
        seedColor: SocelleColors.primaryCocoa,
        primary: SocelleColors.primaryCocoa,
        onPrimary: SocelleColors.bgMain,
        secondary: SocelleColors.neutralBeige,
        surface: SocelleColors.bgMain,
        onSurface: SocelleColors.primaryCocoa,
      ),

      appBarTheme: const AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: SocelleColors.primaryCocoa,
        titleTextStyle: TextStyle(
          fontFamily: 'Inter',
          fontSize: 17,
          fontWeight: FontWeight.w500,
          color: SocelleColors.primaryCocoa,
        ),
      ),

      textTheme: const TextTheme(
        displayLarge: SocelleText.displayLarge,
        displayMedium: SocelleText.displayMedium,
        headlineLarge: SocelleText.headlineLarge,
        headlineMedium: SocelleText.headlineMedium,
        bodyLarge: SocelleText.bodyLarge,
        bodyMedium: SocelleText.bodyMedium,
        labelMedium: SocelleText.labelUppercase,
        labelLarge: SocelleText.buttonLabel,
      ),
    );
  }
}
