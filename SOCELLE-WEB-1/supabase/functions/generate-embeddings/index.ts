/**
 * generate-embeddings — Supabase Edge Function
 *
 * Two modes:
 *  1. Single query embedding: POST { text: string }
 *     → returns { embedding: number[] }
 *
 *  2. Batch worker mode: POST { batch: true, limit?: number }
 *     → polls embedding_queue, generates + stores embeddings, marks done
 *
 * Secrets required (set via `supabase secrets set`):
 *   OPENAI_API_KEY   — OpenAI API key for text-embedding-ada-002
 *   SUPABASE_URL     — auto-injected by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QueueRow {
  id: number;
  table_name: string;
  row_id: string;
}

interface EmbeddingResponse {
  data: Array<{ embedding: number[] }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function generateEmbedding(text: string, openaiKey: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8_191), // ada-002 max token limit ≈ 8191 tokens
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI embeddings API error ${res.status}: ${errBody}`);
  }

  const json: EmbeddingResponse = await res.json();
  return json.data[0].embedding;
}

function buildTextForRow(tableName: string, row: Record<string, unknown>): string {
  switch (tableName) {
    case 'canonical_protocols':
      return [
        row.protocol_name,
        row.description,
        Array.isArray(row.target_concerns) ? row.target_concerns.join(', ') : '',
        row.category,
      ]
        .filter(Boolean)
        .join(' | ');

    case 'retail_products':
    case 'pro_products':
      return [
        row.product_name,
        row.product_function,
        Array.isArray(row.target_concerns) ? row.target_concerns.join(', ') : '',
        Array.isArray(row.key_ingredients) ? row.key_ingredients.join(', ') : '',
        row.category,
      ]
        .filter(Boolean)
        .join(' | ');

    default:
      return String(row.name ?? row.title ?? row.id ?? '');
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Mode 1: Single query embedding ────────────────────────────
  if (typeof body.text === 'string') {
    try {
      const embedding = await generateEmbedding(body.text, openaiKey);
      return new Response(JSON.stringify({ embedding }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ── Mode 2: Batch worker ────────────────────────────────────────
  if (body.batch === true) {
    const limit = typeof body.limit === 'number' ? Math.min(body.limit, 50) : 20;
    const results: Array<{ id: number; status: 'done' | 'error'; error?: string }> = [];

    // Claim pending jobs
    const { data: jobs, error: queueError } = await supabase
      .from('embedding_queue')
      .select('id, table_name, row_id')
      .eq('status', 'pending')
      .order('created_at')
      .limit(limit);

    if (queueError) {
      return new Response(JSON.stringify({ error: queueError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const queue: QueueRow[] = (jobs as QueueRow[]) ?? [];

    if (queue.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: 'Queue empty' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mark all as "processing"
    await supabase
      .from('embedding_queue')
      .update({ status: 'processing' })
      .in('id', queue.map((j) => j.id));

    for (const job of queue) {
      try {
        // Fetch the row content
        const { data: rows, error: fetchErr } = await supabase
          .from(job.table_name)
          .select('*')
          .eq('id', job.row_id)
          .limit(1);

        if (fetchErr || !rows || rows.length === 0) {
          throw new Error(fetchErr?.message ?? 'Row not found');
        }

        const row = rows[0] as Record<string, unknown>;
        const text = buildTextForRow(job.table_name, row);

        if (!text.trim()) {
          throw new Error('Empty text — nothing to embed');
        }

        const embedding = await generateEmbedding(text, openaiKey);

        // Store embedding back into the source table
        const { error: updateErr } = await supabase
          .from(job.table_name)
          .update({
            embedding: `[${embedding.join(',')}]`,
            embedding_updated_at: new Date().toISOString(),
          })
          .eq('id', job.row_id);

        if (updateErr) throw new Error(updateErr.message);

        // Mark queue job done
        await supabase
          .from('embedding_queue')
          .update({ status: 'done', processed_at: new Date().toISOString() })
          .eq('id', job.id);

        results.push({ id: job.id, status: 'done' });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);

        await supabase
          .from('embedding_queue')
          .update({ status: 'error', error_message: msg })
          .eq('id', job.id);

        results.push({ id: job.id, status: 'error', error: msg });
      }
    }

    const doneCount = results.filter((r) => r.status === 'done').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return new Response(
      JSON.stringify({ processed: doneCount, errors: errorCount, results }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ error: 'Provide either { text: string } or { batch: true }' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } },
  );
});
