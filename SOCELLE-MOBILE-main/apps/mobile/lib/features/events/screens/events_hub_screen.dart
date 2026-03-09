// ── Events Hub Screen — Build 5 Mobile Parity ────────────────────────────
// Reads from `events` table (same Supabase API contract as web /events).
// LIVE when Supabase is connected; DEMO labeled when not.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/shared/error_widget.dart' as socelle;
import '../../../core/supabase/supabase_client.dart';

final _eventsProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoEvents;
  try {
    final response = await SocelleSupabaseClient.client
        .from('events')
        .select('id, title, description, event_date, location, event_type, host_name, registration_url, is_virtual')
        .gte('event_date', DateTime.now().toIso8601String())
        .order('event_date', ascending: true)
        .limit(20);
    if (response.isEmpty) return _demoEvents;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoEvents;
  }
});

final _isEventsLiveProvider = Provider.autoDispose<bool>((ref) {
  final events = ref.watch(_eventsProvider).valueOrNull;
  return events != null && events != _demoEvents;
});

final _dateFormatter = DateFormat('MMM d, yyyy');
final _dayFormatter = DateFormat('d');
final _monthFormatter = DateFormat('MMM');

const _demoEvents = <Map<String, dynamic>>[
  {'id': 'demo-e1', 'title': 'Beauty Innovation Summit 2026', 'description': 'Three days of cutting-edge education, brand showcases, and networking for beauty professionals.', 'event_date': '2026-05-15T09:00:00Z', 'location': 'Las Vegas, NV', 'event_type': 'Conference', 'host_name': 'Beauty Business Alliance', 'is_virtual': false},
  {'id': 'demo-e2', 'title': 'Medspa Growth Workshop', 'description': 'Half-day intensive on revenue optimization, service menu engineering, and staff retention for medspa operators.', 'event_date': '2026-04-22T13:00:00Z', 'location': 'Zoom', 'event_type': 'Workshop', 'host_name': 'SOCELLE Academy', 'is_virtual': true},
  {'id': 'demo-e3', 'title': 'Cosmoprof North America', 'description': 'The leading trade show for the professional beauty industry. Sourcing, education, and networking.', 'event_date': '2026-07-12T08:00:00Z', 'location': 'Las Vegas, NV', 'event_type': 'Trade Show', 'host_name': 'Cosmoprof', 'is_virtual': false},
  {'id': 'demo-e4', 'title': 'Ingredient Science Masterclass', 'description': 'Deep dive into advanced actives with formulation chemists from leading cosmeceutical brands.', 'event_date': '2026-04-10T10:00:00Z', 'location': 'Online', 'event_type': 'Webinar', 'host_name': 'DermaElite Education', 'is_virtual': true},
];

class EventsHubScreen extends ConsumerWidget {
  const EventsHubScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventsAsync = ref.watch(_eventsProvider);
    final isLive = ref.watch(_isEventsLiveProvider);

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
                Text('Events', style: SocelleTheme.headlineSmall),
                const SizedBox(width: 8),
                if (!isLive) const DemoBadge(compact: true),
              ],
            ),
          ),
          eventsAsync.when(
            data: (events) {
              if (events.isEmpty) {
                return SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.event_outlined, size: 48, color: SocelleTheme.accent.withValues(alpha: 0.4)),
                        const SizedBox(height: 16),
                        Text('No upcoming events', style: SocelleTheme.titleMedium.copyWith(color: SocelleTheme.textMuted)),
                        const SizedBox(height: 8),
                        Text('Check back for new events.', style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textFaint)),
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
                      child: _EventCard(event: events[i]),
                    ),
                    childCount: events.length,
                  ),
                ),
              );
            },
            loading: () => SliverFillRemaining(
              child: Center(child: LoadingWidget(label: 'Loading events...')),
            ),
            error: (e, _) => SliverFillRemaining(
              child: socelle.SocelleErrorWidget(
                message: 'Could not load events.',
                onRetry: () => ref.invalidate(_eventsProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  const _EventCard({required this.event});
  final Map<String, dynamic> event;

  @override
  Widget build(BuildContext context) {
    final title = event['title'] as String? ?? '';
    final description = event['description'] as String? ?? '';
    final location = event['location'] as String? ?? '';
    final eventType = event['event_type'] as String? ?? '';
    final hostName = event['host_name'] as String? ?? '';
    final isVirtual = event['is_virtual'] as bool? ?? false;
    final rawDate = event['event_date'] as String?;

    DateTime? eventDate;
    String dayStr = '';
    String monthStr = '';
    String fullDate = '';
    if (rawDate != null) {
      try {
        eventDate = DateTime.parse(rawDate).toLocal();
        dayStr = _dayFormatter.format(eventDate);
        monthStr = _monthFormatter.format(eventDate).toUpperCase();
        fullDate = _dateFormatter.format(eventDate);
      } catch (_) {}
    }

    return Container(
      decoration: BoxDecoration(
        color: SocelleTheme.surfaceElevated,
        borderRadius: SocelleTheme.borderRadiusMd,
        border: Border.all(color: SocelleTheme.borderLight),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Date column
          Container(
            width: 56,
            padding: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              color: SocelleTheme.accentLight,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(SocelleTheme.radiusMd),
                bottomLeft: Radius.circular(SocelleTheme.radiusMd),
              ),
            ),
            child: Column(
              children: [
                Text(monthStr, style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.accent, fontWeight: FontWeight.w600)),
                Text(dayStr, style: SocelleTheme.headlineMedium.copyWith(color: SocelleTheme.accent, height: 1.1)),
              ],
            ),
          ),
          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(title, style: SocelleTheme.titleSmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                      ),
                      if (isVirtual)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: SocelleTheme.signalUp.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text('Virtual', style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.signalUp)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(hostName, style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.accent)),
                  const SizedBox(height: 6),
                  Text(description, style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.textMuted), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 12, color: SocelleTheme.textFaint),
                      const SizedBox(width: 3),
                      Expanded(child: Text(location, style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.textFaint), overflow: TextOverflow.ellipsis)),
                      if (eventType.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Text('· $eventType', style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.textFaint)),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
