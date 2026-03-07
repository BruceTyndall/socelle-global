import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Reseller dashboard — territory overview, prospects, revenue.
///
/// DEMO surface.
class ResellerDashboardScreen extends StatelessWidget {
  const ResellerDashboardScreen({super.key});

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
            const Text('Reseller'),
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
            // Revenue summary
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(SocelleTheme.spacingLg),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [SocelleTheme.accent, SocelleTheme.graphite],
                ),
                borderRadius: SocelleTheme.borderRadiusLg,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Reseller Revenue', style: SocelleTheme.labelMedium.copyWith(color: SocelleTheme.pearlWhite.withValues(alpha: 0.7))),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text('\$24,680', style: SocelleTheme.displayLarge.copyWith(color: SocelleTheme.pearlWhite)),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text('YTD Commission  |  +12% vs last year', style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.signalUp)),
                ],
              ),
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // Territory stats
            Row(
              children: [
                Expanded(child: _StatCard(label: 'Active Accounts', value: '23')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _StatCard(label: 'Prospects', value: '8')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _StatCard(label: 'Reorders', value: '15')),
              ],
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // Commission chart
            Text('Monthly Commission', style: SocelleTheme.titleMedium),
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
                        FlSpot(0, 3200), FlSpot(1, 3800), FlSpot(2, 4100),
                        FlSpot(3, 3600), FlSpot(4, 4500), FlSpot(5, 5200),
                      ],
                      isCurved: true,
                      color: SocelleTheme.signalUp,
                      barWidth: 2.5,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: SocelleTheme.signalUp.withValues(alpha: 0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // Quick actions
            _ActionCard(
              icon: Icons.map_outlined,
              label: 'Prospect Map',
              subtitle: 'View territory and prospects',
              onTap: () => context.push('/reseller/prospects'),
            ),
            const SizedBox(height: SocelleTheme.spacingMd),
            _ActionCard(
              icon: Icons.attach_money_rounded,
              label: 'Revenue Breakdown',
              subtitle: 'Commission details by account',
              onTap: () => context.push('/reseller/revenue'),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});
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

class _ActionCard extends StatelessWidget {
  const _ActionCard({required this.icon, required this.label, required this.subtitle, required this.onTap});
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
              Icon(icon, color: SocelleTheme.accent),
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
