
import '../../models/messaging/conversation.dart';
import '../../models/messaging/message.dart';
import 'conversation_repository.dart';

/// Mock conversation repository — serves the existing Messages page UI with
/// hardcoded data so the current experience is unchanged.
///
/// This mirrors the `_kMockClients` data that was inline in messages_page.dart
/// but now lives behind the [ConversationRepository] interface so the UI can be
/// swapped to real Supabase data with zero page-level changes.
class MockConversationRepository implements ConversationRepository {
  static final _now = DateTime.now();
  static const _currentUserId = 'mock-user-pro-001';

  // ---------------------------------------------------------------------------
  // Mock conversations — mapped from the 6 _kMockClients in messages_page.dart
  // ---------------------------------------------------------------------------

  static final List<Conversation> _conversations = [
    Conversation(
      id: 'conv-001',
      type: ConversationType.direct,
      subject: null,
      participantOneId: _currentUserId,
      participantTwoId: 'client-jade-rivera',
      lastMessageAt: _now.subtract(const Duration(minutes: 2)),
      lastMessagePreview: 'Can I book my refill for next week?',
      createdAt: _now.subtract(const Duration(days: 90)),
      updatedAt: _now.subtract(const Duration(minutes: 2)),
    ),
    Conversation(
      id: 'conv-002',
      type: ConversationType.direct,
      subject: null,
      participantOneId: _currentUserId,
      participantTwoId: 'client-mia-chen',
      lastMessageAt: _now.subtract(const Duration(hours: 1)),
      lastMessagePreview: 'Sounds perfect, see you then! 🙌',
      createdAt: _now.subtract(const Duration(days: 60)),
      updatedAt: _now.subtract(const Duration(hours: 1)),
    ),
    Conversation(
      id: 'conv-003',
      type: ConversationType.direct,
      subject: null,
      participantOneId: _currentUserId,
      participantTwoId: 'client-aaliyah-foster',
      lastMessageAt: _now.subtract(const Duration(days: 3)),
      lastMessagePreview:
          "I've been thinking about your lashes lately — it's been 7 weeks!",
      createdAt: _now.subtract(const Duration(days: 180)),
      updatedAt: _now.subtract(const Duration(days: 3)),
    ),
    Conversation(
      id: 'conv-004',
      type: ConversationType.direct,
      subject: null,
      participantOneId: _currentUserId,
      participantTwoId: 'client-priya-sharma',
      lastMessageAt: _now.subtract(const Duration(days: 56)),
      lastMessagePreview: 'Last seen 8 weeks ago',
      createdAt: _now.subtract(const Duration(days: 200)),
      updatedAt: _now.subtract(const Duration(days: 56)),
    ),
    Conversation(
      id: 'conv-005',
      type: ConversationType.direct,
      subject: null,
      participantOneId: _currentUserId,
      participantTwoId: 'client-sofia-martinez',
      lastMessageAt: _now.subtract(const Duration(days: 2)),
      lastMessagePreview: 'Thank you so much for the kit recommendation!',
      createdAt: _now.subtract(const Duration(days: 120)),
      updatedAt: _now.subtract(const Duration(days: 2)),
    ),
    Conversation(
      id: 'conv-006',
      type: ConversationType.direct,
      subject: null,
      participantOneId: _currentUserId,
      participantTwoId: 'client-nadia-okonkwo',
      lastMessageAt: _now.subtract(const Duration(hours: 5)),
      lastMessagePreview: 'Hey! Are you taking new clients?',
      createdAt: _now.subtract(const Duration(hours: 5)),
      updatedAt: _now.subtract(const Duration(hours: 5)),
    ),
  ];

