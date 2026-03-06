/// Tiered pricing model — matches Socelle Supabase `product_pricing` table.
///
/// See SOCELLE_MASTER_PROMPT_FINAL.md § 7:
/// - Brands set their own wholesale pricing per product
/// - Tiered pricing rewards volume buyers:
///   msrp  → suggested retail (reference only, never charged on platform)
///   active → standard wholesale (default for new resellers)
///   elite  → better pricing for mid-volume resellers
///   master → best pricing for top-volume resellers
/// - All prices stored as integer cents to avoid floating-point rounding.
class ProductPricing {
  const ProductPricing({
    required this.productId,
    required this.tier,
    required this.priceCents,
  });

  final String productId;
  final PricingTier tier;

  /// Price in cents (e.g. 4500 = $45.00). Integer to avoid float errors.
  final int priceCents;

  /// Convenience getter — dollars with 2 decimal places.
  double get priceDouble => priceCents / 100.0;

  /// Formatted price string (e.g. "\$45.00").
  String get formatted {
    final dollars = priceCents ~/ 100;
    final cents = priceCents % 100;
    return '\$$dollars.${cents.toString().padLeft(2, '0')}';
  }

  factory ProductPricing.fromMap(Map<String, dynamic> map) {
    return ProductPricing(
      productId: map['product_id'] as String,
      tier: PricingTier.fromString(map['tier'] as String? ?? 'active'),
      priceCents: map['price'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'product_id': productId,
      'tier': tier.value,
      'price': priceCents,
    };
  }
}

/// Socelle wholesale pricing tiers.
enum PricingTier {
  msrp('msrp'),
  active('active'),
  elite('elite'),
  master('master');

  const PricingTier(this.value);
  final String value;

  factory PricingTier.fromString(String s) {
    return PricingTier.values.firstWhere(
      (e) => e.value == s,
      orElse: () => PricingTier.active,
    );
  }

  String get label {
    switch (this) {
      case PricingTier.msrp:
        return 'MSRP';
      case PricingTier.active:
        return 'Active';
      case PricingTier.elite:
        return 'Elite';
      case PricingTier.master:
        return 'Master';
    }
  }
}
