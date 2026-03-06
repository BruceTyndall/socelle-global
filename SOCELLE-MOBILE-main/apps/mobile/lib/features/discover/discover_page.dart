import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/feature_flags.dart';
import '../../core/theme/socelle_design_system.dart';
import '../../data/models/brand.dart';
import '../../data/models/event.dart';
import '../../data/models/quiz.dart';
import '../../data/repositories/affiliate_repository.dart';
import '../../data/repositories/brands_repository.dart';
import '../../data/repositories/events_repository.dart';
import '../../data/repositories/quizzes_repository.dart';
import '../affiliate/affiliate_placement_card.dart';

// ─── Tab constants ────────────────────────────────────────────────────────────

const _kTabs = <String>['Brands', 'Events', 'Education', 'Products'];

// ─────────────────────────────────────────────────────────────────────────────
// Discover tab — Tab 1.
//
// Brands: sourced from [brands] table via [brandsProvider].
// Events: sourced from [socelle.events] table via [upcomingEventsProvider].
// Education (tab 2) is a stub pending M5.
// Products (tab 3) is powered by [AffiliateRepository] (FeatureFlags.kEnableAffiliateShop).
// ─────────────────────────────────────────────────────────────────────────────

class DiscoverPage extends ConsumerStatefulWidget {
  const DiscoverPage({super.key});

  @override
  ConsumerState<DiscoverPage> createState() => _DiscoverPageState();
}

class _DiscoverPageState extends ConsumerState<DiscoverPage> {
  int _selectedTab = 0;

  Future<void> _handleRefresh() async {
    if (_selectedTab == 0) {
      ref.read(brandsRepositoryProvider).invalidateCache();
      ref.invalidate(brandsProvider(null));
      try {
        await ref.read(brandsProvider(null).future);
      } catch (_) {}
    } else if (_selectedTab == 1) {
      ref.read(eventsRepositoryProvider).invalidateCache();
      ref.invalidate(upcomingEventsProvider(const <String>[]));
      try {
        await ref.read(upcomingEventsProvider(const <String>[]).future);
      } catch (_) {}
    } else if (_selectedTab == 2 && FeatureFlags.kEnableQuizzesTab) {
      ref.read(quizzesRepositoryProvider).invalidateCache();
      ref.invalidate(quizzesProvider); // invalidates all family instances
    } else if (_selectedTab == 3 && FeatureFlags.kEnableAffiliateShop) {
      ref.read(affiliateRepositoryProvider).invalidateCache();
      ref.invalidate(affiliateProductsProvider); // invalidates all family instances
    }
  }

  void _selectTab(int tab) {
    if (_selectedTab == tab) return;
    setState(() => _selectedTab = tab);
  }

  @override
  Widget build(BuildContext context) {
    return SocelleScaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _handleRefresh,
          color: SocelleColors.primaryCocoa,
          backgroundColor: SocelleColors.bgNearWhite,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // ── Header ──────────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SocelleSectionLabel('Discover'),
                      const SizedBox(height: 8),
                      const Text(
                        'Brands & Events',
                        style: SocelleText.displayMedium,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Explore brands, industry events, and CE education.',
                        style: SocelleText.bodyMedium,
                      ),
                      const SizedBox(height: 20),
                      // Tab filter chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            for (var i = 0; i < _kTabs.length; i++) ...[
                              SocelleChip(
                                label: _kTabs[i],
                                isSelected: _selectedTab == i,
                                onTap: () => _selectTab(i),
                              ),
                              if (i < _kTabs.length - 1)
                                const SizedBox(width: 8),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),

              // ── Tab content ──────────────────────────────────────────────
              if (_selectedTab == 0) ...[
                const _BrandsSliver(),
                if (FeatureFlags.kEnableAffiliateShop) const _AffiliateDiscoverSliver(),
              ] else if (_selectedTab == 1)
                const _EventsSliver()
              else if (_selectedTab == 2)
                (FeatureFlags.kEnableQuizzesTab
                    ? const _EducationSliver()
                    : _ComingSoonSliver(label: _kTabs[2]))
              else if (FeatureFlags.kEnableAffiliateShop)
                const _AffiliateProductsSliver()
              else
                _ComingSoonSliver(label: _kTabs[3]),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Brands sliver ────────────────────────────────────────────────────────────

class _BrandsSliver extends ConsumerWidget {
  const _BrandsSliver();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final brandsAsync = ref.watch(brandsProvider(null));

