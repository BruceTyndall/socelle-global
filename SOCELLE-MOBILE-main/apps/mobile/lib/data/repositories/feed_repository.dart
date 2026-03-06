import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../exceptions/supabase_exceptions.dart';
import '../models/feed_item.dart';
import 'base_repository.dart';

/// Fetches intelligence feed items from Supabase.
///
/// Primary source: [intelligence_signals] table (public schema).
/// Fallback: /intelligence-feeds edge function (RSS aggregator, 30-min cache).
///
/// Cache TTL: 30 minutes (matches edge function cache duration).
class FeedRepository extends BaseRepository {
  const FeedRepository();

  static const _cacheTtl = Duration(minutes: 30);

  /// Fetches feed items, optionally filtered by [category].
  ///
  /// Returns empty list on [SupabaseNotConfiguredException] (development fallback).
  /// Throws [SocelleDataException] subtypes for all other failures.
  Future<List<FeedItem>> fetchFeed({
    String? category,
    int limit = 20,
    int offset = 0,
  }) async {
    final cacheKey = 'feed:${category ?? 'all'}:$limit:$offset';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () => _fetchFromTable(category: category, limit: limit, offset: offset),
        fallback: const <FeedItem>[],
      ),
    );
  }

  Future<List<FeedItem>> _fetchFromTable({
    String? category,
    required int limit,
    required int offset,
  }) async {
    // Filters must come before order/range (PostgrestFilterBuilder → PostgrestTransformBuilder).
    var filterQuery = supabase
        .from('intelligence_signals')
        .select('id, title, description, url, published_at, image_url, '
            'category, tags, sentiment, brand_mention');

    if (category != null) {
      filterQuery = filterQuery.eq('category', category);
    }

    final response = await filterQuery
        .order('published_at', ascending: false)
        .range(offset, offset + limit - 1);

    return response
        .map((json) => FeedItem.fromJson(json))
        .toList();
  }

  /// Fetches a single feed item by ID.
  Future<FeedItem?> fetchById(String id) async {
    return guardedFetch(
      () async {
        final response = await supabase
            .from('intelligence_signals')
            .select()
            .eq('id', id)
            .maybeSingle();

        if (response == null) return null;
        return FeedItem.fromJson(response);
      },
      fallback: null,
    );
  }

  /// Invalidates all feed cache entries.
  void invalidateCache() => cache.invalidatePrefix('feed:');
}

// ─── Riverpod provider ───────────────────────────────────────────────────────

final feedRepositoryProvider = Provider<FeedRepository>(
  (_) => const FeedRepository(),
);

final feedProvider = FutureProvider.family<List<FeedItem>, String?>(
  (ref, category) async {
    final repo = ref.watch(feedRepositoryProvider);
    return repo.fetchFeed(category: category);
  },
);
