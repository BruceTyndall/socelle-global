import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';

/// Ingredient search screen — full-text search across ingredient database.

final _ingredientSearchProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String>((ref, query) async {
  if (query.isEmpty) return [];
  if (!SocelleSupabaseClient.isInitialized) {
    // Filter demo data
    return _allIngredients
        .where((i) => (i['name'] as String).toLowerCase().contains(query.toLowerCase()))
        .toList();
  }
  try {
    final response = await SocelleSupabaseClient.client
        .from('ingredients')
        .select('id, name, category, description')
        .ilike('name', '%$query%')
        .limit(20);
    if (response.isEmpty) {
      return _allIngredients
          .where((i) => (i['name'] as String).toLowerCase().contains(query.toLowerCase()))
          .toList();
    }
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return [];
  }
});

const _allIngredients = <Map<String, dynamic>>[
  {'id': 'i1', 'name': 'Niacinamide', 'category': 'Vitamins', 'description': 'Vitamin B3'},
  {'id': 'i2', 'name': 'Copper Peptides', 'category': 'Peptides', 'description': 'GHK-Cu complex'},
  {'id': 'i3', 'name': 'Retinal', 'category': 'Retinoids', 'description': 'Retinaldehyde'},
  {'id': 'i4', 'name': 'Tranexamic Acid', 'category': 'Acids', 'description': 'Pigmentation treatment'},
  {'id': 'i5', 'name': 'Bakuchiol', 'category': 'Botanicals', 'description': 'Retinol alternative'},
  {'id': 'i6', 'name': 'Polyglutamic Acid', 'category': 'Humectants', 'description': 'Moisture retention'},
  {'id': 'i7', 'name': 'Hyaluronic Acid', 'category': 'Humectants', 'description': 'Hydration'},
  {'id': 'i8', 'name': 'Salicylic Acid', 'category': 'Acids', 'description': 'BHA exfoliant'},
  {'id': 'i9', 'name': 'Glycolic Acid', 'category': 'Acids', 'description': 'AHA exfoliant'},
  {'id': 'i10', 'name': 'Vitamin C', 'category': 'Vitamins', 'description': 'L-Ascorbic Acid'},
];

class IngredientSearchScreen extends ConsumerStatefulWidget {
  const IngredientSearchScreen({super.key});

  @override
  ConsumerState<IngredientSearchScreen> createState() => _IngredientSearchScreenState();
}

class _IngredientSearchScreenState extends ConsumerState<IngredientSearchScreen> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final resultsAsync = ref.watch(_ingredientSearchProvider(_query));

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        title: const Text('Search Ingredients'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(SocelleTheme.spacingMd),
            child: TextField(
              controller: _searchController,
              autofocus: true,
              onChanged: (v) => setState(() => _query = v.trim()),
              decoration: InputDecoration(
                hintText: 'Search by ingredient name...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _query.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _query = '');
                        },
                      )
                    : null,
              ),
            ),
          ),

          if (_query.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.science_outlined, size: 48, color: SocelleTheme.textFaint),
                    const SizedBox(height: SocelleTheme.spacingMd),
                    Text('Search our ingredient database', style: SocelleTheme.bodyMedium),
                    const SizedBox(height: SocelleTheme.spacingSm),
                    const DemoBadge(),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: resultsAsync.when(
                data: (results) {
                  if (results.isEmpty) {
                    return Center(
                      child: Text('No ingredients found for "$_query"', style: SocelleTheme.bodyMedium),
                    );
                  }
                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingMd),
                    itemCount: results.length,
                    separatorBuilder: (_, __) => const SizedBox(height: SocelleTheme.spacingSm),
                    itemBuilder: (context, index) {
                      final ingredient = results[index];
                      return ListTile(
                        onTap: () => context.push('/ingredients/${ingredient['id']}'),
                        leading: CircleAvatar(
                          radius: 20,
                          backgroundColor: SocelleTheme.accentLight,
                          child: Icon(Icons.science_outlined, size: 18, color: SocelleTheme.accent),
                        ),
                        title: Text(ingredient['name'] as String? ?? '', style: SocelleTheme.titleSmall),
                        subtitle: Text(ingredient['description'] as String? ?? '', style: SocelleTheme.bodySmall),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: SocelleTheme.warmIvory,
                            borderRadius: SocelleTheme.borderRadiusPill,
                          ),
                          child: Text(ingredient['category'] as String? ?? '', style: SocelleTheme.labelSmall),
                        ),
                        shape: RoundedRectangleBorder(borderRadius: SocelleTheme.borderRadiusMd),
                        tileColor: SocelleTheme.surfaceElevated,
                      );
                    },
                  );
                },
                loading: () => const SocelleLoadingWidget(compact: true),
                error: (_, __) => Center(child: Text('Search failed.', style: SocelleTheme.bodyMedium)),
              ),
            ),
        ],
      ),
    );
  }
}
