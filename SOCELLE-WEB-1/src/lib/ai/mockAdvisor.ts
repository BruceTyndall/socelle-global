import type { ChatMessage, ChatAction, IntentType, UserRole } from './types';

/* ── Intent Classification (keyword-based mock) ─────────────── */

const INTENT_KEYWORDS: Record<IntentType, string[]> = {
  product_inquiry: [
    'product', 'serum', 'cream', 'cleanser', 'moisturizer', 'retinol', 'vitamin c',
    'hyaluronic', 'peptide', 'exfoliant', 'mask', 'sunscreen', 'spf', 'toner',
    'oil', 'antioxidant', 'niacinamide', 'acid', 'peel', 'recommend',
  ],
  pricing_question: [
    'price', 'pricing', 'cost', 'tier', 'discount', 'wholesale', 'margin',
    'subscription', 'plan', 'fee', 'budget', 'afford', 'expensive', 'cheap',
  ],
  treatment_advice: [
    'treatment', 'protocol', 'facial', 'peel', 'microneedling', 'led',
    'hydrafacial', 'dermaplaning', 'extraction', 'acne', 'aging', 'pigmentation',
    'rosacea', 'sensitive', 'skin type', 'routine', 'regimen', 'procedure',
  ],
  reorder_request: [
    'reorder', 're-order', 'order again', 'replenish', 'restock', 'running low',
    'need more', 'out of stock', 'backorder', 'refill',
  ],
  competitor_comparison: [
    'compare', 'versus', 'vs', 'alternative', 'competitor', 'better than',
    'switch from', 'difference between', 'similar to',
  ],
  education_search: [
    'learn', 'training', 'certification', 'ce', 'course', 'webinar', 'tutorial',
    'education', 'class', 'workshop', 'credential', 'continuing education',
  ],
  complaint: [
    'complaint', 'issue', 'problem', 'wrong', 'damaged', 'broken', 'late',
    'missing', 'refund', 'return', 'disappointed', 'unhappy', 'terrible',
  ],
  general_chat: [],
};

export function classifyIntent(message: string): IntentType {
  const lower = message.toLowerCase();
  let bestIntent: IntentType = 'general_chat';
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [IntentType, string[]][]) {
    if (intent === 'general_chat') continue;
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestIntent;
}

/* ── Unique ID generator ────────────────────────────────────── */

