// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE DESIGN SYSTEM — VISUAL QA SHOWCASE
// All components rendered for design review and regression verification.
// ═══════════════════════════════════════════════════════════════════════════
//
// This page is gated behind FeatureFlags.kEnableSocelleShowcase (default: false).
// It is never visible in production builds.
//
// To enable for local QA:
//   1. Set kEnableSocelleShowcase = true in core/feature_flags.dart
//   2. Navigate to this page from a debug menu or developer settings
//   3. Verify every component renders correctly
//   4. Reset kEnableSocelleShowcase = false before committing
//
// Components verified:
//   ✓ SocelleColors — 20 tokens
//   ✓ SocelleText — 9 styles
//   ✓ SocelleRadius — 4 responsive sizes
//   ✓ SocelleAnimation — curves/durations referenced
//   ✓ SocellePillButton — 45 combos (3 variants × 3 tones × 5 sizes)
//   ✓ SocelleGlassCard — light + dark
//   ✓ SocelleCard — default + tinted + tappable
//   ✓ SocelleChip — selected/unselected on light + dark
//   ✓ SocelleNavPill — interactive selection
//   ✓ SocelleSectionLabel — default + custom color
//   ✓ SocelleScaffold — used as page wrapper

import 'package:flutter/material.dart';
import 'package:socelle_mobile/core/feature_flags.dart';
import 'package:socelle_mobile/core/theme/socelle_design_system.dart';

/// Visual QA showcase for the Socelle Design System.
///
/// Gated behind [FeatureFlags.kEnableSocelleShowcase].
class SocelleShowcasePage extends StatefulWidget {
  const SocelleShowcasePage({super.key});

  @override
  State<SocelleShowcasePage> createState() => _SocelleShowcasePageState();
}

class _SocelleShowcasePageState extends State<SocelleShowcasePage> {
  // Interactive state for chip demos
  final List<bool> _chipsLight = [false, true, false, false, false];
  final List<bool> _chipsDark = [false, true, false];

  // Interactive state for nav pill demo
  int _navIndex = 0;

  static const _chipLabelsLight = ['All', 'Hair', 'Nails', 'Skin', 'Wellness'];
  static const _chipLabelsDark = ['Feed', 'Brands', 'Events'];
  static const _navLabels = ['Feed', 'Discover', 'Profile'];

