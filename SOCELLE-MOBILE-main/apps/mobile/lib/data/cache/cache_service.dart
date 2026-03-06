import 'dart:async';

/// Lightweight in-memory TTL cache for Supabase intelligence data.
///
/// Used by all repositories to avoid redundant network calls within a session.
/// Cache is not persisted — evicted on app restart or when TTL expires.
///
/// Usage:
/// ```dart
/// final cache = CacheService();
/// final items = await cache.getOrFetch(
///   key: 'feed:skincare',
///   ttl: const Duration(minutes: 30),
///   fetch: () => _supabase.from('intelligence_signals').select(),
/// );
/// ```
class CacheService {
  CacheService._();

  static final CacheService instance = CacheService._();

  final Map<String, _CacheEntry<dynamic>> _store = {};

  /// Returns cached value if present and not expired, otherwise calls [fetch],
  /// caches the result with [ttl], and returns it.
  Future<T> getOrFetch<T>({
    required String key,
    required Duration ttl,
    required Future<T> Function() fetch,
  }) async {
    final existing = _store[key];
    if (existing != null && !existing.isExpired) {
      return existing.value as T;
    }

    final value = await fetch();
    _store[key] = _CacheEntry(value: value, expiresAt: DateTime.now().add(ttl));
    return value;
  }

  /// Invalidates a single key.
  void invalidate(String key) => _store.remove(key);

  /// Invalidates all keys with the given prefix.
  void invalidatePrefix(String prefix) {
    _store.removeWhere((key, _) => key.startsWith(prefix));
  }

  /// Clears the entire cache.
  void clear() => _store.clear();

  /// Returns true if the cache has a non-expired entry for [key].
  bool has(String key) {
    final entry = _store[key];
    return entry != null && !entry.isExpired;
  }
}

class _CacheEntry<T> {
  const _CacheEntry({required this.value, required this.expiresAt});

  final T value;
  final DateTime expiresAt;

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}
