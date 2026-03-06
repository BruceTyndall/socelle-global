import 'package:flutter/material.dart';
import '../../services/supabase_client.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../../core/theme/socelle_colors.dart';
import '../../core/widgets/main_navigation_drawer.dart';
import '../../models/user_settings.dart';
import '../../providers/google_connection_provider.dart';
import '../../providers/navigation_provider.dart';
import '../../providers/subscription_provider.dart';
import '../../providers/user_settings_provider.dart';
import '../paywall/paywall_page.dart';
import '../support/support_page.dart';
import 'cancel_intercept_page.dart';
import 'widgets/booking_value_editor.dart';
import 'widgets/calendar_connection_card.dart';
import 'widgets/slot_duration_editor.dart';
import 'widgets/working_hours_editor.dart';

final referralCodeProvider = FutureProvider<String>((ref) async {
  final storage = ref.read(settingsStorageProvider);
  final existing = await storage.getReferralCode();
  if (existing != null && existing.trim().isNotEmpty) return existing;

  final uid = SocelleSupabaseClient.isInitialized
      ? SocelleSupabaseClient.client.auth.currentUser?.id ?? 'socelle'
      : 'socelle';
  final cleaned = uid.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
  final suffix = cleaned.length >= 6
      ? cleaned.substring(cleaned.length - 6)
      : cleaned.padRight(6, 'X');
  final code = 'SOCL-$suffix';
  await storage.setReferralCode(code);
  return code;
});

