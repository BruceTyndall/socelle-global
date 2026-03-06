import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/daily_ritual.dart';
import '../models/notification_state.dart';
import '../models/streak.dart';
import '../models/subscription_state.dart';
import '../models/user_settings.dart';

class SettingsStorage {
  static const _keySettings = 'user_settings';
  static const _keyOnboardingComplete = 'onboarding_complete';
  static const _keyRecoveredRevenue = 'recovered_revenue_total';
  static const _keyFilledGapIds = 'filled_gap_ids';
  static const _keyStreak = 'streak_data';
  static const _keySubscription = 'subscription_data';
  static const _keyLastSyncAt = 'last_sync_at';
  static const _keyReferralCode = 'referral_code';
  static const _keyReviewPrompted = 'last_review_prompt';
  static const _keyDailyRitual = 'daily_ritual_state';

  SharedPreferences? _prefs;

  Future<SharedPreferences> get prefs async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  // --- User Settings ---

  Future<UserSettings> loadSettings() async {
    final p = await prefs;
    final json = p.getString(_keySettings);
    if (json == null) return UserSettings.defaults();
    return UserSettings.fromJson(json);
  }

  Future<void> saveSettings(UserSettings settings) async {
    final p = await prefs;
    await p.setString(_keySettings, settings.toJson());
  }

  // --- Onboarding ---

  Future<bool> isOnboardingComplete() async {
    final p = await prefs;
    return p.getBool(_keyOnboardingComplete) ?? false;
  }

  Future<void> setOnboardingComplete() async {
    final p = await prefs;
    await p.setBool(_keyOnboardingComplete, true);
  }

  // --- Recovered Revenue ---

  Future<double> getRecoveredRevenue() async {
    final p = await prefs;
    return p.getDouble(_keyRecoveredRevenue) ?? 0.0;
  }

  Future<void> addRecoveredRevenue(double amount) async {
    final current = await getRecoveredRevenue();
    final p = await prefs;
    await p.setDouble(_keyRecoveredRevenue, current + amount);
  }

  Future<void> subtractRecoveredRevenue(double amount) async {
    final current = await getRecoveredRevenue();
    final p = await prefs;
    await p.setDouble(
        _keyRecoveredRevenue, (current - amount).clamp(0, double.infinity));
  }

  // --- Filled Gap IDs ---

  Future<Set<String>> getFilledGapIds() async {
    final p = await prefs;
    final list = p.getStringList(_keyFilledGapIds);
    return list?.toSet() ?? {};
  }

  Future<void> addFilledGapId(String gapId) async {
    final ids = await getFilledGapIds();
    ids.add(gapId);
    final p = await prefs;
    await p.setStringList(_keyFilledGapIds, ids.toList());
  }

  Future<void> removeFilledGapId(String gapId) async {
    final ids = await getFilledGapIds();
    ids.remove(gapId);
    final p = await prefs;
    await p.setStringList(_keyFilledGapIds, ids.toList());
  }

  // --- Streak ---

  Future<StreakData> getStreak() async {
    final p = await prefs;
    final json = p.getString(_keyStreak);
    if (json == null) return StreakData.empty();
    return StreakData.fromMap(jsonDecode(json) as Map<String, dynamic>);
  }

  Future<void> saveStreak(StreakData streak) async {
    final p = await prefs;
    await p.setString(_keyStreak, jsonEncode(streak.toMap()));
  }

  // --- Subscription ---

  Future<SubscriptionState> getSubscription() async {
    final p = await prefs;
    final json = p.getString(_keySubscription);
    if (json == null) return SubscriptionState.freeTier();
    final map = jsonDecode(json) as Map<String, dynamic>;
    return SubscriptionState(
      tier: SubscriptionTier.values.firstWhere(
        (t) => t.name == map['tier'],
        orElse: () => SubscriptionTier.free,
      ),
      trialStartDate: map['trialStartDate'] != null
          ? DateTime.tryParse(map['trialStartDate'] as String)
          : null,
      expirationDate: map['expirationDate'] != null
          ? DateTime.tryParse(map['expirationDate'] as String)
          : null,
    );
  }

  Future<void> saveSubscription(SubscriptionState sub) async {
    final p = await prefs;
    await p.setString(
      _keySubscription,
      jsonEncode({
        'tier': sub.tier.name,
        'trialStartDate': sub.trialStartDate?.toIso8601String(),
        'expirationDate': sub.expirationDate?.toIso8601String(),
      }),
    );
  }

  // --- Last Sync ---

  Future<DateTime?> getLastSyncAt() async {
    final p = await prefs;
    final iso = p.getString(_keyLastSyncAt);
    return iso != null ? DateTime.tryParse(iso) : null;
  }

  Future<void> setLastSyncAt(DateTime time) async {
    final p = await prefs;
    await p.setString(_keyLastSyncAt, time.toIso8601String());
  }

  // --- Referral Code ---

  Future<String?> getReferralCode() async {
    final p = await prefs;
    return p.getString(_keyReferralCode);
  }

