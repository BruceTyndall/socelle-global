import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../repositories/shop/mock_product_repository.dart';
import '../repositories/shop/product_repository.dart';

/// Provides the active [ProductRepository] implementation.
///
/// DEFAULT: [MockProductRepository] — returns hardcoded product data so the
/// Shop page UI works identically to its current state.
///
/// SWAP TO: [SupabaseProductRepository] when Socelle backend is live.
/// To swap, change the body to:
///   return SupabaseProductRepository();
/// and import 'package:socelle_mobile/repositories/shop/supabase_product_repository.dart';
final shopRepositoryProvider = Provider<ProductRepository>((ref) {
  // ── Swap to SupabaseProductRepository when Socelle backend is live ──
  return MockProductRepository();
});
