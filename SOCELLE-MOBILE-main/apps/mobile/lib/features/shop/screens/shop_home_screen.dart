import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';

/// Shop home screen — product discovery.
///
/// DEMO surface until Supabase `products` table is wired.
/// Commerce is a module, not the primary hook — Intelligence leads.

final _productsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoProducts;
  try {
    final response = await SocelleSupabaseClient.client
        .from('products')
        .select('id, name, brand_name, price, image_url, category')
        .eq('status', 'active')
        .order('created_at', ascending: false)
        .limit(20);
    if (response.isEmpty) return _demoProducts;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoProducts;
  }
});

final _isShopLiveProvider = Provider<bool>((ref) {
  final products = ref.watch(_productsProvider).valueOrNull;
  return products != null && products != _demoProducts;
});

const _demoProducts = <Map<String, dynamic>>[
  {'id': 'demo-1', 'name': 'Hydrating Peptide Serum', 'brand_name': 'SkinScience Pro', 'price': 89.00, 'image_url': '', 'category': 'Serums'},
  {'id': 'demo-2', 'name': 'Vitamin C Brightening Cream', 'brand_name': 'LuminaDerm', 'price': 72.00, 'image_url': '', 'category': 'Moisturizers'},
  {'id': 'demo-3', 'name': 'Retinol Night Recovery', 'brand_name': 'DermaElite', 'price': 95.00, 'image_url': '', 'category': 'Treatment'},
  {'id': 'demo-4', 'name': 'Gentle Enzyme Cleanser', 'brand_name': 'PureForm', 'price': 48.00, 'image_url': '', 'category': 'Cleansers'},
  {'id': 'demo-5', 'name': 'SPF 50 Mineral Shield', 'brand_name': 'SkinScience Pro', 'price': 56.00, 'image_url': '', 'category': 'Suncare'},
  {'id': 'demo-6', 'name': 'Niacinamide Pore Refiner', 'brand_name': 'ClearPath', 'price': 62.00, 'image_url': '', 'category': 'Serums'},
];

class ShopHomeScreen extends ConsumerWidget {
  const ShopHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(_productsProvider);
    final isLive = ref.watch(_isShopLiveProvider);

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            snap: true,
            backgroundColor: SocelleTheme.mnBg,
            title: Row(
              children: [
                Text('Shop', style: SocelleTheme.headlineSmall),
                const SizedBox(width: SocelleTheme.spacingSm),
                if (!isLive) const DemoBadge(compact: true),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.favorite_border_rounded, size: 22),
                onPressed: () => context.push('/shop/wishlist'),
              ),
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined, size: 22),
                onPressed: () => context.push('/shop/cart'),
              ),
              const SizedBox(width: 4),
            ],
          ),

          // Categories
          SliverToBoxAdapter(
            child: SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
                children: [
                  _CategoryChip(label: 'All', selected: true, onTap: () {}),
                  _CategoryChip(label: 'Serums', selected: false, onTap: () {}),
                  _CategoryChip(label: 'Moisturizers', selected: false, onTap: () {}),
                  _CategoryChip(label: 'Cleansers', selected: false, onTap: () {}),
                  _CategoryChip(label: 'Treatment', selected: false, onTap: () {}),
                  _CategoryChip(label: 'Suncare', selected: false, onTap: () {}),
                ],
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: SocelleTheme.spacingMd)),

          // Product grid
          productsAsync.when(
            data: (products) {
              if (products.isEmpty) {
                return const SliverFillRemaining(
                  child: socelle.SocelleErrorWidget(
                    message: 'No products available.',
                    icon: Icons.storefront_outlined,
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
                sliver: SliverGrid.count(
                  crossAxisCount: 2,
                  mainAxisSpacing: SocelleTheme.spacingMd,
                  crossAxisSpacing: SocelleTheme.spacingMd,
                  childAspectRatio: 0.68,
                  children: products.map((p) => _ProductCard(product: p)).toList(),
                ),
              );
            },
            loading: () => const SliverFillRemaining(
              child: SocelleLoadingWidget(message: 'Loading products...'),
            ),
            error: (e, _) => SliverFillRemaining(
              child: socelle.SocelleErrorWidget(
                message: 'Failed to load products.',
                onRetry: () => ref.invalidate(_productsProvider),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: SocelleTheme.spacing3xl)),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: SocelleTheme.spacingSm),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: SocelleTheme.graphite,
        labelStyle: TextStyle(
          fontFamily: SocelleTheme.fontFamily,
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: selected ? SocelleTheme.pearlWhite : SocelleTheme.graphite,
        ),
        checkmarkColor: SocelleTheme.pearlWhite,
        shape: RoundedRectangleBorder(borderRadius: SocelleTheme.borderRadiusPill),
        side: selected ? BorderSide.none : const BorderSide(color: SocelleTheme.borderLight),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});

  final Map<String, dynamic> product;

  @override
  Widget build(BuildContext context) {
    final name = product['name'] as String? ?? '';
    final brand = product['brand_name'] as String? ?? '';
    final price = (product['price'] as num?)?.toDouble() ?? 0;
    final imageUrl = product['image_url'] as String? ?? '';
    final id = product['id'] as String? ?? '';

    return GestureDetector(
      onTap: () => context.push('/shop/product/$id'),
      child: Container(
        decoration: BoxDecoration(
          color: SocelleTheme.surfaceElevated,
          borderRadius: SocelleTheme.borderRadiusMd,
          border: Border.all(color: SocelleTheme.borderLight),
          boxShadow: SocelleTheme.shadowSm,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              flex: 3,
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(SocelleTheme.radiusMd),
                ),
                child: imageUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        placeholder: (_, __) => Container(
                          color: SocelleTheme.warmIvory,
                          child: const Center(
                            child: Icon(Icons.image_outlined,
                                color: SocelleTheme.textFaint),
                          ),
                        ),
                        errorWidget: (_, __, ___) => Container(
                          color: SocelleTheme.warmIvory,
                          child: const Center(
                            child: Icon(Icons.image_outlined,
                                color: SocelleTheme.textFaint),
                          ),
                        ),
                      )
                    : Container(
                        color: SocelleTheme.warmIvory,
                        child: Center(
                          child: Icon(
                            Icons.spa_outlined,
                            size: 32,
                            color: SocelleTheme.accent,
                          ),
                        ),
                      ),
              ),
            ),
            // Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(SocelleTheme.spacingSm),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      brand,
                      style: SocelleTheme.labelSmall.copyWith(
                        color: SocelleTheme.accent,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      name,
                      style: SocelleTheme.titleSmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Spacer(),
                    Text(
                      '\$${price.toStringAsFixed(2)}',
                      style: SocelleTheme.titleSmall.copyWith(
                        color: SocelleTheme.graphite,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
