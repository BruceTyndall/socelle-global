import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Sales dashboard — revenue overview, pipeline summary, and KPIs.
///
/// DEMO surface.
class SalesDashboardScreen extends ConsumerWidget {
  const SalesDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
            const Text('Sales'),
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
            // Revenue card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(SocelleTheme.spacingLg),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [SocelleTheme.graphite, SocelleTheme.mnDark],
                ),
                borderRadius: SocelleTheme.borderRadiusLg,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Revenue This Month', style: SocelleTheme.labelMedium.copyWith(color: SocelleTheme.pearlWhite.withValues(alpha: 0.7))),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text('\$12,480', style: SocelleTheme.displayLarge.copyWith(color: SocelleTheme.pearlWhite)),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Row(
                    children: [
                      Icon(Icons.trending_up_rounded, size: 16, color: SocelleTheme.signalUp),
                      const SizedBox(width: 4),
                      Text('+8.3% vs last month', style: SocelleTheme.bodySmall.copyWith(color: SocelleTheme.signalUp)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // Chart
            Text('Weekly Revenue', style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingMd),
            Container(
              height: 200,
              padding: const EdgeInsets.all(SocelleTheme.spacingMd),
              decoration: BoxDecoration(
                color: SocelleTheme.surfaceElevated,
                borderRadius: SocelleTheme.borderRadiusMd,
                border: Border.all(color: SocelleTheme.borderLight),
              ),
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: 4000,
                  barGroups: [
                    _bar(0, 2800), _bar(1, 3200), _bar(2, 2400),
                    _bar(3, 3600), _bar(4, 3100), _bar(5, 2900), _bar(6, 1800),
                  ],
                  titlesData: FlTitlesData(
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, _) {
                          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                          return Text(days[value.toInt()], style: SocelleTheme.labelSmall);
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  gridData: const FlGridData(show: false),
                ),
              ),
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // KPIs
            Row(
              children: [
                Expanded(child: _KpiCard(label: 'Avg Ticket', value: '\$185')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _KpiCard(label: 'Conversion', value: '34%')),
                const SizedBox(width: SocelleTheme.spacingMd),
                Expanded(child: _KpiCard(label: 'Pipeline', value: '\$8.2K')),
              ],
            ),

            const SizedBox(height: SocelleTheme.spacingLg),

            // Quick actions
            Material(
              color: SocelleTheme.surfaceElevated,
              borderRadius: SocelleTheme.borderRadiusMd,
              child: InkWell(
                borderRadius: SocelleTheme.borderRadiusMd,
                onTap: () => context.push('/sales/pipeline'),
                child: Container(
                  padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                  decoration: BoxDecoration(
                    borderRadius: SocelleTheme.borderRadiusMd,
                    border: Border.all(color: SocelleTheme.borderLight),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.view_kanban_outlined, color: SocelleTheme.accent),
                      const SizedBox(width: SocelleTheme.spacingMd),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Sales Pipeline', style: SocelleTheme.titleSmall),
                            Text('View and manage your deals', style: SocelleTheme.bodySmall),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right_rounded, color: SocelleTheme.textFaint),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  BarChartGroupData _bar(int x, double y) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: SocelleTheme.accent,
          width: 16,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
        ),
      ],
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({required this.label, required this.value});
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
