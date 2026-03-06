import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../../core/theme/slotforce_colors.dart';
import '../../models/sync_models.dart';
import '../../providers/navigation_provider.dart';
import '../../providers/streak_provider.dart';
import '../../providers/subscription_provider.dart';
import '../../providers/sync_provider.dart';
import '../../providers/user_settings_provider.dart';
import '../gap_action/gap_action_sheet.dart';
import '../paywall/paywall_page.dart';
import '../share/revenue_snapshot.dart';

class StudioPage extends ConsumerWidget {
  const StudioPage({super.key});

  Future<void> _runSync(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(syncResultProvider.notifier).refresh();
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sync failed. Try again in a minute.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncState = ref.watch(syncResultProvider);
    final result = syncState.valueOrNull;
    final recoveredRevenue =
        ref.watch(recoveredRevenueProvider).valueOrNull ?? 0.0;
    final streak = ref.watch(streakProvider).valueOrNull;
    final settings = ref.watch(userSettingsProvider).valueOrNull;
    final subscription = ref.watch(subscriptionProvider).valueOrNull;

    final gaps = result?.gaps ?? const <GapItem>[];
    final openGaps = gaps.where((g) => g.isOpen).toList()
      ..sort((a, b) => b.leakageValue.compareTo(a.leakageValue));

    final filledCount = gaps.where((g) => g.isFilled).length;
    final totalCount = gaps.length;
    final fillRate = totalCount == 0 ? 0.0 : (filledCount / totalCount);
    final weeklyLeakage = result?.currentWeekActiveLeakage() ?? 0.0;
    final monthlyLeakage = weeklyLeakage * 4.3;
    final weeklyOpenSlots = result?.currentWeekBookableSlots() ?? 0;
    final providerType = settings?.providerType ?? 'hair_stylist';
    final growthGoal = settings?.growthGoal ?? 'fill_gaps';

    return Scaffold(
      backgroundColor: SlotforceColors.surfaceSoft,
      appBar: AppBar(
        title: const Text('Studio'),
      ),
      body: RefreshIndicator(
        onRefresh: () => _runSync(context, ref),
        color: SlotforceColors.primary,
        child: Stack(
          children: [
            const _StudioAtmosphere(),
            ListView(
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 30),
              children: [
                _StudioHero(
                  monthlyLeakage: monthlyLeakage,
                  recoveredRevenue: recoveredRevenue,
                  fillRate: fillRate,
                ),
                const SizedBox(height: 10),
                _IdentityStrip(
                  providerType: providerType,
                  growthGoal: growthGoal,
                ),
                const SizedBox(height: 12),
                _LifestyleCampaignCard(
                  providerType: providerType,
                  growthGoal: growthGoal,
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _MetricTile(
                        label: 'Open this week',
                        value: '${result?.currentWeekGapCount() ?? 0}',
                        icon: Icons.bolt_rounded,
                        accent: SlotforceColors.accentCoral,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _MetricTile(
                        label: 'Slots to fill',
                        value: '$weeklyOpenSlots',
                        icon: Icons.event_available_rounded,
                        accent: SlotforceColors.accentSage,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _MetricTile(
                        label: 'Streak',
                        value: '${streak?.currentStreak ?? 0}w',
                        icon: Icons.local_fire_department_rounded,
                        accent: SlotforceColors.streakOrange,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _MomentumCard(
                  fillRate: fillRate,
                  monthlyLeakage: monthlyLeakage,
                  recoveredRevenue: recoveredRevenue,
                  avgBookingValue: settings?.avgBookingValue ?? 85,
                ),
                const SizedBox(height: 12),
                _ActionQueueCard(
                  topGaps: openGaps.take(3).toList(),
                  onTapGap: (gap) => GapActionSheet.show(context, ref, gap),
                  onSync: () => _runSync(context, ref),
                ),
                const SizedBox(height: 12),
                _AISpotlightCard(
                  topGaps: openGaps.take(2).toList(),
                  onTapGap: (gap) => GapActionSheet.show(context, ref, gap),
                  onSync: () => _runSync(context, ref),
                ),
                const SizedBox(height: 12),
                _BumpSignalCard(
                  hasOpenGaps: openGaps.isNotEmpty,
                  onGoDashboard: () {
                    ref.read(navigationIndexProvider.notifier).state = 0;
                  },
                ),
                const SizedBox(height: 12),
                _MatchLabCard(
                  providerType: providerType,
                  growthGoal: growthGoal,
                ),
                const SizedBox(height: 12),
                _ClientClubWallCard(
                  providerType: providerType,
                  growthGoal: growthGoal,
                ),
                const SizedBox(height: 12),
                _CollabTeaRoomCard(
                  openGaps: openGaps.take(3).toList(),
                  monthlyLeakage: monthlyLeakage,
                  recoveredRevenue: recoveredRevenue,
                ),
                const SizedBox(height: 12),
                _PowerMovesCard(
                  isPro: subscription?.isActive == true,
                  onOpenUpgrade: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) =>
                            PaywallPage(weeklyLeakage: weeklyLeakage),
                      ),
                    );
                  },
                ),
                if (syncState.isLoading) ...[
                  const SizedBox(height: 18),
                  const Center(
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StudioHero extends StatelessWidget {
  const _StudioHero({
    required this.monthlyLeakage,
    required this.recoveredRevenue,
    required this.fillRate,
  });

  final double monthlyLeakage;
  final double recoveredRevenue;
  final double fillRate;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final rescuePotential = (monthlyLeakage * 0.65).roundToDouble();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: SlotforceColors.glamHeroGradientColors,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: SlotforceColors.glamPlum.withValues(alpha: 0.24),
            blurRadius: 28,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Text(
              'Revenue Studio',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 11,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            currency.format(rescuePotential),
            style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: Colors.white,
                  fontSize: 44,
                ),
          ),
          Text(
            'is your likely rescue runway this month',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _HeroBadge(
                label: 'Recovered',
                value: currency.format(recoveredRevenue),
              ),
              const SizedBox(width: 8),
              _HeroBadge(
                label: 'Fill rate',
                value: '${(fillRate * 100).round()}%',
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroBadge extends StatelessWidget {
  const _HeroBadge({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.2),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.88),
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 3),
            Text(
              value,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _IdentityStrip extends StatelessWidget {
  const _IdentityStrip({
    required this.providerType,
    required this.growthGoal,
  });

  final String providerType;
  final String growthGoal;

  String _providerLabel() {
    return switch (providerType) {
      'hair_stylist' => 'Hair Stylist',
      'barber' => 'Barber',
      'nail_tech' => 'Nail Tech',
      'esthetician' => 'Esthetician',
      'massage_therapist' => 'Massage Therapist',
      'tattoo_artist' => 'Tattoo Artist',
      'brow_lash' => 'Brow/Lash Artist',
      _ => 'Service Provider',
    };
  }

  String _goalLabel() {
    return switch (growthGoal) {
      'raise_ticket' => 'Raise ticket',
      'reduce_no_shows' => 'Reduce no-shows',
      'team_collab' => 'Team collaboration',
      _ => 'Fill empty slots',
    };
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.tune_rounded,
            size: 16,
            color: SlotforceColors.primaryDark,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '${_providerLabel()} mode · Goal: ${_goalLabel()}',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: SlotforceColors.textSecondary,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LifestyleCampaignCard extends StatelessWidget {
  const _LifestyleCampaignCard({
    required this.providerType,
    required this.growthGoal,
  });

  final String providerType;
  final String growthGoal;

  String _hookLine() {
    return switch (providerType) {
      'barber' => 'Fresh fades, premium timing, zero dead air.',
      'nail_tech' => 'Polish + precision + packed book.',
      'esthetician' => 'Skin goals, premium cadence, loyal clients.',
      'massage_therapist' => 'Calm energy, filled schedule, steady flow.',
      'tattoo_artist' => 'Creative flow, planned drops, higher ticket.',
      'brow_lash' => 'Beauty rhythm, repeat clients, confident pricing.',
      _ => 'Creator energy with a fully loaded calendar.',
    };
  }

  String _ctaLabel() {
    return switch (growthGoal) {
      'raise_ticket' => 'Copy premium upgrade script',
      'reduce_no_shows' => 'Copy confirmation script',
      'team_collab' => 'Copy team huddle script',
      _ => 'Copy quick-fill script',
    };
  }

  String _script() {
    return switch (growthGoal) {
      'raise_ticket' =>
        'VIP opening this week: I can pair your service with an elevated add-on for a full glow-up result. Want first access?',
      'reduce_no_shows' =>
        'Friendly confirmation for your upcoming appointment. Reply YES to lock your time and I will prep everything for you.',
      'team_collab' =>
        'Team update: pushing today\'s priority slots first. Front desk handles outreach, providers flag upgrade opportunities.',
      _ =>
        'Quick opening alert: I just had a prime slot free up. Want me to reserve it for you before it posts publicly?',
    };
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: SlotforceColors.actionGradient,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: SlotforceColors.primaryDark.withValues(alpha: 0.2),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'Lifestyle Campaigns',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ),
              const Spacer(),
              Icon(
                Icons.bolt_rounded,
                color: Colors.white.withValues(alpha: 0.9),
                size: 18,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            _hookLine(),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Turn one empty slot into a branded client moment.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.86),
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: _script()));
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Campaign script copied. Paste it into your client chat.',
                    ),
                  ),
                );
              },
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white.withValues(alpha: 0.2),
                foregroundColor: Colors.white,
              ),
              icon: const Icon(Icons.content_copy_rounded, size: 16),
              label: Text(_ctaLabel()),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.accent,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: accent),
          const SizedBox(height: 10),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 1),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

class _MomentumCard extends StatelessWidget {
  const _MomentumCard({
    required this.fillRate,
    required this.monthlyLeakage,
    required this.recoveredRevenue,
    required this.avgBookingValue,
  });

  final double fillRate;
  final double monthlyLeakage;
  final double recoveredRevenue;
  final double avgBookingValue;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final bookingsSaved =
        avgBookingValue == 0 ? 0 : (recoveredRevenue / avgBookingValue).round();
    final remainingLeakage =
        (monthlyLeakage - recoveredRevenue).clamp(0, 999999);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withValues(alpha: 0.96),
            SlotforceColors.primaryLight.withValues(alpha: 0.16),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.primary.withValues(alpha: 0.18),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Momentum',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const Spacer(),
              Text(
                '${(fillRate * 100).round()}% filled',
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: SlotforceColors.primaryDark,
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 9,
              value: fillRate.clamp(0.0, 1.0),
              backgroundColor: SlotforceColors.divider,
              valueColor: const AlwaysStoppedAnimation(SlotforceColors.primary),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '$bookingsSaved bookings recovered so far. ${currency.format(remainingLeakage)} still on the table.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }
}

class _ActionQueueCard extends StatelessWidget {
  const _ActionQueueCard({
    required this.topGaps,
    required this.onTapGap,
    required this.onSync,
  });

  final List<GapItem> topGaps;
  final ValueChanged<GapItem> onTapGap;
  final VoidCallback onSync;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Action Queue',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const Spacer(),
              TextButton(
                onPressed: onSync,
                child: const Text('Refresh'),
              ),
            ],
          ),
          if (topGaps.isEmpty)
            Text(
              'No open gaps right now. Pull down to refresh and stay ready.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            )
          else
            ...topGaps.map(
              (gap) => Padding(
                padding: const EdgeInsets.only(top: 8),
                child: _ActionQueueTile(
                  gap: gap,
                  onTap: () => onTapGap(gap),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ActionQueueTile extends StatelessWidget {
  const _ActionQueueTile({
    required this.gap,
    required this.onTap,
  });

  final GapItem gap;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    DateTime? start;
    try {
      start = DateTime.parse(gap.startIso).toLocal();
    } catch (_) {
      start = null;
    }
    final timeLabel =
        start == null ? gap.dayOfWeek : DateFormat('EEE h:mm a').format(start);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: SlotforceColors.surfaceSoft,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: SlotforceColors.divider),
          ),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: SlotforceColors.accentCoral.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  color: SlotforceColors.glamPlum,
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      timeLabel,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: SlotforceColors.textPrimary,
                          ),
                    ),
                    Text(
                      '${currency.format(gap.leakageValue)} potential · ${gap.bookableSlots} slots',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: SlotforceColors.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AISpotlightCard extends StatelessWidget {
  const _AISpotlightCard({
    required this.topGaps,
    required this.onTapGap,
    required this.onSync,
  });

  final List<GapItem> topGaps;
  final ValueChanged<GapItem> onTapGap;
  final VoidCallback onSync;

  String _gapLabel(GapItem gap) {
    try {
      final start = DateTime.parse(gap.startIso).toLocal();
      return '${DateFormat.E().format(start)} ${DateFormat.jm().format(start)}';
    } catch (_) {
      return gap.dayOfWeek;
    }
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withValues(alpha: 0.95),
            SlotforceColors.glamPink.withValues(alpha: 0.12),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.glamPink.withValues(alpha: 0.28),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'AI Concierge',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: SlotforceColors.glamPlum.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'Live',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: SlotforceColors.glamPlum,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (topGaps.isEmpty)
            Text(
              'Run a sync and AI will drop your top recovery plays here.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: SlotforceColors.textSecondary,
                  ),
            )
          else
            ...topGaps.map(
              (gap) => Padding(
                padding: const EdgeInsets.only(top: 8),
                child: _AIMoveRow(
                  title: 'Hit ${_gapLabel(gap)} first',
                  subtitle: 'High-value slot with strong conversion urgency.',
                  impact: currency.format(gap.leakageValue),
                  onTap: () => onTapGap(gap),
                ),
              ),
            ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed:
                  topGaps.isEmpty ? onSync : () => onTapGap(topGaps.first),
              icon: const Icon(Icons.auto_awesome_rounded, size: 18),
              label: Text(
                topGaps.isEmpty ? 'Run Sync to Unlock AI' : 'Open AI Top Move',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AIMoveRow extends StatelessWidget {
  const _AIMoveRow({
    required this.title,
    required this.subtitle,
    required this.impact,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final String impact;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Ink(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.86),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: SlotforceColors.divider),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: SlotforceColors.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: SlotforceColors.recoveredGreenLight,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '+$impact',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SlotforceColors.recoveredGreenDark,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BumpSignalCard extends StatelessWidget {
  const _BumpSignalCard({
    required this.hasOpenGaps,
    required this.onGoDashboard,
  });

  final bool hasOpenGaps;
  final VoidCallback onGoDashboard;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.accentCoral.withValues(alpha: 0.22),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Bump Signal',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            hasOpenGaps
                ? 'Use bump in Dashboard -> Priority Radar or Gap Feed to pin urgent slots for the team.'
                : 'No live gaps yet. Sync first, then bump your hottest slots.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onGoDashboard,
              icon: const Icon(Icons.bolt_rounded, size: 18),
              label: const Text('Go to Dashboard Bumps'),
            ),
          ),
        ],
      ),
    );
  }
}

class _MatchLabCard extends StatefulWidget {
  const _MatchLabCard({
    required this.providerType,
    required this.growthGoal,
  });

  final String providerType;
  final String growthGoal;

  @override
  State<_MatchLabCard> createState() => _MatchLabCardState();
}

class _MatchLabCardState extends State<_MatchLabCard> {
  int _activeIndex = 0;
  late List<_MatchCandidate> _candidates;

  @override
  void initState() {
    super.initState();
    _candidates = _buildCandidates();
  }

  @override
  void didUpdateWidget(covariant _MatchLabCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.providerType != widget.providerType ||
        oldWidget.growthGoal != widget.growthGoal) {
      _candidates = _buildCandidates();
      _activeIndex = 0;
    }
  }

  List<_MatchCandidate> _buildCandidates() {
    final service = switch (widget.providerType) {
      'barber' => 'cut',
      'nail_tech' => 'set',
      'esthetician' => 'facial',
      'massage_therapist' => 'session',
      'tattoo_artist' => 'piece',
      'brow_lash' => 'set',
      _ => 'appointment',
    };

    final focusLine = switch (widget.growthGoal) {
      'raise_ticket' => 'Likely to book an add-on with this $service',
      'reduce_no_shows' => 'High reliability profile and quick responder',
      'team_collab' => 'Easy handoff candidate for team coverage',
      _ => 'Best fit to close your next open gap quickly',
    };

    return [
      _MatchCandidate(
        name: 'Taylor M.',
        intent: 'Last-minute regular',
        spendPotential: '\$165',
        confidence: 92,
        note: focusLine,
        tags: const ['Booked 6x', 'Opens promo texts', 'Nearby'],
      ),
      const _MatchCandidate(
        name: 'Jordan K.',
        intent: 'Upsell opportunity',
        spendPotential: '\$210',
        confidence: 88,
        note: 'Perfect timing for a premium upgrade bundle.',
        tags: ['High ticket', 'Weekend flexible', 'Rebooking risk'],
      ),
      const _MatchCandidate(
        name: 'Riley S.',
        intent: 'Retention save',
        spendPotential: '\$140',
        confidence: 84,
        note: 'Dormant client likely to return with a direct nudge.',
        tags: ['No visit in 5 weeks', 'Fast confirmations', 'Local'],
      ),
    ];
  }

  void _nextCandidate() {
    if (_candidates.isEmpty) return;
    setState(() {
      _activeIndex = (_activeIndex + 1) % _candidates.length;
    });
  }

  Future<void> _sendNudge() async {
    if (_candidates.isEmpty) return;
    final candidate = _candidates[_activeIndex];
    final pitch =
        'Hey ${candidate.name.split(' ').first}! I just opened a prime slot. Want first dibs?';

    await Clipboard.setData(ClipboardData(text: pitch));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Nudge copied for ${candidate.name}. Paste and send.'),
      ),
    );
    _nextCandidate();
  }

  @override
  Widget build(BuildContext context) {
    if (_candidates.isEmpty) return const SizedBox.shrink();
    final candidate = _candidates[_activeIndex];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withValues(alpha: 0.95),
            SlotforceColors.primaryLight.withValues(alpha: 0.2),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.primary.withValues(alpha: 0.24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Match Lab',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: SlotforceColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'Beta',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: SlotforceColors.primaryDark,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
              const Spacer(),
              Text(
                '${_activeIndex + 1}/${_candidates.length}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: SlotforceColors.textMuted,
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Swipe-style client matching for your next revenue move.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: SlotforceColors.divider),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor:
                          SlotforceColors.glamPink.withValues(alpha: 0.12),
                      child: Text(
                        candidate.name[0],
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  color: SlotforceColors.glamPlum,
                                  fontWeight: FontWeight.w800,
                                ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            candidate.name,
                            style:
                                Theme.of(context).textTheme.bodyLarge?.copyWith(
                                      fontWeight: FontWeight.w800,
                                    ),
                          ),
                          Text(
                            candidate.intent,
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: SlotforceColors.textSecondary,
                                      fontWeight: FontWeight.w600,
                                    ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: SlotforceColors.recoveredGreenLight,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '${candidate.confidence}%',
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: SlotforceColors.recoveredGreenDark,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  candidate.note,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SlotforceColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: candidate.tags
                      .map(
                        (tag) => Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: SlotforceColors.surfaceSoft,
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(color: SlotforceColors.divider),
                          ),
                          child: Text(
                            tag,
                            style: Theme.of(context)
                                .textTheme
                                .labelSmall
                                ?.copyWith(
                                  color: SlotforceColors.textSecondary,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _nextCandidate,
                        child: const Text('Pass'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: _sendNudge,
                        icon: const Icon(Icons.send_rounded, size: 16),
                        label: Text('Nudge ${candidate.spendPotential}'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MatchCandidate {
  const _MatchCandidate({
    required this.name,
    required this.intent,
    required this.spendPotential,
    required this.confidence,
    required this.note,
    required this.tags,
  });

  final String name;
  final String intent;
  final String spendPotential;
  final int confidence;
  final String note;
  final List<String> tags;
}

class _ClientClubWallCard extends StatelessWidget {
  const _ClientClubWallCard({
    required this.providerType,
    required this.growthGoal,
  });

  final String providerType;
  final String growthGoal;

  List<_ClientClubLane> _lanes() {
    final serviceWord = switch (providerType) {
      'barber' => 'cut',
      'nail_tech' => 'set',
      'esthetician' => 'facial',
      'massage_therapist' => 'session',
      'tattoo_artist' => 'appointment',
      'brow_lash' => 'set',
      _ => 'appointment',
    };

    final pushLine = switch (growthGoal) {
      'raise_ticket' => 'High-ticket upgrade lane',
      'reduce_no_shows' => 'Reliable attendance lane',
      'team_collab' => 'Team handoff lane',
      _ => 'Fast-fill lane',
    };

    return [
      _ClientClubLane(
        title: 'VIP Regulars',
        subtitle: '$pushLine with premium $serviceWord offers',
        potential: '\$420',
      ),
      const _ClientClubLane(
        title: 'Comeback Clients',
        subtitle: 'Reactivation lane for clients quiet >30 days',
        potential: '\$310',
      ),
      const _ClientClubLane(
        title: 'Referral Circle',
        subtitle: 'Most likely to refer friends this month',
        potential: '\$260',
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final lanes = _lanes();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Client Club Wall',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'Segment your audience and run offers like a premium studio brand.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 10),
          ...lanes.map(
            (lane) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _ClientClubLaneTile(
                lane: lane,
                onCopy: () async {
                  final copy =
                      '${lane.title}: priority offer window is open. Reply to reserve your spot first.';
                  await Clipboard.setData(ClipboardData(text: copy));
                  if (!context.mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${lane.title} campaign copied.'),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ClientClubLane {
  const _ClientClubLane({
    required this.title,
    required this.subtitle,
    required this.potential,
  });

  final String title;
  final String subtitle;
  final String potential;
}

class _ClientClubLaneTile extends StatelessWidget {
  const _ClientClubLaneTile({
    required this.lane,
    required this.onCopy,
  });

  final _ClientClubLane lane;
  final VoidCallback onCopy;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: SlotforceColors.surfaceSoft,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lane.title,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 2),
                Text(
                  lane.subtitle,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SlotforceColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            lane.potential,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.recoveredGreenDark,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed: onCopy,
            icon: const Icon(Icons.copy_rounded, size: 18),
            color: SlotforceColors.primaryDark,
            style: IconButton.styleFrom(
              backgroundColor: Colors.white.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }
}

class _CollabTeaRoomCard extends StatelessWidget {
  const _CollabTeaRoomCard({
    required this.openGaps,
    required this.monthlyLeakage,
    required this.recoveredRevenue,
  });

  final List<GapItem> openGaps;
  final double monthlyLeakage;
  final double recoveredRevenue;

  String _buildHuddleNotes() {
    final lines = <String>[
      'SLOTFORCE Team Tea',
      '------------------',
    ];
    if (openGaps.isEmpty) {
      lines.add('No open gaps yet. Run sync and regroup in 10 mins.');
    } else {
      for (final gap in openGaps) {
        lines.add(
          '- Prioritize ${gap.dayOfWeek} (${gap.bookableSlots} slots, \$${gap.leakageValue.toStringAsFixed(0)} potential)',
        );
      }
    }
    lines.add(
      'Monthly leakage: \$${monthlyLeakage.toStringAsFixed(0)} | Recovered: \$${recoveredRevenue.toStringAsFixed(0)}',
    );
    return lines.join('\n');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withValues(alpha: 0.95),
            SlotforceColors.accentSage.withValues(alpha: 0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.accentSage.withValues(alpha: 0.22),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Collab Tea Room',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Quick share for your front desk + providers so everyone works the same hot list.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: () {
                    RevenueSnapshot.shareSnapshot(
                      context,
                      monthlyLeakage: monthlyLeakage,
                      recoveredRevenue: recoveredRevenue,
                      unfilledSlots: openGaps.fold(
                        0,
                        (sum, gap) => sum + gap.bookableSlots,
                      ),
                    );
                  },
                  icon: const Icon(Icons.ios_share_rounded, size: 18),
                  label: const Text('Share Snapshot'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await Clipboard.setData(
                      ClipboardData(text: _buildHuddleNotes()),
                    );
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:
                            Text('Huddle notes copied. Paste in group chat.'),
                      ),
                    );
                  },
                  icon: const Icon(Icons.copy_rounded, size: 18),
                  label: const Text('Copy Huddle'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PowerMovesCard extends StatelessWidget {
  const _PowerMovesCard({
    required this.isPro,
    required this.onOpenUpgrade,
  });

  final bool isPro;
  final VoidCallback onOpenUpgrade;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withValues(alpha: 0.95),
            SlotforceColors.accentSun.withValues(alpha: 0.22),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.accentSun.withValues(alpha: 0.4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Power Moves',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          const _PowerMoveRow(
            text: 'Reach out to 3 clients in the next high-value gap.',
          ),
          const SizedBox(height: 6),
          const _PowerMoveRow(
            text: 'Protect one gap as intentional time to avoid fake leakage.',
          ),
          const SizedBox(height: 6),
          const _PowerMoveRow(
            text: 'Review this screen every Monday to keep momentum.',
          ),
          if (!isPro) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: onOpenUpgrade,
                icon: const Icon(Icons.workspace_premium_rounded, size: 18),
                label: const Text('Upgrade for Pro workflows'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PowerMoveRow extends StatelessWidget {
  const _PowerMoveRow({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 3),
          child: Icon(
            Icons.check_circle_rounded,
            size: 16,
            color: SlotforceColors.recoveredGreen,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: SlotforceColors.textSecondary,
                ),
          ),
        ),
      ],
    );
  }
}

class _StudioAtmosphere extends StatelessWidget {
  const _StudioAtmosphere();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        children: [
          Positioned(
            top: -80,
            right: -40,
            child: _Orb(
              color: SlotforceColors.accentGold.withValues(alpha: 0.1),
              size: 220,
            ),
          ),
          Positioned(
            top: 120,
            left: -60,
            child: _Orb(
              color: SlotforceColors.accentCoral.withValues(alpha: 0.1),
              size: 180,
            ),
          ),
          Positioned(
            bottom: -70,
            right: 20,
            child: _Orb(
              color: SlotforceColors.accentSun.withValues(alpha: 0.14),
              size: 230,
            ),
          ),
        ],
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({required this.color, required this.size});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [
            color,
            color.withValues(alpha: 0),
          ],
        ),
      ),
    );
  }
}
