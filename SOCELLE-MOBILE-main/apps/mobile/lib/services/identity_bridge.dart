/// Maps Firebase Auth UID to Socelle Supabase user ID.
///
/// Implementation: Option B — Lookup Table
///
/// ┌──────────────────────────────────────────────────────────────────────────┐
/// │ WHY OPTION B                                                             │
/// │                                                                          │
/// │ Lowest-risk path for Phase 2. Avoids Firebase Extension dependencies    │
/// │ and does NOT pollute Supabase RLS custom claims. At current DAU scale   │
/// │ the per-session lookup overhead is negligible.                           │
/// │                                                                          │
/// │ Table: firebase_uid_map                                                  │
/// │   firebase_uid TEXT UNIQUE → supabase_uid UUID REFERENCES auth.users    │
/// │                                                                          │
/// │ See migration: 20260227000001_create_firebase_uid_map.sql               │
/// └──────────────────────────────────────────────────────────────────────────┘
library identity_bridge;

import 'package:flutter/foundation.dart' show visibleForTesting;
import 'package:supabase_flutter/supabase_flutter.dart';

import 'supabase_client.dart';

class IdentityBridge {
  IdentityBridge._();

  // ── Internal helpers ────────────────────────────────────────────────────────

  static SupabaseClient get _db {
    assert(
      SocelleSupabaseClient.isInitialized,
      'IdentityBridge requires SocelleSupabaseClient.initialize() to be called first. '
      'Ensure main.dart calls it after Firebase.initializeApp().',
    );
    return SocelleSupabaseClient.client;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /// Given a Firebase Auth UID, return the corresponding Socelle Supabase
  /// user ID. Returns null if the accounts are not yet linked.
  ///
  /// Usage:
  /// ```dart
  /// final supabaseUid = await IdentityBridge.getSupabaseUserId(firebaseUser.uid);
  /// if (supabaseUid == null) {
  ///   // Prompt user to link or issue magic link
  /// }
  /// ```
  static Future<String?> getSupabaseUserId(String firebaseUid) async {
    if (!SocelleSupabaseClient.isInitialized) return null;

    try {
      final row = await _db
          .from('firebase_uid_map')
          .select('supabase_uid')
          .eq('firebase_uid', firebaseUid)
          .maybeSingle();

      return row?['supabase_uid'] as String?;
    } on PostgrestException catch (e) {
      // Row not found is expected for new users — not an error
      if (e.code == 'PGRST116') return null;
      rethrow;
    }
  }

  /// Link a Firebase Auth account to a Socelle Supabase account.
  ///
  /// Called once during the magic-link handoff — after the user authenticates
  /// via the Supabase magic link and we have their Supabase session.
  ///
  /// This is idempotent: calling it a second time with the same pair is a no-op
  /// (upsert on firebase_uid uniqueness constraint).
  ///
  /// Usage:
  /// ```dart
  /// // After magic-link sign-in completes:
  /// await IdentityBridge.linkAccounts(firebaseUser.uid, supabaseUser.id);
  /// ```
  static Future<void> linkAccounts(
    String firebaseUid,
    String supabaseUserId, {
    String? email,
  }) async {
    await _db.from('firebase_uid_map').upsert(
      {
        'firebase_uid': firebaseUid,
        'supabase_uid': supabaseUserId,
        if (email != null) 'linked_email': email,
      },
      onConflict: 'firebase_uid',    // idempotent: update supabase_uid if re-linked
      ignoreDuplicates: false,
    );
  }

  /// Check whether a Firebase Auth user already has a linked Socelle account.
  ///
  /// Use this as the guard before showing the "Upgrade to Socelle" prompt.
  ///
  /// ```dart
  /// if (!await IdentityBridge.isLinked(firebaseUser.uid)) {
  ///   // Fire PaywallTrigger.upgradeToWeb
  /// }
  /// ```
  static Future<bool> isLinked(String firebaseUid) async {
    if (!SocelleSupabaseClient.isInitialized) return false;
    final uid = await getSupabaseUserId(firebaseUid);
    return uid != null;
  }

  /// Unlink a Firebase UID from a Supabase account.
  ///
  /// Admin/support use only. Regular users cannot call this because RLS
  /// blocks the DELETE path for non-service-role callers.
  ///
  /// In production this should be called via a service-role Cloud Function,
  /// not directly from the client. Exposed here for completeness.
  @visibleForTesting
  static Future<void> unlinkAccounts(String firebaseUid) async {
    await _db
        .from('firebase_uid_map')
        .delete()
        .eq('firebase_uid', firebaseUid);
  }
}
