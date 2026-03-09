import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, ChevronRight, Store, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

// ── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  type: string;
  subject: string | null;
  brand_id: string | null;
  brand_name: string | null;
  brand_slug: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
}

interface Message {
  id: string;
  sender_id: string | null;
  sender_role: string | null;
  body: string;
  created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: Map<string, Message[]> = new Map();
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toLocaleDateString([], {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(msg);
  }
  return Array.from(groups.entries()).map(([date, messages]) => ({ date, messages }));
}

// ── Conversation List Item ────────────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 border-b border-accent-soft transition-colors ${
        isActive ? 'bg-accent-soft' : 'hover:bg-accent-soft/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-graphite" />
          </div>
          <span className="font-medium text-graphite font-sans text-sm truncate">
            {conv.type === 'order_linked' && conv.subject ? conv.subject : (conv.brand_name || 'Socelle')}
          </span>
        </div>
        <span className="text-xs text-graphite/60 font-sans flex-shrink-0">
          {formatTime(conv.last_message_at)}
        </span>
      </div>
      {conv.type === 'order_linked' && conv.brand_name && (
        <p className="text-xs text-graphite/60 font-sans truncate pl-10">{conv.brand_name}</p>
      )}
      {conv.last_message_preview && (conv.type !== 'order_linked' || !conv.brand_name) && (
        <p className="text-xs text-graphite/60 font-sans truncate pl-10">
          {conv.last_message_preview}
        </p>
      )}
    </button>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm font-sans leading-relaxed ${
          isOwn
            ? 'bg-graphite text-white rounded-br-sm'
            : 'bg-white border border-accent-soft text-graphite rounded-bl-sm'
        }`}
      >
        {msg.body}
        <div className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-graphite/60'}`}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// ── Empty States ──────────────────────────────────────────────────────────────

