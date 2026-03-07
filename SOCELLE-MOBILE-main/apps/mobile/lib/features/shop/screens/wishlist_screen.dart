import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';
import '../../../core/auth/auth_provider.dart';

/// Wishlist screen — saved/favorited products.
///
/// DEMO surface until wishlist table is wired.

final _wishlistProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return [];
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  try {
    final response = await SocelleSupabaseClient.client
        .from('wishlists')
        .select('id, product:products(id, name, brand_name, price, image_url)')
        .eq('user_id', user.id)
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return [];
  }
});

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wishlistAsync = ref.watch(_wishlistProvider);

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Wishlist'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: wishlistAsync.when(
        data: (items) {
          if (items.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.favorite_border_rounded,
                      size: 64, color: SocelleTheme.textFaint),
                  const SizedBox(height: SocelleTheme.spacingMd),
                  Text('No saved items', style: SocelleTheme.titleMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text(
                    'Tap the heart icon on products to save them here.',
                    style: SocelleTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: SocelleTheme.spacingLg),
                  OutlinedButton(
                    onPressed: () => context.go('/shop'),
                    child: const Text('Browse Products'),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(SocelleTheme.spacingLg),
            itemCount: items.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: SocelleTheme.spacingMd),
            itemBuilder: (context, index) {
              final item = items[index];
              final product = item['product'] as Map<String, dynamic>? ?? {};
              return Container(
                padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                decoration: BoxDecoration(
                  color: SocelleTheme.surfaceElevated,
                  borderRadius: SocelleTheme.borderRadiusMd,
                  border: Border.all(color: SocelleTheme.borderLight),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: SocelleTheme.warmIvory,
                        borderRadius: SocelleTheme.borderRadiusSm,
                      ),
                      child: Icon(Icons.spa_outlined, color: SocelleTheme.accent),
                    ),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            product['brand_name'] as String? ?? '',
                            style: SocelleTheme.labelSmall.copyWith(
                              color: SocelleTheme.accent,
                            ),
                          ),
                          Text(
                            product['name'] as String? ?? '',
                            style: SocelleTheme.titleSmall,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '\$${(product['price'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
                            style: SocelleTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.favorite_rounded,
                          color: SocelleTheme.signalDown, size: 22),
                      onPressed: () {},
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading wishlist...'),
        error: (_, __) => Center(
          child: Text('Failed to load wishlist', style: SocelleTheme.bodyLarge),
        ),
      ),
    );
  }
}
