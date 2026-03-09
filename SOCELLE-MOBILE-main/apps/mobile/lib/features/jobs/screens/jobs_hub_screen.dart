// ── Jobs Hub Screen — Build 5 Mobile Parity ──────────────────────────────
// Reads from `job_postings` table (same Supabase API contract as web /jobs).
// LIVE when Supabase is connected; DEMO labeled when not.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';

final _jobsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoJobs;
  try {
    final response = await SocelleSupabaseClient.client
        .from('job_postings')
        .select('id, title, company_name, location, job_type, salary_range, description, category, posted_at')
        .eq('status', 'active')
        .order('posted_at', ascending: false)
        .limit(30);
    if (response.isEmpty) return _demoJobs;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoJobs;
  }
});

final _isJobsLiveProvider = Provider.autoDispose<bool>((ref) {
  final jobs = ref.watch(_jobsProvider).valueOrNull;
  return jobs != null && jobs != _demoJobs;
});

const _demoJobs = <Map<String, dynamic>>[
  {'id': 'demo-j1', 'title': 'Lead Esthetician', 'company_name': 'Glow Medspa', 'location': 'Miami, FL', 'job_type': 'Full-time', 'salary_range': '\$55,000–\$75,000', 'category': 'Clinical', 'description': 'Senior esthetician role managing treatment protocols and staff training at a high-volume medspa.'},
  {'id': 'demo-j2', 'title': 'Spa Director', 'company_name': 'Marble & Mist', 'location': 'New York, NY', 'job_type': 'Full-time', 'salary_range': '\$80,000–\$110,000', 'category': 'Management', 'description': 'Director responsible for P&L, team leadership, and service menu strategy for a luxury urban spa.'},
  {'id': 'demo-j3', 'title': 'Medical Esthetician', 'company_name': 'DermaClinic Partners', 'location': 'Austin, TX', 'job_type': 'Full-time', 'salary_range': '\$60,000–\$80,000', 'category': 'Medical', 'description': 'Medical-grade treatments including chemical peels, micro-needling, and laser-assist prep.'},
  {'id': 'demo-j4', 'title': 'Freelance Educator', 'company_name': 'SkinScience Pro', 'location': 'Remote', 'job_type': 'Contract', 'salary_range': '\$500–\$2,000/day', 'category': 'Education', 'description': 'Develop and deliver CE training for brand ambassadors and spa partners nationwide.'},
];

class JobsHubScreen extends ConsumerWidget {
  const JobsHubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobsAsync = ref.watch(_jobsProvider);
    final isLive = ref.watch(_isJobsLiveProvider);

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
                Text('Jobs', style: SocelleTheme.headlineSmall),
                const SizedBox(width: 8),
                if (!isLive) const DemoBadge(compact: true),
              ],
            ),
          ),
          jobsAsync.when(
            data: (jobs) {
              if (jobs.isEmpty) {
                return SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.work_outline, size: 48, color: SocelleTheme.accent.withValues(alpha: 0.4)),
                        const SizedBox(height: 16),
                        Text('No openings yet', style: SocelleTheme.titleMedium.copyWith(color: SocelleTheme.textMuted)),
                        const SizedBox(height: 8),
                        Text('Job postings will appear here.', style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textFaint)),
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
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _JobCard(job: jobs[i]),
                    ),
                    childCount: jobs.length,
                  ),
                ),
              );
            },
            loading: () => SliverFillRemaining(
              child: Center(child: LoadingWidget(label: 'Loading jobs...')),
            ),
            error: (e, _) => SliverFillRemaining(
              child: socelle.SocelleErrorWidget(
                message: 'Could not load job postings.',
                onRetry: () => ref.invalidate(_jobsProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({required this.job});
  final Map<String, dynamic> job;

  @override
  Widget build(BuildContext context) {
    final title = job['title'] as String? ?? '';
    final company = job['company_name'] as String? ?? '';
    final location = job['location'] as String? ?? '';
    final jobType = job['job_type'] as String? ?? '';
    final salaryRange = job['salary_range'] as String? ?? '';
    final category = job['category'] as String? ?? '';
    final description = job['description'] as String? ?? '';

    Color typeColor = SocelleTheme.accent;
    Color typeBg = SocelleTheme.accentLight;
    if (jobType == 'Contract') {
      typeColor = SocelleTheme.signalWarn;
      typeBg = SocelleTheme.signalWarn.withValues(alpha: 0.1);
    }

    return Container(
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: SocelleTheme.titleSmall),
                    const SizedBox(height: 2),
                    Text(company, style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textMuted)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: typeBg,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(jobType, style: SocelleTheme.labelSmall.copyWith(color: typeColor)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(description, style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textMuted), maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: [
              _Pill(icon: Icons.location_on_outlined, label: location),
              if (salaryRange.isNotEmpty) _Pill(icon: Icons.attach_money, label: salaryRange),
              _Pill(icon: Icons.category_outlined, label: category),
            ],
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: SocelleTheme.textFaint),
        const SizedBox(width: 3),
        Text(label, style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.textFaint)),
      ],
    );
  }
}
