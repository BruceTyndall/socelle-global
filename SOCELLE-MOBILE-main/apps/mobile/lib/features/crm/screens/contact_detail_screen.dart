import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';

/// Contact detail screen — full client profile, service history, notes.

final _contactDetailProvider =
    FutureProvider.family<Map<String, dynamic>?, String>((ref, contactId) async {
  if (!SocelleSupabaseClient.isInitialized || contactId.startsWith('c')) {
    return {
      'id': contactId,
      'full_name': 'Sarah Mitchell',
      'email': 'sarah@example.com',
      'phone': '(555) 123-4567',
      'status': 'active',
      'last_visit': '2026-02-28',
      'total_visits': 12,
      'lifetime_value': 2340.00,
      'notes': 'Prefers morning appointments. Sensitive skin — avoid high-concentration AHA.',
      'preferred_services': ['Chemical Peel', 'LED Therapy', 'Hydrafacial'],
      'is_demo': true,
    };
  }
  try {
    return await SocelleSupabaseClient.client
        .from('crm_contacts')
        .select()
        .eq('id', contactId)
        .single();
  } catch (_) {
    return null;
  }
});

class ContactDetailScreen extends ConsumerWidget {
  const ContactDetailScreen({super.key, required this.contactId});
  final String contactId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contactAsync = ref.watch(_contactDetailProvider(contactId));

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined, size: 20),
            onPressed: () {},
          ),
        ],
      ),
      body: contactAsync.when(
        data: (contact) {
          if (contact == null) {
            return Center(child: Text('Contact not found.', style: SocelleTheme.bodyLarge));
          }
          final services = contact['preferred_services'] as List<dynamic>? ?? [];

          return SingleChildScrollView(
            padding: const EdgeInsets.all(SocelleTheme.spacingLg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (contact['is_demo'] == true) ...[
                  const DemoBadge(),
                  const SizedBox(height: SocelleTheme.spacingMd),
                ],

                // Avatar + name
                Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundColor: SocelleTheme.accentLight,
                        child: Text(
                          (contact['full_name'] as String? ?? 'U')[0],
                          style: SocelleTheme.headlineLarge.copyWith(color: SocelleTheme.accent),
                        ),
                      ),
                      const SizedBox(height: SocelleTheme.spacingMd),
                      Text(contact['full_name'] as String? ?? '', style: SocelleTheme.headlineMedium),
                      const SizedBox(height: SocelleTheme.spacingXs),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: (contact['status'] == 'active' ? SocelleTheme.signalUp : SocelleTheme.textFaint).withValues(alpha: 0.1),
                          borderRadius: SocelleTheme.borderRadiusPill,
                        ),
                        child: Text(
                          (contact['status'] as String? ?? 'unknown').toUpperCase(),
                          style: SocelleTheme.labelSmall.copyWith(
                            color: contact['status'] == 'active' ? SocelleTheme.signalUp : SocelleTheme.textFaint,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: SocelleTheme.spacingLg),

                // Contact info
                _InfoRow(icon: Icons.email_outlined, label: contact['email'] as String? ?? ''),
                _InfoRow(icon: Icons.phone_outlined, label: contact['phone'] as String? ?? ''),
                _InfoRow(icon: Icons.event_outlined, label: 'Last visit: ${contact['last_visit'] ?? 'N/A'}'),

                const SizedBox(height: SocelleTheme.spacingLg),

                // Stats
                Row(
                  children: [
                    Expanded(
                      child: _MiniStat(label: 'Total Visits', value: '${contact['total_visits'] ?? 0}'),
                    ),
                    const SizedBox(width: SocelleTheme.spacingMd),
                    Expanded(
                      child: _MiniStat(
                        label: 'Lifetime Value',
                        value: '\$${(contact['lifetime_value'] as num?)?.toStringAsFixed(0) ?? '0'}',
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: SocelleTheme.spacingLg),

                // Preferred services
                if (services.isNotEmpty) ...[
                  Text('Preferred Services', style: SocelleTheme.titleMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Wrap(
                    spacing: SocelleTheme.spacingSm,
                    runSpacing: SocelleTheme.spacingSm,
                    children: services.map((s) => Chip(
                      label: Text(s as String),
                      backgroundColor: SocelleTheme.accentLight,
                      labelStyle: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.graphite),
                    )).toList(),
                  ),
                  const SizedBox(height: SocelleTheme.spacingLg),
                ],

                // Notes
                if (contact['notes'] != null) ...[
                  Text('Notes', style: SocelleTheme.titleMedium),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                    decoration: BoxDecoration(
                      color: SocelleTheme.warmIvory,
                      borderRadius: SocelleTheme.borderRadiusMd,
                    ),
                    child: Text(contact['notes'] as String, style: SocelleTheme.bodyLarge),
                  ),
                ],

                const SizedBox(height: SocelleTheme.spacingXl),

                // Action buttons
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: () => context.push('/crm/service-record/$contactId'),
                    icon: const Icon(Icons.add_rounded),
                    label: const Text('New Service Record'),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const SocelleLoadingWidget(message: 'Loading contact...'),
        error: (_, __) => Center(child: Text('Failed to load contact.', style: SocelleTheme.bodyLarge)),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SocelleTheme.spacingSm),
      child: Row(
        children: [
          Icon(icon, size: 18, color: SocelleTheme.textMuted),
          const SizedBox(width: SocelleTheme.spacingSm),
          Text(label, style: SocelleTheme.bodyLarge),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.label, required this.value});
  final String label;
  final String value;

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
        children: [
          Text(value, style: SocelleTheme.headlineSmall),
          const SizedBox(height: 2),
          Text(label, style: SocelleTheme.bodySmall),
        ],
      ),
    );
  }
}
