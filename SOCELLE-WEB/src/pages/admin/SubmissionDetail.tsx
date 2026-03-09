import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Inbox, CheckCircle, Clock, XCircle, Eye, User,
  FileText, Calendar, AlertCircle, ChevronDown, ChevronUp, Save
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/ui';

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
  notes: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface Plan {
  id: string;
  name: string;
  status: string;
  fit_score: number | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  role: string;
  spa_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-accent-soft text-graphite' },
  { value: 'submitted', label: 'Submitted', color: 'bg-accent-soft text-graphite' },
  { value: 'under_review', label: 'Under Review', color: 'bg-orange-100 text-orange-700' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700' },
  { value: 'completed', label: 'Completed', color: 'bg-accent-soft text-graphite' },
];

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { data: queryData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['admin-submission', id],
    queryFn: async () => {
      if (!id) throw new Error('No submission ID');

      const { data, error: fetchError } = await supabase
        .from('plan_submissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Submission not found');

      // Mark as viewed
      await supabase
        .from('plan_submissions')
        .update({ last_viewed_at: new Date().toISOString() })
        .eq('id', id);

      // Fetch related user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user_id)
        .maybeSingle();

      // Fetch plans associated with this user
      const { data: plansData } = await supabase
        .from('plans')
        .select('id, name, status, fit_score, created_at')
        .eq('business_user_id', data.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        submission: data as Submission,
        userProfile: (profileData as UserProfile) || null,
        plans: (plansData as Plan[]) || [],
      };
    },
    enabled: !!id,
  });

  const submission = queryData?.submission ?? null;
  const userProfile = queryData?.userProfile ?? null;
  const plans = queryData?.plans ?? [];
  const error = queryError ? (queryError as Error).message : null;

  // Sync edit state when submission loads
  if (submission && editStatus === '' && !loading) {
    setEditStatus(submission.submission_status);
    setEditNotes(submission.notes || '');
  }

  const loadSubmission = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-submission', id] });
  };

  const handleSave = async () => {
    if (!submission || !id) return;

    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('plan_submissions')
        .update({
          submission_status: editStatus,
          notes: editNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['admin-submission', id] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving:', err);
      alert('Failed to save changes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-accent-soft text-graphite';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved' || status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'draft') return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-accent-soft p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 mb-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-accent-soft p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-full mb-3 rounded" />
              <Skeleton className="h-24 w-full mb-3 rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="space-y-4">
        <Link to="/admin/inbox" className="flex items-center gap-2 text-graphite/60 hover:text-graphite">
          <ArrowLeft className="w-4 h-4" />
          Back to Inbox
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Submission</h3>
            <p className="text-red-700 text-sm mt-1">{error || 'Submission not found'}</p>
            <button
              onClick={loadSubmission}
              className="mt-3 text-sm text-red-700 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasChanges =
    editStatus !== submission.submission_status ||
    editNotes !== (submission.notes || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/inbox')}
            className="p-2 text-graphite/60 hover:bg-accent-soft rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-graphite">
                {submission.spa_name || 'Unnamed Business'}
              </h1>
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.submission_status)}`}>
                {getStatusIcon(submission.submission_status)}
                {submission.submission_status.replace('_', ' ')}
              </span>
              {!submission.last_viewed_at && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">NEW</span>
              )}
            </div>
            <p className="text-sm text-graphite/60 mt-0.5">
              Submitted {new Date(submission.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Business Info */}
          <div className="bg-white rounded-lg border border-accent-soft">
            <div className="p-5 border-b border-accent-soft flex items-center gap-2">
              <Inbox className="w-5 h-5 text-graphite/60" />
              <h2 className="font-semibold text-graphite">Submission Details</h2>
            </div>
            <div className="p-5">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Business Name</dt>
                  <dd className="text-graphite font-medium">{submission.spa_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Spa Type</dt>
                  <dd className="text-graphite capitalize">{submission.spa_type || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Contact Email</dt>
                  <dd className="text-graphite">
                    {submission.contact_email
                      ? <a href={`mailto:${submission.contact_email}`} className="text-graphite hover:underline">{submission.contact_email}</a>
                      : userProfile?.contact_email
                        ? <a href={`mailto:${userProfile.contact_email}`} className="text-graphite hover:underline">{userProfile.contact_email}</a>
                        : '—'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Phone</dt>
                  <dd className="text-graphite">{submission.contact_phone || userProfile?.contact_phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Submitted</dt>
                  <dd className="text-graphite">{new Date(submission.created_at).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Last Updated</dt>
                  <dd className="text-graphite">{new Date(submission.updated_at).toLocaleString()}</dd>
                </div>
                {submission.last_viewed_at && (
                  <div>
                    <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Last Viewed</dt>
                    <dd className="flex items-center gap-1 text-graphite">
                      <Eye className="w-3.5 h-3.5 text-graphite/60" />
                      {new Date(submission.last_viewed_at).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Pipeline Status */}
          <div className="bg-white rounded-lg border border-accent-soft">
            <div className="p-5 border-b border-accent-soft">
              <h2 className="font-semibold text-graphite">Pipeline Progress</h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-0">
                {[
                  { label: 'Menu Uploaded', done: submission.menu_uploaded },
                  { label: 'Analysis Complete', done: submission.analysis_completed },
                  { label: 'Plan Generated', done: submission.plan_generated },
                ].map((step, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                      step.done
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-accent-soft text-graphite/60'
                    }`}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    {idx < 2 && (
                      <div className={`absolute mt-4 h-0.5 w-full ${step.done ? 'bg-green-600' : 'bg-accent-soft'}`} style={{ left: '50%', width: 'calc(100% - 2rem)' }} />
                    )}
                    <p className={`text-xs font-medium mt-2 text-center ${step.done ? 'text-green-700' : 'text-graphite/60'}`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Plans */}
          <div className="bg-white rounded-lg border border-accent-soft">
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="w-full p-5 flex items-center justify-between text-left border-b border-accent-soft hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-graphite/60" />
                <h2 className="font-semibold text-graphite">Related Plans ({plans.length})</h2>
              </div>
              {showAnalysis ? <ChevronUp className="w-4 h-4 text-graphite/60" /> : <ChevronDown className="w-4 h-4 text-graphite/60" />}
            </button>
            {showAnalysis && (
              <div className="divide-y divide-accent-soft">
                {plans.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-10 h-10 text-accent-soft mx-auto mb-3" />
                    <p className="text-graphite/60 text-sm">No plans generated yet for this user</p>
                  </div>
                ) : (
                  plans.map(plan => (
                    <div key={plan.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-graphite text-sm">{plan.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-graphite/60 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(plan.created_at).toLocaleDateString()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            plan.status === 'ready' ? 'bg-green-100 text-green-700' :
                            plan.status === 'processing' ? 'bg-accent-soft text-graphite' :
                            'bg-accent-soft text-graphite/60'
                          }`}>
                            {plan.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {plan.fit_score !== null && (
                          <span className="text-lg font-bold text-graphite">{plan.fit_score}%</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          {userProfile && (
            <div className="bg-white rounded-lg border border-accent-soft">
              <div className="p-5 border-b border-accent-soft flex items-center gap-2">
                <User className="w-5 h-5 text-graphite/60" />
                <h2 className="font-semibold text-graphite">User Account</h2>
              </div>
              <div className="p-5">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Role</dt>
                    <dd className="text-graphite capitalize">{userProfile.role.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">Joined</dt>
                    <dd className="text-graphite">{new Date(userProfile.created_at).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-graphite/60 uppercase tracking-wide mb-1">User ID</dt>
                    <dd className="text-graphite/60 font-mono text-xs truncate">{userProfile.id}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Right column — actions */}
        <div className="space-y-5">
          {/* Status & Notes Editor */}
          <div className="bg-white rounded-lg border border-accent-soft">
            <div className="p-5 border-b border-accent-soft">
              <h2 className="font-semibold text-graphite">Review Actions</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1.5">
                  Update Status
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-graphite bg-white"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={5}
                  placeholder="Add internal notes about this submission..."
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-graphite resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-graphite text-white text-sm font-medium rounded-lg hover:bg-graphite disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4" />
                  Changes saved
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg border border-accent-soft">
            <div className="p-5 border-b border-accent-soft">
              <h2 className="font-semibold text-graphite">Quick Links</h2>
            </div>
            <div className="p-5 space-y-2">
              <Link
                to="/admin/inbox"
                className="flex items-center gap-2 text-sm text-graphite hover:text-graphite transition-colors py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Inbox
              </Link>
              {plans.length > 0 && (
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="flex items-center gap-2 text-sm text-graphite hover:text-graphite transition-colors py-1"
                >
                  <FileText className="w-4 h-4" />
                  View {plans.length} plan{plans.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
