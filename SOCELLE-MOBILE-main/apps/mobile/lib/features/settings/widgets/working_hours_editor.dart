import 'package:flutter/material.dart';

import '../../../core/constants.dart';
import '../../../core/theme/socelle_colors.dart';
import '../../../models/user_settings.dart';

class WorkingHoursEditor extends StatelessWidget {
  const WorkingHoursEditor({
    super.key,
    required this.workingHours,
    required this.onDayToggled,
    required this.onTimeChanged,
  });

  final Map<String, WorkingDay> workingHours;
  final ValueChanged<String> onDayToggled;
  final void Function(String day, bool isStart, String time) onTimeChanged;

  String _formatTime(String? time) {
    if (time == null) return '--:--';
    final parts = time.split(':');
    final hour = int.parse(parts[0]);
    final minute = parts[1];
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour);
    return '$displayHour:$minute $period';
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
    );

    if (picked == null) return;
    final formatted =
        '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
    onTimeChanged(day, isStart, formatted);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: SocelleColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SocelleColors.divider),
      ),
      child: Column(
        children: SocelleConstants.dayNames.map((day) {
          final wh = workingHours[day]!;
          final abbr = SocelleConstants.dayAbbreviations[day]!;
          final isLast = day == SocelleConstants.dayNames.last;

          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              border: isLast
                  ? null
                  : const Border(
                      bottom: BorderSide(color: SocelleColors.divider),
                    ),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 40,
                  child: Text(
                    abbr,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: wh.enabled
                          ? SocelleColors.textPrimary
                          : SocelleColors.textMuted,
                    ),
                  ),
                ),
                Switch.adaptive(
                  value: wh.enabled,
                  onChanged: (_) => onDayToggled(day),
                  activeTrackColor: SocelleColors.primary,
                ),
                if (wh.enabled) ...[
                  const Spacer(),
                  GestureDetector(
                    onTap: () => _pickTime(context, day, true),
                    child: Text(
                      _formatTime(wh.start),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: SocelleColors.primary,
                      ),
                    ),
                  ),
                  const Text(' - ',
                      style: TextStyle(color: SocelleColors.textMuted)),
                  GestureDetector(
                    onTap: () => _pickTime(context, day, false),
                    child: Text(
                      _formatTime(wh.end),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: SocelleColors.primary,
                      ),
                    ),
                  ),
                ] else ...[
                  const SizedBox(width: 8),
                  const Text(
                    'Day off',
                    style: TextStyle(
                      fontSize: 13,
                      color: SocelleColors.textMuted,
                    ),
                  ),
                ],
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}
