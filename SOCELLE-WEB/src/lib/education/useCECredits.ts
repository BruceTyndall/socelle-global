/**
 * useCECredits — track CE credits earned, by category, with expiry warnings
 * Data source: certificates + course_enrollments + courses tables (LIVE)
 * TanStack Query v5.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

export interface CECreditEntry {
  id: string;
  course_id: string;
  course_title: string | null;
  category: string | null;
  ce_credits: number;
  earned_at: string;
  expires_at: string | null;
  certificate_id: string | null;
  verification_token: string | null;
}

export interface CECreditSummary {
  totalEarned: number;
  goal: number;
  byCategory: Record<string, number>;
  expiringSoon: CECreditEntry[];
  credits: CECreditEntry[];
  periodStart: string;
  periodEnd: string;
}

export function useCECredits() {
  const { user } = useAuth();

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['ce_credits', user?.id],
    queryFn: async () => {
      // Fetch completed enrollments with course CE info
      const { data: enrollments, error: enrollErr } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          course_id,
          completed_at,
          courses:course_id (
            title,
            category,
            ce_credits
          )
        `)
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (enrollErr) throw new Error(enrollErr.message);

      // Fetch certificates for verification tokens
      const { data: certs } = await supabase
        .from('certificates')
        .select('id, course_id, ce_credits, issued_at, verification_token')
        .eq('user_id', user!.id)
        .order('issued_at', { ascending: false });

      const certMap = new Map<string, { id: string; verification_token: string }>();
      if (certs) {
        for (const cert of certs as Array<{ id: string; course_id: string; verification_token: string }>) {
          certMap.set(cert.course_id, { id: cert.id, verification_token: cert.verification_token });
        }
      }

      // Build credit entries
      const credits: CECreditEntry[] = [];
      const rows = (enrollments ?? []) as Array<{
        id: string;
        course_id: string;
        completed_at: string | null;
        courses: { title: string | null; category: string | null; ce_credits: number | null } | null;
      }>;

      for (const row of rows) {
        const course = row.courses;
        if (!course?.ce_credits || course.ce_credits <= 0) continue;

        const cert = certMap.get(row.course_id);
        const earnedAt = row.completed_at ?? new Date().toISOString();
        // CE credits typically expire 2 years after earned
        const expiresAt = new Date(earnedAt);
        expiresAt.setFullYear(expiresAt.getFullYear() + 2);

        credits.push({
          id: row.id,
          course_id: row.course_id,
          course_title: course.title,
          category: course.category,
          ce_credits: course.ce_credits,
          earned_at: earnedAt,
          expires_at: expiresAt.toISOString(),
          certificate_id: cert?.id ?? null,
          verification_token: cert?.verification_token ?? null,
        });
      }

      return credits;
    },
    enabled: isSupabaseConfigured && !!user?.id,
  });

  const credits = data ?? [];

  const summary = useMemo<CECreditSummary>(() => {
    const now = new Date();
    // Period: current calendar year
    const periodStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), 11, 31).toISOString();

    // Filter credits in current period
    const periodCredits = credits.filter(c => {
      const earned = new Date(c.earned_at);
      return earned >= new Date(periodStart) && earned <= new Date(periodEnd);
    });

    const totalEarned = periodCredits.reduce((sum, c) => sum + c.ce_credits, 0);

    // Categorize
    const byCategory: Record<string, number> = {};
    for (const c of periodCredits) {
      const cat = c.category ?? 'uncategorized';
      byCategory[cat] = (byCategory[cat] ?? 0) + c.ce_credits;
    }

    // Expiring within 90 days
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const expiringSoon = credits.filter(c => {
      if (!c.expires_at) return false;
      const exp = new Date(c.expires_at);
      return exp <= ninetyDaysFromNow && exp >= now;
    });

    return {
      totalEarned,
      goal: 24, // Standard annual CE requirement
      byCategory,
      expiringSoon,
      credits: periodCredits,
      periodStart,
      periodEnd,
    };
  }, [credits]);

  const isLive = credits.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { summary, allCredits: credits, loading, error, isLive };
}
