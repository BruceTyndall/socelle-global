import 'package:flutter/material.dart';

import '../../core/theme/socelle_colors.dart';

/// One-question exit survey shown via [show].
/// Returns the selected reason string or null if dismissed.
class ExitSurveySheet extends StatefulWidget {
  const ExitSurveySheet({super.key});

  /// Shows the bottom sheet and returns the reason string (or null).
  static Future<String?> show(BuildContext context) {
    return showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const ExitSurveySheet(),
    );
  }

  @override
  State<ExitSurveySheet> createState() => _ExitSurveySheetState();
}

class _ExitSurveySheetState extends State<ExitSurveySheet> {
  String? _selected;

  static const _options = [
    _SurveyOption(
      id: 'not_using_consistently',
      label: 'I\'m not using it consistently',
      icon: Icons.schedule_rounded,
    ),
    _SurveyOption(
      id: 'didnt_see_results',
      label: 'I didn\'t see results',
      icon: Icons.trending_down_rounded,
    ),
    _SurveyOption(
      id: 'too_expensive',
      label: 'It\'s too expensive right now',
      icon: Icons.attach_money_rounded,
    ),
    _SurveyOption(
      id: 'switched_tool',
      label: 'I switched to a different tool',
      icon: Icons.swap_horiz_rounded,
    ),
    _SurveyOption(
      id: 'something_else',
      label: 'Something else',
      icon: Icons.more_horiz_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: SocelleColors.surfaceSoft,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(
        20,
        16,
        20,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: SocelleColors.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'What\'s the main reason you\'re cancelling?',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 16),

          for (final option in _options)
            _OptionTile(
              option: option,
              selected: _selected == option.id,
              onTap: () => setState(() => _selected = option.id),
            ),

          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _selected != null
                  ? () => Navigator.pop(context, _selected)
                  : null,
              child: const Text('Submit'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SurveyOption {
  const _SurveyOption({
    required this.id,
    required this.label,
    required this.icon,
  });

  final String id;
  final String label;
  final IconData icon;
}

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.option,
    required this.selected,
    required this.onTap,
  });

  final _SurveyOption option;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: selected
              ? SocelleColors.primary.withValues(alpha: 0.08)
              : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected
                ? SocelleColors.primary
                : SocelleColors.divider,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              option.icon,
              size: 20,
              color: selected
                  ? SocelleColors.primaryDark
                  : SocelleColors.textMuted,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                option.label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight:
                          selected ? FontWeight.w700 : FontWeight.w500,
                      color: selected
                          ? SocelleColors.textPrimary
                          : SocelleColors.textSecondary,
                    ),
              ),
            ),
            if (selected)
              const Icon(
                Icons.check_circle_rounded,
                size: 18,
                color: SocelleColors.primary,
              ),
          ],
        ),
      ),
    );
  }
}
