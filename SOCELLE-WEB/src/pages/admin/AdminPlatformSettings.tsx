// ── AdminPlatformSettings — V2-HUBS-05: Platform Settings ─────────────────
// Data source: DEMO — read-only display of platform configuration
// Authority: build_tracker.md WO V2-HUBS-05

import {
  Settings,
  Globe,
  Link2,
  Shield,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────

interface SettingsPanel {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SettingsItem[];
}

interface SettingsItem {
  label: string;
  value: string;
  type: 'text' | 'status';
  statusOk?: boolean;
}

// ── DEMO config ───────────────────────────────────────────────────────────

const SETTINGS_PANELS: SettingsPanel[] = [
  {
    id: 'general',
    title: 'General',
    icon: Globe,
    items: [
      { label: 'Platform Name', value: 'SOCELLE', type: 'text' },
      { label: 'Support Email', value: 'support@socelle.com', type: 'text' },
      { label: 'Primary Timezone', value: 'America/New_York (EST)', type: 'text' },
      { label: 'Default Locale', value: 'en-US', type: 'text' },
      { label: 'Platform Version', value: '1.0.0-beta', type: 'text' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Link2,
    items: [
      { label: 'Stripe', value: 'Not Connected', type: 'status', statusOk: false },
      { label: 'Supabase', value: 'Connected', type: 'status', statusOk: true },
      { label: 'Cloudflare (Hosting)', value: 'Connected', type: 'status', statusOk: true },
      { label: 'Resend (Email)', value: 'Not Connected', type: 'status', statusOk: false },
      { label: 'OpenAI', value: 'Not Connected', type: 'status', statusOk: false },
      { label: 'Google Analytics', value: 'Not Connected', type: 'status', statusOk: false },
    ],
  },
  {
    id: 'limits',
    title: 'Limits & Thresholds',
    icon: Shield,
    items: [
      { label: 'Max Upload Size', value: '10 MB', type: 'text' },
      { label: 'Session Timeout', value: '60 minutes', type: 'text' },
      { label: 'API Rate Limit', value: '100 requests/min', type: 'text' },
      { label: 'Max CSV Export Rows', value: '10,000', type: 'text' },
      { label: 'AI Credit Limit (Free Tier)', value: '0 credits', type: 'text' },
      { label: 'AI Credit Limit (Starter)', value: '500 credits/mo', type: 'text' },
      { label: 'AI Credit Limit (Pro)', value: '2,500 credits/mo', type: 'text' },
      { label: 'AI Credit Limit (Enterprise)', value: '10,000 credits/mo', type: 'text' },
    ],
  },
  {
    id: 'storage',
    title: 'Storage & Infrastructure',
    icon: HardDrive,
    items: [
      { label: 'Database', value: 'Supabase PostgreSQL', type: 'text' },
      { label: 'File Storage', value: 'Supabase Storage', type: 'text' },
      { label: 'Edge Functions', value: '8 deployed', type: 'text' },
      { label: 'Migrations', value: '71+ applied', type: 'text' },
      { label: 'CDN', value: 'Cloudflare', type: 'text' },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminPlatformSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-graphite font-sans">Platform Settings</h1>
            <p className="text-graphite/60 font-sans mt-1 text-sm">
              Read-only platform configuration overview
            </p>
          </div>
          <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
            DEMO
          </span>
        </div>
      </div>

      {/* DEMO banner */}
      <div className="bg-[#A97A4C]/10 text-[#A97A4C] text-xs font-medium px-4 py-2 rounded-lg text-center font-sans">
        DEMO -- Platform settings are read-only display values. Editable settings will be wired to a settings table in a future phase.
      </div>

      {/* Settings panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {SETTINGS_PANELS.map((panel) => {
          const Icon = panel.icon;
          return (
            <div
              key={panel.id}
              className="bg-white border border-accent-soft rounded-xl overflow-hidden"
            >
              {/* Panel header */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-accent-soft bg-[#F6F3EF]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-soft text-accent">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-graphite font-sans">{panel.title}</h2>
              </div>

              {/* Items */}
              <div className="divide-y divide-accent-soft">
                {panel.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <span className="text-sm text-graphite/70 font-sans">{item.label}</span>
                    {item.type === 'status' ? (
                      <div className="flex items-center gap-1.5">
                        {item.statusOk ? (
                          <CheckCircle className="w-4 h-4 text-[#5F8A72]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#8E6464]" />
                        )}
                        <span
                          className={`text-sm font-medium font-sans ${
                            item.statusOk ? 'text-[#5F8A72]' : 'text-[#8E6464]'
                          }`}
                        >
                          {item.value}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-graphite font-sans">
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* System info */}
      <div className="bg-white border border-accent-soft rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-accent" />
          <h2 className="text-base font-semibold text-graphite font-sans">System Information</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-graphite/50 font-sans">Runtime</p>
            <p className="text-sm font-medium text-graphite font-sans mt-0.5">React 18.3 + Vite 5.4</p>
          </div>
          <div>
            <p className="text-xs text-graphite/50 font-sans">TypeScript</p>
            <p className="text-sm font-medium text-graphite font-sans mt-0.5">5.5 (strict mode)</p>
          </div>
          <div>
            <p className="text-xs text-graphite/50 font-sans">Design System</p>
            <p className="text-sm font-medium text-graphite font-sans mt-0.5">Pearl Mineral V2</p>
          </div>
          <div>
            <p className="text-xs text-graphite/50 font-sans">Styling</p>
            <p className="text-sm font-medium text-graphite font-sans mt-0.5">Tailwind 3.4</p>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 bg-accent-soft/50 rounded-xl p-4">
        <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <div className="text-xs text-graphite/60 font-sans">
          <p className="font-medium text-graphite/80 mb-1">About Platform Settings</p>
          <p>
            This page provides a read-only overview of platform configuration, integration status,
            and operational limits. Editable settings will be available once a platform_settings table
            is created and the Admin Hub is wired for write operations. Integration statuses reflect
            whether API keys / environment variables are configured.
          </p>
        </div>
      </div>
    </div>
  );
}
