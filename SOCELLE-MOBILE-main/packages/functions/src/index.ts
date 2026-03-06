import {
  HttpsError,
  type CallableRequest,
  type CallableOptions,
  onCall
} from "firebase-functions/v2/https";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./lib/firebase.js";
import {
  RevokeCalendarTokensRequestSchema,
  RevokeCalendarTokensResponseSchema,
  StoreCalendarTokensRequestSchema,
  StoreCalendarTokensResponseSchema,
  SyncCalendarEventsRequestSchema,
  SyncCalendarEventsResponseSchema,
  UpdateGapStatusRequestSchema,
  UpdateGapStatusResponseSchema
} from "../../shared/src/index.js";
import { z } from "zod";
import { getAdapter, type CalendarSyncAdapter } from "./sync/adapters.js";
import { runCalendarSync } from "./sync/orchestrator.js";
import { encryptRefreshToken } from "./google/tokenCrypto.js";
import { FirestoreTokenStore, type TokenStore } from "./google/tokenStore.js";
import { GoogleCalendarApi, GoogleInvalidGrantError } from "./google/googleApi.js";
import {
  FirestoreSyncPersistence,
  type SyncPersistence
} from "./sync/persistence.js";
import { writeCalendarDataDeletedEvent } from "./events.js";

// ─────────────────────────────────────────────────────────────
// Scheduled & triggered Cloud Function re-exports
// ─────────────────────────────────────────────────────────────
export { computeRetentionMetrics } from "./retentionMetrics.js";
export { submitCancellation } from "./cancelRouting.js";
export { onInactivityTierUpdated } from "./reengagementNotifications.js";
export { resurrectionEngine } from "./resurrectionEmails.js";
export { tier4RenewalAwarenessJob, tier4AccountHealthJob } from "./scheduledEmails.js";
export { weeklyMondayPush } from "./weeklyNotifications.js";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
] as const;

export const healthcheck = onCall(() => {
  logger.info("SLOTFORCE healthcheck invoked");
  return { ok: true, service: "slotforce-functions" };
});

// ─────────────────────────────────────────────────────────────
// trackAppOpen callable
// Called by Flutter on every AppLifecycleState.resumed.
// Resets inactivity_tier, updates last_open_at, syncs push status.
// ─────────────────────────────────────────────────────────────

export const trackAppOpen = onCall(
  { region: "us-central1", invoker: "public" },
  async (request: CallableRequest<unknown>) => {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError("unauthenticated", "trackAppOpen requires auth");
    }

    const data = (request.data ?? {}) as Record<string, unknown>;
    const notificationsEnabled = data.notificationsEnabled !== false;

    const db = getDb();
    try {
      await db.doc(`users/${userId}`).set(
        {
          last_open_at: new Date().toISOString(),
          inactivity_tier: 0,
          notifications_enabled: notificationsEnabled,
        },
        { merge: true }
      );

      // Reset consecutive dismissed count on voluntary open
      await db.doc(`notification_state/${userId}`).set(
        { consecutive_dismissed: 0 },
        { merge: true }
      );
    } catch (err) {
      logger.error("trackAppOpen: failed to update user", { userId, err });
    }

    logger.info("trackAppOpen", { userId, notificationsEnabled });
    return { ok: true };
  }
);

const callableOptions: CallableOptions = {
  region: "us-central1",
  invoker: "public",
  secrets: [
    "GOOGLE_TOKEN_ENCRYPTION_KEY_B64",
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET"
  ]
};

function buildGapDocId(userId: string, startIso: string, endIso: string): string {
  const start = startIso.replace(/[:.]/g, "");
  const end = endIso.replace(/[:.]/g, "");
  return `${userId}_${start}_${end}`;
}

