import { supabase } from './supabase';

export type IntelligenceMode =
  | 'brand_expert'
  | 'service_strategy'
  | 'budget_guide'
  | 'training_advisor'
  | 'sales_enablement';

// Maps Socelle intelligence modes → ai-orchestrator concierge modes
const MODE_TO_ORCHESTRATOR: Record<IntelligenceMode, string> = {
  brand_expert:     'discovery',
  service_strategy: 'protocol',
  budget_guide:     'retail',
  training_advisor: 'support',
  sales_enablement: 'analytics',
};

export type ConfidenceLevel = 'High' | 'Medium' | 'Low' | 'Unknown';

export interface ConciergeResponse {
  directAnswer: string;
  contextualExplanation: string;
  scopeBoundary: string;
  followUpQuestion?: string;
  sourceTables: string[];
  missingDataFlags: string[];
  confidenceLevel: ConfidenceLevel;
  mode: IntelligenceMode;
}

export interface ConciergeContext {
  spaId?: string;
  userRole: string;
  contextPage: string;
  budgetProfile?: any;
  serviceMenu?: any;
}

const APPROVED_TABLES: Record<IntelligenceMode, string[]> = {
  brand_expert: [
    'canonical_protocols',
    'canonical_protocol_steps',
    'retail_products',
    'pro_products',
    'mixing_rules',
    'marketing_calendar',
    'brand_differentiation_points',
    'retail_attach_recommendations'
  ],
  service_strategy: [
    'canonical_protocols',
    'canonical_protocol_steps',
    'spa_service_mapping',
    'service_gap_analysis',
    'marketing_calendar',
    'phased_rollout_plans'
  ],
  budget_guide: [
    'retail_products',
    'pro_products',
    'spa_service_mapping',
    'opening_orders'
  ],
  training_advisor: [
    'canonical_protocols',
    'canonical_protocol_steps',
    'pro_products',
    'mixing_rules',
    'spa_service_mapping',
    'implementation_readiness',
    'phased_rollout_plans'
  ],
  sales_enablement: [
    'canonical_protocols',
    'retail_products',
    'pro_products',
    'marketing_calendar',
    'service_gap_analysis',
    'implementation_readiness',
    'phased_rollout_plans',
    'opening_orders',
    'brand_differentiation_points',
    'retail_attach_recommendations'
  ]
};

const MODE_DESCRIPTIONS: Record<IntelligenceMode, string> = {
  brand_expert: 'Brand & Product Expert - Explains product benefits, protocols, and brand positioning',
  service_strategy: 'Service Strategy Explainer - Clarifies service offerings, gaps, and opportunities',
  budget_guide: 'Budget & Affordability Guide - Explains costs, opening orders, and budget constraints',
  training_advisor: 'Implementation & Training Advisor - Guides on training requirements and rollout',
  sales_enablement: 'Sales Enablement - Supports sales conversations and proposal development (admin-only)'
};

export function selectMode(question: string, context: ConciergeContext): IntelligenceMode {
  const lowerQuestion = question.toLowerCase();

  if (context.userRole === 'admin' && context.contextPage === 'pipeline') {
    return 'sales_enablement';
  }

  if (
    lowerQuestion.includes('price') ||
    lowerQuestion.includes('cost') ||
    lowerQuestion.includes('budget') ||
    lowerQuestion.includes('afford') ||
    lowerQuestion.includes('opening order')
  ) {
    return 'budget_guide';
  }

  if (
    lowerQuestion.includes('train') ||
    lowerQuestion.includes('implement') ||
    lowerQuestion.includes('rollout') ||
    lowerQuestion.includes('ready') ||
    lowerQuestion.includes('timeline')
  ) {
    return 'training_advisor';
  }

  if (
    lowerQuestion.includes('gap') ||
    lowerQuestion.includes('service') ||
    lowerQuestion.includes('menu') ||
    lowerQuestion.includes('offering') ||
    lowerQuestion.includes('phased')
  ) {
    return 'service_strategy';
  }

  return 'brand_expert';
}

