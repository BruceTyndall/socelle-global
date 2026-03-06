import '../core/constants.dart';

/// Streak model — daily granularity with grace-period saves.
///
/// Streak definition: a consecutive run of days on which the user took at
/// least one gap-recovery action AND that day had at least one detected gap.
/// Days with no detected gaps are **neutral** — they neither increment nor
/// break the streak.
///
/// Grace period: one 24-hour save per calendar month (resets on the 1st).
/// When the user misses a gap day, the save is consumed automatically and the
/// streak continues. With no save remaining, the streak resets to 1.
class StreakData {
  const StreakData({
    required this.currentStreak,
    required this.bestStreak,
    this.lastActionDate,
    this.lastGapDayDate,
    this.streakSavesUsedThisMonth = 0,
    this.streakSaveResetDate,
  });

  final int currentStreak;
  final int bestStreak;

  /// Most recent date on which the user took a gap-recovery action.
  final DateTime? lastActionDate;

  /// Most recent date on which gaps were detected for this user.
  /// Used to determine whether skipped days were no-gap days (neutral).
  final DateTime? lastGapDayDate;

  /// Grace-period saves used this calendar month. Max 1 per month.
  final int streakSavesUsedThisMonth;

  /// The 1st of the month when [streakSavesUsedThisMonth] was last reset.
  final DateTime? streakSaveResetDate;

  factory StreakData.empty() {
    return const StreakData(currentStreak: 0, bestStreak: 0);
  }

  bool get hasStreak => currentStreak > 0;

  /// Milestone copy for the current streak count, or null.
  String? get currentMilestoneMessage {
    return SocelleConstants.streakMilestones[currentStreak];
  }

  /// Grace saves available this month (0 or 1).
  int get availableSavesThisMonth {
    if (_isNewMonth) return 1;
    return (1 - streakSavesUsedThisMonth).clamp(0, 1);
  }

  /// Whether the user already recorded a recovery action today.
  bool get actedToday {
    if (lastActionDate == null) return false;
    return _toDay(lastActionDate!) == _toDay(DateTime.now());
  }

  bool get _isNewMonth {
    if (streakSaveResetDate == null) return true;
    return streakSaveResetDate!.isBefore(_monthStart(DateTime.now()));
  }

  // ─────────────────────────────────────────────────────────────
  // Public mutation methods
  // ─────────────────────────────────────────────────────────────

  /// Mark today as a gap day (gaps detected). Idempotent.
  /// Call when the dashboard loads and finds open gaps for today.
  StreakData markGapDay() {
    final now = DateTime.now();
    if (lastGapDayDate != null && _toDay(lastGapDayDate!) == _toDay(now)) {
      return this;
    }
    return StreakData(
      currentStreak: currentStreak,
      bestStreak: bestStreak,
      lastActionDate: lastActionDate,
      lastGapDayDate: now,
      streakSavesUsedThisMonth: streakSavesUsedThisMonth,
      streakSaveResetDate: streakSaveResetDate,
    );
  }

