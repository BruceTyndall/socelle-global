import { getDb } from "../lib/firebase.js";
import { detectAndSendMilestones } from "../notifications/milestone_detector.js";
import { logger } from "firebase-functions";

export type PersistedGapStatus = "open" | "filled" | "intentional";
export type PersistedIntentionalReason = "lunch" | "buffer" | "personal" | "other" | null;
export type PersistedIntentionalRuleReason = Exclude<PersistedIntentionalReason, null>;

export interface PersistedGap {
  userId: string;
  startIso: string;
  endIso: string;
  durationMinutes: number;
  bookableSlots: number;
  leakageValue: number;
  dayOfWeek: string;
  intentional: boolean;
  intentionalReason?: PersistedIntentionalReason;
}

export interface PersistedGapSnapshot {
  gapId: string;
  startIso: string;
  endIso: string;
  status: PersistedGapStatus;
  intentionalReason: PersistedIntentionalReason;
}

export interface PersistedIntentionalRule {
  dayOfWeek: string;
  approxStartMinutes: number;
  approxEndMinutes: number;
  reason: PersistedIntentionalRuleReason;
  active: boolean;
}

export interface SyncPersistence {
  replaceGapsInRange(params: {
    userId: string;
    startIso: string;
    endIso: string;
    gaps: PersistedGap[];
  }): Promise<PersistedGapSnapshot[]>;
  updateGapStatus(params: {
    userId: string;
    startIso: string;
    endIso: string;
    status: PersistedGapStatus;
    intentionalReason?: PersistedIntentionalReason;
  }): Promise<void>;
  listIntentionalRules(params: {
    userId: string;
  }): Promise<PersistedIntentionalRule[]>;
  upsertIntentionalRule(params: {
    userId: string;
    dayOfWeek: string;
    approxStartMinutes: number;
    approxEndMinutes: number;
    reason: PersistedIntentionalRuleReason;
  }): Promise<void>;
  updateUserSyncStats(params: {
    userId: string;
    weeklyLeakage: number;
    rolling30dLeakage?: number;
    recoveredRevenueSelfReported?: number;
    recoveredRevenueVerified?: number;
    lastSyncIso: string;
  }): Promise<void>;
}

function toWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function gapDocId(userId: string, startIso: string, endIso: string): string {
  const start = startIso.replace(/[:.]/g, "");
  const end = endIso.replace(/[:.]/g, "");
  return `${userId}_${start}_${end}`;
}

function normalizeGapStatus(value: unknown): PersistedGapStatus | null {
  if (value === "open" || value === "filled" || value === "intentional") {
    return value;
  }
  return null;
}

function normalizeIntentionalReason(value: unknown): PersistedIntentionalReason {
  if (
    value === "lunch" ||
    value === "buffer" ||
    value === "personal" ||
    value === "other"
  ) {
    return value;
  }
  return null;
}

function normalizeIntentionalRuleReason(value: unknown): PersistedIntentionalRuleReason | null {
  const reason = normalizeIntentionalReason(value);
  return reason ?? null;
}

function isValidMinutesValue(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 24 * 60;
}

