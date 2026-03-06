import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/daily_ritual.dart';
import 'user_settings_provider.dart';

final dailyRitualProvider =
    AsyncNotifierProvider<DailyRitualNotifier, DailyRitualState>(
  DailyRitualNotifier.new,
);

class DailyRitualNotifier extends AsyncNotifier<DailyRitualState> {
  @override
  Future<DailyRitualState> build() async {
    final storage = ref.read(settingsStorageProvider);
    return storage.getDailyRitual();
  }

  Future<void> markTask(
    String taskId, {
    bool completed = true,
  }) async {
    final current = state.valueOrNull ??
        await ref.read(settingsStorageProvider).getDailyRitual();

    final updated = Map<String, bool>.from(current.tasks);
    if (!updated.containsKey(taskId)) return;
    updated[taskId] = completed;
    final next = current.copyWith(tasks: updated);

    await ref.read(settingsStorageProvider).saveDailyRitual(next);
    state = AsyncData(next);
  }

  Future<void> toggleTask(String taskId) async {
    final current = state.valueOrNull ??
        await ref.read(settingsStorageProvider).getDailyRitual();

    final updated = Map<String, bool>.from(current.tasks);
    if (!updated.containsKey(taskId)) return;
    updated[taskId] = !(updated[taskId] ?? false);
    final next = current.copyWith(tasks: updated);

    await ref.read(settingsStorageProvider).saveDailyRitual(next);
    state = AsyncData(next);
  }

  Future<void> resetForToday() async {
    final next = DailyRitualState.forToday();
    await ref.read(settingsStorageProvider).saveDailyRitual(next);
    state = AsyncData(next);
  }
}
