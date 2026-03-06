import '../../models/shop/product.dart';
import '../../models/shop/product_pricing.dart';
import 'product_repository.dart';

/// Supabase-backed product repository — connects to Socelle backend.
///
/// All methods currently throw [UnimplementedError]. Activate when:
/// 1. Socelle Supabase backend has the `pro_products` and `product_pricing`
///    tables populated (see SOCELLE_MASTER_PROMPT_FINAL.md § 12).
/// 2. `supabase_flutter` is added to pubspec.yaml.
/// 3. [SocelleSupabaseClient] is properly initialized with env credentials.
/// 4. Identity bridge maps Firebase UID → Socelle user ID.
///
/// Swap this in via [shopRepositoryProvider] in providers/shop_provider.dart.
class SupabaseProductRepository implements ProductRepository {
  @override
  Future<List<Product>> getProducts(String brandId) {
    // Connects to Socelle backend: SELECT * FROM pro_products
    // WHERE brand_id = $brandId AND deleted_at IS NULL
    // ORDER BY sort_order ASC, created_at DESC
    throw UnimplementedError(
      'SupabaseProductRepository.getProducts — '
      'connects to Socelle backend when live.',
    );
  }

  @override
  Future<Product> getProductDetail(String productId) {
    // Connects to Socelle backend: SELECT * FROM pro_products
    // WHERE id = $productId
    throw UnimplementedError(
      'SupabaseProductRepository.getProductDetail — '
      'connects to Socelle backend when live.',
    );
  }

  @override
  Future<ProductPricing> getProductPricing(
    String productId,
    String tierLevel,
  ) {
    // Connects to Socelle backend: SELECT * FROM product_pricing
    // WHERE product_id = $productId AND tier = $tierLevel
    throw UnimplementedError(
      'SupabaseProductRepository.getProductPricing — '
      'connects to Socelle backend when live.',
    );
  }

  @override
  Future<List<Product>> searchProducts(
    String query,
    Map<String, dynamic> filters,
  ) {
    // Connects to Socelle backend: full-text search on pro_products
    // with category/status filters
    throw UnimplementedError(
      'SupabaseProductRepository.searchProducts — '
      'connects to Socelle backend when live.',
    );
  }
}
