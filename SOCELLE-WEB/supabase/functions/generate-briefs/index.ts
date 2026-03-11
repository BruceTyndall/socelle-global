// generate-briefs — CMS-WO-11
// Runs via pg_cron (daily at 07:00 / weekly on Monday at 08:00).
// Fetches the most impactful signals from the last 24h/7d, sends them to OpenAI,
// and saves a formatted `story_drafts` row for editorial review.
// Never auto-publishes.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
// Using direct fetch to OpenAI api to minimize dependencies

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_KEY   = Deno.env.get('OPENAI_API_KEY')!;

Deno.serve(async (req) => {
  const started = Date.now();
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // ── Kill-switch check ──────────────────────────────────────────
  const { data: flag } = await supabase
    .from('feature_flags')
    .select('enabled')
    .eq('flag_name', 'generate-briefs')
    .maybeSingle();

  if (flag && !flag.enabled) {
    return json({ skipped: true, reason: 'kill-switch' });
  }

  const params = new URL(req.url).searchParams;
  const type   = params.get('type') === 'weekly' ? 'weekly' : 'daily';
  
  const lookbackHours = type === 'weekly' ? 168 : 24;
  const cutoff = new Date(Date.now() - lookbackHours * 3_600_000).toISOString();

  // ── Fetch top signals ──────────────────────────────────────────
  const { data: signals, error: fetchErr } = await supabase
    .from('market_signals')
    .select('id, title, description, magnitude, signal_type, category, source_name, updated_at')
    .gte('updated_at', cutoff)
    .order('magnitude', { ascending: false })
    .limit(10);

  if (fetchErr) return json({ error: fetchErr.message }, 500);

  if (!signals || signals.length === 0) {
    return json({ generated: 0, reason: 'no signals in time window' });
  }

  // ── Ask OpenAI to synthesize ───────────────────────────────────
  const signalsContext = signals
    .map(s => `- [${s.signal_type.toUpperCase()} / Magnitude ${s.magnitude}] ${s.title}: ${s.description} (Source: ${s.source_name || 'Unknown'})`)
    .join('\n');

  const prompt = `You are the lead Intelligence Editor for SOCELLE, a premium B2B intelligence platform for the professional beauty, medspa, and salon industries.
Write a ${type === 'weekly' ? 'Weekly Market Memo' : 'Daily Brief'} summarizing the following market signals.
Maintain an authoritative, sophisticated, and analytical tone. Do not use generic buzzwords.
Focus on strategic implications for operators, brands, and estheticians.

Include:
1. An overarching executive summary of the period's narrative.
2. 3-4 organized sections (e.g. "Regulatory Shifts," "Consumer Demand," "Clinical Innovations") grouping the signals.
3. A short "Strategic Takeaway" or "Action Item" for businesses.

You must reply with a valid JSON object matching this schema:
{
  "body": "Your markdown formatted brief of 400-600 words",
  "suggested_product_categories": ["retinol", "peptides", "led therapy", "micro-needling"] // 2-4 generic product categories or active ingredients relevant to the brief for monetization upselling.
}

Signals for context:
${signalsContext}`;

  const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!openAiRes.ok) {
    const text = await openAiRes.text();
    console.error('OpenAI Error:', text);
    return json({ error: 'LLM Generation Failed' }, 500);
  }

  const aiData = await openAiRes.json();
  const aiContent = aiData.choices?.[0]?.message?.content || '{}';
  let parsedContent;
  try {
    parsedContent = JSON.parse(aiContent);
  } catch(e) {
    parsedContent = { body: 'Generation failed to parse JSON', suggested_product_categories: [] };
  }
  
  const summaryBody = parsedContent.body || 'Generation completely failed';
  const categories = parsedContent.suggested_product_categories || [];
  
  // ── Retrieve Monetizable Products ──────────────────────────────
  let suggestedProducts: string[] = [];
  if (categories.length > 0) {
    const orQuery = categories.map((c: string) => `name.ilike.%${c}%`).join(',');
    const { data: prodMatches } = await supabase
      .from('products')
      .select('id')
      .or(orQuery)
      .limit(3);
    
    if (prodMatches) {
        suggestedProducts = prodMatches.map(p => p.id);
    }
  }
  
  // Create a predictable fingerprint for deduping to avoid cron spamming duplicates on retry
  const dateStr = new Date().toISOString().split('T')[0];
  const fingerprint = `auto-${type}-brief-${dateStr}`;

  // ── Insert Draft ───────────────────────────────────────────────
  const draftPayload = {
    title: `SOCELLE ${type === 'weekly' ? 'Weekly Market Memo' : 'Daily Intelligence Brief'} — ${dateStr}`,
    excerpt: `The essential overview of market shifts, emerging protocols, and competitive dynamics for ${dateStr}.`,
    body: summaryBody,
    status: 'pending',
    tags: [type === 'weekly' ? 'weekly-memo' : 'daily-brief'],
    category: 'Analysis',
    vertical: 'Executive',
    fingerprint,
    source_name: 'SOCELLE Intelligence',
    suggested_products: suggestedProducts,
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('story_drafts')
    .insert(draftPayload)
    .select('id')
    .maybeSingle();

  if (insertErr) {
    // If it's a unique constraint violation on fingerprint, it means it already ran today
    if (insertErr.code === '23505') {
       return json({ skipped: true, reason: 'Already drafted today' });
    }
    return json({ error: insertErr.message }, 500);
  }

  return json({
    generated: 1, 
    draft_id: inserted?.id,
    duration_ms: Date.now() - started 
  });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
