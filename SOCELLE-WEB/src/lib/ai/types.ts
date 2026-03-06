export type MessageRole = 'user' | 'assistant';
export type UserRole = 'operator' | 'brand_admin';
export type IntentType =
  | 'product_inquiry'
  | 'pricing_question'
  | 'treatment_advice'
  | 'reorder_request'
  | 'competitor_comparison'
  | 'education_search'
  | 'complaint'
  | 'general_chat';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  intent?: IntentType;
  actions?: ChatAction[];
  feedback?: 'helpful' | 'not_helpful' | null;
}

export interface ChatAction {
  type: 'show_product' | 'show_brand' | 'show_intelligence' | 'show_education' | 'create_order' | 'compare';
  label: string;
  href?: string;
  data?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  userRole: UserRole;
  messages: ChatMessage[];
  startedAt: Date;
}

export interface AdvisorPersona {
  role: UserRole;
  greeting: string;
  systemContext: string;
}
