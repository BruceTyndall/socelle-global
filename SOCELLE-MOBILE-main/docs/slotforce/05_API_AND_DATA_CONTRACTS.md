# 05 — API & Data Contracts
> Forensic audit — verified in code — February 2026

All callable Cloud Functions use Firebase callable protocol (HTTPS + Firebase Auth JWT).
Schema validation via Zod (packages/shared/src/index.ts). All functions require auth unless noted.

---

## Callable Cloud Functions

### `healthcheck`
**Auth**: Not required (public)
**Request**: `{}`
**Response**: `{ status: "ok", timestamp: string }`
**Purpose**: Liveness probe for CI and monitoring.

---

### `trackAppOpen`
**Auth**: Required
**Request**:
```typescript
{
  source: "cold_start" | "resume" | "organic"
}
```
**Response**: `{ success: true }`
**Side effects**:
- Sets `users/{uid}.last_open_at = now()`
- Resets `users/{uid}.inactivity_tier = 0`
- Logs analytics event
**Notes**: Called from `AnalyticsService.trackAppOpenRemote()` — fire-and-forget. Current bug (BUG-005): mobile always passes `"organic"` for both cold_start and resume.

---

### `storeCalendarTokens` (also referred to as `storeGoogleServerAuthCode`)
**Auth**: Required
**Request**:
```typescript
{
  serverAuthCode: string    // Google OAuth server auth code from mobile
}
```
**Response**:
```typescript
{
  success: boolean,
  calendarConnected: boolean
}
```
**Side effects**:
- Calls Google token endpoint to exchange `serverAuthCode` for `{ access_token, refresh_token }`
- AES-256 encrypts `refresh_token` using `GOOGLE_TOKEN_ENCRYPTION_KEY_B64` secret
- Stores `{ encrypted_refresh_token, token_key_id }` in `users/{uid}.settings`
- Sets `users/{uid}.calendarConnected = true`, `calendar_source = "google"`
**Error cases**:
- `invalid-argument`: auth code already consumed / expired
- `internal`: Google API failure
**Idempotency**: Not idempotent — re-running with same code fails (codes are single-use).

---

### `syncCalendarEvents`
**Auth**: Required
**Request** (via `SyncCalendarEventsRequestSchema`):
```typescript
{
  calendarSource: "google" | "apple",
  windowStart: string,          // ISO date, must be a Monday
  windowEnd: string,            // ISO date, must be windowStart + 13 days
  deviceEvents?: {              // Only for calendarSource == "apple"
    id: string,
    title: string,
    start: string,              // ISO datetime
    end: string,                // ISO datetime
    isAllDay: boolean,
    calendarId: string
  }[],
  userSettings: {
    avgBookingValue: number,
    slotDurationMinutes: number,
    workingHours: Record<DayKey, {
      enabled: boolean,
      start: string,            // "HH:MM"
      end: string               // "HH:MM"
    }>
  },
  intentionalRules?: {
    dayOfWeek: DayKey,
    start: string,              // "HH:MM"
    end: string,                // "HH:MM"
    reason: string
  }[]
}
```
**Response** (via `SyncCalendarEventsResponseSchema`):
```typescript
{
  gaps: {
    id: string,
    date: string,               // ISO date
    dayOfWeek: DayKey,
    start: string,              // ISO datetime
    end: string,
    durationMinutes: number,
    bookableSlots: number,
    leakageValue: number,
    status: "open" | "filled" | "intentional",
    intentionalReason?: string,
    weekKey: string             // "YYYY-Www"
  }[],
  totals: {
    weeklyLeakage: number,
    openGapCount: number,
    bookableSlots: number,
    filledGapCount: number,
    intentionalGapCount: number
  }
}
```
**Side effects**:
- For Google: loads encrypted token, decrypts, refreshes access token, calls Google Calendar API
- For Apple: uses `deviceEvents` directly
- Calls `computeGaps()` from gap_engine package
- Calls `replaceGapsInRange()` in Firestore (batch write — deletes removed gaps, preserves status of existing)
- Merges persisted gap statuses back into response
- Calls `updateUserSyncStats()` to update `users/{uid}.stats`
- Deduplicates and persists `intentionalRules` passed in request
**Error cases**:
- `failed-precondition`: Google token not found or expired (surface as "reconnect" in UI)
- `unavailable`: Google Calendar API down
- `invalid-argument`: Window not aligned to Monday, deviceEvents malformed
**Idempotency**: Safe to retry — `replaceGapsInRange` is idempotent for same window.
**Performance**: Firestore batch writes, max 500 ops per batch. A 2-week window can produce ~100 gaps max — well within limits.

---

