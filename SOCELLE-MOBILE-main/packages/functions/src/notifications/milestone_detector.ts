import { getDb } from "../lib/firebase.js";
import { logger } from "firebase-functions";
import { sendPushNotification } from "./fcm_sender.js";
import { buildMilestoneCopy } from "./framing.js";
import type { UserStats } from "../../../shared/src/index.js";

export type MilestoneKey =
  | "firstRecovery"
  | "fiveGapRecovery"
  | "personalBestWeek"
  | "sevenDayStreak";

/**
 * Called after `updateUserSyncStats` to check if any milestone has just been
 * reached. Sends a push notification for each new milestone (once only).
 */
export async function detectAndSendMilestones(
  userId: string,
  stats: Partial<UserStats>
): Promise<void> {
  const db = getDb();
  const stateRef = db.collection("notification_state").doc(userId);
  const stateDoc = await stateRef.get();
  const sentMilestones: string[] =
    (stateDoc.data()?.milestones_sent as string[]) ?? [];

  const pending: MilestoneKey[] = [];

  // Milestone 1: First recovery (recovered > 0 for the first time)
  if (
    !sentMilestones.includes("firstRecovery") &&
    (stats.recovered_revenue_self_reported ?? 0) > 0
  ) {
    pending.push("firstRecovery");
  }

  // Milestone 2: 5 filled gaps total
  if (!sentMilestones.includes("fiveGapRecovery")) {
    try {
      const filledCount = await db
        .collection("gaps")
        .where("user_id", "==", userId)
        .where("status", "==", "filled")
        .get();
      if (filledCount.size >= 5) {
        pending.push("fiveGapRecovery");
      }
    } catch {
      // Non-critical
    }
  }

  // Milestone 3: Personal best week
  if (!sentMilestones.includes("personalBestWeek")) {
    const isPersonalBest = await checkPersonalBestWeek(userId);
    if (isPersonalBest) {
      pending.push("personalBestWeek");
    }
  }

  // Milestone 4: 7-day streak (streak_count >= 7 is checked in streak model)
  // We check the streak field in the user doc (if synced there)
  // For now: check if current_streak in notification_state >= 7
  if (!sentMilestones.includes("sevenDayStreak")) {
    const streakDoc = await db.collection("users").doc(userId).get();
    const streak = (streakDoc.data()?.current_streak as number) ?? 0;
    if (streak >= 7) {
      pending.push("sevenDayStreak");
    }
  }

  if (pending.length === 0) return;

  for (const milestone of pending) {
    try {
      const amount = stats.recovered_revenue_self_reported;
      const cumulative = stats.total_leakage_all_time;

      const copy = buildMilestoneCopy(milestone, {
        amount,
        cumulative,
        previousBest: undefined,
        streak: 7,
      });

      await sendPushNotification(userId, {
        title: copy.title,
        body: copy.body,
        tier: "milestone",
        frame: "dollar",
        data: { milestone },
      });

      // Record milestone as sent
      const updated = [...sentMilestones, milestone];
      await stateRef.set({ milestones_sent: updated }, { merge: true });

      logger.info("detectAndSendMilestones: milestone sent", {
        userId,
        milestone,
      });
    } catch (error) {
      logger.error("detectAndSendMilestones: error sending milestone", {
        userId,
        milestone,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

async function checkPersonalBestWeek(userId: string): Promise<boolean> {
  const db = getDb();
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Current week recovered
  const thisWeek = await db
    .collection("gaps")
    .where("user_id", "==", userId)
    .where("status", "==", "filled")
    .where("start_time", ">=", weekStart)
    .where("start_time", "<", weekEnd)
    .get();

  if (thisWeek.empty) return false;

  const thisWeekTotal = thisWeek.docs.reduce(
    (sum, d) => sum + (d.data().leakage_value as number ?? 0),
    0
  );

  // Best of previous 12 weeks
  const twelveWeeksAgo = new Date(weekStart.getTime() - 84 * 24 * 60 * 60 * 1000);
  const previousFilled = await db
    .collection("gaps")
    .where("user_id", "==", userId)
    .where("status", "==", "filled")
    .where("start_time", ">=", twelveWeeksAgo)
    .where("start_time", "<", weekStart)
    .get();

  if (previousFilled.empty) return thisWeekTotal > 0;

  // Group by week and find max
  const weekTotals = new Map<string, number>();
  for (const doc of previousFilled.docs) {
    const gapDate = doc.data().start_time?.toDate
      ? doc.data().start_time.toDate()
      : new Date(doc.data().start_time as string);
    const wk = gapDate.toISOString().split("T")[0].slice(0, 7); // year-month
    weekTotals.set(wk, (weekTotals.get(wk) ?? 0) + (doc.data().leakage_value as number ?? 0));
  }
  const bestPrevious = Math.max(...weekTotals.values());

  return thisWeekTotal > bestPrevious;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
