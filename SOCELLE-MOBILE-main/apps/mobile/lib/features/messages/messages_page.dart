import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/slotforce_colors.dart';

/// Client ↔ Pro Messaging Hub
/// Features: conversation threads, AI-suggested "I miss you" re-engagement
/// messages, booking nudges, and broadcast campaigns.
class MessagesPage extends StatefulWidget {
  const MessagesPage({super.key});

  @override
  State<MessagesPage> createState() => _MessagesPageState();
}

class _MessagesPageState extends State<MessagesPage> {
  final _searchController = TextEditingController();
  String _searchQuery = '';
  _InboxFilter _filter = _InboxFilter.all;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final clients = _kMockClients
        .where((c) {
          final matchesFilter = switch (_filter) {
            _InboxFilter.all => true,
            _InboxFilter.needsReply => c.needsReply,
            _InboxFilter.missYou => c.isMissYou,
            _InboxFilter.vip => c.isVip,
          };
          final matchesSearch = _searchQuery.isEmpty ||
              c.name.toLowerCase().contains(_searchQuery.toLowerCase());
          return matchesFilter && matchesSearch;
        })
        .toList();

    return Scaffold(
      backgroundColor: SlotforceColors.surfaceSoft,
      body: CustomScrollView(
        slivers: [
          _MessagesAppBar(
            searchController: _searchController,
            onSearch: (q) => setState(() => _searchQuery = q),
          ),
          // AI nudge banner
          SliverToBoxAdapter(child: _MissYouBanner()),
          // Filter chips
          SliverToBoxAdapter(
            child: _FilterChips(
              selected: _filter,
              onSelect: (f) => setState(() => _filter = f),
            ),
          ),
          // Conversation list
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) => _ConversationTile(client: clients[i]),
              childCount: clients.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
      floatingActionButton: _NewMessageFab(),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// App Bar with search
// ─────────────────────────────────────────────────────────────────────────────

class _MessagesAppBar extends StatelessWidget {
  const _MessagesAppBar({
    required this.searchController,
    required this.onSearch,
  });

  final TextEditingController searchController;
  final ValueChanged<String> onSearch;

  @override
  Widget build(BuildContext context) {
    return SliverAppBar(
      pinned: true,
      expandedHeight: 0,
      backgroundColor: SlotforceColors.surfaceSoft,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      title: Text(
        'Messages',
        style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: SlotforceColors.textPrimary,
              letterSpacing: -0.5,
            ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.campaign_rounded),
          color: SlotforceColors.textSecondary,
          tooltip: 'Broadcast campaign',
          onPressed: () {},
        ),
        const SizedBox(width: 4),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(52),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
          child: Container(
            height: 40,
            decoration: BoxDecoration(
              color: SlotforceColors.cardBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: SlotforceColors.divider),
            ),
            child: TextField(
              controller: searchController,
              onChanged: onSearch,
              style: const TextStyle(
                color: SlotforceColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              decoration: const InputDecoration(
                hintText: 'Search clients…',
                hintStyle: TextStyle(
                  color: SlotforceColors.textMuted,
                  fontSize: 14,
                ),
                prefixIcon: Icon(
                  Icons.search_rounded,
                  size: 18,
                  color: SlotforceColors.textMuted,
                ),
                border: InputBorder.none,
                contentPadding:
                    EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI "Miss You" Banner
// ─────────────────────────────────────────────────────────────────────────────

class _MissYouBanner extends StatefulWidget {
  @override
  State<_MissYouBanner> createState() => _MissYouBannerState();
}

class _MissYouBannerState extends State<_MissYouBanner>
    with SingleTickerProviderStateMixin {
  bool _dismissed = false;
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_dismissed) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      child: AnimatedBuilder(
        animation: _pulseAnim,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: SlotforceColors.glamHeroGradientColors,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: SlotforceColors.glamPlum.withValues(
                    alpha: 0.2 + (_pulseAnim.value * 0.22),
                  ),
                  blurRadius: 16 + (_pulseAnim.value * 14),
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: child,
          );
        },
        child: Stack(
          clipBehavior: Clip.hardEdge,
          children: [
            // Decorative orb
            Positioned(
              right: -10,
              bottom: -10,
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: SlotforceColors.accentGold.withValues(alpha: 0.15),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 40, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: SlotforceColors.accentGold
                              .withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.auto_awesome_rounded,
                                size: 10,
                                color: SlotforceColors.accentGold),
                            SizedBox(width: 4),
                            Text(
                              'AI Reconnect',
                              style: TextStyle(
                                color: SlotforceColors.accentGold,
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '4 clients haven\'t booked in 6+ weeks.',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Send a warm "I\'ve been thinking about your lashes" note — AI-written, sounds like you.',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.75),
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () {},
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 9),
                      decoration: BoxDecoration(
                        color: SlotforceColors.accentGold,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'Send Re-engagement Messages',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Dismiss
            Positioned(
              top: 10,
              right: 10,
              child: GestureDetector(
                onTap: () => setState(() => _dismissed = true),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.close_rounded,
                    size: 14,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter chips
// ─────────────────────────────────────────────────────────────────────────────

enum _InboxFilter { all, needsReply, missYou, vip }

class _FilterChips extends StatelessWidget {
  const _FilterChips({required this.selected, required this.onSelect});
  final _InboxFilter selected;
  final ValueChanged<_InboxFilter> onSelect;

  @override
  Widget build(BuildContext context) {
    const filters = [
      ('All', _InboxFilter.all, null),
      ('Needs reply', _InboxFilter.needsReply, SlotforceColors.leakageRed),
      ('Miss you 💕', _InboxFilter.missYou, SlotforceColors.accentRose),
      ('VIP', _InboxFilter.vip, SlotforceColors.accentGold),
    ];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Row(
        children: filters.map((f) {
          final isSelected = selected == f.$2;
          final accent = f.$3;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                onSelect(f.$2);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  color: isSelected
                      ? (accent ?? SlotforceColors.primary)
                      : SlotforceColors.cardBackground,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: isSelected
                        ? (accent ?? SlotforceColors.primary)
                        : SlotforceColors.divider,
                  ),
                ),
                child: Text(
                  f.$1,
                  style: TextStyle(
                    color: isSelected
                        ? Colors.white
                        : SlotforceColors.textSecondary,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversation Tile
// ─────────────────────────────────────────────────────────────────────────────

class _ConversationTile extends StatelessWidget {
  const _ConversationTile({required this.client});
  final _ClientData client;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        _openThread(context, client);
      },
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 10, 16, 0),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: SlotforceColors.cardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: client.needsReply
                ? SlotforceColors.leakageRed.withValues(alpha: 0.3)
                : SlotforceColors.divider,
          ),
          boxShadow: [
            BoxShadow(
              color: SlotforceColors.primaryDark.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            // Avatar
            Stack(
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: client.avatarGradient,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      client.initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
                if (client.isVip)
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        color: SlotforceColors.accentGold,
                        shape: BoxShape.circle,
                        border:
                            Border.all(color: Colors.white, width: 1.5),
                      ),
                      child: const Icon(
                        Icons.star_rounded,
                        size: 9,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          client.name,
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: SlotforceColors.textPrimary,
                                  ),
                        ),
                      ),
                      Text(
                        client.timeAgo,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: client.needsReply
                                  ? SlotforceColors.leakageRed
                                  : SlotforceColors.textMuted,
                              fontWeight: client.needsReply
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              fontSize: 11,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      if (client.isMissYou) ...[
                        Container(
                          margin: const EdgeInsets.only(right: 5),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: SlotforceColors.accentRose
                                .withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'I miss you 💕',
                            style: TextStyle(
                              color: SlotforceColors.accentRose,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                      Expanded(
                        child: Text(
                          client.lastMessage,
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: client.needsReply
                                        ? SlotforceColors.textPrimary
                                        : SlotforceColors.textMuted,
                                    fontWeight: client.needsReply
                                        ? FontWeight.w600
                                        : FontWeight.w500,
                                  ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  if (client.lastServiceDate != null) ...[
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        const Icon(
                          Icons.calendar_today_rounded,
                          size: 11,
                          color: SlotforceColors.textMuted,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          'Last: ${client.lastServiceDate}',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: SlotforceColors.textMuted,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                  ),
                        ),
                        if (client.ltv != null) ...[
                          const SizedBox(width: 10),
                          const Icon(
                            Icons.payments_rounded,
                            size: 11,
                            color: SlotforceColors.accentGoldDark,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            client.ltv!,
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color: SlotforceColors.accentGoldDark,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Unread badge or AI suggest
            if (client.unreadCount > 0)
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: SlotforceColors.leakageRed,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${client.unreadCount}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              )
            else if (client.hasAiSuggestion)
              Container(
                padding: const EdgeInsets.all(6),
                decoration: const BoxDecoration(
                  color: SlotforceColors.accentGoldLight,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  size: 14,
                  color: SlotforceColors.accentGoldDark,
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _openThread(BuildContext context, _ClientData client) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _ChatThreadPage(client: client),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Thread Page
// ─────────────────────────────────────────────────────────────────────────────

class _ChatThreadPage extends StatefulWidget {
  const _ChatThreadPage({required this.client});
  final _ClientData client;

  @override
  State<_ChatThreadPage> createState() => _ChatThreadPageState();
}

class _ChatThreadPageState extends State<_ChatThreadPage> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();
  bool _showAiSuggestion = true;

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final messages = widget.client.thread;

    return Scaffold(
      backgroundColor: SlotforceColors.surfaceSoft,
      appBar: AppBar(
        backgroundColor: SlotforceColors.surfaceSoft,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 18),
          color: SlotforceColors.textPrimary,
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: widget.client.avatarGradient,
                ),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  widget.client.initials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.client.name,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: SlotforceColors.textPrimary,
                      ),
                ),
                if (widget.client.lastServiceDate != null)
                  Text(
                    'Last visit: ${widget.client.lastServiceDate}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: SlotforceColors.textMuted,
                          fontSize: 11,
                        ),
                  ),
              ],
            ),
          ],
        ),
        actions: [
          if (widget.client.ltv != null)
            Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: SlotforceColors.accentGoldLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                widget.client.ltv!,
                style: const TextStyle(
                  color: SlotforceColors.accentGoldDark,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Message thread
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              itemCount: messages.length,
              itemBuilder: (context, i) => _MessageBubble(msg: messages[i]),
            ),
          ),
          // AI suggestion strip
          if (_showAiSuggestion && widget.client.hasAiSuggestion)
            _AiSuggestionStrip(
              suggestion: widget.client.aiSuggestion ?? '',
              onUse: (text) {
                _inputController.text = text;
                setState(() => _showAiSuggestion = false);
              },
              onDismiss: () => setState(() => _showAiSuggestion = false),
            ),
          // Input bar
          _MessageInputBar(
            controller: _inputController,
            onSend: _sendMessage,
          ),
        ],
      ),
    );
  }

  void _sendMessage() {
    if (_inputController.text.trim().isEmpty) return;
    HapticFeedback.mediumImpact();
    // In a real app this would push to Firestore
    _inputController.clear();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.msg});
  final _MessageData msg;

  @override
  Widget build(BuildContext context) {
    final isPro = msg.isFromPro;
    return Align(
      alignment: isPro ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.72,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          gradient: isPro
              ? const LinearGradient(
                  colors: SlotforceColors.glamHeroGradientColors,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isPro ? null : SlotforceColors.cardBackground,
          borderRadius: BorderRadius.circular(16).copyWith(
            bottomRight: isPro ? const Radius.circular(4) : null,
            bottomLeft: isPro ? null : const Radius.circular(4),
          ),
          border: isPro
              ? null
              : Border.all(color: SlotforceColors.divider),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              msg.text,
              style: TextStyle(
                color:
                    isPro ? Colors.white : SlotforceColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  msg.time,
                  style: TextStyle(
                    color: isPro
                        ? Colors.white.withValues(alpha: 0.6)
                        : SlotforceColors.textMuted,
                    fontSize: 11,
                  ),
                ),
                if (isPro && msg.isRead) ...[
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.done_all_rounded,
                    size: 13,
                    color: SlotforceColors.accentGold,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Suggestion Strip
// ─────────────────────────────────────────────────────────────────────────────

class _AiSuggestionStrip extends StatelessWidget {
  const _AiSuggestionStrip({
    required this.suggestion,
    required this.onUse,
    required this.onDismiss,
  });

  final String suggestion;
  final ValueChanged<String> onUse;
  final VoidCallback onDismiss;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SlotforceColors.accentGoldLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: SlotforceColors.accentGold.withValues(alpha: 0.4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.auto_awesome_rounded,
                size: 13,
                color: SlotforceColors.accentGoldDark,
              ),
              const SizedBox(width: 5),
              const Text(
                'AI suggested re-engagement',
                style: TextStyle(
                  color: SlotforceColors.accentGoldDark,
                  fontWeight: FontWeight.w800,
                  fontSize: 11,
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: onDismiss,
                child: const Icon(
                  Icons.close_rounded,
                  size: 14,
                  color: SlotforceColors.textMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '"$suggestion"',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: SlotforceColors.textSecondary,
                  fontStyle: FontStyle.italic,
                  height: 1.4,
                ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              GestureDetector(
                onTap: () => onUse(suggestion),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: SlotforceColors.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'Use this',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {},
                child: const Text(
                  'Try another',
                  style: TextStyle(
                    color: SlotforceColors.accentGoldDark,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Message Input Bar
// ─────────────────────────────────────────────────────────────────────────────

class _MessageInputBar extends StatelessWidget {
  const _MessageInputBar({
    required this.controller,
    required this.onSend,
  });

  final TextEditingController controller;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        decoration: const BoxDecoration(
          color: SlotforceColors.surfaceSoft,
          border: Border(
            top: BorderSide(color: SlotforceColors.divider),
          ),
        ),
        child: Row(
          children: [
            // AI suggestion trigger
            GestureDetector(
              onTap: () {},
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: SlotforceColors.accentGoldLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.auto_awesome_rounded,
                  size: 18,
                  color: SlotforceColors.accentGoldDark,
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Text field
            Expanded(
              child: Container(
                constraints: const BoxConstraints(maxHeight: 100),
                decoration: BoxDecoration(
                  color: SlotforceColors.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: SlotforceColors.divider),
                ),
                child: TextField(
                  controller: controller,
                  maxLines: null,
                  style: const TextStyle(
                    color: SlotforceColors.textPrimary,
                    fontSize: 14,
                  ),
                  decoration: const InputDecoration(
                    hintText: 'Type a message…',
                    hintStyle: TextStyle(
                      color: SlotforceColors.textMuted,
                      fontSize: 14,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Send button
            GestureDetector(
              onTap: onSend,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: SlotforceColors.glamHeroGradientColors,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.send_rounded,
                  size: 18,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// New Message FAB
// ─────────────────────────────────────────────────────────────────────────────

class _NewMessageFab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => HapticFeedback.mediumImpact(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: SlotforceColors.glamHeroGradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(999),
          boxShadow: [
            BoxShadow(
              color: SlotforceColors.glamPlum.withValues(alpha: 0.4),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.edit_rounded, color: Colors.white, size: 16),
            SizedBox(width: 6),
            Text(
              'New Message',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Models
// ─────────────────────────────────────────────────────────────────────────────

class _ClientData {
  const _ClientData({
    required this.name,
    required this.initials,
    required this.avatarGradient,
    required this.lastMessage,
    required this.timeAgo,
    required this.thread,
    this.lastServiceDate,
    this.ltv,
    this.unreadCount = 0,
    this.needsReply = false,
    this.isMissYou = false,
    this.isVip = false,
    this.hasAiSuggestion = false,
    this.aiSuggestion,
  });

  final String name;
  final String initials;
  final List<Color> avatarGradient;
  final String lastMessage;
  final String timeAgo;
  final List<_MessageData> thread;
  final String? lastServiceDate;
  final String? ltv;
  final int unreadCount;
  final bool needsReply;
  final bool isMissYou;
  final bool isVip;
  final bool hasAiSuggestion;
  final String? aiSuggestion;
}

class _MessageData {
  const _MessageData({
    required this.text,
    required this.time,
    required this.isFromPro,
    this.isRead = false,
  });

  final String text;
  final String time;
  final bool isFromPro;
  final bool isRead;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const _kMockClients = <_ClientData>[
  _ClientData(
    name: 'Jade Rivera',
    initials: 'JR',
    avatarGradient: [Color(0xFF5A2840), Color(0xFFC5A265)],
    lastMessage: 'OMG they look so good thank you!!',
    timeAgo: '2m ago',
    unreadCount: 2,
    needsReply: true,
    isVip: true,
    ltv: r'$2,340 LTV',
    lastServiceDate: 'Feb 19',
    thread: [
      _MessageData(
        text: 'Hi Jade! Just wanted to check in — how are you loving your lashes? 💕',
        time: '10:32 AM',
        isFromPro: true,
        isRead: true,
      ),
      _MessageData(
        text: 'OMG they look so good thank you!!',
        time: '10:41 AM',
        isFromPro: false,
      ),
      _MessageData(
        text: 'Can I book my refill for next week?',
        time: '10:41 AM',
        isFromPro: false,
      ),
    ],
    hasAiSuggestion: false,
  ),
  _ClientData(
    name: 'Mia Chen',
    initials: 'MC',
    avatarGradient: [Color(0xFF2D1525), Color(0xFF8C4A6E)],
    lastMessage: 'Sounds perfect, see you then! 🙌',
    timeAgo: '1h ago',
    isVip: true,
    ltv: r'$1,890 LTV',
    lastServiceDate: 'Feb 14',
    thread: [
      _MessageData(
        text: 'Hey Mia! I have a Thursday 2pm open — perfect timing for your refill!',
        time: '9:15 AM',
        isFromPro: true,
        isRead: true,
      ),
      _MessageData(
        text: 'Sounds perfect, see you then! 🙌',
        time: '9:22 AM',
        isFromPro: false,
      ),
    ],
    hasAiSuggestion: false,
  ),
  _ClientData(
    name: 'Aaliyah Foster',
    initials: 'AF',
    avatarGradient: [Color(0xFF7A3020), Color(0xFFC47A5A)],
    lastMessage: 'I\'ve been thinking about your lashes lately — it\'s been 7 weeks!',
    timeAgo: '3 days',
    isMissYou: true,
    lastServiceDate: 'Jan 4',
    ltv: r'$680 LTV',
    thread: [
      _MessageData(
        text: 'I\'ve been thinking about your lashes lately — it\'s been 7 weeks! Hope you\'re doing amazing. Ready to come back in? 💕',
        time: 'Jan 22',
        isFromPro: true,
        isRead: true,
      ),
    ],
    hasAiSuggestion: true,
    aiSuggestion: 'Hey Aaliyah! Missing your energy in the studio 💕 I have a cancellation this Thursday at 11am — first one to grab it gets my loyalty discount. Want me to hold it for you?',
  ),
  _ClientData(
    name: 'Priya Sharma',
    initials: 'PS',
    avatarGradient: [Color(0xFF1A3A5C), Color(0xFF4A6FA5)],
    lastMessage: 'Last seen 8 weeks ago',
    timeAgo: '8 wks',
    isMissYou: true,
    lastServiceDate: 'Dec 18',
    ltv: r'$520 LTV',
    thread: [
      _MessageData(
        text: 'Hi Priya! It\'s been a while — I\'d love to see you back in the chair. I have some gorgeous new lash styles I think you\'d love 🌟',
        time: 'Feb 1',
        isFromPro: true,
        isRead: true,
      ),
    ],
    hasAiSuggestion: true,
    aiSuggestion: 'Priya, I was just doing a deep lash set today and thought of you — you always loved that dramatic look. I have a rare Friday morning spot opening up this week. Want it? 🖤',
  ),
  _ClientData(
    name: 'Sofia Martínez',
    initials: 'SM',
    avatarGradient: [Color(0xFF3A6B4A), Color(0xFF7A9A78)],
    lastMessage: 'Thank you so much for the kit recommendation!',
    timeAgo: '2 days',
    lastServiceDate: 'Feb 17',
    ltv: r'$1,120 LTV',
    thread: [
      _MessageData(
        text: 'You\'re going to love the retention serum — apply it every 3 days! 🌿',
        time: 'Feb 17',
        isFromPro: true,
        isRead: true,
      ),
      _MessageData(
        text: 'Thank you so much for the kit recommendation!',
        time: 'Feb 19',
        isFromPro: false,
      ),
    ],
    hasAiSuggestion: false,
  ),
  _ClientData(
    name: 'Nadia Okonkwo',
    initials: 'NO',
    avatarGradient: [Color(0xFF2D2318), Color(0xFF8C6B3A)],
    lastMessage: 'Hey! Are you taking new clients?',
    timeAgo: '5h ago',
    needsReply: true,
    unreadCount: 1,
    lastServiceDate: null,
    thread: [
      _MessageData(
        text: 'Hey! Are you taking new clients? I\'ve been following you on Instagram and I\'m obsessed with your work 😍',
        time: '7:48 PM',
        isFromPro: false,
      ),
    ],
    hasAiSuggestion: true,
    aiSuggestion: 'Hi Nadia! Yes, I\'d love to have you! I have a new client consultation slot this Saturday at 10am — it\'s 15 mins and completely free. Want me to book you in? ✨',
  ),
];
