/// Brand from the [brands] Supabase table.
///
/// Table: public.brands
/// Fields: id, name, slug, description, logo_url, hero_image_url,
///         theme (JSONB), is_published, status
class Brand {
  const Brand({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.logoUrl,
    this.heroImageUrl,
    this.theme,
    this.isPublished = false,
    this.status,
  });

  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? logoUrl;
  final String? heroImageUrl;

  /// JSONB: { colors: {primary, secondary}, typography: {heading, body} }
  final Map<String, dynamic>? theme;

  final bool isPublished;

  /// 'active' | 'pending' | 'inactive'
  final String? status;

  factory Brand.fromJson(Map<String, dynamic> json) {
    return Brand(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String?,
      logoUrl: json['logo_url'] as String?,
      heroImageUrl: json['hero_image_url'] as String?,
      theme: json['theme'] as Map<String, dynamic>?,
      isPublished: json['is_published'] as bool? ?? false,
      status: json['status'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        if (description != null) 'description': description,
        if (logoUrl != null) 'logo_url': logoUrl,
        if (heroImageUrl != null) 'hero_image_url': heroImageUrl,
        if (theme != null) 'theme': theme,
        'is_published': isPublished,
        if (status != null) 'status': status,
      };
}
