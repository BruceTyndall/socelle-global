import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';

/// Course detail screen — overview, modules, and launch player.

final _courseDetailProvider =
    FutureProvider.family<Map<String, dynamic>?, String>((ref, courseId) async {
  if (!SocelleSupabaseClient.isInitialized || courseId.startsWith('demo-')) {
    return {
      'id': courseId,
      'title': 'Advanced Chemical Peels',
      'brand_name': 'SkinScience Pro',
      'description': 'Master the art of chemical peels from superficial to deep. Includes patient selection, contraindications, and post-treatment protocols. This comprehensive course covers AHA, BHA, TCA, and phenol peels with hands-on case studies.',
      'duration_minutes': 120,
      'module_count': 8,
      'category': 'Clinical',
      'objectives': [
        'Understand peel chemistry and pH relationships',
        'Select appropriate peel depth for each skin condition',
        'Manage contraindications and adverse reactions',
        'Design post-treatment care protocols',
      ],
      'is_demo': true,
    };
  }
  try {
    final response = await SocelleSupabaseClient.client
        .from('brand_training_modules')
        .select()
        .eq('id', courseId)
        .single();
    return response;
  } catch (_) {
    return null;
  }
});

class CourseDetailScreen extends ConsumerWidget {
  const CourseDetailScreen({super.key, required this.courseId});
  final String courseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courseAsync = ref.watch(_courseDetailProvider(courseId));

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: courseAsync.when(
        data: (course) {
          if (course == null) {
            return const socelle.SocelleErrorWidget(message: 'Course not found.');
          }
          final isDemo = course['is_demo'] == true;
          final objectives = course['objectives'] as List<dynamic>? ?? [];

          return SingleChildScrollView(
            padding: const EdgeInsets.all(SocelleTheme.spacingLg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (isDemo) ...[
                  const DemoBadge(),
                  const SizedBox(height: SocelleTheme.spacingMd),
                ],

                // Hero
                Container(
                  width: double.infinity,
                  height: 180,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [SocelleTheme.accent, SocelleTheme.mnDark],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: SocelleTheme.borderRadiusLg,
                  ),
                  child: Center(
                    child: Icon(Icons.play_circle_outline_rounded,
                        size: 56, color: SocelleTheme.pearlWhite),
                  ),
                ),

                const SizedBox(height: SocelleTheme.spacingLg),

                Text(
                  course['brand_name'] as String? ?? '',
                  style: SocelleTheme.labelMedium.copyWith(
                    color: SocelleTheme.accent,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: SocelleTheme.spacingXs),
                Text(course['title'] as String? ?? '', style: SocelleTheme.headlineMedium),

                const SizedBox(height: SocelleTheme.spacingMd),

                // Meta
                Row(
                  children: [
                    _MetaChip(
                      icon: Icons.timer_outlined,
                      label: '${course['duration_minutes'] ?? 0} min',
                    ),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    _MetaChip(
                      icon: Icons.layers_outlined,
                      label: '${course['module_count'] ?? 0} modules',
                    ),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    _MetaChip(
                      icon: Icons.category_outlined,
                      label: course['category'] as String? ?? '',
                    ),
                  ],
                ),

                const SizedBox(height: SocelleTheme.spacingLg),
                const Divider(),
                const SizedBox(height: SocelleTheme.spacingLg),

                Text('About This Course', style: SocelleTheme.titleMedium),
                const SizedBox(height: SocelleTheme.spacingSm),
                Text(course['description'] as String? ?? '', style: SocelleTheme.bodyLarge),

                if (objectives.isNotEmpty) ...[
                  const SizedBox(height: SocelleTheme.spacingLg),
                  Text('Learning Objectives', style: SocelleTheme.titleMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  ...objectives.map((obj) => Padding(
                        padding: const EdgeInsets.only(bottom: SocelleTheme.spacingSm),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.check_circle_outline_rounded,
                                size: 18, color: SocelleTheme.signalUp),
                            const SizedBox(width: SocelleTheme.spacingSm),
                            Expanded(
                              child: Text(obj as String, style: SocelleTheme.bodyLarge),
                            ),
                          ],
                        ),
                      )),
                ],

                const SizedBox(height: SocelleTheme.spacingXl),
              ],
            ),
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading course...'),
        error: (e, _) => socelle.SocelleErrorWidget(
          message: 'Failed to load course.',
          onRetry: () => ref.invalidate(_courseDetailProvider(courseId)),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(SocelleTheme.spacingMd),
          child: FilledButton.icon(
            onPressed: () => context.push('/learn/player/$courseId'),
            icon: const Icon(Icons.play_arrow_rounded),
            label: const Text('Start Course'),
          ),
        ),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: SocelleTheme.warmIvory,
        borderRadius: SocelleTheme.borderRadiusPill,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: SocelleTheme.textMuted),
          const SizedBox(width: 4),
          Text(label, style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.textMuted)),
        ],
      ),
    );
  }
}
