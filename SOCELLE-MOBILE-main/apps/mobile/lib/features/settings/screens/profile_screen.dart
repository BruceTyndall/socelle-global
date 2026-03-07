import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_provider.dart';
import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Profile / More screen — user info, feature access, settings.
///
/// Serves as the "More" tab in the bottom navigation.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final displayName = user?.userMetadata?['full_name'] as String? ?? 'Professional';
    final email = user?.email ?? '';

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            snap: true,
            backgroundColor: SocelleTheme.mnBg,
            title: Text('More', style: SocelleTheme.headlineSmall),
          ),

          // Profile card
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
              child: Container(
                padding: const EdgeInsets.all(SocelleTheme.spacingLg),
                decoration: BoxDecoration(
                  color: SocelleTheme.surfaceElevated,
                  borderRadius: SocelleTheme.borderRadiusMd,
                  border: Border.all(color: SocelleTheme.borderLight),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: SocelleTheme.accentLight,
                      child: Text(
                        displayName.isNotEmpty ? displayName[0].toUpperCase() : 'P',
                        style: SocelleTheme.headlineMedium.copyWith(color: SocelleTheme.accent),
                      ),
                    ),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(displayName, style: SocelleTheme.titleMedium),
                          Text(email, style: SocelleTheme.bodySmall),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 20),
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: SocelleTheme.spacingLg)),

          // Feature sections
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Tools', style: SocelleTheme.labelMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  _MenuGroup(items: [
                    _MenuItem(icon: Icons.people_outline_rounded, label: 'CRM', onTap: () => context.push('/crm')),
                    _MenuItem(icon: Icons.trending_up_rounded, label: 'Sales', onTap: () => context.push('/sales')),
                    _MenuItem(icon: Icons.campaign_outlined, label: 'Marketing', onTap: () => context.push('/marketing')),
                    _MenuItem(icon: Icons.science_outlined, label: 'Ingredients', onTap: () => context.push('/ingredients')),
                    _MenuItem(icon: Icons.storefront_outlined, label: 'Reseller', onTap: () => context.push('/reseller')),
                  ]),

                  const SizedBox(height: SocelleTheme.spacingLg),

                  Text('Account', style: SocelleTheme.labelMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  _MenuGroup(items: [
                    _MenuItem(icon: Icons.receipt_long_outlined, label: 'Order History', onTap: () => context.push('/shop/orders')),
                    _MenuItem(icon: Icons.favorite_border_rounded, label: 'Wishlist', onTap: () => context.push('/shop/wishlist')),
                    _MenuItem(icon: Icons.workspace_premium_outlined, label: 'Certificates', onTap: () => context.push('/learn/certificates')),
                    _MenuItem(icon: Icons.notifications_outlined, label: 'Notifications', onTap: () => context.push('/settings/notifications')),
                  ]),

                  const SizedBox(height: SocelleTheme.spacingLg),

                  // Sign out
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () async {
                        await ref.read(authNotifierProvider.notifier).signOut();
                        if (context.mounted) context.go('/login');
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: SocelleTheme.signalDown,
                        side: BorderSide(color: SocelleTheme.signalDown.withValues(alpha: 0.3)),
                      ),
                      child: const Text('Sign Out'),
                    ),
                  ),

                  const SizedBox(height: SocelleTheme.spacingMd),

                  Center(
                    child: Text(
                      'SOCELLE v1.0.0',
                      style: SocelleTheme.bodySmall,
                    ),
                  ),

                  const SizedBox(height: SocelleTheme.spacing3xl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuGroup extends StatelessWidget {
  const _MenuGroup({required this.items});
  final List<_MenuItem> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: SocelleTheme.surfaceElevated,
        borderRadius: SocelleTheme.borderRadiusMd,
        border: Border.all(color: SocelleTheme.borderLight),
      ),
      child: Column(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            items[i],
            if (i < items.length - 1)
              const Divider(height: 0, indent: 56),
          ],
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: SocelleTheme.spacingMd,
            vertical: SocelleTheme.spacingMd,
          ),
          child: Row(
            children: [
              Icon(icon, size: 22, color: SocelleTheme.accent),
              const SizedBox(width: SocelleTheme.spacingMd),
              Expanded(child: Text(label, style: SocelleTheme.bodyLarge)),
              Icon(Icons.chevron_right_rounded, size: 20, color: SocelleTheme.textFaint),
            ],
          ),
        ),
      ),
    );
  }
}
