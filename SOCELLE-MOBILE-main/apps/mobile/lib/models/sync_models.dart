import 'gap_action.dart';

class GapItem {
  GapItem({
    required this.gapId,
    required this.startIso,
    required this.endIso,
    required this.durationMinutes,
    required this.bookableSlots,
    required this.leakageValue,
    required this.dayOfWeek,
    required this.status,
    this.intentionalReason,
  });

  final String gapId;
  final String startIso;
  final String endIso;
  final int durationMinutes;
  final int bookableSlots;
  final double leakageValue;
  final String dayOfWeek;
  GapStatus status;
  IntentionalReason? intentionalReason;

  bool get isOpen => status == GapStatus.open;
  bool get isFilled => status == GapStatus.filled;
  bool get isIntentional => status == GapStatus.intentional;

  factory GapItem.fromMap(Map<Object?, Object?> map) {
    final statusStr = map['status'] as String?;
    final reasonStr = map['intentionalReason'] as String?;

    return GapItem(
      gapId: map['gapId'] as String? ?? '',
      startIso: map['startIso'] as String? ?? '',
      endIso: map['endIso'] as String? ?? '',
      durationMinutes: (map['durationMinutes'] as num?)?.toInt() ?? 0,
      bookableSlots: (map['bookableSlots'] as num?)?.toInt() ?? 0,
      leakageValue: (map['leakageValue'] as num?)?.toDouble() ?? 0,
      dayOfWeek: map['dayOfWeek'] as String? ?? '',
      status: GapStatus.fromString(
          statusStr ?? (map['intentional'] == true ? 'intentional' : 'open')),
      intentionalReason:
          reasonStr != null ? IntentionalReason.fromString(reasonStr) : null,
    );
  }
}

class SyncTotals {
  SyncTotals({
    required this.gapCount,
    required this.totalBookableSlots,
    required this.weeklyLeakage,
  });

  final int gapCount;
  final int totalBookableSlots;
  final double weeklyLeakage;

  factory SyncTotals.fromMap(Map<Object?, Object?> map) {
    return SyncTotals(
      gapCount: (map['gapCount'] as num?)?.toInt() ?? 0,
      totalBookableSlots: (map['totalBookableSlots'] as num?)?.toInt() ?? 0,
      weeklyLeakage: (map['weeklyLeakage'] as num?)?.toDouble() ?? 0,
    );
  }
}

class SyncResult {
  SyncResult({
    required this.gaps,
    required this.totals,
    DateTime? syncedAt,
  }) : syncedAt = syncedAt ?? DateTime.now();

  final List<GapItem> gaps;
  final SyncTotals totals;
  final DateTime syncedAt;

  /// Active (non-filled, non-intentional) leakage.
  double get activeLeakage {
    return gaps
        .where((g) => g.isOpen)
        .fold(0.0, (sum, g) => sum + g.leakageValue);
  }

  DateTime _startOfCurrentWeekLocal([DateTime? now]) {
    final localNow = (now ?? DateTime.now()).toLocal();
    final dayStart = DateTime(localNow.year, localNow.month, localNow.day);
    return dayStart.subtract(Duration(days: dayStart.weekday - 1));
  }

  bool _isCurrentWeekGap(GapItem gap, DateTime weekStart, DateTime weekEnd) {
    try {
      final gapStart = DateTime.parse(gap.startIso).toLocal();
      return !gapStart.isBefore(weekStart) && gapStart.isBefore(weekEnd);
    } catch (_) {
      return false;
    }
  }

  List<GapItem> currentWeekGaps([DateTime? now]) {
    final weekStart = _startOfCurrentWeekLocal(now);
    final weekEnd = weekStart.add(const Duration(days: 7));
    return gaps
        .where((gap) => _isCurrentWeekGap(gap, weekStart, weekEnd))
        .toList();
  }

  List<GapItem> currentWeekOpenGaps([DateTime? now]) {
    return currentWeekGaps(now).where((gap) => gap.isOpen).toList();
  }

  double currentWeekActiveLeakage([DateTime? now]) {
    return currentWeekOpenGaps(now)
        .fold(0.0, (sum, gap) => sum + gap.leakageValue);
  }

  int currentWeekBookableSlots([DateTime? now]) {
    return currentWeekOpenGaps(now)
        .fold(0, (sum, gap) => sum + gap.bookableSlots);
  }

  int currentWeekGapCount([DateTime? now]) {
    return currentWeekOpenGaps(now).length;
  }

  /// Gaps grouped by day of week.
  Map<String, List<GapItem>> get gapsByDay {
    final map = <String, List<GapItem>>{};
    for (final gap in gaps) {
      map.putIfAbsent(gap.dayOfWeek, () => []).add(gap);
    }
    return map;
  }

  factory SyncResult.fromCallableMap(Map<Object?, Object?> map) {
    final totalsRaw = map['totals'];
    final gapsRaw = map['gaps'];

    final totals = totalsRaw is Map<Object?, Object?>
        ? SyncTotals.fromMap(totalsRaw)
        : SyncTotals(gapCount: 0, totalBookableSlots: 0, weeklyLeakage: 0);

    final gaps = <GapItem>[];
    if (gapsRaw is List) {
      for (final item in gapsRaw) {
        if (item is Map<Object?, Object?>) {
          gaps.add(GapItem.fromMap(item));
        }
      }
    }

    return SyncResult(gaps: gaps, totals: totals);
  }
}
