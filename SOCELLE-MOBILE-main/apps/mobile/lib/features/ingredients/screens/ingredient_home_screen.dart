import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';

/// Ingredient intelligence home — trending ingredients, search, and education.
///
/// Fetches from `ingredients` table when available, otherwise DEMO.

final _trendingIngredientsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoIngredients;
  try {
    final response = await SocelleSupabaseClient.client
        .from('ingredients')
        .select('id, name, category, trend_score, description')
        .order('trend_score', ascending: false)
        .limit(10);
    if (response.isEmpty) return _demoIngredients;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoIngredients;
  }
});

const _demoIngredients = <Map<String, dynamic>>[
  {'id': 'i1', 'name': 'Niacinamide', 'category': 'Vitamins', 'trend_score': 95, 'description': 'Vitamin B3 — brightening, pore-minimizing, barrier-strengthening'},
  {'id': 'i2', 'name': 'Copper Peptides', 'category': 'Peptides', 'trend_score': 92, 'description': 'GHK-Cu — collagen synthesis, wound healing, anti-inflammatory'},
  {'id': 'i3', 'name': 'Retinal', 'category': 'Retinoids', 'trend_score': 89, 'description': 'Retinaldehyde — next-gen retinoid with reduced irritation profile'},
  {'id': 'i4', 'name': 'Tranexamic Acid', 'category': 'Acids', 'trend_score': 87, 'description': 'Hyperpigmentation treatment — melanogenesis inhibitor'},
  {'id': 'i5', 'name': 'Bakuchiol', 'category': 'Botanicals', 'trend_score': 84, 'description': 'Plant-derived retinol alternative — anti-aging, pregnancy-safe'},
  {'id': 'i6', 'name': 'Polyglutamic Acid', 'category': 'Humectants', 'trend_score': 81, 'description': 'Superior moisture retention — 4x hyaluronic acid water-binding'},
];

class IngredientHomeScreen extends ConsumerWidget {
  const IngredientHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ingredientsAsync = ref.watch(_trendingIngredientsProvider);

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
            const Text('Ingredients'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, size: 22),
            onPressed: () => context.push('/ingredients/search'),
          ),
        ],
      ),
      body: ingredientsAsync.when(
        data: (ingredients) {
          return ListView(
            padding: const EdgeInsets.all(SocelleTheme.spacingLg),
            children: [
              Text('Trending Ingredients', style: SocelleTheme.titleMedium),
              const SizedBox(height: SocelleTheme.spacingMd),
              ...ingredients.asMap().entries.map((entry) {
                final index = entry.key;
                final ingredient = entry.value;
                final trendScore = ingredient['trend_score'] as int? ?? 0;

                return Padding(
                  padding: const EdgeInsets.only(bottom: SocelleTheme.spacingMd),
                  child: GestureDetector(
                    onTap: () => context.push('/ingredients/${ingredient['id']}'),
                    child: Container(
                      padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                      decoration: BoxDecoration(
                        color: SocelleTheme.surfaceElevated,
                        borderRadius: SocelleTheme.borderRadiusMd,
                        border: Border.all(color: SocelleTheme.borderLight),
                        boxShadow: SocelleTheme.shadowSm,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: SocelleTheme.accentLight,
                              borderRadius: SocelleTheme.borderRadiusSm,
                            ),
                            child: Center(
                              child: Text(
                                '${index + 1}',
                                style: SocelleTheme.titleSmall.copyWith(color: SocelleTheme.accent),
                              ),
                            ),
                          ),
                          const SizedBox(width: SocelleTheme.spacingMd),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(ingredient['name'] as String? ?? '', style: SocelleTheme.titleSmall),
                                    const SizedBox(width: SocelleTheme.spacingSm),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: SocelleTheme.warmIvory,
                                        borderRadius: SocelleTheme.borderRadiusPill,
                                      ),
                                      child: Text(
                                        ingredient['category'] as String? ?? '',
                                        style: SocelleTheme.labelSmall.copyWith(fontSize: 9),
                                      ),
                                    ),
                                  ],
                                ),
                                Text(
                                  ingredient['description'] as String? ?? '',
                                  style: SocelleTheme.bodySmall,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          Column(
                            children: [
                              Text('$trendScore', style: SocelleTheme.titleMedium.copyWith(color: SocelleTheme.signalUp)),
                              Text('score', style: SocelleTheme.labelSmall),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading ingredients...'),
        error: (_, __) => Center(child: Text('Failed to load ingredients.', style: SocelleTheme.bodyLarge)),
      ),
    );
  }
}
