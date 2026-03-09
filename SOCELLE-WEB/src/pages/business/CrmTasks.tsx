import { useState, useMemo } from 'react';
import { CheckCircle, Circle, Plus, Clock, AlertTriangle, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmTasks, type NewCrmTask } from '../../lib/useCrmTasks';
import { exportToCsv } from '../../lib/csvExport';

const PRIORITY_STYLES: Record<string, { bg: string; label: string }> = {
  high: { bg: 'bg-signal-down/10 text-signal-down', label: 'High' },
  medium: { bg: 'bg-signal-warn/10 text-signal-warn', label: 'Medium' },
  low: { bg: 'bg-accent/10 text-accent', label: 'Low' },
};

const FILTER_OPTIONS = ['all', 'open', 'completed', 'overdue'] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

export default function CrmTasks() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const { tasks, loading, isLive, createTask, completeTask, deleteTask } = useCrmTasks(businessId);

  const [filter, setFilter] = useState<FilterOption>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', priority: 'medium', assignee_name: '' });
  const [saving, setSaving] = useState(false);

  const now = new Date();

  const filtered = useMemo(() => {
    let result = tasks;
    if (filter === 'open') result = result.filter(t => t.status !== 'completed');
    else if (filter === 'completed') result = result.filter(t => t.status === 'completed');
    else if (filter === 'overdue') result = result.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < now);
    return result;
  }, [tasks, filter, now]);

  const overdueCount = useMemo(() =>
    tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < now).length
  , [tasks, now]);

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
      setNewTask({ title: '', description: '', due_date: '', priority: 'medium', assignee_name: '' });
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    exportToCsv(filtered.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date ?? '',
      assignee: t.assignee_name ?? '',
      description: t.description ?? '',
      created_at: t.created_at,
    })), 'crm_tasks');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Tasks</h1>
          <p className="text-sm text-graphite/60 mt-1">
            {tasks.filter(t => t.status !== 'completed').length} open
            {overdueCount > 0 && <span className="text-signal-down ml-1">({overdueCount} overdue)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <button onClick={handleExport} className="h-9 px-3 text-xs font-medium text-graphite/60 border border-accent-soft/30 rounded-full hover:border-accent/30 transition-colors">
            Export CSV
          </button>
          <button onClick={() => setShowAdd(s => !s)} className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filter === f ? 'bg-accent text-white border-accent' : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'}`}
          >
            {f === 'all' ? 'All' : f === 'open' ? 'Open' : f === 'completed' ? 'Completed' : 'Overdue'}
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-5 space-y-3">
          <input
            type="text"
            value={newTask.title}
            onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
            placeholder="Task title *"
            className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50"
          />
          <textarea
            value={newTask.description}
            onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
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
                onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))}
                className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-graphite/60 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
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
                onChange={e => setNewTask(p => ({ ...p, assignee_name: e.target.value }))}
                placeholder="Name"
                className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="h-8 px-4 text-xs text-graphite/60 hover:text-graphite">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !newTask.title.trim()} className="h-8 px-4 bg-mn-dark text-white text-xs font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-accent-soft/30 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent-soft/20" />
                <div className="flex-1"><div className="h-4 bg-accent-soft/20 rounded w-48" /></div>
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
          {filtered.map(task => {
            const isOverdue = task.status !== 'completed' && task.due_date && new Date(task.due_date) < now;
            const priorityStyle = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium;
            return (
              <div key={task.id} className={`bg-white rounded-xl border p-4 transition-colors ${isOverdue ? 'border-signal-down/30' : 'border-accent-soft/30'}`}>
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
                      <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-graphite/60 line-through' : 'text-graphite'}`}>
                        {task.title}
                      </p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityStyle.bg}`}>
                        {priorityStyle.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-graphite/60 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-graphite/60">
                      {task.due_date && (
                        <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-signal-down font-medium' : ''}`}>
                          {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
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
