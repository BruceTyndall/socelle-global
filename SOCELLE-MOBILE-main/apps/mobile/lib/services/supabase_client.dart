import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Supabase client for Socelle marketplace features.
///
/// ┌─────────────────────────────────────────────────────────────────────────┐
/// │ BACKEND RESPONSIBILITY SPLIT                                           │
/// │                                                                         │
/// │ Supabase (Socelle) handles:                                            │
/// │   Shop, Messages, Brand Relationships, Education, Marketing            │
/// │                                                                         │
/// │ Firebase (SlotForce) handles:                                          │
/// │   Auth, Calendar, Gaps, Streaks, Notifications, Analytics, Retention   │
/// │                                                                         │
/// │ These two backends run side-by-side. Supabase does NOT replace         │
/// │ Firebase Auth — it uses anonymous/service access for now.              │
/// │ Identity bridge (identity_bridge.dart) maps Firebase UID → Socelle    │
/// │ user ID when Socelle Phase 1 auth is complete.                        │
/// └─────────────────────────────────────────────────────────────────────────┘
class SocelleSupabaseClient {
  SocelleSupabaseClient._();

  // ---------------------------------------------------------------------------
  // Configuration — loaded from environment, never hardcoded in release builds.
  // Set these via --dart-define or .env before building:
  //   flutter run --dart-define=SOCELLE_SUPABASE_URL=https://xxx.supabase.co
  //               --dart-define=SOCELLE_SUPABASE_ANON_KEY=eyJ...
  // ---------------------------------------------------------------------------

  static const String _supabaseUrl = String.fromEnvironment(
    'SOCELLE_SUPABASE_URL',
    defaultValue: '', // Empty = not configured yet
  );

  static const String _supabaseAnonKey = String.fromEnvironment(
    'SOCELLE_SUPABASE_ANON_KEY',
    defaultValue: '', // Empty = not configured yet
  );

  static bool _initialized = false;

  /// Whether the Socelle Supabase backend has been configured.
  /// Returns false if env vars are missing (expected during early development).
  static bool get isConfigured =>
      _supabaseUrl.isNotEmpty && _supabaseAnonKey.isNotEmpty;

  /// Initialize Supabase client for Socelle marketplace features.
  ///
  /// Call after Firebase init in main.dart. Non-fatal if Supabase is not
  /// configured yet — the app falls back to mock repositories.
  ///
  /// ```dart
  /// // In main.dart, after Firebase.initializeApp():
  /// await SocelleSupabaseClient.initialize();
  /// ```
  static Future<void> initialize() async {
    if (_initialized) return;

    if (!isConfigured) {
      debugPrint(
        'SocelleSupabaseClient: not configured — '
        'set SOCELLE_SUPABASE_URL and SOCELLE_SUPABASE_ANON_KEY via --dart-define. '
        'Shop and Messages will use mock data.',
      );
      return;
    }

    try {
      await Supabase.initialize(
        url: _supabaseUrl,
        anonKey: _supabaseAnonKey,
      );
      _initialized = true;
      debugPrint('SocelleSupabaseClient: initialized for Socelle marketplace');
    } catch (e) {
      // Non-fatal — app works without Supabase (mock repositories serve UI).
      debugPrint('SocelleSupabaseClient: init failed — $e');
    }
  }

  static bool get isInitialized => _initialized;

  /// Convenience getter for the Supabase client instance.
  /// Throws a [StateError] if not initialized — always check [isInitialized] first.
  static SupabaseClient get client {
    if (!_initialized) {
      throw StateError(
        'SocelleSupabaseClient not initialized. '
        'Call SocelleSupabaseClient.initialize() in main.dart '
        'after Firebase.initializeApp().',
      );
    }
    return Supabase.instance.client;
  }
}
