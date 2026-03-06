import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/feature_flags.dart';
import '../../core/theme/socelle_colors.dart';
import '../../models/gap_action.dart';
import '../../models/sync_models.dart';
import '../../providers/streak_provider.dart';
import '../../providers/sync_provider.dart';
import 'fill_slot_flow.dart';
import 'mark_intentional_sheet.dart';

class GapActionSheet {
  static void show(BuildContext context, WidgetRef ref, GapItem gap) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _GapActionSheetContent(gap: gap, ref: ref),
    );
  }
}

class _GapActionSheetContent extends StatelessWidget {
  const _GapActionSheetContent({required this.gap, required this.ref});

  final GapItem gap;
  final WidgetRef ref;

  String _formatTimeRange() {
    try {
      final start = DateTime.parse(gap.startIso).toLocal();
      final end = DateTime.parse(gap.endIso).toLocal();
      final dayFormat = DateFormat.EEEE();
      final timeFormat = DateFormat.jm();
      return '${dayFormat.format(start)}, ${timeFormat.format(start)} - ${timeFormat.format(end)}';
    } catch (_) {
      return '${gap.dayOfWeek}  ${gap.startIso} - ${gap.endIso}';
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat =
        NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: SocelleColors.divider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Gap info
            Text(
              _formatTimeRange(),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Text(
                  '${gap.durationMinutes} min',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(width: 12),
                Text(
                  '${gap.bookableSlots} ${gap.bookableSlots == 1 ? 'slot' : 'slots'}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(width: 12),
                Text(
                  currencyFormat.format(gap.leakageValue),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: SocelleColors.leakageRed,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Actions
            if (gap.isOpen) ...[
              // Text a client
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    FillSlotFlow.start(context, ref, gap);
                  },
                  icon: const Icon(Icons.send_rounded, size: 18),
                  label: const Text('Text a Client'),
                ),
              ),
              const SizedBox(height: 10),

              // Mark as filled
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _markFilled(context, ref);
                  },
                  icon: const Icon(Icons.check_circle_outline_rounded,
                      size: 18),
                  label: const Text('Mark as Filled'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: SocelleColors.recoveredGreen,
                    side: const BorderSide(
                        color: SocelleColors.recoveredGreen),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Mark as intentional
              SizedBox(
                width: double.infinity,
                child: TextButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    MarkIntentionalSheet.show(context, ref, gap);
                  },
                  icon: const Icon(Icons.schedule_rounded, size: 18),
                  label: const Text('Mark as Intentional'),
                  style: TextButton.styleFrom(
                    foregroundColor: SocelleColors.textSecondary,
                  ),
                ),
              ),
            ] else ...[
              // Show current status
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: gap.isFilled
                      ? SocelleColors.recoveredGreenLight
                      : SocelleColors.intentionalAmberLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(
                      gap.isFilled
                          ? Icons.check_circle_rounded
                          : Icons.schedule_rounded,
                      color: gap.isFilled
                          ? SocelleColors.recoveredGreen
                          : SocelleColors.intentionalAmber,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        gap.isFilled
                            ? 'This gap has been filled'
                            : 'Marked as ${gap.intentionalReason?.label ?? 'intentional'}',
                        style: TextStyle(
                          color: gap.isFilled
                              ? SocelleColors.recoveredGreenDark
                              : SocelleColors.intentionalAmber,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),

              // Undo
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () async {
                    final previousStatus = gap.status;
                    final previousReason = gap.intentionalReason;
                    final wasFilled = previousStatus == GapStatus.filled;

                    gap.status = GapStatus.open;
                    gap.intentionalReason = null;
                    Navigator.pop(context);

                    if (wasFilled) {
                      await ref
                          .read(recoveredRevenueProvider.notifier)
                          .subtract(gap.leakageValue);
                    }
                    if (!context.mounted) return;

                    final updated = await _updateGapStatus(
                      context,
                      ref,
                      status: GapStatus.open,
                    );

                    if (updated) {
                      return;
                    }

                    gap.status = previousStatus;
                    gap.intentionalReason = previousReason;
                    if (wasFilled) {
                      await ref
                          .read(recoveredRevenueProvider.notifier)
                          .add(gap.leakageValue);
                    }
                  },
                  child: const Text('Undo - Mark as Open'),
                ),
              ),
            ],

            const SizedBox(height: 8),

            // Cancel
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Cancel',
                  style: TextStyle(color: SocelleColors.textMuted),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _markFilled(BuildContext context, WidgetRef ref) async {
    final previousStatus = gap.status;
    final previousReason = gap.intentionalReason;
    gap.status = GapStatus.filled;

    final updated = await _updateGapStatus(
      context,
      ref,
      status: GapStatus.filled,
    );

    if (!updated) {
      gap.status = previousStatus;
      gap.intentionalReason = previousReason;
      return;
    }

    await ref.read(recoveredRevenueProvider.notifier).add(gap.leakageValue);

    // Record streak action
    dynamic newStreak;
    if (FeatureFlags.kEnableStreaks) {
      newStreak = await ref.read(streakProvider.notifier).recordAction();
    }

    HapticFeedback.mediumImpact();

    if (context.mounted) {
      final currencyFormat =
          NumberFormat.currency(symbol: '\$', decimalDigits: 0);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${currencyFormat.format(gap.leakageValue)} recovered! Nice work.',
          ),
          action: SnackBarAction(
            label: 'Undo',
            onPressed: () async {
              final wasFilled = gap.isFilled;
              gap.status = GapStatus.open;
              gap.intentionalReason = null;
              await ref
                  .read(recoveredRevenueProvider.notifier)
                  .subtract(gap.leakageValue);
              if (!context.mounted) return;

              final undoUpdated = await _updateGapStatus(
                context,
                ref,
                status: GapStatus.open,
              );

              if (!undoUpdated && wasFilled) {
                gap.status = GapStatus.filled;
                gap.intentionalReason = null;
                await ref
                    .read(recoveredRevenueProvider.notifier)
                    .add(gap.leakageValue);
              }
            },
          ),
        ),
      );

      // Show streak milestone if applicable
      if (FeatureFlags.kEnableStreaks && newStreak != null) {
        final milestone = newStreak.currentMilestoneMessage;
        if (milestone != null) {
          await Future.delayed(const Duration(milliseconds: 500));
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('${newStreak.currentStreak}-week streak! $milestone')),
            );
          }
        }
      }
    }
  }

  Future<bool> _updateGapStatus(
    BuildContext context,
    WidgetRef ref, {
    required GapStatus status,
    IntentionalReason? intentionalReason,
  }) async {
    try {
      await ref.read(socelleApiProvider).updateGapStatus(
            startIso: gap.startIso,
            endIso: gap.endIso,
            status: status,
            intentionalReason: intentionalReason,
          );
      return true;
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not save this change. Please try again.'),
          ),
        );
      }
      return false;
    }
  }
}
