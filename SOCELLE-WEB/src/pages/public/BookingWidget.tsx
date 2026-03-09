import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, ChevronRight, ChevronLeft, Calendar as CalIcon, Clock, User, Scissors } from 'lucide-react';
import { usePublicBookingServices, usePublicBookingStaff, type BookingService, type BookingStaff } from '../../lib/useBooking';
import { supabase } from '../../lib/supabase';
import { upsertBookingContact } from '../../lib/crmContactLinking';

const STEPS = ['Service', 'Provider', 'Date & Time', 'Your Info', 'Confirm'] as const;
type Step = typeof STEPS[number];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 9; h <= 18; h++) {
    slots.push(`${h}:00`);
    if (h < 18) slots.push(`${h}:30`);
  }
  return slots;
})();

function toCalendarStamp(isoDate: string): string {
  return isoDate.replace(/[-:]/g, '').replace('.000', '');
}

function buildGoogleCalendarUrl(params: {
  title: string;
  details: string;
  startIso: string;
  endIso: string;
  location: string;
}): string {
  const start = toCalendarStamp(params.startIso);
  const end = toCalendarStamp(params.endIso);
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', params.title);
  url.searchParams.set('details', params.details);
  url.searchParams.set('location', params.location);
  url.searchParams.set('dates', `${start}/${end}`);
  return url.toString();
}

function buildTeamsMeetingUrl(params: {
  title: string;
  details: string;
  startIso: string;
  endIso: string;
}): string {
  const url = new URL('https://teams.microsoft.com/l/meeting/new');
  url.searchParams.set('subject', params.title);
  url.searchParams.set('startTime', params.startIso);
  url.searchParams.set('endTime', params.endIso);
  url.searchParams.set('content', params.details);
  return url.toString();
}

