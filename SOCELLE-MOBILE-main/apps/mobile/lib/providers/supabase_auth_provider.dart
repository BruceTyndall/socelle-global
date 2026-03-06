import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/supabase_client.dart';

/// Provides the current Supabase authentication state.
/// Useful for determining if a user is logged in.
final authStateProvider = StreamProvider<AuthState>((ref) {
  if (!SocelleSupabaseClient.isInitialized) {
    return const Stream.empty();
  }
  return SocelleSupabaseClient.client.auth.onAuthStateChange;
});

/// Provides the current logged-in user, or null if unauthenticated.
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider).valueOrNull;
  
  if (authState != null) {
    return authState.session?.user;
  }
  
  // Fallback to current user if stream hasn't emitted yet but we're initialized
  if (SocelleSupabaseClient.isInitialized) {
    return SocelleSupabaseClient.client.auth.currentUser;
  }
  
  return null;
});

/// A boolean provider that simply says whether the user is fully logged in.
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});
