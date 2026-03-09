// ── Brands Hub Screen — Build 5 Mobile Parity ────────────────────────────
// Reads from `brands` table (same Supabase API contract as web /brands).
// LIVE when Supabase is connected; DEMO labeled when not.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';

final _brandsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoBrands;
  try {
    final response = await SocelleSupabaseClient.client
        .from('brands')
        .select('id, name, slug, description, logo_url, category, is_verified')
        .eq('status', 'active')
        .order('name', ascending: true)
        .limit(40);
    if (response.isEmpty) return _demoBrands;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoBrands;
  }
});

final _isBrandsLiveProvider = Provider.autoDispose<bool>((ref) {
  final brands = ref.watch(_brandsProvider).valueOrNull;
  return brands != null && brands != _demoBrands;
});

const _demoBrands = <Map<String, dynamic>>[
  {'id': 'demo-b1', 'name': 'SkinScience Pro', 'category': 'Clinical', 'description': 'Evidence-based skincare formulated for professional use.', 'logo_url': '', 'is_verified': true},
  {'id': 'demo-b2', 'name': 'DermaElite', 'category': 'Cosmeceutical', 'description': 'Advanced cosmeceutical actives trusted by dermatologists.', 'logo_url': '', 'is_verified': true},
  {'id': 'demo-b3', 'name': 'LuminaDerm', 'category': 'Devices', 'description': 'LED and light therapy devices for clinical settings.', 'logo_url': '', 'is_verified': false},
  {'id': 'demo-b4', 'name': 'PureSense Botanicals', 'category': 'Organic', 'description': 'Certified organic formulations for sensitive skin protocols.', 'logo_url': '', 'is_verified': false},
  {'id': 'demo-b5', 'name': 'ProCollagen Labs', 'category': 'Anti-Aging', 'description': 'Peptide-forward anti-aging lines backed by clinical data.', 'logo_url': '', 'is_verified': true},
];

class BrandsHubScreen extends ConsumerWidget {
  const BrandsHubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brandsAsync = ref.watch(_brandsProvider);
    final isLive = ref.watch(_isBrandsLiveProvider);

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
                Text('Brands', style: SocelleTheme.headlineSmall),
                const SizedBox(width: 8),
                if (!isLive) const DemoBadge(compact: true),
              ],
            ),
          ),
          brandsAsync.when(
            data: (brands) {
              if (brands.isEmpty) {
                return SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_outlined, size: 48, color: SocelleTheme.accent.withValues(alpha: 0.4)),
                        const SizedBox(height: 16),
                        Text('No brands yet', style: SocelleTheme.titleMedium.copyWith(color: SocelleTheme.textMuted)),
                        const SizedBox(height: 8),
                        Text('Brands will appear here once listed.', style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textFaint)),
                      ],
                    ),
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverGrid(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) => _BrandCard(brand: brands[i]),
                    childCount: brands.length,
                  ),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.85,
                  ),
                ),
              );
            },
            loading: () => SliverFillRemaining(
              child: Center(child: LoadingWidget(label: 'Loading brands...')),
            ),
            error: (e, _) => SliverFillRemaining(
              child: socelle.SocelleErrorWidget(
                message: 'Could not load brands.',
                onRetry: () => ref.invalidate(_brandsProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BrandCard extends StatelessWidget {
  const _BrandCard({required this.brand});
  final Map<String, dynamic> brand;

  @override
  Widget build(BuildContext context) {
    final name = brand['name'] as String? ?? '';
    final category = brand['category'] as String? ?? '';
    final description = brand['description'] as String? ?? '';
    final isVerified = brand['is_verified'] as bool? ?? false;

    return GestureDetector(
      onTap: () {
        final id = brand['id'] as String?;
        if (id != null) context.push('/brands/$id');
      },
      child: Container(
        decoration: BoxDecoration(
          color: SocelleTheme.surfaceElevated,
          borderRadius: SocelleTheme.borderRadiusMd,
          border: Border.all(color: SocelleTheme.borderLight),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: SocelleTheme.accentLight,
                    borderRadius: SocelleTheme.borderRadiusSm,
                  ),
                  child: Icon(Icons.verified_outlined, color: SocelleTheme.accent, size: 20),
                ),
                const Spacer(),
                if (isVerified)
                  Icon(Icons.verified, color: SocelleTheme.accent, size: 16),
              ],
            ),
            const SizedBox(height: 12),
            Text(name, style: SocelleTheme.titleSmall, maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: SocelleTheme.accentLight,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(category, style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.accent)),
            ),
            const SizedBox(height: 8),
            Text(description, style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textMuted), maxLines: 3, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}
