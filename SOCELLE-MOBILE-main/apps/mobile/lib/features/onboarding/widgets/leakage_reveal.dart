import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/socelle_colors.dart';

class LeakageReveal extends StatefulWidget {
  const LeakageReveal({
    super.key,
    required this.leakageAmount,
    required this.gapCount,
    required this.onContinue,
  });

  final double leakageAmount;
  final int gapCount;
  final VoidCallback onContinue;

  @override
  State<LeakageReveal> createState() => _LeakageRevealState();
}

class _LeakageRevealState extends State<LeakageReveal>
    with TickerProviderStateMixin {
  late final AnimationController _fadeController;
  late final AnimationController _countController;
  late final Animation<double> _fadeIn;
  late final Animation<double> _countUp;
  bool _showButton = false;

  final _currencyFormat = NumberFormat.currency(
    symbol: '\$',
    decimalDigits: 0,
  );

  @override
  void initState() {
    super.initState();

    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeIn = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeIn,
    );

    _countController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _countUp = CurvedAnimation(
      parent: _countController,
      curve: Curves.easeOutCubic,
    );

    _startSequence();
  }

  Future<void> _startSequence() async {
    await Future.delayed(const Duration(milliseconds: 300));
    _fadeController.forward();
    await Future.delayed(const Duration(milliseconds: 600));
    _countController.forward();
    HapticFeedback.heavyImpact();
    await Future.delayed(const Duration(milliseconds: 2000));
    if (mounted) {
      setState(() => _showButton = true);
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _countController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Warm editorial ink — Chanel noir, not cold navy
      backgroundColor: SocelleColors.glamInk,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 36),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(flex: 2),
              // Thin gold rule — editorial divider
              FadeTransition(
                opacity: _fadeIn,
                child: Container(
                  width: 40,
                  height: 1,
                  color: SocelleColors.accentGold.withValues(alpha: 0.5),
                ),
              ),
              const SizedBox(height: 28),
              FadeTransition(
                opacity: _fadeIn,
                child: Text(
                  'This week, you left',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: 17,
                        fontWeight: FontWeight.w400,
                        letterSpacing: 0.3,
                      ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),
              // Champagne gold dollar figure — luxury editorial, not alarming
              AnimatedBuilder(
                animation: _countUp,
                builder: (context, _) {
                  final value = _countUp.value * widget.leakageAmount;
                  return Text(
                    _currencyFormat.format(value),
                    style: const TextStyle(
                      fontFamily: 'Avenir Next',
                      fontSize: 72,
                      fontWeight: FontWeight.w900,
                      color: SocelleColors.accentGold,
                      height: 1.0,
                      letterSpacing: -2.5,
                    ),
                    textAlign: TextAlign.center,
                  );
                },
              ),
              const SizedBox(height: 18),
              FadeTransition(
                opacity: _fadeIn,
                child: Text(
                  'on your calendar',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: 17,
                        fontWeight: FontWeight.w400,
                        letterSpacing: 0.3,
                      ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 28),
              // Thin gold rule
              FadeTransition(
                opacity: _fadeIn,
                child: Container(
                  width: 40,
                  height: 1,
                  color: SocelleColors.accentGold.withValues(alpha: 0.5),
                ),
              ),
              const SizedBox(height: 24),
              FadeTransition(
                opacity: _fadeIn,
                child: Text(
                  '${widget.gapCount} gaps with bookable slots went unfilled',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.3),
                        fontSize: 13,
                        letterSpacing: 0.2,
                      ),
                  textAlign: TextAlign.center,
                ),
              ),
              const Spacer(flex: 2),
              // Gold-outlined CTA — Chanel refinement
              AnimatedOpacity(
                opacity: _showButton ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 600),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _showButton ? widget.onContinue : null,
                    style: FilledButton.styleFrom(
                      backgroundColor: SocelleColors.accentGold,
                      foregroundColor: SocelleColors.glamInk,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      "Let's fix that",
                      style: TextStyle(
                        fontFamily: 'Avenir Next',
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 52),
            ],
          ),
        ),
      ),
    );
  }
}
