import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:flutter/foundation.dart';

/// A/B test infrastructure using Firebase Remote Config.
///
/// 6 tests per the blueprint — all default to the "control" variant.
/// Set values in Firebase Remote Config console to activate variants.
class AbTestService {
  static FirebaseRemoteConfig? _rc;

  static const _defaults = <String, dynamic>{
    // Test 1: Paywall trigger timing
    // "day7" = show paywall on day 7 of trial (control)
    // "leakage_200" = show paywall when cumulative leakage >= $200
    'paywall_trigger_timing': 'day7',

    // Test 2: Single gap focus
    // "full_list" = show all gaps (control)
    // "single_gap" = show only top gap with "Show all" expander
    'single_gap_focus': 'full_list',

    // Test 3: Notification framing rotation
    // "dollar_only" = always use dollar-loss frame (control)
    // "rotating" = rotate through 4 frame types
    'notification_framing': 'dollar_only',

    // Test 4: Intensity control opt-in
    // "no_setting" = no notification frequency setting shown (control)
    // "show_at_day14" = show frequency setting after day 14
    'intensity_control_opt_in': 'no_setting',

    // Test 5: Recovery confirmation flow
    // "share_sheet" = share sheet exits app, user returns (control)
    // "in_app" = in-app confirmation flow with recovery animation
    'recovery_confirmation': 'share_sheet',

    // Test 6: Expectation microcopy on paywall
    // "without" = standard paywall (control)
    // "with" = paywall + expectation-setting paragraph
    'expectation_microcopy': 'without',

    // Feature flags for resurrection engine
    'seasonal_resurrection_active': false,
    'product_update_resurrection_active': false,
  };

  static Future<void> initialize() async {
    try {
      _rc = FirebaseRemoteConfig.instance;
      await _rc!.setConfigSettings(RemoteConfigSettings(
        fetchTimeout: const Duration(seconds: 10),
        minimumFetchInterval: const Duration(hours: 1),
      ));
      await _rc!.setDefaults(_defaults);
      await _rc!.fetchAndActivate();
    } catch (e) {
      debugPrint('AbTestService: init failed — $e');
    }
  }

  static String _str(String key) {
    try {
      return _rc?.getString(key) ?? (_defaults[key] as String? ?? '');
    } catch (_) {
      return _defaults[key] as String? ?? '';
    }
  }

  static bool _bool(String key) {
    try {
      return _rc?.getBool(key) ?? (_defaults[key] as bool? ?? false);
    } catch (_) {
      return _defaults[key] as bool? ?? false;
    }
  }

  // ── Test accessors ──────────────────────────────────────────────────────

  /// Test 1: "day7" | "leakage_200"
  static String paywallTriggerTiming() => _str('paywall_trigger_timing');

  /// Test 2: "full_list" | "single_gap"
  static String singleGapFocus() => _str('single_gap_focus');

  /// Test 3: "dollar_only" | "rotating"
  static String notificationFraming() => _str('notification_framing');

  /// Test 4: "no_setting" | "show_at_day14"
  static String intensityControlOptIn() => _str('intensity_control_opt_in');

  /// Test 5: "share_sheet" | "in_app"
  static String recoveryConfirmation() => _str('recovery_confirmation');

  /// Test 6: "without" | "with"
  static String expectationMicrocopy() => _str('expectation_microcopy');

  // ── Feature flags ───────────────────────────────────────────────────────

  static bool seasonalResurrectionActive() =>
      _bool('seasonal_resurrection_active');

  static bool productUpdateResurrectionActive() =>
      _bool('product_update_resurrection_active');
}
