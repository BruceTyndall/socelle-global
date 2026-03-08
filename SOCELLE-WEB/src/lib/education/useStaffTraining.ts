/**
 * useStaffTraining — operator staff training status, compliance gaps, expirations
 * Data source: profiles + course_enrollments + certificates + courses tables (LIVE)
 * TanStack Query v5.
 * For business owners to see team members' training status.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

export interface StaffMember {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
}

export interface StaffEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string | null;
  course_category: string | null;
  status: string;
  progress_pct: number;
  enrolled_at: string;
  completed_at: string | null;
  ce_credits: number | null;
}

export interface StaffCertificate {
  id: string;
  user_id: string;
  course_title: string | null;
  ce_credits: number | null;
  issued_at: string;
  expires_at: string | null;
}

export interface StaffTrainingProfile {
  member: StaffMember;
  enrollments: StaffEnrollment[];
  certificates: StaffCertificate[];
  totalCeCredits: number;
  completedCourses: number;
  inProgressCourses: number;
  complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
  nextExpiry: string | null;
}

export function useStaffTraining() {
  const { user } = useAuth();

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['staff_training', user?.id],
    queryFn: async () => {
      // Get the business the current user owns/manages
      const { data: bizData } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user!.id)
        .limit(1)
        .maybeSingle();

      if (!bizData) {
        // Fallback: check business_members
        const { data: memberData } = await supabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', user!.id)
          .eq('role', 'owner')
          .limit(1)
          .maybeSingle();

        if (!memberData) return { members: [], enrollments: [], certificates: [] };
        return fetchStaffData((memberData as { business_id: string }).business_id);
      }

      return fetchStaffData((bizData as { id: string }).id);
    },
    enabled: isSupabaseConfigured && !!user?.id,
  });

  return useMemo(() => {
    if (!data) {
      return { staffProfiles: [] as StaffTrainingProfile[], loading, error: queryError instanceof Error ? queryError.message : null, isLive: false };
    }

    const { members, enrollments, certificates } = data;
    const now = new Date();
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    const staffProfiles: StaffTrainingProfile[] = members.map((member: StaffMember) => {
      const memberEnrollments = enrollments.filter((e: StaffEnrollment) => e.user_id === member.id);
      const memberCerts = certificates.filter((c: StaffCertificate) => c.user_id === member.id);

      const completedCourses = memberEnrollments.filter((e: StaffEnrollment) => e.status === 'completed').length;
      const inProgressCourses = memberEnrollments.filter((e: StaffEnrollment) => e.status === 'active').length;
      const totalCeCredits = memberCerts.reduce((sum: number, c: StaffCertificate) => sum + (c.ce_credits ?? 0), 0);

      // Find next expiry
      const futureExpiries = memberCerts
        .filter((c: StaffCertificate) => c.expires_at && new Date(c.expires_at) > now)
        .sort((a: StaffCertificate, b: StaffCertificate) =>
          new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime()
        );
      const nextExpiry = futureExpiries.length > 0 ? futureExpiries[0].expires_at : null;

      // Compliance: 24 CE credits/year, at_risk if < 12, non_compliant if 0
      let complianceStatus: 'compliant' | 'at_risk' | 'non_compliant' = 'compliant';
      if (totalCeCredits === 0) complianceStatus = 'non_compliant';
      else if (totalCeCredits < 12) complianceStatus = 'at_risk';

      return {
        member,
        enrollments: memberEnrollments,
        certificates: memberCerts,
        totalCeCredits,
        completedCourses,
        inProgressCourses,
        complianceStatus,
        nextExpiry,
      };
    });

    return {
      staffProfiles,
      loading,
      error: queryError instanceof Error ? queryError.message : null,
      isLive: members.length > 0,
    };
  }, [data, loading, queryError]);
}

async function fetchStaffData(businessId: string) {
  // Get staff members
  const { data: membersRaw } = await supabase
    .from('business_members')
    .select('user_id, role')
    .eq('business_id', businessId);

  const userIds = (membersRaw ?? []).map((m: { user_id: string }) => m.user_id);
  if (userIds.length === 0) return { members: [], enrollments: [], certificates: [] };

  // Get profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, role')
    .in('id', userIds);

  const members: StaffMember[] = (profiles ?? []) as StaffMember[];

  // Get enrollments for all staff
  const { data: enrollmentsRaw } = await supabase
    .from('course_enrollments')
    .select(`
      id, user_id, course_id, status, progress_pct, enrolled_at, completed_at,
      courses:course_id (title, category, ce_credits)
    `)
    .in('user_id', userIds)
    .order('enrolled_at', { ascending: false });

  const enrollments: StaffEnrollment[] = ((enrollmentsRaw ?? []) as Array<{
    id: string;
    user_id: string;
    course_id: string;
    status: string;
    progress_pct: number;
    enrolled_at: string;
    completed_at: string | null;
    courses: { title: string | null; category: string | null; ce_credits: number | null } | null;
  }>).map(e => ({
    id: e.id,
    user_id: e.user_id,
    course_id: e.course_id,
    course_title: e.courses?.title ?? null,
    course_category: e.courses?.category ?? null,
    status: e.status,
    progress_pct: e.progress_pct,
    enrolled_at: e.enrolled_at,
    completed_at: e.completed_at,
    ce_credits: e.courses?.ce_credits ?? null,
  }));

  // Get certificates for all staff
  const { data: certsRaw } = await supabase
    .from('certificates')
    .select('id, user_id, course_title, ce_credits, issued_at')
    .in('user_id', userIds)
    .order('issued_at', { ascending: false });

  const certificates: StaffCertificate[] = ((certsRaw ?? []) as Array<{
    id: string;
    user_id: string;
    course_title: string | null;
    ce_credits: number | null;
    issued_at: string;
  }>).map(c => ({
    ...c,
    expires_at: (() => {
      const d = new Date(c.issued_at);
      d.setFullYear(d.getFullYear() + 2);
      return d.toISOString();
    })(),
  }));

  return { members, enrollments, certificates };
}
