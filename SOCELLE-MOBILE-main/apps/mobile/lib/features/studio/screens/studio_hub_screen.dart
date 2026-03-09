// ── Studio Hub Screen — Build 5 Mobile Parity ────────────────────────────
// Reads from `cms_docs` table (same Supabase API contract as web Studio).
// Mobile is read-only — authoring happens on web. LIVE when wired.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';
import '../../../core/auth/auth_provider.dart';

final _studioDocsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoDocs;
  try {
    final userId = SocelleSupabaseClient.client.auth.currentUser?.id;
    if (userId == null) return _demoDocs;

    final response = await SocelleSupabaseClient.client
        .from('cms_docs')
        .select('id, title, slug, status, category, updated_at, metadata')
        .eq('created_by', userId)
        .order('updated_at', ascending: false)
        .limit(30);
    if (response.isEmpty) return _demoDocs;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoDocs;
  }
});

final _isStudioLiveProvider = Provider.autoDispose<bool>((ref) {
  final docs = ref.watch(_studioDocsProvider).valueOrNull;
  return docs != null && docs != _demoDocs;
});

final _relativeDateFormatter = DateFormat('MMM d');

const _demoDocs = <Map<String, dynamic>>[
  {'id': 'demo-s1', 'title': 'Summer Glow Campaign', 'status': 'published', 'category': 'campaign', 'updated_at': '2026-03-08T14:00:00Z'},
  {'id': 'demo-s2', 'title': 'Peptide Protocol SOP', 'status': 'draft', 'category': 'document', 'updated_at': '2026-03-07T10:30:00Z'},
  {'id': 'demo-s3', 'title': 'Staff Training: LED Therapy', 'status': 'published', 'category': 'training', 'updated_at': '2026-03-05T09:00:00Z'},
  {'id': 'demo-s4', 'title': 'Q2 Service Menu Insert', 'status': 'draft', 'category': 'document', 'updated_at': '2026-03-04T16:00:00Z'},
];

class StudioHubScreen extends ConsumerWidget {
  const StudioHubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final docsAsync = ref.watch(_studioDocsProvider);
    final isLive = ref.watch(_isStudioLiveProvider);

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
                Text('Studio', style: SocelleTheme.headlineSmall),
                const SizedBox(width: 8),
                if (!isLive) const DemoBadge(compact: true),
              ],
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: SocelleTheme.accentLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Create on web',
                    style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.accent),
                  ),
                ),
              ),
            ],
          ),
          // Info banner
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: SocelleTheme.accentLight,
                  borderRadius: SocelleTheme.borderRadiusMd,
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 16, color: SocelleTheme.accent),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Authoring is available on the SOCELLE web app. Your documents are synced here for preview.',
                        style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.accent),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          docsAsync.when(
            data: (docs) {
              if (docs.isEmpty) {
                return SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.design_services_outlined, size: 48, color: SocelleTheme.accent.withValues(alpha: 0.4)),
                        const SizedBox(height: 16),
                        Text('No documents yet', style: SocelleTheme.titleMedium.copyWith(color: SocelleTheme.textMuted)),
                        const SizedBox(height: 8),
                        Text('Create documents in the web Studio.', style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textFaint)),
                      ],
                    ),
                  ),
                );
              }
              return SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _DocCard(doc: docs[i]),
                    ),
                    childCount: docs.length,
                  ),
                ),
              );
            },
            loading: () => SliverFillRemaining(
              child: Center(child: LoadingWidget(label: 'Loading documents...')),
            ),
            error: (e, _) => SliverFillRemaining(
              child: socelle.SocelleErrorWidget(
                message: 'Could not load studio documents.',
                onRetry: () => ref.invalidate(_studioDocsProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DocCard extends StatelessWidget {
  const _DocCard({required this.doc});
  final Map<String, dynamic> doc;

  @override
  Widget build(BuildContext context) {
    final title = doc['title'] as String? ?? 'Untitled';
    final status = doc['status'] as String? ?? 'draft';
    final category = doc['category'] as String? ?? 'document';
    final rawUpdated = doc['updated_at'] as String?;

    String updatedStr = '';
    if (rawUpdated != null) {
      try {
        updatedStr = _relativeDateFormatter.format(DateTime.parse(rawUpdated).toLocal());
      } catch (_) {}
    }

    final isPublished = status == 'published';
    final statusColor = isPublished ? SocelleTheme.signalUp : SocelleTheme.signalWarn;
    final statusBg = isPublished
        ? SocelleTheme.signalUp.withValues(alpha: 0.1)
        : SocelleTheme.signalWarn.withValues(alpha: 0.1);

    final categoryIcon = switch (category) {
      'campaign' => Icons.campaign_outlined,
      'training' => Icons.school_outlined,
      _ => Icons.description_outlined,
    };

    return Container(
      decoration: BoxDecoration(
        color: SocelleTheme.surfaceElevated,
        borderRadius: SocelleTheme.borderRadiusMd,
        border: Border.all(color: SocelleTheme.borderLight),
      ),
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: SocelleTheme.accentLight,
              borderRadius: SocelleTheme.borderRadiusSm,
            ),
            child: Icon(categoryIcon, color: SocelleTheme.accent, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: SocelleTheme.titleSmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(
                  category[0].toUpperCase() + category.substring(1),
                  style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textFaint),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(4)),
                child: Text(
                  isPublished ? 'Live' : 'Draft',
                  style: SocelleTheme.labelSmall.copyWith(color: statusColor),
                ),
              ),
              if (updatedStr.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(updatedStr, style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.textFaint)),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
