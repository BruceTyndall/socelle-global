import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/socelle_colors.dart';

/// Socelle primary design system button.
///
/// Variants:
/// - [SfButton.primary] — glamHeroGradient background, white text (main CTA)
/// - [SfButton.secondary] — white background, plum text (alternate action)
/// - [SfButton.ghost] — transparent, plum text + border (tertiary)
/// - [SfButton.destructive] — errorRed, white text (cancel/delete)
///
/// All variants share: 52px height, 14px border radius, labelLarge typography.
class SfButton extends StatefulWidget {
  const SfButton._({
    required this.label,
    required this.onPressed,
    required _SfButtonVariant variant,
    this.icon,
    this.loading = false,
    this.fullWidth = true,
    this.height = 52.0,
    this.semanticLabel,
    super.key,
  }) : _variant = variant;

  /// Primary CTA — glamHeroGradient background, white text.
  factory SfButton.primary({
    required String label,
    required VoidCallback? onPressed,
    IconData? icon,
    bool loading = false,
    bool fullWidth = true,
    double height = 52.0,
    String? semanticLabel,
    Key? key,
  }) =>
      SfButton._(
        label: label,
        onPressed: onPressed,
        variant: _SfButtonVariant.primary,
        icon: icon,
        loading: loading,
        fullWidth: fullWidth,
        height: height,
        semanticLabel: semanticLabel,
        key: key,
      );

  /// Secondary — white background, plum text.
  factory SfButton.secondary({
    required String label,
    required VoidCallback? onPressed,
    IconData? icon,
    bool loading = false,
    bool fullWidth = true,
    double height = 52.0,
    String? semanticLabel,
    Key? key,
  }) =>
      SfButton._(
        label: label,
        onPressed: onPressed,
        variant: _SfButtonVariant.secondary,
        icon: icon,
        loading: loading,
        fullWidth: fullWidth,
        height: height,
        semanticLabel: semanticLabel,
        key: key,
      );

  /// Ghost — transparent with plum border and text.
  factory SfButton.ghost({
    required String label,
    required VoidCallback? onPressed,
    IconData? icon,
    bool loading = false,
    bool fullWidth = true,
    double height = 52.0,
    String? semanticLabel,
    Key? key,
  }) =>
      SfButton._(
        label: label,
        onPressed: onPressed,
        variant: _SfButtonVariant.ghost,
        icon: icon,
        loading: loading,
        fullWidth: fullWidth,
        height: height,
        semanticLabel: semanticLabel,
        key: key,
      );

  /// Destructive — errorRed background, white text.
  factory SfButton.destructive({
    required String label,
    required VoidCallback? onPressed,
    IconData? icon,
    bool loading = false,
    bool fullWidth = true,
    double height = 52.0,
    String? semanticLabel,
    Key? key,
  }) =>
      SfButton._(
        label: label,
        onPressed: onPressed,
        variant: _SfButtonVariant.destructive,
        icon: icon,
        loading: loading,
        fullWidth: fullWidth,
        height: height,
        semanticLabel: semanticLabel,
        key: key,
      );

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool loading;
  final bool fullWidth;
  final double height;
  final String? semanticLabel;
  final _SfButtonVariant _variant;

  @override
  State<SfButton> createState() => _SfButtonState();
}

enum _SfButtonVariant { primary, secondary, ghost, destructive }

class _SfButtonState extends State<SfButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _scaleController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 80),
    lowerBound: 0.0,
    upperBound: 1.0,
    value: 1.0,
  );
  late final Animation<double> _scale = Tween<double>(
    begin: 0.97,
    end: 1.0,
  ).animate(CurvedAnimation(parent: _scaleController, curve: Curves.easeOut));

  bool get _enabled => widget.onPressed != null && !widget.loading;

  void _onTapDown(TapDownDetails _) {
    if (_enabled) {
      _scaleController.reverse();
      HapticFeedback.selectionClick();
    }
  }

  void _onTapUp(TapUpDetails _) {
    _scaleController.forward();
  }

  void _onTapCancel() {
    _scaleController.forward();
  }

  @override
  void dispose() {
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: widget.semanticLabel ?? widget.label,
      enabled: _enabled,
      child: ScaleTransition(
        scale: _scale,
        child: GestureDetector(
          onTapDown: _onTapDown,
          onTapUp: _onTapUp,
          onTapCancel: _onTapCancel,
          onTap: _enabled ? widget.onPressed : null,
          child: AnimatedOpacity(
            opacity: _enabled ? 1.0 : 0.5,
            duration: const Duration(milliseconds: 150),
            child: SizedBox(
              height: widget.height,
              width: widget.fullWidth ? double.infinity : null,
              child: _buildContent(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    switch (widget._variant) {
      case _SfButtonVariant.primary:
        return _GradientButton(
          label: widget.label,
          icon: widget.icon,
          loading: widget.loading,
        );
      case _SfButtonVariant.secondary:
        return _PlainButton(
          label: widget.label,
          icon: widget.icon,
          loading: widget.loading,
          background: SocelleColors.pureWhite,
          textColor: SocelleColors.glamPlum,
          border: Border.all(color: SocelleColors.glamPlum.withValues(alpha: 0.3)),
        );
      case _SfButtonVariant.ghost:
        return _PlainButton(
          label: widget.label,
          icon: widget.icon,
          loading: widget.loading,
          background: Colors.transparent,
          textColor: SocelleColors.glamPlum,
          border: Border.all(color: SocelleColors.glamPlum.withValues(alpha: 0.5)),
        );
      case _SfButtonVariant.destructive:
        return _PlainButton(
          label: widget.label,
          icon: widget.icon,
          loading: widget.loading,
          background: SocelleColors.errorRed,
          textColor: Colors.white,
        );
    }
  }
}

class _GradientButton extends StatelessWidget {
  const _GradientButton({
    required this.label,
    required this.icon,
    required this.loading,
  });

  final String label;
  final IconData? icon;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: SocelleColors.glamHeroGradient,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: SocelleColors.glamPlum.withValues(alpha: 0.25),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: _ButtonInner(label: label, icon: icon, loading: loading, textColor: Colors.white),
    );
  }
}

class _PlainButton extends StatelessWidget {
  const _PlainButton({
    required this.label,
    required this.icon,
    required this.loading,
    required this.background,
    required this.textColor,
    this.border,
  });

  final String label;
  final IconData? icon;
  final bool loading;
  final Color background;
  final Color textColor;
  final Border? border;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(14),
        border: border,
      ),
      child: _ButtonInner(label: label, icon: icon, loading: loading, textColor: textColor),
    );
  }
}

class _ButtonInner extends StatelessWidget {
  const _ButtonInner({
    required this.label,
    required this.icon,
    required this.loading,
    required this.textColor,
  });

  final String label;
  final IconData? icon;
  final bool loading;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: loading
          ? SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: textColor,
              ),
            )
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(icon, color: textColor, size: 18),
                  const SizedBox(width: 8),
                ],
                Text(
                  label,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.2,
                  ),
                ),
              ],
            ),
    );
  }
}
