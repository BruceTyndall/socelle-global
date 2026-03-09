import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Users, MessageSquare, Globe, Phone, Mail, MapPin, Pencil } from 'lucide-react';
import { useCrmCompanyDetail } from '../../lib/useCrmCompanies';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import type { CrmContact, CrmInteraction } from '../../lib/useCrmContacts';
import { useQuery } from '@tanstack/react-query';

const TABS = ['Contacts', 'Interactions', 'Deals'] as const;
type Tab = typeof TABS[number];

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { company, loading, isLive } = useCrmCompanyDetail(id);
  const [tab, setTab] = useState<Tab>('Contacts');

  const { data: subData, isLoading: loadingSub } = useQuery({
    queryKey: ['company-sub-data', id, profile?.business_id],
    queryFn: async () => {
      const [cRes, iRes] = await Promise.all([
        supabase.from('crm_contacts').select('*').eq('company_id', id!).order('last_name'),
        supabase.from('crm_interactions').select('*').eq('business_id', profile!.business_id).order('occurred_at', { ascending: false }).limit(20),
      ]);
      const contacts = (cRes.data ?? []) as CrmContact[];
      const contactIds = new Set(contacts.map((c) => c.id));
      const interactions = ((iRes.data ?? []) as CrmInteraction[]).filter(i => contactIds.has(i.contact_id));
      return { contacts, interactions };
    },
    enabled: !!id && !!profile?.business_id,
  });

  const contacts = subData?.contacts ?? [];
  const interactions = subData?.interactions ?? [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-accent-soft/20 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-accent-soft/30 p-6 animate-pulse"><div className="h-16 bg-accent-soft/20 rounded" /></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-graphite/60">Company not found</p>
        <Link to="/portal/crm/companies" className="text-accent text-sm mt-2 inline-block">Back to companies</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/portal/crm/companies" className="w-8 h-8 rounded-full border border-accent-soft/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-graphite/60" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-graphite">{company.name}</h1>
            <p className="text-sm text-graphite/60">{company.type}{company.industry ? ` · ${company.industry}` : ''}</p>
          </div>
        </div>
        {!isLive && (
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
        )}
        <Link to={`/portal/crm/companies/${id}/edit`} className="h-9 px-4 text-accent text-sm font-medium rounded-full border border-accent/30 hover:bg-accent/5 transition-colors inline-flex items-center gap-2">
          <Pencil className="w-4 h-4" /> Edit
        </Link>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {company.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-graphite/60" /><span className="text-graphite">{company.email}</span></div>}
          {company.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-graphite/60" /><span className="text-graphite">{company.phone}</span></div>}
          {company.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-graphite/60" /><a href={company.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover truncate">{company.website}</a></div>}
          {(company.city || company.state) && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-graphite/60" /><span className="text-graphite">{[company.city, company.state].filter(Boolean).join(', ')}</span></div>}
          {company.annual_revenue != null && <div><span className="text-graphite/60">Revenue:</span> <span className="text-graphite">${company.annual_revenue.toLocaleString()}</span></div>}
          {company.employee_count != null && <div><span className="text-graphite/60">Employees:</span> <span className="text-graphite">{company.employee_count}</span></div>}
        </div>
        {company.notes && <p className="text-sm text-graphite/60 mt-3 border-t border-accent-soft/10 pt-3">{company.notes}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-accent-soft/20">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-accent text-accent' : 'border-transparent text-graphite/60 hover:text-graphite'}`}>
            {t === 'Contacts' && <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t} ({contacts.length})</span>}
            {t === 'Interactions' && <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {t} ({interactions.length})</span>}
            {t === 'Deals' && <span>{t}</span>}
          </button>
        ))}
      </div>

      {tab === 'Contacts' && (
        <div className="space-y-2">
          {loadingSub ? (
            <div className="animate-pulse space-y-2">{[1, 2].map(i => <div key={i} className="h-14 bg-accent-soft/10 rounded-xl" />)}</div>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-graphite/60 py-4">No contacts linked to this company</p>
          ) : (
            contacts.map(c => (
              <Link key={c.id} to={`/portal/crm/contacts/${c.id}`} className="block bg-white rounded-xl border border-accent-soft/30 p-4 hover:border-accent/30 transition-colors">
                <p className="text-sm font-medium text-graphite">{c.first_name} {c.last_name}</p>
                <p className="text-xs text-graphite/60">{c.email ?? ''}{c.email && c.phone ? ' · ' : ''}{c.phone ?? ''}</p>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'Interactions' && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
          {interactions.length === 0 ? (
            <p className="text-sm text-graphite/60 py-4">No interactions for this company</p>
          ) : (
            <div className="space-y-3">
              {interactions.map(ix => (
                <div key={ix.id} className="flex items-start gap-3 py-2 border-b border-accent-soft/10 last:border-0">
                  <div className="mt-0.5 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-graphite">{ix.subject || ix.type}</p>
                    <p className="text-xs text-graphite/60">{new Date(ix.occurred_at).toLocaleString()}</p>
                    {ix.notes && <p className="text-sm text-graphite/60 mt-1">{ix.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Deals' && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-8 text-center">
          <p className="text-sm text-graphite/60 mb-4">
            Deals for this company are managed in the CRM pipeline.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              to="/portal/crm/deals"
              className="inline-flex items-center h-9 px-4 rounded-lg border border-accent-soft/40 text-graphite text-xs font-semibold hover:bg-accent-soft transition-colors"
            >
              Open Deals
            </Link>
            <Link
              to="/portal/crm/pipeline"
              className="inline-flex items-center h-9 px-4 rounded-lg bg-graphite text-white text-xs font-semibold hover:bg-graphite-dark transition-colors"
            >
              Open Pipeline
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
