import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Building2, Download } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmCompanies } from '../../lib/useCrmCompanies';
import { exportToCsv } from '../../lib/csvExport';

const TYPE_COLORS: Record<string, string> = {
  salon: 'bg-purple-50 text-purple-700',
  spa: 'bg-blue-50 text-blue-700',
  medspa: 'bg-green-50 text-green-700',
  clinic: 'bg-teal-50 text-teal-700',
  supplier: 'bg-pro-gold/10 text-pro-gold',
  distributor: 'bg-accent/10 text-accent',
  other: 'bg-pro-stone/20 text-pro-warm-gray',
};

export default function CompanyList() {
  const { profile } = useAuth();
  const { companies, loading, isLive } = useCrmCompanies(profile?.business_id);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.industry?.toLowerCase().includes(q)) ||
      (c.city?.toLowerCase().includes(q))
    );
  }, [companies, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pro-charcoal">Companies</h1>
          <p className="text-sm text-pro-warm-gray mt-1">{companies.length} companies</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <button
            onClick={() => exportToCsv(filtered.map(c => ({
              name: c.name,
              type: c.type,
              industry: c.industry ?? '',
              email: c.email ?? '',
              phone: c.phone ?? '',
              website: c.website ?? '',
              city: c.city ?? '',
              state: c.state ?? '',
              annual_revenue: c.annual_revenue ?? '',
              employee_count: c.employee_count ?? '',
              created_at: c.created_at,
            })), 'crm_companies')}
            className="h-9 px-3 text-xs font-medium text-pro-warm-gray border border-pro-stone/30 rounded-full hover:border-accent/30 transition-colors inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <Link to="/portal/crm/companies/new" className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Plus className="w-4 h-4" />
            Add Company
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray" />
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 bg-white border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-pro-stone/30 p-4 animate-pulse">
              <div className="h-4 bg-pro-stone/20 rounded w-40 mb-2" />
              <div className="h-3 bg-pro-stone/20 rounded w-60" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-pro-stone/30 p-8 text-center">
          <Building2 className="w-10 h-10 text-pro-stone mx-auto mb-3" />
          <p className="text-sm text-pro-warm-gray">No companies found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(company => (
            <Link key={company.id} to={`/portal/crm/companies/${company.id}`} className="block bg-white rounded-xl border border-pro-stone/30 p-4 hover:border-accent/30 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-pro-charcoal">{company.name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[company.type] ?? TYPE_COLORS.other}`}>
                      {company.type}
                    </span>
                  </div>
                  <p className="text-xs text-pro-warm-gray mt-0.5">
                    {[company.industry, company.city, company.state].filter(Boolean).join(' · ') || 'No details'}
                  </p>
                </div>
                {company.website && (
                  <span className="text-xs text-accent truncate max-w-[200px]">{company.website}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
