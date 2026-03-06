import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/theme/socelle_colors.dart';
import '../../models/sync_models.dart';
import '../../providers/sync_provider.dart';
import '../gap_action/gap_action_sheet.dart';

/// Schedule tab — gap list with fill/intentional actions.
///
/// Shows current week gaps grouped by day, with skeleton loading on refresh,
/// empty state if no gaps, and pull-to-refresh support.
class SchedulePage extends ConsumerWidget {
  const SchedulePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncState = ref.watch(syncResultProvider);

    return RefreshIndicator(
      onRefresh: () => ref.read(syncResultProvider.notifier).refresh(),
      child: syncState.when(
        data: (syncResult) => _ScheduleContent(syncResult: syncResult, ref: ref),
        loading: () => const _ScheduleSkeleton(),
        error: (_, __) => const _ScheduleEmptyState(),
      ),
    );
  }
}

// ─── MAIN CONTENT ────────────────────────────────────────────────────────────

class _ScheduleContent extends StatelessWidget {
  const _ScheduleContent({required this.syncResult, required this.ref});

  final SyncResult? syncResult;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    // Handle null sync result
    if (syncResult == null) {
      return const _ScheduleEmptyState();
    }

    // Get current week gaps
    final gapsThisWeek = syncResult!.currentWeekGaps();

    // Handle no gaps
    if (gapsThisWeek.isEmpty) {
      return const _ScheduleEmptyState();
    }

    // Group gaps by day
    final gapsByDay = <String, List<GapItem>>{};
    for (final gap in gapsThisWeek) {
      gapsByDay.putIfAbsent(gap.dayOfWeek, () => []).add(gap);
    }

    // Day order
    const dayOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    // Filter to only days with gaps and sort
    final orderedDays = dayOrder
        .where((day) => gapsByDay.containsKey(day))
        .toList();

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 56),

              // ── Title ──
              Text(
                'Schedule',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),

              // ── Recovered Revenue Summary ──
              _RecoveredRevenueSummary(ref: ref),
              const SizedBox(height: 8),

              // ── Open Gaps Count ──
              _OpenGapsCount(gapsThisWeek: gapsThisWeek),
              const SizedBox(height: 24),

              // ── Gap List ──
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: orderedDays.length,
                itemBuilder: (context, dayIndex) {
                  final day = orderedDays[dayIndex];
                  final gaps = gapsByDay[day]!;

                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Day header
                      Text(
                        day,
                        style:
                            Theme.of(context).textTheme.labelMedium?.copyWith(
                                  color: SocelleColors.inkMuted,
                                ),
                      ),
                      const SizedBox(height: 8),

                      // Gaps for this day
                      ...gaps.map((gap) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _GapCard(gap: gap, ref: ref),
                        );
                      }),

                      // Spacing between day sections
                      const SizedBox(height: 16),
                    ],
                  );
                },
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── RECOVERED REVENUE SUMMARY ────────────────────────────────────────────────

class _RecoveredRevenueSummary extends ConsumerWidget {
  const _RecoveredRevenueSummary({required this.ref});

  final WidgetRef ref;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recoveredState = ref.watch(recoveredRevenueProvider);

    return recoveredState.when(
      data: (amount) {
        final formatter =
            NumberFormat.currency(symbol: '\$', decimalDigits: 0);
        return Text(
          'Recovered: ${formatter.format(amount)}',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: SocelleColors.accent,
                fontWeight: FontWeight.w500,
              ),
        );
      },
      loading: () => Container(
        width: 120,
        height: 20,
        decoration: BoxDecoration(
          color: SocelleColors.surfaceMuted,
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}

// ─── OPEN GAPS COUNT ─────────────────────────────────────────────────────────

class _OpenGapsCount extends StatelessWidget {
  const _OpenGapsCount({required this.gapsThisWeek});

  final List<GapItem> gapsThisWeek;

  @override
  Widget build(BuildContext context) {
    final openGaps = gapsThisWeek.where((g) => g.isOpen).toList();
    final count = openGaps.length;

    if (count == 0) {
      return Text(
        'No open gaps this week',
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: SocelleColors.inkMuted,
            ),
      );
    }

    final countStr = count == 1 ? '$count open gap' : '$count open gaps';
    return Text(
      '$countStr this week',
      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: SocelleColors.inkMuted,
          ),
    );
  }
}

// ─── GAP CARD ─────────────────────────────────────────────────────────────────

class _GapCard extends StatelessWidget {
  const _GapCard({required this.gap, required this.ref});

  final GapItem gap;
  final WidgetRef ref;

  String _formatTimeRange() {
    try {
      final start = DateTime.parse(gap.startIso).toLocal();
      final end = DateTime.parse(gap.endIso).toLocal();
      final timeFormat = DateFormat.jm();
      return '${timeFormat.format(start)} - ${timeFormat.format(end)}';
    } catch (_) {
      return '${gap.startIso} - ${gap.endIso}';
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter =
        NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return GestureDetector(
      onTap: () => GapActionSheet.show(context, ref, gap),
      child: Container(
        decoration: BoxDecoration(
          color: SocelleColors.surface,
          border: Border.all(color: SocelleColors.borderLight),
          borderRadius: BorderRadius.circular(12),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Time range
            Text(
              _formatTimeRange(),
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),

            // Details: price · slots · duration
            Row(
              children: [
                Text(
                  formatter.format(gap.leakageValue),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SocelleColors.leakage,
                        fontWeight: FontWeight.w500,
                      ),
                ),
                const SizedBox(width: 6),
                Text(
                  '·',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(width: 6),
                Text(
                  '${gap.bookableSlots} ${gap.bookableSlots == 1 ? 'slot' : 'slots'}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SocelleColors.inkMuted,
                      ),
                ),
                const SizedBox(width: 6),
                Text(
                  '·',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(width: 6),
                Text(
                  '${gap.durationMinutes} min',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SocelleColors.inkMuted,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Status badge
            if (!gap.isOpen)
              Text(
                gap.isFilled ? 'Filled' : 'Intentional',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color:
                          gap.isFilled ? SocelleColors.accent : SocelleColors.inkFaint,
                      fontWeight: FontWeight.w500,
                    ),
              ),
          ],
        ),
      ),
    );
  }
}

// ─── SKELETON LOADING STATE ──────────────────────────────────────────────────

class _ScheduleSkeleton extends StatefulWidget {
  const _ScheduleSkeleton();

  @override
  State<_ScheduleSkeleton> createState() => _ScheduleSkeletonState();
}

class _ScheduleSkeletonState extends State<_ScheduleSkeleton>
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
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 56),

                  // Title placeholder
                  _SkeletonRect(width: 100, height: 28, opacity: opacity),
                  const SizedBox(height: 12),

                  // Recovered revenue placeholder
                  _SkeletonRect(width: 140, height: 18, opacity: opacity),
                  const SizedBox(height: 8),

                  // Open gaps count placeholder
                  _SkeletonRect(width: 160, height: 16, opacity: opacity),
                  const SizedBox(height: 24),

                  // Card placeholders
                  ...List.generate(3, (i) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _SkeletonRect(
                        width: double.infinity,
                        height: 88,
                        opacity: opacity,
                      ),
                    );
                  }),

                  const SizedBox(height: 24),
                ],
              ),
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

// ─── EMPTY / NO GAPS STATE ───────────────────────────────────────────────────

class _ScheduleEmptyState extends StatelessWidget {
  const _ScheduleEmptyState();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 56),
              Text(
                'Schedule',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 32),
              Text(
                'No gaps detected. Connect your calendar or sync to see open slots.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: SocelleColors.inkMuted,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
