import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/theme/socelle_colors.dart';
import '../../models/ai_suggestion.dart';
import '../../models/revenue_summary.dart';
import '../../providers/navigation_provider.dart';
import '../../providers/revenue_providers.dart';
import '../../providers/sync_provider.dart';

/// Revenue Reveal Screen — the product.
///
/// Above the fold: monthly leakage number (dominates 35-45% of viewport),
/// supporting sentence, highest value window card, AI suggestion card,
/// primary CTA.
///
/// Nothing else. No dashboard clutter. No charts. No insights feed.
class RevenuePage extends ConsumerWidget {
  const RevenuePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncState = ref.watch(syncResultProvider);

    return syncState.when(
      data: (_) => _RevenueContent(ref: ref),
      loading: () => const _RevenueSkeleton(),
      error: (_, __) => const _RevenueEmptyState(),
    );
  }
}

// ─── MAIN CONTENT ────────────────────────────────────────────────────────────

class _RevenueContent extends StatelessWidget {
  const _RevenueContent({required this.ref});

  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final summary = ref.watch(monthlyLeakageProvider);
    final suggestion = ref.watch(aiSuggestionProvider).valueOrNull;

    if (!summary.hasData) return const _RevenueEmptyState();

    return SingleChildScrollView(
      physics: const ClampingScrollPhysics(),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 56),

              // ── Leakage Hero ──
              _LeakageHero(summary: summary),

              const SizedBox(height: 32),

              // ── Highest Value Window ──
              if (summary.highestValueWindow != null) ...[
                Text(
                  'Highest Value Window',
                  style: Theme.of(context).textTheme.labelMedium,
                ),
                const SizedBox(height: 8),
                _HighestValueCard(window: summary.highestValueWindow!),
                const SizedBox(height: 20),
              ],

              // ── AI Recovery Suggestion ──
              if (suggestion != null) ...[
                Text(
                  'Recovery Action',
                  style: Theme.of(context).textTheme.labelMedium,
                ),
                const SizedBox(height: 8),
                _AiSuggestionCard(suggestion: suggestion),
                const SizedBox(height: 32),
              ],

              // ── Primary CTA ──
              _ReviewGapsCta(
                onPressed: () {
                  // Navigate to Schedule tab (index 1 in 3-tab layout)
                  ref.read(navigationIndexProvider.notifier).state = 1;
                },
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── LEAKAGE HERO ────────────────────────────────────────────────────────────

class _LeakageHero extends StatelessWidget {
  const _LeakageHero({required this.summary});

  final MonthlyLeakageSummary summary;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        Text(
          'Last 30 days',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: SocelleColors.inkMuted,
                fontSize: 14,
              ),
        ),
        const SizedBox(height: 4),

        // Revenue number — dominates viewport
        _AnimatedLeakageCounter(value: summary.totalLeakageUsd),

        const SizedBox(height: 6),

        // Supporting sentence
        _SupportingSentence(summary: summary),
      ],
    );
  }
}

// ─── ANIMATED LEAKAGE COUNTER ────────────────────────────────────────────────

class _AnimatedLeakageCounter extends StatefulWidget {
  const _AnimatedLeakageCounter({required this.value});

  final double value;

  @override
  State<_AnimatedLeakageCounter> createState() =>
      _AnimatedLeakageCounterState();
}

class _AnimatedLeakageCounterState extends State<_AnimatedLeakageCounter>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;
  bool _hasAnimated = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _animation = Tween<double>(begin: 0, end: widget.value).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );

    // Animate once on first load. Does NOT replay on tab switch.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_hasAnimated) {
        _controller.forward();
        _hasAnimated = true;
      }
    });
  }

  @override
  void didUpdateWidget(_AnimatedLeakageCounter oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If value changes on re-sync: instant update, no animation.
    if (oldWidget.value != widget.value && _hasAnimated) {
      _controller.stop();
      _animation = Tween<double>(begin: widget.value, end: widget.value)
          .animate(_controller);
      setState(() {});
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, _) {
        return Text(
          formatter.format(_animation.value),
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 48,
            fontWeight: FontWeight.w600,
            color: SocelleColors.ink,
            height: 1.0,
            letterSpacing: -1.5,
          ),
        );
      },
    );
  }
}

// ─── SUPPORTING SENTENCE ─────────────────────────────────────────────────────

class _SupportingSentence extends StatelessWidget {
  const _SupportingSentence({required this.summary});

  final MonthlyLeakageSummary summary;

  @override
  Widget build(BuildContext context) {
    // Suppress clauses that would show 0 values.
    final parts = <String>[];
    if (summary.totalOpenHours > 0) {
      final hours = summary.totalOpenHours.toStringAsFixed(
        summary.totalOpenHours == summary.totalOpenHours.roundToDouble()
            ? 0
            : 1,
      );
      parts.add('$hours open hours');
    }
    if (summary.totalGapDays > 0) {
      parts.add('${summary.totalGapDays} days');
    }

    if (parts.isEmpty) return const SizedBox.shrink();

    return Text(
      'from ${parts.join(' across ')}',
      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: SocelleColors.inkMuted,
            fontSize: 15,
          ),
    );
  }
}

