// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — Subscription Provider (Riverpod + Supabase)
// ═══════════════════════════════════════════════════════════════════════════
//
// Reads from: account_subscriptions + subscription_plans
// Returns: current plan name, status, modules included, billing cycle,
//          period end date.
//
// Usage:
//   final sub = ref.watch(accountSubscriptionProvider);
//   final plans = ref.watch(availablePlansProvider);

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/module_access.dart';

/// Current account subscription with joined plan data.
class SubscriptionWithPlan {
  const SubscriptionWithPlan({
    required this.subscription,
    required this.plan,
  });

  final AccountSubscription subscription;
  final SubscriptionPlan plan;

  /// Convenience: plan name.
  String get planName => plan.name;

  /// Convenience: subscription status.
  String get status => subscription.status;

  /// Convenience: modules included in the plan.
  List<String> get modulesIncluded => plan.modulesIncluded;

  /// Convenience: is the subscription active.
  bool get isActive => subscription.isActive;

  /// Convenience: days remaining.
  int get daysRemaining => subscription.daysRemaining;

  /// Convenience: is trialing.
  bool get isTrialing => subscription.isTrialing;
}

/// Provider for the current account's active subscription + plan details.
final accountSubscriptionProvider =
    FutureProvider<SubscriptionWithPlan?>((ref) async {
  final supabase = Supabase.instance.client;
  final user = supabase.auth.currentUser;

  if (user == null) return null;

  // Get account_id for this user.
  final accountRow = await supabase
      .from('account_members')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle();

  if (accountRow == null) return null;

  final accountId = accountRow['account_id'] as String;

  // Fetch active subscription with joined plan data.
  final subRow = await supabase
      .from('account_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('account_id', accountId)
      .inFilter('status', ['active', 'trialing'])
      .order('created_at', ascending: false)
      .maybeSingle();

  if (subRow == null) return null;

  final subscription = AccountSubscription.fromJson(subRow);
  final planData = subRow['subscription_plans'] as Map<String, dynamic>?;

  if (planData == null) return null;

  final plan = SubscriptionPlan.fromJson(planData);

  return SubscriptionWithPlan(
    subscription: subscription,
    plan: plan,
  );
});

/// Provider for all available subscription plans.
final availablePlansProvider =
    FutureProvider<List<SubscriptionPlan>>((ref) async {
  final supabase = Supabase.instance.client;

  final rows = await supabase
      .from('subscription_plans')
      .select()
      .eq('is_active', true)
      .order('price_monthly', ascending: true);

  return rows
      .map((row) => SubscriptionPlan.fromJson(row))
      .toList();
});

/// Provider that returns plans containing a specific module.
final plansForModuleProvider =
    FutureProvider.family<List<SubscriptionPlan>, String>(
        (ref, moduleKey) async {
  final allPlans = await ref.watch(availablePlansProvider.future);
  return allPlans
      .where((plan) => plan.includesModule(moduleKey))
      .toList();
});