  Future<void> setReferralCode(String code) async {
    final p = await prefs;
    await p.setString(_keyReferralCode, code);
  }

  // --- Review Prompt ---

  Future<DateTime?> getLastReviewPrompt() async {
    final p = await prefs;
    final iso = p.getString(_keyReviewPrompted);
    return iso != null ? DateTime.tryParse(iso) : null;
  }

  Future<void> setLastReviewPrompt(DateTime time) async {
    final p = await prefs;
    await p.setString(_keyReviewPrompted, time.toIso8601String());
  }

  // --- Paywall Triggers ---

  static const _keyFiredPaywallTriggers = 'fired_paywall_triggers';
  static const _keyCumulativeLeakage = 'cumulative_leakage_seen';
  static const _keyShareSheetCount = 'share_sheet_use_count';
  static const _keyMissedHighProbGap = 'missed_high_prob_gap_value';
  static const _keyRecoveredGapCount = 'recovered_gap_count';
  static const _keyFirstRecoveryDate = 'first_recovery_date';
  static const _keyNotificationFrequency = 'notification_frequency';

  Future<Set<String>> getFiredPaywallTriggers() async {
    final p = await prefs;
    final list = p.getStringList(_keyFiredPaywallTriggers);
    return list?.toSet() ?? {};
  }

  Future<void> addFiredPaywallTrigger(String triggerId) async {
    final existing = await getFiredPaywallTriggers();
    existing.add(triggerId);
    final p = await prefs;
    await p.setStringList(_keyFiredPaywallTriggers, existing.toList());
  }

  // --- Daily Ritual ---

  Future<DailyRitualState> getDailyRitual() async {
    final p = await prefs;
    final raw = p.getString(_keyDailyRitual);
    final today = DailyRitualState.forToday();
    if (raw == null) return today;

    final parsed = DailyRitualState.fromJson(raw);
    if (parsed.dateKey != today.dateKey) {
      await saveDailyRitual(today);
      return today;
    }
    return parsed;
  }

  Future<void> saveDailyRitual(DailyRitualState state) async {
    final p = await prefs;
    await p.setString(_keyDailyRitual, state.toJson());
  }

  // --- Cumulative Leakage Seen (paywall trigger 1) ---

  Future<double> getCumulativeLeakageSeen() async {
    final p = await prefs;
    return p.getDouble(_keyCumulativeLeakage) ?? 0.0;
  }

  Future<void> addCumulativeLeakageSeen(double amount) async {
    final current = await getCumulativeLeakageSeen();
    final p = await prefs;
    await p.setDouble(_keyCumulativeLeakage, current + amount);
  }

  // --- Share Sheet Use Count (paywall trigger 3) ---

  Future<int> getShareSheetUseCount() async {
    final p = await prefs;
    return p.getInt(_keyShareSheetCount) ?? 0;
  }

  Future<void> incrementShareSheetUseCount() async {
    final current = await getShareSheetUseCount();
    final p = await prefs;
    await p.setInt(_keyShareSheetCount, current + 1);
  }

  // --- Missed High-Probability Gap Value (paywall trigger 4) ---

  Future<double?> getMissedHighProbGapValue() async {
    final p = await prefs;
    return p.getDouble(_keyMissedHighProbGap);
  }

  Future<void> setMissedHighProbGapValue(double value) async {
    final p = await prefs;
    await p.setDouble(_keyMissedHighProbGap, value);
  }

  Future<void> clearMissedHighProbGapValue() async {
    final p = await prefs;
    await p.remove(_keyMissedHighProbGap);
  }

  // --- Recovered Gap Count (paywall trigger 5) ---

  Future<int> getRecoveredGapCount() async {
    final p = await prefs;
    return p.getInt(_keyRecoveredGapCount) ?? 0;
  }

  Future<void> incrementRecoveredGapCount() async {
    final current = await getRecoveredGapCount();
    final p = await prefs;
    await p.setInt(_keyRecoveredGapCount, current + 1);
  }

  // --- First Recovery Date (paywall trigger 2) ---

  Future<DateTime?> getFirstRecoveryDate() async {
    final p = await prefs;
    final iso = p.getString(_keyFirstRecoveryDate);
    return iso != null ? DateTime.tryParse(iso) : null;
  }

  /// Records the date of the first gap recovery. Idempotent — only writes
  /// if no date is currently stored.
  Future<void> setFirstRecoveryDate(DateTime date) async {
    final existing = await getFirstRecoveryDate();
    if (existing != null) return; // already recorded
    final p = await prefs;
    await p.setString(_keyFirstRecoveryDate, date.toIso8601String());
  }

  // --- Notification Frequency ---

  Future<NotificationFrequency> getNotificationFrequency() async {
    final p = await prefs;
    final raw = p.getString(_keyNotificationFrequency);
    return raw != null
        ? NotificationFrequency.fromString(raw)
        : NotificationFrequency.standard;
  }

  Future<void> saveNotificationFrequency(NotificationFrequency freq) async {
    final p = await prefs;
    await p.setString(_keyNotificationFrequency, freq.toApiString());
  }
}
