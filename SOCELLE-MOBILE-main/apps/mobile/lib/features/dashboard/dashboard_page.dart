import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../../core/theme/slotforce_colors.dart';
import '../../core/widgets/main_navigation_drawer.dart';
import '../../models/daily_ritual.dart';
import '../../models/sync_models.dart';
import '../../models/user_settings.dart';
import '../../providers/daily_ritual_provider.dart';
import '../../providers/google_connection_provider.dart';
import '../../providers/navigation_provider.dart';
import '../../providers/streak_provider.dart';
import '../../providers/subscription_provider.dart';
import '../../providers/sync_provider.dart';
import '../../providers/user_settings_provider.dart';
import '../gap_action/gap_action_sheet.dart';
import '../paywall/paywall_page.dart';
import '../share/revenue_snapshot.dart';
import 'widgets/benchmark_card.dart';
import 'widgets/empty_state.dart';
import 'widgets/gap_card.dart';
import 'widgets/insight_card.dart';
import 'widgets/leakage_hero.dart';
import 'widgets/recovered_badge.dart';
import 'widgets/streak_badge.dart';
import 'widgets/week_day_bar.dart';

enum _GapFilter { all, open, filled, intentional }

enum _StrategyMode { comeback, premium, protect }

class DashboardPage extends ConsumerStatefulWidget {
  const DashboardPage({super.key});

