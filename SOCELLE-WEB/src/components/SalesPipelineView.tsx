import { useState } from 'react';
import { Users, Plus, Search, TrendingUp, FileText, Mail, CheckCircle, Clock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import PlanOutputView from './PlanOutputView';

export default function SalesPipelineView() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [_showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activityType: 'note',
    title: '',
    description: '',
    followUpDate: ''
  });

  const { data: leads = [], isLoading: loading, error: leadsQueryError } = useQuery({
    queryKey: ['sales-pipeline-leads', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('spa_leads')
        .select(`
          *,
          spa_menus(id, spa_name, spa_type),
          plan_outputs!spa_leads_current_plan_id_fkey(id, plan_status)
        `)
        .order('last_activity_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('lead_status', filterStatus);
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      return data || [];
    },
  });

  const error = leadsQueryError ? (leadsQueryError as Error).message : null;

  const { data: activities = [] } = useQuery({
    queryKey: ['sales-pipeline-activities', selectedLead?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('spa_lead_id', selectedLead.id)
        .order('activity_date', { ascending: false });

      return data || [];
    },
    enabled: !!selectedLead?.id,
  });

  const addActivity = async () => {
    if (!selectedLead || !newActivity.title) return;

    await supabase.from('lead_activities').insert({
      spa_lead_id: selectedLead.id,
      activity_type: newActivity.activityType,
      activity_title: newActivity.title,
      activity_description: newActivity.description,
      follow_up_date: newActivity.followUpDate || null,
      created_by: 'current_user'
    });

    setNewActivity({ activityType: 'note', title: '', description: '', followUpDate: '' });
    setShowActivityModal(false);
    queryClient.invalidateQueries({ queryKey: ['sales-pipeline-activities', selectedLead.id] });
    queryClient.invalidateQueries({ queryKey: ['sales-pipeline-leads'] });
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    await supabase
      .from('spa_leads')
      .update({ lead_status: newStatus })
      .eq('id', leadId);

    await supabase.from('lead_activities').insert({
      spa_lead_id: leadId,
      activity_type: 'status_change',
      activity_title: `Status changed to ${newStatus}`,
      created_by: 'current_user'
    });

    queryClient.invalidateQueries({ queryKey: ['sales-pipeline-leads'] });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      prospect: 'bg-accent-soft text-graphite',
      in_review: 'bg-accent-soft text-graphite',
      proposal_sent: 'bg-purple-100 text-purple-700',
      negotiation: 'bg-amber-100 text-amber-700',
      closed_won: 'bg-green-100 text-green-700',
      closed_lost: 'bg-red-100 text-red-700',
      on_hold: 'bg-accent-soft text-graphite/60'
    };
    return colors[status] || colors.prospect;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'closed_won') return <CheckCircle className="w-4 h-4" />;
    if (status === 'on_hold') return <Clock className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const filteredLeads = leads.filter(lead =>
    searchTerm === '' ||
    lead.spa_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    all: leads.length,
    prospect: leads.filter(l => l.lead_status === 'prospect').length,
    in_review: leads.filter(l => l.lead_status === 'in_review').length,
    proposal_sent: leads.filter(l => l.lead_status === 'proposal_sent').length,
    negotiation: leads.filter(l => l.lead_status === 'negotiation').length,
    closed_won: leads.filter(l => l.lead_status === 'closed_won').length
  };

  if (selectedPlan) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setSelectedPlan(null)}
            className="text-graphite hover:text-graphite"
          >
            ← Back to Pipeline
          </button>
        </div>
        <PlanOutputView planId={selectedPlan} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-graphite border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-graphite/60">Loading pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Pipeline</h3>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => loadLeads()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-graphite" />
          <div>
            <h2 className="text-2xl font-semibold text-graphite">Sales Pipeline</h2>
            <p className="text-sm text-graphite/60">Track leads and manage proposals</p>
          </div>
        </div>

        <button
          onClick={() => setShowNewLeadModal(true)}
          className="px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Lead
        </button>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft mb-6">
        <div className="grid grid-cols-6 divide-x divide-accent-soft">
          {[
            { key: 'all', label: 'All Leads' },
            { key: 'prospect', label: 'Prospect' },
            { key: 'in_review', label: 'In Review' },
            { key: 'proposal_sent', label: 'Proposal Sent' },
            { key: 'negotiation', label: 'Negotiation' },
            { key: 'closed_won', label: 'Closed Won' }
          ].map(status => (
            <button
              key={status.key}
              onClick={() => setFilterStatus(status.key)}
              className={`px-4 py-3 text-center transition-colors ${
                filterStatus === status.key
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
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
            />
          </div>
        </div>

        <div className="divide-y divide-accent-soft">
          {filteredLeads.map(lead => (
            <div
              key={lead.id}
              className="p-4 hover:bg-background cursor-pointer"
              onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-graphite">{lead.spa_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(lead.lead_status)}`}>
                      {getStatusIcon(lead.lead_status)}
                      {lead.lead_status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-graphite/60">
                    {lead.location && <span>{lead.location}</span>}
                    <span className="capitalize">{lead.spa_type}</span>
                    {lead.contact_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {lead.contact_email}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-graphite/60">
                    {lead.menu_upload_completed && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Menu uploaded
                      </span>
                    )}
                    {lead.analysis_completed && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Analysis complete
                      </span>
                    )}
                    {lead.plan_generated && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Plan generated
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {lead.estimated_value && (
                    <div className="text-lg font-semibold text-green-700">
                      ${lead.estimated_value.toLocaleString()}
                    </div>
                  )}
                  {lead.last_activity_at && (
                    <div className="text-xs text-graphite/60 mt-1">
                      Last activity: {new Date(lead.last_activity_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {selectedLead?.id === lead.id && (
                <div className="mt-4 pt-4 border-t border-accent-soft">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowActivityModal(true); }}
                      className="px-3 py-2 text-sm border border-accent-soft rounded-lg hover:bg-background"
                    >
                      Add Activity
                    </button>
                    {lead.current_plan_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPlan(lead.current_plan_id); }}
                        className="px-3 py-2 text-sm border border-accent-soft rounded-lg hover:bg-background flex items-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        View Plan
                      </button>
                    )}
                    <select
                      value={lead.lead_status}
                      onChange={(e) => { e.stopPropagation(); updateLeadStatus(lead.id, e.target.value); }}
                      className="px-3 py-2 text-sm border border-accent-soft rounded-lg hover:bg-background"
                    >
                      <option value="prospect">Prospect</option>
                      <option value="in_review">In Review</option>
                      <option value="proposal_sent">Proposal Sent</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  {activities.length > 0 && (
                    <div className="bg-background rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-graphite mb-3">Recent Activity</h4>
                      <div className="space-y-3">
                        {activities.slice(0, 5).map(activity => (
                          <div key={activity.id} className="text-sm">
                            <div className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-accent-soft rounded-full mt-2"></div>
                              <div className="flex-1">
                                <div className="font-medium text-graphite">{activity.activity_title}</div>
                                {activity.activity_description && (
                                  <div className="text-graphite/60 text-xs mt-1">{activity.activity_description}</div>
                                )}
                                <div className="text-graphite/60 text-xs mt-1">
                                  {new Date(activity.activity_date).toLocaleString()} • {activity.created_by}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredLeads.length === 0 && (
            <div className="p-12 text-center text-graphite/60">
              <Users className="w-12 h-12 mx-auto mb-3 text-graphite/60" />
              <p>No leads found</p>
            </div>
          )}
        </div>
      </div>

      {showActivityModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-graphite mb-4">Add Activity</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Type</label>
                <select
                  value={newActivity.activityType}
                  onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value })}
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg"
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="follow_up">Follow Up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Title</label>
                <input
                  type="text"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg"
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Details</label>
                <textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg h-24"
                  placeholder="Additional details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={newActivity.followUpDate}
                  onChange={(e) => setNewActivity({ ...newActivity, followUpDate: e.target.value })}
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowActivityModal(false)}
                className="flex-1 px-4 py-2 border border-accent-soft text-graphite rounded-lg hover:bg-background"
              >
                Cancel
              </button>
              <button
                onClick={addActivity}
                className="flex-1 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
