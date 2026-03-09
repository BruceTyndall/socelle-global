import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, X, Send, Minimize2, Compass, FlaskConical,
  ShoppingBag, BarChart2, LifeBuoy, CheckCircle, Info, AlertCircle,
} from 'lucide-react';
import { processQuestion, type ConciergeContext, type ConciergeResponse, type AIProvider } from '../lib/aiConciergeEngine';
import { getBrandConciergeConfig } from '../lib/platformConfig';
import { createScopedLogger } from '../lib/logger';
import type { BudgetProfile, ServiceMenuItem } from '../lib/types';

const log = createScopedLogger('AIConcierge');

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConciergeMode = 'discovery' | 'protocol' | 'retail' | 'analytics' | 'support';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  response?: ConciergeResponse;
  timestamp: Date;
  mode?: ConciergeMode;
}

interface AIConciergeProps {
  contextPage: string;
  spaId?: string;
  userRole?: string;
  budgetProfile?: BudgetProfile;
  serviceMenu?: ServiceMenuItem[];
  brandSlug?: string;
}

// ── Mode config ───────────────────────────────────────────────────────────────

const MODES: Array<{
  key: ConciergeMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  suggestions: string[];
}> = [
  {
    key: 'discovery',
    label: 'Discovery',
    icon: Compass,
    placeholder: 'Find brands, products, or categories…',
    suggestions: [
      'Show me skincare brands for sensitive skin',
      'Find brands that work with microneedling',
      'Which brands offer low minimum orders?',
    ],
  },
  {
    key: 'protocol',
    label: 'Protocol',
    icon: FlaskConical,
    placeholder: 'Ask about protocols and product matching…',
    suggestions: [
      'What products do I need for a Hydrafacial menu?',
      'Build me a chemical peel protocol',
      'Show me post-treatment retail for facials',
    ],
  },
  {
    key: 'retail',
    label: 'Retail',
    icon: ShoppingBag,
    placeholder: 'Ask about retail recommendations…',
    suggestions: [
      'What should I retail to clients after a peel?',
      'Best-selling retail products under $50',
      'What home care goes with microneedling?',
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: BarChart2,
    placeholder: 'Ask about your performance data…',
    suggestions: [
      'How is my retail performance this month?',
      'Which brands have the most protocol matches?',
      'What are my top products by orders?',
    ],
  },
  {
    key: 'support',
    label: 'Support',
    icon: LifeBuoy,
    placeholder: 'Get help with the platform…',
    suggestions: [
      'How do I upload my service menu?',
      'How do I set up a new brand?',
      'How does protocol matching work?',
    ],
  },
];

// ── Loading dots ──────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-accent-soft rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Confidence badge ──────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: string }) {
  const config: Record<string, { Icon: typeof CheckCircle; className: string; label: string }> = {
    High:    { Icon: CheckCircle, className: 'text-graphite bg-accent-soft border-accent-soft', label: 'High' },
    Medium:  { Icon: Info,        className: 'text-graphite bg-accent-pale border-accent/30', label: 'Medium' },
    Low:     { Icon: AlertCircle, className: 'text-amber-700 bg-amber-50 border-amber-200',       label: 'Low' },
    Unknown: { Icon: AlertCircle, className: 'text-graphite/60 bg-accent-soft border-accent-soft',  label: 'Unknown' },
  };
  const c = config[level] ?? config.Unknown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border font-sans ${c.className}`}>
      <c.Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AIConcierge({
  contextPage,
  spaId,
  userRole = 'user',
  budgetProfile,
  serviceMenu,
  brandSlug,
}: AIConciergeProps) {
  const brandConfig = getBrandConciergeConfig(brandSlug);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeMode, setActiveMode] = useState<ConciergeMode>('discovery');
  const [provider, setProvider] = useState<AIProvider>('claude');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMode = MODES.find((m) => m.key === activeMode) ?? MODES[0];
  const unreadCount = messages.filter((m) => m.type === 'assistant').length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, activeMode]);

  const handleSendMessage = async (questionText?: string) => {
    const question = (questionText ?? inputValue).trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}-u`,
      type: 'user',
      content: question,
      timestamp: new Date(),
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const context: ConciergeContext = {
        spaId,
        userRole,
        contextPage: `${contextPage}:${activeMode}`,
        budgetProfile,
        serviceMenu,
      };

      const response = await processQuestion(question, context, provider);

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          type: 'assistant',
          content: response.directAnswer,
          response,
          timestamp: new Date(),
          mode: activeMode,
        },
      ]);
    } catch (err) {
      log.error('Error processing question', { err });
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          type: 'assistant',
          content: 'I ran into an issue. Please try again.',
          timestamp: new Date(),
          mode: activeMode,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Closed state ───────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label={`Open ${brandConfig.displayName}`}
        className="
          fixed bottom-6 right-6 w-14 h-14 bg-graphite text-white rounded-full
          shadow-navy hover:bg-graphite-dark
          transition-all duration-200 flex items-center justify-center z-50
          hover:scale-110 active:scale-95
        "
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // ── Minimized state ────────────────────────────────────────────
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white border border-accent-soft rounded-xl shadow-dropdown px-4 py-2.5 flex items-center gap-2.5 hover:shadow-modal transition-shadow"
        >
          <MessageCircle className="w-4 h-4 text-graphite" />
          <span className="text-sm font-medium font-sans text-graphite">
            {brandConfig.displayName}
          </span>
          {messages.length > 0 && (
            <span className="bg-graphite text-white text-[10px] px-1.5 py-0.5 rounded-full font-sans font-medium">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ── Full panel ─────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-modal border border-accent-soft flex flex-col z-50 overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-graphite px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-sans font-semibold text-white text-sm leading-tight">
              {brandConfig.displayName}
            </p>
            <p className="font-sans text-white/60 text-[11px]">
              {currentMode.label} mode
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Provider toggle (Claude vs Gemini) ─────────────────────── */}
      <div className="flex items-center justify-center gap-1 px-3 py-2 bg-accent-soft border-b border-accent-soft flex-shrink-0">
        <span className="text-[10px] font-sans text-graphite/60 mr-1">AI:</span>
        <div className="flex rounded-lg bg-white border border-accent-soft p-0.5 shadow-sm">
          {(['claude', 'gemini'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={`
                px-3 py-1 text-[11px] font-sans font-medium rounded-md transition-colors
                ${provider === p
                  ? 'bg-graphite text-white'
                  : 'text-graphite/60 hover:text-graphite hover:bg-background'}
              `}
            >
              {p === 'claude' ? 'Claude' : 'Gemini'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mode tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-px bg-accent-soft border-b border-accent-soft px-2 pt-2 flex-shrink-0">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const active = mode.key === activeMode;
          return (
            <button
              key={mode.key}
              onClick={() => setActiveMode(mode.key)}
              title={mode.label}
              className={`
                flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-t-lg text-[10px] font-sans font-medium
                transition-all duration-150 border-b-2
                ${active
                  ? 'bg-white text-graphite border-graphite'
                  : 'bg-transparent text-graphite/60 border-transparent hover:text-graphite hover:bg-white/60'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">

        {/* Empty state: suggested prompts */}
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-3.5 border border-accent-soft">
              <p className="text-xs font-sans text-graphite/60 leading-relaxed">
                {brandConfig.description}
              </p>
            </div>
            <p className="text-[11px] font-sans text-graphite/60 px-1">Try asking:</p>
            {currentMode.suggestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="
                  w-full bg-white border border-accent-soft rounded-xl p-3 text-left
                  text-xs font-sans text-graphite
                  hover:border-graphite hover:bg-accent-soft
                  transition-all duration-150
                "
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Conversation */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[88%] px-3.5 py-2.5 text-sm font-sans leading-relaxed
                ${msg.type === 'user'
                  ? 'bg-graphite text-white rounded-2xl rounded-br-sm'
                  : 'bg-white border border-accent-soft rounded-2xl rounded-bl-sm text-graphite'
                }
              `}
            >
              {msg.type === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-sm text-graphite leading-relaxed whitespace-pre-wrap">
                    {msg.response?.directAnswer ?? msg.content}
                  </p>

                  {msg.response?.contextualExplanation && (
                    <p className="text-[11px] text-graphite/60 leading-relaxed">
                      {msg.response.contextualExplanation}
                    </p>
                  )}

                  {msg.response && (
                    <div className="border-t border-accent-soft pt-2 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge level={msg.response.confidenceLevel} />
                      </div>

                      {msg.response.followUpQuestion && (
                        <button
                          onClick={() => handleSendMessage(msg.response!.followUpQuestion)}
                          className="text-[11px] text-accent hover:text-accent-light font-medium transition-colors"
                        >
                          → {msg.response.followUpQuestion}
                        </button>
                      )}

                      {msg.response.missingDataFlags.length > 0 && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 text-[10px] text-amber-700">
                          {msg.response.missingDataFlags.join(' · ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ────────────────────────────────────────────────── */}
      <div className="p-3 border-t border-accent-soft bg-white flex-shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentMode.placeholder}
            disabled={isLoading}
            className="
              flex-1 px-3 py-2.5 border border-accent-soft rounded-xl text-sm font-sans
              text-graphite placeholder-accent-soft bg-background
              focus:border-graphite focus:ring-2 focus:ring-graphite/10 outline-none
              disabled:opacity-50 transition-colors
            "
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send"
            className="
              w-10 h-10 bg-graphite text-white rounded-xl flex items-center justify-center
              hover:bg-graphite-dark disabled:bg-accent-soft disabled:cursor-not-allowed
              transition-colors flex-shrink-0
            "
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] font-sans text-accent-soft text-center mt-2 leading-tight">
          {brandConfig.disclaimer}
        </p>
      </div>
    </div>
  );
}
