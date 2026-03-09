import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type SpaMenu = Database['public']['Tables']['spa_menus']['Row'];

export default function SpaMenusView() {
  const [menus, setMenus] = useState<SpaMenu[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    spa_name: '',
    spa_type: 'spa' as 'medspa' | 'spa' | 'hybrid',
    spa_location: '',
    raw_menu_data: '',
  });

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    const { data, error } = await supabase
      .from('spa_menus')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMenus(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const menuData = {
      spa_name: formData.spa_name.trim(),
      spa_type: formData.spa_type,
      spa_location: formData.spa_location.trim() || null,
      raw_menu_data: formData.raw_menu_data.trim(),
      parse_status: 'pending',
      analysis_status: 'pending'
    };

    const { error } = await supabase
      .from('spa_menus')
      .insert([menuData]);

    if (!error) {
      setIsAdding(false);
      resetForm();
      loadMenus();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this spa menu? All associated services and mappings will be removed.')) {
      await supabase.from('spa_menus').delete().eq('id', id);
      loadMenus();
    }
  };

  const resetForm = () => {
    setFormData({
      spa_name: '',
      spa_type: 'spa',
      spa_location: '',
      raw_menu_data: '',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'parsed':
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-graphite" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'parsed':
      case 'reviewed':
        return 'bg-accent-soft text-graphite';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-graphite">Spa Menus</h2>
          <p className="text-sm text-graphite/60 mt-1">Upload and manage spa service menus for mapping</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Menu</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
          <h3 className="text-lg font-medium text-graphite mb-4">Upload New Spa Menu</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Spa Name</label>
                <input
                  type="text"
                  required
                  value={formData.spa_name}
                  onChange={(e) => setFormData({ ...formData, spa_name: e.target.value })}
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                  placeholder="Enter spa name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Location (Optional)</label>
                <input
                  type="text"
                  value={formData.spa_location}
                  onChange={(e) => setFormData({ ...formData, spa_location: e.target.value })}
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                  placeholder="e.g., Manhattan, NY"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Spa Type</label>
              <select
                value={formData.spa_type}
                onChange={(e) => setFormData({ ...formData, spa_type: e.target.value as 'medspa' | 'spa' | 'hybrid' })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
              >
                <option value="spa">Day Spa - Relaxation & Wellness Focus</option>
                <option value="medspa">Med Spa - Results-Driven & Clinical</option>
                <option value="hybrid">Hybrid - Balanced Approach</option>
              </select>
              <p className="text-xs text-graphite/60 mt-1">
                This determines gap analysis priorities and recommendations
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Menu Data (paste full menu text)
              </label>
              <textarea
                required
                value={formData.raw_menu_data}
                onChange={(e) => setFormData({ ...formData, raw_menu_data: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite font-mono text-sm"
                rows={12}
                placeholder="Format: Service Name | Category | Duration | Price | Description (one per line)"
              />
              <p className="text-xs text-graphite/60 mt-2">
                Example: Signature Facial | Facial | 60 min | 150 | Deep cleansing and hydration treatment
              </p>
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite"
            >
              Upload Menu
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
              className="px-4 py-2 border border-accent-soft rounded-lg hover:bg-background"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {menus.map((menu) => (
          <div key={menu.id} className="bg-white rounded-lg border border-accent-soft p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-accent-soft rounded-lg">
                  <FileText className="w-6 h-6 text-graphite" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-graphite">{menu.spa_name}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(menu.parse_status ?? 'uploaded')}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(menu.parse_status ?? 'uploaded')}`}>
                        {menu.parse_status ?? 'uploaded'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-graphite/60">
                    Uploaded {menu.upload_date ? new Date(menu.upload_date).toLocaleDateString() : '—'} at {menu.upload_date ? new Date(menu.upload_date).toLocaleTimeString() : '—'}
                  </p>
                  <div className="mt-3 p-3 bg-background rounded border border-accent-soft max-h-32 overflow-y-auto">
                    <pre className="text-xs text-graphite whitespace-pre-wrap font-mono">
                      {(menu.raw_menu_data ?? '').substring(0, 300)}
                      {(menu.raw_menu_data ?? '').length > 300 && '...'}
                    </pre>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(menu.id)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {menus.length === 0 && (
        <div className="bg-white rounded-lg border border-accent-soft p-12 text-center">
          <FileText className="w-12 h-12 text-graphite/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-graphite mb-2">No spa menus yet</h3>
          <p className="text-graphite/60 mb-4">Upload your first spa menu to begin service mapping</p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Menu</span>
          </button>
        </div>
      )}
    </div>
  );
}
