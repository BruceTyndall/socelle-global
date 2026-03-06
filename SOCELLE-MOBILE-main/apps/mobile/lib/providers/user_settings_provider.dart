import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user_settings.dart';
import '../services/settings_storage.dart';

final settingsStorageProvider = Provider<SettingsStorage>((ref) {
  return SettingsStorage();
});

final userSettingsProvider =
    AsyncNotifierProvider<UserSettingsNotifier, UserSettings>(
  UserSettingsNotifier.new,
);

class UserSettingsNotifier extends AsyncNotifier<UserSettings> {
  @override
  Future<UserSettings> build() async {
    final storage = ref.read(settingsStorageProvider);
    return storage.loadSettings();
  }

  Future<void> saveSettings(UserSettings settings) async {
    final storage = ref.read(settingsStorageProvider);
    await storage.saveSettings(settings);
    state = AsyncData(settings);
  }

  Future<void> updateBookingValue(double value) async {
    final current = state.valueOrNull ?? UserSettings.defaults();
    await saveSettings(current.copyWith(avgBookingValue: value));
  }

  Future<void> updateSlotDuration(int minutes) async {
    final current = state.valueOrNull ?? UserSettings.defaults();
    await saveSettings(current.copyWith(slotDurationMinutes: minutes));
  }

  Future<void> updateWorkingDay(String day, WorkingDay workingDay) async {
    final current = state.valueOrNull ?? UserSettings.defaults();
    final updated = Map<String, WorkingDay>.from(current.workingHours);
    updated[day] = workingDay;
    await saveSettings(current.copyWith(workingHours: updated));
  }

  Future<void> updateCalendarSource(String source) async {
    final current = state.valueOrNull ?? UserSettings.defaults();
    await saveSettings(current.copyWith(calendarSource: source));
  }
}

final onboardingCompleteProvider = FutureProvider<bool>((ref) async {
  final storage = ref.read(settingsStorageProvider);
  return storage.isOnboardingComplete();
});
