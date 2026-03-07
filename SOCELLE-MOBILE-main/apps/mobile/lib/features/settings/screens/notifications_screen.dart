import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/demo_badge.dart';

/// Notifications settings screen — manage push notification preferences.
///
/// DEMO surface.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _marketIntelligence = true;
  bool _appointments = true;
  bool _orders = true;
  bool _education = false;
  bool _marketing = false;
  bool _promotions = true;

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
            const Text('Notifications'),
            const SizedBox(width: SocelleTheme.spacingSm),
            const DemoBadge(compact: true),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(SocelleTheme.spacingLg),
        children: [
          Text('Intelligence', style: SocelleTheme.labelMedium),
          const SizedBox(height: SocelleTheme.spacingSm),
          _NotificationToggle(
            title: 'Market Intelligence',
            subtitle: 'New market signals and trend alerts',
            value: _marketIntelligence,
            onChanged: (v) => setState(() => _marketIntelligence = v),
          ),

          const SizedBox(height: SocelleTheme.spacingLg),

          Text('Operations', style: SocelleTheme.labelMedium),
          const SizedBox(height: SocelleTheme.spacingSm),
          _NotificationToggle(
            title: 'Appointments',
            subtitle: 'Booking confirmations and reminders',
            value: _appointments,
            onChanged: (v) => setState(() => _appointments = v),
          ),
          _NotificationToggle(
            title: 'Orders',
            subtitle: 'Order status updates and shipping',
            value: _orders,
            onChanged: (v) => setState(() => _orders = v),
          ),

          const SizedBox(height: SocelleTheme.spacingLg),

          Text('Learning', style: SocelleTheme.labelMedium),
          const SizedBox(height: SocelleTheme.spacingSm),
          _NotificationToggle(
            title: 'Education Updates',
            subtitle: 'New courses and training modules',
            value: _education,
            onChanged: (v) => setState(() => _education = v),
          ),

          const SizedBox(height: SocelleTheme.spacingLg),

          Text('Marketing', style: SocelleTheme.labelMedium),
          const SizedBox(height: SocelleTheme.spacingSm),
          _NotificationToggle(
            title: 'Campaign Alerts',
            subtitle: 'Campaign performance notifications',
            value: _marketing,
            onChanged: (v) => setState(() => _marketing = v),
          ),
          _NotificationToggle(
            title: 'Promotions',
            subtitle: 'Special offers and discounts',
            value: _promotions,
            onChanged: (v) => setState(() => _promotions = v),
          ),
        ],
      ),
    );
  }
}

class _NotificationToggle extends StatelessWidget {
  const _NotificationToggle({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: SocelleTheme.spacingSm),
      padding: const EdgeInsets.symmetric(
        horizontal: SocelleTheme.spacingMd,
        vertical: SocelleTheme.spacingSm,
      ),
      decoration: BoxDecoration(
        color: SocelleTheme.surfaceElevated,
        borderRadius: SocelleTheme.borderRadiusMd,
        border: Border.all(color: SocelleTheme.borderLight),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: SocelleTheme.titleSmall),
                Text(subtitle, style: SocelleTheme.bodySmall),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            onChanged: onChanged,
            activeColor: SocelleTheme.accent,
          ),
        ],
      ),
    );
  }
}
