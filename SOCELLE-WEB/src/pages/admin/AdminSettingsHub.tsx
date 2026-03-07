// ── AdminSettingsHub — WO-OVERHAUL-04 ──────────────────────────────
// Site settings panel. Key-value settings stored in local state for now.
// Data label: DEMO — will wire to a settings table in a future phase.

import { useState } from 'react';
import {
  Save,
  Settings,
  AlertCircle,
  CheckCircle2,
  Globe,
  Mail,
  Share2,
  BarChart3,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface SettingsGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: SettingsField[];
}

interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea';
  placeholder: string;
  helpText?: string;
}

// ── Settings Schema ────────────────────────────────────────────────

const SETTINGS_SCHEMA: SettingsGroup[] = [
  {
    id: 'general',
    label: 'General',
    icon: Globe,
    fields: [
      { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'Socelle' },
      { key: 'site_tagline', label: 'Tagline', type: 'text', placeholder: 'Professional Beauty Intelligence' },
      { key: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'hello@socelle.com' },
      { key: 'support_email', label: 'Support Email', type: 'email', placeholder: 'support@socelle.com' },
    ],
  },
  {
    id: 'social',
    label: 'Social Links',
    icon: Share2,
    fields: [
      { key: 'social_instagram', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/socelle' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/company/socelle' },
      { key: 'social_twitter', label: 'Twitter / X URL', type: 'url', placeholder: 'https://x.com/socelle' },
      { key: 'social_tiktok', label: 'TikTok URL', type: 'url', placeholder: 'https://tiktok.com/@socelle' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Tracking',
    icon: BarChart3,
    fields: [
      { key: 'ga4_measurement_id', label: 'GA4 Measurement ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
      { key: 'gtm_container_id', label: 'GTM Container ID', type: 'text', placeholder: 'GTM-XXXXXXX' },
      { key: 'fb_pixel_id', label: 'Facebook Pixel ID', type: 'text', placeholder: '1234567890' },
      { key: 'hotjar_id', label: 'Hotjar Site ID', type: 'text', placeholder: '1234567' },
    ],
  },
  {
    id: 'email',
    label: 'Email Configuration',
    icon: Mail,
    fields: [
      { key: 'email_from_name', label: 'From Name', type: 'text', placeholder: 'Socelle' },
      { key: 'email_from_address', label: 'From Address', type: 'email', placeholder: 'notifications@socelle.com' },
      { key: 'email_reply_to', label: 'Reply-To Address', type: 'email', placeholder: 'hello@socelle.com' },
      { key: 'email_footer_text', label: 'Footer Text', type: 'textarea', placeholder: 'Socelle, Inc. | Professional Beauty Intelligence' },
    ],
  },
];

// ── Default values ─────────────────────────────────────────────────

function getDefaults(): Record<string, string> {
  const defaults: Record<string, string> = {};
  SETTINGS_SCHEMA.forEach((group) => {
    group.fields.forEach((field) => {
      defaults[field.key] = '';
    });
  });
  return defaults;
}

// ── Component ──────────────────────────────────────────────────────

export default function AdminSettingsHub() {
  const [values, setValues] = useState<Record<string, string>>(getDefaults);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState('general');

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // TODO: Wire to a site_settings table in Phase 6
    // For now, simulate save
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSaving(false);
    setSuccessMsg('Settings saved (local state only -- DB wiring pending)');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const currentGroup = SETTINGS_SCHEMA.find((g) => g.id === activeGroup) || SETTINGS_SCHEMA[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Site Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure global site settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
            DEMO
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* DEMO banner */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium px-4 py-2 rounded-lg text-center">
        DEMO -- Settings are stored in local state only. A site_settings table will be wired in a future phase.
      </div>

      {/* Feedback */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Layout */}
      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 h-fit">
          {SETTINGS_SCHEMA.map((group) => {
            const Icon = group.icon;
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  activeGroup === group.id
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {group.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{currentGroup.label}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {currentGroup.id === 'general' && 'Basic site information and contact details.'}
            {currentGroup.id === 'social' && 'Social media profile URLs.'}
            {currentGroup.id === 'analytics' && 'Analytics and tracking service IDs.'}
            {currentGroup.id === 'email' && 'Transactional email configuration.'}
          </p>

          <div className="space-y-5">
            {currentGroup.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={values[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={values[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={field.placeholder}
                  />
                )}
                {field.helpText && (
                  <p className="text-xs text-gray-400 mt-1">{field.helpText}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
