import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';
import '../../../core/shared/loading_widget.dart';
import '../../../core/supabase/supabase_client.dart';
import '../../../core/auth/auth_provider.dart';

/// Booking home screen — upcoming appointments and quick booking.
///
/// DEMO surface until appointments table is wired.

final _appointmentsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return _demoAppointments;
  final user = ref.watch(currentUserProvider);
  if (user == null) return _demoAppointments;
  try {
    final response = await SocelleSupabaseClient.client
        .from('appointments')
        .select('id, client_name, service, start_time, end_time, status')
        .eq('provider_id', user.id)
        .gte('start_time', DateTime.now().toIso8601String())
        .order('start_time')
        .limit(10);
    if (response.isEmpty) return _demoAppointments;
    return List<Map<String, dynamic>>.from(response);
  } catch (_) {
    return _demoAppointments;
  }
});

final _demoAppointments = <Map<String, dynamic>>[
  {'id': 'a1', 'client_name': 'Sarah Mitchell', 'service': 'Chemical Peel', 'start_time': '2026-03-08T10:00:00', 'end_time': '2026-03-08T11:00:00', 'status': 'confirmed'},
  {'id': 'a2', 'client_name': 'Emily Chen', 'service': 'LED Therapy', 'start_time': '2026-03-08T11:30:00', 'end_time': '2026-03-08T12:15:00', 'status': 'confirmed'},
  {'id': 'a3', 'client_name': 'Jessica Park', 'service': 'Hydrafacial', 'start_time': '2026-03-08T14:00:00', 'end_time': '2026-03-08T15:00:00', 'status': 'pending'},
  {'id': 'a4', 'client_name': 'Maria Rodriguez', 'service': 'Consultation', 'start_time': '2026-03-09T09:00:00', 'end_time': '2026-03-09T09:30:00', 'status': 'confirmed'},
];

class BookingHomeScreen extends ConsumerWidget {
  const BookingHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appointmentsAsync = ref.watch(_appointmentsProvider);

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
                Text('Booking', style: SocelleTheme.headlineSmall),
                const SizedBox(width: SocelleTheme.spacingSm),
                const DemoBadge(compact: true),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.calendar_month_outlined, size: 22),
                onPressed: () => context.push('/book/calendar'),
              ),
              const SizedBox(width: 4),
            ],
          ),

          // Today summary
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
              child: Container(
                padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [SocelleTheme.accent, SocelleTheme.mnDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: SocelleTheme.borderRadiusLg,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Today',
                            style: SocelleTheme.labelMedium.copyWith(
                              color: SocelleTheme.pearlWhite.withValues(alpha: 0.7),
                            ),
                          ),
                          Text(
                            DateFormat('EEEE, MMM d').format(DateTime.now()),
                            style: SocelleTheme.titleLarge.copyWith(
                              color: SocelleTheme.pearlWhite,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: SocelleTheme.pearlWhite.withValues(alpha: 0.2),
                        borderRadius: SocelleTheme.borderRadiusPill,
                      ),
                      child: Text(
                        '3 appointments',
                        style: SocelleTheme.labelMedium.copyWith(
                          color: SocelleTheme.pearlWhite,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: SocelleTheme.spacingLg)),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
              child: Text('Upcoming Appointments', style: SocelleTheme.titleMedium),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: SocelleTheme.spacingMd)),

          appointmentsAsync.when(
            data: (appointments) {
              if (appointments.isEmpty) {
                return SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(SocelleTheme.spacingXl),
                      child: Column(
                        children: [
                          Icon(Icons.event_available_outlined, size: 48, color: SocelleTheme.textFaint),
                          const SizedBox(height: SocelleTheme.spacingMd),
                          Text('No upcoming appointments', style: SocelleTheme.bodyMedium),
                        ],
                      ),
                    ),
                  ),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: SocelleTheme.spacingLg),
                sliver: SliverList.separated(
                  itemCount: appointments.length,
                  separatorBuilder: (_, __) => const SizedBox(height: SocelleTheme.spacingMd),
                  itemBuilder: (context, index) {
                    final appt = appointments[index];
                    final startTime = DateTime.tryParse(appt['start_time'] as String? ?? '');
                    final timeStr = startTime != null ? DateFormat('h:mm a').format(startTime) : '';

                    return GestureDetector(
                      onTap: () => context.push('/book/appointment/${appt['id']}'),
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
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: SocelleTheme.accentLight,
                                borderRadius: SocelleTheme.borderRadiusSm,
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    startTime != null ? DateFormat('d').format(startTime) : '',
                                    style: SocelleTheme.titleMedium.copyWith(color: SocelleTheme.accent),
                                  ),
                                  Text(
                                    startTime != null ? DateFormat('MMM').format(startTime) : '',
                                    style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.accent, fontSize: 9),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: SocelleTheme.spacingMd),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(appt['client_name'] as String? ?? '', style: SocelleTheme.titleSmall),
                                  Text(
                                    '${appt['service']}  |  $timeStr',
                                    style: SocelleTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: appt['status'] == 'confirmed'
                                    ? SocelleTheme.signalUp.withValues(alpha: 0.1)
                                    : SocelleTheme.signalWarn.withValues(alpha: 0.1),
                                borderRadius: SocelleTheme.borderRadiusPill,
                              ),
                              child: Text(
                                (appt['status'] as String? ?? '').toUpperCase(),
                                style: SocelleTheme.labelSmall.copyWith(
                                  color: appt['status'] == 'confirmed'
                                      ? SocelleTheme.signalUp
                                      : SocelleTheme.signalWarn,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              );
            },
            loading: () => const SliverFillRemaining(
              child: SocelleLoadingWidget(message: 'Loading appointments...'),
            ),
            error: (_, __) => SliverToBoxAdapter(
              child: Center(child: Text('Failed to load appointments.', style: SocelleTheme.bodyLarge)),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: SocelleTheme.spacing3xl)),
        ],
      ),
    );
  }
}
