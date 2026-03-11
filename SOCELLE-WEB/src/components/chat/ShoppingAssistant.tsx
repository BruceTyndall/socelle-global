import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronRight, ShoppingBag, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAIAssistant } from '../../lib/ai/useAIAssistant';

export function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    input,
    setInput,
    isTyping,
    handleSubmit
  } = useAIAssistant();

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-mn-dark text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform ${isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-50 w-[380px] h-[580px] max-h-[85vh] bg-mn-bg border border-graphite/10 rounded-2xl shadow-panel flex flex-col overflow-hidden transition-all origin-bottom-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="h-16 bg-mn-dark text-white px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-semibold">Protocol Assistant</h3>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Powered by Socelle Intelligence</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-sans leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-br-sm' 
                  : 'bg-mn-surface border border-graphite/5 text-graphite/80 rounded-bl-sm'
              }`}>
                {msg.content}
                
                {msg.suggestions && (
                  <div className="mt-3 space-y-2">
                    {msg.suggestions.map((sug, i) => (
                      <Link 
                        key={i} 
                        to={sug.url}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 bg-white border border-accent/20 rounded-xl p-2.5 hover:border-accent hover:shadow-soft transition-all group"
                      >
                        {sug.type === 'product' ? <ShoppingBag className="w-4 h-4 text-accent shrink-0" /> : <BookOpen className="w-4 h-4 text-accent shrink-0" />}
                        <span className="text-xs font-semibold text-graphite group-hover:text-accent line-clamp-1 flex-1">{sug.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-graphite/30 group-hover:text-accent shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-mn-surface border border-graphite/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-graphite/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-graphite/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-graphite/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-graphite/5 shrink-0">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about protocols, products, or intelligence..."
              className="flex-1 max-h-32 min-h-[44px] bg-mn-surface border border-graphite/10 rounded-2xl px-4 py-3 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent resize-none placeholder:text-graphite/30"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 shrink-0 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </form>
          <p className="text-[10px] text-center text-graphite/30 mt-3 font-sans">
            AI can make mistakes. Verify clinical protocols before treatment.
          </p>
        </div>
      </div>
    </>
  );
}
