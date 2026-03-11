import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid request format. Expected messages array.');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the auth user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Tools for the AI
    const tools = [
      {
        type: 'function',
        function: {
          name: 'search_products',
          description: 'Search for clinical products in the catalog based on keywords or conditions. For example: "products for hyperpigmentation", "tranexamic acid"',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The search term to look for.' },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'search_intelligence',
          description: 'Search for intelligence protocols, market signals, or educational articles based on a topic.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The topic to search for.' },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'add_to_cart',
          description: 'Add a specific product to the user\'s shopping cart. Requires product_id.',
          parameters: {
            type: 'object',
            properties: {
              product_id: { type: 'string', description: 'The internal ID of the product.' },
              variant_id: { type: 'string', description: 'Optional variant ID if applicable.' },
              quantity: { type: 'number', description: 'Number of items to add. Default is 1.' },
            },
            required: ['product_id'],
          },
        },
      }
    ];

    // Call OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) throw new Error('OpenAI key missing from edge function environment');

    const systemPrompt = {
      role: 'system',
      content: `You are the Socelle Shopping and Protocol Assistant, an expert AI embedded into a B2B clinical beauty platform.
Your goal is to help operators (MedSpas, Dermatologists, Estheticians) find products, navigate clinical protocols, and purchase items.
When they ask about conditions (e.g., hyperpigmentation, acne), ALWAYS use the search_products tool to find actual products in the database, and the search_intelligence tool to find relevant protocol signals.
If they say "add this to my cart", identify the product_id from the context and use the add_to_cart tool.
Be professional, concise, and clinical in tone. Format any lists with bullet points. Do not make up products.`
    };

    const finalMessages = [systemPrompt, ...messages];

    let response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: finalMessages,
        tools: tools,
        tool_choice: 'auto',
      }),
    });

    let openaiData = await response.json();
    let responseMessage = openaiData.choices[0].message;

    // Handle tool calls
    if (responseMessage.tool_calls) {
      finalMessages.push(responseMessage); // Add the assistant's tool call message

      for (const toolCall of responseMessage.tool_calls) {
        let functionResponse = '';
        const args = JSON.parse(toolCall.function.arguments);

        if (toolCall.function.name === 'search_products') {
          // Perform vector/ilike search against products
          // Mocking the vector search logic for the edge function scope. In a real scenario, this hits an RPC for pgvector.
          const { data: products } = await supabaseClient
            .from('products')
            .select('id, name, short_description, price_cents, slug, images')
            .ilike('name', `%${args.query}%`)
            .limit(5);
            
          if (products && products.length > 0) {
            functionResponse = JSON.stringify(products);
          } else {
            // Fallback search in description
            const { data: descProducts } = await supabaseClient
              .from('products')
              .select('id, name, short_description, price_cents, slug, images')
              .ilike('description', `%${args.query}%`)
              .limit(5);
            functionResponse = JSON.stringify(descProducts || []);
          }
        } 
        else if (toolCall.function.name === 'search_intelligence') {
          const { data: signals } = await supabaseClient
            .from('market_signals')
            .select('id, title, summary, signal_type')
            .ilike('title', `%${args.query}%`)
            .limit(3);
          functionResponse = JSON.stringify(signals || []);
        } 
        else if (toolCall.function.name === 'add_to_cart') {
          const qty = args.quantity || 1;
          
          // First get the active cart
          let { data: cart } = await supabaseClient
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
            
          if (!cart) {
            const { data: newCart } = await supabaseClient
              .from('carts')
              .insert({ user_id: user.id })
              .select('id')
              .single();
            cart = newCart;
          }
          
          if (cart) {
            // Get price from product
            const { data: product } = await supabaseClient
              .from('products')
              .select('price_cents')
              .eq('id', args.product_id)
              .single();
              
            if (product) {
               await supabaseClient
                .from('cart_items')
                .upsert({
                  cart_id: cart.id,
                  product_id: args.product_id,
                  variant_id: args.variant_id || null,
                  quantity: qty,
                  unit_price_cents: product.price_cents
                }, { onConflict: 'cart_id, product_id, variant_id' });
                functionResponse = JSON.stringify({ success: true, message: `Added ${qty} to cart.` });
            } else {
               functionResponse = JSON.stringify({ error: "Product not found" });
            }
          }
        }

        // Add tool response to messages
        finalMessages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: toolCall.function.name,
          content: functionResponse,
        });
      }

      // Second call to OpenAI with tool results
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: finalMessages,
        }),
      });
      openaiData = await response.json();
      responseMessage = openaiData.choices[0].message;
    }

    // Parse out links/suggestions if the LLM mentioned any products or signals
    const suggestions: any[] = [];
    
    // Simple heuristic: if the assistant mentions a product by name, try to extract a link. 
    // In a production system, we would ask the LLM to output structured JSON for suggestions.
    
    return new Response(JSON.stringify({ 
      reply: responseMessage.content,
      role: 'assistant'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
