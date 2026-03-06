import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../../services/analytics_service.dart';

/// Shown after a gap is marked as filled.
///
/// Sequence:
/// 1. Distinct haptic pattern (heavy → 200ms → medium) — unique to recovery events
/// 2. Dollar counter animation 0 → recoveredAmount over 800ms
/// 3. Copy: "You recovered $X. Your week is $X stronger."
/// 4. Auto-dismiss after 2.5s or on tap → returns to caller (dashboard updates)
///
/// This screen ONLY appears for genuine fills — never for intentional gaps.
class RecoveryConfirmationScreen extends StatefulWidget {
  const RecoveryConfirmationScreen({
    super.key,
    required this.gapId,
    required this.recoveredAmount,
    required this.streakDay,
  });

  final String gapId;
  final double recoveredAmount;
  final int streakDay;

  @override
  State<RecoveryConfirmationScreen> createState() =>
      _RecoveryConfirmationScreenState();
}

class _RecoveryConfirmationScreenState
    extends State<RecoveryConfirmationScreen>
    with SingleTickerProviderStateMixin {

  late final AnimationController _controller;
  late final Animation<double> _counterAnimation;
  late final Animation<double> _slideAnimation;
  late final Animation<double> _fadeAnimation;

  Timer? _autoDismissTimer;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      duration: const Duration(milliseconds: 900),
      vsync: this,
    );

    _counterAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.9, curve: Curves.easeOut),
    );

    _slideAnimation = Tween<double>(begin: 20, end: 0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
      ),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.5, curve: Curves.easeIn),
    );

    _fireHapticAndAnimate();
    _scheduleAutoDismiss();
    _fireAnalytics();
  }

  Future<void> _fireHapticAndAnimate() async {
    // Unique haptic pattern for recovery — not used anywhere else in the app
    await HapticFeedback.heavyImpact();
    await Future.delayed(const Duration(milliseconds: 200));
    if (mounted) {
      await HapticFeedback.mediumImpact();
      _controller.forward();
    }
  }

  void _scheduleAutoDismiss() {
    _autoDismissTimer = Timer(const Duration(milliseconds: 2500), () {
      if (mounted) _dismiss();
    });
  }

  void _dismiss() {
    _autoDismissTimer?.cancel();
    if (mounted) Navigator.of(context).pop();
  }

  Future<void> _fireAnalytics() async {
    await AnalyticsService.recoveryConfirmed(
      widget.gapId,
      widget.recoveredAmount,
      widget.streakDay,
    );
  }

  @override
  void dispose() {
    _autoDismissTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final reduceMotion = MediaQuery.of(context).disableAnimations;

    return GestureDetector(
      onTap: _dismiss,
      behavior: HitTestBehavior.opaque,
      child: Scaffold(
        backgroundColor: Colors.black.withValues(alpha: 0.85),
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: reduceMotion
                  // Accessible: static version without animation
                  ? _StaticRecoveryContent(
                      recoveredAmount: widget.recoveredAmount,
                      currencyFormat: currencyFormat,
                    )
                  : AnimatedBuilder(
                      animation: _controller,
                      builder: (context, _) {
                        final displayAmount =
                            widget.recoveredAmount * _counterAnimation.value;

                        return Transform.translate(
                          offset: Offset(0, _slideAnimation.value),
                          child: Opacity(
                            opacity: _fadeAnimation.value.clamp(0.0, 1.0),
                            child: _RecoveryContent(
                              displayAmount: displayAmount,
                              recoveredAmount: widget.recoveredAmount,
                              currencyFormat: currencyFormat,
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RecoveryContent extends StatelessWidget {
  const _RecoveryContent({
    required this.displayAmount,
    required this.recoveredAmount,
    required this.currencyFormat,
  });

  final double displayAmount;
  final double recoveredAmount;
  final NumberFormat currencyFormat;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Dollar amount (animated counter)
        Text(
          currencyFormat.format(displayAmount),
          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 72,
              ),
        ),
        const SizedBox(height: 16),
        // Attribution copy — credit to provider, not the app
        Text(
          'You recovered ${currencyFormat.format(recoveredAmount)}.',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'Your week is ${currencyFormat.format(recoveredAmount)} stronger.',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.white70,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        Text(
          'Tap anywhere to continue',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.white38,
              ),
        ),
      ],
    );
  }
}

class _StaticRecoveryContent extends StatelessWidget {
  const _StaticRecoveryContent({
    required this.recoveredAmount,
    required this.currencyFormat,
  });

  final double recoveredAmount;
  final NumberFormat currencyFormat;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          currencyFormat.format(recoveredAmount),
          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 72,
              ),
        ),
        const SizedBox(height: 16),
        Text(
          'You recovered ${currencyFormat.format(recoveredAmount)}. '
          'Your week is ${currencyFormat.format(recoveredAmount)} stronger.',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.white,
              ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
