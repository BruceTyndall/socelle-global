import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/ai_suggestion.dart';
import '../models/revenue_summary.dart';
import '../services/ai_provider.dart';
import 'sync_provider.dart';

/// Derives a [MonthlyLeakageSummary] from the existing [syncResultProvider].
///
/// For MVP stabilization: returns mock data. Once gap_engine is wired through
/// Supabase, this provider will compute from real SyncResult.
final monthlyLeakageProvider = Provider<MonthlyLeakageSummary>((ref) {
  final syncAsync = ref.watch(syncResultProvider);

  return syncAsync.when(
    data: (result) {
      if (result == null) return MonthlyLeakageSummary.mock();

      // Derive from real sync data.
      final openGaps = result.gaps.where((g) => g.isOpen).toList();
      final totalLeakage =
          openGaps.fold(0.0, (sum, g) => sum + g.leakageValue);
      final totalMinutes =
          openGaps.fold(0, (sum, g) => sum + g.durationMinutes);
      final uniqueDays = openGaps.map((g) => g.dayOfWeek).toSet();

      // Highest value gap becomes the highest value window.
      HighestValueWindow? hvw;
      if (openGaps.isNotEmpty) {
        openGaps.sort((a, b) => b.leakageValue.compareTo(a.leakageValue));
        final top = openGaps.first;
        hvw = HighestValueWindow(
          dayOfWeek: _capitalize(top.dayOfWeek),
          startTime: _formatIsoTime(top.startIso),
          endTime: _formatIsoTime(top.endIso),
          estimatedValue: top.leakageValue,
        );
      }

      return MonthlyLeakageSummary(
        totalLeakageUsd: totalLeakage,
        totalOpenHours: totalMinutes / 60.0,
        totalGapDays: uniqueDays.length,
        highestValueWindow: hvw,
      );
    },
    loading: () => MonthlyLeakageSummary.mock(),
    error: (_, __) => MonthlyLeakageSummary.empty(),
  );
});

/// AI suggestion provider wired with real sync data.
/// Watches syncResultProvider for gaps, computes average booking value,
/// and passes context to StubAiProvider for data-aware suggestions.
final aiSuggestionProvider = FutureProvider<AiSuggestion?>((ref) async {
  final summary = ref.watch(monthlyLeakageProvider);
  if (!summary.hasData) return null;

  final syncAsync = ref.watch(syncResultProvider);

  return syncAsync.when(
    data: (result) async {
      if (result == null) return null;

      // Compute average booking value from open gaps.
      // Use average gap leakage value as proxy for booking opportunity value.
      final openGaps = result.gaps.where((g) => g.isOpen).toList();
      double avgBookingValue = 100.0; // Default fallback

      if (openGaps.isNotEmpty) {
        final totalValue =
            openGaps.fold(0.0, (sum, g) => sum + g.leakageValue);
        avgBookingValue = totalValue / openGaps.length;
      }

      // Generate context-aware suggestion from StubAiProvider.
      final aiProvider = StubAiProvider();
      return await aiProvider.generateSuggestion(
        summary: summary,
        avgBookingValue: avgBookingValue,
      );
    },
    loading: () async => null,
    error: (_, __) async => null,
  );
});

String _capitalize(String s) {
  if (s.isEmpty) return s;
  return s[0].toUpperCase() + s.substring(1);
}

String _formatIsoTime(String iso) {
  try {
    final dt = DateTime.parse(iso).toLocal();
    final hour = dt.hour;
    final minute = dt.minute.toString().padLeft(2, '0');
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour > 12
        ? hour - 12
        : hour == 0
            ? 12
            : hour;
    return '$displayHour:$minute $period';
  } catch (_) {
    return iso;
  }
}
