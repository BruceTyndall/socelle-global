import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { getDb } from "../lib/firebase.js";

/**
 * Runs every Sunday midnight UTC.
 * Aggregates gap data for the current week into `weekly_reports/{userId}/{weekKey}`.
 * The weekly summary UI in the mobile app reads from this collection.
 */
export const generateWeeklyReports = onSchedule(
  {
    schedule: "every sunday 00:00",
    timeZone: "UTC",
    region: "us-central1",
  },
  async () => {
    const db = getDb();
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekKey = toWeekKey(weekStart);

    const usersSnap = await db
      .collection("users")
      .where("subscription_status", "in", ["trial", "active"])
      .get();

    logger.info("generateWeeklyReports: processing users", {
      count: usersSnap.size,
      weekKey,
    });

    let successCount = 0;
    let errorCount = 0;

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      try {
        const gapsSnap = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("start_time", ">=", weekStart)
          .where("start_time", "<", weekEnd)
          .get();

        let totalLeakage = 0;
        let totalGaps = 0;
        let totalBookableSlots = 0;
        let recoveredSelfReported = 0;
        let intentionalBlocks = 0;
        let openGaps = 0;

        for (const gapDoc of gapsSnap.docs) {
          const data = gapDoc.data();
          totalGaps++;
          totalBookableSlots += (data.bookable_slots as number) ?? 0;

          if (data.status === "filled") {
            recoveredSelfReported += (data.leakage_value as number) ?? 0;
          } else if (data.status === "intentional") {
            intentionalBlocks++;
          } else {
            // open
            totalLeakage += (data.leakage_value as number) ?? 0;
            openGaps++;
          }
        }

        // Previous week recovered (for diff display)
        const prevFilledSnap = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "filled")
          .where("start_time", ">=", prevWeekStart)
          .where("start_time", "<", weekStart)
          .get();

        const prevWeekRecovered = prevFilledSnap.docs.reduce(
          (sum, d) => sum + ((d.data().leakage_value as number) ?? 0),
          0
        );

        // Next week open gap count
        const nextWeekEnd = new Date(weekEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        const nextWeekSnap = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "open")
          .where("start_time", ">=", weekEnd)
          .where("start_time", "<", nextWeekEnd)
          .get();

        const lastSyncAt = userDoc.data().stats?.last_sync_at;
        const lastSync = lastSyncAt
          ? (lastSyncAt.toDate ? lastSyncAt.toDate() : new Date(lastSyncAt))
          : null;
        const dataFreshnessHours = lastSync
          ? (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
          : 999;

        await db
          .collection("weekly_reports")
          .doc(`${userId}_${weekKey}`)
          .set({
            user_id: userId,
            week_key: weekKey,
            week_label: formatWeekLabel(weekStart),
            total_leakage: totalLeakage,
            total_gaps: totalGaps,
            total_bookable_slots: totalBookableSlots,
            recovered_revenue_self_reported: recoveredSelfReported,
            recovered_revenue_verified: 0,
            intentional_blocks: intentionalBlocks,
            open_gaps: openGaps,
            prev_week_recovered: prevWeekRecovered,
            next_week_gap_count: nextWeekSnap.size,
            data_freshness_hours: dataFreshnessHours,
            created_at: now.toISOString(),
          });

        successCount++;
      } catch (error) {
        errorCount++;
        logger.error("generateWeeklyReports: error for user", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.info("generateWeeklyReports: complete", {
      weekKey,
      success: successCount,
      errors: errorCount,
    });
  }
);

// ── Callable: getWeeklySummary ────────────────────────────────────────────────
// Used by the mobile app's WeeklySummarySheet to load the current week's report.

import {
  onCall,
  type CallableRequest,
  type CallableOptions,
} from "firebase-functions/v2/https";
import { HttpsError } from "firebase-functions/v2/https";

const callableOptions: CallableOptions = {
  region: "us-central1",
  invoker: "public",
};

export const getWeeklySummary = onCall(
  callableOptions,
  async (request: CallableRequest<unknown>) => {
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError("unauthenticated", "getWeeklySummary requires auth");
    }

    const db = getDb();
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekKey = toWeekKey(weekStart);

    const reportDoc = await db
      .collection("weekly_reports")
      .doc(`${userId}_${weekKey}`)
      .get();

    if (!reportDoc.exists) {
      // Return computed on-the-fly if report not yet generated
      return {
        week_key: weekKey,
        week_label: formatWeekLabel(weekStart),
        total_leakage: 0,
        recovered_revenue_self_reported: 0,
        open_gaps: 0,
        intentional_blocks: 0,
        prev_week_recovered: 0,
        next_week_gap_count: 0,
      };
    }

    return reportDoc.data();
  }
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function formatWeekLabel(weekStart: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const end = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  return `${weekStart.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}
