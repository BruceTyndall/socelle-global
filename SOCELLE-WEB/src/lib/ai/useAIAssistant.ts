import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggestions?: { label: string; url: string; type: 'product' | 'article' }[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: "Hi! I'm your Socelle protocol assistant. What skin concern are you treating today, or are you looking for a specific formulation?",
};

export function useAIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Map ChatMessage format to OpenAI format
      const apiMessages = updatedMessages.map(m => ({ 
        role: m.role, 
        content: m.content 
      }));

      // Inject active page context dynamically
      const pageContext = `(System Context: The user is currently browsing the page at path: "${location.pathname}". If they ask something like "what is this?", refer to the content of this page.)`;
      
      // We prepend the context instruction to the last user message so the AI is aware of their current location
      const payloadMessages = [...apiMessages];
      const lastMsgIdx = payloadMessages.length - 1;
      payloadMessages[lastMsgIdx] = {
        role: 'user',
        content: `${pageContext}\n\nUser Question: ${payloadMessages[lastMsgIdx].content}`
      };

      const { data, error } = await supabase.functions.invoke('ai-shopping-assistant', {
        body: { messages: payloadMessages },
      });

      if (error) {
        throw error;
      }

      if (data && data.reply) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply
        }]);
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the intelligence core right now. Please try again in a moment."
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, location.pathname]);

  return {
    messages,
    input,
    setInput,
    isTyping,
    handleSubmit
  };
}
