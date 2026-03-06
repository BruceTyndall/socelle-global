# Socelle Apply & Signup Pages Audit

## 1. Brand Application (`src/pages/brand/Apply.tsx`)

### Copy Quality
- **Strengths:** Clear headline ("Apply to join Socelle") and subhead setting review expectations (2 business days).
- **Labels:** Field labels are precise ("Estimated SKU Count", "Product Category").
- **CTA:** "Submit Application" is action-oriented.

### Form Friction
- **Structure:** Split into two logical steps (Brand Info → Account Creation) reduces cognitive load.
- **Fields:** Captures essential qualification data (SKU count, category, website) without over-asking.
- **Validation:** Visual indication of step completion.

### Trust Signals
- **Requirements Box:** Clearly states criteria (Active entity, 5+ SKUs, insurance), filtering unqualified leads early.
- **Terms:** Explicit agreement checkboxes for TOS/Privacy.

### Error Handling
- **Feedback:** Uses inline red error messages and a general error summary box.
- **Loading:** Submit button shows "Submitting..." state with spinner.

### Post-Conversion
- **Flow:** Redirects to a dedicated success page (`/brand/apply/received`).

### Brand Consistency
- **Visuals:** Correctly uses the `pro-navy`, `pro-gold`, and `pro-ivory` palette. Serif headings match marketing site.

### Missing / Opportunities
- **Social Proof:** No testimonials or "Trusted by" logos visible while filling out the form.
- **Password Visibility:** No "Show password" toggle.

---

## 2. Brand Application Received (`src/pages/brand/ApplicationReceived.tsx`)

### Copy Quality
- **Clarity:** "Application received" confirms success immediately.
- **Timeline:** "What happens next" section breaks down the 1-2 day process clearly.

### Trust Signals
- **Visuals:** Large green checkmark provides immediate positive feedback.
- **Expectations:** "Review typically takes 1–2 business days" banner manages user anxiety.

### Post-Conversion Actions
- **CTAs:** Links to "Sign in" (premature but useful) and "Back to Home".

---

## 3. Reseller Application (`src/pages/business/Apply.tsx`)

### Copy Quality
- **Context:** "Retailer Verification" eyebrow explains *why* the form exists (gatekeeping for professionals).
- **Process:** "What happens next" list sidebar is excellent for setting expectations before starting.

### Form Friction
- **Length:** Single-page form is slightly long but fields are standard for verification (License #, Address).
- **Layout:** Grouped fields (City/State, Phone/Website) help visual scanning.

### Trust Signals
- **Explanation:** "We verify... to confirm professional status" builds trust in the platform's exclusivity.

### Error Handling
- **Generic:** "Something went wrong" is the default fallback; could be more specific (e.g., "License number invalid").

### Post-Conversion
- **State:** Replaces form content with inline success message. Functional, though a dedicated page (like Brand) might be more tracking-friendly.

### Missing / Opportunities
- **Value Prop:** A reminder of *what* they are unlocking (e.g., "Unlock wholesale pricing for 50+ brands") could reduce drop-off.
- **Input Masking:** Phone number field does not appear to auto-format.

---

## 4. Login Pages (`/portal/login` & `/brand/login`)

### Copy & visual
- **Differentiation:** Brand login uses "Brand Portal" and a distinct icon/gradient, helping prevent user confusion between the two portals.
- **Reseller Login:** "Welcome Back" is friendly but generic.

### Functionality
- **Redirects:** Smart redirection logic handles `returnTo` params and role-based routing (Admin vs Brand vs Reseller).
- **Feedback:** Loading states on buttons.

### Missing / Opportunities
- **Unified Login:** Currently separate routes. A single `/login` that routes based on email/role is often better UX, though separate portals are fine for distinct user types.
- **SSO:** No Google/Social login options (likely intentional for B2B).

---

## Prioritized Recommendations

1.  **Add Social Proof to Forms:** Introduce a sidebar or "split screen" layout for the application pages featuring a testimonial or logo strip to reinforce trust while the user is typing.
2.  **Enhance Input UX:** Add "Show Password" toggles to all password fields and input masking for phone numbers.
3.  **Value Reminders:** On the Reseller Apply page, add a visual summary of the benefits being applied for (e.g., "Access to: Naturopathica, Eminence, etc.") to motivate completion.
4.  **Specific Error Messages:** Ensure backend errors (like "Email already in use") are bubbled up clearly to the user instead of generic fallbacks.
