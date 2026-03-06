import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/quiz.dart';
import 'base_repository.dart';

/// Fetches CE quizzes and education content from [education_content] table.
///
/// Table: public.education_content
/// content_type: 'protocol' | 'article' | 'video' | 'webinar' | 'ce_course'
///
/// Activated in M5. Currently returns empty list (stub).
class QuizzesRepository extends BaseRepository {
  const QuizzesRepository();

  static const _cacheTtl = Duration(hours: 2);

  Future<List<QuizItem>> fetchCeContent({
    String? category,
    bool ceOnly = false,
    int limit = 20,
  }) async {
    final cacheKey = 'quizzes:${category ?? 'all'}:ce=$ceOnly:$limit';

    return cache.getOrFetch(
      key: cacheKey,
      ttl: _cacheTtl,
      fetch: () => guardedFetch(
        () async {
          // All filter calls must precede order/limit.
          var filterQuery = supabase
              .from('education_content')
              .select(
                'id, title, content_type, category, description, '
                'thumbnail_url, ce_eligible, ce_credits, difficulty',
              );

          if (category != null) {
            filterQuery = filterQuery.eq('category', category);
          }
          if (ceOnly) {
            filterQuery = filterQuery.eq('ce_eligible', true);
          }

          final response = await filterQuery
              .order('created_at', ascending: false)
              .limit(limit);
          return response
              .map((json) => QuizItem.fromJson(json))
              .toList();
        },
        fallback: const <QuizItem>[],
      ),
    );
  }

  void invalidateCache() => cache.invalidatePrefix('quizzes:');
}

final quizzesRepositoryProvider = Provider<QuizzesRepository>(
  (_) => const QuizzesRepository(),
);

/// Provider — argument is `(category, ceOnly)` record tuple.
///
/// Uses a Dart 3 record so both filter params are carried as one family arg.
/// Record equality ensures proper caching: `(null, false) == (null, false)`.
final quizzesProvider =
    FutureProvider.family<List<QuizItem>, (String?, bool)>(
  (ref, args) {
    final (category, ceOnly) = args;
    return ref.watch(quizzesRepositoryProvider).fetchCeContent(
      category: category,
      ceOnly: ceOnly,
    );
  },
);
