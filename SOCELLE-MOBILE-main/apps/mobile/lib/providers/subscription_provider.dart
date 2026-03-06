import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:purchases_flutter/purchases_flutter.dart';

import '../models/subscription_state.dart';
import 'user_settings_provider.dart';

final subscriptionProvider =
    AsyncNotifierProvider<SubscriptionNotifier, SubscriptionState>(
  SubscriptionNotifier.new,
);

class SubscriptionNotifier extends AsyncNotifier<SubscriptionState> {
  @override
  Future<SubscriptionState> build() async {
    final storage = ref.read(settingsStorageProvider);
    return storage.getSubscription();
  }

  Future<void> startTrial() async {
    final sub = SubscriptionState.startTrial();
    final storage = ref.read(settingsStorageProvider);
    await storage.saveSubscription(sub);
    state = AsyncData(sub);
  }

  Future<void> activate(SubscriptionTier tier) async {
    final sub = SubscriptionState(
      tier: tier,
      expirationDate: tier == SubscriptionTier.annual
          ? DateTime.now().add(const Duration(days: 365))
          : DateTime.now().add(const Duration(days: 30)),
    );
    final storage = ref.read(settingsStorageProvider);
    await storage.saveSubscription(sub);
    state = AsyncData(sub);
  }

  /// Cancels the active subscription and reverts local state to free tier.
  ///
  /// Note: Actual cancellation is handled through the App Store (iOS) or
  /// Play Store (Android). This method updates local state only.
  /// RevenueCat's customer info listener will re-validate on next launch.
  Future<void> cancelSubscription() async {
    final sub = SubscriptionState.freeTier();
    final storage = ref.read(settingsStorageProvider);
    await storage.saveSubscription(sub);
    state = AsyncData(sub);
  }

  /// Restore previous purchases from RevenueCat.
  /// This is useful when a user has an existing subscription on another device.
  Future<void> restorePurchases() async {
    try {
      // Import purchases_flutter for Purchases.restorePurchases()
      // This will sync the app with the user's App Store / Play Store account
      // and update the local subscription state if a purchase is found.
      await Purchases.restorePurchases();
    } catch (e) {
      // Error handling: re-throw for caller to display SnackBar
      rethrow;
    }
  }
}