function uid(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Response Templates ─────────────────────────────────────── */

interface MockResponse {
  content: string;
  actions?: ChatAction[];
}

const OPERATOR_RESPONSES: Record<IntentType, MockResponse[]> = {
  product_inquiry: [
    {
      content:
        'Based on current adoption trends among top-performing spas in your region, I would recommend looking at the SkinCeuticals C E Ferulic serum — it has a 94% reorder rate among Socelle operators. For a budget-friendly alternative with strong clinical backing, consider the PCA Skin C&E Advanced. Both pair beautifully with your existing protocol stack.',
      actions: [
        { type: 'show_product', label: 'View C E Ferulic', href: '/brands/skinceuticals' },
        { type: 'show_product', label: 'View PCA C&E Advanced', href: '/brands/pca-skin' },
        { type: 'compare', label: 'Compare Side-by-Side' },
      ],
    },
    {
      content:
        'Great question! The top-selling professional serums on Socelle this quarter are led by iS Clinical Active Serum and Environ AVST Moisturiser. Both show strong client retention data — operators using these report 23% higher rebooking rates. Want me to pull up detailed intelligence on either?',
      actions: [
        { type: 'show_brand', label: 'Explore iS Clinical', href: '/brands/is-clinical' },
        { type: 'show_intelligence', label: 'View Market Trends', href: '/portal/intelligence' },
      ],
    },
  ],
  pricing_question: [
    {
      content:
        'Socelle operates on a tiered wholesale pricing model. As a verified operator, you receive PRO pricing (typically 40-55% below retail). Your specific discount tier depends on your monthly order volume and partnership level. Premium and Elite tiers unlock additional margin advantages and priority fulfillment.',
      actions: [
        { type: 'show_intelligence', label: 'View Your Pricing Tier', href: '/portal/account' },
      ],
    },
    {
      content:
        'Pricing on Socelle is structured to protect your margins. Typical wholesale pricing sits at 40-55% below retail depending on the brand and your tier. Your Intelligence Hub shows real-time margin analysis for every product in your protocol stack — want me to pull that up?',
      actions: [
        { type: 'show_intelligence', label: 'Open Margin Analysis', href: '/portal/intelligence' },
      ],
    },
  ],
  treatment_advice: [
    {
      content:
        'For hyperpigmentation protocols, the data shows strongest outcomes when combining a professional-grade chemical peel (like PCA Skin Sensi Peel) with a daily vitamin C regimen. Socelle intelligence shows operators using this combination report 31% higher client satisfaction scores. I can pull up the full protocol recommendation with retail attach opportunities.',
      actions: [
        { type: 'show_product', label: 'View Peel Options', href: '/brands' },
        { type: 'show_education', label: 'Pigmentation Protocols CE', href: '/education' },
      ],
    },
    {
      content:
        'Based on Socelle market intelligence, the most requested treatments this quarter are LED light therapy add-ons (+47% demand), hydrafacial variants, and combination peels. Operators adding LED to existing facial menus see an average $35 per-service revenue increase. Want me to show you treatment-specific product bundles?',
      actions: [
        { type: 'show_intelligence', label: 'Treatment Trend Data', href: '/portal/intelligence' },
        { type: 'show_education', label: 'LED Therapy Training', href: '/education' },
      ],
    },
  ],
  reorder_request: [
    {
      content:
        'I can help you with that! Based on your order history, it looks like you typically reorder your core products every 6-8 weeks. I have prepared a suggested reorder based on your consumption patterns. Would you like me to show your previous order so you can adjust quantities?',
      actions: [
        { type: 'create_order', label: 'View Suggested Reorder', href: '/portal/orders' },
        { type: 'show_product', label: 'Browse New Arrivals', href: '/brands' },
      ],
    },
  ],
  competitor_comparison: [
    {
      content:
        'I can pull up a detailed comparison for you. Socelle intelligence tracks adoption rates, reorder frequency, client satisfaction scores, and margin data across all professional brands on the platform. This gives you an objective, data-driven view rather than just marketing claims. Which brands would you like me to compare?',
      actions: [
        { type: 'compare', label: 'Open Brand Comparison Tool' },
        { type: 'show_intelligence', label: 'View Market Intelligence', href: '/portal/intelligence' },
      ],
    },
  ],
  education_search: [
    {
      content:
        'Socelle offers CE-accredited education across multiple categories — ingredient science, treatment protocols, business operations, and regulatory compliance. Your Intelligence Hub tracks your CE credits and suggests courses based on your service menu gaps. Here are some popular options this quarter:',
      actions: [
        { type: 'show_education', label: 'Browse CE Courses', href: '/education' },
        { type: 'show_intelligence', label: 'View Your CE Progress', href: '/portal/intelligence' },
      ],
    },
  ],
  complaint: [
    {
      content:
        'I am sorry to hear you are experiencing an issue. I want to make sure this gets resolved quickly. For order-related concerns, our operations team can assist directly. In the meantime, I have flagged this in your account for priority attention. Can you share more details about the specific issue?',
      actions: [
        { type: 'show_intelligence', label: 'View Order History', href: '/portal/orders' },
      ],
    },
  ],
  general_chat: [
    {
      content:
        'I am here to help! As your Socelle intelligence advisor, I can assist with product recommendations, treatment protocol guidance, market intelligence insights, pricing information, CE education resources, and reorder management. What would you like to explore?',
      actions: [
        { type: 'show_intelligence', label: 'Open Intelligence Hub', href: '/portal/intelligence' },
        { type: 'show_education', label: 'Browse Education', href: '/education' },
        { type: 'show_product', label: 'Explore Brands', href: '/brands' },
      ],
    },
    {
      content:
        'Happy to help! I have access to real-time market signals, product performance data, and personalized recommendations based on your business profile. Try asking me about trending products, treatment protocols, or how your product mix compares to top-performing operators in your area.',
    },
  ],
};

const BRAND_RESPONSES: Record<IntentType, MockResponse[]> = {
  product_inquiry: [
    {
      content:
        'Based on Socelle market intelligence, your top-performing SKUs this quarter show strong velocity among medspa operators. Your serum line is outperforming the category average by 18%. I notice your newest product launch has lower initial adoption — would you like to see which operator segments are the best targets for outreach?',
      actions: [
        { type: 'show_intelligence', label: 'View Product Analytics', href: '/brand/performance' },
        { type: 'show_brand', label: 'View Retailer Adoption', href: '/brand/customers' },
      ],
    },
  ],
  pricing_question: [
    {
      content:
        'Your current pricing strategy positions you competitively within the professional skincare segment. Socelle data shows your average wholesale margin sits at 52%, which is slightly above the category median of 48%. Operators tend to respond well to volume-based incentive structures — want me to show you the campaign builder for creating tier-based promotions?',
      actions: [
        { type: 'show_intelligence', label: 'Pricing Intelligence', href: '/brand/intelligence' },
        { type: 'show_brand', label: 'Create Promotion', href: '/brand/promotions' },
      ],
    },
  ],
  treatment_advice: [
    {
      content:
        'Your brand protocols show strong adoption among estheticians, particularly your advanced facial series. Socelle intelligence indicates that operators using your protocols have a 27% higher rebooking rate. Consider expanding your protocol library with trending treatments like LED combination therapies — these are seeing 47% demand growth this quarter.',
      actions: [
        { type: 'show_education', label: 'Protocol Performance', href: '/brand/performance' },
        { type: 'show_intelligence', label: 'Treatment Trend Data', href: '/brand/intelligence' },
      ],
    },
  ],
  reorder_request: [
    {
      content:
        'Your reorder analytics show strong retention patterns — 78% of operators who make an initial purchase reorder within 60 days. I can show you which operators are approaching their typical reorder window so you can proactively reach out with targeted campaigns.',
      actions: [
        { type: 'show_brand', label: 'View Reorder Pipeline', href: '/brand/pipeline' },
        { type: 'create_order', label: 'Create Reorder Campaign', href: '/brand/campaigns/new' },
      ],
    },
  ],
  competitor_comparison: [
    {
      content:
        'Socelle market intelligence shows your brand holds strong positioning in the professional treatment category. Your adoption rate is growing 12% month-over-month, outpacing the category average of 8%. Key differentiators that operators cite include clinical backing and protocol support. Want me to show the full competitive landscape analysis?',
      actions: [
        { type: 'show_intelligence', label: 'Market Position Report', href: '/brand/intelligence' },
        { type: 'compare', label: 'Competitive Landscape' },
      ],
    },
  ],
  education_search: [
    {
      content:
        'Education content is a powerful driver of brand loyalty on Socelle. Brands with active CE programs see 34% higher retailer retention. Your current education library has 3 active courses. Consider adding protocol-specific training — operators rank this as their #1 desired education type.',
      actions: [
        { type: 'show_education', label: 'Manage Education Content', href: '/brand/storefront' },
        { type: 'show_intelligence', label: 'Education Performance', href: '/brand/intelligence' },
      ],
    },
  ],
  complaint: [
    {
      content:
        'I understand your concern. For brand-related operational issues, I can help you review order fulfillment data and retailer feedback. Let me pull up the relevant details so we can address this promptly.',
      actions: [
        { type: 'show_brand', label: 'View Order Issues', href: '/brand/orders' },
        { type: 'show_brand', label: 'Retailer Messages', href: '/brand/messages' },
      ],
    },
  ],
  general_chat: [
    {
      content:
        'Welcome! As your Socelle brand intelligence advisor, I can help with market positioning analysis, retailer insights, campaign strategy, product performance data, and education content planning. What would you like to explore today?',
      actions: [
        { type: 'show_intelligence', label: 'Open Intelligence Hub', href: '/brand/intelligence' },
        { type: 'show_brand', label: 'View Dashboard', href: '/brand/dashboard' },
        { type: 'show_brand', label: 'Retailer Pipeline', href: '/brand/pipeline' },
      ],
    },
    {
      content:
        'I am here to help you grow your brand presence on Socelle. I can analyze your market position, identify high-potential retailer segments, suggest campaign strategies, and surface competitive intelligence. What area would you like to focus on?',
    },
  ],
};

/* ── Generate Response ──────────────────────────────────────── */

export async function generateResponse(
  message: string,
  userRole: UserRole,
): Promise<ChatMessage> {
  const intent = classifyIntent(message);
  const pool = userRole === 'operator' ? OPERATOR_RESPONSES : BRAND_RESPONSES;
  const candidates = pool[intent];
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  // Simulate realistic latency (500–1500 ms)
  const delay = 500 + Math.random() * 1000;
  await new Promise((r) => setTimeout(r, delay));

  return {
    id: uid(),
    role: 'assistant',
    content: chosen.content,
    timestamp: new Date(),
    intent,
    actions: chosen.actions,
    feedback: null,
  };
}

/* ── Greeting Messages ──────────────────────────────────────── */

export function getGreeting(userRole: UserRole, userName?: string): ChatMessage {
  const name = userName || (userRole === 'operator' ? 'there' : 'team');

  const content =
    userRole === 'operator'
      ? `Hi ${name}, I'm your Socelle intelligence advisor. I can help you discover products, optimize your treatment protocols, find CE education, and surface market insights tailored to your business. What can I help you with today?`
      : `Hi ${name}, I'm your Socelle market intelligence advisor. I can help you analyze retailer adoption, track competitive positioning, plan campaigns, and surface performance insights for your brand. How can I assist you?`;

  return {
    id: uid(),
    role: 'assistant',
    content,
    timestamp: new Date(),
    feedback: null,
  };
}
