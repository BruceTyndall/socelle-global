/**
 * Input sanitisation for AI edge functions.
 *
 * Validates and cleans user input before it reaches the AI model.
 * Guards against prompt injection, oversized payloads, and invalid tool names.
 */

import { jsonResponse } from './cors.ts';

/** Maximum allowed prompt length in characters. */
const MAX_PROMPT_LENGTH = 2000;

/** Valid task types accepted by ai-orchestrator. */
const VALID_TASK_TYPES = [
  // Tier 1 — Reasoning
  'protocol_mapping',
  'gap_analysis',
  'brand_strategy',
  // Tier 2 — Long Context
  'pdf_extraction',
  'menu_parse_large',
  // Tier 3 — Speed
  'menu_parse_small',
  'retail_summary',
  'plan_summary',
  // Tier 4 — Latency
  'chat_concierge',
  'real_time_feedback',
  'messaging_assist',
] as const;

/** Regex patterns that indicate prompt injection attempts. */
const INJECTION_PATTERNS = [
  // System prompt override attempts
  /\bsystem\s*:\s*/i,
  /\bignore\s+(all\s+)?previous\s+instructions/i,
  /\byou\s+are\s+now\b/i,
  /\bact\s+as\s+(a\s+)?different/i,
  /\bforget\s+(all\s+)?(your\s+)?instructions/i,
  /\bdisregard\s+(all\s+)?(your\s+)?instructions/i,
  // Role-play escape
  /\bpretend\s+you\s+are/i,
  /\bdo\s+not\s+follow\s+(any\s+)?rules/i,
  // Data exfiltration attempts
  /\b(reveal|show|print|output)\s+(your\s+)?(system\s+)?prompt/i,
  /\bwhat\s+(are\s+)?your\s+instructions/i,
];

interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

interface SanitizedInput {
  taskType: string;
  messages: ChatMessage[];
}

/**
 * Validate and sanitise the request body for AI edge functions.
 *
 * Returns a 400 `Response` on validation failure, or the cleaned input on success.
 */
export function sanitizeInput(body: {
  task_type?: string;
  messages?: ChatMessage[];
}): SanitizedInput | Response {
  const { task_type, messages } = body;

  // 1. Validate task_type
  if (!task_type) {
    return jsonResponse(
      { error: 'task_type is required', code: 'invalid_input' },
      400,
    );
  }
  if (!(VALID_TASK_TYPES as readonly string[]).includes(task_type)) {
    return jsonResponse(
      {
        error: `Invalid task_type: "${task_type}"`,
        code: 'invalid_task_type',
        valid_types: VALID_TASK_TYPES,
      },
      400,
    );
  }

  // 2. Validate messages array
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return jsonResponse(
      { error: 'messages array is required and must be non-empty', code: 'invalid_input' },
      400,
    );
  }

  // 3. Validate and sanitise each message
  const sanitizedMessages: ChatMessage[] = [];
  for (const msg of messages) {
    if (!msg.content || typeof msg.content !== 'string') {
      return jsonResponse(
        { error: 'Each message must have a string content field', code: 'invalid_input' },
        400,
      );
    }

    if (!['user', 'assistant', 'system', 'tool'].includes(msg.role)) {
      return jsonResponse(
        { error: `Invalid message role: "${msg.role}"`, code: 'invalid_input' },
        400,
      );
    }

    // 4. Enforce max prompt length per message
    if (msg.content.length > MAX_PROMPT_LENGTH) {
      return jsonResponse(
        {
          error: `Message exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`,
          code: 'input_too_long',
          max_length: MAX_PROMPT_LENGTH,
          actual_length: msg.content.length,
        },
        400,
      );
    }

    // 5. Strip injection patterns
    let cleanContent = msg.content;
    for (const pattern of INJECTION_PATTERNS) {
      cleanContent = cleanContent.replace(pattern, '[filtered]');
    }

    sanitizedMessages.push({
      role: msg.role,
      content: cleanContent,
    });
  }

  return {
    taskType: task_type,
    messages: sanitizedMessages,
  };
}
