import 'package:device_calendar/device_calendar.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

/// A device-side event returned by [AppleCalendarService.fetchEvents].
/// ISO strings match the format expected by the [syncCalendarEvents] CF.
class DeviceCalendarEvent {
  const DeviceCalendarEvent({
    required this.startIso,
    required this.endIso,
    this.allDay = false,
  });

  final String startIso;
  final String endIso;
  final bool allDay;

  Map<String, dynamic> toMap() => {
        'startIso': startIso,
        'endIso': endIso,
        if (allDay) 'allDay': true,
      };
}

/// Result of a permission + fetch call.
sealed class AppleCalendarResult {}

class AppleCalendarSuccess extends AppleCalendarResult {
  AppleCalendarSuccess(this.events);
  final List<DeviceCalendarEvent> events;
}

class AppleCalendarPermissionDenied extends AppleCalendarResult {}

class AppleCalendarError extends AppleCalendarResult {
  AppleCalendarError(this.message);
  final String message;
}

/// Reads events from the device's native calendar (EventKit on iOS).
///
/// Permission is requested on first call. If the user denies, returns
/// [AppleCalendarPermissionDenied] — the caller must surface a graceful
/// fallback and optionally a deep-link to iOS Settings.
///
/// Events are returned as [DeviceCalendarEvent] objects formatted for
/// direct inclusion in the [syncCalendarEvents] Cloud Function payload.
class AppleCalendarService {
  AppleCalendarService({DeviceCalendarPlugin? plugin})
      : _plugin = plugin ?? DeviceCalendarPlugin();

  final DeviceCalendarPlugin _plugin;

  /// Fetch all device calendar events in [start]–[end] (inclusive).
  ///
  /// Flow:
  /// 1. Check / request EventKit permission.
  /// 2. On denial → [AppleCalendarPermissionDenied].
  /// 3. Retrieve all writable + readable calendars.
  /// 4. Fetch events from each calendar in the range.
  /// 5. Deduplicate by event ID and return as [AppleCalendarSuccess].
  Future<AppleCalendarResult> fetchEvents({
    required DateTime start,
    required DateTime end,
  }) async {
    try {
      // ── Permission ──────────────────────────────────────────
      var permResult = await _plugin.hasPermissions();
      if (permResult.isSuccess && permResult.data == false) {
        permResult = await _plugin.requestPermissions();
      }

      if (!permResult.isSuccess || permResult.data != true) {
        return AppleCalendarPermissionDenied();
      }

      // ── Calendar discovery ──────────────────────────────────
      final calendarsResult = await _plugin.retrieveCalendars();
      if (!calendarsResult.isSuccess || calendarsResult.data == null) {
        return AppleCalendarError(
          calendarsResult.errors.map((e) => e.errorMessage).join(', '),
        );
      }

      final calendarIds = calendarsResult.data!
          .where((cal) => cal.id != null)
          .map((cal) => cal.id!)
          .toList();

      if (calendarIds.isEmpty) {
        return AppleCalendarSuccess([]);
      }

      // ── Event fetch ─────────────────────────────────────────
      final seen = <String>{};
      final events = <DeviceCalendarEvent>[];

      for (final calendarId in calendarIds) {
        final eventsResult = await _plugin.retrieveEvents(
          calendarId,
          RetrieveEventsParams(
            startDate: start,
            endDate: end,
          ),
        );

        if (!eventsResult.isSuccess || eventsResult.data == null) {
          continue;
        }

        for (final event in eventsResult.data!) {
          // Skip events with no time bounds.
          if (event.start == null || event.end == null) continue;

          // Deduplicate across calendars (event.eventId may repeat for shared events).
          final dedupeKey = event.eventId ?? '${event.start}|${event.end}|${event.title}';
          if (!seen.add(dedupeKey)) continue;

          final isAllDay = event.allDay ?? false;

          // All-day events: use midnight-to-midnight UTC to avoid timezone edge cases.
          final eventStart = isAllDay
              ? DateTime.utc(
                  event.start!.year, event.start!.month, event.start!.day)
              : event.start!.toUtc();

          final eventEnd = isAllDay
              ? DateTime.utc(
                  event.end!.year, event.end!.month, event.end!.day, 23, 59, 59)
              : event.end!.toUtc();

          // Skip zero-duration or inverted events.
          if (!eventEnd.isAfter(eventStart)) continue;

          events.add(DeviceCalendarEvent(
            startIso: eventStart.toIso8601String(),
            endIso: eventEnd.toIso8601String(),
            allDay: isAllDay,
          ));
        }
      }

      return AppleCalendarSuccess(events);
    } on PlatformException catch (e) {
      return AppleCalendarError('Platform error: ${e.message}');
    } catch (e) {
      return AppleCalendarError('Unexpected error: $e');
    }
  }

  /// Deep-link the user to iOS Settings → Socelle to grant calendar access.
  /// Call this when [AppleCalendarPermissionDenied] is returned and the user
  /// explicitly requests to fix it (never call proactively).
  static Future<void> openSystemSettings() async {
    final uri = Uri.parse('app-settings:');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
