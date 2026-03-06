
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/feature_flags.dart';
import '../../core/theme/socelle_design_system.dart';
import '../../data/repositories/profile_sync_repository.dart';
import '../../data/repositories/segments_repository.dart';

import '../../services/supabase_client.dart';

// ─── Specialty constants ──────────────────────────────────────────────────────

const _kSpecialtyTags = <String, String>{
  'skincare': 'Skincare',
  'haircare': 'Haircare',
  'nails': 'Nails',
  'spa': 'Spa & Wellness',
  'barbering': 'Barbering',
  'makeup': 'Makeup',
  'business': 'Business',
  'wellness': 'Wellness',
};

// ─── Private providers ────────────────────────────────────────────────────────

/// Resolves the current user's Socelle Supabase UID.
///
/// Returns null when the user is not signed in or Supabase is not initialised.
final _currentSupabaseUserIdProvider = FutureProvider<String?>((ref) async {
  if (!SocelleSupabaseClient.isInitialized) return null;
  return SocelleSupabaseClient.client.auth.currentUser?.id;
});

// ─────────────────────────────────────────────────────────────────────────────
// Profile tab — Tab 4.
//
// Business profile, specialties, and settings merged into a single
// Socelle-themed surface.
//
// M7: Personalization Engine — when [FeatureFlags.kEnablePersonalization] is
// true, fetches the user's specialty tags from Supabase and shows an
// interactive chip selection panel backed by [ProfileSyncRepository].
// ─────────────────────────────────────────────────────────────────────────────

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  // Specialty selection local state
  Set<String> _selectedSpecialties = {};
  bool _specialtiesLoaded = false;
  bool _saving = false;

  /// One-time initialisation from the Supabase-loaded tag list.
  void _initSpecialties(List<String> tags) {
    if (!_specialtiesLoaded) {
      setState(() {
        _selectedSpecialties = Set<String>.from(tags);
        _specialtiesLoaded = true;
      });
    }
  }

  void _toggleSpecialty(String tag) {
    setState(() {
      if (_selectedSpecialties.contains(tag)) {
        _selectedSpecialties.remove(tag);
      } else {
        _selectedSpecialties.add(tag);
      }
    });
  }

  Future<void> _saveSpecialties(String supabaseUserId) async {
    setState(() => _saving = true);
    try {
      await ref.read(profileSyncRepositoryProvider).syncProfile(
        supabaseUserId: supabaseUserId,
        profileData: {'specialties': _selectedSpecialties.toList()},
      );
      // Bust the cached specialty tags so subsequent reads reflect changes.
      ref.read(segmentsRepositoryProvider).invalidateCache();
      ref.invalidate(specialtyTagsProvider(supabaseUserId));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // ── M7: Personalization — resolve Supabase UID + load specialties ─────────
    String? supabaseUserId;
    if (FeatureFlags.kEnablePersonalization) {
      final userIdAsync = ref.watch(_currentSupabaseUserIdProvider);
      supabaseUserId = userIdAsync.valueOrNull;

      if (supabaseUserId != null) {
        final tagsAsync = ref.watch(specialtyTagsProvider(supabaseUserId));
        tagsAsync.whenData(_initSpecialties);
      }
    }

    return SocelleScaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // ── Header ──────────────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SocelleSectionLabel('Profile'),
                    const SizedBox(height: 8),
                    const Text(
                      'Your Practice',
                      style: SocelleText.displayMedium,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Business profile, specialties, and preferences.',
                      style: SocelleText.bodyMedium,
                    ),
                    const SizedBox(height: 32),

                    // ── Avatar ─────────────────────────────────────────────
                    Center(
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: SocelleColors.bgAlt,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: SocelleColors.neutralBeige.withValues(alpha: 0.4),
                            width: 2,
                          ),
                        ),
                        child: const Icon(
                          Icons.person_outline_rounded,
                          size: 36,
                          color: SocelleColors.neutralBeige,
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // ── M7: Specialty selection panel ──────────────────────
                    if (FeatureFlags.kEnablePersonalization) ...[
                      _SpecialtiesPanel(
                        selectedSpecialties: _selectedSpecialties,
                        onToggle: _toggleSpecialty,
                        onSave: supabaseUserId != null
                            ? () => _saveSpecialties(supabaseUserId!)
                            : null,
                        saving: _saving,
                        linked: supabaseUserId != null,
                      ),
                      const SizedBox(height: 32),
                    ],
                  ],
                ),
              ),
            ),

            // ── Section cards ────────────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    for (final section in const [
                      _ProfileSection('Practice Details', Icons.store_outlined),
                      _ProfileSection('Specialties', Icons.favorite_outline_rounded),
                      _ProfileSection('Notifications', Icons.notifications_none_rounded),
                      _ProfileSection('Subscription', Icons.star_outline_rounded),
                      _ProfileSection('Support', Icons.help_outline_rounded),
                    ]) ...[
                      SocelleCard(
                        onTap: () {},
                        child: Row(
                          children: [
                            Icon(
                              section.icon,
                              size: 20,
                              color: SocelleColors.primaryCocoa,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                section.label,
                                style: SocelleText.bodyLarge,
                              ),
                            ),
                            const Icon(
                              Icons.chevron_right_rounded,
                              size: 18,
                              color: SocelleColors.neutralBeige,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Specialty panel (M7) ─────────────────────────────────────────────────────

class _SpecialtiesPanel extends StatelessWidget {
  const _SpecialtiesPanel({
    required this.selectedSpecialties,
    required this.onToggle,
    required this.onSave,
    required this.saving,
    required this.linked,
  });

  final Set<String> selectedSpecialties;
  final void Function(String tag) onToggle;
  final VoidCallback? onSave;
  final bool saving;
  final bool linked;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const SocelleSectionLabel('Your Specialties'),
            const Spacer(),
            if (linked)
              saving
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: SocelleColors.primaryCocoa,
                      ),
                    )
                  : GestureDetector(
                      onTap: onSave,
                      child: Text(
                        'Save',
                        style: SocelleText.bodyMedium.copyWith(
                          color: SocelleColors.primaryCocoa,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          linked
              ? 'Select the specialties that match your practice.'
              : 'Connect your Socelle account to enable personalization.',
          style: SocelleText.bodyMedium,
        ),
        if (linked) ...[
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final entry in _kSpecialtyTags.entries)
                SocelleChip(
                  label: entry.value,
                  isSelected: selectedSpecialties.contains(entry.key),
                  onTap: () => onToggle(entry.key),
                ),
            ],
          ),
        ],
      ],
    );
  }
}

// ─── Section card data ────────────────────────────────────────────────────────

class _ProfileSection {
  const _ProfileSection(this.label, this.icon);
  final String label;
  final IconData icon;
}
