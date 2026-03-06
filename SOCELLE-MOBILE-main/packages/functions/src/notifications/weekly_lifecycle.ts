import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { getDb } from "../lib/firebase.js";
import { sendPushNotification } from "./fcm_sender.js";
import {
  buildMondayCopy,
  buildThursdayCopy,
} from "./framing.js";

/**
 * Monday 8am: Planning activation notification.
 * Sends the week's gap count + total leakage + single top gap.
 *
 * If user had 0 filled gaps the previous week → recovery loop copy.
 */
export const weeklyPlanningActivation = onSchedule(
  {
    schedule: "every monday 08:00",
    timeZone: "America/New_York",
    region: "us-central1",
  },
  async () => {
    const db = getDb();
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const fcmTokensSnap = await db.collection("fcm_tokens").get();
    const userIds = fcmTokensSnap.docs.map((d) => d.id);

    logger.info("weeklyPlanningActivation: sending to users", {
      count: userIds.length,
    });

    for (const userId of userIds) {
      try {
        // Check subscription status
        const userDoc = await db.collection("users").doc(userId).get();
        const sub = userDoc.data()?.subscription_status;
        if (sub === "expired" || sub === "cancelled") continue;

        // Load this week's open gaps
        const gapsSnap = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "open")
          .where("start_time", ">=", weekStart)
          .where("start_time", "<", weekEnd)
          .orderBy("start_time", "asc")
          .get();

        if (gapsSnap.empty) continue;

        const totalLeakage = gapsSnap.docs.reduce(
          (sum, d) => sum + (d.data().leakage_value as number ?? 0),
          0
        );

        // Check if last week had 0 filled gaps (recovery loop)
        const prevWeekFilled = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "filled")
          .where("start_time", ">=", prevWeekStart)
          .where("start_time", "<", weekStart)
          .limit(1)
          .get();
        const hadFlatWeek = prevWeekFilled.empty;

        const topGap = gapsSnap.docs[0].data();
        const topGapStart = topGap.start_time?.toDate
          ? topGap.start_time.toDate()
          : new Date(topGap.start_time as string);

        const copy = buildMondayCopy(
          gapsSnap.size,
          totalLeakage,
          topGap.day_of_week as string,
          topGapStart.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          hadFlatWeek
        );

        await sendPushNotification(userId, {
          title: copy.title,
          body: copy.body,
          tier: "lifecycle",
          frame: copy.frame,
          data: { lifecycle: "monday" },
        });
      } catch (error) {
        logger.error("weeklyPlanningActivation: error for user", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
);

/**
 * Thursday 11am: Momentum check notification.
 * No shame framing — leads with recovery if any, or "most fillable gap" if not.
 */
export const momentumCheck = onSchedule(
  {
    schedule: "every thursday 11:00",
    timeZone: "America/New_York",
    region: "us-central1",
  },
  async () => {
    const db = getDb();
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const fcmTokensSnap = await db.collection("fcm_tokens").get();
    const userIds = fcmTokensSnap.docs.map((d) => d.id);

    for (const userId of userIds) {
      try {
        const userDoc = await db.collection("users").doc(userId).get();
        const sub = userDoc.data()?.subscription_status;
        if (sub === "expired" || sub === "cancelled") continue;

        // Filled this week
        const filledSnap = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "filled")
          .where("start_time", ">=", weekStart)
          .where("start_time", "<", weekEnd)
          .get();

        const recoveredThisWeek = filledSnap.docs.reduce(
          (sum, d) => sum + (d.data().leakage_value as number ?? 0),
          0
        );

        // Top open gap
        const openSnap = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "open")
          .where("start_time", ">", now)
          .where("start_time", "<", weekEnd)
          .orderBy("start_time", "asc")
          .limit(1)
          .get();

        let topGapDay: string | undefined;
        let topGapTime: string | undefined;

        if (!openSnap.empty) {
          const topGap = openSnap.docs[0].data();
          topGapDay = topGap.day_of_week as string;
          const gapStart = topGap.start_time?.toDate
            ? topGap.start_time.toDate()
            : new Date(topGap.start_time as string);
          topGapTime = gapStart.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        } else if (recoveredThisWeek === 0) {
          // Nothing to say
          continue;
        }

        const copy = buildThursdayCopy(recoveredThisWeek, topGapDay, topGapTime);

        await sendPushNotification(userId, {
          title: copy.title,
          body: copy.body,
          tier: "lifecycle",
          frame: copy.frame,
          data: { lifecycle: "thursday" },
        });
      } catch (error) {
        logger.error("momentumCheck: error for user", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
);

/**
 * Friday 4pm: Recovery reflection — written to Firestore for in-app display.
 * No push notification (in-app only). The weekly summary sheet reads this.
 */
export const recoveryReflection = onSchedule(
  {
    schedule: "every friday 16:00",
    timeZone: "America/New_York",
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

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      try {
        // This week
        const thisWeekFilled = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "filled")
          .where("start_time", ">=", weekStart)
          .where("start_time", "<", weekEnd)
          .get();

        const thisWeekRecovered = thisWeekFilled.docs.reduce(
          (sum, d) => sum + (d.data().leakage_value as number ?? 0),
          0
        );

        // 4 weeks ago
        const fourWeeksAgo = new Date(weekStart.getTime() - 28 * 24 * 60 * 60 * 1000);
        const prevFourWeekFilled = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "filled")
          .where("start_time", ">=", fourWeeksAgo)
          .where("start_time", "<", prevWeekStart)
          .get();

        const prevFourWeekRecovered = prevFourWeekFilled.docs.reduce(
          (sum, d) => sum + (d.data().leakage_value as number ?? 0),
          0
        );
        const prev4WeekAvg = prevFourWeekRecovered / 4;

        // Next week open gaps
        const nextWeekEnd = new Date(weekEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        const nextWeekOpen = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "open")
          .where("start_time", ">=", weekEnd)
          .where("start_time", "<", nextWeekEnd)
          .get();

        // Write weekly summary to Firestore
        await db
          .collection("weekly_summaries")
          .doc(userId)
          .collection("weeks")
          .doc(weekKey)
          .set({
            week_key: weekKey,
            recovered_this_week: thisWeekRecovered,
            prev_4_week_avg_recovered: prev4WeekAvg,
            next_week_gap_count: nextWeekOpen.size,
            generated_at: new Date().toISOString(),
          });
      } catch (error) {
        logger.error("recoveryReflection: error for user", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    logger.info("recoveryReflection: complete", {
      users: usersSnap.size,
      weekKey,
    });
  }
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
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
