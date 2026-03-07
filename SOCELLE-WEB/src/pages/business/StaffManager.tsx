import { useState } from 'react';
import { Users, Plus, Pencil, Calendar, Clock, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useBookingStaff, useStaffSchedules, useBookingServices, useStaffServices, type NewStaff } from '../../lib/useBooking';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StaffManager() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const { staff, loading, isLive, createStaff, updateStaff, deleteStaff } = useBookingStaff(businessId);
  const { services } = useBookingServices(businessId);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', title: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setForm({ first_name: '', last_name: '', email: '', phone: '', title: '', bio: '' }); setEditId(null); setShowForm(false); };

  const handleEdit = (s: typeof staff[0]) => {
    setForm({ first_name: s.first_name, last_name: s.last_name, email: s.email ?? '', phone: s.phone ?? '', title: s.title ?? '', bio: s.bio ?? '' });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setSaving(true);
    try {
      const payload: NewStaff = {
        business_id: businessId,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        title: form.title || undefined,
        bio: form.bio || undefined,
      };
      if (editId) {
        await updateStaff(editId, payload);
      } else {
        await createStaff(payload);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this staff member?')) return;
    await deleteStaff(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pro-charcoal">Staff</h1>
          <p className="text-sm text-pro-warm-gray mt-1">Manage team members, schedules, and service assignments</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-pro-stone/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-pro-charcoal">{editId ? 'Edit Staff' : 'New Staff Member'}</h2>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-pro-warm-gray" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1">First Name *</label>
              <input type="text" required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1">Last Name *</label>
              <input type="text" required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Senior Esthetician" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50 resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="h-9 px-4 text-sm text-pro-warm-gray">Cancel</button>
            <button type="submit" disabled={saving} className="h-9 px-5 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">{[1, 2].map(i => <div key={i} className="h-24 bg-pro-stone/10 rounded-xl" />)}</div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl border border-pro-stone/30 p-8 text-center">
          <Users className="w-10 h-10 text-pro-stone mx-auto mb-3" />
          <p className="text-sm text-pro-warm-gray">No staff members yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-pro-stone/30 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {s.avatar_url ? (
                    <img src={s.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-pro-gold/10 flex items-center justify-center text-sm font-semibold text-pro-gold">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-pro-charcoal">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-pro-warm-gray">{s.title ?? 'Team Member'}{s.email ? ` · ${s.email}` : ''}</p>
                    {!s.is_active && <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedStaff(selectedStaff === s.id ? null : s.id)} className="w-8 h-8 rounded-full hover:bg-pro-ivory flex items-center justify-center"><Calendar className="w-3.5 h-3.5 text-pro-warm-gray" /></button>
                  <button onClick={() => handleEdit(s)} className="w-8 h-8 rounded-full hover:bg-pro-ivory flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-pro-warm-gray" /></button>
                  <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center"><X className="w-3.5 h-3.5 text-signal-down" /></button>
                </div>
              </div>
              {selectedStaff === s.id && <StaffSchedulePanel staffId={s.id} services={services} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StaffSchedulePanel({ staffId, services }: { staffId: string; services: { id: string; name: string }[] }) {
  const { schedules, timeOff, addTimeOff, deleteTimeOff } = useStaffSchedules(staffId);
  const { serviceIds, assignService, unassignService } = useStaffServices(staffId);
  const [showTimeOff, setShowTimeOff] = useState(false);
  const [toForm, setToForm] = useState({ start_date: '', end_date: '', reason: '' });

  const handleAddTimeOff = async () => {
    if (!toForm.start_date || !toForm.end_date) return;
    await addTimeOff({ staff_id: staffId, start_date: toForm.start_date, end_date: toForm.end_date, reason: toForm.reason || undefined });
    setToForm({ start_date: '', end_date: '', reason: '' });
    setShowTimeOff(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-pro-stone/10 space-y-4">
      {/* Schedule */}
      <div>
        <h3 className="text-xs font-semibold text-pro-charcoal uppercase tracking-wider mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Weekly Schedule</h3>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day, i) => {
            const sched = schedules.find(s => s.day_of_week === i);
            return (
              <div key={day} className={`text-center p-1.5 rounded text-[10px] ${sched?.is_available ? 'bg-signal-up/10 text-signal-up' : 'bg-pro-stone/10 text-pro-warm-gray'}`}>
                <div className="font-medium">{day.slice(0, 3)}</div>
                {sched?.is_available ? <div>{sched.start_time.slice(0, 5)}-{sched.end_time.slice(0, 5)}</div> : <div>Off</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Off */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-pro-charcoal uppercase tracking-wider">Time Off</h3>
          <button onClick={() => setShowTimeOff(s => !s)} className="text-xs text-accent font-medium">{showTimeOff ? 'Cancel' : '+ Add'}</button>
        </div>
        {showTimeOff && (
          <div className="flex gap-2 mb-2">
            <input type="date" value={toForm.start_date} onChange={e => setToForm(f => ({ ...f, start_date: e.target.value }))} className="h-8 px-2 border border-pro-stone/30 rounded-lg text-xs text-pro-charcoal focus:outline-none focus:border-accent/50" />
            <input type="date" value={toForm.end_date} onChange={e => setToForm(f => ({ ...f, end_date: e.target.value }))} className="h-8 px-2 border border-pro-stone/30 rounded-lg text-xs text-pro-charcoal focus:outline-none focus:border-accent/50" />
            <input type="text" value={toForm.reason} onChange={e => setToForm(f => ({ ...f, reason: e.target.value }))} placeholder="Reason" className="flex-1 h-8 px-2 border border-pro-stone/30 rounded-lg text-xs text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
            <button onClick={handleAddTimeOff} className="h-8 px-3 bg-mn-dark text-white text-xs rounded-full">Add</button>
          </div>
        )}
        {timeOff.length === 0 ? (
          <p className="text-xs text-pro-warm-gray">No time off scheduled</p>
        ) : (
          <div className="space-y-1">{timeOff.map(to => (
            <div key={to.id} className="flex items-center justify-between text-xs">
              <span className="text-pro-charcoal">{new Date(to.start_date).toLocaleDateString()} - {new Date(to.end_date).toLocaleDateString()}{to.reason ? ` (${to.reason})` : ''}</span>
              <button onClick={() => deleteTimeOff(to.id)} className="text-signal-down hover:underline">Remove</button>
            </div>
          ))}</div>
        )}
      </div>

      {/* Service Assignments */}
      <div>
        <h3 className="text-xs font-semibold text-pro-charcoal uppercase tracking-wider mb-2">Service Assignments</h3>
        <div className="flex flex-wrap gap-2">
          {services.map(svc => {
            const assigned = serviceIds.includes(svc.id);
            return (
              <button key={svc.id} onClick={() => assigned ? unassignService(svc.id) : assignService(svc.id)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${assigned ? 'bg-accent text-white border-accent' : 'border-pro-stone/30 text-pro-warm-gray hover:border-accent/30'}`}>
                {svc.name}
              </button>
            );
          })}
          {services.length === 0 && <p className="text-xs text-pro-warm-gray">No services to assign</p>}
        </div>
      </div>
    </div>
  );
}
