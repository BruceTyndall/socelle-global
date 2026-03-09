import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Users, Mail, Building, Phone, Calendar, AlertCircle } from 'lucide-react';

interface Lead {
  id: string;
  business_name: string;
  contact_email: string;
  contact_name: string | null;
  phone: string | null;
  created_at: string;
  plans_count: number;
  latest_fit_score: number | null;
}

export default function BrandLeads() {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [profile]);

  const fetchLeads = async () => {
    if (!profile?.brand_id) {
      setError('No brand associated with your account');
      setLoading(false);
      return;
    }

    try {
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('business_id, fit_score, created_at, businesses!inner(name, owner_email)')
        .eq('brand_id', profile.brand_id)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      const businessMap = new Map<string, Lead>();

      (plansData || []).forEach((plan) => {
        const business = plan.businesses as any;
        const businessId = plan.business_id;

        if (!businessMap.has(businessId)) {
          businessMap.set(businessId, {
            id: businessId,
            business_name: business?.name || 'Unknown Business',
            contact_email: business?.owner_email || '',
            contact_name: null,
            phone: null,
            created_at: plan.created_at,
            plans_count: 1,
            latest_fit_score: plan.fit_score,
          });
        } else {
          const existing = businessMap.get(businessId)!;
          existing.plans_count += 1;
          if (new Date(plan.created_at) > new Date(existing.created_at)) {
            existing.created_at = plan.created_at;
            existing.latest_fit_score = plan.fit_score;
          }
        }
      });

      setLeads(Array.from(businessMap.values()));
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-graphite border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-graphite/60">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Leads</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-graphite mb-2">Business Leads</h1>
        <p className="text-graphite/60">
          Businesses that have shown interest in your brand
        </p>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-graphite" />
          <span className="text-sm text-graphite/60">Total Leads</span>
        </div>
        <div className="text-4xl font-bold text-graphite">{leads.length}</div>
        <p className="text-sm text-graphite/60 mt-2">
          Unique businesses that have created plans with your brand
        </p>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-accent-soft" />
            <p className="text-graphite/60 mb-2">No leads yet</p>
            <p className="text-sm text-graphite/60">
              Leads will appear here when businesses analyze their fit with your brand
            </p>
          </div>
        ) : (
          <div className="divide-y divide-accent-soft">
            {leads.map((lead) => (
              <div key={lead.id} className="p-6 hover:bg-background transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-accent-soft rounded-full flex items-center justify-center">
                        <Building className="w-5 h-5 text-graphite" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-graphite">{lead.business_name}</h3>
                        {lead.latest_fit_score !== null && (
                          <div className="text-sm text-graphite/60">
                            Latest fit score: <span className="font-semibold text-graphite">{lead.latest_fit_score}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 ml-13">
                      <div className="flex items-center gap-2 text-sm text-graphite/60">
                        <Mail className="w-4 h-4 text-graphite/60" />
                        <a href={`mailto:${lead.contact_email}`} className="hover:text-graphite">
                          {lead.contact_email}
                        </a>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm text-graphite/60">
                          <Phone className="w-4 h-4 text-graphite/60" />
                          <a href={`tel:${lead.phone}`} className="hover:text-graphite">
                            {lead.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-graphite/60">
                        <Calendar className="w-4 h-4 text-graphite/60" />
                        First contact: {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-graphite/60">
                        <Building className="w-4 h-4 text-graphite/60" />
                        {lead.plans_count} plan{lead.plans_count !== 1 ? 's' : ''} created
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className="px-4 py-2 bg-graphite text-white text-sm rounded-lg hover:bg-graphite transition-colors">
                      Contact
                    </button>
                    <button className="px-4 py-2 border border-accent-soft text-graphite text-sm rounded-lg hover:bg-background transition-colors">
                      View Plans
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
