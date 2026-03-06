import 'package:cloud_functions/cloud_functions.dart';

import '../models/gap_action.dart';
import '../models/sync_models.dart';
import '../models/user_settings.dart';
import 'apple_calendar_service.dart';

class SocelleApi {
  SocelleApi({FirebaseFunctions? functions})
      : _functions = functions ?? FirebaseFunctions.instance;

  final FirebaseFunctions _functions;

  Future<bool> getGoogleConnectionStatus() async {
    final callable = _functions.httpsCallable('getCalendarConnectionStatus');
    final response = await callable.call();
    final data = response.data;
    if (data is! Map<Object?, Object?>) {
      throw Exception('Unexpected connection status response format');
    }
    return data['googleConnected'] == true;
  }

  Future<void> storeGoogleRefreshToken(String refreshToken) async {
    final callable = _functions.httpsCallable('storeCalendarTokens');
    await callable.call(<String, Object?>{
      'calendarSource': 'google',
      'tokenPayload': <String, Object?>{
        'refreshToken': refreshToken,
      },
    });
  }

  /// Sends a one-time Google server auth code to the backend.
  /// The [storeCalendarTokens] CF exchanges it for a refresh token
  /// and stores it encrypted in Firestore.
  Future<void> storeGoogleServerAuthCode(String serverAuthCode) async {
    final callable = _functions.httpsCallable('storeCalendarTokens');
    await callable.call(<String, Object?>{
      'calendarSource': 'google',
      'tokenPayload': <String, Object?>{
        'serverAuthCode': serverAuthCode,
      },
    });
  }

  Future<void> revokeGoogleTokens() async {
    final callable = _functions.httpsCallable('revokeCalendarTokens');
    await callable.call(<String, Object?>{
      'calendarSource': 'google',
    });
  }

  Future<SyncResult> syncCalendarEvents({
    required UserSettings settings,
    required DateTime start,
    required DateTime end,
    /// Pre-read device events for Apple Calendar.
    /// Obtain via [AppleCalendarService.fetchEvents] before calling this method.
    List<DeviceCalendarEvent>? deviceEvents,
  }) async {
    final callable = _functions.httpsCallable('syncCalendarEvents');
    final response = await callable.call(<String, Object?>{
      'calendarSource': settings.calendarSource,
      'startIso': start.toUtc().toIso8601String(),
      'endIso': end.toUtc().toIso8601String(),
      'slotDurationMinutes': settings.slotDurationMinutes,
      'avgBookingValue': settings.avgBookingValue,
      'providerType': settings.providerType,
      'growthGoal': settings.growthGoal,
      'workingHours': settings.workingHoursApiMap(),
      'timezone': settings.timezone,
      if (deviceEvents != null && deviceEvents.isNotEmpty)
        'deviceEvents': deviceEvents.map((e) => e.toMap()).toList(),
    });

    final data = response.data;
    if (data is! Map<Object?, Object?>) {
      throw Exception('Unexpected sync response format');
    }

    return SyncResult.fromCallableMap(data);
  }

  Future<void> updateGapStatus({
    required String startIso,
    required String endIso,
    required GapStatus status,
    IntentionalReason? intentionalReason,
  }) async {
    final callable = _functions.httpsCallable('updateGapStatus');
    await callable.call(<String, Object?>{
      'startIso': startIso,
      'endIso': endIso,
      'status': status.name,
      'intentionalReason':
          status == GapStatus.intentional ? intentionalReason?.value : null,
    });
  }
}