export class FirestoreSyncPersistence implements SyncPersistence {
  async replaceGapsInRange(params: {
    userId: string;
    startIso: string;
    endIso: string;
    gaps: PersistedGap[];
  }): Promise<PersistedGapSnapshot[]> {
    const db = getDb();
    const start = new Date(params.startIso);
    const end = new Date(params.endIso);

    const existing = await db
      .collection("gaps")
      .where("user_id", "==", params.userId)
      .where("start_time", ">=", start)
      .where("start_time", "<=", end)
      .get();

    const existingByDocId = new Map(existing.docs.map((doc) => [doc.id, doc]));
    const batch = db.batch();
    const nextDocIds = new Set<string>();
    const persistedSnapshots: PersistedGapSnapshot[] = [];

    const now = new Date();

    for (const gap of params.gaps) {
      const startDate = new Date(gap.startIso);
      const docId = gapDocId(gap.userId, gap.startIso, gap.endIso);
      nextDocIds.add(docId);

      const ref = db.collection("gaps").doc(docId);
      const existingDoc = existingByDocId.get(docId);
      const existingData = existingDoc?.data();

      const defaultStatus: PersistedGapStatus = gap.intentional ? "intentional" : "open";
      const status = normalizeGapStatus(existingData?.status) ?? defaultStatus;
      const defaultIntentionalReason = gap.intentional
        ? normalizeIntentionalReason(gap.intentionalReason)
        : null;
      const intentionalReason =
        status === "intentional"
          ? normalizeIntentionalReason(existingData?.intentional_reason) ?? defaultIntentionalReason
          : null;

      batch.set(ref, {
        user_id: gap.userId,
        date: new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())),
        day_of_week: gap.dayOfWeek,
        start_time: new Date(gap.startIso),
        end_time: new Date(gap.endIso),
        duration_minutes: gap.durationMinutes,
        bookable_slots: gap.bookableSlots,
        leakage_value: gap.leakageValue,
        status,
        source_calendar: existingData?.source_calendar ?? null,
        intentional_reason: intentionalReason,
        filled_at: status === "filled" ? existingData?.filled_at ?? now : null,
        fill_confidence: status === "filled" ? existingData?.fill_confidence ?? null : null,
        filled_method: status === "filled" ? existingData?.filled_method ?? null : null,
        created_at: existingData?.created_at ?? now,
        week_key: toWeekKey(startDate)
      });

