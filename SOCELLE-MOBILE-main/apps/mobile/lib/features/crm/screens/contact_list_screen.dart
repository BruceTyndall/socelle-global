import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';
import '../../../core/auth/auth_provider.dart';

/// Contact list screen — searchable list of CRM contacts.

final _contactsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoContacts;
  final user = ref.watch(currentUserProvider);
  if (user == null) return _demoContacts;
  try {
    final response = await SocelleSupabaseClient.client
        .from('crm_contacts')
        .select('id, full_name, email, phone, status, last_visit')
        .eq('owner_id', user.id)
        .order('full_name');
    if (response.isEmpty) return _demoContacts;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoContacts;
  }
});

const _demoContacts = <Map<String, dynamic>>[
  {'id': 'c1', 'full_name': 'Sarah Mitchell', 'email': 'sarah@example.com', 'phone': '(555) 123-4567', 'status': 'active', 'last_visit': '2026-02-28'},
  {'id': 'c2', 'full_name': 'Emily Chen', 'email': 'emily@example.com', 'phone': '(555) 234-5678', 'status': 'active', 'last_visit': '2026-03-01'},
  {'id': 'c3', 'full_name': 'Jessica Park', 'email': 'jessica@example.com', 'phone': '(555) 345-6789', 'status': 'inactive', 'last_visit': '2026-01-15'},
  {'id': 'c4', 'full_name': 'Maria Rodriguez', 'email': 'maria@example.com', 'phone': '(555) 456-7890', 'status': 'active', 'last_visit': '2026-03-05'},
  {'id': 'c5', 'full_name': 'Ashley Johnson', 'email': 'ashley@example.com', 'phone': '(555) 567-8901', 'status': 'active', 'last_visit': '2026-02-20'},
];

class ContactListScreen extends ConsumerStatefulWidget {
  const ContactListScreen({super.key});

  @override
  ConsumerState<ContactListScreen> createState() => _ContactListScreenState();
}

class _ContactListScreenState extends ConsumerState<ContactListScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final contactsAsync = ref.watch(_contactsProvider);

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
            const Text('Contacts'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(SocelleTheme.spacingMd),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
              decoration: InputDecoration(
                hintText: 'Search contacts...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () => setState(() => _searchQuery = ''),
                      )
                    : null,
              ),
            ),
          ),

          Expanded(
            child: contactsAsync.when(
              data: (contacts) {
                final filtered = contacts
                    .where((c) => (c['full_name'] as String? ?? '')
                        .toLowerCase()
                        .contains(_searchQuery))
                    .toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text('No contacts found.', style: SocelleTheme.bodyMedium),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingMd),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: SocelleTheme.spacingSm),
                  itemBuilder: (context, index) {
                    final contact = filtered[index];
                    final isActive = contact['status'] == 'active';

                    return Material(
                      color: SocelleTheme.surfaceElevated,
                      borderRadius: SocelleTheme.borderRadiusMd,
                      child: InkWell(
                        borderRadius: SocelleTheme.borderRadiusMd,
                        onTap: () => context.push('/crm/contact/${contact['id']}'),
                        child: Container(
                          padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                          decoration: BoxDecoration(
                            borderRadius: SocelleTheme.borderRadiusMd,
                            border: Border.all(color: SocelleTheme.borderLight),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 22,
                                backgroundColor: SocelleTheme.accentLight,
                                child: Text(
                                  (contact['full_name'] as String? ?? 'U')[0],
                                  style: SocelleTheme.titleMedium.copyWith(
                                    color: SocelleTheme.accent,
                                  ),
                                ),
                              ),
                              const SizedBox(width: SocelleTheme.spacingMd),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      contact['full_name'] as String? ?? '',
                                      style: SocelleTheme.titleSmall,
                                    ),
                                    Text(
                                      contact['email'] as String? ?? '',
                                      style: SocelleTheme.bodySmall,
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isActive
                                      ? SocelleTheme.signalUp
                                      : SocelleTheme.textFaint,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const SocelleLoadingWidget(message: 'Loading contacts...'),
              error: (_, __) => Center(
                child: Text('Failed to load contacts.', style: SocelleTheme.bodyLarge),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: SocelleTheme.graphite,
        child: Icon(Icons.person_add_rounded, color: SocelleTheme.pearlWhite),
      ),
    );
  }
}
