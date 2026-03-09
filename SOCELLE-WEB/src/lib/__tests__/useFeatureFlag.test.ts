import { describe, it, expect } from 'vitest';
import { evaluateFlag, hashUserIdToBucket } from '../useFeatureFlag';
import type { FeatureFlagRow } from '../useFeatureFlag';

// ── Helpers ───────────────────────────────────────────────────────────────

function makeFlag(overrides: Partial<FeatureFlagRow> = {}): FeatureFlagRow {
  return {
    id: 'test-id',
    flag_key: 'TEST_FLAG',
    display_name: 'Test Flag',
    description: 'A test flag',
    default_enabled: false,
    enabled_tiers: [],
    enabled_user_ids: [],
    rollout_percentage: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ── Tests ─────────────────────────────────────────────────────────────────

describe('evaluateFlag', () => {
  it('returns false when flag does not exist (null)', () => {
    const result = evaluateFlag(null, TEST_USER_ID, 'pro');
    expect(result).toBe(false);
  });

  it('returns default_enabled when no user/tier match', () => {
    const flagOff = makeFlag({ default_enabled: false });
    expect(evaluateFlag(flagOff, TEST_USER_ID, 'free')).toBe(false);

    const flagOn = makeFlag({ default_enabled: true });
    expect(evaluateFlag(flagOn, TEST_USER_ID, 'free')).toBe(true);
  });

  it('user override takes priority over everything', () => {
    const flag = makeFlag({
      default_enabled: false,
      enabled_tiers: [],
      rollout_percentage: 0,
      enabled_user_ids: [TEST_USER_ID],
    });
    expect(evaluateFlag(flag, TEST_USER_ID, 'free')).toBe(true);
  });

  it('tier match enables the flag', () => {
    const flag = makeFlag({
      default_enabled: false,
      enabled_tiers: ['pro', 'enterprise'],
    });
    expect(evaluateFlag(flag, TEST_USER_ID, 'pro')).toBe(true);
    expect(evaluateFlag(flag, TEST_USER_ID, 'starter')).toBe(false);
  });

  it('rollout percentage enables flag for users in bucket', () => {
    // 100% rollout should always enable
    const flag100 = makeFlag({ rollout_percentage: 100 });
    expect(evaluateFlag(flag100, TEST_USER_ID, 'free')).toBe(true);

    // 0% rollout should fall through to default
    const flag0 = makeFlag({ rollout_percentage: 0, default_enabled: false });
    expect(evaluateFlag(flag0, TEST_USER_ID, 'free')).toBe(false);
  });

  it('handles 42P01 gracefully (null flag returns false)', () => {
    // The 42P01 fallback in the hook returns null, which evaluateFlag handles
    expect(evaluateFlag(null, TEST_USER_ID, 'pro')).toBe(false);
    expect(evaluateFlag(null, null, 'free')).toBe(false);
  });
});

describe('hashUserIdToBucket', () => {
  it('returns a number between 0 and 99', () => {
    const bucket = hashUserIdToBucket(TEST_USER_ID);
    expect(bucket).toBeGreaterThanOrEqual(0);
    expect(bucket).toBeLessThan(100);
  });

  it('is deterministic (same input = same output)', () => {
    const a = hashUserIdToBucket(TEST_USER_ID);
    const b = hashUserIdToBucket(TEST_USER_ID);
    expect(a).toBe(b);
  });

  it('produces different buckets for different user IDs', () => {
    const id1 = '00000000-0000-0000-0000-000000000001';
    const id2 = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
    // They could theoretically collide, but these two specific UUIDs should differ
    const b1 = hashUserIdToBucket(id1);
    const b2 = hashUserIdToBucket(id2);
    expect(b1).not.toBe(b2);
  });
});
