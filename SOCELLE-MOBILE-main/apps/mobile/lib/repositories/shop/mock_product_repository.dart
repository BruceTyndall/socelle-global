import '../../models/shop/product.dart';
import '../../models/shop/product_pricing.dart';
import 'product_repository.dart';

/// Mock product repository — serves the existing Shop page UI with hardcoded
/// data so the current experience is unchanged.
///
/// This mirrors the `_kAllProducts` data that was inline in shop_page.dart
/// but now lives behind the [ProductRepository] interface so the UI can be
/// swapped to real Supabase data with zero page-level changes.
class MockProductRepository implements ProductRepository {
  // ---------------------------------------------------------------------------
  // Mock product catalog — maps directly to the 6 products from shop_page.dart
  // ---------------------------------------------------------------------------

  static final _now = DateTime.now();
  static const _mockBrandId = 'mock-brand-001';

  static final List<Product> _products = [
    Product(
      id: 'prod-001',
      brandId: _mockBrandId,
      name: 'Lash Aftercare Kit',
      description: 'Oil-free cleanser + brush set',
      images: [],
      category: 'retail',
      status: ProductStatus.active,
      createdAt: _now.subtract(const Duration(days: 30)),
      updatedAt: _now.subtract(const Duration(days: 2)),
    ),
    Product(
      id: 'prod-002',
      brandId: _mockBrandId,
      name: 'Volume Set Package',
      description: '2-hour full set — book online',
      images: [],
      category: 'service_package',
      status: ProductStatus.active,
      createdAt: _now.subtract(const Duration(days: 60)),
      updatedAt: _now.subtract(const Duration(days: 5)),
    ),
    Product(
      id: 'prod-003',
      brandId: _mockBrandId,
      name: 'Lash Care Guide',
      description: 'PDF — instant download',
      images: [],
      category: 'digital',
      status: ProductStatus.active,
      createdAt: _now.subtract(const Duration(days: 14)),
      updatedAt: _now.subtract(const Duration(days: 1)),
    ),
    Product(
      id: 'prod-004',
      brandId: _mockBrandId,
      name: 'Retention Serum',
      description: 'Extends wear by 30%',
      images: [],
      category: 'retail',
      status: ProductStatus.active,
      createdAt: _now.subtract(const Duration(days: 45)),
      updatedAt: _now.subtract(const Duration(days: 10)),
    ),
    Product(
      id: 'prod-005',
      brandId: _mockBrandId,
      name: 'Mega Volume + Refill Bundle',
      description: 'Fill within 3 weeks — save \$40',
      images: [],
      category: 'service_package',
      status: ProductStatus.active,
      createdAt: _now.subtract(const Duration(days: 20)),
      updatedAt: _now.subtract(const Duration(days: 3)),
    ),
    Product(
      id: 'prod-006',
      brandId: _mockBrandId,
      name: 'Lash Artist Tutorial',
      description: '90-min video masterclass',
      images: [],
      category: 'digital',
      status: ProductStatus.active,
      createdAt: _now.subtract(const Duration(days: 7)),
      updatedAt: _now,
    ),
  ];

  static final Map<String, List<ProductPricing>> _pricing = {
    'prod-001': [
      const ProductPricing(
          productId: 'prod-001', tier: PricingTier.msrp, priceCents: 3500),
      const ProductPricing(
          productId: 'prod-001', tier: PricingTier.active, priceCents: 2800),
      const ProductPricing(
          productId: 'prod-001', tier: PricingTier.elite, priceCents: 2400),
      const ProductPricing(
          productId: 'prod-001', tier: PricingTier.master, priceCents: 2100),
    ],
    'prod-002': [
      const ProductPricing(
          productId: 'prod-002', tier: PricingTier.msrp, priceCents: 24500),
      const ProductPricing(
          productId: 'prod-002', tier: PricingTier.active, priceCents: 19500),
    ],
    'prod-003': [
      const ProductPricing(
          productId: 'prod-003', tier: PricingTier.msrp, priceCents: 1500),
      const ProductPricing(
          productId: 'prod-003', tier: PricingTier.active, priceCents: 1200),
    ],
    'prod-004': [
      const ProductPricing(
          productId: 'prod-004', tier: PricingTier.msrp, priceCents: 5600),
      const ProductPricing(
          productId: 'prod-004', tier: PricingTier.active, priceCents: 4500),
      const ProductPricing(
          productId: 'prod-004', tier: PricingTier.elite, priceCents: 3800),
      const ProductPricing(
          productId: 'prod-004', tier: PricingTier.master, priceCents: 3200),
    ],
    'prod-005': [
      const ProductPricing(
          productId: 'prod-005', tier: PricingTier.msrp, priceCents: 35000),
      const ProductPricing(
          productId: 'prod-005', tier: PricingTier.active, priceCents: 28500),
    ],
    'prod-006': [
      const ProductPricing(
          productId: 'prod-006', tier: PricingTier.msrp, priceCents: 11900),
      const ProductPricing(
          productId: 'prod-006', tier: PricingTier.active, priceCents: 8900),
    ],
  };

  @override
  Future<List<Product>> getProducts(String brandId) async {
    // Simulate network delay for realistic UI behavior.
    await Future.delayed(const Duration(milliseconds: 100));
    return _products.where((p) => p.isActive).toList();
  }

  @override
  Future<Product> getProductDetail(String productId) async {
    await Future.delayed(const Duration(milliseconds: 50));
    return _products.firstWhere(
      (p) => p.id == productId,
      orElse: () => throw Exception('Product not found: $productId'),
    );
  }

  @override
  Future<ProductPricing> getProductPricing(
    String productId,
    String tierLevel,
  ) async {
    await Future.delayed(const Duration(milliseconds: 50));
    final tier = PricingTier.fromString(tierLevel);
    final prices = _pricing[productId];
    if (prices == null) {
      throw Exception('No pricing for product: $productId');
    }
    return prices.firstWhere(
      (p) => p.tier == tier,
      orElse: () => prices.first, // Fallback to first available tier.
    );
  }

  @override
  Future<List<Product>> searchProducts(
    String query,
    Map<String, dynamic> filters,
  ) async {
    await Future.delayed(const Duration(milliseconds: 80));
    final lowerQuery = query.toLowerCase();
    var results = _products.where((p) => p.isActive);

    if (query.isNotEmpty) {
      results = results.where(
        (p) =>
            p.name.toLowerCase().contains(lowerQuery) ||
            p.description.toLowerCase().contains(lowerQuery),
      );
    }

    final category = filters['category'] as String?;
    if (category != null && category.isNotEmpty) {
      results = results.where((p) => p.category == category);
    }

    return results.toList();
  }
}