### `updateGapStatus`
**Auth**: Required
**Request** (via `UpdateGapStatusRequestSchema`):
```typescript
{
  gapId: string,                // Firestore doc ID: "{uid}_{startISO}_{endISO}"
  status: "filled" | "intentional" | "open",
  intentionalReason?: "lunch" | "buffer" | "personal" | "other"
}
```
**Response**:
```typescript
{
  success: boolean,
  recoveredRevenue?: number     // New cumulative total if status == "filled"
}
```
**Side effects**:
- Firestore transaction: read gap doc, validate `user_id == uid`, write new status
- If `status == "filled"`: increments `users/{uid}.stats.recovered_revenue_self_reported`
- If `intentionalReason` provided: creates/upserts `intentional_rules` document (30-min tolerance matching)
**Error cases**:
- `not-found`: Gap document doesn't exist (gapId mismatch)
- `permission-denied`: Gap `user_id` doesn't match auth uid
- `invalid-argument`: Invalid status or reason value
**Idempotency**: Idempotent for same status. Marking filled twice will double-count recovered revenue (BUG — no dedup check).

---

### `revokeCalendarTokens`
**Auth**: Required
**Request**: `{}`
**Response**: `{ success: boolean }`
**Side effects**:
- Calls Google OAuth revoke endpoint with stored access token
- Nulls `users/{uid}.settings.encrypted_refresh_token` and `token_key_id`
- Sets `users/{uid}.calendarConnected = false`, `calendar_source = null`

---

### `getCalendarConnectionStatus`
**Auth**: Required
**Request**: `{}`
**Response**:
```typescript
{
  connected: boolean,
  source: "google" | "apple" | null
}
```

---

### `storeFcmToken`
**Auth**: Required
**Request**:
```typescript
{
  token: string,
  platform: "ios" | "android"
}
```
**Response**: `{ success: boolean }`
**Side effects**: Upserts `fcm_tokens/{uid}` with token + platform + timestamp.

---

### `updateNotificationFrequency`
**Auth**: Required
**Request**:
```typescript
{
  frequency: "standard" | "focused" | "weekly_digest"
}
```
**Response**: `{ success: boolean }`
**Side effects**: Updates `notification_state/{uid}.notification_frequency`.

---

### `getWeeklySummary`
**Auth**: Required
**Request**:
```typescript
{
  weekKey?: string    // "YYYY-Www" — defaults to current week if omitted
}
```
**Response**:
```typescript
{
  recovered: number,
  leaked: number,
  openGaps: number,
  intentionalBlocks: number,
  nextWeekGapCount: number    // BUG-003: currently returns current week open gaps
}
```
**Implementation**: Live Firestore query — not cached. Queries `gaps` collection for the week window.

---

### `submitCancellation`
**Auth**: Required
**Request**:
```typescript
{
  reason: "not_using" | "no_results" | "too_expensive" | "switched_tool" | "other",
  competitor?: string    // Optional: name of competitor tool
}
```
**Response**: `{ success: boolean, routing: string }`
**Side effects**:
- Writes `reason` to `users/{uid}.cancellation_reason`
- Writes event to `events/{docId}` (append-only)
- Routes: `no_results` → creates doc in `support_queue/{docId}`
- Routes: `switched_tool` → logs `competitor` field internally

---

## Scheduled / Triggered Functions

### `scheduledGapNotificationChecker`
**Schedule**: Every 1 hour (UTC)
**Logic**:
1. Query all `fcm_tokens` documents
2. For each user: check last sync (skip if > 30 days old)
3. Load open gaps with `start_time` within next 72 hours
4. For each gap: call `shouldSendNotification()` from decision_engine
5. Send at most 1 FCM push per user per run
6. Update `notification_state/{uid}`

---

### `onCancelledSubscription`
**Trigger**: Firestore write on `users/{uid}` where `subscription_status == "cancelled"`
**Logic**:
1. Revoke Google calendar tokens
2. Batch-update all gaps for this user: anonymize (clear `source_calendar`, null personal fields)
3. Delete `fcm_tokens/{uid}`

---

### `computeRetentionMetrics`
**Schedule**: Daily (time configured in Firebase scheduler)
**Logic**: For each active user, computes 9 metric functions:
- `computeDaysSinceLastOpen`
- `computeCumulativeLeakage`
- `computeCumulativeRecovered`
- `computeLastRecoveryAmount`
- `computeWeeklyRecoveryRate`
- `computeFillProbabilityScore`
- `computeInactivityTier` (0=active, 1=cooling, 2=at-risk, 3=churning, 4=dormant)
- Plus re-engagement trigger evaluations
Writes result to `users/{uid}.retention_metrics`.

