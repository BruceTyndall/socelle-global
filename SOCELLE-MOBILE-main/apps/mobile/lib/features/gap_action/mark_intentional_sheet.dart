import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/socelle_colors.dart';
import '../../models/gap_action.dart';
import '../../models/sync_models.dart';
import '../../providers/sync_provider.dart';

class MarkIntentionalSheet {
  static void show(BuildContext context, WidgetRef ref, GapItem gap) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _Content(gap: gap, ref: ref),
    );
  }
}

class _Content extends StatelessWidget {
  const _Content({required this.gap, required this.ref});

  final GapItem gap;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
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

            Text(
              'Why is this gap intentional?',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 4),
            Text(
              "We'll remember this for future syncs.",
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 20),

            ...IntentionalReason.values.map((reason) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _ReasonTile(
                    reason: reason,
                    onTap: () async {
                      final previousStatus = gap.status;
                      final previousReason = gap.intentionalReason;
                      gap.status = GapStatus.intentional;
                      gap.intentionalReason = reason;

                      try {
                        await ref.read(socelleApiProvider).updateGapStatus(
                              startIso: gap.startIso,
                              endIso: gap.endIso,
                              status: GapStatus.intentional,
                              intentionalReason: reason,
                            );
                      } catch (_) {
                        gap.status = previousStatus;
                        gap.intentionalReason = previousReason;
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                  'Could not save this change. Please try again.'),
                            ),
                          );
                        }
                        return;
                      }

                      if (!context.mounted) return;
                      HapticFeedback.lightImpact();
                      Navigator.pop(context);

                      if (!context.mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Marked as ${reason.label}. We\'ll remember for next week.',
                          ),
                          action: SnackBarAction(
                            label: 'Undo',
                            onPressed: () async {
                              final previousUndoStatus = gap.status;
                              final previousUndoReason = gap.intentionalReason;
                              gap.status = GapStatus.open;
                              gap.intentionalReason = null;

                              try {
                                await ref.read(socelleApiProvider).updateGapStatus(
                                      startIso: gap.startIso,
                                      endIso: gap.endIso,
                                      status: GapStatus.open,
                                    );
                              } catch (_) {
                                gap.status = previousUndoStatus;
                                gap.intentionalReason = previousUndoReason;
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                          'Could not save this change. Please try again.'),
                                    ),
                                  );
                                }
                              }
                            },
                          ),
                        ),
                      );
                    },
                  ),
                )),

            const SizedBox(height: 8),
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
}

class _ReasonTile extends StatelessWidget {
  const _ReasonTile({required this.reason, required this.onTap});

  final IntentionalReason reason;
  final VoidCallback onTap;

  IconData get _icon => switch (reason) {
        IntentionalReason.lunch => Icons.restaurant_rounded,
        IntentionalReason.buffer => Icons.schedule_rounded,
        IntentionalReason.personal => Icons.person_outline_rounded,
        IntentionalReason.other => Icons.more_horiz_rounded,
      };

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            border: Border.all(color: SocelleColors.border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(_icon,
                  color: SocelleColors.intentionalAmber, size: 22),
              const SizedBox(width: 14),
              Text(
                reason.label,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const Spacer(),
              const Icon(
                Icons.chevron_right_rounded,
                color: SocelleColors.textMuted,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
