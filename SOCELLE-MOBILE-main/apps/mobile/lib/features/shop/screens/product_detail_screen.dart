import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';

/// Product detail screen — shows full product information.
///
/// DEMO surface: Falls back to demo data when Supabase is not connected.

final _productDetailProvider =
    FutureProvider.family<Map<String, dynamic>?, String>((ref, productId) async {
  if (!SocelleSupabaseClient.isInitialized || productId.startsWith('demo-')) {
    return {
      'id': productId,
      'name': 'Hydrating Peptide Serum',
      'brand_name': 'SkinScience Pro',
      'description': 'A professional-grade peptide serum that delivers deep hydration and promotes collagen synthesis. Formulated with a proprietary blend of copper peptides, hyaluronic acid, and niacinamide for visible results within 4 weeks.',
      'price': 89.00,
      'image_url': '',
      'category': 'Serums',
      'size': '30ml',
      'key_ingredients': 'Copper Peptides, Hyaluronic Acid, Niacinamide, Squalane',
      'is_demo': true,
    };
  }
  try {
    final response = await SocelleSupabaseClient.client
        .from('products')
        .select()
        .eq('id', productId)
        .single();
    return response;
  } catch (_) {
    return null;
  }
});

class ProductDetailScreen extends ConsumerWidget {
  const ProductDetailScreen({super.key, required this.productId});

  final String productId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productAsync = ref.watch(_productDetailProvider(productId));

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border_rounded, size: 22),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: productAsync.when(
        data: (product) {
          if (product == null) {
            return const socelle.SocelleErrorWidget(
              message: 'Product not found.',
            );
          }

          final isDemo = product['is_demo'] == true || !SocelleSupabaseClient.isInitialized;
          final imageUrl = product['image_url'] as String? ?? '';

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product image
                AspectRatio(
                  aspectRatio: 1,
                  child: imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            color: SocelleTheme.warmIvory,
                            child: const SocelleLoadingWidget(),
                          ),
                          errorWidget: (_, __, ___) =>
                              _buildPlaceholderImage(),
                        )
                      : _buildPlaceholderImage(),
                ),

                Padding(
                  padding: const EdgeInsets.all(SocelleTheme.spacingLg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (isDemo) ...[
                        const DemoBadge(),
                        const SizedBox(height: SocelleTheme.spacingMd),
                      ],

                      // Brand
                      Text(
                        product['brand_name'] as String? ?? '',
                        style: SocelleTheme.labelMedium.copyWith(
                          color: SocelleTheme.accent,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: SocelleTheme.spacingXs),

                      // Name
                      Text(
                        product['name'] as String? ?? '',
                        style: SocelleTheme.headlineMedium,
                      ),
                      const SizedBox(height: SocelleTheme.spacingSm),

                      // Price + size
                      Row(
                        children: [
                          Text(
                            '\$${(product['price'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
                            style: SocelleTheme.headlineSmall,
                          ),
                          if (product['size'] != null) ...[
                            const SizedBox(width: SocelleTheme.spacingSm),
                            Text(
                              '/ ${product['size']}',
                              style: SocelleTheme.bodyMedium,
                            ),
                          ],
                        ],
                      ),

                      const SizedBox(height: SocelleTheme.spacingLg),
                      const Divider(),
                      const SizedBox(height: SocelleTheme.spacingLg),

                      // Description
                      Text('Description', style: SocelleTheme.titleMedium),
                      const SizedBox(height: SocelleTheme.spacingSm),
                      Text(
                        product['description'] as String? ?? '',
                        style: SocelleTheme.bodyLarge,
                      ),

                      if (product['key_ingredients'] != null) ...[
                        const SizedBox(height: SocelleTheme.spacingLg),
                        Text('Key Ingredients', style: SocelleTheme.titleMedium),
                        const SizedBox(height: SocelleTheme.spacingSm),
                        Text(
                          product['key_ingredients'] as String,
                          style: SocelleTheme.bodyLarge,
                        ),
                      ],

                      const SizedBox(height: SocelleTheme.spacingXl),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading product...'),
        error: (e, _) => socelle.SocelleErrorWidget(
          message: 'Failed to load product.',
          onRetry: () => ref.invalidate(_productDetailProvider(productId)),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(SocelleTheme.spacingMd),
          child: FilledButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Added to cart')),
              );
            },
            child: const Text('Add to Cart'),
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      color: SocelleTheme.warmIvory,
      child: Center(
        child: Icon(
          Icons.spa_outlined,
          size: 64,
          color: SocelleTheme.accent.withValues(alpha: 0.4),
        ),
      ),
    );
  }
}
