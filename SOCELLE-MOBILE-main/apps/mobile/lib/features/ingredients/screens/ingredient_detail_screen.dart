import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';

/// Ingredient detail screen — full ingredient profile.

final _ingredientDetailProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  if (!SocelleSupabaseClient.isInitialized || id.startsWith('i')) {
    return {
      'id': id,
      'name': 'Niacinamide',
      'inci_name': 'Niacinamide',
      'category': 'Vitamins',
      'description': 'Vitamin B3 (niacinamide) is a water-soluble vitamin that works with the natural substances in your skin to help visibly minimize enlarged pores, tighten lax pores, improve uneven skin tone, soften fine lines and wrinkles, diminish dullness, and strengthen a weakened surface.',
      'benefits': ['Brightening', 'Pore minimizing', 'Barrier strengthening', 'Anti-inflammatory', 'Sebum regulation'],
      'common_concentrations': '2-10%',
      'compatibility': 'Compatible with most actives. Historically debated with Vitamin C but modern research shows safe co-use.',
      'safety_rating': 'EWG 1 — Low hazard',
      'is_demo': true,
    };
  }
  try {
    return await SocelleSupabaseClient.client.from('ingredients').select().eq('id', id).single();
  } catch (_) {
    return {'name': 'Unknown', 'description': 'Ingredient not found.'};
  }
});

class IngredientDetailScreen extends ConsumerWidget {
  const IngredientDetailScreen({super.key, required this.ingredientId});
  final String ingredientId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(_ingredientDetailProvider(ingredientId));

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: detailAsync.when(
        data: (ingredient) {
          final benefits = ingredient['benefits'] as List<dynamic>? ?? [];
          final isDemo = ingredient['is_demo'] == true;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(SocelleTheme.spacingLg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (isDemo) ...[
                  const DemoBadge(),
                  const SizedBox(height: SocelleTheme.spacingMd),
                ],

                // Header
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(SocelleTheme.spacingLg),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [SocelleTheme.accent.withValues(alpha: 0.15), SocelleTheme.warmIvory],
                    ),
                    borderRadius: SocelleTheme.borderRadiusLg,
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.science_rounded, size: 48, color: SocelleTheme.accent),
                      const SizedBox(height: SocelleTheme.spacingMd),
                      Text(ingredient['name'] as String? ?? '', style: SocelleTheme.headlineLarge, textAlign: TextAlign.center),
                      if (ingredient['inci_name'] != null) ...[
                        const SizedBox(height: SocelleTheme.spacingXs),
                        Text('INCI: ${ingredient['inci_name']}', style: SocelleTheme.bodySmall),
                      ],
                      const SizedBox(height: SocelleTheme.spacingSm),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: SocelleTheme.accentLight,
                          borderRadius: SocelleTheme.borderRadiusPill,
                        ),
                        child: Text(
                          ingredient['category'] as String? ?? '',
                          style: SocelleTheme.labelMedium.copyWith(color: SocelleTheme.accent),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: SocelleTheme.spacingLg),

                Text('Description', style: SocelleTheme.titleMedium),
                const SizedBox(height: SocelleTheme.spacingSm),
                Text(ingredient['description'] as String? ?? '', style: SocelleTheme.bodyLarge),

                if (benefits.isNotEmpty) ...[
                  const SizedBox(height: SocelleTheme.spacingLg),
                  Text('Benefits', style: SocelleTheme.titleMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Wrap(
                    spacing: SocelleTheme.spacingSm,
                    runSpacing: SocelleTheme.spacingSm,
                    children: benefits.map((b) => Chip(
                      label: Text(b as String),
                      avatar: Icon(Icons.check_circle_outline, size: 16, color: SocelleTheme.signalUp),
                    )).toList(),
                  ),
                ],

                if (ingredient['common_concentrations'] != null) ...[
                  const SizedBox(height: SocelleTheme.spacingLg),
                  _InfoSection(title: 'Typical Concentrations', content: ingredient['common_concentrations'] as String),
                ],

                if (ingredient['compatibility'] != null) ...[
                  const SizedBox(height: SocelleTheme.spacingLg),
                  _InfoSection(title: 'Compatibility', content: ingredient['compatibility'] as String),
                ],

                if (ingredient['safety_rating'] != null) ...[
                  const SizedBox(height: SocelleTheme.spacingLg),
                  _InfoSection(title: 'Safety Rating', content: ingredient['safety_rating'] as String),
                ],
              ],
            ),
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading ingredient...'),
        error: (_, __) => Center(child: Text('Failed to load ingredient.', style: SocelleTheme.bodyLarge)),
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  const _InfoSection({required this.title, required this.content});
  final String title;
  final String content;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: SocelleTheme.titleMedium),
        const SizedBox(height: SocelleTheme.spacingSm),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(SocelleTheme.spacingMd),
          decoration: BoxDecoration(
            color: SocelleTheme.warmIvory,
            borderRadius: SocelleTheme.borderRadiusMd,
          ),
          child: Text(content, style: SocelleTheme.bodyLarge),
        ),
      ],
    );
  }
}
