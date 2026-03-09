import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Search, Clock, CheckCircle, XCircle, Eye, Download } from 'lucide-react';
import { exportToCSV } from '../../lib/csvExport';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

interface Submission {
  id: string;
  user_id: string;
  spa_name: string;
  spa_type: string;
  submission_status: string;
  menu_uploaded: boolean;
  analysis_completed: boolean;
  plan_generated: boolean;
  created_at: string;
  updated_at: string;
  last_viewed_at: string | null;
}

export default function AdminInbox() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('plan_submissions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err: any) {
      console.error('Error loading submissions:', err);
      const message = err?.message?.toLowerCase() || '';
      if (
        ['PGRST301', 'PGRST116', '42501'].includes(err?.code) ||
        message.includes('permission') ||
        message.includes('rls') ||
        message.includes('row-level security')
      ) {
        setError('Access denied. Your account does not have permission to view submissions.');
      } else if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
        setError('Network issue while loading submissions. Please refresh and try again.');
      } else {
        setError('Failed to load submissions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = filter === 'all' || submission.submission_status === filter;
    const matchesSearch = searchTerm === '' ||
      (submission.spa_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: submissions.length,
    draft: submissions.filter(s => s.submission_status === 'draft').length,
    submitted: submissions.filter(s => s.submission_status === 'submitted').length,
    under_review: submissions.filter(s => s.submission_status === 'under_review').length,
    approved: submissions.filter(s => s.submission_status === 'approved').length,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-accent-soft text-graphite',
      submitted: 'bg-accent-soft text-graphite',
      under_review: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      completed: 'bg-green-100 text-green-700'
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved' || status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'draft') return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-graphite border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-graphite/60">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        icon={Inbox}
        title="Failed to Load Submission Inbox"
        message={error}
        action={{
          label: 'Retry',
          onClick: loadSubmissions
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Inbox className="w-8 h-8 text-graphite" />
          <div>
            <h1 className="text-2xl font-semibold text-graphite">Submission Inbox</h1>
            <p className="text-sm text-graphite/60">Review and manage spa implementation plans</p>
          </div>
        </div>
        <button
          onClick={() =>
            exportToCSV(
              filteredSubmissions.map(s => ({
                spa_name: s.spa_name || '',
                spa_type: s.spa_type || '',
                status: s.submission_status,
                menu_uploaded: s.menu_uploaded ? 'Yes' : 'No',
                analysis_completed: s.analysis_completed ? 'Yes' : 'No',
                plan_generated: s.plan_generated ? 'Yes' : 'No',
                created_at: new Date(s.created_at).toLocaleDateString(),
                updated_at: new Date(s.updated_at).toLocaleDateString(),
              })),
              `submissions_export_${new Date().toISOString().split('T')[0]}.csv`,
              [
                { key: 'spa_name', label: 'Spa Name' },
                { key: 'spa_type', label: 'Spa Type' },
                { key: 'status', label: 'Status' },
                { key: 'menu_uploaded', label: 'Menu Uploaded' },
                { key: 'analysis_completed', label: 'Analysis Done' },
                { key: 'plan_generated', label: 'Plan Generated' },
                { key: 'created_at', label: 'Created' },
                { key: 'updated_at', label: 'Updated' },
              ]
            )
          }
          disabled={filteredSubmissions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-accent-soft text-graphite rounded-lg text-sm font-medium hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV ({filteredSubmissions.length})
        </button>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft">
        <div className="grid grid-cols-5 divide-x divide-accent-soft">
          {[
            { key: 'all', label: 'All' },
            { key: 'submitted', label: 'New' },
            { key: 'under_review', label: 'In Review' },
            { key: 'approved', label: 'Approved' },
            { key: 'draft', label: 'Draft' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setFilter(status.key)}
              className={`px-4 py-3 text-center transition-colors ${
                filter === status.key
                  ? 'bg-accent-soft text-graphite'
                  : 'text-graphite/60 hover:bg-background'
              }`}
            >
              <div className="text-2xl font-bold">{statusCounts[status.key as keyof typeof statusCounts]}</div>
              <div className="text-xs font-medium mt-1">{status.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft">
        <div className="p-4 border-b border-accent-soft">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-graphite/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by spa name..."
              className="w-full pl-10 pr-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>
        </div>

        <div className="divide-y divide-accent-soft">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="w-12 h-12 text-accent-soft mx-auto mb-4" />
              <p className="text-graphite/60">No submissions found</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <Link
                key={submission.id}
                to={`/admin/submissions/${submission.id}`}
                className="block p-4 hover:bg-background transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-graphite">{submission.spa_name || 'Unnamed Business'}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.submission_status)} flex items-center gap-1`}>
                        {getStatusIcon(submission.submission_status)}
                        {submission.submission_status.replace('_', ' ')}
                      </span>
                      {!submission.last_viewed_at && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">NEW</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-graphite/60">
                      <span className="capitalize">{submission.spa_type}</span>
                      <span>Created {new Date(submission.created_at).toLocaleDateString()}</span>
                      {submission.last_viewed_at && (
                        <span className="flex items-center gap-1 text-graphite/60">
                          <Eye className="w-3 h-3" />
                          Viewed {new Date(submission.last_viewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {submission.menu_uploaded && (
                    <div className="flex items-center gap-1 text-xs text-green-600 px-2">
                      <CheckCircle className="w-3 h-3" />
                      Menu uploaded
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
