import 'package:flutter/material.dart';

import '../../../core/theme/socelle_colors.dart';
import '../../../core/widgets/sf_widgets.dart';

class ProviderProfileStep extends StatelessWidget {
  const ProviderProfileStep({
    super.key,
    required this.selectedProviderType,
    required this.selectedGrowthGoal,
    required this.onProviderTypeChanged,
    required this.onGrowthGoalChanged,
  });

  final String selectedProviderType;
  final String selectedGrowthGoal;
  final ValueChanged<String> onProviderTypeChanged;
  final ValueChanged<String> onGrowthGoalChanged;

  static const providerTypes = <_ProviderTypeOption>[
    _ProviderTypeOption(
        'hair_stylist', 'Hair Stylist', Icons.content_cut_rounded),
    _ProviderTypeOption('barber', 'Barber', Icons.face_rounded),
    _ProviderTypeOption('nail_tech', 'Nail Tech', Icons.spa_rounded),
    _ProviderTypeOption(
        'esthetician', 'Esthetician', Icons.auto_fix_high_rounded),
    _ProviderTypeOption(
        'massage_therapist', 'Massage', Icons.self_improvement_rounded),
    _ProviderTypeOption('tattoo_artist', 'Tattoo Artist', Icons.brush_rounded),
    _ProviderTypeOption('brow_lash', 'Brow/Lash', Icons.visibility_rounded),
    _ProviderTypeOption('other', 'Other Service', Icons.work_outline_rounded),
  ];

  static const growthGoals = <_GrowthGoalOption>[
    _GrowthGoalOption(
      'fill_gaps',
      'Fill empty slots fast',
      'Same-day fills and fewer idle hours.',
      Icons.bolt_rounded,
    ),
    _GrowthGoalOption(
      'raise_ticket',
      'Raise average ticket',
      'Prioritize premium services and bundles.',
      Icons.trending_up_rounded,
    ),
    _GrowthGoalOption(
      'reduce_no_shows',
      'Reduce no-shows',
      'Protect schedule with better timing and outreach.',
      Icons.event_available_rounded,
    ),
    _GrowthGoalOption(
      'team_collab',
      'Improve team collaboration',
      'Shared priorities for front desk + providers.',
      Icons.groups_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 30),
          Text(
            'Set your business profile',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 10),
          Text(
            'We customize AI plays, matching ideas, and workflows based on your service type.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 18),
          Text(
            'Service type',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: providerTypes.map((option) {
              return SfChip(
                key: ValueKey(option.key),
                label: option.label,
                selected: option.key == selectedProviderType,
                onTap: () => onProviderTypeChanged(option.key),
                icon: option.icon,
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          Text(
            'Primary goal',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: ListView.separated(
              itemCount: growthGoals.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final goal = growthGoals[index];
                final selected = goal.key == selectedGrowthGoal;
                return SfCard(
                  onTap: () => onGrowthGoalChanged(goal.key),
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          color: selected
                              ? SocelleColors.glamPlum
                              : SocelleColors.surface,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          goal.icon,
                          size: 16,
                          color: selected
                              ? Colors.white
                              : SocelleColors.textMuted,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              goal.title,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              goal.subtitle,
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: SocelleColors.textSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                          ],
                        ),
                      ),
                      if (selected)
                        const Icon(
                          Icons.check_circle_rounded,
                          color: SocelleColors.glamPlum,
                          size: 20,
                        ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _ProviderTypeOption {
  const _ProviderTypeOption(this.key, this.label, this.icon);

  final String key;
  final String label;
  final IconData icon;
}

class _GrowthGoalOption {
  const _GrowthGoalOption(this.key, this.title, this.subtitle, this.icon);

  final String key;
  final String title;
  final String subtitle;
  final IconData icon;
}
