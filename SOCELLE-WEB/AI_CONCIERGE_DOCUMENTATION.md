# AI Brand & Product Concierge - Documentation

## Overview

The AI Brand & Product Concierge is a **governed, read-only, explainable assistant** that operates with strict guardrails to prevent hallucinations and unauthorized data access. It functions as a retrieval-based concierge that explains, clarifies, and contextualizes existing intelligence—it does NOT invent, recommend outside engines, or override business logic.

## Architecture

### Core Principles

1. **Read-Only**: The AI never modifies database records or business logic
2. **Retrieval-Based**: All responses are grounded in data from approved tables
3. **Explainable**: Every response includes sources, confidence levels, and scope boundaries
4. **Governed**: All interactions are logged for audit and compliance
5. **Context-Aware**: Responses adapt based on user role, spa context, and page location

### Intelligence Modes

The AI automatically selects one of five intelligence modes based on the question and context:

1. **Brand Expert** - Explains product benefits, protocols, and brand positioning
2. **Service Strategy Explainer** - Clarifies service offerings, gaps, and opportunities
3. **Budget & Affordability Guide** - Explains costs, opening orders, and budget constraints
4. **Implementation & Training Advisor** - Guides on training requirements and rollout
5. **Sales Enablement** - Supports sales conversations (admin-only)

### Approved Data Sources

The AI can ONLY access these whitelisted tables:

- `canonical_protocols` - Protocol definitions
- `protocol_steps` - Step-by-step instructions
- `protocol_contraindications` - Safety information
- `retail_products` - Retail product catalog
- `pro_products` - Professional product catalog
- `mixing_rules` - Product blending guidelines
- `marketing_calendar` - Seasonal campaigns
- `service_mappings` - Mapped services for spa menus
- `service_gap_analysis` - Gap analysis results
- `implementation_readiness` - Readiness scores
- `phased_rollout_plans` - Rollout strategies
- `opening_orders` - Opening order recommendations
- `brand_differentiation_points` - Brand positioning
- `retail_attach_recommendations` - Retail attachment strategies

**Each mode has restricted access to a subset of these tables.** This prevents cross-contamination of information and ensures appropriate scope.

## Guardrails & Safety Mechanisms

### 1. Table-Level Access Control

```typescript
const APPROVED_TABLES: Record<IntelligenceMode, string[]> = {
  brand_expert: [/* limited list */],
  service_strategy: [/* limited list */],
  // ... etc
};
```

The AI can ONLY query tables explicitly allowed for its current mode. Attempts to access other tables are blocked at the code level.

### 2. Response Structure Enforcement

Every response MUST include:

1. **Direct Answer** - Clear, factual response
2. **Contextual Explanation** - Why this applies to the user's situation
3. **Scope Boundary** - What data this is based on
4. **Follow-Up Question** (optional) - Suggested next question

This structure prevents vague or unhelpful responses.

### 3. Source Tracking

Every response records:
- `source_tables[]` - Which tables were queried
- `missing_data_flags[]` - What data was unavailable
- `confidence_level` - High, Medium, Low, or Unknown

This creates an audit trail and transparency.

### 4. Budget-Aware Constraints

When a spa has a budget profile:
- Retail SKU quantity is enforced as 3
- Pro SKU quantity is enforced as 1
- Budget cannot be exceeded
- AI explains tradeoffs explicitly

### 5. Role-Based Restrictions

- **Sales Enablement mode** is restricted to admin users only
- Spa-specific data is filtered by `spa_id` when available
- Sensitive business logic is never exposed to end users

### 6. No Data Invention

If relevant data doesn't exist, the AI responds:

```typescript
{
  directAnswer: "I don't have enough data to answer that question accurately.",
  missingDataFlags: ["No relevant data found"],
  confidenceLevel: "Unknown"
}
```

The AI NEVER fills gaps with generic knowledge or assumptions.

### 7. No External References

The AI cannot:
- Suggest external products or brands
- Reference competitors
- Recommend third-party services
- Provide medical or clinical advice
- Override deterministic engines (gap analysis, opening orders, etc.)

## Data Flow

```
User Question
    ↓
Mode Selection (based on question keywords + context)
    ↓
Table Access Check (approved tables for this mode?)
    ↓
Data Retrieval (query only approved tables)
    ↓
Response Generation (structured format enforced)
    ↓
Logging (full audit trail)
    ↓
User Response (with sources, confidence, scope)
```

## Logging & Governance

Every interaction is logged to `ai_concierge_chat_logs`:

```sql
{
  spa_id: uuid (nullable)
  user_role: text
  mode_used: text
  user_question: text
  ai_response: json
  source_tables: text[]
  missing_data_flags: text[]
  confidence_level: text
  context_page: text
  created_at: timestamptz
}
```

Administrators can:
- View all chat logs
- Filter by mode, confidence, spa, date
- Export logs to CSV
- Identify patterns in missing data
- Monitor AI performance and accuracy

## UI/UX Design

### Floating Assistant

