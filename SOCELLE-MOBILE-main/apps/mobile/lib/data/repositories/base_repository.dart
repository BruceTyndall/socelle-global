import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../services/supabase_client.dart';
import '../cache/cache_service.dart';
import '../exceptions/supabase_exceptions.dart';

/// Abstract base for all Supabase intelligence repositories.
///
/// Provides:
/// - [supabase] — safe client accessor (throws [SupabaseNotConfiguredException] if not ready)
/// - [cache] — shared in-memory TTL cache
/// - [guardedFetch] — wraps raw Supabase calls with typed exception mapping
///
/// Every concrete repository extends this class and calls [guardedFetch]
/// to ensure consistent error handling and cache integration.
abstract class BaseRepository {
  const BaseRepository();

  /// Shared cache across all repository instances.
  CacheService get cache => CacheService.instance;

  /// Returns the Supabase client, or throws [SupabaseNotConfiguredException].
  SupabaseClient get supabase {
    if (!SocelleSupabaseClient.isInitialized) {
      throw const SupabaseNotConfiguredException();
    }
    return SocelleSupabaseClient.client;
  }

  /// Wraps [operation] with typed exception mapping.
  ///
  /// - [SupabaseNotConfiguredException] — re-thrown as-is
  /// - [PostgrestException] — mapped to [SupabaseResponseException]
  /// - Other exceptions — mapped to [SupabaseNetworkException]
  ///
  /// On error, returns [fallback] if provided, otherwise rethrows.
  Future<T> guardedFetch<T>(
    Future<T> Function() operation, {
    T? fallback,
  }) async {
    try {
      return await operation();
    } on SupabaseNotConfiguredException {
      if (fallback != null) return fallback;
      rethrow;
    } on PostgrestException catch (e) {
      debugPrint('BaseRepository: PostgrestException — ${e.message} (${e.code})');
      final ex = SupabaseResponseException(
        e.message,
        statusCode: int.tryParse(e.code ?? ''),
        cause: e,
      );
      if (fallback != null) return fallback;
      throw ex;
    } catch (e) {
      debugPrint('BaseRepository: unexpected error — $e');
      final ex = SupabaseNetworkException(e.toString(), cause: e);
      if (fallback != null) return fallback;
      throw ex;
    }
  }
}
