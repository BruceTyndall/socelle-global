# Affiliate attribution — where it lives and click→purchase path

**Purpose:** Single reference for COMMERCE-POWER-01 and PAY-WO-04: where the affiliate-link-wrapper lives, and the planned end-to-end click→purchase linkage.  
**Authority:** Execution truth for affiliate attribution remains `build_tracker.md` + `docs/qa/verify_*.json`; this doc is the spec for the missing piece.

---

## 0. Global + CMS-managed (COMMERCE-POWER-01)

Affiliate links are **not Commerce-only**. They can be published anywhere in the app (Intelligence, Education, Marketing, Sales, CRM notes, CMS pages) via CMS.

- **CMS-driven:** Representable as CMS block type `affiliate_link` (see CMS_CONTENT_MODEL.md). Blocks can reference a record in `affiliate_links` (`affiliate_link_id`) or use inline `target_url` / `product_id` / `label`.
- **Two levels of management:**
  - **Admin:** Create/manage **global** affiliate link records (`brand_id` NULL). Visible across the platform. Admin Hub → Affiliates.
  - **Brand:** Create/manage **brand-scoped** records (`brand_id` = that brand). Brand users (portal) manage at Portal → Affiliates → Links; RLS restricts to their `brand_id`.
- **Auditable:** Every outbound affiliate click must go through `affiliate-link-wrapper`; the function writes one row to `public.affiliate_clicks` then redirects. No client-only attribution as "done."
- **Table:** `public.affiliate_links` (id, brand_id, target_url, product_id, label, affiliate_code, distributor_id, created_by, created_at, updated_at). RLS: admin all; brand users only their brand_id; public SELECT for global links only.

---

## 1. Where `affiliate-link-wrapper` is supposed to live

| Item | Location |
|------|----------|
| **Edge function** | `SOCELLE-WEB/supabase/functions/affiliate-link-wrapper/index.ts` |
| **Invocation URL** | `https://<project>.supabase.co/functions/v1/affiliate-link-wrapper` |
| **Table (click log)** | `public.affiliate_clicks` (id, user_id, product_id, distributor_id, affiliate_code, target_url, ip_address, user_agent, created_at) — see `src/lib/database.types.ts` |
| **UI / params** | `src/components/commerce/AffiliateBadge.tsx` — `buildAffiliateUrl(originalUrl, productId, userId)` appends `ref=socelle&pid=…&uid=…` to URLs |

**Gap (as of COMMERCE-POWER-01 verify):** The edge function was documented as “CREATED” in verify_PAY-WO-04 but is **not present** under `supabase/functions/`. The edge function is now implemented at `supabase/functions/affiliate-link-wrapper/index.ts` (GET + POST, log then redirect or return `redirect_url`). Frontend can point "Buy" links at it for audit-grade click logging.

---

## 2. Planned end-to-end click → purchase path

1. **Surfaces:** Any commerce entry point that shows products from the `products` table (Shop, ProductDetail, IntelligenceCommerce, ShopProduct) shows the FTC “Commission-linked” badge when `product.is_affiliated` or `product.affiliate_url` is set (DB-driven).
2. **Click:** User clicks an affiliate CTA. Two supported patterns:
   - **A. Wrapped redirect (audit-grade):** The link points at the edge function (GET or POST). Function logs the click to `affiliate_clicks`, then redirects (or returns) the final merchant URL with `ref` / `pid` / `uid` (or partner params) so the merchant can attribute the sale.
   - **B. Client-only (current fallback):** Frontend uses `buildAffiliateUrl(product.affiliate_url, product.id, userId)` and navigates to that URL. No server-side click log; attribution is best-effort via query params only.
3. **Log (when wrapper is used):** `affiliate-link-wrapper` inserts one row into `affiliate_clicks`: `target_url`, `product_id`, `affiliate_code` (e.g. `socelle`), optional `user_id` (from JWT), optional `distributor_id`, `ip_address`, `user_agent`, `created_at`.
4. **Redirect URL:** Same as `target_url` (product’s `affiliate_url` or merchant PDP) with query params appended: `ref=socelle`, `pid=<product_id>`, and optionally `uid=<user_id>` so the merchant/network can attribute the purchase.
5. **Purchase attribution:** Merchant or affiliate network uses `ref`/`pid`/`uid` on the landing or conversion URL to attribute the sale. SOCELLE does not host the purchase; conversion reporting is external. The audit trail is the `affiliate_clicks` row (who clicked, when, which product, which target URL).

**Summary:** For full audit-grade attribution, every affiliate click should go through `affiliate-link-wrapper` (log then redirect). Today, only the client-side `buildAffiliateUrl` and the `affiliate_clicks` schema exist; the edge function must be (re-)implemented at `supabase/functions/affiliate-link-wrapper/index.ts` and linked from the frontend (e.g. “Buy” links point at the function with `target_url` + `product_id` + `affiliate_code`).

---

## 3. Contract for `affiliate-link-wrapper` (implementation spec)

- **Methods:** GET (redirect flow, e.g. `/go?target_url=…&product_id=…`) and POST (body: `{ target_url, product_id?, affiliate_code?, distributor_id? }`).
- **Auth:** Optional. If `Authorization: Bearer <JWT>` is present, set `user_id` in `affiliate_clicks`; otherwise `user_id` is null (anonymous click).
- **Behavior:**  
  - Enforce edge-function kill switch (`enforceEdgeFunctionEnabled('affiliate-link-wrapper', req)`).  
  - Parse `target_url`, `product_id`, `affiliate_code` (default `socelle`), optional `distributor_id`.  
  - Insert into `affiliate_clicks` (service_role) with `ip_address` and `user_agent` from the request.  
  - Build redirect URL: `target_url` with appended `ref`, `pid`, and optionally `uid`.  
  - **GET:** return HTTP 302 to that URL. **POST:** return 200 with `{ redirect_url }` so the client can set `window.location`.
- **CORS:** Allow browser calls (OPTIONS + appropriate headers).

---

## 4. Enforcement — all outbound affiliate clicks through wrapper

- **Client helper:** `src/lib/affiliates/affiliateWrapper.ts` — `getAffiliateWrapperRedirectUrl(targetUrl, productId, options?)` returns the edge function GET URL. Use as `href` for any affiliate outbound link.
- **Component:** `src/components/commerce/AffiliateLink.tsx` — `<AffiliateLink targetUrl={...} productId={...}>` renders an `<a href={wrapperUrl}>` so the click is logged then redirected. Use for every "View at retailer" / "Buy at partner" CTA.
- **Surfaces using wrapper (audit-grade):** ProductDetail, ShopProduct, Shop (grid), IntelligenceCommerce (signal-matched products) — each shows "View at retailer" when `product.affiliate_url` is set, via AffiliateLink.
- **Not acceptable:** Using `buildAffiliateUrl()` alone for outbound links (no server-side log). It remains available only as an interim fallback when the wrapper URL is unavailable.

This doc and the implementation together close the “affiliate-link-wrapper missing” gap noted in the COMMERCE-POWER-01 verify artifact.
