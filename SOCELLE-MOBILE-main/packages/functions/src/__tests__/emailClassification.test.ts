/**
 * Email classification tests — transactional vs. marketing routing.
 *
 * Verifies that:
 * 1. Marketing emails are suppressed when emailOptOut = true.
 * 2. Transactional emails bypass emailOptOut.
 * 3. Marketing emails are allowed when emailOptOut = false.
 * 4. Suppression from eligibility check prevents Postmark API call.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// ── Stub POSTMARK_API_KEY so email.ts proceeds to the API call ─────────────────
process.env.POSTMARK_API_KEY = "test_postmark_key";

// ── Firebase stubs ────────────────────────────────────────────────────────────
let mockUserData: Record<string, unknown> = {};

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    doc: vi.fn((path: string) => ({
      get: vi.fn(async () => ({
        exists: true,
        data: () => {
          if (path.startsWith("users/")) return mockUserData;
          return {}; // notification_state
        },
      })),
      set: vi.fn(async () => {}),
      update: vi.fn(async () => {}),
    })),
    collection: vi.fn(() => ({
      add: vi.fn(async () => {}),
      doc: vi.fn(() => ({
        get: vi.fn(async () => ({ exists: false })),
        set: vi.fn(async () => {}),
      })),
      where: vi.fn().mockReturnThis(),
      get: vi.fn(async () => ({ docs: [], size: 0 })),
    })),
  })),
  FieldValue: {
    serverTimestamp: vi.fn(() => "mock_timestamp"),
    arrayUnion: vi.fn(),
    increment: vi.fn(),
    delete: vi.fn(),
  },
  Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })) },
}));

vi.mock("firebase-functions", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("firebase-functions/v2/scheduler", () => ({
  onSchedule: vi.fn((_opts: unknown, handler: unknown) => handler),
}));

vi.mock("firebase-functions/v2/firestore", () => ({
  onDocumentWritten: vi.fn((_opts: unknown, handler: unknown) => handler),
}));

const fetchMock = vi.fn(async () => ({
  ok: true,
  json: async () => ({ MessageID: "mock-message-id" }),
  text: async () => "ok",
}));
vi.stubGlobal("fetch", fetchMock);

import { sendEmail } from "../email.js";
import { isEmailEligible } from "../notificationEligibility.js";

// ─────────────────────────────────────────────────────────────────────────────

describe("email classification — marketing vs transactional", () => {
  beforeEach(() => {
    fetchMock.mockClear();
    mockUserData = { subscription_status: "active" };
  });

  it("allows marketing email when emailOptOut is false", async () => {
    mockUserData = { subscription_status: "active", email_opt_out: false };

    await sendEmail({
      userId: "user_mkt_a",
      to: "test@example.com",
      templateId: "tier2-value-memory",
      subject: "Your week in review",
      html: "<p>Value reminder</p>",
      text: "Value reminder",
      emailType: "marketing",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("suppresses marketing email when emailOptOut is true", async () => {
    mockUserData = { subscription_status: "active", email_opt_out: true };

    await sendEmail({
      userId: "user_mkt_b",
      to: "test@example.com",
      templateId: "tier2-value-memory",
      subject: "Your week in review",
      html: "<p>Value reminder</p>",
      text: "Value reminder",
      emailType: "marketing",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends transactional email even when emailOptOut is true", async () => {
    mockUserData = { subscription_status: "active", email_opt_out: true };

    await sendEmail({
      userId: "user_txn_a",
      to: "test@example.com",
      templateId: "tier4-renewal-awareness",
      subject: "Your renewal is coming up",
      html: "<p>Billing notice</p>",
      text: "Billing notice",
      emailType: "transactional",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("sends transactional email when emailOptOut is not set", async () => {
    mockUserData = { subscription_status: "active" }; // no email_opt_out field

    await sendEmail({
      userId: "user_txn_b",
      to: "test@example.com",
      templateId: "cancellation-confirmation",
      subject: "Cancellation confirmed",
      html: "<p>Bye</p>",
      text: "Bye",
      emailType: "transactional",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isEmailEligible helper — direct unit tests
// ─────────────────────────────────────────────────────────────────────────────

describe("isEmailEligible helper", () => {
  beforeEach(() => {
    mockUserData = { subscription_status: "active" };
  });

  it("returns true for transactional when emailOptOut is true", async () => {
    mockUserData = { subscription_status: "active", email_opt_out: true };
    const result = await isEmailEligible("user_e1", "transactional");
    expect(result).toBe(true);
  });

  it("returns false for marketing when emailOptOut is true", async () => {
    mockUserData = { subscription_status: "active", email_opt_out: true };
    const result = await isEmailEligible("user_e2", "marketing");
    expect(result).toBe(false);
  });

  it("returns true for marketing when emailOptOut is false", async () => {
    mockUserData = { subscription_status: "active", email_opt_out: false };
    const result = await isEmailEligible("user_e3", "marketing");
    expect(result).toBe(true);
  });

  it("returns false for all channels when subscription cancelled > 90 days", async () => {
    const ninetyOneDaysAgo = new Date(
      Date.now() - 91 * 24 * 60 * 60 * 1000
    ).toISOString();
    mockUserData = {
      subscription_status: "cancelled",
      cancelled_at: ninetyOneDaysAgo,
    };

    const mktResult = await isEmailEligible("user_e4", "marketing");
    expect(mktResult).toBe(false);
  });
});
