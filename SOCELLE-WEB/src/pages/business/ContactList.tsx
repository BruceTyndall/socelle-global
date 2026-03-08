import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Filter, Download, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmContacts } from '../../lib/useCrmContacts';
import { exportToCsv } from '../../lib/csvExport';

// ── Contact List — V2-HUBS-06 ─────────────────────────────────────────
// Churn risk column: yellow at 45+ days, red at 60+ days since last_visit_date.
// Sortable by churn risk. Filterable: "At risk" / "Overdue".
// Skeleton shimmer loading. Pearl Mineral V2.

const LIFECYCLE_COLORS: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-700',
  prospect: 'bg-purple-50 text-purple-700',
  client: 'bg-green-50 text-green-700',
  vip: 'bg-accent/10 text-accent',
  inactive: 'bg-graphite/10 text-graphite/50',
  churned: 'bg-red-50 text-red-700',
};

const TYPE_OPTIONS = ['client', 'lead', 'vendor', 'partner', 'other'];
const LIFECYCLE_OPTIONS = ['lead', 'prospect', 'client', 'vip', 'inactive', 'churned'];
const CHURN_RISK_OPTIONS = ['all', 'at_risk', 'overdue'] as const;
type ChurnRiskFilter = typeof CHURN_RISK_OPTIONS[number];
type SortKey = 'name' | 'churn_risk' | 'last_visit' | 'total_spend';

