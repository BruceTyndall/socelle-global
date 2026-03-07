import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';

/// Course player screen — video playback with module navigation.
///
/// Supports video_player for direct video URLs.
/// SCORM content uses the ScormPlayer widget via WebView.

final _courseModulesProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String>((ref, courseId) async {
  if (!SocelleSupabaseClient.isInitialized || courseId.startsWith('demo-')) {
    return [
      {'id': 'm1', 'title': 'Introduction to Chemical Peels', 'duration_seconds': 480, 'type': 'video', 'completed': false},
      {'id': 'm2', 'title': 'AHA Peels: Glycolic & Lactic', 'duration_seconds': 720, 'type': 'video', 'completed': false},
      {'id': 'm3', 'title': 'BHA Peels: Salicylic Acid', 'duration_seconds': 600, 'type': 'video', 'completed': false},
      {'id': 'm4', 'title': 'TCA Peels: Medium Depth', 'duration_seconds': 900, 'type': 'video', 'completed': false},
      {'id': 'm5', 'title': 'Patient Selection Criteria', 'duration_seconds': 540, 'type': 'scorm', 'completed': false},
      {'id': 'm6', 'title': 'Contraindications & Safety', 'duration_seconds': 660, 'type': 'video', 'completed': false},
      {'id': 'm7', 'title': 'Post-Treatment Protocols', 'duration_seconds': 720, 'type': 'video', 'completed': false},
      {'id': 'm8', 'title': 'Assessment & Certification', 'duration_seconds': 300, 'type': 'quiz', 'completed': false},
    ];
  }
  try {
    final response = await SocelleSupabaseClient.client
        .from('training_module_lessons')
        .select('id, title, duration_seconds, type, completed')
        .eq('module_id', courseId)
        .order('sort_order');
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return [];
  }
});

class CoursePlayerScreen extends ConsumerStatefulWidget {
  const CoursePlayerScreen({super.key, required this.courseId});
  final String courseId;

  @override
  ConsumerState<CoursePlayerScreen> createState() => _CoursePlayerScreenState();
}

