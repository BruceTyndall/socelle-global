import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../repositories/messaging/conversation_repository.dart';
import '../repositories/messaging/mock_conversation_repository.dart';

/// Provides the active [ConversationRepository] implementation.
///
/// DEFAULT: [MockConversationRepository] — returns hardcoded conversation data
/// so the Messages page UI works identically to its current state.
///
/// SWAP TO: [SupabaseConversationRepository] when Socelle backend is live.
/// To swap, change the body to:
///   return SupabaseConversationRepository();
/// and import 'package:socelle_mobile/repositories/messaging/supabase_conversation_repository.dart';
final messagingRepositoryProvider = Provider<ConversationRepository>((ref) {
  // ── Swap to SupabaseConversationRepository when Socelle backend is live ──
  return MockConversationRepository();
});