/** @deprecated Provider selection is now handled server-side by ai-orchestrator. */
export type AIProvider = 'claude' | 'gemini';

export async function processQuestion(
  question: string,
  context: ConciergeContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _provider?: AIProvider
): Promise<ConciergeResponse> {
  const mode = selectMode(question, context);

  if (mode === 'sales_enablement' && context.userRole !== 'admin') {
    return createGuardrailResponse(
      'Sales enablement features are only available to administrators.',
      mode
    );
  }

  const allowedTables = APPROVED_TABLES[mode];

  try {
    const retrievedData = await retrieveRelevantData(question, allowedTables, context);

    // Call ai-orchestrator via supabase.functions.invoke (automatically attaches
    // the user JWT — no raw fetch, no exposed API keys in the browser).
    // Falls back to rule-based engine if the orchestrator is unavailable.
    let aiAnswer: string | null = null;
    try {
      const { data: orchData, error: orchError } = await supabase.functions.invoke(
        'ai-orchestrator',
        {
          body: {
            task_type: 'chat_concierge',
            messages: [{ role: 'user', content: question }],
            context: retrievedData,
            feature: `concierge_${MODE_TO_ORCHESTRATOR[mode]}`,
            mode: MODE_TO_ORCHESTRATOR[mode],
            user_role: context.userRole,
            context_page: context.contextPage,
          },
        },
      );

      if (orchError) {
        const errMsg = orchError.message ?? '';
        // 402 — insufficient credits: return a user-friendly response
        if (errMsg.includes('402') || errMsg.includes('insufficient')) {
          return createGuardrailResponse(
            'Your credit balance is too low to use the AI concierge. Please top up your credits at /pricing to continue.',
            mode,
          );
        }
        // 403 — subscription tier insufficient
        if (errMsg.includes('403') || errMsg.includes('tier_insufficient')) {
          return createGuardrailResponse(
            'AI concierge requires an active subscription. Please upgrade your plan to access AI features.',
            mode,
          );
        }
        // 429 — rate limit exceeded
        if (errMsg.includes('429') || errMsg.includes('rate_limit')) {
          return createGuardrailResponse(
            'You have exceeded the AI request limit. Please wait a moment and try again.',
            mode,
          );
        }
        // Other orchestrator errors — fall through to rule-based engine
      }

      if (!orchError && orchData?.answer) {
        aiAnswer = orchData.answer as string;
      }
    } catch {
      // Orchestrator unavailable — fall through to rule-based engine
    }

    const response = await generateResponse(question, retrievedData, mode, context);

    // If AI returned an enhanced answer, replace the directAnswer
    if (aiAnswer) {
      response.directAnswer = aiAnswer;
      response.contextualExplanation = '';
    }

    await logInteraction(question, response, context);

    return response;
  } catch (error) {
    console.error('AI Concierge error:', error);
    return createErrorResponse(mode);
  }
}

