import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Eye, Loader2, Search, GitCompare, X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import BusinessNav from '../../components/BusinessNav';
import { TableRowSkeleton, Skeleton } from '../../components/Skeleton';

interface Plan {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  brands: {
    name: string;
    slug: string;
  };
}

const STATUS_STYLE: Record<string, string> = {
  ready:      'bg-emerald-50 text-emerald-700',
  processing: 'bg-amber-50 text-amber-700',
  error:      'bg-red-50 text-red-700',
  draft:      'bg-pro-stone/60 text-pro-charcoal',
};

export default function PlansList() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*, brands(name, slug)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch {
      // silent — no blocking error for list failures
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      setPlans(plans.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <BusinessNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
          <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
            <table className="w-full">
              <thead className="bg-pro-ivory border-b border-pro-stone">
                <tr>
                  {['Plan', 'Brand', 'Status', 'Updated', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium font-sans text-pro-warm-gray uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-pro-stone">
                {[0, 1, 2, 3, 4].map(i => <TableRowSkeleton key={i} cols={5} />)}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  const filtered = plans.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brands?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <BusinessNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-sans font-semibold text-pro-charcoal tracking-tight">Reports</h1>
            <p className="text-sm text-pro-warm-gray font-sans mt-1">
              {plans.length > 0 ? `${plans.length} report${plans.length !== 1 ? 's' : ''} generated` : 'Upload your menu to generate your first report'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {plans.length >= 2 && (
              <Link
                to="/portal/plans/compare"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-pro-charcoal border border-pro-stone rounded-lg hover:bg-pro-ivory transition-colors text-sm font-medium font-sans"
              >
                <GitCompare className="w-4 h-4" />
                Compare
              </Link>
            )}
            <Link
              to="/portal/plans/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-pro-charcoal text-white rounded-lg hover:bg-pro-charcoal/90 transition-colors text-sm font-medium font-sans"
            >
              <Upload className="w-4 h-4" />
              Upload your menu
            </Link>
          </div>
        </div>

        {/* Empty state */}
        {plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-pro-stone p-12 text-center">
            <div className="w-14 h-14 bg-pro-cream rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FileText className="w-7 h-7 text-pro-warm-gray" />
            </div>
            <h2 className="font-sans font-semibold text-pro-charcoal mb-2">No reports yet</h2>
            <p className="text-sm text-pro-warm-gray font-sans mb-6 max-w-sm mx-auto">
              Upload your service menu to get a gap analysis and brand match report.
            </p>
            <Link
              to="/portal/plans/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pro-charcoal text-white rounded-lg hover:bg-pro-charcoal/90 transition-colors text-sm font-medium font-sans"
            >
              <Upload className="w-4 h-4" />
              Upload your menu
            </Link>
          </div>
        ) : (
          <>
            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray" />
                <input
                  type="text"
                  placeholder="Search plans…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-pro-stone rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20 focus:border-pro-charcoal"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-pro-stone rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20 bg-white text-pro-charcoal"
              >
                <option value="all">All statuses</option>
                <option value="ready">Ready</option>
                <option value="processing">Processing</option>
                <option value="draft">Draft</option>
                <option value="error">Error</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-pro-stone">
                <p className="text-pro-warm-gray font-sans text-sm">No plans match your filters.</p>
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); }}
                  className="mt-3 text-sm text-pro-charcoal font-medium font-sans hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
                <div className="px-6 py-3 border-b border-pro-stone">
                  <p className="text-xs text-pro-warm-gray font-sans">
                    {filtered.length} of {plans.length} report{plans.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <table className="w-full">
                  <thead className="bg-pro-ivory border-b border-pro-stone">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium font-sans text-pro-warm-gray uppercase tracking-wider">Report</th>
                      <th className="text-left px-6 py-3 text-xs font-medium font-sans text-pro-warm-gray uppercase tracking-wider">Brand</th>
                      <th className="text-left px-6 py-3 text-xs font-medium font-sans text-pro-warm-gray uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium font-sans text-pro-warm-gray uppercase tracking-wider hidden sm:table-cell">Updated</th>
                      <th className="text-right px-6 py-3 text-xs font-medium font-sans text-pro-warm-gray uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pro-stone/50">
                    {filtered.map((plan) => (
                      <tr key={plan.id} className="hover:bg-pro-ivory/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-pro-cream rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-pro-warm-gray" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-pro-charcoal font-sans">{plan.name}</p>
                              <p className="text-xs text-pro-warm-gray font-sans">
                                {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-pro-charcoal font-sans">{plan.brands?.name || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium font-sans rounded-md ${STATUS_STYLE[plan.status] || STATUS_STYLE.draft}`}>
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <p className="text-xs text-pro-warm-gray font-sans">
                            {new Date(plan.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {confirmDeleteId === plan.id ? (
                              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                <span className="text-xs text-red-800 font-medium whitespace-nowrap font-sans">Delete?</span>
                                <button
                                  onClick={() => handleDeleteConfirm(plan.id)}
                                  className="text-xs font-semibold text-red-700 hover:text-red-900 transition-colors font-sans"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-pro-warm-gray hover:text-pro-charcoal transition-colors"
                                  aria-label="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <Link
                                  to={`/portal/plans/${plan.id}`}
                                  className="p-2 text-pro-warm-gray hover:text-pro-navy hover:bg-pro-cream rounded-lg transition-colors"
                                  title="View results"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => setConfirmDeleteId(plan.id)}
                                  disabled={deletingId === plan.id}
                                  className="p-2 text-pro-warm-gray hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete plan"
                                >
                                  {deletingId === plan.id
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Trash2 className="w-4 h-4" />
                                  }
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
