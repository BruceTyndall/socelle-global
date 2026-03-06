import 'package:google_sign_in/google_sign_in.dart';

import '../core/constants.dart';

/// Handles the Google Sign-In flow for Calendar access.
///
/// Uses the OAuth server-side flow: the app obtains a one-time server auth
/// code which the backend [storeCalendarTokens] CF exchanges for a long-lived
/// refresh token stored encrypted in Firestore.
///
/// Setup checklist:
///   1. Set [SocelleConstants.googleServerClientId] to your Web Client ID.
///   2. In Xcode → Runner → Info → URL Types, add an entry whose URL Schemes
///      value is the REVERSED_CLIENT_ID from GoogleService-Info.plist
///      (e.g. com.googleusercontent.apps.XXXXX-YYY).
///   3. Ensure your Firebase project's Google Sign-In has the iOS bundle ID
///      registered as an authorised iOS app.
class GoogleOAuthService {
  static final _googleSignIn = GoogleSignIn(
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    serverClientId: SocelleConstants.googleServerClientId,
  );

  /// Presents the Google account chooser and returns a one-time server auth
  /// code on success, or [null] if the user cancelled or an error occurred.
  ///
  /// The auth code must be sent to the backend within a few minutes — it
  /// expires after a single use.
  static Future<String?> requestServerAuthCode() async {
    try {
      // Always sign out first so the account picker is shown every time.
      await _googleSignIn.signOut();
      final account = await _googleSignIn.signIn();
      if (account == null) return null; // user cancelled
      return account.serverAuthCode;
    } catch (_) {
      return null;
    }
  }

  /// Signs the current user out of Google Sign-In on this device.
  static Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {
      // Ignore sign-out errors — not critical.
    }
  }
}