The AI Concierge appears as a floating button in the bottom-right corner on key pages:
- Sales Pipeline
- Service Intelligence
- Implementation Planner
- Protocols
- Spa Menus
- Products

### Contextual Starter Questions

Each page shows 3-5 relevant starter questions stored in `ai_concierge_starter_questions`. This guides users toward productive queries.

### Response Display

Responses show:
- Main answer (bold)
- Explanation (regular text)
- Confidence badge (visual indicator)
- Data sources (expandable)
- Missing data warnings (if any)
- Scope boundary (italic)
- Suggested follow-up (clickable)

## Validation: No Hallucination Paths

### Path Analysis

1. **Mode Selection** - Deterministic based on keywords and context
2. **Table Access** - Hardcoded whitelist, no dynamic table selection
3. **Data Retrieval** - Direct SQL queries, no LLM interpretation
4. **Response Generation** - Template-based with data injection only
5. **Confidence Scoring** - Based on data availability, not guessing

### What the AI Cannot Do

❌ Create new protocols or products
❌ Estimate prices without data
❌ Suggest competitor products
❌ Generate medical advice
❌ Override business rules
❌ Invent statistics or facts
❌ Access unapproved tables
❌ Bypass role-based restrictions
❌ Modify database records
❌ Execute arbitrary code

### What the AI Can Do

✅ Explain existing protocols and steps
✅ Describe products from the catalog
✅ Clarify gap analysis results
✅ Guide through implementation plans
✅ Answer questions about brand positioning
✅ Explain budget constraints
✅ Reference marketing calendar events
✅ Suggest follow-up questions
✅ Admit when data is missing
✅ Provide data sources for transparency

## Example Interactions

### Example 1: Brand Expert Mode

**Q:** "What makes Naturopathica different?"

**Response:**
- **Direct Answer:** Naturopathica stands out through 8 key differentiators: holistic wellness approach; botanical ingredient focus; sustainability commitment.
- **Explanation:** These differentiation points position Naturopathica as a science-backed wellness brand emphasizing natural ingredients.
- **Sources:** brand_differentiation_points (8 records)
- **Confidence:** High
- **Scope:** Based on 8 brand differentiation points in database
- **Follow-Up:** "Would you like to know which protocols showcase these brand values?"

### Example 2: Budget Guide Mode

**Q:** "Why is my opening order so expensive?"

**Response:**
- **Direct Answer:** Your opening order includes 47 products with 156 total units, calculated at $12,450.
- **Explanation:** This is based on your service menu, expected treatment volume, and budget tier constraints.
- **Sources:** opening_orders, service_mappings
- **Confidence:** High
- **Scope:** Based on opening order recommendations generated by the system
- **Follow-Up:** "Would you like to see which products are prioritized?"

### Example 3: Missing Data Scenario

**Q:** "What's my staff training timeline?"

**Response:**
- **Direct Answer:** I don't have enough data to answer that question accurately.
- **Explanation:** Training timeline information requires implementation readiness data that hasn't been uploaded yet.
- **Sources:** (none)
- **Missing Data:** No implementation readiness assessment found
- **Confidence:** Unknown
- **Scope:** Operating in Training Advisor mode. No matching data found.
- **Follow-Up:** "Would you like me to explain the typical training process?"

## Technical Implementation

### Key Files

- `src/lib/aiConciergeEngine.ts` - Core AI logic with guardrails
- `src/components/AIConcierge.tsx` - Floating UI component
- `src/components/AIConciergeLogsView.tsx` - Admin audit interface
- `supabase/migrations/*_create_ai_concierge_schema.sql` - Database schema

### Database Schema

See migration file for complete schema. Key tables:
- `ai_concierge_chat_logs` - All interactions
- `ai_concierge_starter_questions` - Contextual prompts
- `ai_concierge_approved_tables` - Whitelist of data sources

### Security

- RLS enabled on all AI Concierge tables
- Users can only insert their own chat logs
- Only authenticated users can view logs
- Table whitelist enforced at code level
- No SQL injection possible (uses Supabase client)
- No arbitrary code execution
- Mode selection is deterministic, not AI-driven

## Future Enhancements (Potential)

While the current system is fully functional and safe, future versions could:

1. Add semantic search across protocol descriptions
2. Implement RAG with vector embeddings for better retrieval
3. Add natural language query understanding (still grounded in data)
4. Support multi-turn conversations with state management
5. Add personalization based on user interaction history
6. Generate visual charts/graphs from data
7. Support voice input/output

**All future enhancements must maintain the same strict guardrails and governance.**

## Conclusion

The AI Brand & Product Concierge is a **deterministic, retrieval-based assistant** with multiple layers of protection against hallucination. It operates exclusively on verified Naturopathica data, maintains full transparency through source tracking, and logs every interaction for governance.

**No hallucination paths exist** because:
1. Data sources are whitelisted and mode-restricted
2. Responses are template-based with data injection only
3. Missing data triggers explicit "I don't know" responses
4. All interactions are logged and auditable
5. No external knowledge or LLM-based generation is used

This system provides intelligent assistance while maintaining complete control and transparency.
