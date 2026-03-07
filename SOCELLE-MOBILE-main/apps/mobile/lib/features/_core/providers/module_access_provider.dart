// ═══════════════════════════════════════════════════════════════════════════
// SOCELLE — Module Access Provider (Riverpod + Supabase)
// ═══════════════════════════════════════════════════════════════════════════
//
// Usage:
//   final access = ref.watch(moduleAccessProvider('MODULE_SHOP'));
//   access.when(
//     data: (a) => a.hasAccess ? ShopScreen() : UpgradePrompt(...),
//     loading: () => shimmer,
//     error: (e, s) => errorWidget,
//   );
//
// Reads from: account_module_access table
// Subscribes to: Supabase realtime for live updates

import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/module_access.dart';

/// Provider that checks module access for the current user's account.
///
/// Returns [AsyncValue<ModuleAccess>] — cached per module key.
/// Subscribes to Supabase realtime so access changes propagate immediately.
final moduleAccessProvider =
    AsyncNotifierProvider.family<ModuleAccessNotifier, ModuleAccess, String>(
  ModuleAccessNotifier.new,
);

class ModuleAccessNotifier
    extends FamilyAsyncNotifier<ModuleAccess, String> {
  StreamSubscription<List<Map<String, dynamic>>>? _realtimeSub;

  @override
  Future<ModuleAccess> build(String arg) async {
    final moduleKey = arg;
    final supabase = Supabase.instance.client;
    final user = supabase.auth.currentUser;

    if (user == null) {
      return ModuleAccess.locked(moduleKey);
    }

    // Fetch the account_id for the current user.
    final accountRow = await supabase
        .from('account_members')
        .select('account_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (accountRow == null) {
      return ModuleAccess.locked(moduleKey);
    }

    final accountId = accountRow['account_id'] as String;

    // Fetch module access row.
    final accessRow = await supabase
        .from('account_module_access')
        .select()
        .eq('account_id', accountId)
        .eq('module_key', moduleKey)
        .maybeSingle();

    // Subscribe to realtime changes for this account + module.
    _realtimeSub?.cancel();
    _realtimeSub = supabase
        .from('account_module_access')
        .stream(primaryKey: ['id'])
        .eq('account_id', accountId)
        .listen((rows) {
          final match = rows.where((r) => r['module_key'] == moduleKey);
          if (match.isNotEmpty) {
            state = AsyncData(ModuleAccess.fromJson(match.first));
          } else {
            state = AsyncData(ModuleAccess.locked(moduleKey));
          }
        });

    // Dispose realtime subscription when provider is disposed.
    ref.onDispose(() {
      _realtimeSub?.cancel();
    });

    if (accessRow == null) {
      return ModuleAccess.locked(moduleKey);
    }

    return ModuleAccess.fromJson(accessRow);
  }
}

/// Provider that fetches ALL module access entries for the current account.
/// Useful for the subscription management screen.
final allModuleAccessProvider =
    FutureProvider<Map<String, ModuleAccess>>((ref) async {
  final supabase = Supabase.instance.client;
  final user = supabase.auth.currentUser;

  if (user == null) return {};

  final accountRow = await supabase
      .from('account_members')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle();

  if (accountRow == null) return {};

  final accountId = accountRow['account_id'] as String;

  final rows = await supabase
      .from('account_module_access')
      .select()
      .eq('account_id', accountId);

  final Map<String, ModuleAccess> result = {};
  for (final row in rows) {
    final access = ModuleAccess.fromJson(row);
    result[access.moduleKey] = access;
  }

  return result;
});
