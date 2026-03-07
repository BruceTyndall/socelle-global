import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, ClipboardList } from 'lucide-react';
import { useClientTreatmentRecords } from '../../lib/useClientRecords';
import { useCrmContactDetail } from '../../lib/useCrmContacts';

export default function ClientRecords() {
  const { id } = useParams<{ id: string }>();
  const { contact } = useCrmContactDetail(id);
  const { records, loading, isLive } = useClientTreatmentRecords(id);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/portal/crm/contacts/${id}`} className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-pro-warm-gray" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-pro-charcoal">Service Records</h1>
          {contact && <p className="text-sm text-pro-warm-gray">{contact.first_name} {contact.last_name}</p>}
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <Link to={`/portal/crm/contacts/${id}/records/new`} className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Record
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-pro-stone/10 rounded-xl" />)}</div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-pro-stone/30 p-8 text-center">
          <ClipboardList className="w-10 h-10 text-pro-stone mx-auto mb-3" />
          <p className="text-sm text-pro-warm-gray">No service records yet</p>
          <Link to={`/portal/crm/contacts/${id}/records/new`} className="inline-flex items-center gap-1 text-sm text-accent mt-2">
            <Plus className="w-4 h-4" /> Create first record
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-pro-stone/30 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-pro-charcoal">{r.service_name}</p>
                  <p className="text-xs text-pro-warm-gray mt-0.5">
                    {new Date(r.performed_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    {r.performed_by ? ` · by ${r.performed_by}` : ''}
                  </p>
                </div>
                {r.follow_up_date && (
                  <span className="text-[10px] font-medium bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                    Follow-up: {new Date(r.follow_up_date).toLocaleDateString()}
                  </span>
                )}
              </div>

              {r.notes && <p className="text-sm text-pro-warm-gray mt-3">{r.notes}</p>}
              {r.formula && (
                <div className="mt-2 p-2 bg-pro-ivory rounded-lg">
                  <p className="text-xs text-pro-warm-gray">Formula</p>
                  <p className="text-sm text-pro-charcoal">{r.formula}</p>
                </div>
              )}
              {r.products_used && r.products_used.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-pro-warm-gray mb-1">Products used</p>
                  <div className="flex flex-wrap gap-1">{r.products_used.map((p, i) => <span key={i} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{p}</span>)}</div>
                </div>
              )}

              {(r.before_photo_url || r.after_photo_url) && (
                <div className="flex gap-4 mt-3">
                  {r.before_photo_url && (
                    <div>
                      <p className="text-[10px] text-pro-warm-gray mb-1 uppercase tracking-wider">Before</p>
                      <img src={r.before_photo_url} alt="Before treatment" className="w-32 h-32 object-cover rounded-lg border border-pro-stone/20" />
                    </div>
                  )}
                  {r.after_photo_url && (
                    <div>
                      <p className="text-[10px] text-pro-warm-gray mb-1 uppercase tracking-wider">After</p>
                      <img src={r.after_photo_url} alt="After treatment" className="w-32 h-32 object-cover rounded-lg border border-pro-stone/20" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