  @override
  Widget build(BuildContext context) {
    // Gate: show locked state when flag is off
    if (!FeatureFlags.kEnableSocelleShowcase) {
      return Scaffold(
        backgroundColor: SocelleColors.bgMain,
        appBar: AppBar(
          title: const Text('Socelle Showcase'),
          backgroundColor: SocelleColors.bgMain,
          foregroundColor: SocelleColors.primaryCocoa,
          elevation: 0,
          scrolledUnderElevation: 0,
        ),
        body: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.lock_outline, size: 48, color: SocelleColors.neutralBeige),
              SizedBox(height: 16),
              Text('Showcase disabled', style: SocelleText.headlineMedium),
              SizedBox(height: 8),
              Text(
                'Set kEnableSocelleShowcase = true to view.',
                style: SocelleText.bodyMedium,
              ),
            ],
          ),
        ),
      );
    }

    return SocelleScaffold(
      appBar: AppBar(
        title: const Text('Socelle Design System'),
        backgroundColor: SocelleColors.bgMain,
        foregroundColor: SocelleColors.primaryCocoa,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(24, 32, 24, 80),
        children: [
          // ─── SECTION: Colors ──────────────────────────────────────────────
          const _ShowcaseDivider(label: 'Color Tokens — 20 values'),
          const SizedBox(height: 16),
          const _ColorSwatch(label: 'primaryCocoa', color: SocelleColors.primaryCocoa),
          const _ColorSwatch(label: 'deepCocoa', color: SocelleColors.deepCocoa),
          const _ColorSwatch(label: 'neutralBeige', color: SocelleColors.neutralBeige),
          const _ColorSwatch(label: 'bgMain', color: SocelleColors.bgMain),
          const _ColorSwatch(label: 'bgAlt', color: SocelleColors.bgAlt),
          const _ColorSwatch(label: 'bgNearWhite', color: SocelleColors.bgNearWhite),
          const _ColorSwatch(label: 'red400', color: SocelleColors.red400),
          const _ColorSwatch(label: 'orange400', color: SocelleColors.orange400),
          const _ColorSwatch(label: 'orange700', color: SocelleColors.orange700),
          const _ColorSwatch(label: 'yellow400', color: SocelleColors.yellow400),
          const _ColorSwatch(label: 'green400', color: SocelleColors.green400),
          const _ColorSwatch(label: 'green600', color: SocelleColors.green600),
          const _ColorSwatch(label: 'green900', color: SocelleColors.green900),
          const _ColorSwatch(label: 'teal400', color: SocelleColors.teal400),
          const _ColorSwatch(label: 'blue400', color: SocelleColors.blue400),
          const _ColorSwatch(label: 'purple400', color: SocelleColors.purple400),
          const _ColorSwatch(label: 'glassLight', color: SocelleColors.glassLight),
          const _ColorSwatch(label: 'glassDark', color: SocelleColors.glassDark),
          const _ColorSwatch(label: 'glassWhite', color: SocelleColors.glassWhite),
          const _ColorSwatch(label: 'glassDarkBg', color: SocelleColors.glassDarkBg),
          const SizedBox(height: 40),

          // ─── SECTION: Typography ──────────────────────────────────────────
          const _ShowcaseDivider(label: 'Typography — 9 styles'),
          const SizedBox(height: 16),
          const Text('Display Large — 48px w300', style: SocelleText.displayLarge),
          const SizedBox(height: 12),
          const Text('Display Medium — 32px w300', style: SocelleText.displayMedium),
          const SizedBox(height: 12),
          const Text('Headline Large — 24px w300', style: SocelleText.headlineLarge),
          const SizedBox(height: 12),
          const Text('Headline Medium — 20px w400', style: SocelleText.headlineMedium),
          const SizedBox(height: 12),
          const Text('Body Large — 16px w400', style: SocelleText.bodyLarge),
          const SizedBox(height: 8),
          const Text('Body Medium — 14px w400 muted', style: SocelleText.bodyMedium),
          const SizedBox(height: 8),
          const Text('Label — 13.8px w500', style: SocelleText.label),
          const SizedBox(height: 8),
          const Text('LABEL UPPERCASE — 13.8px w500 beige', style: SocelleText.labelUppercase),
          const SizedBox(height: 8),
          const Text('Button Label — 16px w500', style: SocelleText.buttonLabel),
          const SizedBox(height: 40),

          // ─── SECTION: Pill Buttons (45 combinations) ─────────────────────
          const _ShowcaseDivider(label: 'Pill Buttons — 45 combos (3 variant × 3 tone × 5 size)'),
          const SizedBox(height: 16),

          // extraLarge
          const _PillSizeSection(size: PillSize.extraLarge),
          const SizedBox(height: 20),
          // large
          const _PillSizeSection(size: PillSize.large),
          const SizedBox(height: 20),
          // betweenLargeAndMedium
          const _PillSizeSection(size: PillSize.betweenLargeAndMedium),
          const SizedBox(height: 20),
          // medium
          const _PillSizeSection(size: PillSize.medium),
          const SizedBox(height: 20),
          // small
          const _PillSizeSection(size: PillSize.small),
          const SizedBox(height: 40),

          // ─── SECTION: Glass Cards ─────────────────────────────────────────
          const _ShowcaseDivider(label: 'Glass Cards — light + dark'),
          const SizedBox(height: 16),

          // Light glass card on warm background
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: SocelleColors.bgAlt,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const SocelleGlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Glass Card — Light', style: SocelleText.headlineMedium),
                  SizedBox(height: 4),
                  Text(
                    'Backdrop blur on warm off-white background.',
                    style: SocelleText.bodyMedium,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Dark glass card on deep cocoa background
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: SocelleColors.deepCocoa,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const SocelleGlassCard(
              isDark: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Glass Card — Dark',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 20,
                      fontWeight: FontWeight.w400,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Backdrop blur on deep cocoa background.',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: SocelleColors.textOnDarkMuted,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 40),

          // ─── SECTION: Standard Cards ──────────────────────────────────────
          const _ShowcaseDivider(label: 'Standard Cards'),
          const SizedBox(height: 16),
          const SocelleCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Standard Card', style: SocelleText.headlineMedium),
                SizedBox(height: 6),
                Text(
                  'Warm near-white background with subtle border and shadow.',
                  style: SocelleText.bodyMedium,
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SocelleCard(
            color: SocelleColors.bgAlt,
            onTap: () {},
            child: const Text('Tappable Card — bgAlt', style: SocelleText.bodyLarge),
          ),
          const SizedBox(height: 40),

          // ─── SECTION: Chips ───────────────────────────────────────────────
          const _ShowcaseDivider(label: 'Chips — light + dark, selected/unselected'),
          const SizedBox(height: 16),

          // Light chips
          const SocelleSectionLabel('Light background'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (var i = 0; i < _chipLabelsLight.length; i++)
                SocelleChip(
                  label: _chipLabelsLight[i],
                  isSelected: _chipsLight[i],
                  onTap: () => setState(() => _chipsLight[i] = !_chipsLight[i]),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // Dark chips
          const SocelleSectionLabel('Dark background'),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: SocelleColors.deepCocoa,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (var i = 0; i < _chipLabelsDark.length; i++)
                  SocelleChip(
                    label: _chipLabelsDark[i],
                    isDark: true,
                    isSelected: _chipsDark[i],
                    onTap: () => setState(() => _chipsDark[i] = !_chipsDark[i]),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 40),

          // ─── SECTION: Nav Pill ────────────────────────────────────────────
          const _ShowcaseDivider(label: 'Nav Pill Bar — horizontal selection'),
          const SizedBox(height: 16),
          Center(
            child: SocelleNavPill(
              items: _navLabels,
              selectedIndex: _navIndex,
              onTap: (i) => setState(() => _navIndex = i),
            ),
          ),
          const SizedBox(height: 40),

          // ─── SECTION: Section Labels ──────────────────────────────────────
          const _ShowcaseDivider(label: 'Section Labels (Eyebrow text)'),
          const SizedBox(height: 16),
          const SocelleSectionLabel('Intelligence Feed'),
          const SizedBox(height: 8),
          const SocelleSectionLabel('Discover'),
          const SizedBox(height: 8),
          const SocelleSectionLabel('Custom Color', color: SocelleColors.orange400),
          const SizedBox(height: 40),

          // ─── SECTION: Border Radius ───────────────────────────────────────
          const _ShowcaseDivider(label: 'Border Radius — responsive (mobile < 600dp, tablet ≥ 600dp)'),
          const SizedBox(height: 16),
          _RadiusSwatch(label: 'small', radius: SocelleRadius.small(context)),
          _RadiusSwatch(label: 'medium', radius: SocelleRadius.medium(context)),
          _RadiusSwatch(label: 'large', radius: SocelleRadius.large(context)),
          _RadiusSwatch(label: 'card', radius: SocelleRadius.card(context)),
          _RadiusSwatch(
            label: 'pill (height=48)',
            radius: SocelleRadius.pill(48),
          ),
          const SizedBox(height: 40),

          // ─── SECTION: Animation Tokens ────────────────────────────────────
          const _ShowcaseDivider(label: 'Animation Tokens (reference)'),
          const SizedBox(height: 16),
          const _AnimationTokenRow(name: 'SocelleAnimation.snap', value: 'linear — 200ms — state changes'),
          const _AnimationTokenRow(name: 'SocelleAnimation.cinematic', value: 'Cubic(0.75,0,0.25,1) — 1200ms — scroll reveals'),
          const _AnimationTokenRow(name: 'SocelleAnimation.standard', value: 'Cubic(0.4,0,0.2,1) — 800ms — default'),
          const _AnimationTokenRow(name: 'SocelleAnimation.dFill', value: '100ms — fill micro-interactions'),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Private showcase helper widgets
// ─────────────────────────────────────────────────────────────────────────────

/// Divider with uppercase section label for the showcase.
class _ShowcaseDivider extends StatelessWidget {
  const _ShowcaseDivider({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Divider(height: 1, thickness: 1, color: Color(0x1AAC9B98)),
        const SizedBox(height: 10),
        Text(
          label.toUpperCase(),
          style: SocelleText.labelUppercase.copyWith(fontSize: 11),
        ),
      ],
    );
  }
}

/// Color token swatch row.
class _ColorSwatch extends StatelessWidget {
  const _ColorSwatch({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 26,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: const Color(0x22AC9B98),
                width: 0.5,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Text(label, style: SocelleText.label),
        ],
      ),
    );
  }
}

/// Border radius visual swatch.
class _RadiusSwatch extends StatelessWidget {
  const _RadiusSwatch({required this.label, required this.radius});

  final String label;
  final BorderRadius radius;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            width: 80,
            height: 40,
            decoration: BoxDecoration(
              color: SocelleColors.bgAlt,
              borderRadius: radius,
              border: Border.all(color: const Color(0x3347201C), width: 0.8),
            ),
          ),
          const SizedBox(width: 16),
          Text('SocelleRadius.$label', style: SocelleText.label),
        ],
      ),
    );
  }
}

