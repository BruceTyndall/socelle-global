import 'dart:convert';
import '../core/constants.dart';

class WorkingDay {
  const WorkingDay({
    required this.enabled,
    this.start,
    this.end,
  });

  final bool enabled;
  final String? start; // "09:00"
  final String? end; // "17:00"

  Map<String, Object?> toMap() => {
        'enabled': enabled,
        'start': start,
        'end': end,
      };

  factory WorkingDay.fromMap(Map<String, dynamic> map) {
    return WorkingDay(
      enabled: map['enabled'] as bool? ?? false,
      start: map['start'] as String?,
      end: map['end'] as String?,
    );
  }

  WorkingDay copyWith({bool? enabled, String? start, String? end}) {
    return WorkingDay(
      enabled: enabled ?? this.enabled,
      start: start ?? this.start,
      end: end ?? this.end,
    );
  }

  /// Total working minutes for this day, or 0 if disabled.
  int get totalMinutes {
    if (!enabled || start == null || end == null) return 0;
    final sParts = start!.split(':').map(int.parse).toList();
    final eParts = end!.split(':').map(int.parse).toList();
    return (eParts[0] * 60 + eParts[1]) - (sParts[0] * 60 + sParts[1]);
  }
}

class UserSettings {
  const UserSettings({
    required this.avgBookingValue,
    required this.slotDurationMinutes,
    required this.workingHours,
    required this.calendarSource,
    required this.providerType,
    required this.growthGoal,
    this.timezone = 'UTC',
  });

  final double avgBookingValue;
  final int slotDurationMinutes;
  final Map<String, WorkingDay> workingHours; // keyed by lowercase day name
  final String calendarSource;
  final String providerType;
  final String growthGoal;
  final String timezone; // IANA timezone e.g. 'America/New_York'

  factory UserSettings.defaults() {
    return UserSettings(
      avgBookingValue: SocelleConstants.defaultAvgBookingValue,
      slotDurationMinutes: SocelleConstants.defaultSlotDurationMinutes,
      calendarSource: SocelleConstants.defaultCalendarSource,
      providerType: SocelleConstants.defaultProviderType,
      growthGoal: SocelleConstants.defaultGrowthGoal,
      workingHours: {
        for (final entry in SocelleConstants.defaultWorkingHours.entries)
          entry.key: WorkingDay(
            enabled: entry.value['enabled'] as bool,
            start: entry.value['start'] as String?,
            end: entry.value['end'] as String?,
          ),
      },
    );
  }

  UserSettings copyWith({
    double? avgBookingValue,
    int? slotDurationMinutes,
    Map<String, WorkingDay>? workingHours,
    String? calendarSource,
    String? providerType,
    String? growthGoal,
    String? timezone,
  }) {
    return UserSettings(
      avgBookingValue: avgBookingValue ?? this.avgBookingValue,
      slotDurationMinutes: slotDurationMinutes ?? this.slotDurationMinutes,
      workingHours: workingHours ?? this.workingHours,
      calendarSource: calendarSource ?? this.calendarSource,
      providerType: providerType ?? this.providerType,
      growthGoal: growthGoal ?? this.growthGoal,
      timezone: timezone ?? this.timezone,
    );
  }

  /// Serializes to a map suitable for Cloud Functions API calls.
  Map<String, Map<String, Object?>> workingHoursApiMap() {
    return {
      for (final entry in workingHours.entries) entry.key: entry.value.toMap(),
    };
  }

  String toJson() => jsonEncode(toMap());

  Map<String, dynamic> toMap() => {
        'avgBookingValue': avgBookingValue,
        'slotDurationMinutes': slotDurationMinutes,
        'calendarSource': calendarSource,
        'providerType': providerType,
        'growthGoal': growthGoal,
        'timezone': timezone,
        'workingHours': {
          for (final entry in workingHours.entries)
            entry.key: entry.value.toMap(),
        },
      };

  factory UserSettings.fromJson(String json) {
    return UserSettings.fromMap(jsonDecode(json) as Map<String, dynamic>);
  }

  factory UserSettings.fromMap(Map<String, dynamic> map) {
    final whRaw = map['workingHours'] as Map<String, dynamic>?;
    final wh = <String, WorkingDay>{};
    if (whRaw != null) {
      for (final entry in whRaw.entries) {
        wh[entry.key] = WorkingDay.fromMap(entry.value as Map<String, dynamic>);
      }
    }

    return UserSettings(
      avgBookingValue: (map['avgBookingValue'] as num?)?.toDouble() ??
          SocelleConstants.defaultAvgBookingValue,
      slotDurationMinutes: (map['slotDurationMinutes'] as num?)?.toInt() ??
          SocelleConstants.defaultSlotDurationMinutes,
      calendarSource: map['calendarSource'] as String? ??
          SocelleConstants.defaultCalendarSource,
      providerType: map['providerType'] as String? ??
          SocelleConstants.defaultProviderType,
      growthGoal:
          map['growthGoal'] as String? ?? SocelleConstants.defaultGrowthGoal,
      workingHours: wh.isNotEmpty ? wh : UserSettings.defaults().workingHours,
      timezone: map['timezone'] as String? ?? 'UTC',
    );
  }
}