  @override
  ConsumerState<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends ConsumerState<DashboardPage> {
  String? _error;
  _GapFilter _activeFilter = _GapFilter.open;
  _StrategyMode _strategyMode = _StrategyMode.comeback;
  final Set<String> _bumpedGapIds = <String>{};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _autoSyncIfNeeded();
    });
  }

  Future<void> _autoSyncIfNeeded() async {
    final lastSync = await ref.read(lastSyncAtProvider.future);
    final googleConnected =
        ref.read(googleConnectionProvider).valueOrNull ?? false;
    final settings = ref.read(userSettingsProvider).valueOrNull;
    final usingGoogle = settings?.calendarSource != 'apple';

    if (usingGoogle && !googleConnected) return;

    if (lastSync == null ||
        DateTime.now().difference(lastSync).inMinutes > 60) {
      _runSync();
    }
  }

  Future<void> _runSync() async {
    setState(() => _error = null);
    try {
      await ref.read(syncResultProvider.notifier).refresh();
      await ref.read(dailyRitualProvider.notifier).markTask('sync');
    } catch (e) {
      if (mounted) {
        setState(() => _error = _mapError(e));
      }
    }
  }

  String _mapError(Object error) {
    final raw = error.toString();
    if (raw.contains('Google calendar is not connected yet')) {
      return 'Connect your Google calendar in Settings to start syncing.';
    }
    if (raw.contains('Google calendar access expired')) {
      return 'Google connection expired. Reconnect in Settings.';
    }
    if (raw.contains('FAILED_PRECONDITION')) {
      return 'Backend is still setting up. Try again in a moment.';
    }
    if (raw.contains('Settings not loaded')) {
      return 'Loading your settings...';
    }
    return 'Sync failed. Pull down to try again.';
  }

  List<GapItem> _filteredGaps(List<GapItem> gaps) {
    final filtered = switch (_activeFilter) {
      _GapFilter.all => gaps,
      _GapFilter.open => gaps.where((g) => g.isOpen).toList(),
      _GapFilter.filled => gaps.where((g) => g.isFilled).toList(),
      _GapFilter.intentional => gaps.where((g) => g.isIntentional).toList(),
    };

    filtered.sort((a, b) {
      final bumpedA = _bumpedGapIds.contains(a.gapId);
      final bumpedB = _bumpedGapIds.contains(b.gapId);
      if (bumpedA != bumpedB) {
        return bumpedA ? -1 : 1;
      }

      final statusPriorityA = a.isOpen
          ? 0
          : a.isFilled
              ? 1
              : 2;
      final statusPriorityB = b.isOpen
          ? 0
          : b.isFilled
              ? 1
              : 2;
      if (statusPriorityA != statusPriorityB) {
        return statusPriorityA.compareTo(statusPriorityB);
      }
      return b.leakageValue.compareTo(a.leakageValue);
    });

    return filtered;
  }

  GapItem? _focusGap(List<GapItem> gaps) {
    final open = gaps.where((g) => g.isOpen).toList();
    if (open.isEmpty) return null;

    open.sort((a, b) => b.leakageValue.compareTo(a.leakageValue));
    return open.first;
  }

  bool _isBumped(GapItem gap) => _bumpedGapIds.contains(gap.gapId);

  void _toggleBump(GapItem gap) {
    final wasBumped = _bumpedGapIds.contains(gap.gapId);
    setState(() {
      if (wasBumped) {
        _bumpedGapIds.remove(gap.gapId);
      } else {
        _bumpedGapIds.add(gap.gapId);
      }
    });
    if (!wasBumped) {
      ref.read(dailyRitualProvider.notifier).markTask('bump');
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          wasBumped
              ? 'Removed bump from this slot.'
              : 'Bumped. This slot now rises to the top.',
        ),
        duration: const Duration(milliseconds: 1200),
      ),
    );
  }

  void _bumpTopOpportunity(List<GapItem> openGaps) {
    if (openGaps.isEmpty) return;
    final sorted = List<GapItem>.from(openGaps)
      ..sort((a, b) => b.leakageValue.compareTo(a.leakageValue));
    final target = sorted.firstWhere(
      (gap) => !_bumpedGapIds.contains(gap.gapId),
      orElse: () => sorted.first,
    );
    _toggleBump(target);
  }

  String _campaignDraft({
    required String providerType,
    required _StrategyMode strategyMode,
  }) {
    final serviceLabel = switch (providerType) {
      'barber' => 'cut',
      'nail_tech' => 'set',
      'esthetician' => 'facial',
      'massage_therapist' => 'session',
      'tattoo_artist' => 'piece',
      'brow_lash' => 'brow/lash set',
      _ => 'appointment',
    };

    return switch (strategyMode) {
      _StrategyMode.premium =>
        'VIP opening just dropped: premium $serviceLabel slot available this week. Reply "VIP" and I will reserve it for you first.',
      _StrategyMode.protect =>
        'I opened one calm-hour $serviceLabel slot this week. Want a quieter, focused appointment window?',
      _StrategyMode.comeback =>
        'Last-minute opening: I can fit you in for a $serviceLabel this week. Want first dibs before I release it?',
    };
  }

  Future<void> _copyCampaign({
    required String providerType,
    required _StrategyMode strategyMode,
  }) async {
    final text = _campaignDraft(
      providerType: providerType,
      strategyMode: strategyMode,
    );
    await Clipboard.setData(ClipboardData(text: text));
    await ref.read(dailyRitualProvider.notifier).markTask('campaign');
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Campaign draft copied. Drop it into your client chat.'),
        duration: Duration(milliseconds: 1400),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final syncState = ref.watch(syncResultProvider);
    final recoveredRevenue =
        ref.watch(recoveredRevenueProvider).valueOrNull ?? 0.0;
    final streak = ref.watch(streakProvider).valueOrNull;
    final subscription = ref.watch(subscriptionProvider).valueOrNull;
    final settings =
        ref.watch(userSettingsProvider).valueOrNull ?? UserSettings.defaults();
    final lastSync = ref.watch(lastSyncAtProvider).valueOrNull;
    final googleConnected =
        ref.watch(googleConnectionProvider).valueOrNull ?? false;
    final ritual = ref.watch(dailyRitualProvider).valueOrNull;

    final result = syncState.valueOrNull;
    final isLoading = syncState.isLoading;
    final currentWeekGaps = result?.currentWeekGaps() ?? const <GapItem>[];
    final currentWeekOpenGaps = currentWeekGaps.where((g) => g.isOpen).toList();
    final currentWeekLeakage = result?.currentWeekActiveLeakage() ?? 0.0;
    final currentWeekBookableSlots = result?.currentWeekBookableSlots() ?? 0;
    final currentWeekGapCount = result?.currentWeekGapCount() ?? 0;
    final bumpedCount = currentWeekOpenGaps
        .where((gap) => _bumpedGapIds.contains(gap.gapId))
        .length;
    final providerType = settings.providerType;
    final growthGoal = settings.growthGoal;

    final filteredGaps =
        result != null ? _filteredGaps(result.gaps) : <GapItem>[];
    final focusGap = result != null ? _focusGap(currentWeekGaps) : null;

    return Scaffold(
      backgroundColor: SlotforceColors.surfaceSoft,
      drawer: const MainNavigationDrawer(),
      appBar: AppBar(
        title: const Text('SLOTFORCE'),
        centerTitle: false,
        actions: [
          if (result != null)
            IconButton(
              tooltip: 'Share snapshot',
              onPressed: () {
                RevenueSnapshot.shareSnapshot(
                  context,
                  monthlyLeakage: currentWeekLeakage * 4.3,
                  recoveredRevenue: recoveredRevenue,
                  unfilledSlots: currentWeekBookableSlots,
                );
              },
              icon: const Icon(Icons.ios_share_rounded),
            ),
          if (streak != null && streak.hasStreak)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: StreakBadge(streak: streak),
            ),
          if (subscription != null && subscription.isTrial)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: _TrialBadge(daysLeft: subscription.trialDaysRemaining),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _runSync,
        color: SlotforceColors.primary,
        child: Stack(
          children: [
            const _DashboardAtmosphere(),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 420),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeInCubic,
              child: result == null && !isLoading
                  ? ListView(
                      key: const ValueKey('dashboard-empty'),
                      physics: const AlwaysScrollableScrollPhysics(
                        parent: BouncingScrollPhysics(),
                      ),
                      padding: const EdgeInsets.fromLTRB(16, 36, 16, 24),
                      children: [
                        _LifestyleEdgeCard(
                          providerType: providerType,
                          growthGoal: growthGoal,
                          strategyMode: _strategyMode,
                          openGapCount: 0,
                          onCopyCampaign: () => _copyCampaign(
                            providerType: providerType,
                            strategyMode: _strategyMode,
                          ),
                          onOpenStudio: () {
                            ref.read(navigationIndexProvider.notifier).state =
                                1;
                          },
                        ),
                        const SizedBox(height: 14),
                        _PowerhouseRitualCard(
                          ritual: ritual,
                          onToggleTask: (id) {
                            ref.read(dailyRitualProvider.notifier).toggleTask(
                                  id,
                                );
                          },
                          onReset: () {
                            ref
                                .read(dailyRitualProvider.notifier)
                                .resetForToday();
                          },
                        ),
                        const SizedBox(height: 14),
                        const EmptyState(type: EmptyStateType.noSync),
                        const SizedBox(height: 14),
                        _FeaturePreviewCard(
                          title: 'AI Comeback Plan',
                          description:
                              'Auto-generated moves for your next high-value gap.',
                          icon: Icons.auto_awesome_rounded,
                          accent: SlotforceColors.glamPlum,
                          ctaLabel: 'Run First Sync',
                          onTap: () {
                            _runSync();
                          },
                        ),
                        const SizedBox(height: 10),
                        _FeaturePreviewCard(
                          title: 'Bump Board',
                          description:
                              'Pin urgent slots so your team tackles the right gap first.',
                          icon: Icons.bolt_rounded,
                          accent: SlotforceColors.accentCoral,
                          ctaLabel: 'Open Studio',
                          onTap: () {
                            ref.read(navigationIndexProvider.notifier).state =
                                1;
                          },
                        ),
                      ],
                    )
                  : ListView(
                      key: const ValueKey('dashboard-loaded'),
                      physics: const AlwaysScrollableScrollPhysics(
                        parent: BouncingScrollPhysics(),
                      ),
                      padding: const EdgeInsets.fromLTRB(16, 10, 16, 30),
                      children: [
                        if (result != null)
                          LeakageHero(
                            weeklyLeakage: currentWeekLeakage,
                            bookableSlots: currentWeekBookableSlots,
                            gapCount: currentWeekGapCount,
                          )
                        else
                          _LoadingHero(),
                        const SizedBox(height: 12),
                        _LifestyleEdgeCard(
                          providerType: providerType,
                          growthGoal: growthGoal,
                          strategyMode: _strategyMode,
                          openGapCount: currentWeekOpenGaps.length,
                          onCopyCampaign: () => _copyCampaign(
                            providerType: providerType,
                            strategyMode: _strategyMode,
                          ),
                          onOpenStudio: () {
                            ref.read(navigationIndexProvider.notifier).state =
                                1;
                          },
                        ),
                        const SizedBox(height: 12),
                        _PowerhouseScoreCard(
                          result: result,
                          recoveredRevenue: recoveredRevenue,
                          streakWeeks: streak?.currentStreak ?? 0,
                          lastSyncAt: lastSync,
                          openGaps: currentWeekOpenGaps.length,
                        ),
                        const SizedBox(height: 12),
                        _PowerhouseRitualCard(
                          ritual: ritual,
                          onToggleTask: (id) {
                            ref.read(dailyRitualProvider.notifier).toggleTask(
                                  id,
                                );
                          },
                          onReset: () {
                            ref
                                .read(dailyRitualProvider.notifier)
                                .resetForToday();
                          },
                        ),
                        const SizedBox(height: 12),
                        _QuickActionsCard(
                          usingGoogleCalendar:
                              settings.calendarSource != 'apple',
                          googleConnected: googleConnected,
                          onSync: _runSync,
                          onConnectCalendar: () {
                            ref.read(navigationIndexProvider.notifier).state =
                                2;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Open Calendar settings to connect Google.',
                                ),
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 12),
                        _StrategyModeSwitcher(
                          activeMode: _strategyMode,
                          onChanged: (mode) {
                            setState(() => _strategyMode = mode);
                          },
                        ),
                        if (recoveredRevenue > 0) ...[
                          const SizedBox(height: 12),
                          RecoveredBadge(
                            recoveredTotal: recoveredRevenue,
                            subscriptionCost: subscription?.isActive == true
                                ? subscription!.annualSubscriptionCost
                                : null,
                          ),
                        ],
                        if (lastSync != null) ...[
                          const SizedBox(height: 10),
                          _LastSyncedRow(lastSync: lastSync),
                        ],
                        if (_error != null) ...[
                          const SizedBox(height: 12),
                          _ErrorBanner(message: _error!),
                        ],
                        if (isLoading && result == null) ...[
                          const SizedBox(height: 32),
                          const Center(child: CircularProgressIndicator()),
                        ],
                        if (result != null) ...[
                          const SizedBox(height: 18),
                          WeekDayBar(
                            gaps: currentWeekGaps,
                            workingHours: settings.workingHours,
                          ),
                          const SizedBox(height: 16),
                          InsightCard(gaps: currentWeekGaps),
                          const SizedBox(height: 16),
                          BenchmarkCard(
                            userMonthlyLeakage: currentWeekLeakage * 4.3,
                          ),
                          const SizedBox(height: 16),
                          _RevenueSimulationCard(
                            weeklyLeakage: currentWeekLeakage,
                            openSlots: currentWeekBookableSlots,
                            avgBookingValue: settings.avgBookingValue,
                            strategyMode: _strategyMode,
                          ),
                          const SizedBox(height: 16),
                          _AIPlaybookCard(
                            gaps: currentWeekOpenGaps,
                            avgBookingValue: settings.avgBookingValue,
                            strategyMode: _strategyMode,
                            onRunSync: _runSync,
                            onOpenGap: (gap) =>
                                GapActionSheet.show(context, ref, gap),
                          ),
                          const SizedBox(height: 16),
                          _PriorityRadarCard(
                            gaps: currentWeekOpenGaps,
                            avgBookingValue: settings.avgBookingValue,
                            strategyMode: _strategyMode,
                            isBumped: _isBumped,
                            onBumpGap: _toggleBump,
                            onOpenGap: (gap) =>
                                GapActionSheet.show(context, ref, gap),
                          ),
                          if (focusGap != null) ...[
                            const SizedBox(height: 16),
                            _FocusOpportunityCard(
                              gap: focusGap,
                              onTap: () =>
                                  GapActionSheet.show(context, ref, focusGap),
                            ),
                          ],
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Text(
                                'Your Gap Feed',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const Spacer(),
                              if (currentWeekOpenGaps.isNotEmpty)
                                TextButton.icon(
                                  onPressed: () =>
                                      _bumpTopOpportunity(currentWeekOpenGaps),
                                  icon:
                                      const Icon(Icons.bolt_rounded, size: 16),
                                  label: Text(
                                    bumpedCount > 0
                                        ? 'Do a bump ($bumpedCount)'
                                        : 'Do a bump',
                                  ),
                                ),
                              const SizedBox(width: 8),
                              Text(
                                '${result.gaps.where((g) => g.isOpen).length} hot gaps',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: SlotforceColors.leakageRed,
                                      fontWeight: FontWeight.w700,
                                    ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          _GapFilterRow(
                            activeFilter: _activeFilter,
                            countAll: result.gaps.length,
                            countOpen:
                                result.gaps.where((g) => g.isOpen).length,
                            countFilled:
                                result.gaps.where((g) => g.isFilled).length,
                            countIntentional: result.gaps
                                .where((g) => g.isIntentional)
                                .length,
                            onSelect: (filter) {
                              setState(() => _activeFilter = filter);
                            },
                          ),
                          const SizedBox(height: 12),
                          if (filteredGaps.isEmpty)
                            const _NoFilteredGaps()
                          else
                            ...filteredGaps.map(
                              (gap) => Padding(
                                padding: const EdgeInsets.only(bottom: 10),
                                child: GapCard(
                                  gap: gap,
                                  isBumped: _isBumped(gap),
                                  onBump: () => _toggleBump(gap),
                                  onFillSlot: () =>
                                      GapActionSheet.show(context, ref, gap),
                                  onMarkIntentional: () =>
                                      GapActionSheet.show(context, ref, gap),
                                  onTap: () =>
                                      GapActionSheet.show(context, ref, gap),
                                ),
                              ),
                            ),
                          const SizedBox(height: 24),
                          if (subscription == null ||
                              !subscription.isActive) ...[
                            _PaywallCTA(
                              leakage: currentWeekLeakage,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => PaywallPage(
                                      weeklyLeakage: currentWeekLeakage,
                                    ),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(height: 16),
                          ],
                        ],
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardAtmosphere extends StatelessWidget {
  const _DashboardAtmosphere();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: SlotforceColors.atmosphericWash,
          ),
          border: Border(
            top: BorderSide(
              color: SlotforceColors.accentSun.withValues(alpha: 0.2),
              width: 1,
            ),
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              top: -120,
              right: -50,
              child: _AtmosphereOrb(
                size: 260,
                color: SlotforceColors.accentGold.withValues(alpha: 0.12),
              ),
            ),
            Positioned(
              top: -40,
              left: -95,
              child: _AtmosphereOrb(
                size: 220,
                color: SlotforceColors.accentRose.withValues(alpha: 0.12),
              ),
            ),
            Positioned(
              top: 160,
              left: -45,
              child: _AtmosphereOrb(
                size: 140,
                color: SlotforceColors.primary.withValues(alpha: 0.14),
              ),
            ),
            Positioned(
              bottom: -60,
              right: -50,
              child: _AtmosphereOrb(
                size: 250,
                color: SlotforceColors.accentSun.withValues(alpha: 0.12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LifestyleEdgeCard extends StatelessWidget {
  const _LifestyleEdgeCard({
    required this.providerType,
    required this.growthGoal,
    required this.strategyMode,
    required this.openGapCount,
    required this.onCopyCampaign,
    required this.onOpenStudio,
  });

  final String providerType;
  final String growthGoal;
  final _StrategyMode strategyMode;
  final int openGapCount;
  final VoidCallback onCopyCampaign;
  final VoidCallback onOpenStudio;

  String _providerLabel() {
    return switch (providerType) {
      'hair_stylist' => 'Hair Artist',
      'barber' => 'Barber',
      'nail_tech' => 'Nail Artist',
      'esthetician' => 'Skin Specialist',
      'massage_therapist' => 'Bodywork Specialist',
      'tattoo_artist' => 'Tattoo Artist',
      'brow_lash' => 'Brow/Lash Artist',
      _ => 'Service Pro',
    };
  }

  String _goalLabel() {
    return switch (growthGoal) {
      'raise_ticket' => 'High-ticket focus',
      'reduce_no_shows' => 'No-show protection',
      'team_collab' => 'Team collaboration',
      _ => 'Gap recovery',
    };
  }

  String _modeLabel() {
    return switch (strategyMode) {
      _StrategyMode.premium => 'Premium Push',
      _StrategyMode.protect => 'Protect Energy',
      _StrategyMode.comeback => 'Recovery Sprint',
    };
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final partOfDay = switch (now.hour) {
      < 12 => 'Morning',
      < 17 => 'Afternoon',
      _ => 'Evening',
    };

    return Container(
      padding: const EdgeInsets.all(16),
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
            blurRadius: 24,
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
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'Lifestyle Edge',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                '$openGapCount live gaps',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.white.withValues(alpha: 0.86),
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            '$partOfDay, ${_providerLabel()}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.84),
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 2),
          Text(
            'Run your ${_modeLabel().toLowerCase()} with style.',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _EdgeTag(label: _goalLabel()),
              const _EdgeTag(label: 'VIP drop ready'),
              const _EdgeTag(label: 'Campaign fuel'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: onCopyCampaign,
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: 0.18),
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.campaign_rounded, size: 18),
                  label: const Text('Copy campaign'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onOpenStudio,
                  style: OutlinedButton.styleFrom(
                    side:
                        BorderSide(color: Colors.white.withValues(alpha: 0.6)),
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.auto_awesome_rounded, size: 18),
                  label: const Text('Open Studio'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EdgeTag extends StatelessWidget {
  const _EdgeTag({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _PowerhouseScoreCard extends StatelessWidget {
  const _PowerhouseScoreCard({
    required this.result,
    required this.recoveredRevenue,
    required this.streakWeeks,
    required this.lastSyncAt,
    required this.openGaps,
  });

  final SyncResult? result;
  final double recoveredRevenue;
  final int streakWeeks;
  final DateTime? lastSyncAt;
  final int openGaps;

  String _tierLabel(double score) {
    if (score >= 85) return 'Icon Tier';
    if (score >= 70) return 'Power Tier';
    if (score >= 55) return 'Momentum Tier';
    return 'Build Tier';
  }

  @override
  Widget build(BuildContext context) {
    final gaps = result?.gaps ?? const <GapItem>[];
    final filled = gaps.where((g) => g.isFilled).length;
    final fillRate = gaps.isEmpty ? 0.0 : filled / gaps.length;

    final now = DateTime.now();
    final syncAgeHours = lastSyncAt == null
        ? 999
        : now.difference(lastSyncAt!).inHours.clamp(0, 999);
    final syncScore = syncAgeHours <= 2
        ? 22.0
        : syncAgeHours <= 24
            ? 14.0
            : 5.0;
    final fillScore = fillRate * 35;
    final recoveredScore =
        (recoveredRevenue / 1500 * 20).clamp(0, 20).toDouble();
    final streakScore = (streakWeeks * 2.5).clamp(0, 20).toDouble();
    final gapPenalty = (openGaps * 1.4).clamp(0, 15).toDouble();
    final rawScore =
        35 + syncScore + fillScore + recoveredScore + streakScore - gapPenalty;
    final score = rawScore.clamp(0, 100).toDouble();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: SlotforceColors.primary.withValues(alpha: 0.16),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Powerhouse Score',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: SlotforceColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  _tierLabel(score),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: SlotforceColors.primaryDark,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              SizedBox(
                width: 74,
                height: 74,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CircularProgressIndicator(
                      value: score / 100,
                      strokeWidth: 8,
                      backgroundColor: SlotforceColors.divider,
                      valueColor: const AlwaysStoppedAnimation(
                        SlotforceColors.primary,
                      ),
                    ),
                    Text(
                      score.round().toString(),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ScoreStat(
                      label: 'Fill rate',
                      value: '${(fillRate * 100).round()}%',
                    ),
                    _ScoreStat(
                      label: 'Recovered',
                      value: '\$${recoveredRevenue.toStringAsFixed(0)}',
                    ),
                    _ScoreStat(
                      label: 'Streak',
                      value: '${streakWeeks}w',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScoreStat extends StatelessWidget {
  const _ScoreStat({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const Spacer(),
          Text(
            value,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textPrimary,
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}

class _PowerhouseRitualCard extends StatelessWidget {
  const _PowerhouseRitualCard({
    required this.ritual,
    required this.onToggleTask,
    required this.onReset,
  });

  final DailyRitualState? ritual;
  final ValueChanged<String> onToggleTask;
  final VoidCallback onReset;

  static const _taskLabels = <String, String>{
    'sync': 'Run sync',
    'campaign': 'Copy/send one campaign',
    'bump': 'Bump one hot slot',
    'review': 'Review Studio queue',
  };

  @override
  Widget build(BuildContext context) {
    final state = ritual ?? DailyRitualState.forToday();
    final completed = state.completedCount;
    final total = state.totalCount;
    final progress = state.progress;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withValues(alpha: 0.94),
            SlotforceColors.accentSun.withValues(alpha: 0.16),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.accentSun.withValues(alpha: 0.32),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Daily Money Ritual',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const Spacer(),
              TextButton(
                onPressed: onReset,
                child: const Text('Reset'),
              ),
            ],
          ),
          Text(
            '$completed of $total complete',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: SlotforceColors.divider,
              valueColor: const AlwaysStoppedAnimation(
                SlotforceColors.glamPlum,
              ),
            ),
          ),
          const SizedBox(height: 12),
          ..._taskLabels.entries.map(
            (entry) => _RitualTaskRow(
              label: entry.value,
              checked: state.tasks[entry.key] == true,
              onTap: () => onToggleTask(entry.key),
            ),
          ),
        ],
      ),
    );
  }
}

class _RitualTaskRow extends StatelessWidget {
  const _RitualTaskRow({
    required this.label,
    required this.checked,
    required this.onTap,
  });

  final String label;
  final bool checked;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Icon(
              checked
                  ? Icons.check_circle_rounded
                  : Icons.radio_button_unchecked,
              size: 18,
              color: checked
                  ? SlotforceColors.recoveredGreen
                  : SlotforceColors.textMuted,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: SlotforceColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AtmosphereOrb extends StatelessWidget {
  const _AtmosphereOrb({required this.size, required this.color});

  final double size;
  final Color color;

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
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.22),
            blurRadius: 46,
            spreadRadius: 4,
          ),
        ],
      ),
    );
  }
}

class _QuickActionsCard extends StatelessWidget {
  const _QuickActionsCard({
    required this.usingGoogleCalendar,
    required this.googleConnected,
    required this.onSync,
    required this.onConnectCalendar,
  });

  final bool usingGoogleCalendar;
  final bool googleConnected;
  final Future<void> Function() onSync;
  final VoidCallback onConnectCalendar;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withValues(alpha: 0.96),
            SlotforceColors.primaryLight.withValues(alpha: 0.16),
            SlotforceColors.accentGoldLight.withValues(alpha: 0.3),
          ],
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: SlotforceColors.primary.withValues(alpha: 0.15),
        ),
        boxShadow: [
          BoxShadow(
            color: SlotforceColors.primaryDark.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: SlotforceColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: const Icon(
                  Icons.flash_on_rounded,
                  color: SlotforceColors.primaryDark,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Revenue Control',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: googleConnected
                      ? SlotforceColors.recoveredGreenLight
                      : SlotforceColors.leakageRedLight,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: googleConnected
                        ? SlotforceColors.recoveredGreen.withValues(alpha: 0.35)
                        : SlotforceColors.leakageRed.withValues(alpha: 0.25),
                  ),
                ),
                child: Text(
                  googleConnected ? 'Revenue-ready' : 'Needs connection',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: googleConnected
                            ? SlotforceColors.recoveredGreenDark
                            : SlotforceColors.leakageRedDark,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            googleConnected
                ? 'Turn empty chairs into booked revenue.'
                : 'Connect Google and start tracking recoverable revenue.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _PrimaryActionButton(
                  label: 'Run Revenue Sync',
                  icon: Icons.sync_rounded,
                  onTap: onSync,
                ),
              ),
              if (!googleConnected) ...[
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onConnectCalendar,
                    icon: const Icon(Icons.link_rounded, size: 18),
                    label: const Text('Connect'),
                  ),
                ),
              ],
            ],
          ),
          if (usingGoogleCalendar && !googleConnected) ...[
            const SizedBox(height: 10),
            Text(
              'Drop one refresh token once. After that, it runs itself.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: SlotforceColors.textMuted,
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PrimaryActionButton extends StatelessWidget {
  const _PrimaryActionButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final Future<void> Function() onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Ink(
        height: 50,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: SlotforceColors.actionGradient,
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: SlotforceColors.primaryDark.withValues(alpha: 0.26),
              blurRadius: 14,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.2,
                      ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StrategyModeSwitcher extends StatelessWidget {
  const _StrategyModeSwitcher({
    required this.activeMode,
    required this.onChanged,
  });

  final _StrategyMode activeMode;
  final ValueChanged<_StrategyMode> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.88),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Comeback Mode',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _ModeChip(
                label: 'Recovery Sprint',
                selected: activeMode == _StrategyMode.comeback,
                onTap: () => onChanged(_StrategyMode.comeback),
              ),
              _ModeChip(
                label: 'Premium Push',
                selected: activeMode == _StrategyMode.premium,
                onTap: () => onChanged(_StrategyMode.premium),
              ),
              _ModeChip(
                label: 'Protect Energy',
                selected: activeMode == _StrategyMode.protect,
                onTap: () => onChanged(_StrategyMode.protect),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ModeChip extends StatelessWidget {
  const _ModeChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            gradient: selected
                ? const LinearGradient(
                    colors: SlotforceColors.actionGradient,
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  )
                : null,
            color: selected ? null : SlotforceColors.surfaceSoft,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: selected
                  ? Colors.transparent
                  : SlotforceColors.primary.withValues(alpha: 0.2),
            ),
          ),
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: selected ? Colors.white : SlotforceColors.primaryDark,
                  fontWeight: FontWeight.w800,
                ),
          ),
        ),
      ),
    );
  }
}

class _GapFilterRow extends StatelessWidget {
  const _GapFilterRow({
    required this.activeFilter,
    required this.countAll,
    required this.countOpen,
    required this.countFilled,
    required this.countIntentional,
    required this.onSelect,
  });

  final _GapFilter activeFilter;
  final int countAll;
  final int countOpen;
  final int countFilled;
  final int countIntentional;
  final ValueChanged<_GapFilter> onSelect;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        _GapFilterChip(
          label: 'Hot',
          count: countOpen,
          selected: activeFilter == _GapFilter.open,
          onTap: () => onSelect(_GapFilter.open),
        ),
        _GapFilterChip(
          label: 'All',
          count: countAll,
          selected: activeFilter == _GapFilter.all,
          onTap: () => onSelect(_GapFilter.all),
        ),
        _GapFilterChip(
          label: 'Booked',
          count: countFilled,
          selected: activeFilter == _GapFilter.filled,
          onTap: () => onSelect(_GapFilter.filled),
        ),
        _GapFilterChip(
          label: 'Intentional',
          count: countIntentional,
          selected: activeFilter == _GapFilter.intentional,
          onTap: () => onSelect(_GapFilter.intentional),
        ),
      ],
    );
  }
}

class _GapFilterChip extends StatelessWidget {
  const _GapFilterChip({
    required this.label,
    required this.count,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: selected
                  ? [
                      SlotforceColors.primary.withValues(alpha: 0.2),
                      SlotforceColors.accentGold.withValues(alpha: 0.14),
                    ]
                  : [
                      Colors.white.withValues(alpha: 0.95),
                      Colors.white.withValues(alpha: 0.78),
                    ],
            ),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: selected
                  ? SlotforceColors.primary.withValues(alpha: 0.45)
                  : SlotforceColors.divider,
            ),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: SlotforceColors.primary.withValues(alpha: 0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: selected
                      ? SlotforceColors.primaryDark
                      : SlotforceColors.textMuted,
                ),
              ),
              const SizedBox(width: 7),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: selected
                          ? SlotforceColors.primaryDark
                          : SlotforceColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const SizedBox(width: 7),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: selected
                      ? SlotforceColors.primary.withValues(alpha: 0.18)
                      : SlotforceColors.surfaceSoft,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '$count',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: selected
                            ? SlotforceColors.primaryDark
                            : SlotforceColors.textMuted,
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

class _FeaturePreviewCard extends StatelessWidget {
  const _FeaturePreviewCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.accent,
    required this.ctaLabel,
    required this.onTap,
  });

  final String title;
  final String description;
  final IconData icon;
  final Color accent;
  final String ctaLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withValues(alpha: 0.95),
            accent.withValues(alpha: 0.08),
          ],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: accent.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: accent),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: SlotforceColors.textSecondary,
                ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: onTap,
              child: Text(ctaLabel),
            ),
          ),
        ],
      ),
    );
  }
}