async function retrieveRelevantData(
  question: string,
  allowedTables: string[],
  context: ConciergeContext
): Promise<Record<string, any[]>> {
  const data: Record<string, any[]> = {};
  const lowerQuestion = question.toLowerCase();

  // Determine which tables to query and with what limits (no I/O yet)
  const tableConfigs: Array<{ tableName: string; limit: number }> = [];

  for (const tableName of allowedTables) {
    let shouldRetrieve = false;
    let limit = 20;

    if (tableName === 'canonical_protocols') {
      shouldRetrieve = true;
      limit = 15;
    } else if (tableName === 'retail_products') {
      shouldRetrieve = lowerQuestion.includes('retail') || lowerQuestion.includes('product') || lowerQuestion.includes('hydrat') || lowerQuestion.includes('cleans') || lowerQuestion.includes('serum');
      limit = 25;
    } else if (tableName === 'pro_products') {
      shouldRetrieve = lowerQuestion.includes('backbar') || lowerQuestion.includes('pro') || lowerQuestion.includes('product') || lowerQuestion.includes('treatment');
      limit = 25;
    } else if (tableName === 'brand_differentiation_points') {
      shouldRetrieve = lowerQuestion.includes('different') || lowerQuestion.includes('unique') || lowerQuestion.includes('brand') || lowerQuestion.includes('why');
    } else if (tableName === 'service_gap_analysis') {
      shouldRetrieve = lowerQuestion.includes('gap') || lowerQuestion.includes('opportunity') || lowerQuestion.includes('missing');
    } else if (tableName === 'opening_orders') {
      shouldRetrieve = lowerQuestion.includes('opening') || lowerQuestion.includes('order') || lowerQuestion.includes('stock');
    } else if (tableName === 'marketing_calendar') {
      shouldRetrieve = lowerQuestion.includes('season') || lowerQuestion.includes('market') || lowerQuestion.includes('launch') || lowerQuestion.includes('promo');
      limit = 12;
    } else if (tableName === 'spa_service_mapping') {
      shouldRetrieve = lowerQuestion.includes('service') || lowerQuestion.includes('mapping') || lowerQuestion.includes('menu');
      limit = 30;
    } else {
      shouldRetrieve = true;
      limit = 10;
    }

    if (shouldRetrieve) {
      tableConfigs.push({ tableName, limit });
    }
  }

  // Fire all eligible queries in parallel
  const SPA_SCOPED_TABLES = ['spa_service_mapping', 'service_gap_analysis', 'opening_orders', 'phased_rollout_plans'];

  await Promise.all(
    tableConfigs.map(async ({ tableName, limit }) => {
      try {
        let query = supabase.from(tableName).select('*');
        if (context.spaId && SPA_SCOPED_TABLES.includes(tableName)) {
          query = query.eq('spa_menu_id', context.spaId);
        }
        const { data: result } = await query.limit(limit);
        if (result && result.length > 0) {
          data[tableName] = result;
        }
      } catch (error: any) {
        console.warn(`Could not retrieve data from ${tableName}:`, error);
      }
    })
  );

  return data;
}

