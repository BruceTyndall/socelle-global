import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── Booking Hook: services, staff, schedules, appointments ──────────────
// Data source: booking_services, booking_staff, booking_schedules, appointments (LIVE when DB-connected)

export interface BookingService {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
  requires_consultation: boolean;
  max_per_day: number | null;
  buffer_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface BookingServiceAddon {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface BookingStaff {
  id: string;
  business_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingSchedule {
  id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface BookingTimeOff {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  service_id: string;
  staff_id: string | null;
  contact_id: string | null;
  client_first_name: string;
  client_last_name: string;
  client_email: string | null;
  client_phone: string | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  cancellation_reason: string | null;
  no_show: boolean;
  created_at: string;
  updated_at: string;
  // joined fields
  service_name?: string;
  staff_first_name?: string;
  staff_last_name?: string;
}

export interface NewAppointment {
  business_id: string;
  service_id: string;
  staff_id?: string;
  contact_id?: string;
  client_first_name: string;
  client_last_name: string;
  client_email?: string;
  client_phone?: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface NewService {
  business_id: string;
  name: string;
  description?: string;
  category?: string;
  duration_minutes: number;
  price: number;
  currency?: string;
  is_active?: boolean;
  requires_consultation?: boolean;
  max_per_day?: number;
  buffer_minutes?: number;
}

export interface NewAddon {
  service_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active?: boolean;
}

export interface NewStaff {
  business_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  title?: string;
  avatar_url?: string;
  bio?: string;
  is_active?: boolean;
}

// ── Services ────────────────────────────────────────────────────────────

export function useBookingServices(businessId?: string | null) {
  const [services, setServices] = useState<BookingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('booking_services')
        .select('*')
        .eq('business_id', businessId)
        .order('name');
      if (dbErr) throw dbErr;
      setServices(data ?? []);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load services');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const createService = useCallback(async (svc: NewService) => {
    const { data, error: dbErr } = await supabase
      .from('booking_services')
      .insert(svc)
      .select()
      .single();
    if (dbErr) throw dbErr;
    await load();
    return data as BookingService;
  }, [load]);

  const updateService = useCallback(async (id: string, updates: Partial<NewService>) => {
    const { error: dbErr } = await supabase
      .from('booking_services')
      .update(updates)
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const deleteService = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('booking_services')
      .delete()
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { services, loading, error, isLive, reload: load, createService, updateService, deleteService };
}

// ── Service Addons ──────────────────────────────────────────────────────

export function useServiceAddons(serviceId?: string) {
  const [addons, setAddons] = useState<BookingServiceAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!serviceId) return;
    setLoading(true);
    try {
      const { data, error: dbErr } = await supabase
        .from('booking_service_addons')
        .select('*')
        .eq('service_id', serviceId)
        .order('name');
      if (dbErr) throw dbErr;
      setAddons(data ?? []);
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => { load(); }, [load]);

  const createAddon = useCallback(async (addon: NewAddon) => {
    const { error: dbErr } = await supabase
      .from('booking_service_addons')
      .insert(addon);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const deleteAddon = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('booking_service_addons')
      .delete()
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { addons, loading, isLive, reload: load, createAddon, deleteAddon };
}

// ── Staff ───────────────────────────────────────────────────────────────

export function useBookingStaff(businessId?: string | null) {
  const [staff, setStaff] = useState<BookingStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('booking_staff')
        .select('*')
        .eq('business_id', businessId)
        .order('last_name');
      if (dbErr) throw dbErr;
      setStaff(data ?? []);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load staff');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const createStaff = useCallback(async (s: NewStaff) => {
    const { data, error: dbErr } = await supabase
      .from('booking_staff')
      .insert(s)
      .select()
      .single();
    if (dbErr) throw dbErr;
    await load();
    return data as BookingStaff;
  }, [load]);

  const updateStaff = useCallback(async (id: string, updates: Partial<NewStaff>) => {
    const { error: dbErr } = await supabase
      .from('booking_staff')
      .update(updates)
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const deleteStaff = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('booking_staff')
      .delete()
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { staff, loading, error, isLive, reload: load, createStaff, updateStaff, deleteStaff };
}

// ── Staff Schedules ─────────────────────────────────────────────────────

export function useStaffSchedules(staffId?: string) {
  const [schedules, setSchedules] = useState<BookingSchedule[]>([]);
  const [timeOff, setTimeOff] = useState<BookingTimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const [schedRes, toRes] = await Promise.all([
        supabase.from('booking_schedules').select('*').eq('staff_id', staffId).order('day_of_week'),
        supabase.from('booking_time_off').select('*').eq('staff_id', staffId).order('start_date', { ascending: false }),
      ]);
      if (schedRes.error) throw schedRes.error;
      setSchedules(schedRes.data ?? []);
      setTimeOff((toRes.data ?? []) as BookingTimeOff[]);
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => { load(); }, [load]);

  const upsertSchedule = useCallback(async (sched: Omit<BookingSchedule, 'id' | 'created_at'> & { id?: string }) => {
    const { error: dbErr } = await supabase
      .from('booking_schedules')
      .upsert(sched);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const addTimeOff = useCallback(async (to: { staff_id: string; start_date: string; end_date: string; reason?: string }) => {
    const { error: dbErr } = await supabase
      .from('booking_time_off')
      .insert(to);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const deleteTimeOff = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('booking_time_off')
      .delete()
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { schedules, timeOff, loading, isLive, reload: load, upsertSchedule, addTimeOff, deleteTimeOff };
}

// ── Staff Services ──────────────────────────────────────────────────────

export function useStaffServices(staffId?: string) {
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const { data, error: dbErr } = await supabase
        .from('booking_staff_services')
        .select('service_id')
        .eq('staff_id', staffId);
      if (dbErr) throw dbErr;
      setServiceIds((data ?? []).map((r: { service_id: string }) => r.service_id));
      setIsLive(true);
    } catch {
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => { load(); }, [load]);

  const assignService = useCallback(async (serviceId: string) => {
    if (!staffId) return;
    const { error: dbErr } = await supabase
      .from('booking_staff_services')
      .insert({ staff_id: staffId, service_id: serviceId });
    if (dbErr) throw dbErr;
    await load();
  }, [staffId, load]);

  const unassignService = useCallback(async (serviceId: string) => {
    if (!staffId) return;
    const { error: dbErr } = await supabase
      .from('booking_staff_services')
      .delete()
      .eq('staff_id', staffId)
      .eq('service_id', serviceId);
    if (dbErr) throw dbErr;
    await load();
  }, [staffId, load]);

  return { serviceIds, loading, isLive, reload: load, assignService, unassignService };
}

// ── Appointments ────────────────────────────────────────────────────────

export function useAppointments(businessId?: string | null, dateRange?: { start: string; end: string }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('appointments')
        .select('*, booking_services(name), booking_staff(first_name, last_name)')
        .eq('business_id', businessId)
        .order('start_time', { ascending: true });
      if (dateRange) {
        query = query.gte('start_time', dateRange.start).lte('start_time', dateRange.end);
      }
      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;
      const mapped = (data ?? []).map((row: Record<string, unknown>) => {
        const svc = row.booking_services as { name?: string } | null;
        const st = row.booking_staff as { first_name?: string; last_name?: string } | null;
        return {
          ...(row as unknown as Appointment),
          service_name: svc?.name,
          staff_first_name: st?.first_name,
          staff_last_name: st?.last_name,
        };
      });
      setAppointments(mapped);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load appointments');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [businessId, dateRange?.start, dateRange?.end]);

  useEffect(() => { load(); }, [load]);

  const createAppointment = useCallback(async (appt: NewAppointment) => {
    const { data, error: dbErr } = await supabase
      .from('appointments')
      .insert({ ...appt, status: 'scheduled' })
      .select()
      .single();
    if (dbErr) throw dbErr;
    await load();
    return data as Appointment;
  }, [load]);

  const updateAppointmentStatus = useCallback(async (id: string, status: string, reason?: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'cancelled' && reason) updates.cancellation_reason = reason;
    if (status === 'no_show') updates.no_show = true;
    const { error: dbErr } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id);
    if (dbErr) throw dbErr;
    // Log to appointment_history
    await supabase.from('appointment_history').insert({
      appointment_id: id,
      action: status,
      notes: reason ?? null,
    });
    await load();
  }, [load]);

  return { appointments, loading, error, isLive, reload: load, createAppointment, updateAppointmentStatus };
}

export function useAppointmentDetail(appointmentId?: string) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('appointments')
        .select('*, booking_services(name), booking_staff(first_name, last_name)')
        .eq('id', appointmentId)
        .single();
      if (dbErr) throw dbErr;
      const row = data as Record<string, unknown>;
      const svc = row.booking_services as { name?: string } | null;
      const st = row.booking_staff as { first_name?: string; last_name?: string } | null;
      setAppointment({
        ...(row as unknown as Appointment),
        service_name: svc?.name,
        staff_first_name: st?.first_name,
        staff_last_name: st?.last_name,
      });
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load appointment');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => { load(); }, [load]);

  return { appointment, loading, error, isLive, reload: load };
}

// ── Public booking (no auth) ────────────────────────────────────────────

export function usePublicBookingServices(businessSlug?: string) {
  const [services, setServices] = useState<BookingService[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!businessSlug) return;
    setLoading(true);
    setError(null);
    try {
      // Look up business by slug
      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('slug', businessSlug)
        .single();
      if (bizErr) throw bizErr;
      setBusinessId(biz.id);
      setBusinessName(biz.name);
      const { data, error: svcErr } = await supabase
        .from('booking_services')
        .select('*')
        .eq('business_id', biz.id)
        .eq('is_active', true)
        .order('name');
      if (svcErr) throw svcErr;
      setServices(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load booking info');
    } finally {
      setLoading(false);
    }
  }, [businessSlug]);

  useEffect(() => { load(); }, [load]);

  return { services, businessId, businessName, loading, error };
}

export function usePublicBookingStaff(businessId?: string | null, serviceId?: string) {
  const [staff, setStaff] = useState<BookingStaff[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      let query = supabase
        .from('booking_staff')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('last_name');
      // If serviceId provided, filter by staff_services
      if (serviceId) {
        const { data: links } = await supabase
          .from('booking_staff_services')
          .select('staff_id')
          .eq('service_id', serviceId);
        const staffIds = (links ?? []).map((l: { staff_id: string }) => l.staff_id);
        if (staffIds.length > 0) {
          query = query.in('id', staffIds);
        }
      }
      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;
      setStaff(data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [businessId, serviceId]);

  useEffect(() => { load(); }, [load]);

  return { staff, loading };
}
