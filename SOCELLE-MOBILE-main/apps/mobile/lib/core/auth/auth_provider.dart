import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../supabase/supabase_client.dart';

/// Manages authentication state via Supabase Auth and Riverpod.
///
/// Provides reactive auth state, current user, and auth operations
/// (sign in, sign up, sign out, password reset).

// ─── AUTH STATE STREAM ─────────────────────────────────────────────────────────

/// Streams Supabase auth state changes (sign in, sign out, token refresh).
final authStateProvider = StreamProvider<AuthState>((ref) {
  if (!SocelleSupabaseClient.isInitialized) {
    return const Stream.empty();
  }
  return SocelleSupabaseClient.client.auth.onAuthStateChange;
});

/// Provides the current [User] or null if unauthenticated.
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider).valueOrNull;
  if (authState != null) {
    return authState.session?.user;
  }
  if (SocelleSupabaseClient.isInitialized) {
    return SocelleSupabaseClient.client.auth.currentUser;
  }
  return null;
});

/// Whether a user is fully authenticated (not anonymous).
final isAuthenticatedProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return false;
  return !(user.isAnonymous ?? false);
});

// ─── AUTH NOTIFIER ─────────────────────────────────────────────────────────────

/// Auth operations notifier — handles sign in, sign up, sign out, reset.
final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthNotifierState>((ref) {
  return AuthNotifier();
});

enum AuthStatus { idle, loading, success, error }

class AuthNotifierState {
  const AuthNotifierState({
    this.status = AuthStatus.idle,
    this.errorMessage,
  });

  final AuthStatus status;
  final String? errorMessage;

  AuthNotifierState copyWith({AuthStatus? status, String? errorMessage}) {
    return AuthNotifierState(
      status: status ?? this.status,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthNotifierState> {
  AuthNotifier() : super(const AuthNotifierState());

  /// Sign in with email and password.
  Future<bool> signInWithEmail(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      if (!SocelleSupabaseClient.isInitialized) {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: 'Supabase not configured. Please check environment variables.',
        );
        return false;
      }
      await SocelleSupabaseClient.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      state = state.copyWith(status: AuthStatus.success);
      return true;
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'An unexpected error occurred. Please try again.',
      );
      return false;
    }
  }

  /// Create a new account with email and password.
  Future<bool> signUpWithEmail(String email, String password, {String? fullName}) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      if (!SocelleSupabaseClient.isInitialized) {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: 'Supabase not configured. Please check environment variables.',
        );
        return false;
      }
      await SocelleSupabaseClient.client.auth.signUp(
        email: email,
        password: password,
        data: fullName != null ? {'full_name': fullName} : null,
      );
      state = state.copyWith(status: AuthStatus.success);
      return true;
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'An unexpected error occurred. Please try again.',
      );
      return false;
    }
  }

  /// Send a password reset email.
  Future<bool> resetPassword(String email) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      if (!SocelleSupabaseClient.isInitialized) {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: 'Supabase not configured.',
        );
        return false;
      }
      await SocelleSupabaseClient.client.auth.resetPasswordForEmail(email);
      state = state.copyWith(status: AuthStatus.success);
      return true;
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'An unexpected error occurred.',
      );
      return false;
    }
  }

  /// Sign out the current user.
  Future<void> signOut() async {
    state = state.copyWith(status: AuthStatus.loading);
    await SocelleSupabaseClient.signOut();
    state = const AuthNotifierState();
  }

  /// Reset the notifier state to idle.
  void resetState() {
    state = const AuthNotifierState();
  }
}
