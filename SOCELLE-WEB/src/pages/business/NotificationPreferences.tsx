// ── Business Notification Preferences ──────────────────────────────
// WO-18: Settings page for business portal notification preferences

import { Helmet } from 'react-helmet-async';
import { Bell, Mail, Info, Send, Zap, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '../../lib/notifications/useNotifications';
import type { EmailFrequency } from '../../lib/notifications/types';
import NotificationLedgerPanel from '../../components/notifications/NotificationLedgerPanel';
import { useActionableSignals } from '../../lib/intelligence/useActionableSignals';
import { CrossHubActionDispatcher } from '../../components/CrossHubActionDispatcher';

const TOGGLE_ITEMS = [
  { key: 'intelligence_alerts' as const, label: 'Intelligence Alerts', desc: 'Market trends, peer benchmarks, and category signals' },
  { key: 'reorder_reminders' as const, label: 'Reorder Reminders', desc: 'Low stock alerts and purchase cycle notifications' },
  { key: 'campaign_notifications' as const, label: 'Campaign Notifications', desc: 'New promotions and offers from your brands' },
  { key: 'education_updates' as const, label: 'Education Updates', desc: 'New CE courses, guides, and protocol content' },
  { key: 'enrichment_updates' as const, label: 'Enrichment Updates', desc: 'Market data refreshes and competitive intelligence' },
  { key: 'system_notifications' as const, label: 'System Notifications', desc: 'Account changes, tier upgrades, and maintenance' },
] as const;

const FREQUENCY_OPTIONS: { value: EmailFrequency; label: string }[] = [
  { value: 'real_time', label: 'Real-time' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
  { value: 'monthly', label: 'Monthly digest' },
];

export default function NotificationPreferences() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    preferences,
    loading,
    error,
    updatePreferences,
    createNotification,
    refresh,
  } = useNotifications();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const {
    signals: actionableSignals,
    loading: signalsLoading,
    error: signalsError,
    refetch: refetchSignals,
  } = useActionableSignals(3);

  const handleToggle = async (key: keyof typeof preferences) => {
    if (key === 'email_frequency') return;
    setSavingKey(key);
    try {
      await updatePreferences({ [key]: !preferences[key] });
    } finally {
      setSavingKey(null);
    }
  };

  const handleFrequencyChange = async (value: EmailFrequency) => {
    setSavingKey('email_frequency');
    try {
      await updatePreferences({ email_frequency: value });
    } finally {
      setSavingKey(null);
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      await createNotification({
        type: 'system',
        channel: 'in_app',
        title: 'Test notification',
        body: 'Notification engine is connected for this workspace.',
      });
      await refresh();
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Notification Settings | Socelle</title>
      </Helmet>

      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-graphite/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-graphite" />
          </div>
          <div>
            <h1 className="font-sans text-2xl text-graphite">Notification Settings</h1>
            <p className="text-sm text-graphite/60 font-sans mt-0.5">
              Control which notifications you receive and how often
            </p>
          </div>
        </div>

        <div className="mb-5">
          <button
            onClick={() => {
              void handleSendTest();
            }}
            disabled={sendingTest || loading}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-accent-soft text-xs font-medium text-graphite hover:bg-accent-soft/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {sendingTest ? 'Sending...' : 'Send Test Notification'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-accent-soft shadow-sm mb-6 p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="font-sans font-semibold text-graphite text-sm">Signal-triggered actions</h2>
              <p className="text-xs text-graphite/60 mt-0.5">
                Dispatch CRM, campaign, and sales actions from active signals.
              </p>
            </div>
          </div>

          {signalsLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-10 rounded-lg bg-accent-soft/20" />
              <div className="h-10 rounded-lg bg-accent-soft/20" />
            </div>
          ) : signalsError ? (
            <div className="flex items-center justify-between gap-3 bg-signal-down/5 border border-signal-down/20 rounded-lg px-3 py-2.5">
              <p className="text-xs text-graphite/70">{signalsError}</p>
              <button
                onClick={() => {
                  void refetchSignals();
                }}
                className="inline-flex items-center gap-1 text-xs text-graphite/70 hover:text-graphite"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : actionableSignals.length === 0 ? (
            <div className="text-center py-5">
              <Zap className="w-5 h-5 text-graphite/20 mx-auto mb-2" />
              <p className="text-xs text-graphite/60">No active signals available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actionableSignals.map((signal) => (
                <div key={signal.id} className="flex items-center gap-2 border border-accent-soft rounded-lg px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-graphite truncate">{signal.title}</p>
                    <p className="text-xs text-graphite/60">
                      {signal.category} • Δ {signal.delta.toFixed(1)} • {(signal.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                  <CrossHubActionDispatcher
                    compact
                    signal={{
                      id: signal.id,
                      title: signal.title,
                      category: signal.category,
                      delta: signal.delta,
                      confidence: signal.confidence,
                      source: signal.source,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <NotificationLedgerPanel
          notifications={notifications}
          loading={loading && notifications.length === 0}
          error={error}
          onRefresh={refresh}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          title="Notification Ledger"
          description="Transactional notification events for your business workspace"
        />

        {/* In-app notification toggles */}
        <div className="bg-white rounded-xl border border-accent-soft shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-accent-soft">
            <h2 className="font-sans font-semibold text-graphite text-sm">In-App Notifications</h2>
          </div>
          <div className="divide-y divide-accent-soft/50">
            {TOGGLE_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-sans font-medium text-sm text-graphite">{item.label}</p>
                  <p className="font-sans text-xs text-graphite/60 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => {
                    void handleToggle(item.key);
                  }}
                  disabled={loading || savingKey === item.key}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    preferences[item.key] ? 'bg-graphite' : 'bg-accent-soft'
                  }`}
                  role="switch"
                  aria-checked={preferences[item.key]}
                  aria-label={`Toggle ${item.label}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      preferences[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Email frequency */}
        <div className="bg-white rounded-xl border border-accent-soft shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-accent-soft">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-graphite/60" />
              <h2 className="font-sans font-semibold text-graphite text-sm">Email Digest Frequency</h2>
            </div>
          </div>
          <div className="px-6 py-4">
            <select
              value={preferences.email_frequency}
              onChange={(e) => {
                void handleFrequencyChange(e.target.value as EmailFrequency);
              }}
              disabled={loading || savingKey === 'email_frequency'}
              className="w-full max-w-xs px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-graphite/60 font-sans mt-2">
              Choose how often your transactional digest email is generated.
            </p>
          </div>
        </div>

        {/* Info banner */}
        {error && (
          <div className="flex items-start justify-between gap-3 bg-signal-down/5 border border-signal-down/20 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm font-sans text-signal-down">{error}</p>
            <button
              onClick={() => {
                void refresh();
              }}
              className="text-xs font-medium text-accent hover:text-accent-hover"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-sans font-medium text-blue-900">Notification preferences are saved live</p>
            <p className="text-xs font-sans text-blue-700 mt-0.5">
              In-app notification delivery is active through the notifications ledger. Use frequency settings to control digest cadence.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
