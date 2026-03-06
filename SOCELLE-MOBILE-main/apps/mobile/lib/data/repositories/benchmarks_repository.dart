import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'base_repository.dart';

/// Benchmark dimensions from business intelligence materialized views.
///
/// Dimensions computed by computeBenchmarks.ts (web):
///   treatment_velocity, product_adoption, pricing_strategy,
///   customer_satisfaction, operational_efficiency
///
/// Mobile reads from Supabase benchmark tables / materialized views.
/// Activated in M8. Currently returns empty map (stub).
class BenchmarksRepository extends BaseRepository {
  const BenchmarksRepository();

  static const _cacheTtl = Duration(hours: 6);

  /// Returns benchmark scores for the current business.
  /// Keys match the 5 computed dimensions from the web platform.
  Future<Map<String, double>> fetchBenchmarks({
    required String businessId,
  }) async {
    final cacheKey = 'benchmarks:$businessId';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () async {
          // TODO(M8): implement Supabase benchmark view query
          // await supabase.from('benchmark_scores').select().eq('business_id', businessId).single();
          return const <String, double>{};
        },
        fallback: const <String, double>{},
      ),
    );
  }

  void invalidateCache() => cache.invalidatePrefix('benchmarks:');
}

final benchmarksRepositoryProvider = Provider<BenchmarksRepository>(
  (_) => const BenchmarksRepository(),
);
