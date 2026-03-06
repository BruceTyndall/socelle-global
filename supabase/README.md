# SOCELLE Backend Workspace

> **Agent Persona:** Database Architect & API Engineer  
> **Domain:** This folder only — migrations, seeds, Edge Functions.

---

## Folder Structure

```
supabase/
├── config.toml                          ← Local dev config (ports, services)
├── seed.sql                             ← Dev/test seed data
├── .env.example                         ← Copy to .env and fill in secrets
├── migrations/
│   ├── 20260305000001_initial_schema.sql  ← Core tables + RLS policies
│   └── 20260305000002_vector_search_fn.sql ← pgvector match function
└── functions/
    └── ai-orchestrator/
        └── index.ts                     ← Deno Edge Function (JWT auth → vector search → LLM)
```

---

## Quick Start (Local Development)

```bash
# 1. Install Supabase CLI (if not installed)
brew install supabase/tap/supabase

# 2. Start local Supabase stack
supabase start

# 3. Apply migrations + seed data
supabase db reset

# 4. Open Supabase Studio
open http://localhost:54323

# 5. Serve Edge Functions locally
supabase functions serve ai-orchestrator --env-file .env
```

---

## Key Commands

| Task | Command |
|------|---------|
| Apply migrations | `supabase db reset` |
| Create new migration | `supabase migration new <name>` |
| Deploy Edge Function | `supabase functions deploy ai-orchestrator` |
| Generate TS types | `supabase gen types typescript --local > ../SOCELLE-WEB/src/types/database.types.ts` |
| Run DB lint | `supabase db lint` |
| Push to remote | `supabase db push` |

---

## Agent Handoff Protocol

When you add or change a table column, do the following:
1. Write the migration SQL in `migrations/`
2. Run `supabase gen types typescript --local` 
3. Copy `database.types.ts` to:
   - `../SOCELLE-WEB/src/types/database.types.ts`
   - `../SOCELLE-MOBILE-main/packages/shared/lib/database.types.ts`
4. Note the change in `docs/schema-changelog.md` for the Mobile and Web agents

---

## Phase 1 Checklist

- [ ] Audit initial schema migrations
- [ ] Embed product descriptions into `pro_products.embedding` via OpenAI
- [ ] Deploy and test `ai-orchestrator` Edge Function
- [ ] RLS policy audit with `supabase db lint`
- [ ] Export and distribute TypeScript types to Web and Mobile workspaces
