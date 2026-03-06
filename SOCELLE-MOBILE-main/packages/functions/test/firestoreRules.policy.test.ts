import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const rulesPath = resolve(process.cwd(), "firestore.rules");
const rules = readFileSync(rulesPath, "utf8");

describe("firestore rules policy", () => {
  it("locks users collection to auth uid", () => {
    expect(rules).toContain("match /users/{uid}");
    expect(rules).toContain("request.auth.uid == uid");
  });

  it("enforces owner scoping in data collections", () => {
    expect(rules).toContain("match /gaps/{docId}");
    expect(rules).toContain("match /intentional_rules/{docId}");
    expect(rules).toContain("request.resource.data.user_id == request.auth.uid");
  });

  it("blocks direct client writes to weekly_reports", () => {
    expect(rules).toContain("match /weekly_reports/{docId}");
    expect(rules).toContain("allow write: if false");
  });
});
