import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { upsertBookingContact } from './crmContactLinking';
import { useAuth } from './auth';

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
  price_cents?: number;
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
  price_cents?: number;
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
  client_id?: string | null;
  client_first_name: string;
  client_last_name: string;
  client_email: string | null;
  client_phone: string | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  notes_client?: string | null;
  notes_internal?: string | null;
  price_cents?: number | null;
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

type AnyRow = Record<string, unknown>;

function normalizeErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return '';
  const message = (error as { message?: string }).message;
  return typeof message === 'string' ? message.toLowerCase() : '';
}

function isSchemaMismatch(error: unknown): boolean {
  const message = normalizeErrorMessage(error);
  return (
    message.includes('column') ||
    message.includes('relationship') ||
    message.includes('schema cache') ||
    message.includes('does not exist')
  );
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toPriceDollars(row: AnyRow): number {
  const price = row.price;
  if (typeof price === 'number' && Number.isFinite(price)) return price;
  const cents = row.price_cents;
  if (typeof cents === 'number' && Number.isFinite(cents)) return cents / 100;
  return 0;
}

function toPriceCents(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

function mapBookingServiceRow(row: AnyRow): BookingService {
  const price = toPriceDollars(row);
  const maxPerDay = row.max_per_day;
  const maxCapacity = row.max_capacity;
  return {
    id: asString(row.id),
    business_id: asString(row.business_id),
    name: asString(row.name),
    description: asNullableString(row.description),
    category: asNullableString(row.category),
    duration_minutes: asNumber(row.duration_minutes, 0),
    price,
    price_cents: typeof row.price_cents === 'number' ? row.price_cents : toPriceCents(price),
    currency: asString(row.currency, 'USD'),
    is_active: typeof row.is_active === 'boolean' ? row.is_active : true,
    requires_consultation:
      typeof row.requires_consultation === 'boolean'
        ? row.requires_consultation
        : typeof row.requires_patch_test === 'boolean'
          ? row.requires_patch_test
          : false,
    max_per_day:
      typeof maxPerDay === 'number'
        ? maxPerDay
        : typeof maxCapacity === 'number'
          ? maxCapacity
          : null,
    buffer_minutes: asNumber(row.buffer_minutes, 0),
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
  };
}

function mapServiceAddonRow(row: AnyRow): BookingServiceAddon {
  const price = toPriceDollars(row);
  return {
    id: asString(row.id),
    service_id: asString(row.service_id),
    name: asString(row.name),
    description: asNullableString(row.description),
    price,
    price_cents: typeof row.price_cents === 'number' ? row.price_cents : toPriceCents(price),
    duration_minutes: asNumber(row.duration_minutes, 0),
    is_active: typeof row.is_active === 'boolean' ? row.is_active : true,
    created_at: asString(row.created_at),
  };
}

async function fetchServicePriceCents(serviceId: string): Promise<number> {
  const first = await supabase
    .from('booking_services')
    .select('price_cents, price')
    .eq('id', serviceId)
    .maybeSingle();

  if (!first.error && first.data) {
    const row = first.data as AnyRow;
    const cents = row.price_cents;
    if (typeof cents === 'number') return cents;
    return toPriceCents(asNumber(row.price, 0));
  }

  if (first.error && !isSchemaMismatch(first.error)) {
    throw new Error(first.error.message);
  }

  const fallback = await supabase
    .from('booking_services')
    .select('price')
    .eq('id', serviceId)
    .maybeSingle();
  if (fallback.error) throw new Error(fallback.error.message);

  const fallbackRow = (fallback.data ?? {}) as AnyRow;
  return toPriceCents(asNumber(fallbackRow.price, 0));
}

async function runAppointmentAutomation(params: {
  userId: string | null;
  businessId: string;
  contactId: string | null;
  appointmentId: string;
  startTime: string;
  clientName: string;
}): Promise<void> {
  if (!params.userId) return;

  const followUpDueAt = new Date(new Date(params.startTime).getTime() + 24 * 60 * 60 * 1000);
  const followUpIso = followUpDueAt.toISOString();

  await Promise.allSettled([
    supabase.from('crm_tasks').insert({
      business_id: params.businessId,
      contact_id: params.contactId,
      title: `Follow up with ${params.clientName}`,
      description:
        'Automated booking follow-up task. Confirm visit outcomes, recommend next service, and schedule repeat booking.',
      due_date: followUpIso,
      priority: 'medium',
      status: 'open',
      assignee_id: params.userId,
    }),
    supabase.from('notifications').insert({
      user_id: params.userId,
      business_id: params.businessId,
      type: 'system',
      channel: 'in_app',
      title: `Appointment scheduled: ${params.clientName}`,
      body: `A follow-up task was created for ${new Date(followUpIso).toLocaleDateString()}.`,
      action_url: `/portal/booking/appointments/${params.appointmentId}`,
    }),
  ]);
}

function mapAppointmentRow(row: Record<string, unknown>): Appointment {
  const svc = row.booking_services as { name?: string } | null;
  const st = row.booking_staff as { first_name?: string; last_name?: string } | null;
  const contact = row.crm_contacts as
    | { first_name?: string; last_name?: string; email?: string; phone?: string }
    | null;
  const legacyNotes = asNullableString(row.notes);
  const notesClient = asNullableString(row.notes_client);
  const notesInternal = asNullableString(row.notes_internal);
  const status = asString(row.status, 'scheduled');
  return {
    ...(row as unknown as Appointment),
    id: asString(row.id),
    business_id: asString(row.business_id),
    service_id: asString(row.service_id),
    staff_id: asNullableString(row.staff_id),
    contact_id: asNullableString(row.contact_id) ?? asNullableString(row.client_id),
    client_id: asNullableString(row.client_id),
    client_first_name:
      asString(row.client_first_name) || asString(contact?.first_name, 'Client'),
    client_last_name:
      asString(row.client_last_name) || asString(contact?.last_name),
    client_email: asNullableString(row.client_email) ?? asNullableString(contact?.email),
    client_phone: asNullableString(row.client_phone) ?? asNullableString(contact?.phone),
    start_time: asString(row.start_time),
    end_time: asString(row.end_time),
    status,
    notes: legacyNotes ?? notesClient ?? notesInternal ?? null,
    notes_client: notesClient,
    notes_internal: notesInternal,
    price_cents:
      typeof row.price_cents === 'number'
        ? row.price_cents
        : null,
    cancellation_reason: asNullableString(row.cancellation_reason),
    no_show:
      typeof row.no_show === 'boolean'
        ? row.no_show
        : status === 'no_show',
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
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
      return ((data ?? []) as AnyRow[]).map(mapBookingServiceRow);
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (svc: NewService) => {
      const legacyInsert = await supabase
        .from('booking_services')
        .insert(svc)
        .select()
        .single();
      if (!legacyInsert.error && legacyInsert.data) {
        return mapBookingServiceRow(legacyInsert.data as AnyRow);
      }
      if (legacyInsert.error && !isSchemaMismatch(legacyInsert.error)) {
        throw new Error(legacyInsert.error.message);
      }

      const normalizedInsert = await supabase
        .from('booking_services')
        .insert({
          business_id: svc.business_id,
          name: svc.name,
          slug: slugify(svc.name),
          description: svc.description ?? null,
          category: svc.category ?? null,
          duration_minutes: svc.duration_minutes,
          buffer_minutes: svc.buffer_minutes ?? 0,
          price_cents: toPriceCents(svc.price),
          is_active: svc.is_active ?? true,
          requires_patch_test: svc.requires_consultation ?? false,
          max_capacity: svc.max_per_day ?? 1,
        })
        .select()
        .single();

      if (normalizedInsert.error) throw new Error(normalizedInsert.error.message);
      return mapBookingServiceRow(normalizedInsert.data as AnyRow);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewService> }) => {
      const legacyUpdate = await supabase.from('booking_services').update(updates).eq('id', id);
      if (!legacyUpdate.error) return;
      if (!isSchemaMismatch(legacyUpdate.error)) throw new Error(legacyUpdate.error.message);

      const normalizedUpdates: Record<string, unknown> = {
        name: updates.name,
        description: updates.description,
        category: updates.category,
        duration_minutes: updates.duration_minutes,
        buffer_minutes: updates.buffer_minutes,
        is_active: updates.is_active,
        requires_patch_test: updates.requires_consultation,
        max_capacity: updates.max_per_day,
      };
      if (typeof updates.price === 'number') {
        normalizedUpdates.price_cents = toPriceCents(updates.price);
      }

      const { error } = await supabase
        .from('booking_services')
        .update(normalizedUpdates)
        .eq('id', id);
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
      return ((data ?? []) as AnyRow[]).map(mapServiceAddonRow);
    },
    enabled: !!serviceId,
  });

  const createMut = useMutation({
    mutationFn: async (addon: NewAddon) => {
      const legacyInsert = await supabase.from('booking_service_addons').insert(addon);
      if (!legacyInsert.error) return;
      if (!isSchemaMismatch(legacyInsert.error)) throw new Error(legacyInsert.error.message);

      const { error } = await supabase.from('booking_service_addons').insert({
        service_id: addon.service_id,
        name: addon.name,
        duration_minutes: addon.duration_minutes,
        price_cents: toPriceCents(addon.price),
        is_active: addon.is_active ?? true,
      });
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
  const { user } = useAuth();
  const queryKey = ['appointments', businessId, dateRange?.start, dateRange?.end];

  const { data: appointments = [], isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      let primaryQuery = supabase
        .from('appointments')
        .select(
          '*, booking_services(name), booking_staff(first_name, last_name), crm_contacts(first_name, last_name, email, phone)',
        )
        .eq('business_id', businessId!)
        .order('start_time', { ascending: true });
      if (dateRange) {
        primaryQuery = primaryQuery
          .gte('start_time', dateRange.start)
          .lte('start_time', dateRange.end);
      }

      const primary = await primaryQuery;

      if (!primary.error) {
        return ((primary.data ?? []) as AnyRow[]).map((row) => mapAppointmentRow(row));
      }
      if (!isSchemaMismatch(primary.error)) throw new Error(primary.error.message);

      let fallbackQuery = supabase
        .from('appointments')
        .select('*, booking_services(name), booking_staff(first_name, last_name)')
        .eq('business_id', businessId!)
        .order('start_time', { ascending: true });
      if (dateRange) {
        fallbackQuery = fallbackQuery
          .gte('start_time', dateRange.start)
          .lte('start_time', dateRange.end);
      }

      const fallback = await fallbackQuery;
      if (fallback.error) throw new Error(fallback.error.message);
      return ((fallback.data ?? []) as AnyRow[]).map((row) => mapAppointmentRow(row));
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (appt: NewAppointment) => {
      const resolvedContactId =
        appt.contact_id ??
        (await upsertBookingContact({
          businessId: appt.business_id,
          firstName: appt.client_first_name,
          lastName: appt.client_last_name,
          email: appt.client_email ?? null,
          phone: appt.client_phone ?? null,
          source: 'booking',
          notes: appt.notes ?? null,
        }));

      const priceCents = await fetchServicePriceCents(appt.service_id);

      const legacyInsert = await supabase
        .from('appointments')
        .insert({
          ...appt,
          contact_id: resolvedContactId ?? null,
          status: 'scheduled',
          notes: appt.notes ?? null,
        })
        .select()
        .single();

      if (!legacyInsert.error && legacyInsert.data) {
        const created = mapAppointmentRow(legacyInsert.data as AnyRow);
        await runAppointmentAutomation({
          userId: user?.id ?? null,
          businessId: appt.business_id,
          contactId: resolvedContactId ?? created.contact_id ?? null,
          appointmentId: created.id,
          startTime: appt.start_time,
          clientName: `${appt.client_first_name} ${appt.client_last_name}`.trim(),
        });
        return created;
      }
      if (legacyInsert.error && !isSchemaMismatch(legacyInsert.error)) {
        throw new Error(legacyInsert.error.message);
      }

      const normalizedInsert = await supabase
        .from('appointments')
        .insert({
          business_id: appt.business_id,
          service_id: appt.service_id,
          staff_id: appt.staff_id ?? null,
          client_id: resolvedContactId ?? null,
          status: 'confirmed',
          start_time: appt.start_time,
          end_time: appt.end_time,
          price_cents: priceCents,
          notes_client: appt.notes ?? null,
          source: 'online',
        })
        .select()
        .single();
      if (normalizedInsert.error) throw new Error(normalizedInsert.error.message);
      const created = mapAppointmentRow(normalizedInsert.data as AnyRow);
      await runAppointmentAutomation({
        userId: user?.id ?? null,
        businessId: appt.business_id,
        contactId: resolvedContactId ?? created.contact_id ?? null,
        appointmentId: created.id,
        startTime: appt.start_time,
        clientName: `${appt.client_first_name} ${appt.client_last_name}`.trim(),
      });
      return created;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateStatusMut = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'cancelled' && reason) updates.cancellation_reason = reason;
      if (status === 'no_show') updates.no_show = true;
      const primaryUpdate = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);

      if (primaryUpdate.error) {
        if (!isSchemaMismatch(primaryUpdate.error)) throw new Error(primaryUpdate.error.message);
        const normalizedStatus = status === 'scheduled' ? 'confirmed' : status;
        const normalizedUpdates: Record<string, unknown> = { status: normalizedStatus };
        if (normalizedStatus === 'cancelled' && reason) {
          normalizedUpdates.cancellation_reason = reason;
        }
        if (normalizedStatus === 'no_show' && reason) {
          normalizedUpdates.notes_internal = reason;
        }
        const fallbackUpdate = await supabase
          .from('appointments')
          .update(normalizedUpdates)
          .eq('id', id);
        if (fallbackUpdate.error) throw new Error(fallbackUpdate.error.message);
      }

      const historyInsert = await supabase.from('appointment_history').insert({
        appointment_id: id,
        action: status,
        notes: reason ?? null,
      });

      if (historyInsert.error) {
        if (!isSchemaMismatch(historyInsert.error)) throw new Error(historyInsert.error.message);
        const normalizedStatus = status === 'scheduled' ? 'confirmed' : status;
        const fallbackHistory = await supabase.from('appointment_history').insert({
          appointment_id: id,
          old_status: null,
          new_status: normalizedStatus,
          notes: reason ?? null,
        });
        if (fallbackHistory.error) throw new Error(fallbackHistory.error.message);
      }
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
      const primary = await supabase
        .from('appointments')
        .select(
          '*, booking_services(name), booking_staff(first_name, last_name), crm_contacts(first_name, last_name, email, phone)',
        )
        .eq('id', appointmentId!)
        .single();
      if (!primary.error) {
        return mapAppointmentRow(primary.data as AnyRow);
      }
      if (!isSchemaMismatch(primary.error)) throw new Error(primary.error.message);

      const fallback = await supabase
        .from('appointments')
        .select('*, booking_services(name), booking_staff(first_name, last_name)')
        .eq('id', appointmentId!)
        .single();
      if (fallback.error) throw new Error(fallback.error.message);
      return mapAppointmentRow(fallback.data as AnyRow);
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
        services: ((svcData ?? []) as AnyRow[]).map((row) => mapBookingServiceRow(row)),
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
