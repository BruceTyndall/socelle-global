import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/affiliate_product.dart';
import 'base_repository.dart';

/// Fetches affiliate products and placements from [socelle.affiliate_products]
/// and [socelle.affiliate_placements].
///
/// Schema: socelle (requires schema-qualified queries).
/// Cache TTL: 60 minutes (product catalog changes infrequently).
///
/// Revenue firewall: this repository NEVER reads affiliate_clicks.
/// Click tracking is INSERT-only via [recordClick].
class AffiliateRepository extends BaseRepository {
  const AffiliateRepository();

  static const _cacheTtl = Duration(hours: 1);

  /// Fetches active affiliate products for a given [surfaceType] and
  /// optional [surfaceEntityId] (for entity-scoped placements).
  ///
  /// surface_type values: 'feed' | 'brand_page' | 'event' | 'education' |
  /// 'benchmark' | 'quiz_result' | 'email'
  ///
  /// Returns at most 2 products (enforced by placement max of 2 per page).
  Future<List<AffiliateProduct>> fetchPlacementsForSurface({
    required String surfaceType,
    String? surfaceEntityId,
  }) async {
    final cacheKey =
        'affiliate:placements:$surfaceType:${surfaceEntityId ?? 'global'}';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () => _fetchPlacements(
          surfaceType: surfaceType,
          surfaceEntityId: surfaceEntityId,
        ),
        fallback: const <AffiliateProduct>[],
      ),
    );
  }

  Future<List<AffiliateProduct>> _fetchPlacements({
    required String surfaceType,
    String? surfaceEntityId,
  }) async {
    // Join placements → products, filtering by surface and active status.
    // All filter calls must precede order/limit.
    var filterQuery = supabase
        .schema('socelle')
        .from('affiliate_placements')
        .select(
          'position, affiliate_products!inner('
          'id, name, brand, category, subcategory, description, '
          'image_url, affiliate_url, affiliate_network, '
          'commission_rate, price_cents, relevance_score'
          ')',
        )
        .eq('surface_type', surfaceType)
        .eq('is_active', true);

    if (surfaceEntityId != null) {
      filterQuery = filterQuery.eq('surface_entity_id', surfaceEntityId);
    } else {
      filterQuery = filterQuery.isFilter('surface_entity_id', null);
    }

    final response = await filterQuery.order('position').limit(2);
    return response
        .map((row) {
          final productJson = row['affiliate_products'] as Map<String, dynamic>;
          return AffiliateProduct.fromJson(productJson);
        })
        .where((p) => p.isActive && (p.relevanceScore ?? 0) >= 0.70)
        .toList();
  }

  /// Fetches active affiliate products by category (for browse surfaces).
  Future<List<AffiliateProduct>> fetchByCategory(
    String category, {
    int limit = 20,
  }) async {
    final cacheKey = 'affiliate:category:$category:$limit';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () async {
          final response = await supabase
              .schema('socelle')
              .from('affiliate_products')
              .select(
                'id, name, brand, category, subcategory, description, '
                'image_url, affiliate_url, affiliate_network, '
                'commission_rate, price_cents, relevance_score',
              )
              .eq('category', category)
              .eq('is_active', true)
              .gte('relevance_score', 0.70)
              .order('relevance_score', ascending: false)
              .limit(limit);

          return (response as List<dynamic>)
              .map((json) =>
                  AffiliateProduct.fromJson(json as Map<String, dynamic>))
              .toList();
        },
        fallback: const <AffiliateProduct>[],
      ),
    );
  }

  /// Records a click on an affiliate placement (INSERT-only, no read).
  ///
  /// Fire-and-forget — failures are non-fatal. The placement renderer
  /// calls this when a user taps an affiliate link.
  Future<void> recordClick({
    required String placementId,
    required String sessionId,
    String? userId,
    String? referrerUrl,
  }) async {
    await guardedFetch(
      () async {
        await supabase.schema('socelle').from('affiliate_clicks').insert({
          'placement_id': placementId,
          'session_id': sessionId,
          if (userId != null) 'user_id': userId,
          if (referrerUrl != null) 'referrer_url': referrerUrl,
        });
      },
      fallback: null,
    );
  }

  /// Fetches all active affiliate products sorted by relevance score.
  ///
  /// Used by the Products browse tab (no surface/entity filter).
  Future<List<AffiliateProduct>> fetchAllActive({int limit = 20}) async {
    final cacheKey = 'affiliate:all:$limit';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () async {
          final response = await supabase
              .schema('socelle')
              .from('affiliate_products')
              .select(
                'id, name, brand, category, subcategory, description, '
                'image_url, affiliate_url, affiliate_network, '
                'commission_rate, price_cents, relevance_score',
              )
              .eq('is_active', true)
              .gte('relevance_score', 0.70)
              .order('relevance_score', ascending: false)
              .limit(limit);

          return (response as List<dynamic>)
              .map((json) =>
                  AffiliateProduct.fromJson(json as Map<String, dynamic>))
              .toList();
        },
        fallback: const <AffiliateProduct>[],
      ),
    );
  }

  void invalidateCache() => cache.invalidatePrefix('affiliate:');
}

// ─── Riverpod provider ───────────────────────────────────────────────────────

final affiliateRepositoryProvider = Provider<AffiliateRepository>(
  (_) => const AffiliateRepository(),
);

/// Surface-based placements — max 2 products for a given surface.
///
/// Argument: [surfaceType] — 'feed' | 'brand_page' | 'event' | 'education'.
final affiliatePlacementsProvider =
    FutureProvider.family<List<AffiliateProduct>, String>(
  (ref, surfaceType) => ref
      .watch(affiliateRepositoryProvider)
      .fetchPlacementsForSurface(surfaceType: surfaceType),
);

/// Category browse — null = all active products; non-null = by category.
///
/// Used by the Products tab in Discover. Returns up to 20 items.
final affiliateProductsProvider =
    FutureProvider.family<List<AffiliateProduct>, String?>(
  (ref, category) {
    final repo = ref.watch(affiliateRepositoryProvider);
    return category == null ? repo.fetchAllActive() : repo.fetchByCategory(category);
  },
);
