import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Palette,
  AlertCircle,
  Globe,
  Image,
  Type,
  Save,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useResellerAccount, useWhiteLabelConfig } from '../../lib/useReseller';

// ── B2B Reseller — White-Label Configuration ────────────────────────────────
// Data source: white_label_config (LIVE when DB-connected)

export default function WhiteLabelConfig() {
  const { user } = useAuth();
  const { account } = useResellerAccount(user?.id);
  const { config, loading, isLive, saveConfig } = useWhiteLabelConfig(account?.id);

  const [appName, setAppName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#141418');
  const [secondaryColor, setSecondaryColor] = useState('#6E879B');
  const [customDomain, setCustomDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Populate form when config loads
  useEffect(() => {
    if (config) {
      setAppName(config.app_name ?? '');
      setLogoUrl(config.logo_url ?? '');
      setPrimaryColor(config.primary_color ?? '#141418');
      setSecondaryColor(config.secondary_color ?? '#6E879B');
      setCustomDomain(config.custom_domain ?? '');
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveConfig({
        app_name: appName,
        logo_url: logoUrl || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        custom_domain: customDomain || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Error handled by hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>White-Label Config | SOCELLE</title>
      </Helmet>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-sans font-semibold text-graphite">
            White-Label Configuration
          </h1>
          {!isLive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
              <AlertCircle className="w-3 h-3" />
              DEMO
            </span>
          )}
        </div>
        <p className="text-graphite/60 font-sans mt-1">
          Customize the branded experience for your clients
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-graphite/10 rounded-xl p-6 animate-pulse space-y-4">
          <div className="h-4 bg-graphite/10 rounded w-1/3" />
          <div className="h-10 bg-graphite/10 rounded w-full" />
          <div className="h-10 bg-graphite/10 rounded w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <div className="space-y-4">
            {/* App Name */}
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-sans font-semibold text-graphite">App Name</h2>
              </div>
              <input
                type="text"
                value={appName}
                onChange={e => setAppName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-sans text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-mn-bg"
                placeholder="Your branded app name"
              />
            </div>

            {/* Logo */}
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-sans font-semibold text-graphite">Logo</h2>
              </div>
              <input
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-sans text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-mn-bg"
                placeholder="https://example.com/logo.png"
              />
              {logoUrl && (
                <div className="mt-3 p-3 bg-graphite/[0.03] rounded-lg">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-10 object-contain"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-sans font-semibold text-graphite">Brand Colors</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-medium text-graphite/60 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-graphite/15 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm font-sans font-mono text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-mn-bg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-sans font-medium text-graphite/60 mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-graphite/15 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm font-sans font-mono text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-mn-bg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Domain */}
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-sans font-semibold text-graphite">Custom Domain</h2>
              </div>
              <input
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-sans text-graphite border border-graphite/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-mn-bg"
                placeholder="app.yourdomain.com"
              />
              <p className="text-xs text-graphite/40 font-sans mt-2">
                Point a CNAME record to your white-label subdomain.
              </p>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-sans font-semibold text-mn-bg bg-mn-dark rounded-full hover:bg-graphite transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
              {saved && (
                <span className="text-xs font-sans text-green-600 font-medium">Saved successfully</span>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white border border-graphite/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-graphite/10 flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-sans font-semibold text-graphite">Preview</h2>
            </div>
            <div className="p-6">
              {/* Preview mock */}
              <div
                className="rounded-xl overflow-hidden border border-graphite/10"
                style={{ backgroundColor: '#F6F3EF' }}
              >
                {/* Preview header */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center gap-2">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-6 object-contain"
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: secondaryColor, opacity: 0.5 }} />
                    )}
                    <span className="text-sm font-sans font-semibold text-white">
                      {appName || 'Your App'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-2 rounded-full" style={{ backgroundColor: secondaryColor, opacity: 0.4 }} />
                    <div className="w-12 h-2 rounded-full" style={{ backgroundColor: secondaryColor, opacity: 0.4 }} />
                  </div>
                </div>

                {/* Preview body */}
                <div className="p-5 space-y-3">
                  <div className="h-3 rounded-full bg-graphite/10 w-3/4" />
                  <div className="h-3 rounded-full bg-graphite/10 w-1/2" />

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="rounded-lg p-3 text-center"
                        style={{ backgroundColor: `${secondaryColor}15` }}
                      >
                        <div className="w-6 h-6 rounded-full mx-auto mb-1.5" style={{ backgroundColor: secondaryColor, opacity: 0.3 }} />
                        <div className="h-2 rounded-full bg-graphite/10 w-3/4 mx-auto" />
                      </div>
                    ))}
                  </div>

                  <button
                    className="mt-4 w-full py-2 rounded-full text-xs font-sans font-semibold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Get Started
                  </button>
                </div>

                {/* Preview footer */}
                {customDomain && (
                  <div className="px-5 py-2 border-t border-graphite/5">
                    <p className="text-[10px] font-sans text-graphite/30 text-center">
                      {customDomain}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
