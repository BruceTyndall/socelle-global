import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/streak.dart';
import 'user_settings_provider.dart';

final streakProvider =
    AsyncNotifierProvider<StreakNotifier, StreakData>(
  StreakNotifier.new,
);

class StreakNotifier extends AsyncNotifier<StreakData> {
  @override
  Future<StreakData> build() async {
    final storage = ref.read(settingsStorageProvider);
    return storage.getStreak();
  }

  /// Call when gaps are detected for today (idempotent).
  Future<void> markGapDay() async {
    final current = state.valueOrNull ?? StreakData.empty();
    final updated = current.markGapDay();
    if (identical(updated, current)) return; // no change
    final storage = ref.read(settingsStorageProvider);
    await storage.saveStreak(updated);
    state = AsyncData(updated);
  }

  /// Call when the user fills a gap. Only invoke on days with detected gaps —
  /// no-gap days are neutral and must not trigger a streak action.
  Future<StreakData> recordAction() async {
    final current = state.valueOrNull ?? StreakData.empty();
    final updated = current.recordAction();
    final storage = ref.read(settingsStorageProvider);
    await storage.saveStreak(updated);
    state = AsyncData(updated);
    return updated;
  }
}
