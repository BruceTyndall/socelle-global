// ── Business Notification Preferences ──────────────────────────────
// WO-18: Settings page for business portal notification preferences

import { Helmet } from 'react-helmet-async';
import { Bell, Mail, Info } from 'lucide-react';
import { useNotifications } from '../../lib/notifications/useNotifications';
import type { EmailFrequency } from '../../lib/notifications/types';

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
  const { preferences, updatePreferences } = useNotifications();

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
                  onClick={() => updatePreferences({ [item.key]: !preferences[item.key] })}
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
              onChange={(e) => updatePreferences({ email_frequency: e.target.value as EmailFrequency })}
              className="w-full max-w-xs px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite"
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-graphite/60 font-sans mt-2">
              Choose how often you receive email digests of your notifications.
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-sans font-medium text-blue-900">Email delivery is being configured</p>
            <p className="text-xs font-sans text-blue-700 mt-0.5">
              In-app notifications are active. Email notifications will be enabled once our delivery service is connected.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
