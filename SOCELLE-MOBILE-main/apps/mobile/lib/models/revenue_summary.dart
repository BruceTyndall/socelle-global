/// Data contract for the Revenue Reveal screen.
///
/// Derived from gap_engine SyncResult. All numbers are USD.
class MonthlyLeakageSummary {
  const MonthlyLeakageSummary({
    required this.totalLeakageUsd,
    required this.totalOpenHours,
    required this.totalGapDays,
    required this.highestValueWindow,
  });

  final double totalLeakageUsd;
  final double totalOpenHours;
  final int totalGapDays;
  final HighestValueWindow? highestValueWindow;

  /// Mock data for interface stabilization.
  factory MonthlyLeakageSummary.mock() {
    return const MonthlyLeakageSummary(
      totalLeakageUsd: 1247,
      totalOpenHours: 18.5,
      totalGapDays: 12,
      highestValueWindow: HighestValueWindow(
        dayOfWeek: 'Tuesday',
        startTime: '2:00 PM',
        endTime: '4:00 PM',
        estimatedValue: 170,
        fillProbability: 0.72,
      ),
    );
  }

  /// Empty state — no calendar connected or no gaps found.
  factory MonthlyLeakageSummary.empty() {
    return const MonthlyLeakageSummary(
      totalLeakageUsd: 0,
      totalOpenHours: 0,
      totalGapDays: 0,
      highestValueWindow: null,
    );
  }

  bool get hasData => totalLeakageUsd > 0;
}

class HighestValueWindow {
  const HighestValueWindow({
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.estimatedValue,
    this.fillProbability,
  });

  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final double estimatedValue;
  final double? fillProbability;
}
