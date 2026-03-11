import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function run() {
  console.log("Calling edge function as guest...");

  const startTime = Date.now();
  const res = await fetch(`${supabaseUrl}/functions/v1/ai-orchestrator`, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`, // Required by Kong if anon
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_type: "chat_concierge",
      feature: "test_script",
      messages: [{ role: "user", content: "Show me skincare brands for sensitive skin" }]
    })
  });

  console.log(`Status: ${res.status} (Took ${Date.now() - startTime}ms)`);
  const body = await res.text();
  console.log("Body:", body.substring(0, 500));
}
run();