    return brandsAsync.when(
      loading: () => const SliverToBoxAdapter(child: _BrandsSkeleton()),
      error: (_, __) => SliverFillRemaining(
        hasScrollBody: false,
        child: _DiscoverError(
          message: 'Could not load brands',
          onRetry: () => ref.invalidate(brandsProvider(null)),
        ),
      ),
      data: (brands) => brands.isEmpty
          ? const SliverFillRemaining(
              hasScrollBody: false,
              child: _DiscoverEmpty(
                icon: Icons.store_outlined,
                message: 'No brands yet',
                detail: 'Brand profiles will appear here as they are added.',
              ),
            )
          : SliverPadding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              sliver: SliverList.separated(
                itemCount: brands.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) => _BrandCard(brand: brands[i]),
              ),
            ),
    );
  }
}

// ─── Events sliver ────────────────────────────────────────────────────────────

class _EventsSliver extends ConsumerWidget {
  const _EventsSliver();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventsAsync = ref.watch(upcomingEventsProvider(const <String>[]));

    return eventsAsync.when(
      loading: () => const SliverToBoxAdapter(child: _EventsSkeleton()),
      error: (_, __) => SliverFillRemaining(
        hasScrollBody: false,
        child: _DiscoverError(
          message: 'Could not load events',
          onRetry: () =>
              ref.invalidate(upcomingEventsProvider(const <String>[])),
        ),
      ),
      data: (events) => events.isEmpty
          ? const SliverFillRemaining(
              hasScrollBody: false,
              child: _DiscoverEmpty(
                icon: Icons.event_outlined,
                message: 'No upcoming events',
                detail: 'Industry events will appear here as they are added.',
              ),
            )
          : SliverPadding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              sliver: SliverList.separated(
                itemCount: events.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) => _EventCard(event: events[i]),
              ),
            ),
    );
  }
}

// ─── Coming soon sliver ───────────────────────────────────────────────────────

class _ComingSoonSliver extends StatelessWidget {
  const _ComingSoonSliver({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return SliverFillRemaining(
      hasScrollBody: false,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.construction_rounded,
                size: 48,
                color: SocelleColors.neutralBeige,
              ),
              const SizedBox(height: 16),
              Text('$label Coming Soon', style: SocelleText.headlineMedium),
              const SizedBox(height: 8),
              const Text(
                'This section is in development.',
                style: SocelleText.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Education sliver (Education tab, M5) ────────────────────────────────────

const _kEduCategories = <String?>[
  null, 'skincare', 'haircare', 'business', 'wellness',
];

const _kEduCategoryLabels = <String>[
  'All', 'Skincare', 'Haircare', 'Business', 'Wellness',
];

class _EducationSliver extends ConsumerStatefulWidget {
  const _EducationSliver();

  @override
  ConsumerState<_EducationSliver> createState() => _EducationSliverState();
}

class _EducationSliverState extends ConsumerState<_EducationSliver> {
  String? _selectedCategory;
  bool _ceOnly = false;

  @override
  Widget build(BuildContext context) {
    final contentAsync =
        ref.watch(quizzesProvider((_selectedCategory, _ceOnly)));

    return SliverMainAxisGroup(
      slivers: [
        // ── Filters: category chips + CE toggle ──
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (var i = 0; i < _kEduCategories.length; i++) ...[
                    SocelleChip(
                      label: _kEduCategoryLabels[i],
                      isSelected: _selectedCategory == _kEduCategories[i],
                      onTap: () {
                        if (_selectedCategory != _kEduCategories[i]) {
                          setState(
                            () => _selectedCategory = _kEduCategories[i],
                          );
                        }
                      },
                    ),
                    const SizedBox(width: 8),
                  ],
                  SocelleChip(
                    label: 'CE Only',
                    isSelected: _ceOnly,
                    onTap: () => setState(() => _ceOnly = !_ceOnly),
                  ),
                ],
              ),
            ),
          ),
        ),

        // ── Content ──
        contentAsync.when(
          loading: () =>
              const SliverToBoxAdapter(child: _EducationSkeleton()),
          error: (_, __) => SliverFillRemaining(
            hasScrollBody: false,
            child: _DiscoverError(
              message: 'Could not load education',
              onRetry: () =>
                  ref.invalidate(quizzesProvider((_selectedCategory, _ceOnly))),
            ),
          ),
          data: (items) => items.isEmpty
              ? const SliverFillRemaining(
                  hasScrollBody: false,
                  child: _DiscoverEmpty(
                    icon: Icons.school_outlined,
                    message: 'No content yet',
                    detail: 'CE courses and education will appear here soon.',
                  ),
                )
              : SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
                  sliver: SliverList.separated(
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, i) =>
                        _EducationCard(item: items[i]),
                  ),
                ),
        ),
      ],
    );
  }
}

