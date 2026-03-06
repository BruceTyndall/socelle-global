import 'dart:convert';

class DailyRitualState {
  const DailyRitualState({
    required this.dateKey,
    required this.tasks,
  });

  final String dateKey; // yyyy-mm-dd (local)
  final Map<String, bool> tasks;

  static const defaultTasks = <String, bool>{
    'sync': false,
    'campaign': false,
    'bump': false,
    'review': false,
  };

  factory DailyRitualState.forToday([DateTime? now]) {
    final local = now?.toLocal() ?? DateTime.now();
    final dateKey =
        '${local.year.toString().padLeft(4, '0')}-${local.month.toString().padLeft(2, '0')}-${local.day.toString().padLeft(2, '0')}';
    return const DailyRitualState(
      dateKey: '',
      tasks: defaultTasks,
    ).copyWith(dateKey: dateKey);
  }

  DailyRitualState copyWith({
    String? dateKey,
    Map<String, bool>? tasks,
  }) {
    return DailyRitualState(
      dateKey: dateKey ?? this.dateKey,
      tasks: tasks ?? this.tasks,
    );
  }

  int get completedCount => tasks.values.where((v) => v).length;
  int get totalCount => tasks.length;
  double get progress => totalCount == 0 ? 0 : completedCount / totalCount;

  String toJson() => jsonEncode(toMap());

  Map<String, dynamic> toMap() => {
        'dateKey': dateKey,
        'tasks': tasks,
      };

  factory DailyRitualState.fromJson(String raw) {
    return DailyRitualState.fromMap(jsonDecode(raw) as Map<String, dynamic>);
  }

  factory DailyRitualState.fromMap(Map<String, dynamic> map) {
    final rawTasks = map['tasks'] as Map<String, dynamic>? ?? {};
    final tasks = <String, bool>{
      for (final e in defaultTasks.entries) e.key: e.value,
    };
    for (final entry in rawTasks.entries) {
      tasks[entry.key] = entry.value == true;
    }
    return DailyRitualState(
      dateKey: map['dateKey'] as String? ?? DailyRitualState.forToday().dateKey,
      tasks: tasks,
    );
  }
}
