import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Cart screen — shows items added to cart.
///
/// DEMO surface: Uses local state for cart items.

final _cartItemsProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartItems = ref.watch(_cartItemsProvider);

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
            const Text('Cart'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: cartItems.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.shopping_bag_outlined,
                    size: 64,
                    color: SocelleTheme.textFaint,
                  ),
                  const SizedBox(height: SocelleTheme.spacingMd),
                  Text('Your cart is empty', style: SocelleTheme.titleMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text(
                    'Browse products and add items to get started.',
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
            )
          : ListView.separated(
              padding: const EdgeInsets.all(SocelleTheme.spacingLg),
              itemCount: cartItems.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: SocelleTheme.spacingMd),
              itemBuilder: (context, index) {
                final item = cartItems[index];
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
                              item['name'] as String? ?? '',
                              style: SocelleTheme.titleSmall,
                            ),
                            Text(
                              '\$${(item['price'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
                              style: SocelleTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          Icons.delete_outline_rounded,
                          color: SocelleTheme.signalDown,
                          size: 20,
                        ),
                        onPressed: () {
                          final updated = [...cartItems];
                          updated.removeAt(index);
                          ref.read(_cartItemsProvider.notifier).state = updated;
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
      bottomNavigationBar: cartItems.isNotEmpty
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total', style: SocelleTheme.titleMedium),
                        Text(
                          '\$${cartItems.fold<double>(0, (sum, item) => sum + ((item['price'] as num?)?.toDouble() ?? 0)).toStringAsFixed(2)}',
                          style: SocelleTheme.headlineSmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: SocelleTheme.spacingMd),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: () => context.push('/shop/checkout'),
                        child: const Text('Checkout'),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }
}