---

## Firestore Schema

### Collection: `users/{uid}`
```
{
  // Identity
  created_at: Timestamp,
  last_open_at: Timestamp | string,
  
  // Subscription
  subscription_status: "active" | "trialing" | "free" | "cancelled",
  subscription_expires_at: Timestamp | null,
  
  // Calendar
  calendarConnected: boolean,
  calendar_source: "google" | "apple" | null,
  
  // Settings (stored server-side shadow of SharedPrefs)
  settings: {
    encrypted_refresh_token: string | null,   // AES-256 ciphertext
    token_key_id: string | null,              // Key version identifier
    notification_frequency: "standard" | "focused" | "weekly_digest",
    avg_booking_value: number,
    slot_duration_minutes: number
  },
  
  // Stats (updated by updateUserSyncStats on every sync)
  stats: {
    current_week_leakage: number,
    rolling_30d_leakage: number,              // BUG-001: always == current_week_leakage
    recovered_revenue_self_reported: number,  // Updated by updateGapStatus transaction
    last_sync_at: Timestamp
  },
  
  // Retention (updated by computeRetentionMetrics scheduled function)
  inactivity_tier: 0 | 1 | 2 | 3 | 4,
  retention_metrics: { ... },
  
  // Cancellation
  cancellation_reason: string | null
}
```
**Security**: Owner read/write. Server functions use admin SDK (bypass rules).
**Indexes**: None required (single-document queries by uid).

---

### Collection: `gaps/{userId_startIso_endIso}`
Doc ID format: `{uid}_{startISO}_{endISO}` (e.g. `abc123_2026-02-24T09:00:00.000Z_2026-02-24T11:00:00.000Z`)

```
{
  user_id: string,                    // Matches auth uid
  date: Timestamp,                    // UTC midnight of gap date
  day_of_week: "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun",
  start_time: Timestamp,              // UTC datetime
  end_time: Timestamp,
  duration_minutes: number,
  bookable_slots: number,             // floor(duration / slotDuration)
  leakage_value: number,              // bookableSlots * avgBookingValue
  status: "open" | "filled" | "intentional",
  source_calendar: string | null,     // Calendar name/ID
  intentional_reason: "lunch"|"buffer"|"personal"|"other"|null,
  filled_at: Timestamp | null,
  fill_confidence: "self_reported" | null,
  filled_method: "manual_mark" | null,
  created_at: Timestamp,
  week_key: string                    // "YYYY-Www"
}
```
**Security**: Owner read/write with `request.auth.uid == resource.data.user_id` check.
**Indexes** (from firestore.indexes.json):
- `user_id ASC + start_time ASC` — for time-range sync queries
- `user_id ASC + status ASC + start_time ASC` — for filled gap queries
- `user_id ASC + week_key ASC + status ASC` — for weekly summary

---

### Collection: `intentional_rules/{docId}`
```
{
  user_id: string,
  day_of_week: DayKey,
  approx_start_minutes: number,       // Minutes from midnight (UTC-based — BUG-007)
  approx_end_minutes: number,
  reason: "lunch" | "buffer" | "personal" | "other",
  active: boolean,
  created_at: Timestamp,
  updated_at: Timestamp
}
```
**Match tolerance**: ±30 minutes when checking if a new rule matches an existing one.
**Security**: Owner CRUD.

---

### Collection: `notification_state/{uid}`
**Server-written only** (mobile cannot write directly — enforced by Firestore rules).
```
{
  last_notified_at: string,           // ISO
  consecutive_dismissed: number,
  daily_count: number,
  framing_index: number,              // 0-3, rotated through 4 frames
  notification_frequency: "standard" | "focused" | "weekly_digest",
  inactivity_tier: number
}
```

---

### Collection: `fcm_tokens/{uid}`
**Owner read/write.**
```
{
  token: string,
  platform: "ios" | "android",       // "web" not supported (BUG)
  updated_at: string                  // ISO
}
```

---

### Collection: `weekly_summaries/{uid}`
**Server-written only.**
```
{
  user_id: string,
  week_key: string,
  recovered: number,
  leaked: number,
  openGaps: number,
  intentionalBlocks: number,
  generated_at: Timestamp
}
```

---

### Collection: `support_queue/{docId}`
**Server-written only.** Created when cancellation reason is `no_results`.
```
{
  user_id: string,
  reason: string,
  created_at: Timestamp,
  status: "pending" | "contacted" | "resolved"
}
```

---

### Collection: `email_idempotency/{keyId}`
**Server-written only.** Prevents duplicate emails.
```
{
  sent_at: Timestamp,
  template: string,
  user_id: string
}
```

