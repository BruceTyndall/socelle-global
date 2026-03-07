import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Supabase client singleton for the SOCELLE mobile app.
///
/// Reads configuration from --dart-define environment variables:
///   flutter run --dart-define=SOCELLE_SUPABASE_URL=https://xxx.supabase.co
///               --dart-define=SOCELLE_SUPABASE_ANON_KEY=eyJ...
///
/// Falls back gracefully if not configured — screens show DEMO badges.
class SocelleSupabaseClient {
  SocelleSupabaseClient._();

  static const String _supabaseUrl = String.fromEnvironment(
    'SOCELLE_SUPABASE_URL',
    defaultValue: '',
  );

  static const String _supabaseAnonKey = String.fromEnvironment(
    'SOCELLE_SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  static bool _initialized = false;

  /// Whether Supabase environment variables are present.
  static bool get isConfigured =>
      _supabaseUrl.isNotEmpty && _supabaseAnonKey.isNotEmpty;

  /// Whether the Supabase SDK has been successfully initialized.
  static bool get isInitialized => _initialized;

  /// Initialize the Supabase client. Call once from main.dart.
  /// Non-fatal if env vars are missing.
  static Future<void> initialize() async {
    if (_initialized) return;

    if (!isConfigured) {
      debugPrint(
        'SocelleSupabaseClient: not configured — '
        'set SOCELLE_SUPABASE_URL and SOCELLE_SUPABASE_ANON_KEY via --dart-define. '
        'App will run in DEMO mode.',
      );
      return;
    }

    try {
      await Supabase.initialize(
        url: _supabaseUrl,
        anonKey: _supabaseAnonKey,
      );
      _initialized = true;
      debugPrint('SocelleSupabaseClient: initialized successfully');
    } catch (e) {
      debugPrint('SocelleSupabaseClient: init failed — $e');
    }
  }

  /// Convenience getter for the Supabase client instance.
  /// Throws [StateError] if not initialized.
  static SupabaseClient get client {
    if (!_initialized) {
      throw StateError(
        'SocelleSupabaseClient not initialized. '
        'Call SocelleSupabaseClient.initialize() in main.dart.',
      );
    }
    return Supabase.instance.client;
  }

  /// Sign out the current user and clear the session.
  static Future<void> signOut() async {
    if (!_initialized) return;
    await client.auth.signOut();
  }
}