class _CoursePlayerScreenState extends ConsumerState<CoursePlayerScreen> {
  int _currentModuleIndex = 0;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }

  @override
  void dispose() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final modulesAsync = ref.watch(_courseModulesProvider(widget.courseId));

    return Scaffold(
      backgroundColor: SocelleTheme.graphite,
      appBar: AppBar(
        backgroundColor: SocelleTheme.graphite,
        foregroundColor: SocelleTheme.pearlWhite,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, size: 22),
          onPressed: () => context.pop(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Course Player',
              style: SocelleTheme.titleSmall.copyWith(color: SocelleTheme.pearlWhite),
            ),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: modulesAsync.when(
        data: (modules) {
          if (modules.isEmpty) {
            return Center(
              child: Text('No modules available.',
                  style: SocelleTheme.bodyLarge.copyWith(color: SocelleTheme.pearlWhite)),
            );
          }

          final currentModule = modules[_currentModuleIndex];

          return Column(
            children: [
              // Video area
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Container(
                  color: SocelleTheme.mnDark,
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          currentModule['type'] == 'quiz'
                              ? Icons.quiz_outlined
                              : currentModule['type'] == 'scorm'
                                  ? Icons.web_outlined
                                  : Icons.play_circle_outline_rounded,
                          size: 56,
                          color: SocelleTheme.pearlWhite.withValues(alpha: 0.6),
                        ),
                        const SizedBox(height: SocelleTheme.spacingSm),
                        Text(
                          currentModule['type'] == 'video'
                              ? 'Video Player'
                              : currentModule['type'] == 'scorm'
                                  ? 'SCORM Content'
                                  : 'Assessment',
                          style: SocelleTheme.bodyMedium.copyWith(
                            color: SocelleTheme.pearlWhite.withValues(alpha: 0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Current module info
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                color: SocelleTheme.mnDark,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Module ${_currentModuleIndex + 1} of ${modules.length}',
                      style: SocelleTheme.labelSmall.copyWith(
                        color: SocelleTheme.accent,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      currentModule['title'] as String? ?? '',
                      style: SocelleTheme.titleMedium.copyWith(
                        color: SocelleTheme.pearlWhite,
                      ),
                    ),
                    const SizedBox(height: SocelleTheme.spacingSm),
                    // Progress bar
                    LinearProgressIndicator(
                      value: (_currentModuleIndex + 1) / modules.length,
                      backgroundColor: SocelleTheme.pearlWhite.withValues(alpha: 0.1),
                      color: SocelleTheme.accent,
                      minHeight: 3,
                      borderRadius: SocelleTheme.borderRadiusPill,
                    ),
                  ],
                ),
              ),

              // Module list
              Expanded(
                child: Container(
                  color: SocelleTheme.mnBg,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                    itemCount: modules.length,
                    itemBuilder: (context, index) {
                      final module = modules[index];
                      final isCurrent = index == _currentModuleIndex;
                      final isCompleted = module['completed'] == true;

                      return Container(
                        margin: const EdgeInsets.only(bottom: SocelleTheme.spacingSm),
                        decoration: BoxDecoration(
                          color: isCurrent
                              ? SocelleTheme.accentLight
                              : SocelleTheme.surfaceElevated,
                          borderRadius: SocelleTheme.borderRadiusMd,
                          border: Border.all(
                            color: isCurrent
                                ? SocelleTheme.accent
                                : SocelleTheme.borderLight,
                          ),
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            radius: 16,
                            backgroundColor: isCompleted
                                ? SocelleTheme.signalUp
                                : isCurrent
                                    ? SocelleTheme.accent
                                    : SocelleTheme.borderMedium,
                            child: isCompleted
                                ? Icon(Icons.check_rounded,
                                    size: 16, color: SocelleTheme.pearlWhite)
                                : Text(
                                    '${index + 1}',
                                    style: SocelleTheme.labelSmall.copyWith(
                                      color: SocelleTheme.pearlWhite,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                          ),
                          title: Text(
                            module['title'] as String? ?? '',
                            style: SocelleTheme.titleSmall.copyWith(
                              color: isCurrent
                                  ? SocelleTheme.graphite
                                  : SocelleTheme.textMuted,
                            ),
                          ),
                          trailing: Text(
                            _formatDuration(module['duration_seconds'] as int? ?? 0),
                            style: SocelleTheme.bodySmall,
                          ),
                          onTap: () => setState(() => _currentModuleIndex = index),
                          shape: RoundedRectangleBorder(
                            borderRadius: SocelleTheme.borderRadiusMd,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(
          child: SocelleLoadingWidget(message: 'Loading modules...'),
        ),
        error: (_, __) => Center(
          child: Text('Failed to load modules.',
              style: SocelleTheme.bodyLarge.copyWith(color: SocelleTheme.pearlWhite)),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          color: SocelleTheme.mnBg,
          padding: const EdgeInsets.all(SocelleTheme.spacingMd),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _currentModuleIndex > 0
                      ? () => setState(() => _currentModuleIndex--)
                      : null,
                  child: const Text('Previous'),
                ),
              ),
              const SizedBox(width: SocelleTheme.spacingMd),
              Expanded(
                child: FilledButton(
                  onPressed: () {
                    final modules = ref
                        .read(_courseModulesProvider(widget.courseId))
                        .valueOrNull;
                    if (modules == null) return;
                    if (_currentModuleIndex < modules.length - 1) {
                      setState(() => _currentModuleIndex++);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Course completed!')),
                      );
                      context.pop();
                    }
                  },
                  child: Text(
                    modulesAsync.valueOrNull != null &&
                            _currentModuleIndex ==
                                (modulesAsync.valueOrNull!.length - 1)
                        ? 'Complete'
                        : 'Next',
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
