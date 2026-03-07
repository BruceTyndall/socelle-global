/**
 * useScorm — SCORM package management + runtime tracking
 * Data source: scorm_packages + scorm_tracking tables (LIVE)
 * Communicates with scorm-runtime edge function for LMS data persistence
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { useAuth } from './auth';

/* ── Types ─────────────────────────────────────────────────────────── */

export interface ScormPackage {
  id: string;
  course_id: string;
  title: string;
  scorm_version: 'scorm_12' | 'scorm_2004';
  package_url: string;
  entry_point: string;
  manifest_data: Record<string, unknown> | null;
  uploaded_at: string;
}

export interface ScormTracking {
  id: string;
  user_id: string;
  scorm_package_id: string;
  lesson_status: string | null;
  completion_status: string | null;
  score_raw: number | null;
  score_scaled: number | null;
  suspend_data: string | null;
  lesson_location: string | null;
  total_time: string | null;
  session_time: string | null;
  tracking_data: Record<string, string>;
  updated_at: string;
}

/* ── useScormPackage — load a single SCORM package ─────────────────── */

export function useScormPackage(packageId: string | undefined) {
  const [pkg, setPkg] = useState<ScormPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!packageId) { setLoading(false); return; }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      if (!isSupabaseConfigured) { setPkg(null); setIsLive(false); setLoading(false); return; }

      try {
        const { data, error: fetchError } = await supabase
          .from('scorm_packages')
          .select('*')
          .eq('id', packageId)
          .single();

        if (cancelled) return;
        if (fetchError) { setError(fetchError.message); setIsLive(false); }
        else { setPkg(data as ScormPackage); setIsLive(true); }
      } catch (err) {
        if (!cancelled) { setError(err instanceof Error ? err.message : 'Failed to load SCORM package'); setIsLive(false); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [packageId]);

  return { pkg, loading, error, isLive };
}

/* ── useScormRuntime — SCORM 1.2 + 2004 API bridge ────────────────── */

interface ScormRuntimeOptions {
  scormPackageId: string | undefined;
  enrollmentId: string | undefined;
  scormVersion: 'scorm_12' | 'scorm_2004';
  onComplete?: () => void;
}

export function useScormRuntime(options: ScormRuntimeOptions) {
  const { scormPackageId, enrollmentId, scormVersion, onComplete } = options;
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trackingRef = useRef<Record<string, string>>({});
  const dirtyRef = useRef(false);
  const commitTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Load existing tracking data on mount
  useEffect(() => {
    if (!scormPackageId || !user?.id || !isSupabaseConfigured) return;

    async function loadTracking() {
      try {
        const { data } = await supabase
          .from('scorm_tracking')
          .select('*')
          .eq('scorm_package_id', scormPackageId)
          .eq('user_id', user!.id)
          .maybeSingle();

        if (data) {
          const t = data as ScormTracking;
          trackingRef.current = {
            ...(t.tracking_data || {}),
            ...(t.lesson_status ? { 'cmi.core.lesson_status': t.lesson_status } : {}),
            ...(t.completion_status ? { 'cmi.completion_status': t.completion_status } : {}),
            ...(t.score_raw !== null ? { 'cmi.core.score.raw': String(t.score_raw) } : {}),
            ...(t.score_scaled !== null ? { 'cmi.score.scaled': String(t.score_scaled) } : {}),
            ...(t.suspend_data ? { 'cmi.suspend_data': t.suspend_data } : {}),
            ...(t.lesson_location ? { 'cmi.core.lesson_location': t.lesson_location } : {}),
            ...(t.total_time ? { 'cmi.core.total_time': t.total_time } : {}),
          };
        }
      } catch {
        // Non-fatal — start fresh
      }
    }

    loadTracking();
  }, [scormPackageId, user?.id]);

  // Commit tracking data to edge function
  const commitData = useCallback(async () => {
    if (!dirtyRef.current || !scormPackageId || !user?.id || !isSupabaseConfigured) return;

    dirtyRef.current = false;

    try {
      await supabase.functions.invoke('scorm-runtime', {
        body: {
          action: 'commit',
          scorm_package_id: scormPackageId,
          user_id: user.id,
          enrollment_id: enrollmentId,
          tracking_data: trackingRef.current,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync SCORM data');
      dirtyRef.current = true; // Retry next cycle
    }
  }, [scormPackageId, user?.id, enrollmentId]);

  // Auto-commit every 30s
  useEffect(() => {
    commitTimerRef.current = setInterval(commitData, 30_000);
    return () => {
      if (commitTimerRef.current) clearInterval(commitTimerRef.current);
      commitData(); // Final commit on unmount
    };
  }, [commitData]);

  // Build SCORM API objects
  const buildScorm12Api = useCallback(() => {
    const errorCode = '0';
    return {
      LMSInitialize: (): string => { setInitialized(true); return 'true'; },
      LMSFinish: (): string => {
        commitData();
        const status = trackingRef.current['cmi.core.lesson_status'];
        if (status === 'completed' || status === 'passed') onComplete?.();
        return 'true';
      },
      LMSGetValue: (key: string): string => trackingRef.current[key] ?? '',
      LMSSetValue: (key: string, value: string): string => {
        trackingRef.current[key] = value;
        dirtyRef.current = true;
        return 'true';
      },
      LMSCommit: (): string => { commitData(); return 'true'; },
      LMSGetLastError: (): string => errorCode,
      LMSGetErrorString: (): string => '',
      LMSGetDiagnostic: (): string => '',
    };
  }, [commitData, onComplete]);

  const buildScorm2004Api = useCallback(() => {
    const errorCode = 0;
    return {
      Initialize: (): string => { setInitialized(true); return 'true'; },
      Terminate: (): string => {
        commitData();
        const status = trackingRef.current['cmi.completion_status'];
        if (status === 'completed') onComplete?.();
        return 'true';
      },
      GetValue: (key: string): string => trackingRef.current[key] ?? '',
      SetValue: (key: string, value: string): string => {
        trackingRef.current[key] = value;
        dirtyRef.current = true;
        return 'true';
      },
      Commit: (): string => { commitData(); return 'true'; },
      GetLastError: (): number => errorCode,
      GetErrorString: (): string => '',
      GetDiagnostic: (): string => '',
    };
  }, [commitData, onComplete]);

  // Inject APIs into iframe
  const injectApis = useCallback((iframeWindow: Window) => {
    try {
      if (scormVersion === 'scorm_12' || scormVersion === 'scorm_2004') {
        // Inject both for maximum compatibility
        (iframeWindow as unknown as Record<string, unknown>).API = buildScorm12Api();
        (iframeWindow as unknown as Record<string, unknown>).API_1484_11 = buildScorm2004Api();
      }
    } catch (err) {
      setError('Failed to inject SCORM API into iframe');
      console.error(err);
    }
  }, [scormVersion, buildScorm12Api, buildScorm2004Api]);

  return { initialized, error, injectApis, commitData };
}
