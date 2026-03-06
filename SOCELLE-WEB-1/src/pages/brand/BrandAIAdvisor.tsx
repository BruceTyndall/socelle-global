import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Brain, Send, ThumbsUp, ThumbsDown, Package, Sparkles, BarChart2,
  BookOpen, ShoppingCart, ArrowLeftRight, TrendingUp, Users, Target, ChevronDown,
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
  'How is my brand performing vs. the category average?',
  'Which operator segments should I target next?',
  'What products have the highest reorder rates?',
  'Suggest a campaign strategy for Q2',
  'What education content should I create?',
];

/* ── Mock Brand Signals ───────────────────────────────── */
const RECENT_SIGNALS = [
  { icon: TrendingUp, label: 'Adoption rate up 12% month-over-month', color: 'text-green-600' },
  { icon: Users, label: '14 new retailer inquiries this week', color: 'text-blue-600' },
  { icon: Target, label: 'Medspa segment showing 28% growth potential', color: 'text-amber-600' },
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
export default function BrandAIAdvisor() {
  const [input, setInput] = useState('');
  const [contextOpen, setContextOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, isLoading, provideFeedback } = useChatSession({
    userRole: 'brand_admin',
    userName: 'team',
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
        <title>Brand Intelligence Advisor | Socelle</title>
        <meta name="description" content="Your brand intelligence advisor powered by Socelle AI — market positioning, retailer insights, and campaign strategy." />
      </Helmet>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
        {/* ── Chat Column (2/3) ─────────────────────────── */}
        <div className="flex-1 lg:flex-[2] flex flex-col bg-white rounded-2xl border border-pro-stone overflow-hidden min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-pro-stone bg-gradient-to-r from-pro-ivory to-white flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pro-navy to-pro-gold flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-lg text-pro-navy leading-tight">Brand Intelligence Advisor</h1>
              <p className="text-xs text-pro-warm-gray font-sans">AI-powered market intelligence for your brand</p>
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
                placeholder="Ask about market positioning, retailer insights, campaigns..."
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
              Socelle AI provides intelligence-driven recommendations. Data reflects platform trends.
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
            {/* Brand Profile */}
            <div className="bg-white rounded-xl border border-pro-stone p-5">
              <h3 className="font-serif text-sm text-pro-navy mb-3">Brand Profile</h3>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Category</span>
                  <span className="text-pro-charcoal font-medium">Professional Skincare</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Active SKUs</span>
                  <span className="text-pro-charcoal font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Active Retailers</span>
                  <span className="text-pro-charcoal font-medium">128</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Avg. Reorder Rate</span>
                  <span className="text-green-600 font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Market Position</span>
                  <span className="text-pro-gold font-medium">Top 15%</span>
                </div>
              </div>
            </div>

            {/* Recent Signals */}
            <div className="bg-white rounded-xl border border-pro-stone p-5">
              <h3 className="font-serif text-sm text-pro-navy mb-3">Market Signals</h3>
              <div className="space-y-3">
                {RECENT_SIGNALS.map((signal, i) => {
                  const Icon = signal.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${signal.color}`} />
                      <p className="text-xs text-pro-charcoal font-sans leading-snug">{signal.label}</p>
                    </div>
                  );
                })}
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
