/// Product model — matches Socelle Supabase `pro_products` schema.
///
/// See SOCELLE_MASTER_PROMPT_FINAL.md § 7 for business rules:
/// - Brands set their own wholesale pricing per product
/// - Tiered pricing: msrp / active / elite / master
/// - Soft deletes via [deletedAt]
class Product {
  const Product({
    required this.id,
    required this.brandId,
    required this.name,
    required this.description,
    required this.category,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.images = const [],
    this.variants,
    this.deletedAt,
  });

  final String id;
  final String brandId;
  final String name;
  final String description;

  /// Product image URLs. First is hero/cover.
  final List<String> images;

  /// Product category (e.g. 'retail', 'service_package', 'digital', 'gift_card').
  final String category;

  /// Lifecycle status on the marketplace.
  final ProductStatus status;

  /// Optional product variants (size, color, etc.).
  /// Stored as JSON on Supabase — decoded here as list of maps.
  final List<Map<String, dynamic>>? variants;

  final DateTime createdAt;
  final DateTime updatedAt;

  /// Non-null if soft-deleted.
  final DateTime? deletedAt;

  bool get isActive => status == ProductStatus.active && deletedAt == null;

  /// Deserialize from Supabase row.
  factory Product.fromMap(Map<String, dynamic> map) {
    return Product(
      id: map['id'] as String,
      brandId: map['brand_id'] as String,
      name: map['name'] as String,
      description: map['description'] as String? ?? '',
      images: (map['images'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      category: map['category'] as String? ?? 'retail',
      status: ProductStatus.fromString(map['status'] as String? ?? 'draft'),
      variants: (map['variants'] as List<dynamic>?)
          ?.map((e) => Map<String, dynamic>.from(e as Map))
          .toList(),
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
      deletedAt: map['deleted_at'] != null
          ? DateTime.parse(map['deleted_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'brand_id': brandId,
      'name': name,
      'description': description,
      'images': images,
      'category': category,
      'status': status.value,
      'variants': variants,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      if (deletedAt != null) 'deleted_at': deletedAt!.toIso8601String(),
    };
  }

  Product copyWith({
    String? name,
    String? description,
    List<String>? images,
    String? category,
    ProductStatus? status,
    List<Map<String, dynamic>>? variants,
    DateTime? updatedAt,
    DateTime? deletedAt,
  }) {
    return Product(
      id: id,
      brandId: brandId,
      name: name ?? this.name,
      description: description ?? this.description,
      images: images ?? this.images,
      category: category ?? this.category,
      status: status ?? this.status,
      variants: variants ?? this.variants,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      deletedAt: deletedAt ?? this.deletedAt,
    );
  }
}

/// Marketplace product lifecycle status.
enum ProductStatus {
  active('active'),
  draft('draft'),
  archived('archived');

  const ProductStatus(this.value);
  final String value;

  factory ProductStatus.fromString(String s) {
    return ProductStatus.values.firstWhere(
      (e) => e.value == s,
      orElse: () => ProductStatus.draft,
    );
  }
}
