/// Affiliate product from [socelle.affiliate_products].
///
/// Schema: socelle.affiliate_products (AFFILIATE_MIGRATION.sql, March 2026)
/// Only active products with relevance_score >= 0.70 are returned by queries
/// (enforced at the RLS/index level).
class AffiliateProduct {
  const AffiliateProduct({
    required this.id,
    required this.name,
    required this.category,
    required this.affiliateUrl,
    required this.affiliateNetwork,
    this.brand,
    this.subcategory,
    this.description,
    this.imageUrl,
    this.affiliateProgramId,
    this.commissionRate,
    this.cookieDurationDays,
    this.priceCents,
    this.isActive = true,
    this.relevanceScore,
  });

  final String id;
  final String name;

  /// 'skincare' | 'haircare' | 'tools' | 'devices' | 'nails' |
  /// 'business' | 'supplies' | 'wellness'
  final String category;

  final String affiliateUrl;

  /// 'shareasale' | 'impact' | 'cj' | 'amazon' | 'brand_direct'
  final String affiliateNetwork;

  final String? brand;
  final String? subcategory;
  final String? description;
  final String? imageUrl;
  final String? affiliateProgramId;

  /// Commission percentage, e.g. 8.50 = 8.5%
  final double? commissionRate;
  final int? cookieDurationDays;

  /// Price in USD cents, e.g. 18200 = $182.00
  final int? priceCents;
  final bool isActive;

  /// 0.00–1.00. Products with score < 0.70 are excluded from placement queries.
  final double? relevanceScore;

  /// Price formatted as a display string, e.g. "$182.00"
  String get priceDisplay {
    if (priceCents == null) return '';
    final dollars = priceCents! / 100;
    return '\$${dollars.toStringAsFixed(2)}';
  }

  factory AffiliateProduct.fromJson(Map<String, dynamic> json) {
    return AffiliateProduct(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? '',
      affiliateUrl: json['affiliate_url'] as String? ?? '',
      affiliateNetwork: json['affiliate_network'] as String? ?? '',
      brand: json['brand'] as String?,
      subcategory: json['subcategory'] as String?,
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String?,
      affiliateProgramId: json['affiliate_program_id'] as String?,
      commissionRate: (json['commission_rate'] as num?)?.toDouble(),
      cookieDurationDays: json['cookie_duration_days'] as int?,
      priceCents: json['price_cents'] as int?,
      isActive: json['is_active'] as bool? ?? true,
      relevanceScore: (json['relevance_score'] as num?)?.toDouble(),
    );
  }
}
