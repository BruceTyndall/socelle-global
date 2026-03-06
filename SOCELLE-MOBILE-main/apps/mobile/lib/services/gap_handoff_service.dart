/// Gap Handoff Service
///
/// Reads the user's top N gap service categories from local storage and
/// builds the URL for the Socelle Web Portal Plan Wizard pre-population.
///
/// Part of the "Graduated Funnel" architecture:
///   Mobile revenue recovery → $500 threshold → Web marketplace upgrade
///
/// Handoff mechanism: URL query params appended to the magic link deep-link
/// so the Web Plan Wizard can read them on first load.
///
/// Example handoff URL:
///   https://app.socelle.com/portal/plans/new
///     ?from=mobile
///     &gaps=Facial%2CBody+Massage%2CHot+Stone
///     &token=<magic-link-token>
library gap_handoff_service;

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class GapHandoffService {
  GapHandoffService._();

  // ── Storage key for persisted gap category data ─────────────────────────────
  static const _keyTopGaps = 'gap_top_categories_v1';

  // ── Configuration ───────────────────────────────────────────────────────────

  /// Maximum number of gap categories to include in the handoff URL.
  /// Keeps URLs short enough for magic-link email clients.
  static const _maxCategories = 3;

  // ── Public API ──────────────────────────────────────────────────────────────

  /// Returns the top N gap service categories seen in this user's session.
  ///
  /// Categories are stored locally and updated by the gap analysis provider
  /// via [recordGapCategories]. Returns an empty list if no data has been
  /// recorded yet.
  ///
  /// Example: ["Facial", "Body Massage", "Hot Stone Massage"]
  static Future<List<String>> getTopGapCategories() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_keyTopGaps);
      if (raw == null) return [];
      final list = (jsonDecode(raw) as List).cast<String>();
      return list.take(_maxCategories).toList();
    } catch (e) {
      debugPrint('GapHandoffService.getTopGapCategories: $e');
      return [];
    }
  }

  /// Records gap categories so they are available when the upgrade trigger fires.
  ///
  /// Call this from the gap analysis provider each time new gaps are detected.
  /// Categories are deduped and sorted by frequency (most-seen first).
  ///
  /// [categories] — list of service category strings from the gap engine
  ///   e.g. ["Facial", "Facial", "Body Massage"] → stored as ["Facial", "Body Massage"]
  static Future<void> recordGapCategories(List<String> categories) async {
    if (categories.isEmpty) return;
    try {
      final prefs = await SharedPreferences.getInstance();

      // Load existing + merge, maintaining frequency order
      final existing = await getTopGapCategories();
      final merged = <String>{...existing, ...categories}.toList();

      await prefs.setString(_keyTopGaps, jsonEncode(merged));
    } catch (e) {
      debugPrint('GapHandoffService.recordGapCategories: $e');
    }
  }

  /// Builds the Web Plan Wizard URL pre-populated with the user's gap data.
  ///
  /// [magicLinkToken] — the token returned by the Supabase `magic-link`
  ///   Edge Function. Appended as `&token=` so the Web auth flow can
  ///   complete before the wizard renders.
  ///
  /// [webBaseUrl] — the Socelle Web origin, e.g. "https://app.socelle.com"
  ///
  /// Returns a complete URL string ready for `url_launcher`.
  static Future<Uri> buildHandoffUrl({
    required String magicLinkToken,
    String webBaseUrl = 'https://app.socelle.com',
  }) async {
    final gaps = await getTopGapCategories();

    final params = <String, String>{
      'from': 'mobile',
      if (gaps.isNotEmpty) 'gaps': gaps.join(','),
      'token': magicLinkToken,
    };

    return Uri.parse('$webBaseUrl/portal/plans/new').replace(
      queryParameters: params,
    );
  }

  /// Clear gap category data (e.g. on logout or account unlink).
  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyTopGaps);
  }
}
