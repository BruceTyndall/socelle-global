import 'dart:math';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// Typed analytics wrapper for all Socelle events.
/// Backed by Firebase Analytics. Call methods anywhere — they are no-ops if
/// Firebase is not initialized.
class AnalyticsService {
  static FirebaseAnalytics? _analytics;

  /// In-memory session ID — new UUID on each foreground. Never persisted.
  static String _sessionId = _newSessionId();

  static String _newSessionId() {
    final rng = Random.secure();
    return List.generate(16, (_) => rng.nextInt(256).toRadixString(16).padLeft(2, '0')).join();
  }

  static Future<void> initialize() async {
    try {
      _analytics = FirebaseAnalytics.instance;
    } catch (e) {
      debugPrint('AnalyticsService: init failed — $e');
    }
  }

  /// Call on every foreground event. Resets the session ID.
  /// Calls the Cloud Function to reset inactivity tier server-side.
  static Future<void> trackAppOpenRemote({
    required String source,
    String? pushNotifId,
  }) async {
    // Rotate session ID on each foreground
    _sessionId = _newSessionId();

    bool notificationsEnabled = false;
    try {
      final settings = await FirebaseMessaging.instance.getNotificationSettings();
      notificationsEnabled =
          settings.authorizationStatus == AuthorizationStatus.authorized;
    } catch (_) {}

    try {
      final fn = FirebaseFunctions.instance.httpsCallable('trackAppOpen');
      await fn.call({
        'sessionId': _sessionId,
        'source': source,
        if (pushNotifId != null) 'pushNotifId': pushNotifId,
        'notificationsEnabled': notificationsEnabled,
      });
    } catch (e) {
      // Non-fatal — inactivity tier will be corrected on next scheduled compute
      debugPrint('AnalyticsService: trackAppOpenRemote failed — $e');
    }
  }

  static Future<void> _log(String name,
      [Map<String, Object>? params]) async {
    try {
      await _analytics?.logEvent(name: name, parameters: params);
    } catch (e) {
      debugPrint('AnalyticsService: log "$name" failed — $e');
    }
  }

  // ── ACTIVATION EVENTS ──────────────────────────────────────────────────

  static Future<void> calendarConnected(String source) =>
      _log('calendar_connected', {'source': source});

  static Future<void> firstGapDetected() =>
      _log('first_gap_detected');

  static Future<void> firstGapActionTaken(String actionType) =>
      _log('first_gap_action_taken', {'action_type': actionType});

  static Future<void> firstGapFilled() =>
      _log('first_gap_filled');

  static Future<void> paywallSeen(String triggerType) =>
      _log('paywall_seen', {'trigger_type': triggerType});

  static Future<void> subscriptionStarted(String plan, {int trialDays = 7}) =>
      _log('subscription_started', {'plan': plan, 'trial_days': trialDays});

  static Future<void> subscriptionStateChanged(
          String from, String to, {String? reason}) =>
      _log('subscription_state_changed', {
        'from': from,
        'to': to,
        if (reason != null) 'reason': reason,
      });

  // ── ENGAGEMENT EVENTS ──────────────────────────────────────────────────

  static Future<void> appOpened({String source = 'organic', String? pushNotifId}) =>
      _log('app_opened', {
        'source': source,
        'session_id': _sessionId,
        if (pushNotifId != null) 'push_notif_id': pushNotifId,
      });

  static Future<void> notificationReceived(String tier, String frame) =>
      _log('notification_received', {'tier': tier, 'frame': frame});

  static Future<void> notificationOpened(String tier) =>
      _log('notification_opened', {'tier': tier});

  static Future<void> notificationDismissed() =>
      _log('notification_dismissed');

  static Future<void> gapCardViewed(String gapId) =>
      _log('gap_card_viewed', {'gap_id': gapId});

  static Future<void> gapActionTaken(String actionType, String gapId) =>
      _log('gap_action_taken', {'action_type': actionType, 'gap_id': gapId});

  static Future<void> gapDetected(
          String gapId, double slotValueUsd, int leadTimeHours, String weekday) =>
      _log('gap_detected', {
        'gap_id': gapId,
        'slot_value_usd': slotValueUsd.round(),
        'lead_time_hours': leadTimeHours,
        'weekday': weekday,
      });

  static Future<void> gapFilled({
    required String gapId,
    required double leakageValue,
    String fillSource = 'manual',
  }) =>
      _log('gap_filled', {
        'gap_id': gapId,
        'leakage_value': leakageValue.round(),
        'fill_source': fillSource,
      });

  static Future<void> recoveryConfirmed(
          String gapId, double slotValueUsd, int streakDay) =>
      _log('recovery_confirmed', {
        'gap_id': gapId,
        'slot_value_usd': slotValueUsd.round(),
        'streak_day': streakDay,
      });

  static Future<void> fillSourceAttribution(String gapId, String source) =>
      _log('fill_source_attribution', {'gap_id': gapId, 'source': source});

  static Future<void> weeklySummaryViewed() =>
      _log('weekly_summary_viewed');

  static Future<void> streakContinued(int streakCount) =>
      _log('streak_continued', {'streak_count': streakCount});

  static Future<void> streakBroken() =>
      _log('streak_broken');

  static Future<void> streakRecovered() =>
      _log('streak_recovered');

  static Future<void> broadcastSent() =>
      _log('broadcast_sent');

  // ── FATIGUE / CHURN INDICATORS ─────────────────────────────────────────

  static Future<void> consecutiveDismissals(int count) =>
      _log('consecutive_dismissals', {'count': count});

  static Future<void> notificationsOsDisabled() =>
      _log('notifications_os_disabled');

  static Future<void> sevenDayAbsence() =>
      _log('seven_day_absence');

  static Future<void> inactivityTierChanged(int tier, int daysSinceOpen) =>
      _log('inactivity_tier_changed', {
        'tier': tier,
        'days_since_open': daysSinceOpen,
      });

  static Future<void> reEngagementSuccess(int tier, int daysSinceOpen) =>
      _log('re_engagement_success', {
        'tier': tier,
        'days_since_open': daysSinceOpen,
      });

  static Future<void> interventionSent(int tier, String channel) =>
      _log('intervention_sent', {'tier': tier, 'channel': channel});

  // ── CONVERSION EVENTS ──────────────────────────────────────────────────

  static Future<void> valueTriggerFired(String triggerType) =>
      _log('value_trigger_fired', {'trigger_type': triggerType});

  static Future<void> paywallDismissed(String triggerType) =>
      _log('paywall_dismissed', {'trigger_type': triggerType});

  static Future<void> trialToPaidConverted(String plan) =>
      _log('trial_to_paid_converted', {'plan': plan});

  static Future<void> refundRequested() =>
      _log('refund_requested');

  // ── CANCELLATION EVENTS ────────────────────────────────────────────────

  static Future<void> cancellationFlowStarted() =>
      _log('cancellation_flow_started');

  static Future<void> exitSurveyCompleted(String reason) =>
      _log('exit_survey_completed', {'reason': reason});

  static Future<void> cancellationPrevented(String method) =>
      _log('cancellation_prevented', {'method': method});

  static Future<void> subscriptionCancelled(String reason) =>
      _log('subscription_cancelled', {'reason': reason});

  // ── RESURRECTION EVENTS ────────────────────────────────────────────────

  static Future<void> resurrectionEmailSent(String type) =>
      _log('resurrection_email_sent', {'type': type});

  static Future<void> resurrectionSuccess(
      String type, int daysSinceCancellation) =>
      _log('resurrection_success', {
        'type': type,
        'days_since_cancellation': daysSinceCancellation,
      });
}
