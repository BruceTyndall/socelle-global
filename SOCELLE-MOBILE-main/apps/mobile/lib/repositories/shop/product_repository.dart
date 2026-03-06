import '../../models/shop/product.dart';
import '../../models/shop/product_pricing.dart';

/// Backend-agnostic product catalog interface.
///
/// Two implementations:
/// - [MockProductRepository]  → returns hardcoded data (current default)
/// - [SupabaseProductRepository] → connects to Socelle backend (stubbed)
///
/// Swap the active implementation in [shopRepositoryProvider] when
/// Socelle backend is live.
abstract class ProductRepository {
  /// Fetch all active products for a given brand.
  Future<List<Product>> getProducts(String brandId);

  /// Fetch a single product by ID.
  Future<Product> getProductDetail(String productId);

  /// Fetch pricing for a product at a specific tier.
  Future<ProductPricing> getProductPricing(
    String productId,
    String tierLevel,
  );

  /// Search products by query string and optional filters.
  ///
  /// [filters] can include keys like 'category', 'status', 'brand_id'.
  Future<List<Product>> searchProducts(
    String query,
    Map<String, dynamic> filters,
  );
}
