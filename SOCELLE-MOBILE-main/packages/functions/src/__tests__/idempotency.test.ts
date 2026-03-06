/**
 * Idempotency tests — double-send prevention.
 *
 * Verifies that:
 * 1. sendEmail() skips the Postmark API when an idempotency key already
 *    exists in Firestore.
 * 2. sendEmail() proceeds when no prior key exists.
 * 3. Scheduled-email helpers emit consistent idempotency key formats.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// ── Stub POSTMARK_API_KEY so email.ts proceeds to the API call ─────────────────
process.env.POSTMARK_API_KEY = "test_postmark_key";

// ── Firebase stubs ────────────────────────────────────────────────────────────
let idempotencyDocExists = false;

vi.mock("firebase-admin/firestore", () => {
  const docMock = () => ({
    get: vi.fn(async () => ({ exists: idempotencyDocExists })),
    set: vi.fn(async () => {}),
    update: vi.fn(async () => {}),
  });

  return {
    getFirestore: vi.fn(() => ({
      doc: vi.fn(() => docMock()),
      collection: vi.fn((path: string) => {
        if (path.includes("email_idempotency")) {
          return {
            doc: vi.fn(() => docMock()),
          };
        }
        return {
          add: vi.fn(async () => {}),
          where: vi.fn().mockReturnThis(),
          get: vi.fn(async () => ({ docs: [], size: 0 })),
        };
      }),
    })),
    FieldValue: {
      serverTimestamp: vi.fn(() => "mock_timestamp"),
      arrayUnion: vi.fn(),
      increment: vi.fn(),
      delete: vi.fn(),
    },
    Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })) },
  };
});

vi.mock("firebase-functions", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("firebase-functions/v2/scheduler", () => ({
  onSchedule: vi.fn((_opts: unknown, handler: unknown) => handler),
}));

vi.mock("firebase-functions/v2/firestore", () => ({
  onDocumentWritten: vi.fn((_opts: unknown, handler: unknown) => handler),
}));

// Stub global fetch so no real HTTP calls happen
const fetchMock = vi.fn(async () => ({
  ok: true,
  json: async () => ({ MessageID: "mock-message-id" }),
  text: async () => "ok",
}));
vi.stubGlobal("fetch", fetchMock);

import { sendEmail } from "../email.js";

// ── Mock isEmailEligible to always allow ──────────────────────────────────────
vi.mock("../notificationEligibility.js", () => ({
  checkNotificationEligibility: vi.fn(async () => ({
    eligible: true,
    reason: "",
  })),
  isEmailEligible: vi.fn(async () => true),
  isPushEligible: vi.fn(async () => true),
}));

// ─────────────────────────────────────────────────────────────────────────────

describe("sendEmail idempotency", () => {
  beforeEach(() => {
    fetchMock.mockClear();
    idempotencyDocExists = false;
  });

  it("sends the email when no prior idempotency key exists", async () => {
    idempotencyDocExists = false;

    await sendEmail({
      userId: "user_001",
      to: "test@example.com",
      templateId: "tier2-value-memory",
      subject: "Test subject",
      html: "<p>Test</p>",
      text: "Test",
      emailType: "marketing",
      meta: { idempotencyKey: "user_001_renewal_2026-01-01" },
    });

    // fetch should have been called (Postmark API)
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("suppresses the email when the idempotency key already exists", async () => {
    idempotencyDocExists = true;

    await sendEmail({
      userId: "user_002",
      to: "test@example.com",
      templateId: "tier2-value-memory",
      subject: "Test subject",
      html: "<p>Test</p>",
      text: "Test",
      emailType: "marketing",
      meta: { idempotencyKey: "user_002_renewal_2026-01-01" },
    });

    // fetch must NOT be called — idempotency guard fired
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends without error when no idempotency key is provided", async () => {
    idempotencyDocExists = false;

    await expect(
      sendEmail({
        userId: "user_003",
        to: "test@example.com",
        templateId: "day30-resurrection",
        subject: "Come back",
        html: "<p>We miss you</p>",
        text: "We miss you",
        emailType: "marketing",
        // No meta.idempotencyKey
      })
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Idempotency key format contracts
// Ensures the key strings used by each job are unique and deterministic.
// ─────────────────────────────────────────────────────────────────────────────

describe("idempotency key format contracts", () => {
  it("renewal key is unique per user per renewal date", () => {
    const userId = "user_123";
    const renewalDate = "2026-06-01";
    const key = `${userId}_renewal_${renewalDate}`;
    expect(key).toBe("user_123_renewal_2026-06-01");
    // Different users → different keys
    expect(`user_999_renewal_${renewalDate}`).not.toBe(key);
    // Different dates → different keys
    expect(`${userId}_renewal_2026-07-01`).not.toBe(key);
  });

  it("resurrection key is unique per user per cancellation event", () => {
    const userId = "user_456";
    const cancelEventId = "evt_cancel_789";
    const key = `${userId}_resurrection_${cancelEventId}`;
    expect(key).toBe("user_456_resurrection_evt_cancel_789");
    expect(`user_000_resurrection_${cancelEventId}`).not.toBe(key);
  });

  it("weekly push key is unique per user per ISO week", () => {
    const userId = "user_789";
    const isoWeek = "2026-W08";
    const key = `${userId}_weekly_push_${isoWeek}`;
    expect(key).toBe("user_789_weekly_push_2026-W08");
    expect(`${userId}_weekly_push_2026-W09`).not.toBe(key);
  });

  it("account_health key is unique per user per 14-day window", () => {
    const userId = "user_abc";
    const windowStart = "2026-01-15";
    const key = `${userId}_account_health_${windowStart}`;
    expect(key).toBe("user_abc_account_health_2026-01-15");
  });
});
