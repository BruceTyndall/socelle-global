import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Circle,
  Plus,
  Clock,
  AlertTriangle,
  Trash2,
  Calendar,
  GraduationCap,
  Megaphone,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmTasks, type NewCrmTask } from '../../lib/useCrmTasks';
import { useCrmContacts } from '../../lib/useCrmContacts';
import { exportToCsv } from '../../lib/csvExport';
import { supabase } from '../../lib/supabase';

const PRIORITY_STYLES: Record<string, { bg: string; label: string }> = {
  high: { bg: 'bg-signal-down/10 text-signal-down', label: 'High' },
  medium: { bg: 'bg-signal-warn/10 text-signal-warn', label: 'Medium' },
  low: { bg: 'bg-accent/10 text-accent', label: 'Low' },
};

const FILTER_OPTIONS = ['all', 'open', 'completed', 'overdue'] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

type SequenceTemplateKey = 'lead_nurture_14d' | 'post_purchase_30d' | 'reactivation_21d';

interface SequenceStep {
  offsetDays: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const SEQUENCE_TEMPLATES: Record<
  SequenceTemplateKey,
  { label: string; description: string; steps: SequenceStep[] }
> = {
  lead_nurture_14d: {
    label: 'Lead Nurture (14 days)',
    description: 'Intro, consultation outreach, and offer follow-up for new leads.',
    steps: [
      {
        offsetDays: 0,
        title: 'Welcome + profile qualification',
        description: 'Confirm needs, preferences, and consent before activation.',
        priority: 'medium',
      },
      {
        offsetDays: 2,
        title: 'Consultation outreach',
        description: 'Reach out to book a consultation or discovery call.',
        priority: 'high',
      },
      {
        offsetDays: 7,
        title: 'Education follow-up',
        description: 'Share educational content and routine recommendations.',
        priority: 'medium',
      },
      {
        offsetDays: 14,
        title: 'Conversion follow-up',
        description: 'Offer next step with clear CTA and timeline.',
        priority: 'high',
      },
    ],
  },
  post_purchase_30d: {
    label: 'Post-Purchase Retention (30 days)',
    description: 'Onboarding, check-in, and reorder reminder for paying clients.',
    steps: [
      {
        offsetDays: 1,
        title: 'Post-purchase check-in',
        description: 'Confirm delivery and answer usage questions.',
        priority: 'medium',
      },
      {
        offsetDays: 10,
        title: 'Results checkpoint',
        description: 'Ask for progress update and adjust routine if needed.',
        priority: 'medium',
      },
      {
        offsetDays: 21,
        title: 'Cross-sell recommendation',
        description: 'Recommend complementary treatment or product set.',
        priority: 'low',
      },
      {
        offsetDays: 30,
        title: 'Reorder reminder',
        description: 'Prompt reorder and schedule follow-up appointment.',
        priority: 'high',
      },
    ],
  },
  reactivation_21d: {
    label: 'Reactivation (21 days)',
    description: 'Win-back sequence for inactive or dormant contacts.',
    steps: [
      {
        offsetDays: 0,
        title: 'Reactivation outreach',
        description: 'Reach out with personalized reason to return.',
        priority: 'high',
      },
      {
        offsetDays: 7,
        title: 'Value reminder',
        description: 'Share outcomes, testimonials, or use-case value.',
        priority: 'medium',
      },
      {
        offsetDays: 14,
        title: 'Offer + urgency',
        description: 'Present limited-time activation offer.',
        priority: 'high',
      },
      {
        offsetDays: 21,
        title: 'Final follow-up',
        description: 'Close sequence and route to nurture segment.',
        priority: 'medium',
      },
    ],
  },
};

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(baseDate: string, offsetDays: number): string {
  const base = new Date(`${baseDate}T09:00:00`);
  base.setDate(base.getDate() + offsetDays);
  return toDateInput(base);
}

function buildGoogleCalendarLink(params: {
  title: string;
  details?: string;
  startsAt: string;
  durationMinutes: number;
}): string {
  const start = new Date(params.startsAt);
  const end = new Date(start.getTime() + params.durationMinutes * 60_000);

  const toUtcStamp = (value: Date) =>
    value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const qp = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    details: params.details ?? '',
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
  });

  return `https://calendar.google.com/calendar/render?${qp.toString()}`;
}