class _FocusOpportunityCard extends StatelessWidget {
  const _FocusOpportunityCard({required this.gap, required this.onTap});

  final GapItem gap;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final start = DateTime.tryParse(gap.startIso)?.toLocal();
    final end = DateTime.tryParse(gap.endIso)?.toLocal();
    final time = start != null && end != null
        ? '${DateFormat.E().format(start)} · ${DateFormat.jm().format(start)}-${DateFormat.jm().format(end)}'
        : gap.dayOfWeek;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: SlotforceColors.glamHeroGradientColors,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: SlotforceColors.primaryDark.withValues(alpha: 0.22),
              blurRadius: 22,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      'Top leak this week',
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: Colors.white.withValues(alpha: 0.92),
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Focus opportunity',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.84),
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${currency.format(gap.leakageValue)} potential',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$time · ${gap.bookableSlots} slots',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    'Take action',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.arrow_forward_rounded,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _RevenueSimulationCard extends StatefulWidget {
  const _RevenueSimulationCard({
    required this.weeklyLeakage,
    required this.openSlots,
    required this.avgBookingValue,
    required this.strategyMode,
  });

  final double weeklyLeakage;
  final int openSlots;
  final double avgBookingValue;
  final _StrategyMode strategyMode;

  @override
  State<_RevenueSimulationCard> createState() => _RevenueSimulationCardState();
}

class _RevenueSimulationCardState extends State<_RevenueSimulationCard> {
  double _slotTarget = 1;