// ─── HIGHEST VALUE WINDOW CARD ───────────────────────────────────────────────

class _HighestValueCard extends StatelessWidget {
  const _HighestValueCard({required this.window});

  final HighestValueWindow window;

  @override
  Widget build(BuildContext context) {
    final valueFormatted =
        NumberFormat.currency(symbol: '\$', decimalDigits: 0)
            .format(window.estimatedValue);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SocelleColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SocelleColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${window.dayOfWeek}  ·  ${window.startTime} – ${window.endTime}',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            '$valueFormatted estimated per week',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: SocelleColors.leakage,
                  fontWeight: FontWeight.w500,
                ),
          ),
          if (window.fillProbability != null) ...[
            const SizedBox(height: 4),
            Text(
              '${(window.fillProbability! * 100).toStringAsFixed(0)}% fill probability',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ],
      ),
    );
  }
}

// ─── AI SUGGESTION CARD ──────────────────────────────────────────────────────

class _AiSuggestionCard extends StatelessWidget {
  const _AiSuggestionCard({required this.suggestion});

  final AiSuggestion suggestion;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SocelleColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SocelleColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Explanation
          Text(
            suggestion.explanation,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          const SizedBox(height: 16),

          // Copyable recovery message
          _CopyableMessage(message: suggestion.recoveryMessage),
        ],
      ),
    );
  }
}

// ─── COPYABLE MESSAGE ────────────────────────────────────────────────────────

class _CopyableMessage extends StatefulWidget {
  const _CopyableMessage({required this.message});

  final String message;

  @override
  State<_CopyableMessage> createState() => _CopyableMessageState();
}

class _CopyableMessageState extends State<_CopyableMessage> {
  bool _copied = false;

  void _copy() async {
    await Clipboard.setData(ClipboardData(text: widget.message));
    if (!mounted) return;
    setState(() => _copied = true);
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    setState(() => _copied = false);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _copy,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: SocelleColors.background,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                widget.message,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: SocelleColors.inkMuted,
                      fontSize: 14,
                      height: 1.5,
                    ),
              ),
            ),
            const SizedBox(width: 12),
            Icon(
              _copied ? Icons.check_rounded : Icons.copy_rounded,
              size: 18,
              color: _copied ? SocelleColors.accent : SocelleColors.inkFaint,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── PRIMARY CTA ─────────────────────────────────────────────────────────────

class _ReviewGapsCta extends StatelessWidget {
  const _ReviewGapsCta({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: SocelleColors.ink,
          foregroundColor: SocelleColors.background,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        child: const Text('Review Gaps'),
      ),
    );
  }
}

// ─── SKELETON LOADING STATE ──────────────────────────────────────────────────

class _RevenueSkeleton extends StatefulWidget {
  const _RevenueSkeleton();

  @override
  State<_RevenueSkeleton> createState() => _RevenueSkeletonState();
}

class _RevenueSkeletonState extends State<_RevenueSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulse,
      builder: (context, _) {
        final opacity = 0.4 + (_pulse.value * 0.3); // 0.4 to 0.7

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 56),

                // Label placeholder
                _SkeletonRect(width: 90, height: 14, opacity: opacity),
                const SizedBox(height: 8),

                // Revenue number placeholder
                _SkeletonRect(width: 240, height: 56, opacity: opacity),
                const SizedBox(height: 8),

                // Supporting sentence placeholder
                _SkeletonRect(
                    width: double.infinity, height: 16, opacity: opacity),
                const SizedBox(height: 32),

                // Card placeholder
                _SkeletonRect(
                    width: double.infinity, height: 96, opacity: opacity),
                const SizedBox(height: 20),

                // Card placeholder
                _SkeletonRect(
                    width: double.infinity, height: 140, opacity: opacity),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _SkeletonRect extends StatelessWidget {
  const _SkeletonRect({
    required this.width,
    required this.height,
    required this.opacity,
  });

  final double width;
  final double height;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: opacity,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: SocelleColors.surfaceMuted,
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}

// ─── EMPTY / ERROR STATE ─────────────────────────────────────────────────────

class _RevenueEmptyState extends ConsumerWidget {
  const _RevenueEmptyState();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 56),

            // Same position as the leakage hero
            Text(
              'Connect your calendar to reveal lost revenue.',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: SocelleColors.ink,
                  ),
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: () {
                  // Navigate to Settings tab (index 2) for calendar connection
                  ref.read(navigationIndexProvider.notifier).state = 2;
                },
                style: FilledButton.styleFrom(
                  backgroundColor: SocelleColors.ink,
                  foregroundColor: SocelleColors.background,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  textStyle: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                child: const Text('Connect Calendar'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