// ─── Education card ───────────────────────────────────────────────────────────

class _EducationCard extends StatelessWidget {
  const _EducationCard({required this.item});

  final QuizItem item;

  ({String label, Color color}) _typeMeta(String type) => switch (type) {
        'ce_course' => (label: 'CE Course', color: SocelleColors.green400),
        'webinar' => (label: 'Webinar', color: SocelleColors.teal400),
        'video' => (label: 'Video', color: SocelleColors.blue400),
        'protocol' => (label: 'Protocol', color: SocelleColors.orange400),
        _ => (label: 'Article', color: SocelleColors.purple400),
      };

  String? get _durationLabel {
    final mins = item.durationMinutes;
    if (mins == null) return null;
    if (mins < 60) return '$mins min';
    final h = mins ~/ 60;
    final m = mins % 60;
    return m == 0 ? '${h}h' : '${h}h ${m}m';
  }

  String _ceLabel(double credits) {
    final isWhole = credits == credits.truncateToDouble();
    final amount =
        isWhole ? credits.toInt().toString() : credits.toStringAsFixed(1);
    return '$amount CE';
  }

  @override
  Widget build(BuildContext context) {
    final radius = SocelleRadius.card(context);
    final meta = _typeMeta(item.contentType);

    return ClipRRect(
      borderRadius: radius,
      child: SocelleCard(
        padding: EdgeInsets.zero,
        borderRadius: radius,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail (optional)
            if (item.thumbnailUrl != null)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  item.thumbnailUrl!,
                  fit: BoxFit.cover,
                  loadingBuilder: (_, child, progress) =>
                      progress == null ? child : Container(color: SocelleColors.bgAlt),
                  errorBuilder: (_, __, ___) =>
                      Container(color: SocelleColors.bgAlt),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Type badge + CE badge
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: meta.color.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          meta.label,
                          style: SocelleText.bodyMedium.copyWith(
                            fontSize: 11,
                            color: meta.color,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      if (item.isCeEligible) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: SocelleColors.green400.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            item.ceCredits != null
                                ? _ceLabel(item.ceCredits!)
                                : 'CE',
                            style: SocelleText.bodyMedium.copyWith(
                              fontSize: 11,
                              color: SocelleColors.green600,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Title
                  Text(
                    item.title,
                    style: SocelleText.bodyLarge,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  // Description
                  if (item.description != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      item.description!,
                      style: SocelleText.bodyMedium,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  const SizedBox(height: 12),

                  // Meta: difficulty + duration
                  Row(
                    children: [
                      if (item.difficulty != null) ...[
                        Text(
                          _capitalize(item.difficulty!),
                          style: SocelleText.bodyMedium.copyWith(fontSize: 12),
                        ),
                        if (_durationLabel != null) const SizedBox(width: 8),
                      ],
                      if (_durationLabel != null)
                        Text(
                          _durationLabel!,
                          style: SocelleText.bodyMedium.copyWith(fontSize: 12),
                        ),
                      const Spacer(),
                      const Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 12,
                        color: SocelleColors.neutralBeige,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _capitalize(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';
}

// ─── Education skeleton ───────────────────────────────────────────────────────

class _EducationSkeleton extends StatelessWidget {
  const _EducationSkeleton();

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
      child: Column(
        children: [
          for (var i = 0; i < 4; i++) ...[
            SocelleCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 70,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    height: 14,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: w * 0.55,
                    height: 14,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: w * 0.4,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}

// ─── Affiliate discover sliver (Brands tab, sponsored section) ────────────────

/// Shows up to 2 sponsored products below the brands list.
/// Returns an empty sliver when [affiliatePlacementsProvider] has no results.
class _AffiliateDiscoverSliver extends ConsumerWidget {
  const _AffiliateDiscoverSliver();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final placements =
        ref.watch(affiliatePlacementsProvider('brand_page')).valueOrNull;
    if (placements == null || placements.isEmpty) {
      return const SliverToBoxAdapter();
    }

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SocelleSectionLabel('Sponsored'),
            const SizedBox(height: 12),
            for (var i = 0; i < placements.length; i++) ...[
              AffiliatePlacementCard(product: placements[i]),
              if (i < placements.length - 1) const SizedBox(height: 12),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Affiliate products sliver (Products tab) ─────────────────────────────────

class _AffiliateProductsSliver extends ConsumerStatefulWidget {
  const _AffiliateProductsSliver();

  @override
  ConsumerState<_AffiliateProductsSliver> createState() =>
      _AffiliateProductsSliverState();
}

class _AffiliateProductsSliverState
    extends ConsumerState<_AffiliateProductsSliver> {
  String? _selectedCategory; // null = All

  static const _kProductCategories = <String?>[
    null, 'skincare', 'haircare', 'tools', 'wellness', 'business',
  ];

  static const _kProductCategoryLabels = <String>[
    'All', 'Skincare', 'Haircare', 'Tools', 'Wellness', 'Business',
  ];

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(affiliateProductsProvider(_selectedCategory));

    return SliverMainAxisGroup(
      slivers: [
        // ── Category chips ──
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (var i = 0; i < _kProductCategories.length; i++) ...[
                    SocelleChip(
                      label: _kProductCategoryLabels[i],
                      isSelected: _selectedCategory == _kProductCategories[i],
                      onTap: () {
                        if (_selectedCategory != _kProductCategories[i]) {
                          setState(
                            () => _selectedCategory = _kProductCategories[i],
                          );
                        }
                      },
                    ),
                    if (i < _kProductCategories.length - 1)
                      const SizedBox(width: 8),
                  ],
                ],
              ),
            ),
          ),
        ),

        // ── Products content ──
        productsAsync.when(
          loading: () => const SliverToBoxAdapter(child: _ProductsSkeleton()),
          error: (_, __) => SliverFillRemaining(
            hasScrollBody: false,
            child: _DiscoverError(
              message: 'Could not load products',
              onRetry: () =>
                  ref.invalidate(affiliateProductsProvider(_selectedCategory)),
            ),
          ),
          data: (products) => products.isEmpty
              ? const SliverFillRemaining(
                  hasScrollBody: false,
                  child: _DiscoverEmpty(
                    icon: Icons.shopping_bag_outlined,
                    message: 'No products yet',
                    detail:
                        'Curated professional products will appear here soon.',
                  ),
                )
              : SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
                  sliver: SliverList.separated(
                    itemCount: products.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, i) =>
                        AffiliatePlacementCard(product: products[i]),
                  ),
                ),
        ),
      ],
    );
  }
}

// ─── Products skeleton ────────────────────────────────────────────────────────

class _ProductsSkeleton extends StatelessWidget {
  const _ProductsSkeleton();

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
      child: Column(
        children: [
          for (var i = 0; i < 3; i++) ...[
            SocelleCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image placeholder (4:3 ratio)
                  Container(
                    width: double.infinity,
                    height: (w - 48) * 0.75,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    height: 14,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: w * 0.4,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}

// ─── Error & empty states ─────────────────────────────────────────────────────

class _DiscoverError extends StatelessWidget {
  const _DiscoverError({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.wifi_off_rounded,
              size: 48,
              color: SocelleColors.neutralBeige,
            ),
            const SizedBox(height: 16),
            Text(message, style: SocelleText.headlineMedium),
            const SizedBox(height: 8),
            const Text(
              'Pull down to refresh or tap retry.',
              style: SocelleText.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SocellePillButton(
              label: 'Retry',
              onTap: onRetry,
              variant: PillVariant.secondary,
              tone: PillTone.light,
              size: PillSize.small,
            ),
          ],
        ),
      ),
    );
  }
}

class _DiscoverEmpty extends StatelessWidget {
  const _DiscoverEmpty({
    required this.icon,
    required this.message,
    required this.detail,
  });

  final IconData icon;
  final String message;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: SocelleColors.neutralBeige),
            const SizedBox(height: 16),
            Text(message, style: SocelleText.headlineMedium),
            const SizedBox(height: 8),
            Text(
              detail,
              style: SocelleText.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Brands skeleton ──────────────────────────────────────────────────────────

class _BrandsSkeleton extends StatelessWidget {
  const _BrandsSkeleton();

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
      child: Column(
        children: [
          for (var i = 0; i < 5; i++) ...[
            SocelleCard(
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: double.infinity,
                          height: 13,
                          decoration: BoxDecoration(
                            color:
                                SocelleColors.neutralBeige.withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: w * 0.35,
                          height: 10,
                          decoration: BoxDecoration(
                            color:
                                SocelleColors.neutralBeige.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(5),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

// ─── Events skeleton ──────────────────────────────────────────────────────────

class _EventsSkeleton extends StatelessWidget {
  const _EventsSkeleton();

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
      child: Column(
        children: [
          for (var i = 0; i < 4; i++) ...[
            SocelleCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 80,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    height: 14,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: w * 0.5,
                    height: 14,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    width: w * 0.4,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: w * 0.3,
                    height: 10,
                    decoration: BoxDecoration(
                      color: SocelleColors.neutralBeige.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}

// ─── Brand card ───────────────────────────────────────────────────────────────

class _BrandCard extends StatelessWidget {
  const _BrandCard({required this.brand});

  final Brand brand;

  @override
  Widget build(BuildContext context) {
    return SocelleCard(
      onTap: () {}, // Brand detail page — future agent
      child: Row(
        children: [
          // Logo or initials fallback
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: SocelleColors.bgAlt,
              borderRadius: BorderRadius.circular(14),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: brand.logoUrl != null
                  ? Image.network(
                      brand.logoUrl!,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) =>
                          _BrandInitials(brand.name),
                    )
                  : _BrandInitials(brand.name),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  brand.name,
                  style: SocelleText.bodyLarge,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (brand.description != null &&
                    brand.description!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      brand.description!,
                      style: SocelleText.bodyMedium,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          const Icon(
            Icons.chevron_right_rounded,
            size: 18,
            color: SocelleColors.neutralBeige,
          ),
        ],
      ),
    );
  }
}

class _BrandInitials extends StatelessWidget {
  const _BrandInitials(this.name);

  final String name;

  String get _initials {
    final words = name.trim().split(RegExp(r'\s+'));
    if (words.isEmpty) return '?';
    if (words.length == 1) return words[0][0].toUpperCase();
    return '${words[0][0]}${words[1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        _initials,
        style: SocelleText.headlineMedium.copyWith(fontWeight: FontWeight.w700),
      ),
    );
  }
}

// ─── Event card ───────────────────────────────────────────────────────────────

class _EventCard extends StatelessWidget {
  const _EventCard({required this.event});

  final SocelleEvent event;

  ({String label, Color color}) _typeMeta(String type) => switch (type) {
        'conference' => (label: 'Conference', color: SocelleColors.blue400),
        'training' => (label: 'Training', color: SocelleColors.green400),
        'webinar' => (label: 'Webinar', color: SocelleColors.teal400),
        'summit' => (label: 'Summit', color: SocelleColors.orange400),
        'tradeshow' => (label: 'Trade Show', color: SocelleColors.yellow400),
        'brand_education' => (label: 'Brand Ed', color: SocelleColors.purple400),
        'retreat' => (label: 'Retreat', color: SocelleColors.orange700),
        'networking' => (label: 'Networking', color: SocelleColors.neutralBeige),
        _ => (label: type, color: SocelleColors.neutralBeige),
      };

  String _formatDate(DateTime d) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[d.month - 1]} ${d.day}, ${d.year}';
  }

  String get _dateRange {
    final start = _formatDate(event.startDate);
    if (!event.isMultiDay) return start;
    return '$start – ${_formatDate(event.endDate!)}';
  }

  String get _location {
    if (event.isVirtual) return event.virtualPlatform ?? 'Online';
    if (event.city != null && event.state != null) {
      return '${event.city}, ${event.state}';
    }
    if (event.city != null) return event.city!;
    if (event.venueName != null) return event.venueName!;
    return 'Location TBD';
  }

  String _ceLabel(double credits) {
    final isWhole = credits == credits.truncateToDouble();
    final amount =
        isWhole ? credits.toInt().toString() : credits.toStringAsFixed(1);
    return '$amount CE hrs';
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final radius = SocelleRadius.card(context);
    final meta = _typeMeta(event.eventType);
    final url = (event.registrationUrl?.isNotEmpty ?? false)
        ? event.registrationUrl!
        : event.sourceUrl;

    return ClipRRect(
      borderRadius: radius,
      child: SocelleCard(
        padding: EdgeInsets.zero,
        borderRadius: radius,
        onTap: url.isNotEmpty ? () => _openUrl(url) : null,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero image (optional)
            if (event.heroImageUrl != null)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  event.heroImageUrl!,
                  fit: BoxFit.cover,
                  loadingBuilder: (_, child, progress) =>
                      progress == null ? child : Container(color: SocelleColors.bgAlt),
                  errorBuilder: (_, __, ___) =>
                      Container(color: SocelleColors.bgAlt),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges row: type + virtual + featured star
                  Row(
                    children: [
                      _TypeBadge(label: meta.label, color: meta.color),
                      if (event.isVirtual) ...[
                        const SizedBox(width: 8),
                        const _TypeBadge(
                          label: 'Virtual',
                          color: SocelleColors.teal400,
                        ),
                      ],
                      const Spacer(),
                      if (event.isFeatured)
                        const Icon(
                          Icons.star_rounded,
                          size: 16,
                          color: SocelleColors.yellow400,
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Name
                  Text(
                    event.name,
                    style: SocelleText.bodyLarge,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 10),

                  // Date
                  _IconRow(
                    icon: Icons.calendar_today_outlined,
                    label: _dateRange,
                  ),
                  const SizedBox(height: 5),

                  // Location
                  _IconRow(
                    icon: event.isVirtual
                        ? Icons.videocam_outlined
                        : Icons.location_on_outlined,
                    label: _location,
                    expand: true,
                  ),

                  // CE + price row
                  if (event.ceCreditsAvailable || event.priceDisplay != 'TBD')
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Row(
                        children: [
                          if (event.ceCreditsAvailable)
                            _CeBadge(
                              label: event.ceCreditsCount != null
                                  ? _ceLabel(event.ceCreditsCount!)
                                  : 'CE',
                            ),
                          const Spacer(),
                          Text(
                            event.priceDisplay,
                            style: SocelleText.bodyMedium.copyWith(
                              fontSize: 13,
                              color: event.isFree
                                  ? SocelleColors.green600
                                  : SocelleColors.primaryCocoa,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.open_in_new_rounded,
                            size: 13,
                            color: SocelleColors.neutralBeige,
                          ),
                        ],
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

// ─── Small reusable badge / row widgets ───────────────────────────────────────

class _TypeBadge extends StatelessWidget {
  const _TypeBadge({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: SocelleText.bodyMedium.copyWith(
          fontSize: 11,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _CeBadge extends StatelessWidget {
  const _CeBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: SocelleColors.green400.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: SocelleText.bodyMedium.copyWith(
          fontSize: 11,
          color: SocelleColors.green600,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _IconRow extends StatelessWidget {
  const _IconRow({
    required this.icon,
    required this.label,
    this.expand = false,
  });

  final IconData icon;
  final String label;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final text = Text(
      label,
      style: SocelleText.bodyMedium.copyWith(fontSize: 13),
      overflow: expand ? TextOverflow.ellipsis : null,
    );
    return Row(
      children: [
        Icon(icon, size: 13, color: SocelleColors.neutralBeige),
        const SizedBox(width: 6),
        expand ? Expanded(child: text) : text,
      ],
    );
  }
}
