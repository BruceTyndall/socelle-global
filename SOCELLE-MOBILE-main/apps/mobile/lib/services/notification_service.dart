import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';

import 'analytics_service.dart';

/// Handles FCM token registration, permission requests, and foreground
/// message routing. Call [initialize] once after Firebase is ready.
class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static bool _initialized = false;

  /// Broadcasts incoming foreground [RemoteMessage] objects to any UI listener.
  ///
  /// The [AppShell] (or any StatefulWidget higher in the tree) subscribes to
  /// this stream and shows an in-app banner when a message arrives.
  static final StreamController<RemoteMessage> _foregroundController =
      StreamController<RemoteMessage>.broadcast();

  static Stream<RemoteMessage> get foregroundMessages =>
      _foregroundController.stream;

  /// Called once on app launch (after Firebase.initializeApp).
  static Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    try {
      // Request permission (iOS prompts; Android 13+ prompts)
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        await AnalyticsService.notificationsOsDisabled();
        debugPrint('NotificationService: permission denied');
        return;
      }

      // Register FCM token
      await _registerToken();

      // Listen for token refresh
      _messaging.onTokenRefresh.listen((token) async {
        await _storeToken(token);
      });

      // Handle foreground messages — show in-app banner via overlay
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background tap — app opens from terminated state
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      // Check if app was launched from a notification
      final initial = await _messaging.getInitialMessage();
      if (initial != null) {
        _handleNotificationTap(initial);
      }

      debugPrint('NotificationService: initialized');
    } catch (e) {
      debugPrint('NotificationService: initialize failed — $e');
    }
  }

  static Future<void> _registerToken() async {
    try {
      final token = await _messaging.getToken();
      if (token != null) {
        await _storeToken(token);
      }
    } catch (e) {
      debugPrint('NotificationService: token registration failed — $e');
    }
  }

  static Future<void> _storeToken(String token) async {
    try {
      final platform = defaultTargetPlatform.name.toLowerCase();
      await FirebaseFunctions.instance
          .httpsCallable('storeFcmToken')
          .call({'token': token, 'platform': platform});
      debugPrint('NotificationService: FCM token stored');
    } catch (e) {
      debugPrint('NotificationService: storeFcmToken failed — $e');
    }
  }

  static void _handleForegroundMessage(RemoteMessage message) {
    final tier = message.data['tier'] as String? ?? 'unknown';
    final frame = message.data['frame'] as String? ?? 'unknown';
    AnalyticsService.notificationReceived(tier, frame);
    debugPrint(
        'NotificationService: foreground message — ${message.notification?.title}');
    // Broadcast to the UI layer so widgets can show an in-app banner.
    _foregroundController.add(message);
  }

  static void _handleNotificationTap(RemoteMessage message) {
    final tier = message.data['tier'] as String? ?? 'unknown';
    AnalyticsService.notificationOpened(tier);
    // Route to dashboard — navigation is handled at the AppShell level.
    // The app navigates to index 0 (Dashboard) by default on launch.
    debugPrint(
        'NotificationService: notification tapped — tier $tier');
  }

  /// Call this when the user explicitly dismisses a notification from
  /// within the app (e.g., dismisses an in-app banner).
  static Future<void> onNotificationDismissed() async {
    await AnalyticsService.notificationDismissed();
    // The Cloud Function (scheduled_checker) tracks consecutive dismissals
    // server-side via notification_state. This client call logs to Analytics.
  }

  /// Check current OS permission status and log if notifications are disabled.
  static Future<bool> checkPermissionStatus() async {
    try {
      final settings = await _messaging.getNotificationSettings();
      final granted =
          settings.authorizationStatus == AuthorizationStatus.authorized ||
              settings.authorizationStatus == AuthorizationStatus.provisional;
      if (!granted) {
        await AnalyticsService.notificationsOsDisabled();
      }
      return granted;
    } catch (e) {
      return false;
    }
  }
}
