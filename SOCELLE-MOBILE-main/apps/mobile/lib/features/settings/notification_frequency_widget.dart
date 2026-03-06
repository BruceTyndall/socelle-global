import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/socelle_colors.dart';
import '../../models/notification_state.dart';
import '../../providers/user_settings_provider.dart';

/// Notification frequency selector — 3 options per the blueprint.
/// Standard (default) / Focused / Weekly Digest.
/// Shown in Settings after Calendar section.
class NotificationFrequencyWidget extends ConsumerStatefulWidget {
  const NotificationFrequencyWidget({super.key});

  @override
  ConsumerState<NotificationFrequencyWidget> createState() =>
      _NotificationFrequencyWidgetState();
}

class _NotificationFrequencyWidgetState
    extends ConsumerState<NotificationFrequencyWidget> {
  NotificationFrequency _selected = NotificationFrequency.standard;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final storage = ref.read(settingsStorageProvider);
    final freq = await storage.getNotificationFrequency();
    if (mounted) {
      setState(() {
        _selected = freq;
        _loading = false;
      });
    }
  }

  Future<void> _select(NotificationFrequency freq) async {
    if (freq == _selected) return;
    setState(() => _selected = freq);

    final storage = ref.read(settingsStorageProvider);
    await storage.saveNotificationFrequency(freq);

    // Sync to Firestore notification_state via Cloud Function
    try {
      await FirebaseFunctions.instance
          .httpsCallable('updateNotificationFrequency')
          .call({'frequency': freq.toApiString()});
    } catch (_) {
      // Non-critical — local setting already saved
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SocelleColors.cardBackground,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SocelleColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final option in NotificationFrequency.values)
            _FrequencyOption(
              frequency: option,
              selected: _selected == option,
              onTap: () => _select(option),
            ),
        ],
      ),
    );
  }
}

class _FrequencyOption extends StatelessWidget {
  const _FrequencyOption({
    required this.frequency,
    required this.selected,
    required this.onTap,
  });

  final NotificationFrequency frequency;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Icon(
              selected
                  ? Icons.radio_button_checked_rounded
                  : Icons.radio_button_off_rounded,
              size: 20,
              color: selected
                  ? SocelleColors.primary
                  : SocelleColors.textMuted,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    frequency.displayLabel,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: selected
                              ? SocelleColors.textPrimary
                              : SocelleColors.textSecondary,
                        ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    frequency.displayDescription,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SocelleColors.textMuted,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
