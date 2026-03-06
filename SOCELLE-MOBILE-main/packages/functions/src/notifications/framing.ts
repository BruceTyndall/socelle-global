/**
 * 4-frame notification framing rotation system.
 *
 * Blueprint rule: No single frame dominates more than 2 consecutive notifications.
 * The framing_rotation_index in notification_state cycles 0 → 3.
 */

export type NotificationFrame = "dollar" | "pattern" | "client_reconnect" | "weekly_context";

export const FRAME_ORDER: NotificationFrame[] = [
  "dollar",
  "pattern",
  "client_reconnect",
  "weekly_context",
];

export interface GapContext {
  dayOfWeek: string;        // e.g. "Wednesday"
  timeLabel: string;        // e.g. "2:00 PM"
  leakageValue: number;     // $ amount
  filledCountSameDow: number; // how many of last 6 same-day gaps were filled
  weeksBehindPrevious: number; // $ behind last week's pace
  clientsUnbooked: number;   // clients with no booking in 6+ weeks (proxy)
}

export interface NotificationCopy {
  title: string;
  body: string;
  frame: NotificationFrame;
}

/**
 * Build notification copy for a given frame and gap context.
 */
export function buildCopy(
  frame: NotificationFrame,
  ctx: GapContext,
  urgencyTier: 1 | 2 | 3
): NotificationCopy {
  const dollar = `$${Math.round(ctx.leakageValue)}`;
  const day = capitalise(ctx.dayOfWeek);

  switch (frame) {
    case "dollar": {
      if (urgencyTier === 1) {
        return {
          title: `You have a ${dollar} opening this ${day}`,
          body: `Your ${day} slots fill about ${ctx.filledCountSameDow * 16}% of the time when you reach out early.`,
          frame,
        };
      }
      if (urgencyTier === 2) {
        return {
          title: `${dollar} slot is 24 hours out`,
          body: `A quick message to your waitlist has filled slots like this before.`,
          frame,
        };
      }
      // Tier 3
      return {
        title: `${ctx.timeLabel} today. ${dollar}. Still fillable.`,
        body: `Some providers fill these with a same-day discount.`,
        frame,
      };
    }

    case "pattern": {
      const filled = Math.min(ctx.filledCountSameDow, 6);
      return {
        title: `You've filled ${filled} of your last 6 ${day} gaps`,
        body: `This one is winnable — here's a quick way to reach out.`,
        frame,
      };
    }

    case "client_reconnect": {
      const count = Math.max(ctx.clientsUnbooked, 1);
      return {
        title: `${count} client${count === 1 ? "" : "s"} haven't booked in 6+ weeks`,
        body: `One of them might want this ${ctx.timeLabel} slot on ${day}.`,
        frame,
      };
    }

    case "weekly_context": {
      const behind = `$${Math.round(ctx.weeksBehindPrevious)}`;
      return {
        title: `You're ${behind} behind last week's pace`,
        body: `This slot closes the gap. Tap to reach out.`,
        frame,
      };
    }
  }
}

/**
 * Re-engagement copy for users absent 7+ days. Bypasses frame rotation.
 */
export function buildReEngagementCopy(
  leakageValue: number,
  openGapCount: number
): NotificationCopy {
  return {
    title: `You have gaps this week`,
    body: `Your schedule has ${openGapCount} opening${openGapCount === 1 ? "" : "s"} worth $${Math.round(leakageValue)}. Tap to see what's fillable.`,
    frame: "dollar",
  };
}

/**
 * Tier 2 inactivity push (8-14 days absent, has prior recovery).
 */
export function buildValueMemoryCopy(
  lastRecoveryAmount: number,
  openGapCount: number
): NotificationCopy {
  return {
    title: `Last time: you recovered $${Math.round(lastRecoveryAmount)}`,
    body: `New gaps are open now that weren't there before. ${openGapCount > 0 ? `${openGapCount} gap${openGapCount === 1 ? "" : "s"} this week.` : ""}`,
    frame: "dollar",
  };
}

/**
 * Weekly lifecycle notifications (Monday, Thursday, Friday).
 */
export function buildMondayCopy(
  gapCount: number,
  totalLeakage: number,
  topGapDay: string,
  topGapTime: string,
  isRecoveryAfterFlatWeek: boolean
): NotificationCopy {
  if (isRecoveryAfterFlatWeek) {
    return {
      title: `New week, clean slate`,
      body: `You have ${gapCount} gaps already visible. The earliest one is the easiest to fill.`,
      frame: "dollar",
    };
  }
  return {
    title: `Your week has ${gapCount} gaps totaling $${Math.round(totalLeakage)}`,
    body: `Here's the one most likely to fill: ${capitalise(topGapDay)} at ${topGapTime}.`,
    frame: "dollar",
  };
}

export function buildThursdayCopy(
  recoveredThisWeek: number,
  openGapDay?: string,
  openGapTime?: string
): NotificationCopy {
  if (recoveredThisWeek > 0) {
    const detail =
      openGapDay && openGapTime
        ? ` ${capitalise(openGapDay)} at ${openGapTime} is still open.`
        : "";
    return {
      title: `You've already recovered $${Math.round(recoveredThisWeek)} this week`,
      body: `Keep the momentum going.${detail}`,
      frame: "dollar",
    };
  }
  return {
    title: `This week's most fillable gap is still open`,
    body:
      openGapDay && openGapTime
        ? `${capitalise(openGapDay)} at ${openGapTime} — here's a quick way to reach out.`
        : `Here's a quick way to reach out and fill it.`,
    frame: "pattern",
  };
}

/**
 * Milestone notification copy.
 */
export function buildMilestoneCopy(
  milestone: "firstRecovery" | "fiveGapRecovery" | "personalBestWeek" | "sevenDayStreak",
  context: { amount?: number; cumulative?: number; previousBest?: number; streak?: number }
): { title: string; body: string } {
  switch (milestone) {
    case "firstRecovery":
      return {
        title: `You just filled your first gap`,
        body: `That's $${Math.round(context.amount ?? 0)} you would have lost. That's how this works.`,
      };
    case "fiveGapRecovery":
      return {
        title: `You've recovered $${Math.round(context.cumulative ?? 0)} total`,
        body: `That's your SLOTFORCE subscription covered — and then some.`,
      };
    case "personalBestWeek":
      return {
        title: `Best recovery week yet — $${Math.round(context.amount ?? 0)}`,
        body:
          context.previousBest
            ? `Your previous best was $${Math.round(context.previousBest)}.`
            : `Keep this pace and you'll finish strong.`,
      };
    case "sevenDayStreak":
      return {
        title: `7 days of active gap management`,
        body: `Providers who stay consistent in the first month recover 2.3x more than those who don't.`,
      };
  }
}

function capitalise(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
