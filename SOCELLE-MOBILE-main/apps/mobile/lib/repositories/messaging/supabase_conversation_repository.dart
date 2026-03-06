import '../../models/messaging/conversation.dart';
import '../../models/messaging/message.dart';
import 'conversation_repository.dart';

/// Supabase-backed conversation repository — connects to Socelle backend.
///
/// All methods currently throw [UnimplementedError]. Activate when:
/// 1. Socelle Supabase backend has the `conversations`, `messages`, and
///    `message_read_status` tables populated (see SOCELLE_MASTER_PROMPT § 12/14).
/// 2. `supabase_flutter` is added to pubspec.yaml.
/// 3. [SocelleSupabaseClient] is properly initialized with env credentials.
/// 4. Identity bridge maps Firebase UID → Socelle user ID.
/// 5. Supabase Realtime subscription wired for live message delivery.
///
/// Swap this in via [messagingRepositoryProvider] in providers/messaging_provider.dart.
class SupabaseConversationRepository implements ConversationRepository {
  @override
  Future<List<Conversation>> getConversations(
    String userId, {
    bool includeArchived = false,
  }) {
    // Connects to Socelle backend:
    // SELECT * FROM conversations
    // WHERE participant_one_id = $userId OR participant_two_id = $userId
    // ORDER BY last_message_at DESC
    throw UnimplementedError(
      'SupabaseConversationRepository.getConversations — '
      'connects to Socelle backend when live.',
    );
  }

  @override
  Future<List<Message>> getMessages(String conversationId) {
    // Connects to Socelle backend:
    // SELECT * FROM messages
    // WHERE conversation_id = $conversationId AND deleted_at IS NULL
    // ORDER BY created_at ASC
    throw UnimplementedError(
      'SupabaseConversationRepository.getMessages — '
      'connects to Socelle backend when live.',
    );
  }

  @override
  Future<Message> sendMessage(String conversationId, String body) {
    // Connects to Socelle backend:
    // INSERT INTO messages (conversation_id, sender_id, sender_role, body, message_type)
    // VALUES ($conversationId, auth.uid(), $role, $body, 'user')
    // RETURNING *
    throw UnimplementedError(
      'SupabaseConversationRepository.sendMessage — '
      'connects to Socelle backend when live.',
    );
  }

  @override
  Future<int> getUnreadCount(String userId) {
    // Connects to Socelle backend:
    // Count messages where conversation participant = userId
    // AND message.created_at > message_read_status.last_read_at
    throw UnimplementedError(
      'SupabaseConversationRepository.getUnreadCount — '
      'connects to Socelle backend when live.',
    );
  }
}