  int get _maxSlots {
    if (widget.openSlots <= 0) return 0;
    return widget.openSlots > 20 ? 20 : widget.openSlots;
  }

  @override
  void initState() {
    super.initState();
    _slotTarget = _initialTarget().toDouble();
  }

  @override
  void didUpdateWidget(covariant _RevenueSimulationCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.openSlots != widget.openSlots) {
      _slotTarget = _initialTarget().toDouble();
    } else if (_maxSlots > 0 && _slotTarget > _maxSlots) {
      _slotTarget = _maxSlots.toDouble();
    }
  }

  int _initialTarget() {
    if (_maxSlots <= 0) return 0;
    if (_maxSlots >= 3) return 3;
    return _maxSlots;
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    if (widget.weeklyLeakage <= 0 || _maxSlots == 0) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: SlotforceColors.divider),
        ),
        child: Text(
          'Revenue Simulator activates when open slots are detected.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
      );
    }

    final scenarioMultiplier = switch (widget.strategyMode) {
      _StrategyMode.comeback => 1.0,
      _StrategyMode.premium => 1.28,
      _StrategyMode.protect => 0.82,
    };
    final scenarioLabel = switch (widget.strategyMode) {
      _StrategyMode.comeback => 'Balanced recovery',
      _StrategyMode.premium => 'Premium pricing',
      _StrategyMode.protect => 'Energy-safe bookings',
    };
    final adjustedBookingValue = widget.avgBookingValue * scenarioMultiplier;
    final projectedWeekly =
        (_slotTarget * adjustedBookingValue).clamp(0, widget.weeklyLeakage);
    final projectedMonthly = projectedWeekly * 4.3;
    final recoveryPercent =
        (projectedWeekly / widget.weeklyLeakage).clamp(0.0, 1.0).toDouble();
    final divisions = _maxSlots > 1 ? _maxSlots - 1 : null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withValues(alpha: 0.96),
            SlotforceColors.accentGoldLight.withValues(alpha: 0.45),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.accentGold.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Revenue Simulator',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: SlotforceColors.accentGold.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '${(_slotTarget).round()} slots',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: SlotforceColors.accentGoldDark,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Drag to model how much cash you recover if you close high-value slots.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: SlotforceColors.textSecondary,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            '$scenarioLabel • ${currency.format(adjustedBookingValue)} avg ticket',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: SlotforceColors.primaryDark,
                ),
          ),
          const SizedBox(height: 10),
          Slider(
            value: _slotTarget.clamp(1, _maxSlots).toDouble(),
            min: 1,
            max: _maxSlots.toDouble(),
            divisions: divisions,
            onChanged: _maxSlots > 1
                ? (value) => setState(() => _slotTarget = value)
                : null,
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 8,
              value: recoveryPercent,
              backgroundColor: SlotforceColors.divider,
              valueColor:
                  const AlwaysStoppedAnimation(SlotforceColors.recoveredGreen),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _SimulatorMetric(
                  label: 'Weekly rescue',
                  value: currency.format(projectedWeekly),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _SimulatorMetric(
                  label: 'Monthly runway',
                  value: currency.format(projectedMonthly),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SimulatorMetric extends StatelessWidget {
  const _SimulatorMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.84),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}

class _AIPlaybookCard extends StatelessWidget {
  const _AIPlaybookCard({
    required this.gaps,
    required this.avgBookingValue,
    required this.strategyMode,
    required this.onOpenGap,
    this.onRunSync,
  });

  final List<GapItem> gaps;
  final double avgBookingValue;
  final _StrategyMode strategyMode;
  final ValueChanged<GapItem> onOpenGap;
  final Future<void> Function()? onRunSync;

  DateTime? _parseStart(GapItem gap) {
    try {
      return DateTime.parse(gap.startIso).toLocal();
    } catch (_) {
      return null;
    }
  }

  String _gapLabel(GapItem gap) {
    final start = _parseStart(gap);
    if (start == null) return gap.dayOfWeek;
    return '${DateFormat.E().format(start)} ${DateFormat.jm().format(start)}';
  }

  String _capitalize(String value) {
    if (value.isEmpty) return value;
    return value[0].toUpperCase() + value.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    if (gaps.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Colors.white.withValues(alpha: 0.95),
              SlotforceColors.glamGold.withValues(alpha: 0.18),
            ],
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: SlotforceColors.glamGold.withValues(alpha: 0.45),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'AI Comeback Plan',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Sync once and AI will generate your top 3 recovery moves automatically.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: SlotforceColors.textSecondary,
                  ),
            ),
            if (onRunSync != null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onRunSync,
                  icon: const Icon(Icons.sync_rounded, size: 18),
                  label: const Text('Run Sync to Unlock AI'),
                ),
              ),
            ],
          ],
        ),
      );
    }

    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final openGaps = List<GapItem>.from(gaps)
      ..sort((a, b) => b.leakageValue.compareTo(a.leakageValue));
    final topGap = openGaps.first;

    final byDay = <String, double>{};
    for (final gap in openGaps) {
      byDay[gap.dayOfWeek] = (byDay[gap.dayOfWeek] ?? 0) + gap.leakageValue;
    }
    final worstDay = byDay.entries.reduce((a, b) => a.value > b.value ? a : b);

    final soonestGap = List<GapItem>.from(openGaps)
      ..sort((a, b) {
        final aTime = _parseStart(a) ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bTime = _parseStart(b) ?? DateTime.fromMillisecondsSinceEpoch(0);
        return aTime.compareTo(bTime);
      });

    final moves = switch (strategyMode) {
      _StrategyMode.comeback => <_PlaybookMove>[
          _PlaybookMove(
            title: 'Hit ${_gapLabel(topGap)} first',
            detail: 'Highest immediate recovery in your queue right now.',
            impact: topGap.leakageValue,
            gap: topGap,
          ),
          _PlaybookMove(
            title: 'Run a same-day blast on ${_capitalize(worstDay.key)}',
            detail: 'DM + text waitlist clients for fast fill conversion.',
            impact: worstDay.value * 0.55,
            gap: topGap,
          ),
          _PlaybookMove(
            title: 'Bundle add-on service in ${_gapLabel(soonestGap.first)}',
            detail: 'Use premium bundle pricing to raise recovered value.',
            impact: avgBookingValue * 1.4,
            gap: soonestGap.first,
          ),
        ],
      _StrategyMode.premium => <_PlaybookMove>[
          _PlaybookMove(
            title: 'Reserve ${_gapLabel(topGap)} for premium packages',
            detail: 'Prioritize high-ticket services and VIP clients only.',
            impact: topGap.leakageValue * 1.35,
            gap: topGap,
          ),
          _PlaybookMove(
            title: 'Offer luxury add-ons on ${_capitalize(worstDay.key)}',
            detail: 'Raise ticket size with treatments + retail pairings.',
            impact: worstDay.value * 0.75,
            gap: topGap,
          ),
          _PlaybookMove(
            title: 'Publish one premium slot story now',
            detail: 'Drive urgency with a limited same-day highlight.',
            impact: avgBookingValue * 1.8,
            gap: soonestGap.first,
          ),
        ],
      _StrategyMode.protect => <_PlaybookMove>[
          _PlaybookMove(
            title: 'Close ${_gapLabel(soonestGap.first)} with easiest win',
            detail: 'Fastest conversion without overextending your day.',
            impact: soonestGap.first.leakageValue * 0.85,
            gap: soonestGap.first,
          ),
          _PlaybookMove(
            title: 'Cap ${_capitalize(worstDay.key)} to two priority fills',
            detail: 'Protect energy while still recovering meaningful revenue.',
            impact: worstDay.value * 0.4,
            gap: topGap,
          ),
          _PlaybookMove(
            title: 'Keep one intentional buffer slot',
            detail: 'Prevent burnout and keep service quality high.',
            impact: avgBookingValue * 0.7,
            gap: topGap,
          ),
        ],
    };

    final modeBadge = switch (strategyMode) {
      _StrategyMode.comeback => 'Recovery Sprint',
      _StrategyMode.premium => 'Premium Push',
      _StrategyMode.protect => 'Protect Energy',
    };

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withValues(alpha: 0.95),
            SlotforceColors.glamGold.withValues(alpha: 0.18),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: SlotforceColors.glamGold.withValues(alpha: 0.45),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'AI Comeback Plan',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: SlotforceColors.glamPink.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  modeBadge,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: SlotforceColors.glamPlum,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...List.generate(
            moves.length,
            (index) => Padding(
              padding:
                  EdgeInsets.only(bottom: index == moves.length - 1 ? 0 : 8),
              child: _PlaybookMoveTile(
                index: index + 1,
                move: moves[index],
                onTap: moves[index].gap == null
                    ? null
                    : () => onOpenGap(moves[index].gap!),
                currency: currency,
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => onOpenGap(topGap),
              icon: const Icon(Icons.flash_on_rounded, size: 18),
              label: const Text('Open Top Priority Gap'),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlaybookMove {
  const _PlaybookMove({
    required this.title,
    required this.detail,
    required this.impact,
    required this.gap,
  });

  final String title;
  final String detail;
  final double impact;
  final GapItem? gap;
}

class _PlaybookMoveTile extends StatelessWidget {
  const _PlaybookMoveTile({
    required this.index,
    required this.move,
    required this.currency,
    this.onTap,
  });

  final int index;
  final _PlaybookMove move;
  final VoidCallback? onTap;
  final NumberFormat currency;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Ink(
          padding: const EdgeInsets.all(11),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.82),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: SlotforceColors.divider),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 24,
                height: 24,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: SlotforceColors.accentGold.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '$index',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SlotforceColors.accentGoldDark,
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
                      move.title,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: SlotforceColors.textPrimary,
                          ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      move.detail,
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
                  '+${currency.format(move.impact)}',
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

class _PriorityRadarCard extends StatelessWidget {
  const _PriorityRadarCard({
    required this.gaps,
    required this.avgBookingValue,
    required this.strategyMode,
    required this.isBumped,
    required this.onBumpGap,
    required this.onOpenGap,
  });

  final List<GapItem> gaps;
  final double avgBookingValue;
  final _StrategyMode strategyMode;
  final bool Function(GapItem) isBumped;
  final ValueChanged<GapItem> onBumpGap;
  final ValueChanged<GapItem> onOpenGap;

  DateTime? _parseStart(GapItem gap) {
    try {
      return DateTime.parse(gap.startIso).toLocal();
    } catch (_) {
      return null;
    }
  }

  String _timeLabel(GapItem gap) {
    final start = _parseStart(gap);
    if (start == null) return gap.dayOfWeek;
    return '${DateFormat.E().format(start)} ${DateFormat.jm().format(start)}';
  }

  double _scoreGap(GapItem gap) {
    final start = _parseStart(gap);
    final now = DateTime.now();

    final valueWeight = switch (strategyMode) {
      _StrategyMode.comeback => 0.7,
      _StrategyMode.premium => 0.85,
      _StrategyMode.protect => 0.55,
    };
    final slotWeight = switch (strategyMode) {
      _StrategyMode.comeback => 0.3,
      _StrategyMode.premium => 0.15,
      _StrategyMode.protect => 0.45,
    };
    var score = (gap.leakageValue * valueWeight) +
        (gap.bookableSlots * avgBookingValue * slotWeight);

    if (start != null) {
      final hoursUntil = start.difference(now).inHours;
      if (hoursUntil <= 24 && strategyMode != _StrategyMode.protect) {
        score += avgBookingValue * 0.9;
      } else if (hoursUntil <= 72 && strategyMode != _StrategyMode.protect) {
        score += avgBookingValue * 0.45;
      } else if (hoursUntil <= 12 && strategyMode == _StrategyMode.protect) {
        score += avgBookingValue * 0.3;
      }

      final hour = start.hour;
      if (strategyMode == _StrategyMode.protect && (hour < 10 || hour > 18)) {
        score -= avgBookingValue * 0.35;
      }
      if (strategyMode == _StrategyMode.premium && hour >= 11 && hour <= 16) {
        score += avgBookingValue * 0.3;
      }
    }

    if (isBumped(gap)) {
      score += avgBookingValue * 1.1;
    }

    return score;
  }

  @override
  Widget build(BuildContext context) {
    if (gaps.isEmpty) {
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
              'Priority Radar',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 6),
            Text(
              'No open gaps yet. Once synced, you can bump urgent slots and pin them to the top.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: SlotforceColors.textSecondary,
                  ),
            ),
          ],
        ),
      );
    }

    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);
    final scored = gaps
        .map((gap) => _ScoredGap(gap: gap, score: _scoreGap(gap)))
        .toList()
      ..sort((a, b) => b.score.compareTo(a.score));
    final top = scored.take(4).toList();
    final maxScore = top.first.score <= 0 ? 1.0 : top.first.score;
    final radarSubtitle = switch (strategyMode) {
      _StrategyMode.comeback =>
        'AI-weighted queue by urgency, value, and slot density.',
      _StrategyMode.premium =>
        'Ranking optimized for high-ticket opportunity windows.',
      _StrategyMode.protect =>
        'Ranking tuned for energy-safe wins and controlled pace.',
    };

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
            'Priority Radar',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            radarSubtitle,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 10),
          ...List.generate(
            top.length,
            (index) {
              final item = top[index];
              final pct = (item.score / maxScore).clamp(0.0, 1.0).toDouble();
              final scoreLabel = (pct * 100).round();
              final bumped = isBumped(item.gap);
              return Padding(
                padding:
                    EdgeInsets.only(bottom: index == top.length - 1 ? 0 : 10),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: () => onOpenGap(item.gap),
                    child: Ink(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: SlotforceColors.surfaceSoft,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: SlotforceColors.divider),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: SlotforceColors.primary
                                      .withValues(alpha: 0.14),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  '#${index + 1}',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: SlotforceColors.primaryDark,
                                        fontWeight: FontWeight.w800,
                                      ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _timeLabel(item.gap),
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        fontWeight: FontWeight.w700,
                                      ),
                                ),
                              ),
                              if (bumped) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: SlotforceColors.glamPink
                                        .withValues(alpha: 0.14),
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    'Bumped',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(
                                          color: SlotforceColors.glamPlum,
                                          fontWeight: FontWeight.w800,
                                        ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                              ],
                              Text(
                                currency.format(item.gap.leakageValue),
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: SlotforceColors.leakageRedDark,
                                      fontWeight: FontWeight.w800,
                                    ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 7, vertical: 4),
                                decoration: BoxDecoration(
                                  color: SlotforceColors.primary
                                      .withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  '$scoreLabel',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        color: SlotforceColors.primaryDark,
                                        fontWeight: FontWeight.w800,
                                      ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              OutlinedButton.icon(
                                onPressed: () => onBumpGap(item.gap),
                                icon: Icon(
                                  bumped
                                      ? Icons.bolt_rounded
                                      : Icons.bolt_outlined,
                                  size: 16,
                                ),
                                label: Text(
                                  bumped ? 'Unbump' : 'Bump',
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  bumped
                                      ? 'Pinned for immediate attention'
                                      : 'Boost this slot to the top',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: SlotforceColors.textSecondary,
                                      ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(999),
                            child: LinearProgressIndicator(
                              minHeight: 6,
                              value: pct,
                              backgroundColor: SlotforceColors.divider,
                              valueColor: const AlwaysStoppedAnimation(
                                  SlotforceColors.primary),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ScoredGap {
  const _ScoredGap({required this.gap, required this.score});

  final GapItem gap;
  final double score;
}

class _NoFilteredGaps extends StatelessWidget {
  const _NoFilteredGaps();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.white.withValues(alpha: 0.92),
            SlotforceColors.surfaceSoft,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SlotforceColors.divider),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: SlotforceColors.recoveredGreenLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.done_all_rounded,
              color: SlotforceColors.recoveredGreenDark,
              size: 19,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'No gaps in this filter right now. Try another view.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoadingHero extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 168,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withValues(alpha: 0.95),
            SlotforceColors.primaryLight.withValues(alpha: 0.2),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: SlotforceColors.primary.withValues(alpha: 0.15),
        ),
      ),
      child: const Padding(
        padding: EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _LoadingLine(width: 120, height: 14),
            SizedBox(height: 14),
            _LoadingLine(width: 220, height: 36),
            SizedBox(height: 10),
            _LoadingLine(width: 180, height: 13),
            Spacer(),
            Center(
              child: SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
            SizedBox(height: 6),
          ],
        ),
      ),
    );
  }
}