  /// Record a gap-recovery action.
  ///
  /// **Only call this when the user fills a gap.** No-gap days are neutral and
  /// must never trigger this method.
  ///
  /// Logic:
  /// - Same day → refresh timestamp, no increment.
  /// - Consecutive day → streak +1.
  /// - Gap of 2+ days with only no-gap days skipped → streak +1 (neutral skip).
  /// - Gap of 2+ days with a skipped gap day AND save available → streak +1,
  ///   save consumed.
  /// - Gap of 2+ days with a skipped gap day AND no save → streak resets to 1.
  StreakData recordAction() {
    final now = DateTime.now();
    final today = _toDay(now);

    if (actedToday) {
      return StreakData(
        currentStreak: currentStreak,
        bestStreak: bestStreak,
        lastActionDate: now,
        lastGapDayDate: lastGapDayDate ?? now,
        streakSavesUsedThisMonth: _refreshedSavesUsed,
        streakSaveResetDate: _refreshedSaveResetDate,
      );
    }

    final int savesUsed = _refreshedSavesUsed;
    final DateTime saveResetDate = _refreshedSaveResetDate;

    if (lastActionDate == null) {
      return StreakData(
        currentStreak: 1,
        bestStreak: 1,
        lastActionDate: now,
        lastGapDayDate: lastGapDayDate ?? now,
        streakSavesUsedThisMonth: savesUsed,
        streakSaveResetDate: saveResetDate,
      );
    }

    final lastActionDay = _toDay(lastActionDate!);
    final daysSinceLast = today.difference(lastActionDay).inDays;

    if (daysSinceLast == 1) {
      // Consecutive day — streak continues
      final newStreak = currentStreak + 1;
      return StreakData(
        currentStreak: newStreak,
        bestStreak: newStreak > bestStreak ? newStreak : bestStreak,
        lastActionDate: now,
        lastGapDayDate: lastGapDayDate ?? now,
        streakSavesUsedThisMonth: savesUsed,
        streakSaveResetDate: saveResetDate,
      );
    }

    // Gap of 2+ days — check if any skipped day had detected gaps.
    // Skipped window: [lastActionDay + 1, today - 1]
    final hadSkippedGapDay = _hadGapDayInRange(
      from: lastActionDay.add(const Duration(days: 1)),
      to: today.subtract(const Duration(days: 1)),
    );

    if (!hadSkippedGapDay) {
      // All skipped days were no-gap days — neutral, streak continues
      final newStreak = currentStreak + 1;
      return StreakData(
        currentStreak: newStreak,
        bestStreak: newStreak > bestStreak ? newStreak : bestStreak,
        lastActionDate: now,
        lastGapDayDate: lastGapDayDate ?? now,
        streakSavesUsedThisMonth: savesUsed,
        streakSaveResetDate: saveResetDate,
      );
    }

    // Skipped a gap day — attempt grace-period save
    if (savesUsed < 1) {
      final newStreak = currentStreak + 1;
      return StreakData(
        currentStreak: newStreak,
        bestStreak: newStreak > bestStreak ? newStreak : bestStreak,
        lastActionDate: now,
        lastGapDayDate: lastGapDayDate ?? now,
        streakSavesUsedThisMonth: savesUsed + 1,
        streakSaveResetDate: saveResetDate,
      );
    }

    // No save available — streak breaks
    return StreakData(
      currentStreak: 1,
      bestStreak: bestStreak,
      lastActionDate: now,
      lastGapDayDate: lastGapDayDate ?? now,
      streakSavesUsedThisMonth: savesUsed,
      streakSaveResetDate: saveResetDate,
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────

  bool _hadGapDayInRange({required DateTime from, required DateTime to}) {
    if (lastGapDayDate == null) return false;
    if (from.isAfter(to)) return false;
    final gapDay = _toDay(lastGapDayDate!);
    return !gapDay.isBefore(from) && !gapDay.isAfter(to);
  }

  int get _refreshedSavesUsed => _isNewMonth ? 0 : streakSavesUsedThisMonth;

  DateTime get _refreshedSaveResetDate {
    if (_isNewMonth) return _monthStart(DateTime.now());
    return streakSaveResetDate!;
  }

  static DateTime _toDay(DateTime dt) => DateTime(dt.year, dt.month, dt.day);
  static DateTime _monthStart(DateTime dt) => DateTime(dt.year, dt.month, 1);

  // ─────────────────────────────────────────────────────────────
  // Serialization
  // ─────────────────────────────────────────────────────────────

  Map<String, dynamic> toMap() => {
        'currentStreak': currentStreak,
        'bestStreak': bestStreak,
        'lastActionDate': lastActionDate?.toIso8601String(),
        'lastGapDayDate': lastGapDayDate?.toIso8601String(),
        'streakSavesUsedThisMonth': streakSavesUsedThisMonth,
        'streakSaveResetDate': streakSaveResetDate?.toIso8601String(),
      };

  factory StreakData.fromMap(Map<String, dynamic> map) {
    return StreakData(
      currentStreak: map['currentStreak'] as int? ?? 0,
      bestStreak: map['bestStreak'] as int? ?? 0,
      lastActionDate: map['lastActionDate'] != null
          ? DateTime.tryParse(map['lastActionDate'] as String)
          : null,
      lastGapDayDate: map['lastGapDayDate'] != null
          ? DateTime.tryParse(map['lastGapDayDate'] as String)
          : null,
      streakSavesUsedThisMonth: map['streakSavesUsedThisMonth'] as int? ?? 0,
      streakSaveResetDate: map['streakSaveResetDate'] != null
          ? DateTime.tryParse(map['streakSaveResetDate'] as String)
          : null,
    );
  }
}
