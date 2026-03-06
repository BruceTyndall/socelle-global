# Schema Mismatch Fix & Health Check System

**Date:** 2026-01-21
**Status:** ✅ COMPLETED

## Problem Summary

The application was failing with a runtime database error:
```
column spa_menus.total_services does not exist
```

This was breaking the Pipeline view and potentially other views that referenced this non-existent column.

---

## Root Cause Analysis

### The Issue

1. **SalesPipelineView.tsx:43** was querying for `spa_menus(id, total_services)`
2. **The spa_menus table** does not have a `total_services` column
3. **total_services is an aggregate metric**, not a column on individual spa menu rows

### Tables Affected

- `spa_menus` - Core table for spa menu uploads
- Query was attempting to select a non-existent column

---

## Solutions Implemented

### 1. Created spa_menu_summaries Database View

**File:** `supabase/migrations/create_spa_menu_summaries_view.sql`

**Purpose:** Aggregates service counts per spa menu upload

**Columns Provided:**
- `spa_menu_id` (uuid)
- `spa_name` (text)
- `spa_type` (enum)
- `spa_location` (text)
- `upload_date` (timestamptz)
- `total_services` (int) - COUNT of mapped services
- `total_gaps` (int) - COUNT of identified gaps
- `total_items` (int) - Combined total
- `facials_count` (int)
- `body_count` (int)
- `massage_count` (int)
- `enhancements_count` (int)
- `analysis_status` (text)
- `last_analyzed_at` (timestamptz)
- `created_at` (timestamptz)

**Usage:**
```sql
SELECT * FROM spa_menu_summaries WHERE spa_menu_id = 'uuid-here';
```

### 2. Fixed Pipeline Query

**File:** `src/components/SalesPipelineView.tsx:39-46`

**Before:**
```typescript
.select(`
  *,
  spa_menus(id, total_services),
  plan_outputs!spa_leads_current_plan_id_fkey(id, plan_status)
`)
```

**After:**
```typescript
.select(`
  *,
  spa_menus(id, spa_name, spa_type),
  plan_outputs!spa_leads_current_plan_id_fkey(id, plan_status)
`)
```

**Why:** Removed reference to non-existent `total_services` column. The UI doesn't actually display this field in the Pipeline view.

### 3. Schema Health Check System

**Files Created:**
- `src/lib/schemaHealth.ts` - Core health check logic
- `src/components/SchemaHealthView.tsx` - Admin UI

**Features:**
- Verifies required tables exist
- Checks for required columns in each table
- Shows PASS/WARN/FAIL status per table
- Provides copy-paste SQL migration suggestions
- Tracks critical vs. non-critical issues
- Admin-only view accessible via navigation

**Schema Requirements Checked:**
- `spa_menus` (CRITICAL)
- `spa_service_mapping` (CRITICAL)
- `service_gap_analysis` (CRITICAL)
- `canonical_protocols` (CRITICAL)
- `pro_products`
- `retail_products`
- `spa_leads` (CRITICAL)
- `phased_rollout_plans`
- `retail_attach_recommendations`
- `spa_menu_summaries` (VIEW)

**Navigation:** Added "Schema Health" tab in main navigation (shield icon, red badge)

### 4. Improved AI Concierge Retrieval

**File:** `src/lib/aiConciergeEngine.ts`

**Fixed Issues:**
- ✅ Corrected table names (`service_mappings` → `spa_service_mapping`)
- ✅ Corrected table names (`protocol_steps` → `canonical_protocol_steps`)
- ✅ Fixed context field reference (`spa_id` → checks for `spaId`)
- ✅ Improved retrieval logic with keyword expansion
- ✅ Enhanced "no data found" response with helpful suggestions
- ✅ Added retrieval logging for debugging

**New Behavior:**
- When no matching data is found, the Concierge now:
  - Checks which tables ARE populated
  - Suggests 2-3 follow-up prompts based on available data
  - Shows: "Here are some topics I can help with: Try asking about specific Naturopathica protocols; Ask about retail products for specific skin concerns"

- Logs retrieval attempts:
  ```
  canonical_protocols: 15 rows
  retail_products: 35 rows
  pro_products: 27 rows
  brand_differentiation_points: 6 rows
  ```

### 5. Removed Debug Overlays

**Files Cleaned:**
- `src/main.tsx` - Removed debug overlay system
- `src/App.tsx` - Removed debug markers
- `src/components/ErrorBoundary.tsx` - Removed debug logging

Production-ready code with clean console logging only.

---

## Verification Checklist

✅ **Pipeline page loads** without database errors
✅ **No red error panels** in any view
✅ **Build succeeds** without errors
✅ **Schema Health Check** shows status correctly
✅ **Concierge retrieval** works with improved fallbacks
✅ **Console errors** cleared (no more "total_services does not exist")

