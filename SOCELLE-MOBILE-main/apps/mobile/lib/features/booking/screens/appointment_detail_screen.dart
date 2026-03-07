import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Appointment detail screen — view/edit a single appointment.
///
/// DEMO surface.
class AppointmentDetailScreen extends StatelessWidget {
  const AppointmentDetailScreen({super.key, required this.appointmentId});
  final String appointmentId;

  @override
  Widget build(BuildContext context) {
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
            const Text('Appointment'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.edit_outlined, size: 20), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(SocelleTheme.spacingLg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Client info
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(SocelleTheme.spacingMd),
              decoration: BoxDecoration(
                color: SocelleTheme.surfaceElevated,
                borderRadius: SocelleTheme.borderRadiusMd,
                border: Border.all(color: SocelleTheme.borderLight),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: SocelleTheme.accentLight,
                    child: Text('S', style: SocelleTheme.titleMedium.copyWith(color: SocelleTheme.accent)),
                  ),
                  const SizedBox(width: SocelleTheme.spacingMd),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Sarah Mitchell', style: SocelleTheme.titleMedium),
                        Text('sarah@example.com', style: SocelleTheme.bodySmall),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: SocelleTheme.signalUp.withValues(alpha: 0.1),
                      borderRadius: SocelleTheme.borderRadiusPill,
                    ),
                    child: Text('CONFIRMED', style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.signalUp, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // Details
            _DetailRow(icon: Icons.spa_outlined, label: 'Service', value: 'Chemical Peel'),
            _DetailRow(icon: Icons.calendar_today_outlined, label: 'Date', value: 'March 8, 2026'),
            _DetailRow(icon: Icons.access_time_outlined, label: 'Time', value: '10:00 AM - 11:00 AM'),
            _DetailRow(icon: Icons.timer_outlined, label: 'Duration', value: '60 minutes'),
            _DetailRow(icon: Icons.attach_money_rounded, label: 'Price', value: '\$150.00'),

            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Notes', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(SocelleTheme.spacingMd),
              decoration: BoxDecoration(
                color: SocelleTheme.warmIvory,
                borderRadius: SocelleTheme.borderRadiusMd,
              ),
              child: Text(
                'Client requests gentle formulation. Sensitive skin noted in records.',
                style: SocelleTheme.bodyLarge,
              ),
            ),

            const SizedBox(height: SocelleTheme.spacingXl),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Appointment cancelled (demo)')),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: SocelleTheme.signalDown,
                      side: BorderSide(color: SocelleTheme.signalDown.withValues(alpha: 0.3)),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(
                  child: FilledButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Reschedule (demo)')),
                      );
                    },
                    child: const Text('Reschedule'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SocelleTheme.spacingMd),
      child: Row(
        children: [
          Icon(icon, size: 20, color: SocelleTheme.textMuted),
          const SizedBox(width: SocelleTheme.spacingMd),
          Text(label, style: SocelleTheme.bodyMedium),
          const Spacer(),
          Text(value, style: SocelleTheme.titleSmall),
        ],
      ),
    );
  }
}
