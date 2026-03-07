import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';
import '../../../core/auth/auth_provider.dart';

/// Order history screen — past orders from Supabase `orders` table.
///
/// DEMO surface until orders table is wired.

final _ordersProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return [];
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  try {
    final response = await SocelleSupabaseClient.client
        .from('orders')
        .select('id, status, total, created_at, items_count')
        .eq('user_id', user.id)
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return [];
  }
});

class OrderHistoryScreen extends ConsumerWidget {
  const OrderHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(_ordersProvider);

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
            const Text('Order History'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: ordersAsync.when(
        data: (orders) {
          if (orders.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.receipt_long_outlined,
                      size: 64, color: SocelleTheme.textFaint),
                  const SizedBox(height: SocelleTheme.spacingMd),
                  Text('No orders yet', style: SocelleTheme.titleMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text(
                    'Your order history will appear here.',
                    style: SocelleTheme.bodyMedium,
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
            itemCount: orders.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: SocelleTheme.spacingMd),
            itemBuilder: (context, index) {
              final order = orders[index];
              return Container(
                padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                decoration: BoxDecoration(
                  color: SocelleTheme.surfaceElevated,
                  borderRadius: SocelleTheme.borderRadiusMd,
                  border: Border.all(color: SocelleTheme.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Order #${(order['id'] as String).substring(0, 8)}',
                          style: SocelleTheme.titleSmall,
                        ),
                        _StatusBadge(status: order['status'] as String? ?? 'pending'),
                      ],
                    ),
                    const SizedBox(height: SocelleTheme.spacingSm),
                    Text(
                      '${order['items_count'] ?? 0} items  |  \$${(order['total'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
                      style: SocelleTheme.bodyMedium,
                    ),
                    Text(
                      order['created_at'] as String? ?? '',
                      style: SocelleTheme.bodySmall,
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading orders...'),
        error: (_, __) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: SocelleTheme.signalDown),
              const SizedBox(height: SocelleTheme.spacingMd),
              Text('Failed to load orders', style: SocelleTheme.bodyLarge),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  Color get _color {
    switch (status) {
      case 'completed':
        return SocelleTheme.signalUp;
      case 'processing':
        return SocelleTheme.signalWarn;
      case 'cancelled':
        return SocelleTheme.signalDown;
      default:
        return SocelleTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.1),
        borderRadius: SocelleTheme.borderRadiusPill,
      ),
      child: Text(
        status.toUpperCase(),
        style: SocelleTheme.labelSmall.copyWith(
          color: _color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
