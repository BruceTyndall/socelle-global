import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Sales pipeline screen — kanban-style deal stages.
///
/// DEMO surface.
class PipelineScreen extends StatelessWidget {
  const PipelineScreen({super.key});

  static const _stages = [
    {'name': 'Lead', 'deals': [
      {'id': 'd1', 'name': 'Glow Spa — Premium Package', 'value': 2400, 'contact': 'Lisa Park'},
      {'id': 'd2', 'name': 'Radiance Clinic — LED Setup', 'value': 1800, 'contact': 'Dr. Kim'},
    ]},
    {'name': 'Proposal', 'deals': [
      {'id': 'd3', 'name': 'Beauty Bar — Monthly Supply', 'value': 960, 'contact': 'Anna Lee'},
    ]},
    {'name': 'Negotiation', 'deals': [
      {'id': 'd4', 'name': 'Skin Studio — Annual Contract', 'value': 8500, 'contact': 'Maya Johnson'},
    ]},
    {'name': 'Closed Won', 'deals': [
      {'id': 'd5', 'name': 'DermaSpa — Starter Kit', 'value': 1200, 'contact': 'Sarah Chen'},
    ]},
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
            const Text('Pipeline'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(SocelleTheme.spacingMd),
        itemCount: _stages.length,
        itemBuilder: (context, stageIndex) {
          final stage = _stages[stageIndex];
          final deals = stage['deals'] as List<Map<String, dynamic>>;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: SocelleTheme.spacingSm),
                child: Row(
                  children: [
                    Text(stage['name'] as String, style: SocelleTheme.titleMedium),
                    const SizedBox(width: SocelleTheme.spacingSm),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: SocelleTheme.accentLight,
                        borderRadius: SocelleTheme.borderRadiusPill,
                      ),
                      child: Text('${deals.length}', style: SocelleTheme.labelSmall.copyWith(color: SocelleTheme.accent)),
                    ),
                  ],
                ),
              ),
              ...deals.map((deal) => Padding(
                padding: const EdgeInsets.only(bottom: SocelleTheme.spacingSm),
                child: GestureDetector(
                  onTap: () => context.push('/sales/deal/${deal['id']}'),
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
                        Text(deal['name'] as String, style: SocelleTheme.titleSmall),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(deal['contact'] as String, style: SocelleTheme.bodySmall),
                            Text('\$${deal['value']}', style: SocelleTheme.titleSmall.copyWith(color: SocelleTheme.signalUp)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              )),
              if (stageIndex < _stages.length - 1) const Divider(height: SocelleTheme.spacingLg),
            ],
          );
        },
      ),
    );
  }
}
