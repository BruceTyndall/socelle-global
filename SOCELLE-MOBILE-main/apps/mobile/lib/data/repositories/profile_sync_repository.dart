import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'base_repository.dart';

/// Syncs business profile between Firebase (gap-recovery) and Supabase
/// (intelligence layer) via the IdentityBridge.
///
/// Table: public.user_profiles (Supabase)
class ProfileSyncRepository extends BaseRepository {
  const ProfileSyncRepository();

  /// Writes specialty and profile data to Supabase [user_profiles].
  ///
  /// Uses an upsert keyed on [supabaseUserId] so it is safe to call multiple
  /// times (idempotent). [profileData] keys must match columns in
  /// public.user_profiles (e.g. specialties text[], display_name text).
  Future<void> syncProfile({
    required String supabaseUserId,
    required Map<String, dynamic> profileData,
  }) async {
    await guardedFetch(
      () async {
        await supabase.from('user_profiles').upsert(
          {
            'id': supabaseUserId,
            ...profileData,
            'updated_at': DateTime.now().toUtc().toIso8601String(),
          },
          onConflict: 'id',
        );
      },
      fallback: null,
    );
  }
}

final profileSyncRepositoryProvider = Provider<ProfileSyncRepository>(
  (_) => const ProfileSyncRepository(),
);
