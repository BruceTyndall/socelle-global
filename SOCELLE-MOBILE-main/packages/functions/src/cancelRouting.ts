/**
 * CF-side cancellation routing logic.
 *
 * Called by the Flutter app after the exit survey is submitted.
 * Stores the cancellation reason, routes support cases, and writes events.
 */

import { FieldValue } from "firebase-admin/firestore";
import { onCall, CallableRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getDb } from "./lib/firebase.js";

interface CancelRoutingRequest {
  reason: string; // "not_using" | "no_results" | "too_expensive" | "switched_tool" | "other"
  otherText?: string; // populated when reason = "other" or "switched_tool"
  daysSinceSignup?: number;
  lifetimeRecoveredUsd?: number;
}

interface CancelRoutingResponse {
  ok: true;
  routing: "pause" | "support" | "annual" | "clean_exit" | "support_text";
}

/**
 * submitCancellation — callable from Flutter after exit survey.
 *
 * Actions:
 * 1. Stores cancellationReason on users/{userId}
 * 2. Routes no_results → support queue
 * 3. Stores other free text → support queue
 * 4. Writes cancel_flow_completed event
 */
export const submitCancellation = onCall(
  {
    region: "us-central1",
    invoker: "public",
  },
  async (request: CallableRequest<CancelRoutingRequest>): Promise<CancelRoutingResponse> => {
    const db = getDb();
    const userId = request.auth?.uid;
    if (!userId) {
      throw new Error("Unauthenticated");
    }

    const { reason, otherText, daysSinceSignup, lifetimeRecoveredUsd } = request.data;

    if (!reason) {
      throw new Error("reason is required");
    }

    const now = new Date().toISOString();

    // ── Store cancellation reason on user doc ─────────────────────────────
    await db.doc(`users/${userId}`).update({
      cancellation_reason: reason,
      cancelled_at: now,
    });

    // ── Write event ───────────────────────────────────────────────────────
    await db.collection(`users/${userId}/events`).add({
      event: "cancel_confirmed",
      exitSurveyAnswer: reason,
      otherText: otherText ?? null,
      daysSinceSignup: daysSinceSignup ?? null,
      lifetimeRecoveredUsd: lifetimeRecoveredUsd ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    // ── Routing logic ─────────────────────────────────────────────────────
    let routing: CancelRoutingResponse["routing"];

    switch (reason) {
      case "not_using":
        routing = "pause";
        break;

      case "no_results":
        // Write to support queue for follow-up
        await db.collection("support_queue").add({
          userId,
          type: "no_results_cancellation",
          reason,
          daysSinceSignup: daysSinceSignup ?? null,
          lifetimeRecoveredUsd: lifetimeRecoveredUsd ?? null,
          status: "open",
          createdAt: FieldValue.serverTimestamp(),
        });
        routing = "support";
        logger.info("cancelRouting: no_results case — added to support queue", { userId });
        break;

      case "too_expensive":
        routing = "annual";
        break;

      case "switched_tool":
        // Store which tool for competitive intel, then clean exit
        if (otherText) {
          await db.collection("support_queue").add({
            userId,
            type: "switched_tool",
            competitorTool: otherText,
            status: "info",
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        routing = "clean_exit";
        break;

      case "other":
      default:
        if (otherText) {
          await db.collection("support_queue").add({
            userId,
            type: "other_cancellation",
            freeText: otherText,
            status: "open",
            createdAt: FieldValue.serverTimestamp(),
          });
        }
        routing = "support_text";
        break;
    }

    logger.info("cancelRouting: processed", { userId, reason, routing });
    return { ok: true, routing };
  }
);
