import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/google_oauth_service.dart';
import 'sync_provider.dart';

final googleConnectionProvider =
    AsyncNotifierProvider<GoogleConnectionNotifier, bool>(
  GoogleConnectionNotifier.new,
);

class GoogleConnectionNotifier extends AsyncNotifier<bool> {
  @override
  Future<bool> build() async {
    final api = ref.read(socelleApiProvider);
    try {
      return await api.getGoogleConnectionStatus();
    } catch (_) {
      return false;
    }
  }

  /// Starts the Google OAuth flow and sends the server auth code to the
  /// backend, which exchanges it for a long-lived encrypted refresh token.
  ///
  /// Sets state to loading while the sign-in sheet is shown. If the user
  /// cancels, state is restored to [false] without throwing.
  Future<void> connect() async {
    state = const AsyncLoading();
    try {
      final authCode = await GoogleOAuthService.requestServerAuthCode();
      if (authCode == null) {
        // User cancelled the sign-in sheet — not an error.
        state = const AsyncData(false);
        return;
      }
      final api = ref.read(socelleApiProvider);
      await api.storeGoogleServerAuthCode(authCode);
      state = const AsyncData(true);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<void> disconnect() async {
    final api = ref.read(socelleApiProvider);
    await api.revokeGoogleTokens();
    await GoogleOAuthService.signOut();
    state = const AsyncData(false);
  }

  void setConnected(bool value) {
    state = AsyncData(value);
  }
}
