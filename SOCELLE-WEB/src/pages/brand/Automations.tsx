import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  Zap,
  Mail,
  Truck,
  RefreshCw,
  Trash2,
  Info,
  Clock,
  Hash,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { useToast } from '../../components/Toast';
import { useAutomations } from '../../lib/campaigns/useCampaigns';
import type { AutomationType } from '../../lib/campaigns/types';

const TYPE_CONFIG: Record<AutomationType, { icon: typeof Mail; label: string; variant: 'green' | 'gold' | 'amber' }> = {
  order_confirmation: { icon: Mail, label: 'Order Confirmation', variant: 'green' },
  shipping_notification: { icon: Truck, label: 'Shipping Notification', variant: 'gold' },
  reorder_reminder: { icon: RefreshCw, label: 'Reorder Reminder', variant: 'amber' },
};

export default function BrandAutomations() {
  const { addToast } = useToast();
  const { automations, toggleAutomation, addAutomation, deleteAutomation, loading, error } = useAutomations();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'order_confirmation' as AutomationType,
    description: '',
    enabled: true,
    triggerDays: 60,
  });

  const openCreate = () => {
    setForm({
      name: '',
      type: 'order_confirmation',
      description: '',
      enabled: true,
      triggerDays: 60,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast('Rule name is required', 'error');
      return;
    }

    setBusyAction('create');
    const created = await addAutomation({
      name: form.name,
      type: form.type,
      description: form.description,
      enabled: form.enabled,
      triggerDays: form.type === 'reorder_reminder' ? form.triggerDays : undefined,
    });

    if (created) {
      addToast('Automation rule created', 'success');
      setModalOpen(false);
    } else {
      addToast('Unable to create automation rule', 'error');
    }
    setBusyAction(null);
  };

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    setBusyAction(id);
    const ok = await toggleAutomation(id);
    if (ok) {
      addToast(
        currentEnabled ? 'Automation rule disabled' : 'Automation rule enabled',
        'info'
      );
    } else {
      addToast('Unable to update automation rule', 'error');
    }
    setBusyAction(null);
  };

  const handleDelete = async (id: string) => {
    setBusyAction(id);
    const ok = await deleteAutomation(id);
    if (ok) {
      setConfirmDeleteId(null);
      addToast('Automation rule deleted', 'success');
    } else {
      addToast('Unable to delete automation rule', 'error');
    }
    setBusyAction(null);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Helmet>
        <title>Automations | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl text-pro-navy">Automation Rules</h1>
            <p className="text-sm text-pro-warm-gray font-sans mt-0.5">
              Configure triggered workflows that engage your operator network automatically
            </p>
          </div>
          <Button
            variant="gold"
            size="sm"
            iconLeft={<Plus className="w-4 h-4" />}
            onClick={openCreate}
          >
            Create Rule
          </Button>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 px-4 py-3 bg-pro-cream rounded-xl border border-pro-stone">
          <Info className="w-4 h-4 text-pro-navy flex-shrink-0 mt-0.5" />
          <p className="text-xs text-pro-charcoal font-sans">
            Email sending is being configured. Rules will activate when email infrastructure is connected.
            Toggle rules on or off now to prepare your automation workflows.
          </p>
        </div>

        {/* Automation Rule Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-pro-warm-gray font-sans text-sm">Loading automation rules...</p>
            </div>
          ) : automations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-pro-cream rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-pro-warm-gray" />
              </div>
              <p className="text-pro-warm-gray font-sans text-sm mb-4">
                No automation rules configured yet.
              </p>
              <Button variant="outline" size="sm" onClick={openCreate}>
                Create Your First Rule
              </Button>
            </div>
          ) : (
            automations.map((rule) => {
              const typeCfg = TYPE_CONFIG[rule.type];
              const TypeIcon = typeCfg.icon;
              return (
                <Card key={rule.id} padding="none">
                  <div className="flex items-start gap-4 p-5">
                    <div className="w-10 h-10 rounded-xl bg-pro-ivory flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-5 h-5 text-pro-navy" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-sans font-semibold text-pro-charcoal text-sm">
                          {rule.name}
                        </h3>
                        <Badge variant={typeCfg.variant}>{typeCfg.label}</Badge>
                      </div>
                      <p className="text-xs text-pro-warm-gray font-sans mb-3">
                        {rule.description}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-pro-warm-gray font-sans">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {rule.triggerCount.toLocaleString()} triggers
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last: {formatDate(rule.lastTriggered)}
                        </span>
                        {rule.triggerDays && (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Every {rule.triggerDays} days
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => void handleToggle(rule.id, rule.enabled)}
                        disabled={busyAction === rule.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 ${
                          rule.enabled ? 'bg-pro-navy' : 'bg-pro-stone'
                        }`}
                        role="switch"
                        aria-checked={rule.enabled}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                            rule.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(rule.id)}
                        className="p-1.5 rounded-lg text-pro-warm-gray hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Automation Rule"
        size="md"
      >
        <ModalBody className="space-y-5">
          <Input
            label="Rule Name"
            placeholder="e.g. 90-Day Reorder Reminder"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
              Automation Type
            </label>
            <div className="space-y-2">
              {(Object.entries(TYPE_CONFIG) as [AutomationType, typeof TYPE_CONFIG[AutomationType]][]).map(
                ([type, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <label
                      key={type}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                        form.type === type
                          ? 'border-pro-navy bg-pro-navy/5'
                          : 'border-pro-stone hover:border-pro-navy/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="automationType"
                        value={type}
                        checked={form.type === type}
                        onChange={() => setForm((f) => ({ ...f, type }))}
                        className="sr-only"
                      />
                      <Icon className={`w-4 h-4 ${form.type === type ? 'text-pro-navy' : 'text-pro-warm-gray'}`} />
                      <span className={`text-sm font-sans ${form.type === type ? 'text-pro-navy font-medium' : 'text-pro-warm-gray'}`}>
                        {cfg.label}
                      </span>
                    </label>
                  );
                }
              )}
            </div>
          </div>

          {form.type === 'reorder_reminder' && (
            <Input
              label="Trigger After (days)"
              type="number"
              min={1}
              value={form.triggerDays}
              onChange={(e) => setForm((f) => ({ ...f, triggerDays: Number(e.target.value) }))}
              hint="Number of days since last order before sending the reminder"
            />
          )}

          <div>
            <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-pro-stone bg-white font-sans text-sm text-pro-charcoal placeholder:text-pro-warm-gray/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pro-navy/15 focus:border-pro-navy resize-none"
              rows={3}
              placeholder="Describe what this automation does..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm((f) => ({ ...f, enabled: !f.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 ${
                form.enabled ? 'bg-pro-navy' : 'bg-pro-stone'
              }`}
              role="switch"
              aria-checked={form.enabled}
              type="button"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                  form.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-sans text-pro-charcoal">
              {form.enabled ? 'Enabled' : 'Disabled'} on creation
            </span>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => void handleSave()} disabled={busyAction !== null}>
            {busyAction === 'create' ? 'Creating...' : 'Create Rule'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Automation Rule"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-pro-warm-gray font-sans">
            Are you sure you want to delete this automation rule? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}
            disabled={busyAction !== null}
          >
            Delete Rule
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
