# Work Order: WO_UX_AUDIT_01
## UX Journey Dead Ends & Shell Page Remediation

**Status:** OPEN
**Priority:** P1
**Focus Area:** User Experience & State Completion

### Background
During a UX audit and site map review of the SOCELLE platform, multiple UX dead ends and "shell" (placeholder) pages were identified. This Work Order covers the remediation of these issues to ensure a cohesive end-to-end user journey. 

### Part 1: Shell Pages
The following pages are currently marked as shells or are missing backend tables. They must either be hidden from production navigation, restricted via feature flags, or built out with proper empty states/coming soon placeholders:

**B2B Reseller Portal (Business):**
- `/portal/reseller` (Reseller Dashboard)
- `/portal/reseller/clients`
- `/portal/reseller/revenue`
- `/portal/reseller/white-label`

**Admin Hubs:**
- `/admin/social` (Social Hub)
- `/admin/editorial` (Editorial Hub)
- `/admin/affiliates` (Affiliates Hub)
- `/admin/events` (Events Hub)
- `/admin/recruitment` (Recruitment Hub)
- `/admin/reseller` (Reseller Hub)
- `/admin/shop/shipping` (Shop Shipping)

**Legacy Spa Portal (Deprecation required):**
- `/spa` and all localized `/spa/*` routes are shells and should be formally deprecated or redirected to `/portal`.

**Missing Infrastructure (Demo Pages):**
- `/events` — Missing `events` table (Task W10-05).
- `/jobs` — Missing `job_postings` table (Task W10-06).

### Part 2: UX Dead Ends & Confusing Logic
The site map review highlighted several confusing logic flows in the user journey:

1. **Request Access Post-Submission (`/request-access`)**
   - **Current State:** After submitting the early access form, the user flow terminates abruptly without explaining the next steps.
   - **Action Req:** Implement a clear "Success" state explaining the review process timeline and what emails to expect. Add a persistent "Return to Home" action.

2. **Business Portal Onboarding Drop-off (`/portal/signup` -> `/portal/plans/new`)**
   - **Current State:** A user signing up for the business portal must complete a plan wizard. If they drop off mid-wizard and log back in, there is no strict redirect catching them to finish onboarding.
   - **Action Req:** Implement an onboarding guard in `BusinessLayout` that forces incomplete profiles into a resume-onboarding workflow.

3. **Brand Portal Application Status (`/brand/apply/received`)**
   - **Current State:** The application received page is a dead end. If a brand administrator attempts to log in (`/brand/login`) before their application is approved, the error state is generic or allows them into a restricted state.
   - **Action Req:** Explicitly handle "pending_approval" status on the login screen with a custom "Your application is still under review" message.

### Execution Steps
1. Audit all routers (`App.tsx`, `MainNav.tsx`, `AdminLayout.tsx`) and hide linking to the shell pages unless the user is a `platform_admin`.
2. Add a `Coming Soon` empty state component to the identified shell pages.
3. Build the missing `events` and `job_postings` Supabase tables or remove the public links temporarily.
4. Implement the onboarding guard for the business portal.
5. Enhance the auth views for the brand portal "pending" state.

### Testing & Validation
- Ensure all public pages map perfectly to active backend tables.
- Verify that standard users cannot navigate to shell pages.
- Validate that the post-signup flow handles interruptions cleanly.
- Use `test_edge.js` or UI automation to verify the brand "pending" auth state.