class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings =
        ref.watch(userSettingsProvider).valueOrNull ?? UserSettings.defaults();
    final subscription = ref.watch(subscriptionProvider).valueOrNull;
    final googleConnected =
        ref.watch(googleConnectionProvider).valueOrNull ?? false;
    final calendarSource = settings.calendarSource;
    final referralCode =
        ref.watch(referralCodeProvider).valueOrNull ?? 'SOCL-XXXXXX';

    return Scaffold(
      backgroundColor: SocelleColors.background,
      drawer: const MainNavigationDrawer(),
      appBar: AppBar(
        title: const Text('Settings'),
        centerTitle: false,
      ),
      body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 26),
            children: [
              _SettingsHero(
                avgBookingValue: settings.avgBookingValue,
                enabledDays:
                    settings.workingHours.values.where((d) => d.enabled).length,
                calendarSource: calendarSource,
                subscriptionLabel: subscription != null
                    ? _subscriptionLabel(subscription)
                    : 'Free',
                providerType: settings.providerType,
                growthGoal: settings.growthGoal,
              ),
              const SizedBox(height: 18),
              const _SectionHeader(
                title: 'Booking Settings',
                icon: Icons.sell_rounded,
              ),
              const SizedBox(height: 8),
              BookingValueEditor(
                value: settings.avgBookingValue,
                onChanged: (v) => ref
                    .read(userSettingsProvider.notifier)
                    .updateBookingValue(v),
              ),
              const SizedBox(height: 8),
              SlotDurationEditor(
                selectedMinutes: settings.slotDurationMinutes,
                onChanged: (v) => ref
                    .read(userSettingsProvider.notifier)
                    .updateSlotDuration(v),
              ),
              const SizedBox(height: 22),
              const _SectionHeader(
                title: 'Working Hours',
                icon: Icons.schedule_rounded,
              ),
              const SizedBox(height: 8),
              WorkingHoursEditor(
                workingHours: settings.workingHours,
                onDayToggled: (day) {
                  final current = settings.workingHours[day]!;
                  ref.read(userSettingsProvider.notifier).updateWorkingDay(
                        day,
                        WorkingDay(
                          enabled: !current.enabled,
                          start: current.start ?? '09:00',
                          end: current.end ?? '17:00',
                        ),
                      );
                },
                onTimeChanged: (day, isStart, time) {
                  final current = settings.workingHours[day]!;
                  ref.read(userSettingsProvider.notifier).updateWorkingDay(
                        day,
                        WorkingDay(
                          enabled: current.enabled,
                          start: isStart ? time : current.start,
                          end: isStart ? current.end : time,
                        ),
                      );
                },
              ),
              const SizedBox(height: 22),
              const _SectionHeader(
                title: 'Calendar',
                icon: Icons.calendar_month_rounded,
              ),
              const SizedBox(height: 8),
              _CalendarSourceSelector(
                selectedSource: calendarSource,
                onSourceChanged: (source) => ref
                    .read(userSettingsProvider.notifier)
                    .updateCalendarSource(source),
              ),
              const SizedBox(height: 10),
              if (calendarSource == 'google')
                CalendarConnectionCard(
                  isConnected: googleConnected,
                  onConnect: () => _showConnectDialog(context, ref),
                  onDisconnect: () async {
                    await ref
                        .read(googleConnectionProvider.notifier)
                        .disconnect();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Google disconnected.')),
                      );
                    }
                  },
                )
              else
                const _AppleSyncCard(),
              const SizedBox(height: 22),
              const _SectionHeader(
                title: 'Account',
                icon: Icons.person_outline_rounded,
              ),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.star_rounded,
                title: 'Subscription',
                subtitle: subscription != null
                    ? _subscriptionLabel(subscription)
                    : 'Free',
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const PaywallPage(weeklyLeakage: 0),
                    ),
                  );
                },
              ),
              if (subscription != null &&
                  (subscription.isActive || subscription.isTrial)) ...[
                const SizedBox(height: 8),
                _SettingsTile(
                  icon: Icons.cancel_outlined,
                  title: 'Cancel Subscription',
                  textColor: SocelleColors.leakage,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const CancelInterceptPage(),
                      ),
                    );
                  },
                ),
              ],
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.help_outline_rounded,
                title: 'Support & Feedback',
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const SupportPage(),
                    ),
                  );
                },
              ),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.logout_rounded,
                title: 'Log Out',
                textColor: SocelleColors.leakage,
                onTap: () => _confirmLogOut(context, ref),
              ),
              const SizedBox(height: 22),
              const _SectionHeader(
                title: 'Growth & Referrals',
                icon: Icons.campaign_rounded,
              ),
              const SizedBox(height: 8),
              _ReferralGrowthCard(
                referralCode: referralCode,
              ),
              const SizedBox(height: 22),
              Center(
                child: Text(
                  'Socelle v0.1.0',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
    );
  }

  String _subscriptionLabel(dynamic sub) {
    if (sub.isTrial) {
      return 'Trial (${sub.trialDaysRemaining} days left)';
    }
    if (sub.isActive) return 'Active';
    return 'Free';
  }

  /// Starts the Google Sign-In OAuth flow and stores the resulting token.
  /// The provider's connect() method handles account selection and the
  /// backend auth code exchange — no UI dialog needed.
  Future<void> _showConnectDialog(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(googleConnectionProvider.notifier).connect();
      if (context.mounted) {
        final isConnected =
            ref.read(googleConnectionProvider).valueOrNull ?? false;
        if (isConnected) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Google Calendar connected!')),
          );
        }
        // If not connected, user cancelled — no snackbar needed.
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection failed: $e')),
        );
      }
    }
  }

  Future<void> _confirmLogOut(BuildContext context, WidgetRef ref) async {
    final shouldLogOut = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Log Out?'),
        content: const Text('You can sign back in any time from this device.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Log Out'),
          ),
        ],
      ),
    );

    if (shouldLogOut != true) return;

    try {
      if (SocelleSupabaseClient.isInitialized) {
        await SocelleSupabaseClient.client.auth.signOut();
        await SocelleSupabaseClient.client.auth.signInAnonymously();
      }
      ref.read(navigationIndexProvider.notifier).state = 0;

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Logged out.')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Logout failed: $e')),
        );
      }
    }
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.icon});

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: SocelleColors.ink),
        const SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                letterSpacing: 0.8,
                fontWeight: FontWeight.w700,
                color: SocelleColors.ink,
              ),
        ),
      ],
    );
  }
}

class _SettingsHero extends StatelessWidget {
  const _SettingsHero({
    required this.avgBookingValue,
    required this.enabledDays,
    required this.calendarSource,
    required this.subscriptionLabel,
    required this.providerType,
    required this.growthGoal,
  });

  final double avgBookingValue;
  final int enabledDays;
  final String calendarSource;
  final String subscriptionLabel;
  final String providerType;
  final String growthGoal;

