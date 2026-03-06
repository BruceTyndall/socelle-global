/// Magic Link Service
///
/// Issues a Supabase magic link for the current user by calling the
/// `magic-link` Supabase Edge Function via the Supabase Flutter SDK,
/// then builds the Graduated Funnel handoff URL (with gap categories)
/// via [GapHandoffService].
///
/// Part of the "Graduated Funnel" architecture:
///   Mobile revenue recovery → $500 threshold → upgradeToWeb trigger
///   → magic link → Web Plan Wizard deep-link
///
/// Usage:
///   final result = await MagicLinkService.buildHandoffUri(email: userEmail);
///   if (result != null) {
///     await launchUrl(result.uri, mode: LaunchMode.externalApplication);
///   }
library magic_link_service;

import 'package:flutter/foundation.dart';
import 'gap_handoff_service.dart';
import 'supabase_client.dart';

/// Result object returned by [MagicLinkService.buildHandoffUri].
class MagicLinkResult {
  const MagicLinkResult({required this.uri, required this.expiresAt});

  /// The fully constructed handoff URL ready for [url_launcher].
  final Uri uri;

  /// ISO expiry timestamp from the Edge Function (for display purposes).
  final String expiresAt;
}

class MagicLinkService {
  MagicLinkService._();

  static const String _webBaseUrl = 'https://app.socelle.com';

  // ── Public API ──────────────────────────────────────────────────────────────

  /// Requests a magic link token from the `magic-link` Supabase Edge Function
  /// and returns a fully built handoff [Uri] with gap categories pre-populated.
  ///
  /// Returns `null` if Supabase is not initialized or the request fails.
  ///
  /// [email] — the current user's email address (from Firebase Auth profile
  ///   or collected during onboarding).
  static Future<MagicLinkResult?> buildHandoffUri({required String email}) async {
    if (!SocelleSupabaseClient.isInitialized) {
      debugPrint('MagicLinkService: Supabase not initialized — skipping magic link');
      return null;
    }

    try {
      final response = await SocelleSupabaseClient.client.functions.invoke(
        'magic-link',
        body: {
          'email': email,
          'redirectTo': '$_webBaseUrl/portal/plans/new',
        },
      );

      final data = response.data as Map<String, dynamic>?;
      if (data == null) {
        debugPrint('MagicLinkService: null response from Edge Function');
        return null;
      }

      final token = data['magicLinkToken'] as String?;
      final expiresAt = data['expiresAt'] as String? ?? '';

      if (token == null || token.isEmpty) {
        debugPrint('MagicLinkService: No token in Edge Function response');
        return null;
      }

      // Build the handoff URL with gap categories pre-populated
      final uri = await GapHandoffService.buildHandoffUrl(
        magicLinkToken: token,
        webBaseUrl: _webBaseUrl,
      );

      return MagicLinkResult(uri: uri, expiresAt: expiresAt);
    } catch (e) {
      debugPrint('MagicLinkService.buildHandoffUri: $e');
      return null;
    }
  }
}
