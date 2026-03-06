import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/brand.dart';
import 'base_repository.dart';

/// Fetches brand data from the [brands] Supabase table (public schema).
///
/// Cache TTL: 60 minutes (brand profiles change infrequently).
class BrandsRepository extends BaseRepository {
  const BrandsRepository();

  static const _cacheTtl = Duration(hours: 1);

  /// Fetches all published brands, optionally filtered by [category].
  Future<List<Brand>> fetchBrands({
    String? category,
    int limit = 40,
  }) async {
    final cacheKey = 'brands:${category ?? 'all'}:$limit';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () => _fetchPublishedBrands(category: category, limit: limit),
        fallback: const <Brand>[],
      ),
    );
  }

  Future<List<Brand>> _fetchPublishedBrands({
    String? category,
    required int limit,
  }) async {
    var query = supabase
        .from('brands')
        .select('id, name, slug, description, logo_url, hero_image_url, '
            'theme, is_published, status')
        .eq('is_published', true)
        .order('name')
        .limit(limit);

    // category filter not yet in the brands table per current schema —
    // apply client-side if needed once brand_profiles schema is active.

    final response = await query;
    return response.map((json) => Brand.fromJson(json)).toList();
  }

  /// Fetches a single brand by slug.
  Future<Brand?> fetchBySlug(String slug) async {
    final cacheKey = 'brands:slug:$slug';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () async {
          final response = await supabase
              .from('brands')
              .select()
              .eq('slug', slug)
              .eq('is_published', true)
              .maybeSingle();

          if (response == null) return null;
          return Brand.fromJson(response);
        },
        fallback: null,
      ),
    );
  }

  void invalidateCache() => cache.invalidatePrefix('brands:');
}

// ─── Riverpod providers ──────────────────────────────────────────────────────

final brandsRepositoryProvider = Provider<BrandsRepository>(
  (_) => const BrandsRepository(),
);

final brandsProvider = FutureProvider.family<List<Brand>, String?>(
  (ref, category) async {
    final repo = ref.watch(brandsRepositoryProvider);
    return repo.fetchBrands(category: category);
  },
);