  String _providerLabel() {
    return switch (providerType) {
      'hair_stylist' => 'Hair Stylist',
      'barber' => 'Barber',
      'nail_tech' => 'Nail Tech',
      'esthetician' => 'Esthetician',
      'massage_therapist' => 'Massage',
      'tattoo_artist' => 'Tattoo Artist',
      'brow_lash' => 'Brow/Lash',
      _ => 'Service Provider',
    };
  }

  String _goalLabel() {
    return switch (growthGoal) {
      'raise_ticket' => 'Raise Ticket',
      'reduce_no_shows' => 'Reduce No-Shows',
      'team_collab' => 'Team Collab',
      _ => 'Fill Gaps',
    };
  }

  @override
  Widget build(BuildContext context) {
    final money = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: SocelleColors.ink,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Recovery Profile',
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.4,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '${money.format(avgBookingValue)} avg booking',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            '$enabledDays active days · ${calendarSource == 'apple' ? 'Apple' : 'Google'} calendar · $subscriptionLabel',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.86),
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            '${_providerLabel()} · Goal: ${_goalLabel()}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.86),
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

class _CalendarSourceSelector extends StatelessWidget {
  const _CalendarSourceSelector({
    required this.selectedSource,
    required this.onSourceChanged,
  });

  final String selectedSource;
  final ValueChanged<String> onSourceChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SocelleColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SocelleColors.borderLight),
      ),
      child: Row(
        children: [
          Expanded(
            child: _SourcePill(
              label: 'Google',
              icon: Icons.calendar_month_rounded,
              selected: selectedSource == 'google',
              onTap: () => onSourceChanged('google'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _SourcePill(
              label: 'Apple',
              icon: Icons.phone_iphone_rounded,
              selected: selectedSource == 'apple',
              onTap: () => onSourceChanged('apple'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SourcePill extends StatelessWidget {
  const _SourcePill({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Ink(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
          decoration: BoxDecoration(
            color: selected
                ? SocelleColors.ink.withValues(alpha: 0.14)
                : SocelleColors.surfaceMuted,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color:
                  selected ? SocelleColors.ink : SocelleColors.borderLight,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 16,
                color: selected
                    ? SocelleColors.ink
                    : SocelleColors.inkFaint,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: selected
                          ? SocelleColors.ink
                          : SocelleColors.inkMuted,
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AppleSyncCard extends StatelessWidget {
  const _AppleSyncCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SocelleColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SocelleColors.borderLight),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: SocelleColors.leakageSurface,
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Icon(
              Icons.info_outline_rounded,
              size: 18,
              color: SocelleColors.leakage,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Apple Calendar mode is selected. Apple sync improvements are being finalized.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: SocelleColors.inkMuted,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.textColor,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Color? textColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: SocelleColors.surface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            border: Border.all(color: SocelleColors.borderLight),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(icon,
                  color: textColor ?? SocelleColors.inkMuted, size: 22),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        color: textColor ?? SocelleColors.ink,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (subtitle != null)
                      Text(
                        subtitle!,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded,
                  color: SocelleColors.inkFaint, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReferralGrowthCard extends StatelessWidget {
  const _ReferralGrowthCard({
    required this.referralCode,
  });

  final String referralCode;

  @override
  Widget build(BuildContext context) {
    final inviteText =
        'Use my Socelle invite code $referralCode to start recovering lost booking revenue.';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SocelleColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SocelleColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Invite another provider and grow your network.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SocelleColors.ink,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: SocelleColors.surfaceMuted,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: SocelleColors.borderLight),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.qr_code_2_rounded,
                  size: 18,
                  color: SocelleColors.ink,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    referralCode,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.6,
                        ),
                  ),
                ),
                TextButton(
                  onPressed: () async {
                    await Clipboard.setData(ClipboardData(text: referralCode));
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Referral code copied.')),
                    );
                  },
                  child: const Text('Copy'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: inviteText));
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Invite message copied. Share it anywhere.'),
                  ),
                );
              },
              icon: const Icon(Icons.campaign_rounded, size: 18),
              label: const Text('Copy Invite Message'),
            ),
          ),
        ],
      ),
    );
  }
}
