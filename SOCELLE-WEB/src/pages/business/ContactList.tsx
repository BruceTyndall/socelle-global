import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Filter } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmContacts } from '../../lib/useCrmContacts';

const LIFECYCLE_COLORS: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-700',
  prospect: 'bg-purple-50 text-purple-700',
  client: 'bg-green-50 text-green-700',
  vip: 'bg-pro-gold/10 text-pro-gold',
  inactive: 'bg-pro-stone/20 text-pro-warm-gray',
  churned: 'bg-red-50 text-red-700',
};

const TYPE_OPTIONS = ['client', 'lead', 'vendor', 'partner', 'other'];
const LIFECYCLE_OPTIONS = ['lead', 'prospect', 'client', 'vip', 'inactive', 'churned'];

export default function ContactList() {
  const { profile } = useAuth();
  const { contacts, loading, isLive } = useCrmContacts(profile?.business_id);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [lifecycleFilter, setLifecycleFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = contacts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q)) ||
        (c.phone?.includes(q))
      );
    }
    if (typeFilter) result = result.filter(c => c.type === typeFilter);
    if (lifecycleFilter) result = result.filter(c => c.lifecycle_stage === lifecycleFilter);
    return result;
  }, [contacts, search, typeFilter, lifecycleFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pro-charcoal">Contacts</h1>
          <p className="text-sm text-pro-warm-gray mt-1">{contacts.length} total contacts</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <Link to="/portal/crm/contacts/new" className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Contact
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50"
            />
          </div>
          <button onClick={() => setShowFilters(f => !f)} className={`h-10 px-3 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'border-accent text-accent bg-accent/5' : 'border-pro-stone/30 text-pro-warm-gray hover:border-accent/30'}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-pro-warm-gray mr-1">Type:</span>
              {TYPE_OPTIONS.map(t => (
                <button key={t} onClick={() => setTypeFilter(typeFilter === t ? null : t)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${typeFilter === t ? 'bg-accent text-white border-accent' : 'border-pro-stone/30 text-pro-warm-gray hover:border-accent/30'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-pro-warm-gray mr-1">Stage:</span>
              {LIFECYCLE_OPTIONS.map(l => (
                <button key={l} onClick={() => setLifecycleFilter(lifecycleFilter === l ? null : l)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${lifecycleFilter === l ? 'bg-accent text-white border-accent' : 'border-pro-stone/30 text-pro-warm-gray hover:border-accent/30'}`}>
                  {l}
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
            <div key={i} className="bg-white rounded-xl border border-pro-stone/30 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pro-stone/20" />
                <div className="flex-1">
                  <div className="h-4 bg-pro-stone/20 rounded w-32 mb-2" />
                  <div className="h-3 bg-pro-stone/20 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-pro-stone/30 p-8 text-center">
          <Users className="w-10 h-10 text-pro-stone mx-auto mb-3" />
          <p className="text-sm text-pro-warm-gray">No contacts found</p>
          <Link to="/portal/crm/contacts/new" className="inline-flex items-center gap-1 text-sm font-medium text-accent mt-2 hover:text-accent-hover">
            <Plus className="w-4 h-4" /> Add your first contact
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(contact => (
            <Link key={contact.id} to={`/portal/crm/contacts/${contact.id}`} className="block bg-white rounded-xl border border-pro-stone/30 p-4 hover:border-accent/30 transition-colors">
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
                    <p className="text-sm font-medium text-pro-charcoal">{contact.first_name} {contact.last_name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${LIFECYCLE_COLORS[contact.lifecycle_stage] ?? 'bg-pro-stone/20 text-pro-warm-gray'}`}>
                      {contact.lifecycle_stage}
                    </span>
                  </div>
                  <p className="text-xs text-pro-warm-gray truncate">
                    {contact.email ?? ''}{contact.email && contact.phone ? ' · ' : ''}{contact.phone ?? ''}
                  </p>
                </div>
                <span className="text-[10px] text-pro-warm-gray uppercase tracking-wider">{contact.type}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