function daysSinceLastVisit(lastVisitDate: string | null): number | null {
  if (!lastVisitDate) return null;
  return Math.floor((Date.now() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
}

function getChurnRiskLevel(days: number | null): 'none' | 'at_risk' | 'overdue' {
  if (days === null) return 'none';
  if (days >= 60) return 'overdue';
  if (days >= 45) return 'at_risk';
  return 'none';
}

function ChurnBadge({ days }: { days: number | null }) {
  const level = getChurnRiskLevel(days);
  if (level === 'none') return null;
  if (level === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-signal-down/10 text-signal-down px-2 py-0.5 rounded-full">
        <AlertTriangle className="w-3 h-3" /> {days}d overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" /> {days}d at risk
    </span>
  );
}

export default function ContactList() {
  const { profile } = useAuth();
  const { contacts, loading, isLive } = useCrmContacts(profile?.business_id);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [lifecycleFilter, setLifecycleFilter] = useState<string | null>(null);
  const [churnFilter, setChurnFilter] = useState<ChurnRiskFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = contacts.map(c => ({
      ...c,
      _daysSince: daysSinceLastVisit(c.last_visit_date),
    }));

    // Text search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q)) ||
        (c.phone?.includes(q))
      );
    }

    // Filters
    if (typeFilter) result = result.filter(c => c.type === typeFilter);
    if (lifecycleFilter) result = result.filter(c => c.lifecycle_stage === lifecycleFilter);
    if (churnFilter === 'at_risk') result = result.filter(c => getChurnRiskLevel(c._daysSince) === 'at_risk');
    if (churnFilter === 'overdue') result = result.filter(c => getChurnRiskLevel(c._daysSince) === 'overdue');

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'churn_risk':
          return (b._daysSince ?? -1) - (a._daysSince ?? -1);
        case 'last_visit':
          return new Date(b.last_visit_date ?? '1970-01-01').getTime() - new Date(a.last_visit_date ?? '1970-01-01').getTime();
        case 'total_spend':
          return b.total_spend - a.total_spend;
        case 'name':
        default:
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      }
    });

    return result;
  }, [contacts, search, typeFilter, lifecycleFilter, churnFilter, sortBy]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Contacts</h1>
          <p className="text-sm text-graphite/50 mt-1">{contacts.length} total contacts</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <button
            onClick={() => exportToCsv(filtered.map(c => ({
              first_name: c.first_name,
              last_name: c.last_name,
              email: c.email ?? '',
              phone: c.phone ?? '',
              type: c.type,
              lifecycle_stage: c.lifecycle_stage,
              source: c.source ?? '',
              total_visits: c.total_visits,
              total_spend: c.total_spend,
              last_visit_date: c.last_visit_date ?? '',
              days_since_visit: c._daysSince ?? '',
              churn_risk: getChurnRiskLevel(c._daysSince),
              created_at: c.created_at,
            })), 'crm_contacts')}
            className="h-9 px-3 text-xs font-medium text-graphite/50 border border-graphite/10 rounded-full hover:border-accent/30 transition-colors inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <Link to="/portal/crm/contacts/new" className="inline-flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-hover transition-colors">
            <Plus className="w-4 h-4" />
            Add Contact
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-graphite/10 rounded-lg text-sm text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-accent/50"
            />
          </div>
          <button onClick={() => setShowFilters(f => !f)} className={`h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'border-accent text-accent bg-accent/5' : 'border-graphite/10 text-graphite/50 hover:border-accent/30'}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-2 p-3 bg-white rounded-lg border border-graphite/5">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-graphite/50 mr-1">Type:</span>
              {TYPE_OPTIONS.map(t => (
                <button key={t} onClick={() => setTypeFilter(typeFilter === t ? null : t)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${typeFilter === t ? 'bg-accent text-white border-accent' : 'border-graphite/10 text-graphite/50 hover:border-accent/30'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-graphite/50 mr-1">Stage:</span>
              {LIFECYCLE_OPTIONS.map(l => (
                <button key={l} onClick={() => setLifecycleFilter(lifecycleFilter === l ? null : l)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${lifecycleFilter === l ? 'bg-accent text-white border-accent' : 'border-graphite/10 text-graphite/50 hover:border-accent/30'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-graphite/50 mr-1">Churn Risk:</span>
              {CHURN_RISK_OPTIONS.map(c => (
                <button key={c} onClick={() => setChurnFilter(c)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${churnFilter === c ? 'bg-accent text-white border-accent' : 'border-graphite/10 text-graphite/50 hover:border-accent/30'}`}>
                  {c === 'all' ? 'All' : c === 'at_risk' ? 'At Risk (45d+)' : 'Overdue (60d+)'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-graphite/50 mr-1">Sort:</span>
              {(['name', 'churn_risk', 'last_visit', 'total_spend'] as SortKey[]).map(s => (
                <button key={s} onClick={() => setSortBy(s)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${sortBy === s ? 'bg-accent text-white border-accent' : 'border-graphite/10 text-graphite/50 hover:border-accent/30'}`}>
                  {s === 'name' ? 'Name' : s === 'churn_risk' ? 'Churn Risk' : s === 'last_visit' ? 'Last Visit' : 'Total Spend'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-graphite/5 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-graphite/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-graphite/10 rounded w-32" />
                  <div className="h-3 bg-graphite/10 rounded w-48" />
                </div>
                <div className="h-5 bg-graphite/10 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-graphite/5 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-graphite mb-1">No contacts found</h2>
          <p className="text-sm text-graphite/50 mb-4">
            {search || typeFilter || lifecycleFilter || churnFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Add your first contact to get started with your CRM.'}
          </p>
          <Link to="/portal/crm/contacts/new" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover">
            <Plus className="w-4 h-4" /> Add your first contact
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(contact => (
            <Link key={contact.id} to={`/portal/crm/contacts/${contact.id}`} className="block bg-white rounded-xl border border-graphite/5 p-4 hover:border-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
                    {contact.first_name[0]}{contact.last_name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-graphite">{contact.first_name} {contact.last_name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${LIFECYCLE_COLORS[contact.lifecycle_stage] ?? 'bg-graphite/10 text-graphite/50'}`}>
                      {contact.lifecycle_stage}
                    </span>
                    <ChurnBadge days={contact._daysSince} />
                  </div>
                  <p className="text-xs text-graphite/50 truncate">
                    {contact.email ?? ''}{contact.email && contact.phone ? ' · ' : ''}{contact.phone ?? ''}
                    {contact.last_visit_date && (
                      <> · Last visit: {new Date(contact.last_visit_date).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-graphite/40 uppercase tracking-wider">{contact.type}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