export default function BookingWidget() {
  const { slug } = useParams<{ slug: string }>();
  const { services, businessId, businessName, loading, error } = usePublicBookingServices(slug);
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<BookingService | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<BookingStaff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [calDate, setCalDate] = useState(new Date());
  const [clientInfo, setClientInfo] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { staff } = usePublicBookingStaff(businessId, selectedService?.id);

  const canNext = useMemo(() => {
    if (step === 0) return !!selectedService;
    if (step === 1) return true; // staff optional
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return !!clientInfo.first_name.trim() && !!clientInfo.last_name.trim();
    return false;
  }, [step, selectedService, selectedDate, selectedTime, clientInfo]);

  const handleBook = useCallback(async () => {
    if (!businessId || !selectedService || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const [h, m] = selectedTime.split(':').map(Number);
      const start = new Date(`${selectedDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
      const end = new Date(start.getTime() + selectedService.duration_minutes * 60000);

      const contactId =
        (await upsertBookingContact({
          businessId,
          firstName: clientInfo.first_name.trim(),
          lastName: clientInfo.last_name.trim(),
          email: clientInfo.email.trim() || null,
          phone: clientInfo.phone.trim() || null,
          source: 'booking_widget',
          notes: `Public booking from ${slug ?? 'business page'}`,
        })) ?? null;

      const servicePriceCents =
        typeof (selectedService as BookingService & { price_cents?: number }).price_cents === 'number'
          ? (selectedService as BookingService & { price_cents?: number }).price_cents!
          : Math.round((selectedService.price ?? 0) * 100);

      const legacyInsert = await supabase.from('appointments').insert({
        business_id: businessId,
        service_id: selectedService.id,
        staff_id: selectedStaff?.id ?? null,
        contact_id: contactId,
        client_first_name: clientInfo.first_name.trim(),
        client_last_name: clientInfo.last_name.trim(),
        client_email: clientInfo.email.trim() || null,
        client_phone: clientInfo.phone.trim() || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'scheduled',
        notes: `Public booking widget submission (${slug ?? 'unknown slug'})`,
      });

      if (legacyInsert.error) {
        const normalizedInsert = await supabase.from('appointments').insert({
          business_id: businessId,
          service_id: selectedService.id,
          staff_id: selectedStaff?.id ?? null,
          client_id: contactId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: 'confirmed',
          price_cents: servicePriceCents,
          notes_client: `Public booking widget submission (${slug ?? 'unknown slug'})`,
          source: 'online',
        });
        if (normalizedInsert.error) throw normalizedInsert.error;
      }

      setConfirmed(true);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }, [businessId, selectedService, selectedStaff, selectedDate, selectedTime, clientInfo]);

  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const todayStr = new Date().toISOString().split('T')[0];
  const confirmedStartIso =
    selectedDate && selectedTime
      ? new Date(`${selectedDate}T${selectedTime}:00`).toISOString()
      : null;
  const confirmedEndIso =
    confirmedStartIso && selectedService
      ? new Date(
          new Date(confirmedStartIso).getTime() + selectedService.duration_minutes * 60000,
        ).toISOString()
      : null;
  const calendarTitle =
    selectedService && businessName
      ? `${selectedService.name} at ${businessName}`
      : 'Socelle appointment';
  const calendarDetails =
    selectedService && selectedStaff
      ? `${selectedService.name} with ${selectedStaff.first_name} ${selectedStaff.last_name}.`
      : selectedService
        ? `${selectedService.name} appointment.`
        : 'Appointment booked via Socelle.';

  if (loading) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-graphite/60">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-graphite/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-mn-surface p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-signal-up/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-signal-up" />
          </div>
          <h2 className="text-xl font-semibold text-graphite mb-2">Booking Confirmed</h2>
          <p className="text-sm text-graphite/60 mb-4">
            Your appointment at {businessName} has been scheduled for {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}.
          </p>
          <p className="text-sm text-graphite/60">{selectedService?.name}{selectedStaff ? ` with ${selectedStaff.first_name} ${selectedStaff.last_name}` : ''}</p>
          {confirmedStartIso && confirmedEndIso && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={buildGoogleCalendarUrl({
                  title: calendarTitle,
                  details: calendarDetails,
                  startIso: confirmedStartIso,
                  endIso: confirmedEndIso,
                  location: businessName || 'Socelle booking',
                })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-accent/30 text-sm text-graphite hover:bg-accent-soft transition-colors"
              >
                Add to Google Calendar
              </a>
              <a
                href={buildTeamsMeetingUrl({
                  title: calendarTitle,
                  details: calendarDetails,
                  startIso: confirmedStartIso,
                  endIso: confirmedEndIso,
                })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-accent/30 text-sm text-graphite hover:bg-accent-soft transition-colors"
              >
                Create Teams Invite
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{businessName ? `Book with ${businessName}` : 'Book an Appointment'} | Socelle</title>
        <meta name="description" content={`Book an appointment${businessName ? ` with ${businessName}` : ''} on Socelle. Professional beauty and medspa services.`} />
        <meta property="og:title" content={`${businessName ? `Book with ${businessName}` : 'Book an Appointment'} | Socelle`} />
        <meta property="og:description" content={`Book an appointment${businessName ? ` with ${businessName}` : ''} on Socelle.`} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
    <div className="min-h-screen bg-mn-bg py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-graphite">{businessName}</h1>
          <p className="text-sm text-graphite/60 mt-1">Book an appointment</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${i <= step ? 'bg-accent text-white' : 'bg-mn-surface text-graphite/40'}`}>{i + 1}</div>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < step ? 'bg-accent' : 'bg-mn-surface'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-mn-surface p-6">
          <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">{STEPS[step]}</h2>

          {/* Step 1: Service */}
          {step === 0 && (
            <div className="space-y-2">
              {services.length === 0 ? (
                <p className="text-sm text-graphite/60 py-4">No services available</p>
              ) : (
                services.map(svc => (
                  <button key={svc.id} onClick={() => setSelectedService(svc)} className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedService?.id === svc.id ? 'border-accent bg-accent/5' : 'border-mn-surface hover:border-accent/30'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-graphite">{svc.name}</p>
                        {svc.description && <p className="text-xs text-graphite/60 mt-0.5">{svc.description}</p>}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-graphite/50">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{svc.duration_minutes} min</span>
                          <span>${svc.price}</span>
                        </div>
                      </div>
                      {selectedService?.id === svc.id && <Check className="w-5 h-5 text-accent flex-shrink-0" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Step 2: Staff */}
          {step === 1 && (
            <div className="space-y-2">
              <button onClick={() => setSelectedStaff(null)} className={`w-full text-left p-4 rounded-xl border transition-colors ${!selectedStaff ? 'border-accent bg-accent/5' : 'border-mn-surface hover:border-accent/30'}`}>
                <p className="text-sm font-medium text-graphite">No preference</p>
                <p className="text-xs text-graphite/60">Any available provider</p>
              </button>
              {staff.map(s => (
                <button key={s.id} onClick={() => setSelectedStaff(s)} className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedStaff?.id === s.id ? 'border-accent bg-accent/5' : 'border-mn-surface hover:border-accent/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
                      {s.first_name[0]}{s.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-graphite">{s.first_name} {s.last_name}</p>
                      {s.title && <p className="text-xs text-graphite/60">{s.title}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-full border border-mn-surface flex items-center justify-center hover:border-accent/30"><ChevronLeft className="w-4 h-4 text-graphite/50" /></button>
                  <span className="text-sm font-medium text-graphite">{calDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-full border border-mn-surface flex items-center justify-center hover:border-accent/30"><ChevronRight className="w-4 h-4 text-graphite/50" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`} className="text-center text-[10px] font-medium text-graphite/40 py-1">{d}</div>)}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                    const isPast = dayStr < todayStr;
                    const isSelected = dayStr === selectedDate;
                    return (
                      <button key={i + 1} disabled={isPast} onClick={() => setSelectedDate(dayStr)} className={`w-full aspect-square rounded-full text-xs font-medium transition-colors ${isPast ? 'text-graphite/20 cursor-not-allowed' : isSelected ? 'bg-accent text-white' : 'text-graphite hover:bg-accent/10'}`}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedDate && (
                <div>
                  <p className="text-xs font-medium text-graphite/60 mb-2">Available times</p>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)} className={`h-9 rounded-lg text-xs font-medium border transition-colors ${selectedTime === t ? 'bg-accent text-white border-accent' : 'border-mn-surface text-graphite hover:border-accent/30'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Client Info */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-graphite/60 mb-1">First Name *</label>
                  <input type="text" required value={clientInfo.first_name} onChange={e => setClientInfo(c => ({ ...c, first_name: e.target.value }))} className="w-full h-10 px-3 border border-mn-surface rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-graphite/60 mb-1">Last Name *</label>
                  <input type="text" required value={clientInfo.last_name} onChange={e => setClientInfo(c => ({ ...c, last_name: e.target.value }))} className="w-full h-10 px-3 border border-mn-surface rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-graphite/60 mb-1">Email</label>
                <input type="email" value={clientInfo.email} onChange={e => setClientInfo(c => ({ ...c, email: e.target.value }))} className="w-full h-10 px-3 border border-mn-surface rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-graphite/60 mb-1">Phone</label>
                <input type="tel" value={clientInfo.phone} onChange={e => setClientInfo(c => ({ ...c, phone: e.target.value }))} className="w-full h-10 px-3 border border-mn-surface rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3"><Scissors className="w-4 h-4 text-graphite/40" /><div><span className="text-graphite/60">Service:</span> <span className="text-graphite font-medium">{selectedService?.name}</span></div></div>
                {selectedStaff && <div className="flex items-center gap-3"><User className="w-4 h-4 text-graphite/40" /><div><span className="text-graphite/60">Provider:</span> <span className="text-graphite font-medium">{selectedStaff.first_name} {selectedStaff.last_name}</span></div></div>}
                <div className="flex items-center gap-3"><CalIcon className="w-4 h-4 text-graphite/40" /><div><span className="text-graphite/60">Date:</span> <span className="text-graphite font-medium">{selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span></div></div>
                <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-graphite/40" /><div><span className="text-graphite/60">Time:</span> <span className="text-graphite font-medium">{selectedTime}</span></div></div>
                <div className="flex items-center gap-3"><User className="w-4 h-4 text-graphite/40" /><div><span className="text-graphite/60">Client:</span> <span className="text-graphite font-medium">{clientInfo.first_name} {clientInfo.last_name}</span></div></div>
                {selectedService && <div className="pt-2 border-t border-mn-surface"><span className="text-graphite/60">Total:</span> <span className="text-graphite font-semibold">${selectedService.price} · {selectedService.duration_minutes} min</span></div>}
              </div>
              {submitError && <p className="text-sm text-signal-down">{submitError}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-mn-surface">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="inline-flex items-center gap-1 text-sm text-graphite/60 hover:text-graphite"><ChevronLeft className="w-4 h-4" /> Back</button>
            ) : <div />}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext} className="inline-flex items-center gap-1 h-10 px-5 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-40 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleBook} disabled={submitting} className="h-10 px-6 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50 transition-colors">
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
