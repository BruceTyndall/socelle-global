import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/slotforce_colors.dart';

class LeakageHero extends StatelessWidget {
  const LeakageHero({
    super.key,
    required this.weeklyLeakage,
    required this.bookableSlots,
    required this.gapCount,
  });

  final double weeklyLeakage;
  final int bookableSlots;
  final int gapCount;

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 0,
    );

    final isZero = weeklyLeakage <= 0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isZero
              ? SlotforceColors.heroRecoveredGradient
              : SlotforceColors.glamHeroGradientColors,
        ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isZero
              ? SlotforceColors.recoveredGreen.withValues(alpha: 0.25)
              : SlotforceColors.glamGold.withValues(alpha: 0.44),
        ),
        boxShadow: [
          BoxShadow(
            color: (isZero
                    ? SlotforceColors.recoveredGreen
                    : SlotforceColors.glamPlum)
                .withValues(alpha: 0.25),
            blurRadius: 32,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            top: -26,
            right: -14,
            child: _GlowBubble(
              color: isZero
                  ? SlotforceColors.recoveredGreen
                  : SlotforceColors.leakageRed,
              size: 92,
            ),
          ),
          Positioned(
            bottom: -34,
            left: -12,
            child: _GlowBubble(
              color: isZero
                  ? SlotforceColors.primaryLight
                  : SlotforceColors.accentCoral,
              size: 86,
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _HeaderPill(
                    icon: isZero
                        ? Icons.check_circle_rounded
                        : Icons.whatshot_rounded,
                    label: isZero ? 'Booked & Dangerous' : 'Schedule Tease',
                    tone: isZero
                        ? SlotforceColors.recoveredGreenDark
                        : Colors.white,
                  ),
                  if (!isZero) ...[
                    const SizedBox(width: 8),
                    const _HeaderPill(
                      icon: Icons.auto_awesome_rounded,
                      label: 'Main Character',
                      tone: Colors.white,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 14),
              if (isZero) ...[
                Text(
                  'Booked out.',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: SlotforceColors.recoveredGreenDark,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  'No empty-chair drama this week. Keep serving looks and stacking tips.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: SlotforceColors.recoveredGreenDark
                            .withValues(alpha: 0.75),
                      ),
                ),
              ] else ...[
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: weeklyLeakage),
                  duration: const Duration(milliseconds: 1400),
                  curve: Curves.easeOutCubic,
                  builder: (context, value, _) {
                    return Text(
                      currencyFormat.format(value),
                      style:
                          Theme.of(context).textTheme.displayMedium?.copyWith(
                                color: Colors.white,
                              ),
                    );
                  },
                ),
                const SizedBox(height: 2),
                Text(
                  'still teasing your calendar this week',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.9),
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _MetricPill(
                      label: '$bookableSlots bookable slots',
                      icon: Icons.event_available_rounded,
                      color: SlotforceColors.glamInk,
                    ),
                    _MetricPill(
                      label: '$gapCount open gaps',
                      icon: Icons.grid_view_rounded,
                      color: SlotforceColors.glamPlum,
                    ),
                  ],
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _GlowBubble extends StatelessWidget {
  const _GlowBubble({required this.color, required this.size});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [
              color.withValues(alpha: 0.2),
              color.withValues(alpha: 0),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderPill extends StatelessWidget {
  const _HeaderPill({
    required this.icon,
    required this.label,
    required this.tone,
  });

  final IconData icon;
  final String label;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: tone == Colors.white
            ? Colors.white.withValues(alpha: 0.16)
            : Colors.white.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: tone == Colors.white
              ? Colors.white.withValues(alpha: 0.35)
              : tone.withValues(alpha: 0.15),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: tone),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: tone,
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _MetricPill extends StatelessWidget {
  const _MetricPill({
    required this.label,
    required this.icon,
    required this.color,
  });

  final String label;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.84),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.24)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}