function toGapRuleTiming(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new HttpsError("invalid-argument", "Invalid gap range for intentional rule");
  }
  return {
    dayOfWeek: DAY_KEYS[start.getUTCDay()],
    approxStartMinutes: start.getUTCHours() * 60 + start.getUTCMinutes(),
    approxEndMinutes: end.getUTCHours() * 60 + end.getUTCMinutes()
  };
}

function parseOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
  name: string
): z.infer<TSchema> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", `${name} request validation failed`, {
      issues: parsed.error.issues
    });
  }
  return parsed.data;
}

export function handleStoreCalendarTokens(data: unknown) {
  const request = parseOrThrow(
    StoreCalendarTokensRequestSchema,
    data,
    "storeCalendarTokens"
  );
  logger.info("storeCalendarTokens called", {
    calendarSource: request.calendarSource
  });
  return StoreCalendarTokensResponseSchema.parse({ ok: true });
}

export function handleSyncCalendarEvents(data: unknown) {
  parseOrThrow(SyncCalendarEventsRequestSchema, data, "syncCalendarEvents");
  logger.info("syncCalendarEvents called");
  return SyncCalendarEventsResponseSchema.parse({
    ok: true,
    events: [],
    gaps: [],
    totals: { gapCount: 0, totalBookableSlots: 0, weeklyLeakage: 0 }
  });
}

export function handleRevokeCalendarTokens(data: unknown) {
  const request = parseOrThrow(
    RevokeCalendarTokensRequestSchema,
    data,
    "revokeCalendarTokens"
  );
  logger.info("revokeCalendarTokens called", {
    calendarSource: request.calendarSource
  });
  return RevokeCalendarTokensResponseSchema.parse({ ok: true });
}

export const storeCalendarTokens = onCall(callableOptions, (request: CallableRequest<unknown>) =>
  handleStoreCalendarTokensCallable(request)
);

export const syncCalendarEvents = onCall(callableOptions, (request: CallableRequest<unknown>) =>
  handleSyncCalendarEventsCallable(request)
);

export const updateGapStatus = onCall(callableOptions, (request: CallableRequest<unknown>) =>
  handleUpdateGapStatusCallable(request)
);

export const revokeCalendarTokens = onCall(callableOptions, (request: CallableRequest<unknown>) =>
  handleRevokeCalendarTokensCallable(request)
);

export const getCalendarConnectionStatus = onCall(
  callableOptions,
  (request: CallableRequest<unknown>) => handleGetCalendarConnectionStatusCallable(request)
);

export async function handleStoreCalendarTokensCallable(
  request: CallableRequest<unknown>,
  tokenStore: TokenStore = new FirestoreTokenStore()
) {
  const parsed = parseOrThrow(
    StoreCalendarTokensRequestSchema,
    request.data,
    "storeCalendarTokens"
  );

  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "storeCalendarTokens requires auth");
  }

  try {
    if (parsed.calendarSource === "google") {
      const rawServerAuthCode = parsed.tokenPayload.serverAuthCode;
      const rawRefreshToken = parsed.tokenPayload.refreshToken;

      let refreshToken: string;

      if (typeof rawServerAuthCode === "string" && rawServerAuthCode) {
        // Mobile OAuth flow: exchange the one-time server auth code for a refresh token.
        const googleApi = new GoogleCalendarApi();
        refreshToken = await googleApi.exchangeAuthCode(rawServerAuthCode);
      } else if (typeof rawRefreshToken === "string" && rawRefreshToken) {
        // Legacy / dev flow: direct refresh token provided.
        refreshToken = rawRefreshToken;
      } else {
        throw new HttpsError(
          "invalid-argument",
          "tokenPayload must contain either serverAuthCode (mobile OAuth) or refreshToken (dev) for Google"
        );
      }

      const ciphertext = encryptRefreshToken(refreshToken);
      const keyId = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY_ID ?? null;
      await tokenStore.saveGoogleRefreshToken(
        userId,
        ciphertext,
        keyId,
        new Date().toISOString()
      );
    }
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    if (error instanceof Error && error.message.includes("GOOGLE_TOKEN_ENCRYPTION_KEY_B64")) {
      throw new HttpsError(
        "failed-precondition",
        "Server token encryption is not configured yet."
      );
    }
    throw new HttpsError(
      "internal",
      error instanceof Error ? error.message : "Unable to store calendar tokens"
    );
  }

  logger.info("storeCalendarTokens completed", {
    userId,
    source: parsed.calendarSource
  });

  return StoreCalendarTokensResponseSchema.parse({ ok: true });
}

