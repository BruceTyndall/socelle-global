import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';
import '../../../core/auth/auth_provider.dart';

/// CRM Dashboard — client overview, stats, and quick actions.
///
/// DEMO surface until CRM tables are wired.

final _crmStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) {
    return {'total_clients': 47, 'active_clients': 32, 'new_this_month': 5, 'retention_rate': 89.2, 'is_demo': true};
  }
  final user = ref.watch(currentUserProvider);
  if (user == null) return {'total_clients': 0, 'active_clients': 0, 'new_this_month': 0, 'retention_rate': 0.0};
  try {
    final response = await SocelleSupabaseClient.client
        .from('crm_contacts')
        .select('id, status')
        .eq('owner_id', user.id);
    final contacts = List<Map<String, dynamic>>.from(response);
    return {
      'total_clients': contacts.length,
      'active_clients': contacts.where((c) => c['status'] == 'active').length,
      'new_this_month': contacts.length > 5 ? 5 : contacts.length,
      'retention_rate': contacts.isNotEmpty ? 85.0 : 0.0,
    };
  } catch (_) {
    return {'total_clients': 0, 'active_clients': 0, 'new_this_month': 0, 'retention_rate': 0.0};
  }
});

class CrmDashboardScreen extends ConsumerWidget {
  const CrmDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(_crmStatsProvider);

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
            const Text('CRM'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: statsAsync.when(
        data: (stats) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(SocelleTheme.spacingLg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Stats grid
                Row(
                  children: [
                    Expanded(child: _StatCard(label: 'Total Clients', value: '${stats['total_clients']}')),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    Expanded(child: _StatCard(label: 'Active', value: '${stats['active_clients']}')),
                  ],
                ),
                const SizedBox(height: SocelleTheme.spacingMd),
                Row(
                  children: [
                    Expanded(child: _StatCard(label: 'New This Month', value: '${stats['new_this_month']}')),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    Expanded(child: _StatCard(
                      label: 'Retention',
                      value: '${(stats['retention_rate'] as num).toStringAsFixed(1)}%',
                      valueColor: SocelleTheme.signalUp,
                    )),
                  ],
                ),

                const SizedBox(height: SocelleTheme.spacingXl),

                // Quick actions
                Text('Quick Actions', style: SocelleTheme.titleMedium),
                const SizedBox(height: SocelleTheme.spacingMd),

                _ActionTile(
                  icon: Icons.people_outline_rounded,
                  label: 'View All Contacts',
                  subtitle: '${stats['total_clients']} contacts',
                  onTap: () => context.push('/crm/contacts'),
                ),
                const SizedBox(height: SocelleTheme.spacingMd),
                _ActionTile(
                  icon: Icons.add_circle_outline_rounded,
                  label: 'Add New Contact',
                  subtitle: 'Create a client record',
                  onTap: () {},
                ),
                const SizedBox(height: SocelleTheme.spacingMd),
                _ActionTile(
                  icon: Icons.assignment_outlined,
                  label: 'Service Records',
                  subtitle: 'View treatment history',
                  onTap: () {},
                ),
              ],
            ),
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading CRM...'),
        error: (_, __) => Center(
          child: Text('Failed to load CRM data.', style: SocelleTheme.bodyLarge),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value, this.valueColor});
  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(SocelleTheme.spacingMd),
      decoration: BoxDecoration(
        color: SocelleTheme.surfaceElevated,
        borderRadius: SocelleTheme.borderRadiusMd,
        border: Border.all(color: SocelleTheme.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: SocelleTheme.labelSmall),
          const SizedBox(height: SocelleTheme.spacingXs),
          Text(
            value,
            style: SocelleTheme.headlineMedium.copyWith(
              color: valueColor ?? SocelleTheme.graphite,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: SocelleTheme.surfaceElevated,
      borderRadius: SocelleTheme.borderRadiusMd,
      child: InkWell(
        borderRadius: SocelleTheme.borderRadiusMd,
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(SocelleTheme.spacingMd),
          decoration: BoxDecoration(
            borderRadius: SocelleTheme.borderRadiusMd,
            border: Border.all(color: SocelleTheme.borderLight),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: SocelleTheme.accentLight,
                  borderRadius: SocelleTheme.borderRadiusSm,
                ),
                child: Icon(icon, color: SocelleTheme.accent, size: 22),
              ),
              const SizedBox(width: SocelleTheme.spacingMd),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: SocelleTheme.titleSmall),
                    Text(subtitle, style: SocelleTheme.bodySmall),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: SocelleTheme.textFaint),
            ],
          ),
        ),
      ),
    );
  }
}
