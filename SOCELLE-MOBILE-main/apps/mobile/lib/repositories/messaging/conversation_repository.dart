import '../../models/messaging/conversation.dart';
import '../../models/messaging/message.dart';

/// Backend-agnostic messaging interface.
///
/// Two implementations:
/// - [MockConversationRepository]    → returns hardcoded data (current default)
/// - [SupabaseConversationRepository] → connects to Socelle backend (stubbed)
///
/// Swap the active implementation in [messagingRepositoryProvider] when
/// Socelle backend is live.
abstract class ConversationRepository {
  /// Fetch all conversations for a user (unified inbox).
  ///
  /// Returns conversations sorted by [Conversation.lastMessageAt] descending.
  /// Excludes archived conversations unless [includeArchived] is true.
  Future<List<Conversation>> getConversations(
    String userId, {
    bool includeArchived = false,
  });

  /// Fetch all messages in a conversation, ordered by [Message.createdAt].
  Future<List<Message>> getMessages(String conversationId);

  /// Send a message in an existing conversation.
  ///
  /// Returns the created [Message] with server-assigned ID and timestamps.
  Future<Message> sendMessage(String conversationId, String body);

  /// Get the total unread message count across all conversations for a user.
  Future<int> getUnreadCount(String userId);
}
