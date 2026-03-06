import 'package:flutter/material.dart';

/// SLOTFORCE Color System — Goop × Chanel Edition
///
/// Goop: warm ivory surfaces, organic warmth, muted sage, generous space
/// Chanel: near-black editorial ink, champagne gold, typographic precision
class SlotforceColors {
  SlotforceColors._();

  // ── Primary brand — Chanel editorial ink ───────────────────────────────
  static const primary = Color(0xFF1A1714);       // warm near-black
  static const primaryDark = Color(0xFF0D0C0A);   // deepest ink
  static const primaryLight = Color(0xFFD4C5AE);  // warm cashmere

  // ── Gold accent — champagne / Chanel jewelry ───────────────────────────
  static const accentGold = Color(0xFFC5A265);       // champagne gold
  static const accentGoldLight = Color(0xFFF5ECD8);  // gold wash
  static const accentGoldDark = Color(0xFF8C6B3A);   // deep burnished gold

  // ── Sage — Goop wellness green ─────────────────────────────────────────
  static const accentSage = Color(0xFF7A9A78);       // muted sage
  static const accentSageLight = Color(0xFFEAF2E8);  // sage mist

  // ── Remaining accent roles (muted, refined) ────────────────────────────
  static const accentBlue = Color(0xFF4A6FA5);   // Chanel navy
  static const accentCoral = Color(0xFFC47A5A);  // Goop terracotta
  static const accentSun = Color(0xFFC5A265);    // aliases gold
  static const accentRose = Color(0xFFD4A5A0);   // dusty rose

  // ── Glam palette — Chanel noir × bordeaux × gold ──────────────────────
  static const glamPink = Color(0xFF8C4A6E);    // deep plum rose
  static const glamPlum = Color(0xFF3D1F36);    // bordeaux noir
  static const glamGold = Color(0xFFC5A265);    // champagne gold
  static const glamInk = Color(0xFF1A1714);     // warm editorial black

  // ── Leakage — muted terracotta (urgent but refined, not alarming) ──────
  static const leakageRed = Color(0xFFA85038);       // deep terracotta clay
  static const leakageRedLight = Color(0xFFFAEDE8);  // terracotta wash
  static const leakageRedDark = Color(0xFF7A3020);   // fired clay

  // ── Recovered — sage green (confident, natural) ────────────────────────
  static const recoveredGreen = Color(0xFF5A8A6A);        // sage green
  static const recoveredGreenLight = Color(0xFFEAF2EC);   // sage mist
  static const recoveredGreenDark = Color(0xFF3A6B4A);    // forest

  // ── Neutrals — warm ivory system (Goop) ───────────────────────────────
  static const surface = Color(0xFFF5F0E8);         // warm ivory
  static const surfaceSoft = Color(0xFFFAF8F3);     // near-white ivory
  static const cardBackground = Color(0xFFFFFFFF);  // crisp white
  static const textPrimary = Color(0xFF1A1714);     // warm near-black
  static const textSecondary = Color(0xFF6B6059);   // warm brown-gray
  static const textMuted = Color(0xFFA89F98);       // warm stone
  static const divider = Color(0xFFE8E1D9);         // warm parchment line
  static const border = Color(0xFFD9D0C5);          // warm border

  // ── Intentional / neutral states ──────────────────────────────────────
  static const intentionalAmber = Color(0xFFC49A3A);
  static const intentionalAmberLight = Color(0xFFFAF0DC);

  // ── Streak ─────────────────────────────────────────────────────────────
  static const streakOrange = Color(0xFFC5703A);  // warm amber-orange

  // ── Trial urgency ──────────────────────────────────────────────────────
  static const trialAmber = Color(0xFFC49A3A);
  static const trialRed = Color(0xFFA85038);

  // ── Gradients ──────────────────────────────────────────────────────────

  /// Hero leakage card — soft warm blush ivory
  static const heroLeakageGradient = <Color>[
    Color(0xFFFAEDE8),
    Color(0xFFF2D9CC),
  ];

  /// Hero recovered card — soft sage mist
  static const heroRecoveredGradient = <Color>[
    Color(0xFFEAF2EC),
    Color(0xFFCCE5D5),
  ];

  /// Paywall — editorial ink to champagne gold (Chanel)
  static const paywallGradient = <Color>[
    Color(0xFF1A1714),
    Color(0xFF2D2318),
    Color(0xFFC5A265),
  ];

  /// Atmospheric background wash — warm ivory
  static const atmosphericWash = <Color>[
    Color(0xFFFAF8F3),
    Color(0xFFF0EBE0),
  ];

  /// Dashboard header — ivory fade
  static const dashboardTopGradient = <Color>[
    Color(0xFFFAF8F3),
    Color(0xFFF5F0E8),
  ];

  /// Action card gradient — deep warm black
  static const actionGradient = <Color>[
    Color(0xFF1A1714),
    Color(0xFF2D2318),
    Color(0xFF1A1714),
  ];

  // ── Design system aliases ──────────────────────────────────────────────
  /// Pure white surface — alias for cardBackground.
  static const pureWhite = cardBackground;

  /// App background — warm off-white.
  static const creamBackground = surfaceSoft;

  /// Slate grey for inactive / muted UI.
  static const slateGrey = textMuted;

  /// Light grey for dividers and chip backgrounds.
  static const lightGrey = divider;

  /// Error / urgency red — mapped to leakageRedDark for contrast.
  static const errorRed = Color(0xFFC62828);

  /// Success / recovered green.
  static const successGreen = recoveredGreenDark;

  /// Champagne gold alias.
  static const champagneGold = accentGold;

  /// Bordeaux alias.
  static const bordeaux = glamPink;

  // ── Gradient objects (LinearGradient ready to use in BoxDecoration) ───

  /// Glam hero — bordeaux noir to champagne gold (Chanel)
  static const glamHeroGradientColors = <Color>[
    Color(0xFF2D1525),
    Color(0xFF5A2840),
    Color(0xFFC5A265),
  ];

  /// LinearGradient version of glamHeroGradient for use in BoxDecoration.
  static const glamHeroGradient = LinearGradient(
    colors: [
      Color(0xFF2D1525),
      Color(0xFF5A2840),
      Color(0xFFC5A265),
    ],
    stops: [0.0, 0.55, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Glam card — white to warm ivory
  static const glamCardGradient = <Color>[
    Color(0xFFFFFFFF),
    Color(0xFFFAF5EE),
  ];
}
