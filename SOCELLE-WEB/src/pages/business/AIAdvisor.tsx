import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Brain, Send, ThumbsUp, ThumbsDown, Package, Sparkles, BarChart2,
  BookOpen, ShoppingCart, ArrowLeftRight, TrendingUp, Zap, AlertCircle, ChevronDown,
} from 'lucide-react';
import { useChatSession } from '../../lib/ai/useChatSession';
import type { ChatAction } from '../../lib/ai/types';

/* ── Action icon mapping ──────────────────────────────── */
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

/* ── Suggested Questions ──────────────────────────────── */
const SUGGESTED_QUESTIONS = [
  'What are the top-selling serums this quarter?',
  'How does my product mix compare to top operators?',
  'Recommend a hyperpigmentation treatment protocol',
  'What CE courses should I take next?',
  'Show me trending professional brands',
];

/* ── Mock Signals ─────────────────────────────────────── */
const RECENT_SIGNALS = [
  { icon: TrendingUp, label: 'LED therapy demand up 47% in your region', color: 'text-green-600' },
  { icon: Zap, label: '3 new products from your top brands this week', color: 'text-blue-600' },
  { icon: AlertCircle, label: 'Vitamin C serum stock running low', color: 'text-amber-600' },
];

/* ── Typing Indicator ─────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pro-navy to-pro-gold flex items-center justify-center flex-shrink-0">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-pro-stone rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-pro-warm-gray/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-pro-warm-gray/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-pro-warm-gray/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function AIAdvisor() {
  const [input, setInput] = useState('');
  const [contextOpen, setContextOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, isLoading, provideFeedback } = useChatSession({
    userRole: 'operator',
    userName: 'there',
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

  const handleSuggestion = (q: string) => {
    setInput(q);
    inputRef.current?.focus();
  };

  const handleActionClick = (action: ChatAction) => {
    if (action.href) {
      window.location.href = action.href;
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Intelligence Advisor | Socelle</title>
        <meta name="description" content="Your personal Socelle AI intelligence advisor for product recommendations, treatment protocols, and market insights." />
      </Helmet>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-14rem)]">
        {/* ── Chat Column (2/3) ─────────────────────────── */}
        <div className="flex-1 lg:flex-[2] flex flex-col bg-white rounded-2xl border border-pro-stone overflow-hidden min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-pro-stone bg-gradient-to-r from-pro-ivory to-white flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pro-navy to-pro-gold flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-lg text-pro-navy leading-tight">Intelligence Advisor</h1>
              <p className="text-xs text-pro-warm-gray font-sans">AI-powered insights for your business</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-pro-ivory/30 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' ? (
                  <div className="flex items-start gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pro-navy to-pro-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white border border-pro-stone/60 rounded-2xl rounded-tl-sm px-5 py-3.5">
                        <p className="text-sm text-pro-charcoal font-sans leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-1">
                          {msg.actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleActionClick(action)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-pro-stone/60 rounded-full text-xs font-medium text-pro-navy hover:bg-pro-cream hover:border-pro-gold/40 transition-colors font-sans"
                            >
                              {actionIcon(action.type)}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 pl-1">
                        <button
                          onClick={() => provideFeedback(msg.id, 'helpful')}
                          className={`p-1 rounded transition-colors ${
                            msg.feedback === 'helpful'
                              ? 'text-green-600 bg-green-50'
                              : 'text-pro-warm-gray/40 hover:text-green-600 hover:bg-green-50'
                          }`}
                          aria-label="Mark as helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => provideFeedback(msg.id, 'not_helpful')}
                          className={`p-1 rounded transition-colors ${
                            msg.feedback === 'not_helpful'
                              ? 'text-red-500 bg-red-50'
                              : 'text-pro-warm-gray/40 hover:text-red-500 hover:bg-red-50'
                          }`}
                          aria-label="Mark as not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[80%]">
                    <div className="bg-pro-cream rounded-2xl rounded-tr-sm px-5 py-3.5">
                      <p className="text-sm text-pro-charcoal font-sans leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-pro-stone bg-white px-6 py-4 flex-shrink-0">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about products, protocols, or market intelligence..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-pro-stone px-4 py-3 text-sm text-pro-charcoal placeholder:text-pro-warm-gray/50 focus:outline-none focus:border-pro-gold focus:ring-1 focus:ring-pro-gold/30 font-sans transition-colors"
                style={{ maxHeight: '100px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-pro-gold text-white hover:bg-pro-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
            <p className="text-[10px] text-pro-warm-gray/40 text-center mt-2 font-sans">
              Socelle AI provides intelligence-driven recommendations. Always verify clinical guidance with qualified professionals.
            </p>
          </div>
        </div>

        {/* ── Context Column (1/3) ─────────────────────── */}
        <div className="lg:flex-1 flex flex-col gap-4 min-h-0">
          {/* Mobile toggle */}
          <button
            onClick={() => setContextOpen(!contextOpen)}
            className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl border border-pro-stone text-sm font-sans font-medium text-pro-charcoal"
          >
            <span>Context Panel</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${contextOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className={`space-y-4 overflow-y-auto ${contextOpen ? '' : 'hidden lg:block'}`}>
            {/* Profile */}
            <div className="bg-white rounded-xl border border-pro-stone p-5">
              <h3 className="font-serif text-sm text-pro-navy mb-3">Your Profile</h3>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Business Type</span>
                  <span className="text-pro-charcoal font-medium">Day Spa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Location</span>
                  <span className="text-pro-charcoal font-medium">Austin, TX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Active Brands</span>
                  <span className="text-pro-charcoal font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Pricing Tier</span>
                  <span className="text-pro-gold font-medium">Premium</span>
                </div>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="bg-white rounded-xl border border-pro-stone p-5">
              <h3 className="font-serif text-sm text-pro-navy mb-3">Suggested Questions</h3>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(q)}
                    className="w-full text-left px-3 py-2.5 rounded-lg bg-pro-ivory/60 text-xs text-pro-charcoal font-sans hover:bg-pro-cream hover:text-pro-navy transition-colors leading-snug"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
