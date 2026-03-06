import 'package:flutter/material.dart';

import '../../../core/theme/socelle_colors.dart';

class CalendarConnectionCard extends StatelessWidget {
  const CalendarConnectionCard({
    super.key,
    required this.isConnected,
    required this.onConnect,
    required this.onDisconnect,
  });

  final bool isConnected;
  final VoidCallback onConnect;
  final VoidCallback onDisconnect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SocelleColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SocelleColors.divider),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isConnected
                  ? SocelleColors.recoveredGreenLight
                  : SocelleColors.surface,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.calendar_month_rounded,
              color: isConnected
                  ? SocelleColors.recoveredGreen
                  : SocelleColors.textMuted,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Google Calendar',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: SocelleColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isConnected
                            ? SocelleColors.recoveredGreen
                            : SocelleColors.textMuted,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      isConnected ? 'Connected' : 'Not connected',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: isConnected
                                ? SocelleColors.recoveredGreen
                                : SocelleColors.textMuted,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (isConnected)
            TextButton(
              onPressed: onDisconnect,
              style: TextButton.styleFrom(
                foregroundColor: SocelleColors.leakageRed,
              ),
              child: const Text('Disconnect'),
            )
          else
            FilledButton.tonal(
              onPressed: onConnect,
              style: FilledButton.styleFrom(
                minimumSize: const Size(88, 44),
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 8),
              ),
              child: const Text('Connect'),
            ),
        ],
      ),
    );
  }
}
