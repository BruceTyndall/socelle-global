import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatSession, UserRole } from './types';
import { generateResponse, getGreeting } from '../../__fixtures__/mockAdvisor';

interface UseChatSessionOptions {
  userRole: UserRole;
  userName?: string;
}

interface UseChatSessionReturn {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  session: ChatSession;
  provideFeedback: (messageId: string, feedback: 'helpful' | 'not_helpful') => void;
  clearSession: () => void;
}

function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useChatSession({ userRole, userName }: UseChatSessionOptions): UseChatSessionReturn {
  const sessionIdRef = useRef(createSessionId());
  const startedAtRef = useRef(new Date());
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    getGreeting(userRole, userName),
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
        feedback: null,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await generateResponse(trimmed, userRole);
        setMessages((prev) => [...prev, response]);
      } catch {
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_err`,
          role: 'assistant',
          content: 'I apologize, but I encountered an issue processing your request. Please try again.',
          timestamp: new Date(),
          feedback: null,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, userRole],
  );

  const provideFeedback = useCallback(
    (messageId: string, feedback: 'helpful' | 'not_helpful') => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)),
      );
    },
    [],
  );

  const clearSession = useCallback(() => {
    sessionIdRef.current = createSessionId();
    startedAtRef.current = new Date();
    setMessages([getGreeting(userRole, userName)]);
    setIsLoading(false);
  }, [userRole, userName]);

  const session: ChatSession = {
    id: sessionIdRef.current,
    userRole,
    messages,
    startedAt: startedAtRef.current,
  };

  return { messages, sendMessage, isLoading, session, provideFeedback, clearSession };
}
