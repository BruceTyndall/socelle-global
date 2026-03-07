import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Deal detail screen — individual deal view with stage, value, and notes.
///
/// DEMO surface.
class DealDetailScreen extends StatelessWidget {
  const DealDetailScreen({super.key, required this.dealId});
  final String dealId;

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
            const Text('Deal'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(SocelleTheme.spacingLg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Glow Spa — Premium Package', style: SocelleTheme.headlineMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: SocelleTheme.signalWarn.withValues(alpha: 0.1),
                    borderRadius: SocelleTheme.borderRadiusPill,
                  ),
                  child: Text('LEAD', style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.signalWarn, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(width: SocelleTheme.spacingMd),
                Text('\$2,400', style: SocelleTheme.headlineSmall.copyWith(color: SocelleTheme.signalUp)),
              ],
            ),

            const SizedBox(height: SocelleTheme.spacingLg),
            const Divider(),
            const SizedBox(height: SocelleTheme.spacingLg),

            _DealField(label: 'Contact', value: 'Lisa Park'),
            _DealField(label: 'Company', value: 'Glow Spa'),
            _DealField(label: 'Expected Close', value: 'March 15, 2026'),
            _DealField(label: 'Probability', value: '60%'),
            _DealField(label: 'Source', value: 'Referral'),

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
                'Lisa is interested in the premium skincare package for her spa. Follow up after the product demo scheduled for next week.',
                style: SocelleTheme.bodyLarge,
              ),
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Activity', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingMd),
            _ActivityItem(icon: Icons.phone_outlined, text: 'Call with Lisa — discussed pricing', time: '2 days ago'),
            _ActivityItem(icon: Icons.email_outlined, text: 'Sent proposal PDF', time: '5 days ago'),
            _ActivityItem(icon: Icons.add_circle_outline, text: 'Deal created', time: '1 week ago'),

            const SizedBox(height: SocelleTheme.spacingXl),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {},
                    child: const Text('Add Note'),
                  ),
                ),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(
                  child: FilledButton(
                    onPressed: () {},
                    child: const Text('Move Stage'),
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

class _DealField extends StatelessWidget {
  const _DealField({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SocelleTheme.spacingMd),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: SocelleTheme.bodyMedium),
          Text(value, style: SocelleTheme.titleSmall),
        ],
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  const _ActivityItem({required this.icon, required this.text, required this.time});
  final IconData icon;
  final String text;
  final String time;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SocelleTheme.spacingMd),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: SocelleTheme.textMuted),
          const SizedBox(width: SocelleTheme.spacingMd),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(text, style: SocelleTheme.bodyLarge),
                Text(time, style: SocelleTheme.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