---

## Files Modified

### Database Migrations
- `supabase/migrations/create_spa_menu_summaries_view.sql` (NEW)

### Frontend Components
- `src/components/SalesPipelineView.tsx` (FIXED query)
- `src/components/SchemaHealthView.tsx` (NEW)
- `src/components/Navigation.tsx` (added Schema Health tab)
- `src/App.tsx` (added route, removed debug code)
- `src/components/ErrorBoundary.tsx` (cleaned)
- `src/main.tsx` (cleaned)

### Backend Logic
- `src/lib/schemaHealth.ts` (NEW)
- `src/lib/aiConciergeEngine.ts` (IMPROVED)

---

## Usage Instructions

### For Admins

**Accessing Schema Health Check:**
1. Navigate to the "Schema Health" tab (shield icon)
2. View overall status: PASS / WARN / FAIL
3. Review individual table checks
4. Copy suggested SQL fixes if needed
5. Click "Re-check" to verify after applying fixes

**Schema Health Dashboard Shows:**
- Overall status badge
- Pass/Warning/Failure counts
- Table-by-table breakdown
- Missing column details
- Suggested migration SQL

**Pipeline View:**
- Now loads without errors
- Displays all spa leads correctly
- Menu data accessible via proper schema

**AI Concierge:**
- Improved retrieval with better keyword matching
- Helpful suggestions when no data found
- Debug logging in console for troubleshooting

### For Developers

**Using spa_menu_summaries View:**
```typescript
const { data } = await supabase
  .from('spa_menu_summaries')
  .select('*')
  .eq('spa_menu_id', menuId);

// Returns: { total_services: 12, total_gaps: 3, facials_count: 5, ... }
```

**Running Schema Health Check Programmatically:**
```typescript
import { runSchemaHealthCheck, getHealthSummary } from './lib/schemaHealth';

const results = await runSchemaHealthCheck();
const summary = getHealthSummary(results);

if (summary.overallStatus === 'FAIL') {
  console.error(`${summary.criticalIssues} critical issues found`);
}
```

**Debugging Concierge Retrieval:**
```typescript
// Check console for:
// "Concierge Retrieval Log: ['canonical_protocols: 15 rows', ...]"
```

---

## Prevention Strategy

### Avoid Future Schema Drift

1. **Use Schema Health Check regularly** - Check before major releases
2. **Add new tables to schemaHealth.ts** - Update SCHEMA_REQUIREMENTS when creating tables
3. **Use TypeScript generated types** - Run `supabase gen types typescript` regularly
4. **Test queries against actual schema** - Don't assume columns exist
5. **Use database views for aggregations** - Like spa_menu_summaries instead of fake columns

### Best Practices

✅ **DO:** Create views for computed/aggregate fields
✅ **DO:** Add required columns to schema health checks
✅ **DO:** Test with empty databases to catch missing data scenarios
✅ **DO:** Log retrieval attempts for debugging

❌ **DON'T:** Add fake columns just to fix queries
❌ **DON'T:** Assume columns exist without checking
❌ **DON'T:** Hardcode database structure in multiple places
❌ **DON'T:** Ignore schema warnings

---

## Impact Assessment

### Before Fix
- ❌ Pipeline view: **BROKEN** (database error)
- ❌ Schema drift: **UNDETECTED**
- ❌ Concierge: **POOR** retrieval logic
- ❌ Debugging: **DIFFICULT** (no visibility)

### After Fix
- ✅ Pipeline view: **WORKING** (loads correctly)
- ✅ Schema drift: **MONITORED** (health check system)
- ✅ Concierge: **IMPROVED** (better fallbacks, logging)
- ✅ Debugging: **EASY** (health dashboard, retrieval logs)

---

## Next Steps (Optional Enhancements)

1. **Add automated schema health check** - Run on app startup (non-blocking banner if FAIL)
2. **Add spa_menu_summaries to TypeScript types** - Generate from Supabase schema
3. **Create unit tests** - For schema health check functions
4. **Add Concierge debug panel** - Show retrieval sources in admin mode
5. **Implement schema migration tracking** - Log when health check detects new issues

---

## Support & Maintenance

**Schema Health Check:**
- Update `SCHEMA_REQUIREMENTS` when adding new critical tables
- Add migration suggestions for common schema fixes

**Concierge Retrieval:**
- Update keyword expansions in `retrieveRelevantData()`
- Enhance `createNoDataResponse()` with more helpful suggestions

**Documentation:**
- Keep this document updated with new schema changes
- Document all custom views in migration files

---

## Conclusion

✅ **All critical issues resolved**
✅ **Pipeline loads without errors**
✅ **Schema monitoring system in place**
✅ **Concierge retrieval stabilized**
✅ **Production-ready code**

The application is now stable with proper schema health monitoring and improved AI Concierge reliability.
