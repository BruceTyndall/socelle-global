import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';

/// Education home screen — training modules and courses.
///
/// Fetches from `brand_training_modules` table (LIVE when wired).

final _coursesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoCourses;
  try {
    final response = await SocelleSupabaseClient.client
        .from('brand_training_modules')
        .select('id, title, brand_name, description, thumbnail_url, duration_minutes, module_count, category')
        .eq('status', 'published')
        .order('created_at', ascending: false)
        .limit(20);
    if (response.isEmpty) return _demoCourses;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoCourses;
  }
});

final _isEducationLiveProvider = Provider<bool>((ref) {
  final courses = ref.watch(_coursesProvider).valueOrNull;
  return courses != null && courses != _demoCourses;
});

const _demoCourses = <Map<String, dynamic>>[
  {'id': 'demo-edu-1', 'title': 'Advanced Chemical Peels', 'brand_name': 'SkinScience Pro', 'description': 'Master the art of chemical peels from superficial to deep. Includes patient selection, contraindications, and post-treatment protocols.', 'thumbnail_url': '', 'duration_minutes': 120, 'module_count': 8, 'category': 'Clinical'},
  {'id': 'demo-edu-2', 'title': 'Ingredient Science: Peptides', 'brand_name': 'DermaElite', 'description': 'Deep dive into peptide science — signal peptides, carrier peptides, and neurotransmitter-inhibiting peptides for professional formulation.', 'thumbnail_url': '', 'duration_minutes': 90, 'module_count': 6, 'category': 'Science'},
  {'id': 'demo-edu-3', 'title': 'Business Growth for Estheticians', 'brand_name': 'SOCELLE Academy', 'description': 'Revenue optimization, client retention strategies, and service menu engineering for modern esthetics practices.', 'thumbnail_url': '', 'duration_minutes': 60, 'module_count': 5, 'category': 'Business'},
  {'id': 'demo-edu-4', 'title': 'LED Light Therapy Protocols', 'brand_name': 'LuminaDerm', 'description': 'Comprehensive training on LED light therapy wavelengths, treatment parameters, and combination protocols.', 'thumbnail_url': '', 'duration_minutes': 75, 'module_count': 4, 'category': 'Devices'},
];

class EducationHomeScreen extends ConsumerWidget {
  const EducationHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync = ref.watch(_coursesProvider);
    final isLive = ref.watch(_isEducationLiveProvider);

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
                Text('Learn', style: SocelleTheme.headlineSmall),
                const SizedBox(width: SocelleTheme.spacingSm),
                if (!isLive) const DemoBadge(compact: true),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.workspace_premium_outlined, size: 22),
                onPressed: () => context.push('/learn/certificates'),
              ),
              const SizedBox(width: 4),
            ],
          ),

          // Featured course
          SliverToBoxAdapter(
            child: coursesAsync.when(
              data: (courses) {
                if (courses.isEmpty) return const SizedBox.shrink();
                final featured = courses.first;
                return _FeaturedCourseCard(course: featured);
              },
              loading: () => const Padding(
                padding: EdgeInsets.all(SocelleTheme.spacingLg),
                child: SocelleLoadingWidget(compact: true),
              ),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),

          // Section header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                SocelleTheme.spacingLg,
                SocelleTheme.spacingLg,
                SocelleTheme.spacingLg,
                SocelleTheme.spacingMd,
              ),
              child: Text('All Courses', style: SocelleTheme.titleMedium),
            ),
          ),

          // Course list
          coursesAsync.when(
            data: (courses) {
              if (courses.isEmpty) {
                return const SliverFillRemaining(
                  child: socelle.SocelleErrorWidget(
                    message: 'No courses available.',
                    icon: Icons.school_outlined,
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
                sliver: SliverList.separated(
                  itemCount: courses.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: SocelleTheme.spacingMd),
                  itemBuilder: (context, index) =>
                      _CourseCard(course: courses[index]),
                ),
              );
            },
            loading: () => const SliverFillRemaining(
              child: SocelleLoadingWidget(message: 'Loading courses...'),
            ),
            error: (e, _) => SliverFillRemaining(
              child: socelle.SocelleErrorWidget(
                message: 'Failed to load courses.',
                onRetry: () => ref.invalidate(_coursesProvider),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: SocelleTheme.spacing3xl)),
        ],
      ),
    );
  }
}

class _FeaturedCourseCard extends StatelessWidget {
  const _FeaturedCourseCard({required this.course});
  final Map<String, dynamic> course;

  @override
  Widget build(BuildContext context) {
    final imageUrl = course['thumbnail_url'] as String? ?? '';
    return GestureDetector(
      onTap: () => context.push('/learn/course/${course['id']}'),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
        decoration: BoxDecoration(
          borderRadius: SocelleTheme.borderRadiusLg,
          boxShadow: SocelleTheme.shadowMd,
        ),
        child: ClipRRect(
          borderRadius: SocelleTheme.borderRadiusLg,
          child: Stack(
            children: [
              AspectRatio(
                aspectRatio: 16 / 9,
                child: imageUrl.isNotEmpty
                    ? CachedNetworkImage(imageUrl: imageUrl, fit: BoxFit.cover)
                    : Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [SocelleTheme.accent, SocelleTheme.mnDark],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Center(
                          child: Icon(Icons.play_circle_outline_rounded,
                              size: 48, color: SocelleTheme.pearlWhite),
                        ),
                      ),
              ),
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        SocelleTheme.graphite.withValues(alpha: 0.9),
                        Colors.transparent,
                      ],
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        course['category'] as String? ?? '',
                        style: SocelleTheme.labelSmall.copyWith(
                          color: SocelleTheme.pearlWhite.withValues(alpha: 0.7),
                        ),
                      ),
                      Text(
                        course['title'] as String? ?? '',
                        style: SocelleTheme.titleLarge.copyWith(
                          color: SocelleTheme.pearlWhite,
                        ),
                      ),
                      Text(
                        course['brand_name'] as String? ?? '',
                        style: SocelleTheme.bodySmall.copyWith(
                          color: SocelleTheme.pearlWhite.withValues(alpha: 0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({required this.course});
  final Map<String, dynamic> course;

  @override
  Widget build(BuildContext context) {
    final duration = course['duration_minutes'] as int? ?? 0;
    final modules = course['module_count'] as int? ?? 0;

    return GestureDetector(
      onTap: () => context.push('/learn/course/${course['id']}'),
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
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: SocelleTheme.accentLight,
                borderRadius: SocelleTheme.borderRadiusSm,
              ),
              child: Icon(Icons.school_outlined, color: SocelleTheme.accent),
            ),
            const SizedBox(width: SocelleTheme.spacingMd),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course['brand_name'] as String? ?? '',
                    style: SocelleTheme.labelSmall.copyWith(
                      color: SocelleTheme.accent,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    course['title'] as String? ?? '',
                    style: SocelleTheme.titleSmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$modules modules  |  ${duration}min',
                    style: SocelleTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: SocelleTheme.textFaint),
          ],
        ),
      ),
    );
  }
}