/// Animation token reference row.
class _AnimationTokenRow extends StatelessWidget {
  const _AnimationTokenRow({required this.name, required this.value});

  final String name;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(name, style: SocelleText.label),
          const SizedBox(height: 2),
          Text(value, style: SocelleText.bodyMedium),
        ],
      ),
    );
  }
}

/// Pill button section for a single size — shows all 9 variant×tone combos.
class _PillSizeSection extends StatelessWidget {
  const _PillSizeSection({required this.size});

  final PillSize size;

  String get _sizeLabel {
    return switch (size) {
      PillSize.extraLarge => 'extraLarge (80px)',
      PillSize.large => 'large (60px)',
      PillSize.betweenLargeAndMedium => 'betweenLargeAndMedium (56px)',
      PillSize.medium => 'medium (48px)',
      PillSize.small => 'small (40px)',
    };
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(_sizeLabel, style: SocelleText.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        // primary row
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final tone in PillTone.values) ...[
                SocellePillButton(
                  label: 'primary·${tone.name}',
                  variant: PillVariant.primary,
                  tone: tone,
                  size: size,
                  onTap: () {},
                ),
                const SizedBox(width: 8),
              ],
            ],
          ),
        ),
        const SizedBox(height: 4),
        // secondary row
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final tone in PillTone.values) ...[
                SocellePillButton(
                  label: 'secondary·${tone.name}',
                  variant: PillVariant.secondary,
                  tone: tone,
                  size: size,
                  onTap: () {},
                ),
                const SizedBox(width: 8),
              ],
            ],
          ),
        ),
        const SizedBox(height: 4),
        // tertiary row
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final tone in PillTone.values) ...[
                SocellePillButton(
                  label: 'tertiary·${tone.name}',
                  variant: PillVariant.tertiary,
                  tone: tone,
                  size: size,
                  onTap: () {},
                ),
                const SizedBox(width: 8),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
