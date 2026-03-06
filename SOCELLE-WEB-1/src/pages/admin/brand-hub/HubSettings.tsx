import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, Button } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';

interface BrandSettings {
  is_published: boolean;
  status: string;
  service_tier: string | null;
}

function Toggle({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pro-navy/30 disabled:opacity-50 ${
        on ? 'bg-pro-navy' : 'bg-pro-stone'
      }`}
      role="switch"
      aria-checked={on}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function HubSettings() {
  const { id: brandId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [settings, setSettings]   = useState<BrandSettings | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [toast, setToast]         = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) return;
    supabase
      .from('brands')
      .select('is_published, status, service_tier')
      .eq('id', brandId)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as BrandSettings);
        setLoading(false);
      });
  }, [brandId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggle = async (field: keyof Pick<BrandSettings, 'is_published'>) => {
    if (!settings || !brandId) return;
    const next = !settings[field];
    setSettings(prev => prev ? { ...prev, [field]: next } : prev);
    setSaving(true);
    try {
      const { error } = await supabase
        .from('brands')
        .update({ [field]: next })
        .eq('id', brandId);
      if (error) throw error;
      showToast('Settings saved.');
    } catch {
      setSettings(prev => prev ? { ...prev, [field]: !next } : prev);
      showToast('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!brandId) return;
    if (!window.confirm('Archive this brand? It will be removed from the marketplace but all data is preserved.')) return;
    setArchiving(true);
    try {
      const { error } = await supabase
        .from('brands')
        .update({ status: 'archived', is_published: false })
        .eq('id', brandId);
      if (error) throw error;
      navigate('/admin/brands');
    } catch {
      showToast('Archive failed. Please try again.');
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-40 bg-white rounded-xl border border-pro-stone animate-pulse" />
        <div className="h-24 bg-white rounded-xl border border-pro-stone animate-pulse" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-sm text-pro-warm-gray font-sans">Brand not found.</p>;
  }

  const isArchived = settings.status === 'archived';

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-pro-navy text-white text-sm font-sans px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-pro-warm-gray" />
            <CardTitle>Brand Settings</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-0">
          <div className="flex items-center justify-between py-4 border-b border-pro-stone">
            <div>
              <p className="font-medium text-pro-charcoal font-sans text-sm">Public Storefront</p>
              <p className="text-xs text-pro-warm-gray font-sans mt-0.5">
                Show this brand on the public marketplace
              </p>
            </div>
            <Toggle
              on={settings.is_published}
              onToggle={() => toggle('is_published')}
              disabled={saving || isArchived}
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-pro-charcoal font-sans text-sm">Status</p>
              <p className="text-xs text-pro-warm-gray font-sans mt-0.5 capitalize">
                Current: <span className="font-medium">{settings.status}</span>
                {settings.service_tier && ` · Tier: ${settings.service_tier}`}
              </p>
            </div>
            {isArchived && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                Archived
              </span>
            )}
          </div>
        </div>
      </Card>

      {!isArchived && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-pro-charcoal font-sans text-sm">Archive Brand</p>
              <p className="text-xs text-pro-warm-gray font-sans mt-0.5">
                Removes from marketplace but preserves all data and history
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              iconLeft={<Trash2 className="w-4 h-4" />}
              onClick={handleArchive}
              disabled={archiving}
            >
              {archiving ? 'Archiving…' : 'Archive'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
