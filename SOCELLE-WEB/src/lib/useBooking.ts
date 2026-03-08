import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── Booking Hook: services, staff, schedules, appointments ──────────────
// Data source: booking_services, booking_staff, booking_schedules, appointments (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

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

// ── Helper ──────────────────────────────────────────────────────────────

function mapAppointmentRow(row: Record<string, unknown>): Appointment {
  const svc = row.booking_services as { name?: string } | null;
  const st = row.booking_staff as { first_name?: string; last_name?: string } | null;
  return {
    ...(row as unknown as Appointment),
    service_name: svc?.name,
    staff_first_name: st?.first_name,
    staff_last_name: st?.last_name,
  };
}

// ── Services ────────────────────────────────────────────────────────────

export function useBookingServices(businessId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['booking_services', businessId];

  const { data: services = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_services')
        .select('*')
        .eq('business_id', businessId!)
        .order('name');
      if (error) throw new Error(error.message);
      return (data ?? []) as BookingService[];
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (svc: NewService) => {
      const { data, error } = await supabase.from('booking_services').insert(svc).select().single();
      if (error) throw new Error(error.message);
      return data as BookingService;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewService> }) => {
      const { error } = await supabase.from('booking_services').update(updates).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('booking_services').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createService = async (svc: NewService) => createMut.mutateAsync(svc);
  const updateService = async (id: string, updates: Partial<NewService>) => updateMut.mutateAsync({ id, updates });
  const deleteService = async (id: string) => deleteMut.mutateAsync(id);
  const isLive = services.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { services, loading, error, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), createService, updateService, deleteService };
}

// ── Service Addons ──────────────────────────────────────────────────────

