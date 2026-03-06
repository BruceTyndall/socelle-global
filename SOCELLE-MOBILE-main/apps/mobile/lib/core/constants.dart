class SocelleConstants {
  SocelleConstants._();

  // Slot duration options (minutes)
  static const slotDurationOptions = [15, 30, 45, 60, 90, 120];

  // Default settings
  static const defaultAvgBookingValue = 85.0;
  static const defaultSlotDurationMinutes = 60;
  static const defaultCalendarSource = 'google';
  static const defaultProviderType = 'hair_stylist';
  static const defaultGrowthGoal = 'fill_gaps';

  // Graduated Funnel — Web upgrade trigger
  /// 30-day recovered revenue threshold that surfaces the "Upgrade to Socelle Web"
  /// bottom sheet. Value from Gemini/Architect spec: $500.
  static const webUpgradeRevenueThreshold = 500.0;

  // Subscription pricing
  static const monthlyPrice = 29.0;
  static const annualPrice = 249.0;
  static const annualMonthlyEquivalent = 20.75;
  static const annualSavings = 99.0;
  static const trialDays = 7;

  // Industry benchmarks (initial static data)
  static const avgMonthlyLeakageStylist = 1100.0;
  static const avgMonthlyLeakageBarber = 950.0;
  static const avgMonthlyLeakageMassage = 1300.0;
  static const avgMonthlyLeakageEsthetician = 1200.0;

  // Streak milestones
  static const streakMilestones = {
    1: "First action! You're on your way",
    4: "1-month streak! Revenue recovery pro",
    8: "2-month streak! Consistency pays off",
    12: "3-month streak! Top 10% of Socelle users",
  };

  // Recovery milestones (dollar amounts)
  static const recoveryMilestones = [
    100.0,
    500.0,
    1000.0,
    2500.0,
    5000.0,
    10000.0
  ];

  // Fill slot message template
  static const fillSlotMessageTemplate =
      "Hey! I have an opening on {day} at {time}. "
      "Would you like to book? Let me know!";

  // Default working hours
  static const defaultWorkingHours = {
    'monday': {'enabled': true, 'start': '09:00', 'end': '17:00'},
    'tuesday': {'enabled': true, 'start': '09:00', 'end': '17:00'},
    'wednesday': {'enabled': true, 'start': '09:00', 'end': '17:00'},
    'thursday': {'enabled': true, 'start': '09:00', 'end': '17:00'},
    'friday': {'enabled': true, 'start': '09:00', 'end': '17:00'},
    'saturday': {'enabled': false, 'start': null, 'end': null},
    'sunday': {'enabled': false, 'start': null, 'end': null},
  };

  // ── Third-party API keys ─────────────────────────────────────────────────
  // RevenueCat iOS public API key (get from app.revenuecat.com → API Keys).
  // RevenueCat test key (swap for appl_ production key before App Store release).
  static const revenueCatApiKeyIos = 'test_JZrMvzyFsEJwFqGYZUPLdHAhTFz';

  // Google OAuth Web Client ID for the server auth code flow.
  // Find at: Firebase Console → Authentication → Sign-in method →
  // Google → Web SDK configuration → Web client ID.
  // Also register the REVERSED_CLIENT_ID from GoogleService-Info.plist as a
  // URL scheme under Runner → Info → URL Types in Xcode.
  // Firebase Web Client ID (from Authentication → Google provider).
  static const googleServerClientId =
      '488796867742-0kui1ose63blj2ammthsodb0f8005a6b.apps.googleusercontent.com';

  // Day names for display
  static const dayNames = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  static const dayAbbreviations = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun',
  };
}