async function generateResponse(
  question: string,
  retrievedData: Record<string, any[]>,
  mode: IntelligenceMode,
  context: ConciergeContext
): Promise<ConciergeResponse> {
  const sourceTables = Object.keys(retrievedData);
  const missingDataFlags: string[] = [];
  const lowerQuestion = question.toLowerCase();

  let directAnswer = '';
  let contextualExplanation = '';
  let scopeBoundary = '';
  let followUpQuestion = '';
  let confidenceLevel: ConfidenceLevel = 'Medium';

  if (sourceTables.length === 0) {
    return await createNoDataResponse(question, mode, context);
  }

  if (mode === 'brand_expert') {
    if (lowerQuestion.includes('different') || lowerQuestion.includes('unique')) {
      const brandPoints = retrievedData['brand_differentiation_points'] || [];
      if (brandPoints.length > 0) {
        directAnswer = `Naturopathica stands out through ${brandPoints.length} key differentiators: ${brandPoints.slice(0, 3).map((p: any) => p.point_text).join('; ')}.`;
        contextualExplanation = 'These differentiation points are designed to position Naturopathica as a holistic, science-backed wellness brand that emphasizes natural ingredients and sustainable practices.';
        scopeBoundary = `Based on ${brandPoints.length} brand differentiation points in our database.`;
        followUpQuestion = 'Would you like to know which specific protocols showcase these brand values?';
        confidenceLevel = 'High';
      }
    } else if (lowerQuestion.includes('protocol')) {
      const protocols = retrievedData['canonical_protocols'] || [];
      if (protocols.length > 0) {
        directAnswer = `We have ${protocols.length} Naturopathica protocols available, including ${protocols.slice(0, 3).map((p: any) => p.protocol_name).join(', ')}.`;
        contextualExplanation = 'Each protocol is designed with Naturopathica\'s signature blend of botanical ingredients and therapeutic techniques, ensuring consistent brand delivery.';
        scopeBoundary = `Based on ${protocols.length} canonical protocols with detailed step-by-step instructions.`;
        followUpQuestion = 'Would you like to learn about the key ingredients or benefits of a specific protocol?';
        confidenceLevel = 'High';
      }
    } else if (lowerQuestion.includes('product')) {
      const retailProducts = retrievedData['retail_products'] || [];
      const proProducts = retrievedData['pro_products'] || [];
      directAnswer = `Naturopathica offers ${retailProducts.length} retail SKUs and ${proProducts.length} professional products.`;
      contextualExplanation = 'The product line is curated to support both in-service treatments and home care routines, creating a complete wellness journey for clients.';
      scopeBoundary = `Based on current retail and professional product catalogs.`;
      followUpQuestion = 'Would you like to know which products are best-sellers or which pair with specific services?';
      confidenceLevel = 'High';
    }
  } else if (mode === 'service_strategy') {
    if (lowerQuestion.includes('gap')) {
      const gaps = retrievedData['service_gap_analysis'] || [];
      if (gaps.length > 0) {
        const highPriorityGaps = gaps.filter((g: any) => g.priority_level === 'high');
        directAnswer = `Your gap analysis identified ${gaps.length} opportunities, with ${highPriorityGaps.length} high-priority recommendations.`;
        contextualExplanation = 'These gaps represent service categories where Naturopathica protocols can complement your existing menu and attract new client segments.';
        scopeBoundary = `Based on gap analysis for your specific spa menu.`;
        followUpQuestion = 'Would you like to see which protocols fill your highest-priority gaps?';
        confidenceLevel = 'High';
      } else {
        missingDataFlags.push('No gap analysis found for this spa');
        confidenceLevel = 'Low';
      }
    }
  } else if (mode === 'budget_guide') {
    if (context.budgetProfile) {
      const budgetTier = context.budgetProfile.budget_tier;
      directAnswer = `Your ${budgetTier} tier budget allows for 3 retail SKUs per product and 1 professional unit per backbar item.`;
      contextualExplanation = 'This ensures you have sufficient inventory to launch without overcommitting capital, while maintaining brand standards.';
      scopeBoundary = 'Based on your selected budget tier and Naturopathica\'s recommended opening order guidelines.';
      followUpQuestion = 'Would you like to see which products are prioritized in your opening order?';
      confidenceLevel = 'High';
    } else {
      const orders = retrievedData['opening_orders'] || [];
      if (orders.length > 0) {
        const totalItems = orders.reduce((sum: number, o: any) => sum + (o.recommended_quantity || 0), 0);
        directAnswer = `Your opening order includes ${orders.length} products with ${totalItems} total units.`;
        contextualExplanation = 'This opening order is calculated based on your service menu, expected treatment volume, and budget constraints.';
        scopeBoundary = 'Based on opening order recommendations generated by the system.';
        confidenceLevel = 'High';
      } else {
        missingDataFlags.push('No opening order calculated yet');
        confidenceLevel = 'Low';
      }
    }
  } else if (mode === 'training_advisor') {
    const protocols = retrievedData['canonical_protocols'] || [];
    const readiness = retrievedData['implementation_readiness'] || [];

    if (protocols.length > 0) {
      directAnswer = `Training covers ${protocols.length} protocols with step-by-step instruction, contraindication awareness, and retail attachment strategies.`;
      contextualExplanation = 'Comprehensive training ensures your team can deliver authentic Naturopathica experiences while maintaining safety and brand standards.';
      scopeBoundary = 'Based on protocols included in your implementation plan.';
      followUpQuestion = 'Would you like to know the estimated training duration or prerequisites?';
      confidenceLevel = readiness.length > 0 ? 'High' : 'Medium';
    }
  }

  if (!directAnswer) {
    directAnswer = 'I can help answer questions about Naturopathica products, protocols, and implementation within my knowledge base.';
    contextualExplanation = 'My responses are based exclusively on verified Naturopathica data and your specific spa context.';
    scopeBoundary = `Operating in ${MODE_DESCRIPTIONS[mode]} mode.`;
    confidenceLevel = 'Low';
  }

  return {
    directAnswer,
    contextualExplanation,
    scopeBoundary,
    followUpQuestion,
    sourceTables,
    missingDataFlags,
    confidenceLevel,
    mode
  };
}

