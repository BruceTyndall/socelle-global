import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Marketing dashboard — campaign overview and analytics.
///
/// DEMO surface.
class MarketingDashboardScreen extends StatelessWidget {
  const MarketingDashboardScreen({super.key});

  static const _demoCampaigns = [
    {'id': 'mc1', 'name': 'Spring Glow Promo', 'status': 'active', 'reach': 2400, 'engagement': 12.3, 'type': 'Email'},
    {'id': 'mc2', 'name': 'New Client Welcome', 'status': 'active', 'reach': 850, 'engagement': 28.7, 'type': 'Automation'},
    {'id': 'mc3', 'name': 'Loyalty Rewards Q1', 'status': 'completed', 'reach': 1200, 'engagement': 18.9, 'type': 'SMS'},
    {'id': 'mc4', 'name': 'Referral Program', 'status': 'draft', 'reach': 0, 'engagement': 0.0, 'type': 'Social'},
  ];

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
            const Text('Marketing'),
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
            // Stats row
            Row(
              children: [
                Expanded(child: _StatTile(label: 'Total Reach', value: '4,450')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _StatTile(label: 'Avg Engagement', value: '19.9%')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _StatTile(label: 'Active', value: '2')),
              ],
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // Engagement chart
            Text('Engagement Trend', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingMd),
            Container(
              height: 180,
              padding: const EdgeInsets.all(SocelleTheme.spacingMd),
              decoration: BoxDecoration(
                color: SocelleTheme.surfaceElevated,
                borderRadius: SocelleTheme.borderRadiusMd,
                border: Border.all(color: SocelleTheme.borderLight),
              ),
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: const [
                        FlSpot(0, 8), FlSpot(1, 12), FlSpot(2, 10), FlSpot(3, 15),
                        FlSpot(4, 18), FlSpot(5, 14), FlSpot(6, 20),
                      ],
                      isCurved: true,
                      color: SocelleTheme.accent,
                      barWidth: 2,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: SocelleTheme.accent.withValues(alpha: 0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            Text('Campaigns', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingMd),

            ..._demoCampaigns.map((campaign) => Padding(
              padding: const EdgeInsets.only(bottom: SocelleTheme.spacingMd),
              child: GestureDetector(
                onTap: () => context.push('/marketing/campaign/${campaign['id']}'),
                child: Container(
                  padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                  decoration: BoxDecoration(
                    color: SocelleTheme.surfaceElevated,
                    borderRadius: SocelleTheme.borderRadiusMd,
                    border: Border.all(color: SocelleTheme.borderLight),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: SocelleTheme.accentLight,
                          borderRadius: SocelleTheme.borderRadiusSm,
                        ),
                        child: Icon(
                          campaign['type'] == 'Email' ? Icons.email_outlined
                              : campaign['type'] == 'SMS' ? Icons.sms_outlined
                              : campaign['type'] == 'Automation' ? Icons.auto_awesome_outlined
                              : Icons.share_outlined,
                          color: SocelleTheme.accent,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: SocelleTheme.spacingMd),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(campaign['name'] as String, style: SocelleTheme.titleSmall),
                            Text(
                              '${campaign['type']}  |  ${campaign['reach']} reach',
                              style: SocelleTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      _CampaignStatus(status: campaign['status'] as String),
                    ],
                  ),
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});
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
          Text(value, style: SocelleTheme.titleLarge),
          const SizedBox(height: 2),
          Text(label, style: SocelleTheme.bodySmall),
        ],
      ),
    );
  }
}

class _CampaignStatus extends StatelessWidget {
  const _CampaignStatus({required this.status});
  final String status;

  Color get _color {
    switch (status) {
      case 'active': return SocelleTheme.signalUp;
      case 'completed': return SocelleTheme.textMuted;
      case 'draft': return SocelleTheme.signalWarn;
      default: return SocelleTheme.textFaint;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.1),
        borderRadius: SocelleTheme.borderRadiusPill,
      ),
      child: Text(
        status.toUpperCase(),
        style: SocelleTheme.labelSmall.copyWith(color: _color, fontWeight: FontWeight.w600),
      ),
    );
  }
}
