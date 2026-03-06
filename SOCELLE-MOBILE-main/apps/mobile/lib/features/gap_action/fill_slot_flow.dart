import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/constants.dart';
import '../../core/feature_flags.dart';
import '../../models/gap_action.dart';
import '../../models/sync_models.dart';
import '../../providers/paywall_trigger_provider.dart';
import '../../providers/streak_provider.dart';
import '../../providers/sync_provider.dart';
import '../../providers/user_settings_provider.dart';
import '../gaps/recovery_confirmation.dart';

class FillSlotFlow {
  static Future<void> start(
    BuildContext context,
    WidgetRef ref,
    GapItem gap,
  ) async {
    // 1. Compose message
    final message = _composeMessage(gap);

    // 2. Open share sheet
    await SharePlus.instance.share(ShareParams(text: message));

    // Track share-sheet use for paywall trigger 3 (repeated share use)
    final storage = ref.read(settingsStorageProvider);
    await storage.incrementShareSheetUseCount();
    // Accumulate leakage seen for paywall trigger 1 ($200 cumulative)
    await ref
        .read(paywallTriggerProvider.notifier)
        .addLeakageSeen(gap.leakageValue);

    // 3. Ask if they filled it
    if (!context.mounted) return;

    final filled = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text('Did you fill this slot?'),
        content: const Text(
          'If a client confirmed, mark this gap as filled to track your recovered revenue.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Not yet'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Yes, I filled it!'),
          ),
        ],
      ),
    );

    if (filled != true || !context.mounted) return;

    // 4. Mark as filled
    final previousStatus = gap.status;
    final previousReason = gap.intentionalReason;
    gap.status = GapStatus.filled;

    try {
      await ref.read(socelleApiProvider).updateGapStatus(
            startIso: gap.startIso,
            endIso: gap.endIso,
            status: GapStatus.filled,
          );
    } catch (_) {
      gap.status = previousStatus;
      gap.intentionalReason = previousReason;
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not save this change. Please try again.'),
          ),
        );
      }
      return;
    }

    await ref.read(recoveredRevenueProvider.notifier).add(gap.leakageValue);

    // Record first recovery date and increment recovered gap count for
    // paywall triggers 2 (firstRecovery) and 5 (trialEndWithRecovery).
    // setFirstRecoveryDate() is idempotent — only writes on first call.
    await storage.setFirstRecoveryDate(DateTime.now());
    await storage.incrementRecoveredGapCount();

    // 5. Record streak (daily model — this is a gap-recovery action)
    dynamic newStreak;
    if (FeatureFlags.kEnableStreaks) {
      newStreak = await ref.read(streakProvider.notifier).recordAction();
    }

    if (!context.mounted) return;

    // 6. Navigate to recovery confirmation screen (replaces snackbar)
    //    Haptic feedback fires inside RecoveryConfirmationScreen.
    await Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => RecoveryConfirmationScreen(
          gapId: gap.gapId,
          recoveredAmount: gap.leakageValue,
          streakDay: FeatureFlags.kEnableStreaks && newStreak != null ? newStreak.currentStreak : 0,
        ),
      ),
    );
  }

  static String _composeMessage(GapItem gap) {
    try {
      final start = DateTime.parse(gap.startIso).toLocal();
      final dayFormat = DateFormat.EEEE();
      final timeFormat = DateFormat.jm();
      return SocelleConstants.fillSlotMessageTemplate
          .replaceAll('{day}', dayFormat.format(start))
          .replaceAll('{time}', timeFormat.format(start));
    } catch (_) {
      return SocelleConstants.fillSlotMessageTemplate
          .replaceAll('{day}', gap.dayOfWeek)
          .replaceAll('{time}', gap.startIso);
    }
  }
}