async function createNoDataResponse(
  _question: string,
  mode: IntelligenceMode,
  _context: ConciergeContext
): Promise<ConciergeResponse> {
  const availableDataSuggestions: string[] = [];

  const { count: protocolCount } = await supabase.from('canonical_protocols').select('id', { count: 'exact', head: true });
  const { count: retailCount } = await supabase.from('retail_products').select('id', { count: 'exact', head: true });
  const { count: proCount } = await supabase.from('pro_products').select('id', { count: 'exact', head: true });
  const { count: brandCount } = await supabase.from('brand_differentiation_points').select('id', { count: 'exact', head: true });

  if (protocolCount && protocolCount > 0) {
    availableDataSuggestions.push('Try asking about specific Naturopathica protocols');
  }
  if (retailCount && retailCount > 0) {
    availableDataSuggestions.push('Ask about retail products for specific skin concerns');
  }
  if (proCount && proCount > 0) {
    availableDataSuggestions.push('Inquire about professional/backbar products');
  }
  if (brandCount && brandCount > 0) {
    availableDataSuggestions.push('Learn what makes Naturopathica unique');
  }

  const suggestionsText = availableDataSuggestions.length > 0
    ? ` Here are some topics I can help with: ${availableDataSuggestions.slice(0, 3).join('; ')}.`
    : ' The database may not have been fully populated yet.';

  return {
    directAnswer: 'I don\'t have matching data for that specific question yet.',
    contextualExplanation: `My responses are based on verified Naturopathica data in the system.${suggestionsText}`,
    scopeBoundary: `Operating in ${MODE_DESCRIPTIONS[mode]} mode. No matching data found for your query.`,
    followUpQuestion: availableDataSuggestions.length > 0 ? availableDataSuggestions[0] : 'Can you rephrase your question?',
    sourceTables: [],
    missingDataFlags: ['No relevant data found in search'],
    confidenceLevel: 'Unknown',
    mode
  };
}

function createGuardrailResponse(
  message: string,
  mode: IntelligenceMode
): ConciergeResponse {
  return {
    directAnswer: message,
    contextualExplanation: 'This feature has restricted access to maintain governance and data security.',
    scopeBoundary: 'Access control enforced by AI Concierge guardrails.',
    sourceTables: [],
    missingDataFlags: [],
    confidenceLevel: 'High',
    mode
  };
}

function createErrorResponse(mode: IntelligenceMode): ConciergeResponse {
  return {
    directAnswer: 'I encountered an error processing your question.',
    contextualExplanation: 'This may be due to a temporary system issue or data access problem.',
    scopeBoundary: 'Error occurred during retrieval or processing.',
    followUpQuestion: 'Please try asking your question again in a moment.',
    sourceTables: [],
    missingDataFlags: ['System error'],
    confidenceLevel: 'Unknown',
    mode
  };
}

async function logInteraction(
  question: string,
  response: ConciergeResponse,
  context: ConciergeContext
): Promise<void> {
  try {
    const logEntry = {
      spa_id: context.spaId || null,
      user_role: context.userRole,
      mode_used: response.mode,
      user_question: question,
      ai_response: JSON.stringify({
        directAnswer: response.directAnswer,
        contextualExplanation: response.contextualExplanation,
        scopeBoundary: response.scopeBoundary,
        followUpQuestion: response.followUpQuestion
      }),
      source_tables: response.sourceTables,
      missing_data_flags: response.missingDataFlags,
      confidence_level: response.confidenceLevel,
      context_page: context.contextPage
    };

    await supabase.from('ai_concierge_chat_logs').insert(logEntry);
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
}

export async function getStarterQuestions(contextPage: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('ai_concierge_starter_questions')
      .select('question_text')
      .eq('context_page', contextPage)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(5);

    return data?.map(q => q.question_text) || [];
  } catch (error) {
    console.error('Failed to load starter questions:', error);
    return [];
  }
}