function EmptyInbox() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-accent-soft" />
      </div>
      <h3 className="text-lg font-sans text-graphite mb-2">No messages yet</h3>
      <p className="text-sm text-graphite/60 font-sans max-w-xs mb-6">
        When you start a conversation with a brand, it'll appear here.
      </p>
      <Link
        to="/brands"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-graphite text-white rounded-lg text-sm font-medium font-sans hover:bg-graphite transition-colors"
      >
        Browse Brands
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function SelectConversation() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-accent-soft" />
      </div>
      <h3 className="text-base font-sans font-medium text-graphite mb-1">
        Select a conversation
      </h3>
      <p className="text-sm text-graphite/60 font-sans">
        Choose a conversation from the list to view messages
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BusinessMessages() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversation');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [showThread, setShowThread] = useState(false); // mobile: show thread panel
  const [urlSelectAttempted, setUrlSelectAttempted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch conversations ───────────────────────────────────────────────────

  const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
    if (!user) return [];
    try {
      const [p1Res, p2Res] = await Promise.all([
        supabase
          .from('conversations')
          .select('id, type, subject, brand_id, last_message_at, last_message_preview, brands(name, slug)')
          .eq('participant_one_id', user.id)
          .eq('is_archived', false)
          .order('last_message_at', { ascending: false, nullsFirst: false }),
        supabase
          .from('conversations')
          .select('id, type, subject, brand_id, last_message_at, last_message_preview, brands(name, slug)')
          .eq('participant_two_id', user.id)
          .eq('is_archived', false)
          .order('last_message_at', { ascending: false, nullsFirst: false }),
      ]);

      const all = [...(p1Res.data ?? []), ...(p2Res.data ?? [])];
      const seen = new Set<string>();
      const deduped = all
        .filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
        .sort((a, b) => {
          if (!a.last_message_at) return 1;
          if (!b.last_message_at) return -1;
          return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
        });

      const list = deduped.map(c => {
        const brand = c.brands as unknown as { name: string; slug: string } | null;
        return {
          id: c.id,
          type: c.type,
          subject: c.subject ?? null,
          brand_id: c.brand_id,
          brand_name: brand?.name ?? null,
          brand_slug: brand?.slug ?? null,
          last_message_at: c.last_message_at,
          last_message_preview: c.last_message_preview,
        };
      });
      setConversations(list);
      return list;
    } finally {
      setLoadingConvs(false);
    }
  }, [user]);

  // ── Fetch thread ──────────────────────────────────────────────────────────

  const fetchThread = useCallback(async (convId: string) => {
    setLoadingThread(true);
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, sender_role, body, created_at')
      .eq('conversation_id', convId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    setMessages((data ?? []) as Message[]);
    setLoadingThread(false);
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!user || !activeConv || !newMessage.trim() || sending) return;
    setSending(true);
    const body = newMessage.trim();
    setNewMessage('');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConv.id,
        sender_id: user.id,
        sender_role: profile?.role ?? 'business_user',
        body,
      })
      .select('id, sender_id, sender_role, body, created_at')
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, data as Message]);

      // Update conversation preview optimistically
      const preview = body.slice(0, 120);
      const now = new Date().toISOString();
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConv.id
            ? { ...c, last_message_at: now, last_message_preview: preview }
            : c
        )
      );

      // Persist preview to DB (best-effort)
      supabase
        .from('conversations')
        .update({ last_message_at: now, last_message_preview: preview })
        .eq('id', activeConv.id)
        .then(() => {});
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConv(conv);
    setShowThread(true);
    fetchThread(conv.id);
  };

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Open conversation from ?conversation= id (e.g. from Order detail "Message about this order")
  useEffect(() => {
    if (!conversationIdFromUrl || loadingConvs) return;
    const conv = conversations.find(c => c.id === conversationIdFromUrl);
    if (conv) {
      setActiveConv(conv);
      setShowThread(true);
      fetchThread(conv.id);
      setUrlSelectAttempted(true);
    } else if (!urlSelectAttempted) {
      setUrlSelectAttempted(true);
      fetchConversations().then((list) => {
        const c = list.find(x => x.id === conversationIdFromUrl);
        if (c) {
          setActiveConv(c);
          setShowThread(true);
          fetchThread(c.id);
        }
      });
    }
  }, [conversationIdFromUrl, loadingConvs, conversations, urlSelectAttempted, fetchConversations, fetchThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeConv && !loadingThread) {
      inputRef.current?.focus();
    }
  }, [activeConv, loadingThread]);

  // ── Render ────────────────────────────────────────────────────────────────

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex h-[calc(100vh-11rem)] bg-white rounded-xl border border-accent-soft overflow-hidden">

      {/* ── Left panel: conversation list ──────────────────────────────── */}
      <div
        className={`w-full md:w-80 flex-shrink-0 border-r border-accent-soft flex flex-col ${
          showThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="px-4 py-4 border-b border-accent-soft">
          <h2 className="font-sans text-graphite text-lg">Messages</h2>
          <p className="text-xs text-graphite/60 font-sans mt-0.5">
            Brand conversations
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-soft" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-accent-soft rounded w-3/4" />
                      <div className="h-2.5 bg-accent-soft rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <EmptyInbox />
          ) : (
            conversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeConv?.id === conv.id}
                onClick={() => handleSelectConversation(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: thread ─────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          showThread ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConv ? (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 border-b border-accent-soft flex items-center gap-3">
              {/* Mobile back button */}
              <button
                onClick={() => setShowThread(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-accent-soft transition-colors"
                aria-label="Back to inbox"
              >
                <ArrowLeft className="w-4 h-4 text-graphite" />
              </button>
              <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4 text-graphite" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-graphite font-sans text-sm truncate">
                  {activeConv.type === 'order_linked' && activeConv.subject
                    ? activeConv.subject
                    : (activeConv.brand_name ?? 'Socelle')}
                </p>
                {activeConv.type === 'order_linked' && activeConv.brand_name && (
                  <p className="text-xs text-graphite/60 font-sans">{activeConv.brand_name}</p>
                )}
                {activeConv.brand_slug && activeConv.type !== 'order_linked' && (
                  <Link
                    to={`/brands/${activeConv.brand_slug}`}
                    className="text-xs text-accent hover:text-graphite font-sans transition-colors"
                  >
                    View brand page →
                  </Link>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-background/40">
              {loadingThread ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-graphite/60 font-sans text-sm">
                    <Clock className="w-4 h-4 animate-spin" />
                    Loading messages…
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageSquare className="w-10 h-10 text-accent-soft mx-auto mb-3" />
                    <p className="text-sm text-graphite/60 font-sans">
                      No messages yet. Say hello!
                    </p>
                  </div>
                </div>
              ) : (
                grouped.map(({ date, messages: group }) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-accent-soft" />
                      <span className="text-xs text-graphite/60 font-sans font-medium px-2">
                        {date}
                      </span>
                      <div className="flex-1 h-px bg-accent-soft" />
                    </div>
                    {group.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isOwn={msg.sender_id === user?.id}
                      />
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="px-4 py-3 border-t border-accent-soft bg-white">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  className="flex-1 resize-none px-4 py-2.5 border border-accent-soft rounded-xl text-sm font-sans text-graphite placeholder:text-graphite/60 focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-graphite hover:bg-graphite disabled:bg-accent-soft disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-xs text-graphite/60 font-sans mt-1.5 pl-1">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <SelectConversation />
        )}
      </div>
    </div>
  );
}