---

## Error Envelope Standard

Firebase callable functions return errors via `HttpsError`:

```typescript
throw new HttpsError(
  'error-code',    // Firebase error code
  'human message', // Message returned to client
  { details }      // Optional structured data
)
```

**Standard error codes used**:
| Code | Meaning | Client behaviour |
|------|---------|-----------------|
| `invalid-argument` | Schema validation failed | Show validation error |
| `unauthenticated` | No valid Firebase auth token | Re-authenticate |
| `permission-denied` | Resource belongs to different user | Log + show generic error |
| `not-found` | Gap or token not found | Refresh data |
| `failed-precondition` | Calendar not connected / token expired | Show "reconnect" CTA |
| `unavailable` | Google API or Firestore transient failure | Retry with backoff |
| `internal` | Unexpected server error | Log + show generic error |

**Client error handling** (SlotforceApi.dart):
```dart
try {
  final result = await callable.call(data);
  return result.data;
} on FirebaseFunctionsException catch (e) {
  // e.code maps to the HttpsError code above
  // e.message is the human message
  // e.details is the optional structured data
  throw SyncError(code: e.code, message: e.message);
}
```

---

## Idempotency Notes

| Operation | Idempotent? | Notes |
|-----------|-------------|-------|
| `syncCalendarEvents` | Yes | `replaceGapsInRange` is idempotent for same window |
| `updateGapStatus` (filled) | No | Double-fill will double-count recovered revenue |
| `storeCalendarTokens` | No | Auth code is single-use |
| `storeFcmToken` | Yes | Upsert by uid |
| `updateNotificationFrequency` | Yes | Overwrites field |
| `revokeCalendarTokens` | Yes | Nulling null fields is safe |
| `submitCancellation` | No | Each call creates a new event document |

---

## Rate Limiting

No explicit rate limiting implemented beyond Firebase's default callable function rate limits.

**Recommendations**:
- Add per-user sync rate limiting: max 1 sync per 5 minutes (currently enforced client-side only via 60-min threshold — can be bypassed)
- `getWeeklySummary`: add server-side caching (currently does a live Firestore query every call)
- Push notification scheduler: already limited to 1 per user per hour via `daily_count` and `last_notified_at` checks

---

## Token Refresh Flow (Google Calendar)

```
1. Mobile: GoogleOAuthService.getServerAuthCode()
   → google_sign_in returns serverAuthCode (one-time use)

2. Mobile → CF: storeCalendarTokens({ serverAuthCode })

3. CF: POST https://oauth2.googleapis.com/token
   Body: {
     code: serverAuthCode,
     client_id: GOOGLE_CLIENT_ID,
     client_secret: GOOGLE_CLIENT_SECRET,
     redirect_uri: "",          ← empty string (server-side exchange)
     grant_type: "authorization_code"
   }
   Response: { access_token, refresh_token, expires_in }

4. CF: AES-256 encrypt(refresh_token, GOOGLE_TOKEN_ENCRYPTION_KEY_B64)
   → Store ciphertext in users/{uid}.settings.encrypted_refresh_token

5. Subsequent sync:
   CF: decrypt(ciphertext) → refresh_token
   CF: POST https://oauth2.googleapis.com/token
   Body: { refresh_token, grant_type: "refresh_token", ... }
   Response: { access_token }
   → Use access_token to call Google Calendar API

6. On invalid_grant error:
   CF: auto-revokes token in Firestore
   CF: throws failed-precondition to client
   Client: shows "Reconnect Google Calendar" CTA
```

---

## Offline Patterns

**Current state**: No offline support. All data fetched from Firestore on demand.

If `syncCalendarEvents` fails:
- Client receives `FirebaseFunctionsException`
- `SyncResultNotifier` emits `AsyncError` state
- Dashboard renders error widget with retry button
- No cached gaps shown (BUG-006 context — improve to show stale data)

**Recommended pattern (not yet implemented)**:
- Cache last `SyncResult` in SharedPreferences as JSON
- On launch: render cached data immediately, then refresh
- Show "last synced X minutes ago" indicator
- Distinguish "stale data" state from "sync error" state

---

## Zod Schema Location

**File**: `packages/shared/src/index.ts`

Key schemas:
- `SyncCalendarEventsRequestSchema` — validates syncCalendarEvents input
- `SyncCalendarEventsResponseSchema` — validates CF output
- `UpdateGapStatusRequestSchema` — validates updateGapStatus input
- `GapItemSchema` — gap object structure
- `UserSettingsSchema` — user settings structure

These schemas are shared between the Flutter app (via generated types) and the Cloud Functions (validated at CF entry point).

