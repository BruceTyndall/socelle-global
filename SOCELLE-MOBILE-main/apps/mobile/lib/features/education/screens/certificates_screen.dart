import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';
import '../../../core/auth/auth_provider.dart';

/// Certificates screen — earned training certificates.
///
/// DEMO surface until certificates table is wired.

final _certificatesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return [];
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  try {
    final response = await SocelleSupabaseClient.client
        .from('certificates')
        .select('id, course_title, brand_name, earned_at, certificate_url')
        .eq('user_id', user.id)
        .order('earned_at', ascending: false);
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return [];
  }
});

class CertificatesScreen extends ConsumerWidget {
  const CertificatesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final certsAsync = ref.watch(_certificatesProvider);

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
            const Text('Certificates'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: certsAsync.when(
        data: (certs) {
          if (certs.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.workspace_premium_outlined,
                      size: 64, color: SocelleTheme.textFaint),
                  const SizedBox(height: SocelleTheme.spacingMd),
                  Text('No certificates yet', style: SocelleTheme.titleMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text(
                    'Complete courses to earn certificates.',
                    style: SocelleTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: SocelleTheme.spacingLg),
                  OutlinedButton(
                    onPressed: () => context.go('/learn'),
                    child: const Text('Browse Courses'),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(SocelleTheme.spacingLg),
            itemCount: certs.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: SocelleTheme.spacingMd),
            itemBuilder: (context, index) {
              final cert = certs[index];
              return Container(
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
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: SocelleTheme.signalUp.withValues(alpha: 0.1),
                        borderRadius: SocelleTheme.borderRadiusSm,
                      ),
                      child: Icon(Icons.workspace_premium_rounded,
                          color: SocelleTheme.signalUp),
                    ),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            cert['course_title'] as String? ?? '',
                            style: SocelleTheme.titleSmall,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            cert['brand_name'] as String? ?? '',
                            style: SocelleTheme.bodySmall,
                          ),
                          Text(
                            cert['earned_at'] as String? ?? '',
                            style: SocelleTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.share_outlined,
                          size: 20, color: SocelleTheme.accent),
                      onPressed: () {
                        Share.share('I earned my ${cert['course_title']} certificate on SOCELLE!');
                      },
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading certificates...'),
        error: (_, __) => Center(
          child: Text('Failed to load certificates.', style: SocelleTheme.bodyLarge),
        ),
      ),
    );
  }
}
