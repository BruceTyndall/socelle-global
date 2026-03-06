import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'base_repository.dart';

/// Manages operator segment data for personalization and targeting.
///
/// Segments are used to rank feed content, filter events by specialty,
/// and score affiliate product relevance.
///
/// Table: public.user_profiles — column: specialties text[]
class SegmentsRepository extends BaseRepository {
  const SegmentsRepository();

  static const _cacheTtl = Duration(hours: 12);

  /// Returns specialty tags for the current operator from [user_profiles].
  ///
  /// Specialty tags drive feed personalisation (M7) and affiliate relevance
  /// scoring. Returns empty list when the profile row doesn't exist yet.
  Future<List<String>> fetchUserSpecialtyTags({
    required String userId,
  }) async {
    final cacheKey = 'segments:specialties:$userId';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () async {
          final response = await supabase
              .from('user_profiles')
              .select('specialties')
              .eq('id', userId)
              .maybeSingle();

          final raw = response?['specialties'];
          if (raw == null) return const <String>[];
          return (raw as List<dynamic>).cast<String>();
        },
        fallback: const <String>[],
      ),
    );
  }

  void invalidateCache() => cache.invalidatePrefix('segments:');
}

final segmentsRepositoryProvider = Provider<SegmentsRepository>(
  (_) => const SegmentsRepository(),
);

/// Specialty tags for a given Supabase user ID.
///
/// Returns empty list when personalization is not yet configured or the user
/// has no linked Socelle account.
final specialtyTagsProvider = FutureProvider.family<List<String>, String>(
  (ref, supabaseUserId) => ref
      .watch(segmentsRepositoryProvider)
      .fetchUserSpecialtyTags(userId: supabaseUserId),
);
