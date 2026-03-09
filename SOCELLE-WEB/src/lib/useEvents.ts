import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

/* ══════════════════════════════════════════════════════════════════
   useEvents — TanStack Query v5 hook for events table
   W10-05: Events live wire replacing DEMO_EVENTS stub
   Schema: id, name, date, date_end, location, type, verticals,
           description, url, attendees, featured, status
   ══════════════════════════════════════════════════════════════════ */

export interface EventRow {
  id: string;
  name: string;
  date: string;            // ISO date string e.g. '2026-05-12'
  date_end: string | null;
  location: string;
  type: string;            // conference | trade-show | workshop | virtual
  verticals: string[];
  description: string;
  url: string;
  attendees: string | null; // display string e.g. '2,000+'
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// DEMO fallback — shown when Supabase is not configured
const DEMO_EVENTS: EventRow[] = [
  {
    id: 'demo-1',
    name: 'Professional Beauty Intelligence Summit',
    description:
      'Annual gathering of operators and brand leaders exploring market signals, procurement intelligence, and category trends shaping the professional beauty landscape.',
    type: 'conference',
    location: 'Miami, FL',
    date: '2026-06-14',
    date_end: '2026-06-16',
    attendees: '500+',
    url: '#',
    verticals: ['medspa', 'spa'],
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Advanced Facial Protocol Masterclass',
    description:
      'Hands-on training in protocol-driven treatment planning with peer benchmarking and product intelligence.',
    type: 'workshop',
    location: 'Los Angeles, CA',
    date: '2026-05-22',
    date_end: null,
    attendees: '40',
    url: '#',
    verticals: ['spa'],
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    name: 'Brand Partner Activation: Spring Launch',
    description:
      'Exclusive brand showcase featuring new product lines, ingredient intelligence, and distributor partnerships.',
    type: 'trade-show',
    location: 'New York, NY',
    date: '2026-04-10',
    date_end: '2026-04-11',
    attendees: '120+',
    url: '#',
    verticals: ['salon', 'spa'],
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    name: 'Procurement Intelligence Webinar',
    description:
      'Virtual deep-dive into market signals, reorder optimization, and category gap analysis for medspa operators.',
    type: 'virtual',
    location: 'Virtual',
    date: '2026-04-28',
    date_end: null,
    attendees: null,
    url: '#',
    verticals: ['medspa'],
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    name: 'Ingredient Intelligence Workshop',
    description:
      'Clinical formulation trends, ingredient adoption velocity, and treatment room data for ingredient-forward brands.',
    type: 'workshop',
    location: 'Austin, TX',
    date: '2026-07-09',
    date_end: null,
    attendees: '60',
    url: '#',
    verticals: ['medspa', 'spa'],
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    name: 'Operator Benchmarking Forum',
    description:
      'Peer-to-peer benchmarking sessions segmented by business type and region. Compare performance and procurement strategy.',
    type: 'conference',
    location: 'Chicago, IL',
    date: '2026-09-18',
    date_end: '2026-09-19',
    attendees: '200+',
    url: '#',
    verticals: ['medspa', 'spa', 'salon'],
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export interface EventFilters {
  type?: string;       // conference | trade-show | workshop | virtual
  vertical?: string;
  upcoming?: boolean;  // if true, filter date >= today
}

async function fetchEvents(filters: EventFilters): Promise<EventRow[]> {
  let qb = supabase
    .from('events')
    .select('id, name, date, date_end, location, type, verticals, description, url, attendees, featured, created_at, updated_at')
    .eq('status', 'active')
    .order('date', { ascending: true });

  if (filters.type && filters.type !== 'All') {
    qb = qb.eq('type', filters.type.toLowerCase().replace(' ', '-'));
  }

  if (filters.upcoming) {
    const today = new Date().toISOString().split('T')[0];
    qb = qb.gte('date', today);
  }

  const { data, error } = await qb;
  if (error) throw new Error(error.message);
  return (data as EventRow[]) ?? [];
}

export function useEvents(filters: EventFilters = {}) {
  const configured = isSupabaseConfigured();

  const { data, isLoading, error, refetch } = useQuery<EventRow[], Error>({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
    enabled: configured,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const isLive = configured && !error;
  const events = configured && !error ? (data ?? []) : DEMO_EVENTS;

  return {
    events,
    loading: isLoading && configured,
    error: error?.message ?? null,
    isLive,
    refetch,
  };
}