export function useServiceAddons(serviceId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['booking_service_addons', serviceId];

  const { data: addons = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_service_addons')
        .select('*')
        .eq('service_id', serviceId!)
        .order('name');
      if (error) throw error;
      return (data ?? []) as BookingServiceAddon[];
    },
    enabled: !!serviceId,
  });

  const createMut = useMutation({
    mutationFn: async (addon: NewAddon) => {
      const { error } = await supabase.from('booking_service_addons').insert(addon);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('booking_service_addons').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createAddon = async (addon: NewAddon) => createMut.mutateAsync(addon);
  const deleteAddon = async (id: string) => deleteMut.mutateAsync(id);
  const isLive = addons.length > 0;

  return { addons, loading, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), createAddon, deleteAddon };
}

// ── Staff ───────────────────────────────────────────────────────────────

export function useBookingStaff(businessId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['booking_staff', businessId];

  const { data: staff = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_staff')
        .select('*')
        .eq('business_id', businessId!)
        .order('last_name');
      if (error) throw new Error(error.message);
      return (data ?? []) as BookingStaff[];
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (s: NewStaff) => {
      const { data, error } = await supabase.from('booking_staff').insert(s).select().single();
      if (error) throw new Error(error.message);
      return data as BookingStaff;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewStaff> }) => {
      const { error } = await supabase.from('booking_staff').update(updates).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('booking_staff').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createStaff = async (s: NewStaff) => createMut.mutateAsync(s);
  const updateStaff = async (id: string, updates: Partial<NewStaff>) => updateMut.mutateAsync({ id, updates });
  const deleteStaff = async (id: string) => deleteMut.mutateAsync(id);
  const isLive = staff.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { staff, loading, error, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), createStaff, updateStaff, deleteStaff };
}

// ── Staff Schedules ─────────────────────────────────────────────────────

export function useStaffSchedules(staffId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['staff_schedules', staffId];

  const { data, isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      const [schedRes, toRes] = await Promise.all([
        supabase.from('booking_schedules').select('*').eq('staff_id', staffId!).order('day_of_week'),
        supabase.from('booking_time_off').select('*').eq('staff_id', staffId!).order('start_date', { ascending: false }),
      ]);
      if (schedRes.error) throw new Error(schedRes.error.message);
      return {
        schedules: (schedRes.data ?? []) as BookingSchedule[],
        timeOff: ((toRes.data ?? []) as BookingTimeOff[]),
      };
    },
    enabled: !!staffId,
  });

  const upsertMut = useMutation({
    mutationFn: async (sched: Omit<BookingSchedule, 'id' | 'created_at'> & { id?: string }) => {
      const { error } = await supabase.from('booking_schedules').upsert(sched);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const addTimeOffMut = useMutation({
    mutationFn: async (to: { staff_id: string; start_date: string; end_date: string; reason?: string }) => {
      const { error } = await supabase.from('booking_time_off').insert(to);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteTimeOffMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('booking_time_off').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const schedules = data?.schedules ?? [];
  const timeOff = data?.timeOff ?? [];
  const isLive = schedules.length > 0;
  const upsertSchedule = async (sched: Omit<BookingSchedule, 'id' | 'created_at'> & { id?: string }) => upsertMut.mutateAsync(sched);
  const addTimeOff = async (to: { staff_id: string; start_date: string; end_date: string; reason?: string }) => addTimeOffMut.mutateAsync(to);
  const deleteTimeOff = async (id: string) => deleteTimeOffMut.mutateAsync(id);

  return { schedules, timeOff, loading, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), upsertSchedule, addTimeOff, deleteTimeOff };
}

// ── Staff Services ──────────────────────────────────────────────────────

export function useStaffServices(staffId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['booking_staff_services', staffId];

  const { data: serviceIds = [], isLoading: loading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_staff_services')
        .select('service_id')
        .eq('staff_id', staffId!);
      if (error) throw error;
      return (data ?? []).map((r: { service_id: string }) => r.service_id);
    },
    enabled: !!staffId,
  });

  const assignMut = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!staffId) throw new Error('No staff ID');
      const { error } = await supabase.from('booking_staff_services').insert({ staff_id: staffId, service_id: serviceId });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const unassignMut = useMutation({
    mutationFn: async (serviceId: string) => {
      if (!staffId) throw new Error('No staff ID');
      const { error } = await supabase.from('booking_staff_services').delete().eq('staff_id', staffId).eq('service_id', serviceId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const assignService = async (serviceId: string) => assignMut.mutateAsync(serviceId);
  const unassignService = async (serviceId: string) => unassignMut.mutateAsync(serviceId);
  const isLive = serviceIds.length > 0;

  return { serviceIds, loading, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), assignService, unassignService };
}

// ── Appointments ────────────────────────────────────────────────────────

export function useAppointments(businessId?: string | null, dateRange?: { start: string; end: string }) {
  const queryClient = useQueryClient();
  const queryKey = ['appointments', businessId, dateRange?.start, dateRange?.end];

  const { data: appointments = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select('*, booking_services(name), booking_staff(first_name, last_name)')
        .eq('business_id', businessId!)
        .order('start_time', { ascending: true });
      if (dateRange) {
        query = query.gte('start_time', dateRange.start).lte('start_time', dateRange.end);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []).map((row: Record<string, unknown>) => mapAppointmentRow(row));
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (appt: NewAppointment) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...appt, status: 'scheduled' })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Appointment;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'cancelled' && reason) updates.cancellation_reason = reason;
      if (status === 'no_show') updates.no_show = true;
      const { error } = await supabase.from('appointments').update(updates).eq('id', id);
      if (error) throw new Error(error.message);
      await supabase.from('appointment_history').insert({
        appointment_id: id,
        action: status,
        notes: reason ?? null,
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createAppointment = async (appt: NewAppointment) => createMut.mutateAsync(appt);
  const updateAppointmentStatus = async (id: string, status: string, reason?: string) => updateStatusMut.mutateAsync({ id, status, reason });
  const isLive = appointments.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { appointments, loading, error, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), createAppointment, updateAppointmentStatus };
}

export function useAppointmentDetail(appointmentId?: string) {
  const { data: appointment = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['appointment_detail', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, booking_services(name), booking_staff(first_name, last_name)')
        .eq('id', appointmentId!)
        .single();
      if (error) throw new Error(error.message);
      return mapAppointmentRow(data as Record<string, unknown>);
    },
    enabled: !!appointmentId,
  });

  const isLive = !!appointment;
  const error = queryError instanceof Error ? queryError.message : null;

  return { appointment, loading, error, isLive, reload: () => {} };
}

// ── Public booking (no auth) ────────────────────────────────────────────

export function usePublicBookingServices(businessSlug?: string) {
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['public_booking_services', businessSlug],
    queryFn: async () => {
      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('slug', businessSlug!)
        .single();
      if (bizErr) throw new Error(bizErr.message);

      const { data: svcData, error: svcErr } = await supabase
        .from('booking_services')
        .select('*')
        .eq('business_id', biz.id)
        .eq('is_active', true)
        .order('name');
      if (svcErr) throw new Error(svcErr.message);

      return {
        services: (svcData ?? []) as BookingService[],
        businessId: biz.id as string,
        businessName: biz.name as string,
      };
    },
    enabled: !!businessSlug,
  });

  const services = data?.services ?? [];
  const businessId = data?.businessId ?? null;
  const businessName = data?.businessName ?? '';
  const error = queryError instanceof Error ? queryError.message : null;

  return { services, businessId, businessName, loading, error };
}

export function usePublicBookingStaff(businessId?: string | null, serviceId?: string) {
  const { data: staff = [], isLoading: loading } = useQuery({
    queryKey: ['public_booking_staff', businessId, serviceId],
    queryFn: async () => {
      let staffIds: string[] | null = null;

      if (serviceId) {
        const { data: links } = await supabase
          .from('booking_staff_services')
          .select('staff_id')
          .eq('service_id', serviceId);
        staffIds = (links ?? []).map((l: { staff_id: string }) => l.staff_id);
      }

      let query = supabase
        .from('booking_staff')
        .select('*')
        .eq('business_id', businessId!)
        .eq('is_active', true)
        .order('last_name');

      if (staffIds && staffIds.length > 0) {
        query = query.in('id', staffIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as BookingStaff[];
    },
    enabled: !!businessId,
  });

  return { staff, loading };
}