export async function handleRevokeCalendarTokensCallable(
  request: CallableRequest<unknown>,
  tokenStore: TokenStore = new FirestoreTokenStore()
) {
  const parsed = parseOrThrow(
    RevokeCalendarTokensRequestSchema,
    request.data,
    "revokeCalendarTokens"
  );

  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "revokeCalendarTokens requires auth");
  }

  if (parsed.calendarSource === "google") {
    await tokenStore.revokeGoogleToken(userId, new Date().toISOString());
  }

  logger.info("revokeCalendarTokens completed", {
    userId,
    source: parsed.calendarSource
  });

  return RevokeCalendarTokensResponseSchema.parse({ ok: true });
}

export async function handleGetCalendarConnectionStatusCallable(
  request: CallableRequest<unknown>,
  tokenStore: TokenStore = new FirestoreTokenStore()
) {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError(
      "unauthenticated",
      "getCalendarConnectionStatus requires auth"
    );
  }

  const googleToken = await tokenStore.loadGoogleRefreshToken(userId);
  return {
    ok: true as const,
    googleConnected: Boolean(googleToken)
  };
}

export async function handleSyncCalendarEventsCallable(
  request: CallableRequest<unknown>,
  adapterOverride?: CalendarSyncAdapter,
  persistence: SyncPersistence = new FirestoreSyncPersistence()
) {
  const parsed = parseOrThrow(
    SyncCalendarEventsRequestSchema,
    request.data,
    "syncCalendarEvents"
  );

  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "syncCalendarEvents requires auth");
  }

  try {
    let persistedIntentionalRules: Awaited<
      ReturnType<SyncPersistence["listIntentionalRules"]>
    > = [];
    try {
      persistedIntentionalRules = await persistence.listIntentionalRules({ userId });
    } catch (error) {
      logger.warn("syncCalendarEvents intentional rules load failed", {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    const mergedIntentionalRulesRaw = [
      ...(parsed.intentionalRules ?? []),
      ...persistedIntentionalRules.map((rule) => ({
        dayOfWeek: rule.dayOfWeek as
          | "monday"
          | "tuesday"
          | "wednesday"
          | "thursday"
          | "friday"
          | "saturday"
          | "sunday",
        approxStartMinutes: rule.approxStartMinutes,
        approxEndMinutes: rule.approxEndMinutes,
        reason: rule.reason
      }))
    ];
    const mergedIntentionalRules = Array.from(
      new Map(
        mergedIntentionalRulesRaw.map((rule) => [
          `${rule.dayOfWeek}|${rule.approxStartMinutes}|${rule.approxEndMinutes}`,
          rule
        ])
      ).values()
    );

    const adapter = adapterOverride ?? getAdapter(parsed.calendarSource);

    // For Apple Calendar: convert device-supplied event ISO strings to CalendarEvent objects.
    const deviceEvents =
      parsed.calendarSource === "apple" && parsed.deviceEvents
        ? parsed.deviceEvents.map((e) => ({
            start: new Date(e.startIso),
            end: new Date(e.endIso),
            ...(e.allDay !== undefined ? { allDay: e.allDay } : {})
          }))
        : undefined;

    const result = await runCalendarSync(
      {
        userId,
        startIso: parsed.startIso,
        endIso: parsed.endIso,
        slotDurationMinutes: parsed.slotDurationMinutes,
        avgBookingValue: parsed.avgBookingValue,
        workingHours: parsed.workingHours,
        intentionalRules: mergedIntentionalRules,
        deviceEvents,
        timezone: parsed.timezone
      },
      { adapter }
    );

    const persistedGaps = await persistence.replaceGapsInRange({
      userId,
      startIso: parsed.startIso,
      endIso: parsed.endIso,
      gaps: result.gaps.map((gap) => ({
        userId,
        startIso: gap.startIso,
        endIso: gap.endIso,
        durationMinutes: gap.durationMinutes,
        bookableSlots: gap.bookableSlots,
        leakageValue: gap.leakageValue,
        dayOfWeek: gap.dayOfWeek,
        intentional: gap.intentional,
        intentionalReason: gap.intentionalReason ?? null
      }))
    });

    const persistedByRange = new Map(
      persistedGaps.map((gap) => [`${gap.startIso}|${gap.endIso}`, gap])
    );

    const mergedGaps = result.gaps.map((gap) => {
      const persisted = persistedByRange.get(`${gap.startIso}|${gap.endIso}`);
      const status = persisted?.status ?? (gap.intentional ? "intentional" : "open");
      return {
        ...gap,
        gapId: persisted?.gapId ?? buildGapDocId(userId, gap.startIso, gap.endIso),
        status,
        intentionalReason:
          status === "intentional"
            ? persisted?.intentionalReason ?? gap.intentionalReason ?? null
            : null
      };
    });

    const weekStartMs = new Date(parsed.startIso).getTime();
    const weekEndMs = weekStartMs + (7 * 24 * 60 * 60 * 1000);
    const currentWeekOpenGaps = mergedGaps.filter((gap) => {
      const gapStartMs = new Date(gap.startIso).getTime();
      return gapStartMs >= weekStartMs && gapStartMs < weekEndMs && gap.status === "open";
    });

    const response = SyncCalendarEventsResponseSchema.parse({
      ...result,
      gaps: mergedGaps,
      totals: {
        gapCount: currentWeekOpenGaps.length,
        totalBookableSlots: currentWeekOpenGaps.reduce(
          (sum, gap) => sum + gap.bookableSlots,
          0
        ),
        weeklyLeakage: currentWeekOpenGaps.reduce(
          (sum, gap) => sum + gap.leakageValue,
          0
        )
      }
    });

    // BUG-001 fix: Compute rolling 30-day leakage.
    // mergedGaps covers the sync window (≤2 weeks). We also need open gaps from
    // before the sync window that still fall within the 30-day lookback window.
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const syncWindowStart = new Date(parsed.startIso);

    // Open gaps in the current sync window within the 30-day window
    const rolling30dFromSyncWindow = mergedGaps
      .filter((gap) => gap.status === "open" && new Date(gap.startIso) >= thirtyDaysAgo)
      .reduce((sum, gap) => sum + gap.leakageValue, 0);

    // Open gaps before the sync window but within the 30-day window
    let rolling30dFromHistory = 0;
    if (thirtyDaysAgo < syncWindowStart) {
      try {
        const db = getDb();
        const historicalSnap = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("start_time", ">=", thirtyDaysAgo)
          .where("start_time", "<", syncWindowStart)
          .where("status", "==", "open")
          .get();
        for (const doc of historicalSnap.docs) {
          rolling30dFromHistory += (doc.data().leakage_value as number) ?? 0;
        }
      } catch (histErr) {
        logger.warn("syncCalendarEvents: rolling30d historical query failed, using sync window only", {
          userId,
          histErr: histErr instanceof Error ? histErr.message : String(histErr)
        });
      }
    }

    const rolling30dLeakage = rolling30dFromSyncWindow + rolling30dFromHistory;

    await persistence.updateUserSyncStats({
      userId,
      weeklyLeakage: response.totals.weeklyLeakage,
      rolling30dLeakage,
      lastSyncIso: new Date().toISOString()
    });

    logger.info("syncCalendarEvents completed", {
      userId,
      source: parsed.calendarSource,
      gapCount: response.totals.gapCount,
      weeklyLeakage: response.totals.weeklyLeakage
    });

    return response;
  } catch (error) {
    logger.error("syncCalendarEvents failed", {
      userId,
      source: parsed.calendarSource,
      error: error instanceof Error ? error.message : String(error)
    });

    if (error instanceof HttpsError) {
      throw error;
    }
    if (error instanceof GoogleInvalidGrantError) {
      throw new HttpsError(
        "failed-precondition",
        "Google calendar access expired. Please reconnect your Google calendar."
      );
    }
    if (error instanceof Error) {
      if (error.message.includes("Google refresh token not found")) {
        throw new HttpsError(
          "failed-precondition",
          "Google calendar is not connected yet. Connect Google calendar first."
        );
      }
      if (error.message.includes("GOOGLE_TOKEN_ENCRYPTION_KEY_B64")) {
        throw new HttpsError(
          "failed-precondition",
          "Server token encryption is not configured yet."
        );
      }
      throw new HttpsError("internal", error.message);
    }
    throw new HttpsError("internal", "Unexpected sync error");
  }
}

export async function handleUpdateGapStatusCallable(
  request: CallableRequest<unknown>,
  persistence: SyncPersistence = new FirestoreSyncPersistence()
) {
  const parsed = parseOrThrow(
    UpdateGapStatusRequestSchema,
    request.data,
    "updateGapStatus"
  );

  const userId = request.auth?.uid;
  if (!userId) {
    throw new HttpsError("unauthenticated", "updateGapStatus requires auth");
  }
  if (parsed.status === "intentional" && !parsed.intentionalReason) {
    throw new HttpsError(
      "invalid-argument",
      "intentionalReason is required when status is intentional"
    );
  }

  try {
    await persistence.updateGapStatus({
      userId,
      startIso: parsed.startIso,
      endIso: parsed.endIso,
      status: parsed.status,
      intentionalReason: parsed.intentionalReason ?? null
    });

    if (parsed.status === "intentional" && parsed.intentionalReason) {
      try {
        const timing = toGapRuleTiming(parsed.startIso, parsed.endIso);
        await persistence.upsertIntentionalRule({
          userId,
          dayOfWeek: timing.dayOfWeek,
          approxStartMinutes: timing.approxStartMinutes,
          approxEndMinutes: timing.approxEndMinutes,
          reason: parsed.intentionalReason
        });
      } catch (error) {
        logger.warn("updateGapStatus intentional rule save failed", {
          userId,
          startIso: parsed.startIso,
          endIso: parsed.endIso,
          reason: parsed.intentionalReason,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.info("updateGapStatus completed", {
      userId,
      status: parsed.status,
      startIso: parsed.startIso,
      endIso: parsed.endIso
    });

    return UpdateGapStatusResponseSchema.parse({ ok: true });
  } catch (error) {
    logger.error("updateGapStatus failed", {
      userId,
      startIso: parsed.startIso,
      endIso: parsed.endIso,
      status: parsed.status,
      error: error instanceof Error ? error.message : String(error)
    });

    if (error instanceof HttpsError) {
      throw error;
    }
    if (error instanceof Error && error.message.includes("Gap not found")) {
      throw new HttpsError("not-found", "Gap not found for update");
    }
    throw new HttpsError(
      "internal",
      error instanceof Error ? error.message : "Unable to update gap status"
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Phase 1.5 — Post-cancellation data cleanup
// Fires when users/{userId}.subscription_status transitions to "cancelled".
// Immediately removes all personal calendar data per privacy policy.
// ─────────────────────────────────────────────────────────────

export const onCancelledSubscription = onDocumentWritten(
  {
    document: "users/{userId}",
    region: "us-central1",
  },
  async (event) => {
    const userId = event.params.userId;
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    if (!before || !after) return;

    // Only fire on 0→1 transition to "cancelled"
    if (before.subscription_status === after.subscription_status) return;
    if (after.subscription_status !== "cancelled") return;

    logger.info("onCancelledSubscription: cleanup starting", { userId });

    const db = getDb();

    try {
      // 1. Revoke stored calendar tokens
      const calendarSource = before.calendar_source ?? before.calendarSource;
      if (calendarSource === "google") {
        try {
          const tokenStore = new FirestoreTokenStore();
          await tokenStore.revokeGoogleToken(userId, new Date().toISOString());
        } catch (tokenErr) {
          logger.warn("onCancelledSubscription: token revocation failed", {
            userId,
            tokenErr,
          });
        }
      }

      // 2. Clear calendar connection fields on the user document
      await db.doc(`users/${userId}`).update({
        calendarConnected: false,
        calendarSource: null,
        "stats.last_sync_at": null,
      });

      // 3. Batch-anonymise gaps: remove calendarEventId to sever link to
      //    the provider's event. Keep leakage_value, status, weekday, hour
      //    for aggregate analytics.
      const gapsSnap = await db
        .collection("gaps")
        .where("user_id", "==", userId)
        .get();

      const BATCH_SIZE = 500;
      for (let i = 0; i < gapsSnap.docs.length; i += BATCH_SIZE) {
        const writeBatch = db.batch();
        gapsSnap.docs.slice(i, i + BATCH_SIZE).forEach((doc) => {
          writeBatch.update(doc.ref, {
            calendarEventId: FieldValue.delete(),
          });
        });
        await writeBatch.commit();
      }

      // 4. Log the deletion event
      await writeCalendarDataDeletedEvent(userId);

      logger.info("onCancelledSubscription: cleanup complete", {
        userId,
        gapsAnonymised: gapsSnap.size,
      });
    } catch (err) {
      logger.error("onCancelledSubscription: cleanup failed", { userId, err });
    }
  }
);

// ─────────────────────────────────────────────────────────────
// storeFcmToken
// Called by Flutter to register or rotate the device FCM push token.
// Stores {token, platform, updatedAt} in fcm_tokens/{userId}.
// ─────────────────────────────────────────────────────────────

export const storeFcmToken = onCall(
  { region: "us-central1", invoker: "public" },
  async (request: CallableRequest<unknown>) => {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError("unauthenticated", "storeFcmToken requires auth");
    }

    const data = (request.data ?? {}) as Record<string, unknown>;
    const token = data.token;
    const platform = data.platform;

    if (typeof token !== "string" || !token) {
      throw new HttpsError("invalid-argument", "storeFcmToken: token is required");
    }
    if (platform !== "ios" && platform !== "android") {
      throw new HttpsError(
        "invalid-argument",
        'storeFcmToken: platform must be "ios" or "android"'
      );
    }

    const db = getDb();
    await db.doc(`fcm_tokens/${userId}`).set(
      {
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

    logger.info("storeFcmToken: token stored", { userId, platform });
    return { ok: true };
  }
);

// ─────────────────────────────────────────────────────────────
// updateNotificationFrequency
// Called by the Flutter notification settings widget when the user
// changes their preferred notification cadence.
// Updates notification_state/{userId}.notification_frequency.
// ─────────────────────────────────────────────────────────────

const VALID_FREQUENCIES = ["standard", "focused", "weekly_digest"] as const;
type NotificationFrequency = (typeof VALID_FREQUENCIES)[number];

export const updateNotificationFrequency = onCall(
  { region: "us-central1", invoker: "public" },
  async (request: CallableRequest<unknown>) => {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError(
        "unauthenticated",
        "updateNotificationFrequency requires auth"
      );
    }

    const data = (request.data ?? {}) as Record<string, unknown>;
    const frequency = data.frequency as NotificationFrequency | undefined;

    if (!frequency || !VALID_FREQUENCIES.includes(frequency as NotificationFrequency)) {
      throw new HttpsError(
        "invalid-argument",
        `updateNotificationFrequency: frequency must be one of ${VALID_FREQUENCIES.join(", ")}`
      );
    }

    const db = getDb();
    await db.doc(`notification_state/${userId}`).set(
      { notification_frequency: frequency },
      { merge: true }
    );

    logger.info("updateNotificationFrequency: updated", { userId, frequency });
    return { ok: true };
  }
);

// ─────────────────────────────────────────────────────────────
// getWeeklySummary
// Returns a summary of the current and prior week's gap + recovery data
// for the Flutter weekly summary screen.
// ─────────────────────────────────────────────────────────────

function isoWeekLabel(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  // Start of ISO week: Monday
  const d = new Date(date);
  const day = d.getUTCDay() || 7; // Sunday=0 → 7
  d.setUTCDate(d.getUTCDate() - day + 1); // back to Monday
  return `Week of ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export const getWeeklySummary = onCall(
  { region: "us-central1", invoker: "public" },
  async (request: CallableRequest<unknown>) => {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError("unauthenticated", "getWeeklySummary requires auth");
    }

    const db = getDb();
    const now = new Date();

    // Determine current week bounds (Monday–Sunday, UTC)
    const dayOfWeek = now.getUTCDay() || 7; // Sunday=0 → 7
    const monday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOfWeek + 1)
    );
    const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
    sunday.setUTCHours(23, 59, 59, 999);

    // Previous week bounds
    const prevMonday = new Date(monday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevSunday = new Date(monday.getTime() - 1);
    prevSunday.setUTCHours(23, 59, 59, 999);

    try {
      // Current week gaps
      const currSnap = await db
        .collection("gaps")
        .where("user_id", "==", userId)
        .where("start_time", ">=", monday)
        .where("start_time", "<=", sunday)
        .get();

      let totalLeakage = 0;
      let openGaps = 0;
      let intentionalBlocks = 0;
      let recoveredRevenueSelfReported = 0;

      for (const doc of currSnap.docs) {
        const d = doc.data();
        const status = d.status as string;
        const leakage = (d.leakage_value as number) ?? 0;

        if (status === "open") {
          openGaps++;
          totalLeakage += leakage;
        } else if (status === "filled") {
          recoveredRevenueSelfReported += leakage;
        } else if (status === "intentional") {
          intentionalBlocks++;
        }
      }

      // Previous week — filled gaps only (recovered revenue)
      const prevSnap = await db
        .collection("gaps")
        .where("user_id", "==", userId)
        .where("start_time", ">=", prevMonday)
        .where("start_time", "<=", prevSunday)
        .where("status", "==", "filled")
        .get();

      let prevWeekRecovered = 0;
      for (const doc of prevSnap.docs) {
        prevWeekRecovered += (doc.data().leakage_value as number) ?? 0;
      }

      logger.info("getWeeklySummary: query complete", {
        userId,
        openGaps,
        totalLeakage,
        recoveredRevenueSelfReported,
        prevWeekRecovered,
      });

      return {
        ok: true,
        weekLabel: isoWeekLabel(monday),
        recoveredRevenueSelfReported: Math.round(recoveredRevenueSelfReported),
        totalLeakage: Math.round(totalLeakage),
        openGaps,
        intentionalBlocks,
        prevWeekRecovered: Math.round(prevWeekRecovered),
        // nextWeekGapCount is omitted — current open gaps are not a valid proxy
        // for next-week forecast without a forward sync. Consumers should treat
        // absence of this field as "forecast unavailable".
      };
    } catch (err) {
      logger.error("getWeeklySummary: query failed", { userId, err });
      throw new HttpsError(
        "internal",
        err instanceof Error ? err.message : "getWeeklySummary failed"
      );
    }
  }
);
