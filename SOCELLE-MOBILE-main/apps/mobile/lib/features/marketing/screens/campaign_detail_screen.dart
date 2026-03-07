import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Campaign detail screen.
///
/// DEMO surface.
class CampaignDetailScreen extends StatelessWidget {
  const CampaignDetailScreen({super.key, required this.campaignId});
  final String campaignId;

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
            const Text('Campaign'),
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
            Text('Spring Glow Promo', style: SocelleTheme.headlineMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: SocelleTheme.signalUp.withValues(alpha: 0.1),
                    borderRadius: SocelleTheme.borderRadiusPill,
                  ),
                  child: Text('ACTIVE', style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.signalUp, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(width: SocelleTheme.spacingMd),
                Text('Email Campaign', style: SocelleTheme.bodyMedium),
              ],
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // Metrics
            Row(
              children: [
                Expanded(child: _MetricCard(label: 'Sent', value: '2,400')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _MetricCard(label: 'Opened', value: '1,080')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _MetricCard(label: 'Clicked', value: '295')),
              ],
            ),
            const SizedBox(height: SocelleTheme.spacingMd),
            Row(
              children: [
                Expanded(child: _MetricCard(label: 'Open Rate', value: '45%')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _MetricCard(label: 'CTR', value: '12.3%')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _MetricCard(label: 'Conversions', value: '18')),
              ],
            ),

            const SizedBox(height: SocelleTheme.spacingLg),
            const Divider(),
            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Campaign Details', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingMd),
            _DetailRow(label: 'Start Date', value: 'March 1, 2026'),
            _DetailRow(label: 'End Date', value: 'March 31, 2026'),
            _DetailRow(label: 'Audience', value: 'Active Clients'),
            _DetailRow(label: 'Budget', value: '\$250'),

            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Description', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            Text(
              'Seasonal promotion featuring spring skincare essentials with 15% off select serums and moisturizers. Targeting active clients who purchased in the last 90 days.',
              style: SocelleTheme.bodyLarge,
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(SocelleTheme.spacingSm),
      decoration: BoxDecoration(
        color: SocelleTheme.surfaceElevated,
        borderRadius: SocelleTheme.borderRadiusSm,
        border: Border.all(color: SocelleTheme.borderLight),
      ),
      child: Column(
        children: [
          Text(value, style: SocelleTheme.titleMedium),
          Text(label, style: SocelleTheme.bodySmall),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: SocelleTheme.spacingSm),
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
