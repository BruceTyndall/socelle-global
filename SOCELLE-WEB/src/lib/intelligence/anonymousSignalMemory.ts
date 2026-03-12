import { isSupabaseConfigured, supabase } from '../supabase';
import type { UserTagPreference } from './personalization';

const ANON_TAG_SCORES_KEY = 'socelle.intelligence.anon_tag_scores.v1';
const ANON_SIGNAL_ENGAGEMENTS_KEY = 'socelle.intelligence.anon_signal_engagements.v1';
export const ANON_SIGNAL_MEMORY_EVENT = 'socelle:intelligence-anon-memory-updated';

export interface AnonymousSignalEngagement {
  signal_id: string;
  is_saved: boolean;
  is_liked: boolean;
  saved_at: string | null;
  liked_at: string | null;
  updated_at: string;
}

type TagScoreMap = Record<string, number>;
type SignalEngagementMap = Record<string, AnonymousSignalEngagement>;

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function clampScore(value: number): number {
  return Math.max(-25, Math.min(100, value));
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!hasWindow()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota/storage errors so feed interactions never hard-fail.
  }
}

function emitMemoryChange(): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(ANON_SIGNAL_MEMORY_EVENT));
}

function isRecoverableSyncError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message.includes('42P01') ||
    message.includes('42703') ||
    message.includes('42883') ||
    message.includes('PGRST202') ||
    message.toLowerCase().includes('does not exist') ||
    message.toLowerCase().includes('not found')
  );
}

export function getAnonymousTagScoreMap(): TagScoreMap {
  return readJson<TagScoreMap>(ANON_TAG_SCORES_KEY, {});
}

export function getAnonymousPreferenceRows(): UserTagPreference[] {
  return Object.entries(getAnonymousTagScoreMap()).map(([tag_code, score]) => ({
    tag_code,
    score,
  }));
}

export function applyAnonymousPreferenceDelta(tagCodes: string[], delta: number): number {
  if (!hasWindow() || tagCodes.length === 0 || !Number.isFinite(delta)) return 0;

  const existing = getAnonymousTagScoreMap();
  let writes = 0;

  for (const tagCode of tagCodes) {
    const normalized = tagCode.trim();
    if (!normalized) continue;
    existing[normalized] = clampScore((existing[normalized] ?? 0) + delta);
    writes += 1;
  }

  if (writes > 0) {
    writeJson(ANON_TAG_SCORES_KEY, existing);
    emitMemoryChange();
  }

  return writes;
}

export function clearAnonymousPreferenceScores(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(ANON_TAG_SCORES_KEY);
  emitMemoryChange();
}

export function getAnonymousSignalEngagementMap(): SignalEngagementMap {
  return readJson<SignalEngagementMap>(ANON_SIGNAL_ENGAGEMENTS_KEY, {});
}

export function listAnonymousSignalEngagements(): AnonymousSignalEngagement[] {
  return Object.values(getAnonymousSignalEngagementMap())
    .filter((entry) => entry.is_saved || entry.is_liked)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function getAnonymousSignalEngagement(signalId: string | null | undefined): AnonymousSignalEngagement | null {
  if (!signalId) return null;
  return getAnonymousSignalEngagementMap()[signalId] ?? null;
}

export function upsertAnonymousSignalEngagement(
  signalId: string,
  updates: Partial<Omit<AnonymousSignalEngagement, 'signal_id' | 'updated_at'>>,
): AnonymousSignalEngagement | null {
  if (!hasWindow() || !signalId) return null;

  const current = getAnonymousSignalEngagementMap();
  const existing = current[signalId];
  const next: AnonymousSignalEngagement = {
    signal_id: signalId,
    is_saved: updates.is_saved ?? existing?.is_saved ?? false,
    is_liked: updates.is_liked ?? existing?.is_liked ?? false,
    saved_at: updates.saved_at ?? existing?.saved_at ?? null,
    liked_at: updates.liked_at ?? existing?.liked_at ?? null,
    updated_at: new Date().toISOString(),
  };

  if (!next.is_saved && !next.is_liked) {
    delete current[signalId];
    writeJson(ANON_SIGNAL_ENGAGEMENTS_KEY, current);
    emitMemoryChange();
    return null;
  }

  current[signalId] = next;
  writeJson(ANON_SIGNAL_ENGAGEMENTS_KEY, current);
  emitMemoryChange();
  return next;
}

export function clearAnonymousSignalEngagements(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(ANON_SIGNAL_ENGAGEMENTS_KEY);
  emitMemoryChange();
}

export function clearAnonymousSignalMemory(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(ANON_TAG_SCORES_KEY);
  window.localStorage.removeItem(ANON_SIGNAL_ENGAGEMENTS_KEY);
  emitMemoryChange();
}

export async function syncAnonymousSignalMemoryToUser(userId: string): Promise<{
  mergedPreferenceCount: number;
  mergedEngagementCount: number;
}> {
  if (!isSupabaseConfigured || !userId) {
    return { mergedPreferenceCount: 0, mergedEngagementCount: 0 };
  }

  const tagScores = getAnonymousTagScoreMap();
  const engagements = listAnonymousSignalEngagements();
  let mergedPreferenceCount = 0;
  let mergedEngagementCount = 0;

  if (Object.keys(tagScores).length > 0) {
    try {
      const { data, error } = await supabase.rpc('merge_user_tag_preference_scores' as any, {
        p_user_id: userId,
        p_scores: tagScores,
        p_source: 'behavior',
        p_event_at: new Date().toISOString(),
      });

      if (error) throw error;
      mergedPreferenceCount = typeof data === 'number' ? data : Number(data ?? 0);
      clearAnonymousPreferenceScores();
    } catch (error) {
      if (!isRecoverableSyncError(error)) {
        throw error;
      }
    }
  }

  if (engagements.length > 0) {
    try {
      const payload = engagements.map((entry) => ({
        signal_id: entry.signal_id,
        is_saved: entry.is_saved,
        is_liked: entry.is_liked,
        saved_at: entry.saved_at,
        liked_at: entry.liked_at,
      }));

      const { data, error } = await supabase.rpc('merge_user_signal_engagements' as any, {
        p_user_id: userId,
        p_engagements: payload,
      });

      if (error) throw error;
      mergedEngagementCount = typeof data === 'number' ? data : Number(data ?? 0);
      clearAnonymousSignalEngagements();
    } catch (error) {
      if (!isRecoverableSyncError(error)) {
        throw error;
      }
    }
  }

  return { mergedPreferenceCount, mergedEngagementCount };
}