function buildTeamsCalendarLink(params: {
  title: string;
  details?: string;
  startsAt: string;
  durationMinutes: number;
}): string {
  const start = new Date(params.startsAt);
  const end = new Date(start.getTime() + params.durationMinutes * 60_000);

  const qp = new URLSearchParams({
    subject: params.title,
    body: params.details ?? '',
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    location: 'Microsoft Teams',
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${qp.toString()}`;
}

export default function CrmTasks() {
  const { profile, user } = useAuth();
  const businessId = profile?.business_id;
  const { tasks, loading, isLive, createTask, completeTask, deleteTask } = useCrmTasks(businessId);
  const { contacts } = useCrmContacts(businessId);

  const [filter, setFilter] = useState<FilterOption>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    assignee_name: '',
  });
  const [saving, setSaving] = useState(false);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [learningAssignment, setLearningAssignment] = useState({
    user_id: '',
    course_id: '',
    due_date: '',
  });

  const [activationPlan, setActivationPlan] = useState({
    name: '',
    channel: 'social',
    schedule_at: '',
    segment_id: '',
    notes: '',
  });

  const [sequencePlan, setSequencePlan] = useState({
    template: 'lead_nurture_14d' as SequenceTemplateKey,
    contact_id: '',
    start_date: toDateInput(new Date()),
  });

  const [virtualInvite, setVirtualInvite] = useState({
    title: '',
    contact_id: '',
    starts_at: '',
    duration_minutes: 30,
    notes: '',
  });

  const now = new Date();

  const { data: staffMembers = [] } = useQuery({
    queryKey: ['crm_task_staff_members', businessId],
    queryFn: async () => {
      const { data: members, error: membersError } = await supabase
        .from('business_members')
        .select('user_id')
        .eq('business_id', businessId!);

      if (membersError) {
        if (membersError.code === '42P01') return [] as Array<{ id: string; label: string }>;
        throw new Error(membersError.message);
      }

      const userIds = (members ?? [])
        .map((row: { user_id: string }) => row.user_id)
        .filter(Boolean);

      if (userIds.length === 0) return [] as Array<{ id: string; label: string }>;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      return (profiles ?? []).map(
        (row: { id: string; full_name: string | null; email: string | null }) => ({
          id: row.id,
          label: row.full_name || row.email || 'Team member',
        }),
      );
    },
    enabled: !!businessId,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['crm_task_training_courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('is_published', true)
        .order('title', { ascending: true });

      if (error) {
        if (error.code === '42P01') return [] as Array<{ id: string; title: string }>;
        throw new Error(error.message);
      }

      return (data ?? []) as Array<{ id: string; title: string }>;
    },
  });

  const { data: segments = [] } = useQuery({
    queryKey: ['crm_task_marketing_segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audience_segments')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        if (error.code === '42P01') return [] as Array<{ id: string; name: string }>;
        throw new Error(error.message);
      }

      return (data ?? []) as Array<{ id: string; name: string }>;
    },
  });

  const assignLearningMutation = useMutation({
    mutationFn: async () => {
      if (!businessId || !learningAssignment.user_id || !learningAssignment.course_id) {
        throw new Error('Select a team member and a course.');
      }

      const expiresAt = learningAssignment.due_date
        ? new Date(`${learningAssignment.due_date}T23:59:59`).toISOString()
        : null;

      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .upsert(
          {
            user_id: learningAssignment.user_id,
            course_id: learningAssignment.course_id,
            status: 'active',
            progress_pct: 0,
            enrolled_at: new Date().toISOString(),
            ...(expiresAt ? { expires_at: expiresAt } : {}),
          },
          { onConflict: 'course_id,user_id' },
        );

      if (enrollmentError) {
        throw new Error(enrollmentError.message);
      }

      const assignee =
        staffMembers.find((member) => member.id === learningAssignment.user_id)?.label ??
        'Team member';
      const courseTitle =
        courses.find((course) => course.id === learningAssignment.course_id)?.title ??
        'Training module';

      await createTask({
        business_id: businessId,
        title: `Training assigned: ${courseTitle}`,
        description: `Assigned to ${assignee}. Track completion in Education.`,
        due_date: learningAssignment.due_date || undefined,
        priority: 'medium',
        status: 'open',
        assignee_id: learningAssignment.user_id,
        assignee_name: assignee,
      });

      return { assignee, courseTitle };
    },
    onSuccess: ({ assignee, courseTitle }) => {
      setActionMessage({
        type: 'success',
        text: `${courseTitle} assigned to ${assignee}.`,
      });
      setLearningAssignment({ user_id: '', course_id: '', due_date: '' });
    },
    onError: (error: unknown) => {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to assign learning module.',
      });
    },
  });

  const scheduleActivationMutation = useMutation({
    mutationFn: async () => {
      if (!businessId || !activationPlan.name.trim() || !activationPlan.schedule_at) {
        throw new Error('Name and schedule time are required.');
      }

      const scheduleIso = new Date(activationPlan.schedule_at).toISOString();
      const sourceMeta = {
        source: 'crm_activation_scheduler',
        notes: activationPlan.notes.trim() || '',
      };

      let campaignId = '';

      const primaryInsert = await supabase
        .from('campaigns')
        .insert({
          name: activationPlan.name.trim(),
          type: activationPlan.channel,
          status: 'scheduled',
          audience_segment_id: activationPlan.segment_id || null,
          scheduled_start_at: scheduleIso,
          goal: activationPlan.notes.trim() || null,
          created_by: user?.id ?? null,
          tenant_id: businessId,
          metadata: sourceMeta,
        })
        .select('id')
        .single();

      if (primaryInsert.error) {
        const fallbackInsert = await supabase
          .from('campaigns')
          .insert({
            name: activationPlan.name.trim(),
            type: activationPlan.channel,
            status: 'scheduled',
            audience_segment_id: activationPlan.segment_id || null,
            scheduled_at: scheduleIso,
            subject: activationPlan.name.trim(),
            preview_text: activationPlan.notes.trim() || null,
            body: sourceMeta,
          })
          .select('id')
          .single();

        if (fallbackInsert.error || !fallbackInsert.data) {
          throw new Error(fallbackInsert.error?.message || primaryInsert.error.message);
        }

        campaignId = (fallbackInsert.data as { id: string }).id;
      } else {
        campaignId = (primaryInsert.data as { id: string }).id;
      }

      await createTask({
        business_id: businessId,
        title: `Activation scheduled: ${activationPlan.name.trim()}`,
        description: `Channel: ${activationPlan.channel}. Campaign ID: ${campaignId}.`,
        due_date: scheduleIso.slice(0, 10),
        priority: 'medium',
        status: 'open',
      });

      return { scheduleIso };
    },
    onSuccess: ({ scheduleIso }) => {
      setActionMessage({
        type: 'success',
        text: `Marketing activation scheduled for ${new Date(scheduleIso).toLocaleString()}.`,
      });
      setActivationPlan({
        name: '',
        channel: 'social',
        schedule_at: '',
        segment_id: '',
        notes: '',
      });
    },
    onError: (error: unknown) => {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to schedule activation.',
      });
    },
  });

  const runSequenceMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) {
        throw new Error('Business context missing.');
      }

      const template = SEQUENCE_TEMPLATES[sequencePlan.template];
      const selectedContact = contacts.find((contact) => contact.id === sequencePlan.contact_id);
      const contactName = selectedContact
        ? `${selectedContact.first_name} ${selectedContact.last_name}`
        : 'Unassigned contact';

      for (const step of template.steps) {
        const dueDate = addDays(sequencePlan.start_date, step.offsetDays);
        await createTask({
          business_id: businessId,
          contact_id: sequencePlan.contact_id || undefined,
          title: `${step.title}${selectedContact ? ` — ${contactName}` : ''}`,
          description: step.description,
          due_date: dueDate,
          priority: step.priority,
          status: 'open',
        });
      }

      return { count: template.steps.length, templateLabel: template.label };
    },
    onSuccess: ({ count, templateLabel }) => {
      setActionMessage({
        type: 'success',
        text: `${templateLabel} created with ${count} scheduled follow-up tasks.`,
      });
    },
    onError: (error: unknown) => {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create sequence.',
      });
    },
  });

  const createVirtualReminderMutation = useMutation({
    mutationFn: async () => {
      if (!businessId || !virtualInvite.title.trim() || !virtualInvite.starts_at) {
        throw new Error('Virtual invite title and start time are required.');
      }

      const selectedContact = contacts.find((contact) => contact.id === virtualInvite.contact_id);
      const contactName = selectedContact
        ? `${selectedContact.first_name} ${selectedContact.last_name}`
        : 'No contact selected';

      const dueDate = virtualInvite.starts_at.slice(0, 10);
      const googleLink = buildGoogleCalendarLink({
        title: virtualInvite.title.trim(),
        details: virtualInvite.notes,
        startsAt: virtualInvite.starts_at,
        durationMinutes: virtualInvite.duration_minutes,
      });
      const teamsLink = buildTeamsCalendarLink({
        title: virtualInvite.title.trim(),
        details: virtualInvite.notes,
        startsAt: virtualInvite.starts_at,
        durationMinutes: virtualInvite.duration_minutes,
      });

      await createTask({
        business_id: businessId,
        contact_id: virtualInvite.contact_id || undefined,
        title: `Virtual follow-up: ${virtualInvite.title.trim()}`,
        description: [
          `Contact: ${contactName}`,
          `Start: ${new Date(virtualInvite.starts_at).toLocaleString()}`,
          `Google Calendar: ${googleLink}`,
          `Microsoft Teams/Outlook: ${teamsLink}`,
          virtualInvite.notes ? `Notes: ${virtualInvite.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        due_date: dueDate,
        priority: 'medium',
      });

      return { googleLink, teamsLink };
    },
    onSuccess: () => {
      setActionMessage({
        type: 'success',
        text: 'Virtual booking reminder created with Google Calendar + Teams links.',
      });
    },
    onError: (error: unknown) => {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create virtual booking reminder.',
      });
    },
  });

  const filtered = useMemo(() => {
    let result = tasks;
    if (filter === 'open') result = result.filter((task) => task.status !== 'completed');
    else if (filter === 'completed') result = result.filter((task) => task.status === 'completed');
    else if (filter === 'overdue') {
      result = result.filter(
        (task) => task.status !== 'completed' && task.due_date && new Date(task.due_date) < now,
      );
    }
    return result;
  }, [tasks, filter, now]);

  const overdueCount = useMemo(
    () =>
      tasks.filter(
        (task) => task.status !== 'completed' && task.due_date && new Date(task.due_date) < now,
      ).length,
    [tasks, now],
  );

  const handleCreate = async () => {
    if (!businessId || !newTask.title.trim()) return;
    setSaving(true);
    try {
      const payload: NewCrmTask = {
        business_id: businessId,
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        due_date: newTask.due_date || undefined,
        priority: newTask.priority,
        assignee_name: newTask.assignee_name.trim() || undefined,
      };
      await createTask(payload);
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        assignee_name: '',
      });
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    exportToCsv(
      filtered.map((task) => ({
        title: task.title,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ?? '',
        assignee: task.assignee_name ?? '',
        description: task.description ?? '',
        created_at: task.created_at,
      })),
      'crm_tasks',
    );
  };

  const virtualInviteGoogleUrl = useMemo(() => {
    if (!virtualInvite.title.trim() || !virtualInvite.starts_at) return '';
    return buildGoogleCalendarLink({
      title: virtualInvite.title.trim(),
      details: virtualInvite.notes,
      startsAt: virtualInvite.starts_at,
      durationMinutes: virtualInvite.duration_minutes,
    });
  }, [virtualInvite]);

  const virtualInviteTeamsUrl = useMemo(() => {
    if (!virtualInvite.title.trim() || !virtualInvite.starts_at) return '';
    return buildTeamsCalendarLink({
      title: virtualInvite.title.trim(),
      details: virtualInvite.notes,
      startsAt: virtualInvite.starts_at,
      durationMinutes: virtualInvite.duration_minutes,
    });
  }, [virtualInvite]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Tasks</h1>
          <p className="text-sm text-graphite/60 mt-1">
            {tasks.filter((task) => task.status !== 'completed').length} open
            {overdueCount > 0 && (
              <span className="text-signal-down ml-1">({overdueCount} overdue)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
              DEMO
            </span>
          )}
          <button
            onClick={handleExport}
            className="h-9 px-3 text-xs font-medium text-graphite/60 border border-accent-soft/30 rounded-full hover:border-accent/30 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowAdd((state) => !state)}
            className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            actionMessage.type === 'success'
              ? 'bg-signal-up/5 border-signal-up/20 text-signal-up'
              : 'bg-signal-down/5 border-signal-down/20 text-signal-down'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-accent-soft/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">
              Assign Education Module
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={learningAssignment.user_id}
              onChange={(event) =>
                setLearningAssignment((prev) => ({ ...prev, user_id: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite bg-white"
            >
              <option value="">Select team member</option>
              {staffMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.label}
                </option>
              ))}
            </select>
            <select
              value={learningAssignment.course_id}
              onChange={(event) =>
                setLearningAssignment((prev) => ({ ...prev, course_id: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite bg-white"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={learningAssignment.due_date}
              onChange={(event) =>
                setLearningAssignment((prev) => ({ ...prev, due_date: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite"
            />
          </div>
          <button
            onClick={() => assignLearningMutation.mutate()}
            disabled={assignLearningMutation.isPending}
            className="h-9 px-4 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-hover disabled:opacity-50 inline-flex items-center gap-2"
          >
            {assignLearningMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Assign Module
          </button>
        </section>

        <section className="bg-white rounded-xl border border-accent-soft/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">
              Marketing Activation + Social Calendar
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={activationPlan.name}
              onChange={(event) =>
                setActivationPlan((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Activation name"
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite"
            />
            <select
              value={activationPlan.channel}
              onChange={(event) =>
                setActivationPlan((prev) => ({ ...prev, channel: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite bg-white"
            >
              <option value="social">Social</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="in_app">In App</option>
            </select>
            <input
              type="datetime-local"
              value={activationPlan.schedule_at}
              onChange={(event) =>
                setActivationPlan((prev) => ({ ...prev, schedule_at: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite"
            />
            <select
              value={activationPlan.segment_id}
              onChange={(event) =>
                setActivationPlan((prev) => ({ ...prev, segment_id: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite bg-white"
            >
              <option value="">All contacts</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={activationPlan.notes}
            onChange={(event) =>
              setActivationPlan((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="Activation notes"
            rows={2}
            className="w-full px-2.5 py-2 border border-accent-soft/30 rounded-lg text-sm text-graphite resize-none"
          />
          <button
            onClick={() => scheduleActivationMutation.mutate()}
            disabled={scheduleActivationMutation.isPending}
            className="h-9 px-4 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-hover disabled:opacity-50 inline-flex items-center gap-2"
          >
            {scheduleActivationMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Schedule Activation
          </button>
        </section>

        <section className="bg-white rounded-xl border border-accent-soft/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">
              Follow-Up Sequencing Automation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              value={sequencePlan.template}
              onChange={(event) =>
                setSequencePlan((prev) => ({
                  ...prev,
                  template: event.target.value as SequenceTemplateKey,
                }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite bg-white"
            >
              {Object.entries(SEQUENCE_TEMPLATES).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.label}
                </option>
              ))}
            </select>
            <select
              value={sequencePlan.contact_id}
              onChange={(event) =>
                setSequencePlan((prev) => ({ ...prev, contact_id: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite bg-white"
            >
              <option value="">No specific contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={sequencePlan.start_date}
              onChange={(event) =>
                setSequencePlan((prev) => ({ ...prev, start_date: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite"
            />
          </div>
          <p className="text-xs text-graphite/60">
            {SEQUENCE_TEMPLATES[sequencePlan.template].description}
          </p>
          <button
            onClick={() => runSequenceMutation.mutate()}
            disabled={runSequenceMutation.isPending}
            className="h-9 px-4 bg-accent text-white text-sm font-medium rounded-full hover:bg-accent-hover disabled:opacity-50 inline-flex items-center gap-2"
          >
            {runSequenceMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Launch Sequence
          </button>
        </section>

        <section className="bg-white rounded-xl border border-accent-soft/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">
              Google Calendar + Microsoft Teams Invites
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={virtualInvite.title}
              onChange={(event) =>
                setVirtualInvite((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Virtual booking title"
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite"
            />
            <select
              value={virtualInvite.contact_id}
              onChange={(event) =>
                setVirtualInvite((prev) => ({ ...prev, contact_id: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite bg-white"
            >
              <option value="">No specific contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={virtualInvite.starts_at}
              onChange={(event) =>
                setVirtualInvite((prev) => ({ ...prev, starts_at: event.target.value }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite"
            />
            <input
              type="number"
              min={15}
              max={180}
              value={virtualInvite.duration_minutes}
              onChange={(event) =>
                setVirtualInvite((prev) => ({
                  ...prev,
                  duration_minutes: Math.max(15, Number(event.target.value) || 30),
                }))
              }
              className="h-9 px-2.5 border border-accent-soft/30 rounded-lg text-sm text-graphite"
            />
          </div>
          <textarea
            value={virtualInvite.notes}
            onChange={(event) =>
              setVirtualInvite((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="Invite notes"
            rows={2}
            className="w-full px-2.5 py-2 border border-accent-soft/30 rounded-lg text-sm text-graphite resize-none"
          />
          <div className="flex flex-wrap gap-2">
            <a
              href={virtualInviteGoogleUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className={`h-9 px-3 text-sm rounded-full inline-flex items-center gap-1.5 border ${
                virtualInviteGoogleUrl
                  ? 'border-accent text-accent hover:bg-accent/5'
                  : 'border-accent-soft/30 text-graphite/40 pointer-events-none'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Google Calendar
            </a>
            <a
              href={virtualInviteTeamsUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className={`h-9 px-3 text-sm rounded-full inline-flex items-center gap-1.5 border ${
                virtualInviteTeamsUrl
                  ? 'border-accent text-accent hover:bg-accent/5'
                  : 'border-accent-soft/30 text-graphite/40 pointer-events-none'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Teams / Outlook
            </a>
            <button
              onClick={() => createVirtualReminderMutation.mutate()}
              disabled={createVirtualReminderMutation.isPending}
              className="h-9 px-3 bg-accent text-white text-sm rounded-full hover:bg-accent-hover disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {createVirtualReminderMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              Save Reminder
            </button>
          </div>
        </section>
      </div>

      <div className="flex gap-1">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === option
                ? 'bg-accent text-white border-accent'
                : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'
            }`}
          >
            {option === 'all'
              ? 'All'
              : option === 'open'
                ? 'Open'
                : option === 'completed'
                  ? 'Completed'
                  : 'Overdue'}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-5 space-y-3">
          <input
            type="text"
            value={newTask.title}
            onChange={(event) =>
              setNewTask((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Task title *"
            className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50"
          />
          <textarea
            value={newTask.description}
            onChange={(event) =>
              setNewTask((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Description (optional)"
            rows={2}
            className="w-full px-3 py-2 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50 resize-none"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-graphite/60 mb-1">Due Date</label>
              <input
                type="date"
                value={newTask.due_date}
                onChange={(event) =>
                  setNewTask((prev) => ({ ...prev, due_date: event.target.value }))
                }
                className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-graphite/60 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(event) =>
                  setNewTask((prev) => ({ ...prev, priority: event.target.value }))
                }
                className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-graphite/60 mb-1">Assignee</label>
              <input
                type="text"
                value={newTask.assignee_name}
                onChange={(event) =>
                  setNewTask((prev) => ({ ...prev, assignee_name: event.target.value }))
                }
                placeholder="Name"
                className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="h-8 px-4 text-xs text-graphite/60 hover:text-graphite"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !newTask.title.trim()}
              className="h-8 px-4 bg-mn-dark text-white text-xs font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-accent-soft/30 p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent-soft/20" />
                <div className="flex-1">
                  <div className="h-4 bg-accent-soft/20 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-8 text-center">
          <CheckCircle className="w-10 h-10 text-accent-soft mx-auto mb-3" />
          <p className="text-sm text-graphite/60">
            {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const isOverdue =
              task.status !== 'completed' && task.due_date && new Date(task.due_date) < now;
            const priorityStyle = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border p-4 transition-colors ${
                  isOverdue ? 'border-signal-down/30' : 'border-accent-soft/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => completeTask(task.id)}
                    className="mt-0.5 flex-shrink-0"
                    title={task.status === 'completed' ? 'Completed' : 'Mark complete'}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-signal-up" />
                    ) : (
                      <Circle className="w-5 h-5 text-graphite/60 hover:text-accent transition-colors" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm font-medium ${
                          task.status === 'completed'
                            ? 'text-graphite/60 line-through'
                            : 'text-graphite'
                        }`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityStyle.bg}`}
                      >
                        {priorityStyle.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-graphite/60 mt-1 line-clamp-3 whitespace-pre-line">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-graphite/60">
                      {task.due_date && (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isOverdue ? 'text-signal-down font-medium' : ''
                          }`}
                        >
                          {isOverdue ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <Calendar className="w-3 h-3" />
                          )}
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.assignee_name && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.assignee_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-graphite/60 hover:text-signal-down transition-colors flex-shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
