import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/event.dart';
import 'base_repository.dart';

/// Fetches industry events from [socelle.events] Supabase table.
///
/// Schema: socelle (requires schema-qualified queries).
/// Cache TTL: 15 minutes (events change more frequently than brands).
class EventsRepository extends BaseRepository {
  const EventsRepository();

  static const _cacheTtl = Duration(minutes: 15);

  /// Fetches upcoming events, optionally filtered by specialty tags.
  ///
  /// Returns events with start_date >= today, not cancelled, not hidden.
  /// Featured events are returned first.
  Future<List<SocelleEvent>> fetchUpcomingEvents({
    List<String> specialtyTags = const [],
    bool ceOnly = false,
    bool virtualOnly = false,
    int limit = 20,
    int offset = 0,
  }) async {
    final tagKey = specialtyTags.isEmpty ? 'all' : specialtyTags.join(',');
    final cacheKey =
        'events:upcoming:$tagKey:ce=$ceOnly:virt=$virtualOnly:$limit:$offset';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () => _fetchUpcoming(
          specialtyTags: specialtyTags,
          ceOnly: ceOnly,
          virtualOnly: virtualOnly,
          limit: limit,
          offset: offset,
        ),
        fallback: const <SocelleEvent>[],
      ),
    );
  }

  Future<List<SocelleEvent>> _fetchUpcoming({
    required List<String> specialtyTags,
    required bool ceOnly,
    required bool virtualOnly,
    required int limit,
    required int offset,
  }) async {
    final today = DateTime.now().toIso8601String().substring(0, 10);

    // All filter calls must precede order/range.
    var filterQuery = supabase
        .schema('socelle')
        .from('events')
        .select(
          'id, name, slug, event_type, description, organizer_name, '
          'registration_url, registration_price_min_cents, '
          'registration_price_max_cents, is_free, '
          'ce_credits_available, ce_credits_count, ce_provider, '
          'start_date, end_date, start_time, timezone, '
          'is_virtual, virtual_platform, venue_name, city, state, '
          'specialty_tags, brand_sponsors, hero_image_url, '
          'is_featured, source_url',
        )
        .gte('start_date', today)
        .eq('is_cancelled', false)
        .eq('is_hidden', false);

    if (ceOnly) {
      filterQuery = filterQuery.eq('ce_credits_available', true);
    }
    if (virtualOnly) {
      filterQuery = filterQuery.eq('is_virtual', true);
    }
    if (specialtyTags.isNotEmpty) {
      // PostgreSQL array overlap: specialty_tags && ARRAY[...]
      filterQuery = filterQuery.overlaps('specialty_tags', specialtyTags);
    }

    final response = await filterQuery
        .order('is_featured', ascending: false)
        .order('start_date')
        .range(offset, offset + limit - 1);

    return response
        .map((json) => SocelleEvent.fromJson(json))
        .toList();
  }

  /// Fetches a single event by slug.
  Future<SocelleEvent?> fetchBySlug(String slug) async {
    final cacheKey = 'events:slug:$slug';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () async {
          final response = await supabase
              .schema('socelle')
              .from('events')
              .select()
              .eq('slug', slug)
              .eq('is_cancelled', false)
              .maybeSingle();

          if (response == null) return null;
          return SocelleEvent.fromJson(response);
        },
        fallback: null,
      ),
    );
  }

  void invalidateCache() => cache.invalidatePrefix('events:');
}

// ─── Riverpod providers ──────────────────────────────────────────────────────

final eventsRepositoryProvider = Provider<EventsRepository>(
  (_) => const EventsRepository(),
);

/// Upcoming events, optionally filtered by specialty tags.
final upcomingEventsProvider =
    FutureProvider.family<List<SocelleEvent>, List<String>>(
  (ref, specialtyTags) async {
    final repo = ref.watch(eventsRepositoryProvider);
    return repo.fetchUpcomingEvents(specialtyTags: specialtyTags);
  },
);
