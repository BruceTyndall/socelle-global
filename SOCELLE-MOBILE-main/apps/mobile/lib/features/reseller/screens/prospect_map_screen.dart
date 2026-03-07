import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Prospect map screen — territory view with prospect locations.
///
/// DEMO surface. Map integration pending.
class ProspectMapScreen extends StatelessWidget {
  const ProspectMapScreen({super.key});

  static const _demoProspects = [
    {'name': 'Glow Aesthetics', 'address': '123 Main St, Austin, TX', 'status': 'warm', 'last_contact': '2 days ago'},
    {'name': 'Pure Skin Studio', 'address': '456 Oak Ave, Austin, TX', 'status': 'hot', 'last_contact': 'Today'},
    {'name': 'Radiance Med Spa', 'address': '789 Elm Dr, Round Rock, TX', 'status': 'cold', 'last_contact': '2 weeks ago'},
    {'name': 'Beauty Bar ATX', 'address': '321 Pine St, Austin, TX', 'status': 'warm', 'last_contact': '5 days ago'},
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
            const Text('Prospect Map'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: Column(
        children: [
          // Map placeholder
          Container(
            height: 200,
            width: double.infinity,
            color: SocelleTheme.warmIvory,
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.map_outlined, size: 48, color: SocelleTheme.textFaint),
                  const SizedBox(height: SocelleTheme.spacingSm),
                  Text('Map view coming soon', style: SocelleTheme.bodyMedium),
                ],
              ),
            ),
          ),

          // Prospect list
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(SocelleTheme.spacingMd),
              itemCount: _demoProspects.length,
              separatorBuilder: (_, __) => const SizedBox(height: SocelleTheme.spacingSm),
              itemBuilder: (context, index) {
                final prospect = _demoProspects[index];
                final statusColor = prospect['status'] == 'hot'
                    ? SocelleTheme.signalDown
                    : prospect['status'] == 'warm'
                        ? SocelleTheme.signalWarn
                        : SocelleTheme.textFaint;

                return Container(
                  padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                  decoration: BoxDecoration(
                    color: SocelleTheme.surfaceElevated,
                    borderRadius: SocelleTheme.borderRadiusMd,
                    border: Border.all(color: SocelleTheme.borderLight),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: statusColor,
                        ),
                      ),
                      const SizedBox(width: SocelleTheme.spacingMd),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(prospect['name'] as String, style: SocelleTheme.titleSmall),
                            Text(prospect['address'] as String, style: SocelleTheme.bodySmall),
                          ],
                        ),
                      ),
                      Text(prospect['last_contact'] as String, style: SocelleTheme.bodySmall),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
