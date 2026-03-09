import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Brain, X, Minus, Send, ThumbsUp, ThumbsDown, Package, Sparkles, BarChart2, BookOpen, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { useChatSession } from '../../lib/ai/useChatSession';
import type { UserRole, ChatAction } from '../../lib/ai/types';

interface ChatPanelProps {
  userRole: UserRole;
  userName?: string;
}

/* ── Action icon mapping ─────────────────────────────────────── */
function actionIcon(type: ChatAction['type']) {
  switch (type) {
    case 'show_product': return <Package className="w-3.5 h-3.5" />;
    case 'show_brand': return <Sparkles className="w-3.5 h-3.5" />;
    case 'show_intelligence': return <BarChart2 className="w-3.5 h-3.5" />;
    case 'show_education': return <BookOpen className="w-3.5 h-3.5" />;
    case 'create_order': return <ShoppingCart className="w-3.5 h-3.5" />;
    case 'compare': return <ArrowLeftRight className="w-3.5 h-3.5" />;
  }
}

/* ── Typing Indicator ────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 max-w-[85%]">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-graphite to-accent flex items-center justify-center flex-shrink-0">
        <Brain className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white border border-accent-soft rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-graphite/60/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-graphite/60/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-graphite/60/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main ChatPanel Component ────────────────────────────────── */
export default function ChatPanel({ userRole, userName }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, isLoading, provideFeedback, clearSession } = useChatSession({
    userRole,
    userName,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.href) {
      window.location.href = action.href;
    }
  };

  /* ── Collapsed: Floating button ─────────────────────────── */
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-accent to-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group sm:bottom-6 sm:right-6"
        aria-label="Open Socelle Intelligence Advisor"
      >
        <Brain className="w-5 h-5 group-hover:animate-pulse" />
        <span className="font-sans font-semibold text-sm hidden sm:inline">Ask Socelle</span>
      </button>
    );
  }

  /* ── Expanded: Chat panel ───────────────────────────────── */
  return (
    <div
      className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-accent-soft/50 overflow-hidden"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      {/* Use CSS class for sm breakpoint height */}
      <style>{`
        @media (min-width: 640px) {
          .chat-panel-container { height: 500px !important; max-height: 80vh !important; }
        }
      `}</style>
      <div className="chat-panel-container flex flex-col" style={{ height: '100dvh', maxHeight: '100dvh' }}>
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-graphite to-[#6B4F52] text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="font-sans font-semibold text-sm leading-tight">Socelle Intelligence Advisor</p>
              <p className="font-sans text-[10px] text-white/60">Powered by Socelle AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearSession}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="New conversation"
              aria-label="New conversation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Minimize"
              aria-label="Minimize chat"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Close"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-background/50 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' ? (
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-graphite to-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white border border-accent-soft/60 rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm text-graphite font-sans leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Action cards */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-1">
                        {msg.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(action)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-accent-soft/60 rounded-full text-xs font-medium text-graphite hover:bg-accent-soft hover:border-accent/40 transition-colors font-sans"
                          >
                            {actionIcon(action.type)}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Feedback */}
                    <div className="flex items-center gap-1 pl-1">
                      <button
                        onClick={() => provideFeedback(msg.id, 'helpful')}
                        className={`p-1 rounded transition-colors ${
                          msg.feedback === 'helpful'
                            ? 'text-green-600 bg-green-50'
                            : 'text-graphite/60/40 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title="Helpful"
                        aria-label="Mark as helpful"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => provideFeedback(msg.id, 'not_helpful')}
                        className={`p-1 rounded transition-colors ${
                          msg.feedback === 'not_helpful'
                            ? 'text-red-500 bg-red-50'
                            : 'text-graphite/60/40 hover:text-red-500 hover:bg-red-50'
                        }`}
                        title="Not helpful"
                        aria-label="Mark as not helpful"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-[80%]">
                  <div className="bg-accent-soft rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm text-graphite font-sans leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ───────────────────────────────────────── */}
        <div className="border-t border-accent-soft bg-white px-4 py-3 flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-accent-soft px-4 py-2.5 text-sm text-graphite placeholder:text-graphite/60/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 font-sans transition-colors"
              style={{ maxHeight: '80px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-graphite/60/40 text-center mt-2 font-sans">
            Socelle AI provides intelligence-driven recommendations. Always verify clinical guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
