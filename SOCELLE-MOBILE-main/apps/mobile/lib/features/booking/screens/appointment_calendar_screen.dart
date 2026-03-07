import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Calendar view for appointments using table_calendar.
///
/// DEMO surface.
class AppointmentCalendarScreen extends StatefulWidget {
  const AppointmentCalendarScreen({super.key});

  @override
  State<AppointmentCalendarScreen> createState() => _AppointmentCalendarScreenState();
}

class _AppointmentCalendarScreenState extends State<AppointmentCalendarScreen> {
  CalendarFormat _calendarFormat = CalendarFormat.month;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Calendar'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: Column(
        children: [
          TableCalendar(
            firstDay: DateTime.utc(2024, 1, 1),
            lastDay: DateTime.utc(2028, 12, 31),
            focusedDay: _focusedDay,
            calendarFormat: _calendarFormat,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            },
            onFormatChanged: (format) {
              setState(() => _calendarFormat = format);
            },
            onPageChanged: (focusedDay) {
              _focusedDay = focusedDay;
            },
            calendarStyle: CalendarStyle(
              todayDecoration: BoxDecoration(
                color: SocelleTheme.accent.withValues(alpha: 0.3),
                shape: BoxShape.circle,
              ),
              selectedDecoration: const BoxDecoration(
                color: SocelleTheme.graphite,
                shape: BoxShape.circle,
              ),
              weekendTextStyle: SocelleTheme.bodyMedium.copyWith(color: SocelleTheme.textMuted),
              defaultTextStyle: SocelleTheme.bodyMedium.copyWith(color: SocelleTheme.graphite),
              outsideTextStyle: SocelleTheme.bodySmall,
            ),
            headerStyle: HeaderStyle(
              formatButtonVisible: true,
              titleCentered: true,
              titleTextStyle: SocelleTheme.titleMedium,
              formatButtonDecoration: BoxDecoration(
                border: Border.all(color: SocelleTheme.borderLight),
                borderRadius: SocelleTheme.borderRadiusPill,
              ),
              formatButtonTextStyle: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.graphite),
            ),
            daysOfWeekStyle: DaysOfWeekStyle(
              weekdayStyle: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.textMuted),
              weekendStyle: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.textFaint),
            ),
          ),

          const Divider(),

          // Selected day appointments
          Expanded(
            child: _selectedDay != null
                ? ListView(
                    padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                    children: [
                      Text(
                        'Appointments',
                        style: SocelleTheme.titleMedium,
                      ),
                      const SizedBox(height: SocelleTheme.spacingMd),
                      Center(
                        child: Text(
                          'No appointments on this day.',
                          style: SocelleTheme.bodyMedium,
                        ),
                      ),
                    ],
                  )
                : Center(
                    child: Text(
                      'Select a day to view appointments.',
                      style: SocelleTheme.bodyMedium,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
