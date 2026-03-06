/// Client-side representation of the notification eligibility state
/// stored in Firestore at `notification_state/{userId}`.
class NotificationState {
  const NotificationState({
    this.lastSentAt,
    this.consecutiveDismissed = 0,
    this.reducedFrequencyUntil,
    this.framingRotationIndex = 0,
    this.reEngagementMode = false,
    this.dailyCount = 0,
    this.dailyCountDate = '',
    this.frequency = NotificationFrequency.standard,
    this.lastDismissAt,
    this.milestonesSent = const [],
  });

  final DateTime? lastSentAt;
  final int consecutiveDismissed;
  final DateTime? reducedFrequencyUntil;
  final int framingRotationIndex; // 0-3
  final bool reEngagementMode;
  final int dailyCount;
  final String dailyCountDate; // "YYYY-MM-DD"
  final NotificationFrequency frequency;
  final DateTime? lastDismissAt;
  final List<String> milestonesSent;

  bool get isInReducedMode =>
      reducedFrequencyUntil != null &&
      reducedFrequencyUntil!.isAfter(DateTime.now());

  int get dailyQuota {
    return switch (frequency) {
      NotificationFrequency.standard => 2,
      NotificationFrequency.focused => 1,
      NotificationFrequency.weeklyDigest => 0,
    };
  }

  static NotificationState empty() => const NotificationState();

  factory NotificationState.fromMap(Map<String, dynamic> map) {
    return NotificationState(
      lastSentAt: map['last_sent_at'] != null
          ? DateTime.tryParse(map['last_sent_at'] as String)
          : null,
      consecutiveDismissed:
          (map['consecutive_dismissed'] as num?)?.toInt() ?? 0,
      reducedFrequencyUntil: map['reduced_frequency_until'] != null
          ? DateTime.tryParse(map['reduced_frequency_until'] as String)
          : null,
      framingRotationIndex:
          (map['framing_rotation_index'] as num?)?.toInt() ?? 0,
      reEngagementMode: map['re_engagement_mode'] as bool? ?? false,
      dailyCount: (map['daily_count'] as num?)?.toInt() ?? 0,
      dailyCountDate: map['daily_count_date'] as String? ?? '',
      frequency: NotificationFrequency.fromString(
          map['notification_frequency'] as String? ?? 'standard'),
      lastDismissAt: map['last_dismiss_at'] != null
          ? DateTime.tryParse(map['last_dismiss_at'] as String)
          : null,
      milestonesSent: (map['milestones_sent'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }
}

enum NotificationFrequency {
  standard,
  focused,
  weeklyDigest;

  static NotificationFrequency fromString(String value) {
    return switch (value) {
      'focused' => NotificationFrequency.focused,
      'weekly_digest' => NotificationFrequency.weeklyDigest,
      _ => NotificationFrequency.standard,
    };
  }

  String toApiString() {
    return switch (this) {
      NotificationFrequency.standard => 'standard',
      NotificationFrequency.focused => 'focused',
      NotificationFrequency.weeklyDigest => 'weekly_digest',
    };
  }

  String get displayLabel {
    return switch (this) {
      NotificationFrequency.standard => 'Standard',
      NotificationFrequency.focused => 'Focused',
      NotificationFrequency.weeklyDigest => 'Weekly Digest',
    };
  }

  String get displayDescription {
    return switch (this) {
      NotificationFrequency.standard =>
        'Up to 2 alerts per day for open gaps',
      NotificationFrequency.focused =>
        '1 alert per day, high-priority gaps only',
      NotificationFrequency.weeklyDigest =>
        'Monday summary only — no intra-week pushes',
    };
  }
}
