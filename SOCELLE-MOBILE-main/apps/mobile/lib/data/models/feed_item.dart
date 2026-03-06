/// Intelligence feed item from the [intelligence_signals] Supabase table,
/// or from the /intelligence-feeds edge function (RSS aggregator).
///
/// Table: public.intelligence_signals
/// Edge function: /intelligence-feeds (FeedItem[] JSON)
class FeedItem {
  const FeedItem({
    required this.id,
    required this.title,
    required this.description,
    required this.url,
    required this.publishedAt,
    this.imageUrl,
    this.category,
    this.tags = const [],
    this.sentiment,
    this.brandMention,
  });

  final String id;
  final String title;
  final String description;
  final String url;
  final DateTime publishedAt;
  final String? imageUrl;

  /// e.g. 'skincare' | 'haircare' | 'business' | 'wellness'
  final String? category;

  final List<String> tags;

  /// 'positive' | 'negative' | 'neutral' — AI-assigned
  final String? sentiment;

  /// Brand name mentioned in the signal, if any
  final String? brandMention;

  factory FeedItem.fromJson(Map<String, dynamic> json) {
    return FeedItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      url: json['url'] as String? ?? '',
      publishedAt: json['published_at'] != null
          ? DateTime.tryParse(json['published_at'] as String) ?? DateTime.now()
          : DateTime.now(),
      imageUrl: json['image_url'] as String?,
      category: json['category'] as String?,
      tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? const [],
      sentiment: json['sentiment'] as String?,
      brandMention: json['brand_mention'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'url': url,
        'published_at': publishedAt.toIso8601String(),
        if (imageUrl != null) 'image_url': imageUrl,
        if (category != null) 'category': category,
        'tags': tags,
        if (sentiment != null) 'sentiment': sentiment,
        if (brandMention != null) 'brand_mention': brandMention,
      };
}
