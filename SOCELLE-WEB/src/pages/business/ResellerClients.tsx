import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  Search,
  Plus,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  DollarSign,
  BookOpen,
  Clock,
  X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useResellerAccount, useResellerClients } from '../../lib/useReseller';
import type { ResellerClient } from '../../lib/useReseller';

// ── B2B Reseller — Client Management ────────────────────────────────────────
// Data source: reseller_clients (LIVE when DB-connected)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function StatusBadge({ status }: { status: ResellerClient['status'] }) {
  const styles = {
    active: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    churned: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-sans border ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function ResellerClients() {
  const { user } = useAuth();
  const { account } = useResellerAccount(user?.id);
  const { clients, loading, isLive, addClient, reload } = useResellerClients(account?.id);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ client_name: '', client_email: '', company_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      c.client_name.toLowerCase().includes(q) ||
      c.client_email.toLowerCase().includes(q) ||
      (c.company_name ?? '').toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_email) {
      setFormError('Name and email are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await addClient({
        client_name: formData.client_name,
        client_email: formData.client_email,
        company_name: formData.company_name || undefined,
      });
      setFormData({ client_name: '', client_email: '', company_name: '' });
      setShowForm(false);
    } catch {
      setFormError('Failed to add client. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Reseller Clients | SOCELLE</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-sans font-semibold text-graphite">
              Client Management
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-sans font-semibold text-mn-bg bg-mn-dark rounded-full hover:bg-graphite transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-graphite/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-sans font-semibold text-graphite">New Client</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-graphite/40 hover:text-graphite">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1">Name *</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={e => setFormData(p => ({ ...p, client_name: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-sans text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-mn-bg"
                placeholder="Client name"
              />
            </div>
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1">Email *</label>
              <input
                type="email"
                value={formData.client_email}
                onChange={e => setFormData(p => ({ ...p, client_email: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-sans text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-mn-bg"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-sans font-medium text-graphite/60 mb-1">Company</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={e => setFormData(p => ({ ...p, company_name: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-sans text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-mn-bg"
                placeholder="Company name"
              />
            </div>
          </div>
          {formError && (
            <p className="text-xs text-red-600 font-sans">{formError}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-sans text-graphite/60 hover:text-graphite transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-sans font-semibold text-mn-bg bg-mn-dark rounded-full hover:bg-graphite transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-10 pr-4 py-2.5 text-sm font-sans text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
        />
      </div>

      {/* Client List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-graphite/10 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-graphite/10 rounded w-1/3 mb-2" />
              <div className="h-3 bg-graphite/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-graphite/10 rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-graphite/20 mx-auto mb-3" />
          <p className="text-sm text-graphite/50 font-sans">
            {search ? 'No clients match your search.' : 'No clients yet. Add your first client above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(client => {
            const isExpanded = expandedId === client.id;
            return (
              <div key={client.id} className="bg-white border border-graphite/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : client.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-graphite/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-sm font-sans font-semibold text-accent">
                        {client.client_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-sans font-medium text-graphite">{client.client_name}</p>
                      <p className="text-xs text-graphite/40 font-sans">
                        {client.company_name ? `${client.company_name} - ` : ''}{client.client_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={client.status} />
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-graphite/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-graphite/30" />
                    )}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 border-t border-graphite/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-graphite/30" />
                        <div>
                          <p className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Purchases</p>
                          <p className="text-sm font-sans font-medium text-graphite">{client.total_purchases}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-graphite/30" />
                        <div>
                          <p className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Revenue</p>
                          <p className="text-sm font-sans font-medium text-graphite">{formatCurrency(client.total_revenue)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-graphite/30" />
                        <div>
                          <p className="text-[10px] font-sans text-graphite/40 uppercase tracking-wider">Enrolled</p>
                          <p className="text-sm font-sans font-medium text-graphite">{formatDate(client.enrolled_at)}</p>
                        </div>
                      </div>
                    </div>
                    {client.last_activity_at && (
                      <p className="text-xs text-graphite/40 font-sans mt-3">
                        Last activity: {formatDate(client.last_activity_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
