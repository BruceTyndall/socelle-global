import { X, Shield, Clock, Globe, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface ConsentAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId?: string;
}

interface ContactConsentRecord {
  id: string;
  contact_id: string;
  consent_type: string;
  status: string;
  channel: string;
  recorded_by: string | null;
  recorded_at: string;
  notes: string | null;
}

const CONSENT_TYPE_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  data: 'Data Processing',
  transactional: 'Transactional',
};

const STATUS_COLORS: Record<string, string> = {
  opted_in: 'bg-signal-up/10 text-signal-up',
  opted_out: 'bg-signal-down/10 text-signal-down',
  pending: 'bg-signal-warn/10 text-signal-warn',
};

const STATUS_LABELS: Record<string, string> = {
  opted_in: 'Opted In',
  opted_out: 'Opted Out',
  pending: 'Pending',
};

export default function ContactConsentModal({ isOpen, onClose, contactId }: ConsentAuditModalProps) {
  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ['crm_consent_log_contact', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_consent_log')
        .select('*')
        .eq('contact_id', contactId!)
        .order('recorded_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as ContactConsentRecord[];
    },
    enabled: !!contactId && isOpen,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-graphite/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-accent-soft/20 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-graphite">Consent Audit Log</h2>
              <p className="text-xs text-graphite/60 mt-0.5">Immutable record of data processing agreements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-graphite/50 hover:bg-accent-soft hover:text-graphite transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-accent-soft/20 animate-pulse space-y-2">
                  <div className="h-4 bg-graphite/10 rounded w-1/4" />
                  <div className="h-4 bg-graphite/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-signal-down text-sm">Failed to load consent records</p>
              <p className="text-graphite/50 text-xs mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-accent-soft/50 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-graphite/40" />
              </div>
              <p className="text-sm font-medium text-graphite">No Consent Records</p>
              <p className="text-xs text-graphite/50 mt-1">This contact does not have any recorded consent audits yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                // Try parsing notes as JSON to extract source_ip and policy_version, or fallback
                let sourceIp = 'Unknown';
                let policyVersion = 'N/A';
                
                if (record.notes) {
                  try {
                    const parsed = JSON.parse(record.notes);
                    if (parsed.source_ip) sourceIp = parsed.source_ip;
                    if (parsed.policy_version) policyVersion = parsed.policy_version;
                  } catch (e) {
                    // Not JSON, ignore or treat as raw notes
                  }
                }

                return (
                  <div key={record.id} className="p-4 rounded-xl border border-accent-soft/30 hover:border-accent/30 transition-colors bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[record.status] ?? 'bg-graphite/10 text-graphite/60'}`}>
                            {STATUS_LABELS[record.status] ?? record.status}
                          </span>
                          <span className="text-xs font-semibold text-graphite uppercase tracking-wider">
                            {CONSENT_TYPE_LABELS[record.consent_type] ?? record.consent_type}
                          </span>
                        </div>
                        <p className="text-xs text-graphite/60 flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3" /> Agreed at: {new Date(record.recorded_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-accent-soft/50 text-graphite/70 px-2 py-1 rounded capitalize border border-accent-soft/50">
                          {record.channel} Channel
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-accent-soft/20 mt-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-graphite/40" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-graphite/50">Source IP</p>
                          <p className="text-xs font-medium text-graphite">{sourceIp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-graphite/40" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-graphite/50">Policy Version</p>
                          <p className="text-xs font-medium text-graphite">{policyVersion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