class _LoadingLine extends StatelessWidget {
  const _LoadingLine({required this.width, required this.height});

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(999),
      ),
    );
  }
}

class _LastSyncedRow extends StatelessWidget {
  const _LastSyncedRow({required this.lastSync});

  final DateTime lastSync;

  Color _urgencyColor() {
    final hours = DateTime.now().difference(lastSync).inHours;
    if (hours < 24) return SlotforceColors.recoveredGreen;
    if (hours < 72) return SlotforceColors.intentionalAmber;
    return SlotforceColors.leakageRed;
  }

  String _timeAgo() {
    final diff = DateTime.now().difference(lastSync);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: _urgencyColor().withValues(alpha: 0.35),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.sync_rounded,
            size: 14,
            color: _urgencyColor(),
          ),
          const SizedBox(width: 6),
          Text(
            'Last synced: ${_timeAgo()}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: _urgencyColor(),
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            SlotforceColors.leakageRedLight,
            SlotforceColors.leakageRedLight.withValues(alpha: 0.78),
          ],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: SlotforceColors.leakageRed.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 1),
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: SlotforceColors.leakageRed.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.error_outline_rounded,
              color: SlotforceColors.leakageRed,
              size: 16,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sync issue',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: SlotforceColors.leakageRedDark,
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 2),
                Text(
                  message,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: SlotforceColors.leakageRedDark,
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TrialBadge extends StatelessWidget {
  const _TrialBadge({required this.daysLeft});

  final int daysLeft;

  Color _color() {
    if (daysLeft <= 1) return SlotforceColors.trialRed;
    if (daysLeft <= 3) return SlotforceColors.trialAmber;
    return SlotforceColors.textSecondary;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color().withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        'Trial: ${daysLeft}d',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: _color(),
        ),
      ),
    );
  }
}

class _PaywallCTA extends StatelessWidget {
  const _PaywallCTA({required this.leakage, required this.onTap});

  final double leakage;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: SlotforceColors.paywallGradient,
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: SlotforceColors.primaryDark.withValues(alpha: 0.18),
              blurRadius: 22,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Unlock Pro Recovery',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Recover ${currency.format(leakage)} this week with guided workflows',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.84),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_rounded,
              color: Colors.white,
            ),
          ],
        ),
      ),
    );
  }
}
