import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Building2, Filter } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useProspects } from '../../lib/useProspects';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-purple-50 text-purple-700',
  interested: 'bg-green-50 text-green-700',
  meeting_scheduled: 'bg-accent/10 text-accent',
  proposal_sent: 'bg-accent/10 text-accent',
  negotiating: 'bg-signal-warn/10 text-signal-warn',
  won: 'bg-signal-up/10 text-signal-up',
  lost: 'bg-signal-down/10 text-signal-down',
  dormant: 'bg-accent-soft/20 text-graphite/60',
};

const STATUS_OPTIONS = ['new', 'contacted', 'interested', 'meeting_scheduled', 'proposal_sent', 'negotiating', 'won', 'lost', 'dormant'];

export default function ProspectList() {
  const { profile } = useAuth();
  const { prospects, loading, isLive } = useProspects(profile?.business_id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = prospects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.company_name.toLowerCase().includes(q) ||
        (p.contact_name?.toLowerCase().includes(q)) ||
        (p.city?.toLowerCase().includes(q))
      );
    }
    if (statusFilter) result = result.filter(p => p.status === statusFilter);
    return result;
  }, [prospects, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">B2B Prospects</h1>
          <p className="text-sm text-graphite/60 mt-1">{prospects.length} prospects</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <button className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Prospect
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60" />
          <input type="text" placeholder="Search prospects..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-9 pr-4 bg-white border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
        </div>
        <button onClick={() => setShowFilters(f => !f)} className={`h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'border-accent text-accent bg-accent/5' : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'}`}>
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-graphite/60 mr-1 self-center">Status:</span>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${statusFilter === s ? 'bg-accent text-white border-accent' : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-accent-soft/10 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-8 text-center">
          <Building2 className="w-10 h-10 text-accent-soft mx-auto mb-3" />
          <p className="text-sm text-graphite/60">No prospects found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(prospect => (
            <Link key={prospect.id} to={`/portal/prospects/${prospect.id}`} className="block bg-white rounded-xl border border-accent-soft/30 p-4 hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-graphite">{prospect.company_name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[prospect.status] ?? 'bg-accent-soft/20 text-graphite/60'}`}>
                      {prospect.status.replace('_', ' ')}
                    </span>
                    {prospect.invited_to_platform && (
                      <span className="text-[10px] font-medium bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-full">Invited</span>
                    )}
                  </div>
                  <p className="text-xs text-graphite/60 mt-0.5">
                    {prospect.contact_name ?? 'No contact'}{prospect.company_type ? ` · ${prospect.company_type}` : ''}{prospect.city ? ` · ${prospect.city}, ${prospect.state}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  {prospect.estimated_value != null && (
                    <p className="text-sm font-medium text-graphite">${prospect.estimated_value.toLocaleString()}</p>
                  )}
                  {prospect.next_follow_up && (
                    <p className="text-[10px] text-signal-warn">Follow-up: {new Date(prospect.next_follow_up).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