  static final Map<String, List<Message>> _messagesByConversation = {
    'conv-001': [
      Message(
        id: 'msg-001-a',
        conversationId: 'conv-001',
        senderId: _currentUserId,
        senderRole: 'provider',
        body:
            'Hi Jade! Just wanted to check in — how are you loving your lashes? 💕',
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(minutes: 10)),
        updatedAt: _now.subtract(const Duration(minutes: 10)),
      ),
      Message(
        id: 'msg-001-b',
        conversationId: 'conv-001',
        senderId: 'client-jade-rivera',
        senderRole: 'client',
        body: 'OMG they look so good thank you!!',
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(minutes: 3)),
        updatedAt: _now.subtract(const Duration(minutes: 3)),
      ),
      Message(
        id: 'msg-001-c',
        conversationId: 'conv-001',
        senderId: 'client-jade-rivera',
        senderRole: 'client',
        body: 'Can I book my refill for next week?',
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(minutes: 2)),
        updatedAt: _now.subtract(const Duration(minutes: 2)),
      ),
    ],
    'conv-002': [
      Message(
        id: 'msg-002-a',
        conversationId: 'conv-002',
        senderId: _currentUserId,
        senderRole: 'provider',
        body:
            'Hey Mia! I have a Thursday 2pm open — perfect timing for your refill!',
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(hours: 2)),
        updatedAt: _now.subtract(const Duration(hours: 2)),
      ),
      Message(
        id: 'msg-002-b',
        conversationId: 'conv-002',
        senderId: 'client-mia-chen',
        senderRole: 'client',
        body: 'Sounds perfect, see you then! 🙌',
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(hours: 1)),
        updatedAt: _now.subtract(const Duration(hours: 1)),
      ),
    ],
    'conv-003': [
      Message(
        id: 'msg-003-a',
        conversationId: 'conv-003',
        senderId: _currentUserId,
        senderRole: 'provider',
        body:
            "I've been thinking about your lashes lately — it's been 7 weeks! Hope you're doing amazing. Ready to come back in? 💕",
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(days: 34)),
        updatedAt: _now.subtract(const Duration(days: 34)),
      ),
    ],
    'conv-004': [
      Message(
        id: 'msg-004-a',
        conversationId: 'conv-004',
        senderId: _currentUserId,
        senderRole: 'provider',
        body:
            "Hi Priya! It's been a while — I'd love to see you back in the chair. I have some gorgeous new lash styles I think you'd love 🌟",
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(days: 24)),
        updatedAt: _now.subtract(const Duration(days: 24)),
      ),
    ],
    'conv-005': [
      Message(
        id: 'msg-005-a',
        conversationId: 'conv-005',
        senderId: _currentUserId,
        senderRole: 'provider',
        body:
            "You're going to love the retention serum — apply it every 3 days! 🌿",
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(days: 8)),
        updatedAt: _now.subtract(const Duration(days: 8)),
      ),
      Message(
        id: 'msg-005-b',
        conversationId: 'conv-005',
        senderId: 'client-sofia-martinez',
        senderRole: 'client',
        body: 'Thank you so much for the kit recommendation!',
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(days: 2)),
        updatedAt: _now.subtract(const Duration(days: 2)),
      ),
    ],
    'conv-006': [
      Message(
        id: 'msg-006-a',
        conversationId: 'conv-006',
        senderId: 'client-nadia-okonkwo',
        senderRole: 'client',
        body:
            "Hey! Are you taking new clients? I've been following you on Instagram and I'm obsessed with your work 😍",
        messageType: MessageType.user,
        createdAt: _now.subtract(const Duration(hours: 5)),
        updatedAt: _now.subtract(const Duration(hours: 5)),
      ),
    ],
  };

  @override
  Future<List<Conversation>> getConversations(
    String userId, {
    bool includeArchived = false,
  }) async {
    await Future.delayed(const Duration(milliseconds: 100));
    var results = _conversations.where((c) => !c.isArchived || includeArchived);
    return results.toList()
      ..sort((a, b) {
        final aTime = a.lastMessageAt ?? a.createdAt;
        final bTime = b.lastMessageAt ?? b.createdAt;
        return bTime.compareTo(aTime); // Most recent first.
      });
  }

  @override
  Future<List<Message>> getMessages(String conversationId) async {
    await Future.delayed(const Duration(milliseconds: 80));
    return _messagesByConversation[conversationId] ?? [];
  }

  @override
  Future<Message> sendMessage(String conversationId, String body) async {
    await Future.delayed(const Duration(milliseconds: 150));
    final message = Message(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      conversationId: conversationId,
      senderId: _currentUserId,
      senderRole: 'provider',
      body: body,
      messageType: MessageType.user,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    // Append to in-memory thread for the duration of this session.
    _messagesByConversation.putIfAbsent(conversationId, () => []);
    _messagesByConversation[conversationId]!.add(message);
    return message;
  }

  @override
  Future<int> getUnreadCount(String userId) async {
    await Future.delayed(const Duration(milliseconds: 50));
    // Mock: 3 unread (Jade's 2 + Nadia's 1).
    return 3;
  }
}
