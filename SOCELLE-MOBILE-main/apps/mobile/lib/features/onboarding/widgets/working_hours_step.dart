import 'package:flutter/material.dart';

import '../../../core/constants.dart';
import '../../../core/theme/socelle_colors.dart';
import '../../../models/user_settings.dart';

class WorkingHoursStep extends StatelessWidget {
  const WorkingHoursStep({
    super.key,
    required this.workingHours,
    required this.onChanged,
    this.footer,
  });

  final Map<String, WorkingDay> workingHours;
  final ValueChanged<Map<String, WorkingDay>> onChanged;
  final Widget? footer;

  void _toggleDay(String day) {
    final updated = Map<String, WorkingDay>.from(workingHours);
    final current = updated[day]!;
    updated[day] = WorkingDay(
      enabled: !current.enabled,
      start: current.start ?? '09:00',
      end: current.end ?? '17:00',
    );
    onChanged(updated);
  }

  Future<void> _pickTime(
    BuildContext context,
    String day,
    bool isStart,
  ) async {
    final current = workingHours[day]!;
    final timeStr = isStart ? current.start : current.end;
    final parts = (timeStr ?? '09:00').split(':');
    final initial = TimeOfDay(
      hour: int.parse(parts[0]),
      minute: int.parse(parts[1]),
    );

    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: false),
          child: child!,
        );
      },
    );

    if (picked == null) return;

    final formatted =
        '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';

    final updated = Map<String, WorkingDay>.from(workingHours);
    final day_ = updated[day]!;
    updated[day] = WorkingDay(
      enabled: day_.enabled,
      start: isStart ? formatted : day_.start,
      end: isStart ? day_.end : formatted,
    );
    onChanged(updated);
  }

  String _formatTime(String? time) {
    if (time == null) return '--:--';
    final parts = time.split(':');
    final hour = int.parse(parts[0]);
    final minute = parts[1];
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    return '$displayHour:$minute $period';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 48),
          Text(
            'Set your\nworking hours',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 12),
          Text(
            "We only look for gaps during your working hours. Evenings and days off won't count.",
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          Expanded(
            child: ListView.separated(
              itemCount: SocelleConstants.dayNames.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final day = SocelleConstants.dayNames[index];
                final abbr = SocelleConstants.dayAbbreviations[day]!;
                final wh = workingHours[day]!;

                return Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: wh.enabled
                        ? SocelleColors.cardBackground
                        : SocelleColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: wh.enabled
                          ? SocelleColors.border
                          : SocelleColors.divider,
                    ),
                  ),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 48,
                        child: Text(
                          abbr,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: wh.enabled
                                ? SocelleColors.textPrimary
                                : SocelleColors.textMuted,
                          ),
                        ),
                      ),
                      Switch.adaptive(
                        value: wh.enabled,
                        onChanged: (_) => _toggleDay(day),
                        activeTrackColor: SocelleColors.primary,
                      ),
                      if (wh.enabled) ...[
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () => _pickTime(context, day, true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: SocelleColors.surface,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _formatTime(wh.start),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 6),
                          child: Text('–',
                              style:
                                  TextStyle(color: SocelleColors.textMuted)),
                        ),
                        GestureDetector(
                          onTap: () => _pickTime(context, day, false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: SocelleColors.surface,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _formatTime(wh.end),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      ] else
                        const Padding(
                          padding: EdgeInsets.only(left: 12),
                          child: Text(
                            'Day off',
                            style: TextStyle(
                              color: SocelleColors.textMuted,
                              fontSize: 13,
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          ),
          if (footer != null) ...[
            const SizedBox(height: 12),
            footer!,
          ],
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
