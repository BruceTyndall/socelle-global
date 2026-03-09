import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, Clock, ArrowLeft, Building2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BrandConversation {
  id: string;
  type: string;
  subject: string | null;
  peer_user_id: string | null;
  peer_name: string;
  peer_type: string | null;
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function groupByDate(msgs: Message[]): { date: string; messages: Message[] }[] {
  const groups = new Map<string, Message[]>();
  for (const m of msgs) {
    const key = new Date(m.created_at).toLocaleDateString([], {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  return Array.from(groups.entries()).map(([date, messages]) => ({ date, messages }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ConvItem({
  conv, isActive, onClick,
}: {
  conv: BrandConversation; isActive: boolean; onClick: () => void;
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
            <Building2 className="w-4 h-4 text-graphite" />
          </div>
          <span className="font-medium text-graphite font-sans text-sm truncate">
            {conv.type === 'order_linked' && conv.subject ? conv.subject : conv.peer_name}
          </span>
        </div>
        <span className="text-xs text-graphite/60 font-sans flex-shrink-0">
          {formatTime(conv.last_message_at)}
        </span>
      </div>
      {conv.type === 'order_linked' && conv.peer_name && (
        <p className="text-xs text-graphite/60 font-sans truncate pl-10">{conv.peer_name}</p>
      )}
      {conv.peer_type && conv.type !== 'order_linked' && (
        <p className="text-xs text-graphite/60 font-sans truncate pl-10">{conv.peer_type}</p>
      )}
      {conv.last_message_preview && (
        <p className="text-xs text-graphite/60 font-sans truncate pl-10 mt-0.5">
          {conv.last_message_preview}
        </p>
      )}
    </button>
  );
}

function MsgBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm font-sans leading-relaxed ${
        isOwn
          ? 'bg-graphite text-white rounded-br-sm'
          : 'bg-white border border-accent-soft text-graphite rounded-bl-sm'
      }`}>
        {msg.body}
        <div className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-graphite/60'}`}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function EmptyInbox() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-accent-soft" />
      </div>
      <h3 className="text-lg font-sans text-graphite mb-2">No messages yet</h3>
      <p className="text-sm text-graphite/60 font-sans max-w-xs">
        When resellers message your brand, conversations will appear here.
      </p>
    </div>
  );
}

function SelectConv() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-accent-soft" />
      </div>
      <h3 className="text-base font-sans font-medium text-graphite mb-1">
        Select a conversation
      </h3>
      <p className="text-sm text-graphite/60 font-sans">
        Choose a conversation from the list to view messages.
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BrandMessages() {
  const { user, profile, brandId } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversation');

  const [conversations, setConversations] = useState<BrandConversation[]>([]);
  const [activeConv, setActiveConv]       = useState<BrandConversation | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [newMsg, setNewMsg]               = useState('');
  const [sending, setSending]             = useState(false);
  const [loadingConvs, setLoadingConvs]   = useState(true);
  const [loadingThread, setLoadingThread]  = useState(false);
  const [showThread, setShowThread]       = useState(false);
  const [urlSelectAttempted, setUrlSelectAttempted] = useState(false);

  const endRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch conversations scoped to brand ───────────────────────────────────

  const fetchConversations = useCallback(async (): Promise<BrandConversation[]> => {
    if (!brandId) { setLoadingConvs(false); return []; }
    try {
      const { data: convRows, error } = await supabase
        .from('conversations')
        .select('id, type, subject, participant_one_id, participant_two_id, last_message_at, last_message_preview')
        .eq('brand_id', brandId)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      const rows = convRows ?? [];

      // Determine the reseller participant for each conversation
      const peerIds = rows.map(c =>
        c.participant_one_id === user?.id ? c.participant_two_id : c.participant_one_id
      ).filter(Boolean) as string[];

      // Batch-fetch business names for peer users
      const peerMap: Record<string, { name: string; type: string | null }> = {};
      if (peerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, spa_name, business_id, businesses(name, type)')
          .in('id', peerIds);

        for (const p of profiles ?? []) {
          const biz = p.businesses as unknown as { name: string; type: string | null } | null;
          peerMap[p.id] = {
            name: biz?.name ?? p.spa_name ?? 'Retailer',
            type: biz?.type ?? null,
          };
        }
      }

      const list = rows.map(c => {
        const peerId = (c.participant_one_id === user?.id
          ? c.participant_two_id
          : c.participant_one_id) ?? null;
        const peer = peerId ? peerMap[peerId] : null;
        return {
          id: c.id,
          type: c.type ?? 'direct',
          subject: c.subject ?? null,
          peer_user_id: peerId,
          peer_name: peer?.name ?? 'Retailer',
          peer_type: peer?.type ?? null,
          last_message_at: c.last_message_at,
          last_message_preview: c.last_message_preview,
        };
      });
      setConversations(list);
      return list;
    } catch (err) {
      console.warn('Brand conversations fetch error:', err);
      return [];
    } finally {
      setLoadingConvs(false);
    }
  }, [brandId, user?.id]);

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
    if (!user || !activeConv || !newMsg.trim() || sending) return;
    setSending(true);
    const body = newMsg.trim();
    setNewMsg('');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConv.id,
        sender_id: user.id,
        sender_role: profile?.role ?? 'brand_admin',
        body,
      })
      .select('id, sender_id, sender_role, body, created_at')
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, data as Message]);
      const preview = body.slice(0, 120);
      const now = new Date().toISOString();
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConv.id
            ? { ...c, last_message_at: now, last_message_preview: preview }
            : c
        )
      );
      supabase
        .from('conversations')
        .update({ last_message_at: now, last_message_preview: preview })
        .eq('id', activeConv.id)
        .then(() => {});
    }
    setSending(false);
  };

  // ── Realtime: new messages on active conversation ──────────────────────────

  useEffect(() => {
    if (!activeConv) return;
    const channel = supabase
      .channel(`brand-thread-${activeConv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConv.id}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          // Avoid duplicates (own sends already optimistic)
          if (msg.sender_id !== user?.id) {
            setMessages(prev => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv?.id, user?.id]);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Open conversation from ?conversation= id (e.g. from Order detail "Message reseller")
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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    if (activeConv && !loadingThread) inputRef.current?.focus();
  }, [activeConv, loadingThread]);

  const handleSelect = (conv: BrandConversation) => {
    setActiveConv(conv);
    setShowThread(true);
    fetchThread(conv.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Guard: brand_id required ──────────────────────────────────────────────

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-graphite/60 font-sans text-sm">No brand associated with your account.</p>
      </div>
    );
  }

  const grouped = groupByDate(messages);

  return (
    <div className="flex h-[calc(100vh-11rem)] bg-white rounded-xl border border-accent-soft overflow-hidden">

      {/* ── Conversation list ─────────────────────────────────────────────── */}
      <div
        className={`w-full md:w-80 flex-shrink-0 border-r border-accent-soft flex flex-col ${
          showThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="px-4 py-4 border-b border-accent-soft">
          <h2 className="font-sans text-graphite text-lg">Messages</h2>
          <p className="text-xs text-graphite/60 font-sans mt-0.5">Retailer conversations</p>
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
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={activeConv?.id === conv.id}
                onClick={() => handleSelect(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Thread panel ──────────────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          showThread ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConv ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-accent-soft flex items-center gap-3">
              <button
                onClick={() => setShowThread(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-accent-soft transition-colors"
                aria-label="Back to inbox"
              >
                <ArrowLeft className="w-4 h-4 text-graphite" />
              </button>
              <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-graphite" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-graphite font-sans text-sm truncate">
                  {activeConv.peer_name}
                </p>
                {activeConv.peer_type && (
                  <p className="text-xs text-graphite/60 font-sans">{activeConv.peer_type}</p>
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
                    <p className="text-sm text-graphite/60 font-sans">No messages yet. Say hello!</p>
                  </div>
                </div>
              ) : (
                grouped.map(({ date, messages: group }) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-accent-soft" />
                      <span className="text-xs text-graphite/60 font-sans font-medium px-2">{date}</span>
                      <div className="flex-1 h-px bg-accent-soft" />
                    </div>
                    {group.map(msg => (
                      <MsgBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
                    ))}
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="px-4 py-3 border-t border-accent-soft bg-white">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
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
                  disabled={!newMsg.trim() || sending}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-graphite hover:bg-graphite disabled:bg-accent-soft disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  aria-label="Send"
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
          <SelectConv />
        )}
      </div>
    </div>
  );
}
