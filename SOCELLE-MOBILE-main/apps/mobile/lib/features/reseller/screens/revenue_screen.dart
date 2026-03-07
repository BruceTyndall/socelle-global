import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Revenue breakdown screen — commission details by account.
///
/// DEMO surface.
class RevenueScreen extends StatelessWidget {
  const RevenueScreen({super.key});

  static const _demoRevenue = [
    {'account': 'Glow Aesthetics', 'orders': 12, 'revenue': 4800, 'commission': 720},
    {'account': 'Pure Skin Studio', 'orders': 8, 'revenue': 3200, 'commission': 480},
    {'account': 'Radiance Med Spa', 'orders': 15, 'revenue': 6500, 'commission': 975},
    {'account': 'Beauty Bar ATX', 'orders': 6, 'revenue': 2400, 'commission': 360},
    {'account': 'Skin Health Co', 'orders': 10, 'revenue': 4200, 'commission': 630},
  ];

  @override
  Widget build(BuildContext context) {
    final totalCommission = _demoRevenue.fold<int>(0, (sum, r) => sum + (r['commission'] as int));

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
            const Text('Revenue'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(SocelleTheme.spacingLg),
        children: [
          // Total commission
          Container(
            padding: const EdgeInsets.all(SocelleTheme.spacingLg),
            decoration: BoxDecoration(
              color: SocelleTheme.surfaceElevated,
              borderRadius: SocelleTheme.borderRadiusMd,
              border: Border.all(color: SocelleTheme.borderLight),
            ),
            child: Column(
              children: [
                Text('Total Commission', style: SocelleTheme.labelMedium),
                Text('\$$totalCommission', style: SocelleTheme.displayMedium.copyWith(color: SocelleTheme.signalUp)),
                Text('Across ${_demoRevenue.length} accounts', style: SocelleTheme.bodySmall),
              ],
            ),
          ),

          const SizedBox(height: SocelleTheme.spacingLg),
          Text('By Account', style: SocelleTheme.titleMedium),
          const SizedBox(height: SocelleTheme.spacingMd),

          ..._demoRevenue.map((r) => Padding(
            padding: const EdgeInsets.only(bottom: SocelleTheme.spacingMd),
            child: Container(
              padding: const EdgeInsets.all(SocelleTheme.spacingMd),
              decoration: BoxDecoration(
                color: SocelleTheme.surfaceElevated,
                borderRadius: SocelleTheme.borderRadiusMd,
                border: Border.all(color: SocelleTheme.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(r['account'] as String, style: SocelleTheme.titleSmall),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${r['orders']} orders', style: SocelleTheme.bodySmall),
                      Text('Revenue: \$${r['revenue']}', style: SocelleTheme.bodySmall),
                      Text('\$${r['commission']}', style: SocelleTheme.titleSmall.copyWith(color: SocelleTheme.signalUp)),
                    ],
                  ),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  LinearProgressIndicator(
                    value: (r['commission'] as int) / 1000,
                    backgroundColor: SocelleTheme.borderLight,
                    color: SocelleTheme.accent,
                    minHeight: 4,
                    borderRadius: SocelleTheme.borderRadiusPill,
                  ),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }
}
