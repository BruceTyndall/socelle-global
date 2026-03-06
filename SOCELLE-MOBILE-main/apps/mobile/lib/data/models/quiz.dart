/// CE quiz or brand poll from [education_content] Supabase table.
///
/// Table: public.education_content
/// content_type: 'protocol' | 'article' | 'video' | 'webinar' | 'ce_course'
class QuizItem {
  const QuizItem({
    required this.id,
    required this.title,
    required this.contentType,
    this.category,
    this.description,
    this.thumbnailUrl,
    this.isCeEligible = false,
    this.ceCredits,
    this.difficulty,
    this.durationMinutes,
  });

  final String id;
  final String title;

  /// 'protocol' | 'article' | 'video' | 'webinar' | 'ce_course'
  final String contentType;

  final String? category;
  final String? description;
  final String? thumbnailUrl;
  final bool isCeEligible;

  /// Number of CE credits awarded on completion
  final double? ceCredits;

  /// 'beginner' | 'intermediate' | 'advanced'
  final String? difficulty;

  final int? durationMinutes;

  factory QuizItem.fromJson(Map<String, dynamic> json) {
    return QuizItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      contentType: json['content_type'] as String? ?? 'article',
      category: json['category'] as String?,
      description: json['description'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      isCeEligible: json['ce_eligible'] as bool? ?? false,
      ceCredits: (json['ce_credits'] as num?)?.toDouble(),
      difficulty: json['difficulty'] as String?,
      durationMinutes: json['duration_minutes'] as int?,
    );
  }
}