      persistedSnapshots.push({
        gapId: docId,
        startIso: gap.startIso,
        endIso: gap.endIso,
        status,
        intentionalReason
      });
    }

    for (const doc of existing.docs) {
      if (!nextDocIds.has(doc.id)) {
        batch.delete(doc.ref);
      }
    }

    await batch.commit();
    return persistedSnapshots;
  }

  async updateGapStatus(params: {
    userId: string;
    startIso: string;
    endIso: string;
    status: PersistedGapStatus;
    intentionalReason?: PersistedIntentionalReason;
  }): Promise<void> {
    const db = getDb();
    const docId = gapDocId(params.userId, params.startIso, params.endIso);
    const ref = db.collection("gaps").doc(docId);
    const userRef = db.collection("users").doc(params.userId);

    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) {
        throw new Error("Gap not found");
      }

      const gapData = snapshot.data();
      const previousStatus = normalizeGapStatus(gapData?.status) ?? "open";
      const leakageValue =
        typeof gapData?.leakage_value === "number" && Number.isFinite(gapData.leakage_value)
          ? gapData.leakage_value
          : 0;

      const intentionalReason =
        params.status === "intentional"
          ? normalizeIntentionalReason(params.intentionalReason)
          : null;

      tx.set(
        ref,
        {
          status: params.status,
          intentional_reason: intentionalReason,
          filled_at: params.status === "filled" ? new Date() : null,
          fill_confidence: params.status === "filled" ? "self_reported" : null,
          filled_method: params.status === "filled" ? "manual_mark" : null
        },
        { merge: true }
      );

      let recoveredDelta = 0;
      if (previousStatus !== "filled" && params.status === "filled") {
        recoveredDelta = leakageValue;
      } else if (previousStatus === "filled" && params.status !== "filled") {
        recoveredDelta = -leakageValue;
      }

      if (recoveredDelta !== 0) {
        const userSnapshot = await tx.get(userRef);
        const existing = userSnapshot.data();
        const currentRecovered =
          typeof existing?.stats?.recovered_revenue_self_reported === "number" &&
          Number.isFinite(existing.stats.recovered_revenue_self_reported)
            ? existing.stats.recovered_revenue_self_reported
            : 0;

        tx.set(
          userRef,
          {
            stats: {
              recovered_revenue_self_reported: Math.max(0, currentRecovered + recoveredDelta)
            }
          },
          { merge: true }
        );
      }
    });
  }

  async listIntentionalRules(params: {
    userId: string;
  }): Promise<PersistedIntentionalRule[]> {
    const db = getDb();
    const snapshot = await db
      .collection("intentional_rules")
      .where("user_id", "==", params.userId)
      .get();

    const rules: PersistedIntentionalRule[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const reason = normalizeIntentionalRuleReason(data.reason);
      const active = data.active !== false;

      if (
        typeof data.day_of_week !== "string" ||
        !isValidMinutesValue(data.approx_start_minutes) ||
        !isValidMinutesValue(data.approx_end_minutes) ||
        reason === null
      ) {
        continue;
      }

      rules.push({
        dayOfWeek: data.day_of_week,
        approxStartMinutes: data.approx_start_minutes,
        approxEndMinutes: data.approx_end_minutes,
        reason,
        active
      });
    }

    return rules.filter((rule) => rule.active);
  }

  async upsertIntentionalRule(params: {
    userId: string;
    dayOfWeek: string;
    approxStartMinutes: number;
    approxEndMinutes: number;
    reason: PersistedIntentionalRuleReason;
  }): Promise<void> {
    const db = getDb();
    const now = new Date();

    const existing = await db
      .collection("intentional_rules")
      .where("user_id", "==", params.userId)
      .where("day_of_week", "==", params.dayOfWeek)
      .get();

    const toleranceMinutes = 30;
    const matchedDoc = existing.docs.find((doc) => {
      const data = doc.data();
      return (
        isValidMinutesValue(data.approx_start_minutes) &&
        isValidMinutesValue(data.approx_end_minutes) &&
        Math.abs(data.approx_start_minutes - params.approxStartMinutes) <= toleranceMinutes &&
        Math.abs(data.approx_end_minutes - params.approxEndMinutes) <= toleranceMinutes
      );
    });

    const payload = {
      user_id: params.userId,
      day_of_week: params.dayOfWeek,
      approx_start_minutes: params.approxStartMinutes,
      approx_end_minutes: params.approxEndMinutes,
      reason: params.reason,
      active: true,
      updated_at: now
    };

    if (matchedDoc) {
      await matchedDoc.ref.set(payload, { merge: true });
      return;
    }

    await db.collection("intentional_rules").add({
      ...payload,
      created_at: now
    });
  }

  async updateUserSyncStats(params: {
    userId: string;
    weeklyLeakage: number;
    rolling30dLeakage?: number;
    recoveredRevenueSelfReported?: number;
    recoveredRevenueVerified?: number;
    lastSyncIso: string;
  }): Promise<void> {
    const db = getDb();
    const stats = {
      current_week_leakage: params.weeklyLeakage,
      // rolling_30d_leakage is computed separately via a Firestore query in the
      // callable handler and passed via rolling30dLeakage param. Intentionally
      // NOT overwritten here with weeklyLeakage to avoid BUG-001 regression.
      ...(params.rolling30dLeakage !== undefined
        ? { rolling_30d_leakage: params.rolling30dLeakage }
        : {}),
      ...(params.recoveredRevenueSelfReported !== undefined
        ? { recovered_revenue_self_reported: params.recoveredRevenueSelfReported }
        : {}),
      ...(params.recoveredRevenueVerified !== undefined
        ? { recovered_revenue_verified: params.recoveredRevenueVerified }
        : {}),
      last_sync_at: new Date(params.lastSyncIso)
    };

    await db
      .collection("users")
      .doc(params.userId)
      .set({ stats }, { merge: true });

    // Milestone detection — fire-and-forget, non-blocking
    detectAndSendMilestones(params.userId, {
      current_week_leakage: params.weeklyLeakage,
      recovered_revenue_self_reported: params.recoveredRevenueSelfReported,
    }).catch((err) => {
      logger.error("updateUserSyncStats: milestone detection failed", {
        userId: params.userId,
        err,
      });
    });
  }
}
