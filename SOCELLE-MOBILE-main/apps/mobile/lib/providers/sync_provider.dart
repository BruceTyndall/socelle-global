import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_timezone/flutter_timezone.dart';

import '../models/sync_models.dart';
import '../services/apple_calendar_service.dart';
import '../services/socelle_api.dart';
import 'user_settings_provider.dart';

final socelleApiProvider = Provider<SocelleApi>((ref) {
  return SocelleApi();
});

final syncResultProvider =
    AsyncNotifierProvider<SyncResultNotifier, SyncResult?>(
  SyncResultNotifier.new,
);

class SyncResultNotifier extends AsyncNotifier<SyncResult?> {
  @override
  Future<SyncResult?> build() async {
    // BUG-011 fix: auto-sync on first load when calendar is configured and
    // last sync was > 4 hours ago (or never). Uses microtask to avoid
    // mutating provider state during build.
    Future.microtask(() async {
      final settings = ref.read(userSettingsProvider).valueOrNull;
      if (settings == null) return;
      final hasCalendar = settings.calendarSource.isNotEmpty;
      if (!hasCalendar) return;

      final storage = ref.read(settingsStorageProvider);
      final lastSync = await storage.getLastSyncAt();
      final staleThreshold =
          DateTime.now().subtract(const Duration(hours: 4));
      final isStale = lastSync == null || lastSync.isBefore(staleThreshold);
      if (isStale) refresh();
    });
    return null;
  }

  Future<SyncResult> refresh() async {
    state = const AsyncLoading();

    try {
      final settings = ref.read(userSettingsProvider).valueOrNull;
      if (settings == null) {
        throw Exception('Settings not loaded');
      }

      final api = ref.read(socelleApiProvider);
      final storage = ref.read(settingsStorageProvider);

      final nowLocal = DateTime.now();
      final todayLocal =
          DateTime(nowLocal.year, nowLocal.month, nowLocal.day);
      final mondayLocal =
          todayLocal.subtract(Duration(days: todayLocal.weekday - 1));
      final endLocal =
          mondayLocal.add(const Duration(days: 13, hours: 23, minutes: 59));

      final start = mondayLocal.toUtc();
      final end = endLocal.toUtc();

      // BUG-002 fix: detect device IANA timezone for correct gap detection.
      String timezone = settings.timezone;
      if (timezone == 'UTC') {
        try {
          timezone = await FlutterTimezone.getLocalTimezone();
        } catch (_) {
          // Non-fatal — gap detection falls back to UTC.
        }
      }
      final syncSettings = timezone != settings.timezone
          ? settings.copyWith(timezone: timezone)
          : settings;

      // For Apple Calendar: read device events locally before calling the CF.
      List<DeviceCalendarEvent>? deviceEvents;
      if (settings.calendarSource == 'apple') {
        final calService = AppleCalendarService();
        final calResult = await calService.fetchEvents(start: start, end: end);
        if (calResult is AppleCalendarSuccess) {
          deviceEvents = calResult.events;
        }
        // If denied or errored, proceed with empty list — CF will return 0 gaps.
      }

      final result = await api.syncCalendarEvents(
        settings: syncSettings,
        start: start,
        end: end,
        deviceEvents: deviceEvents,
      );

      await storage.setLastSyncAt(DateTime.now());
      state = AsyncData(result);
      return result;
    } catch (e, st) {
      state = AsyncError(e, st);
      rethrow;
    }
  }
}

final lastSyncAtProvider = FutureProvider<DateTime?>((ref) async {
  // Re-read when sync completes
  ref.watch(syncResultProvider);
  final storage = ref.read(settingsStorageProvider);
  return storage.getLastSyncAt();
});

final recoveredRevenueProvider =
    AsyncNotifierProvider<RecoveredRevenueNotifier, double>(
  RecoveredRevenueNotifier.new,
);

class RecoveredRevenueNotifier extends AsyncNotifier<double> {
  @override
  Future<double> build() async {
    final storage = ref.read(settingsStorageProvider);
    return storage.getRecoveredRevenue();
  }

  Future<void> add(double amount) async {
    final storage = ref.read(settingsStorageProvider);
    await storage.addRecoveredRevenue(amount);
    final newTotal = await storage.getRecoveredRevenue();
    state = AsyncData(newTotal);
  }

  Future<void> subtract(double amount) async {
    final storage = ref.read(settingsStorageProvider);
    await storage.subtractRecoveredRevenue(amount);
    final newTotal = await storage.getRecoveredRevenue();
    state = AsyncData(newTotal);
  }
}
