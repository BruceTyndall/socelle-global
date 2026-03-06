import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X, Sparkles, CheckCircle, AlertCircle, FileEdit, AlertTriangle, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { matchFeaturedToCanonical } from '../lib/dataIntegrityRules';
import ProtocolCompletionEditor from './ProtocolCompletionEditor';
import type { Database } from '../lib/database.types';

type Protocol = Database['public']['Tables']['canonical_protocols']['Row'] & {
  completion_status?: string;
  brand_id?: string;
  service_category?: string;
  duration_minutes?: number;
  protocol_description?: string;
};

interface MarketingMonth {
  month: number;
  month_name: string;
  theme: string;
  featured_protocols: string[];
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function ProtocolsView() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentMonthData, setCurrentMonthData] = useState<MarketingMonth | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [completionEditorId, setCompletionEditorId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'incomplete' | 'steps_complete' | 'fully_complete'>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    protocol_name: '',
    category: '',
    target_concerns: '',
    typical_duration: '',
    allowed_products: '',
    contraindications: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadProtocols(),
        loadBrands(),
        loadCurrentMonthMarketing()
      ]);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    const { data, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, slug')
      .order('name');

    if (brandsError) throw brandsError;
    if (data) setBrands(data);
  };

  const loadCurrentMonthMarketing = async () => {
    const currentMonth = new Date().getMonth() + 1;
    const { data } = await supabase
      .from('marketing_calendar')
      .select('month, month_name, theme, featured_protocols')
      .eq('year', 2026)
      .eq('month', currentMonth)
      .maybeSingle();

    if (data) {
      setCurrentMonthData(data);
    }
  };

  const loadProtocols = async () => {
    const { data, error: protocolsError } = await supabase
      .from('canonical_protocols')
      .select('*')
      .order('created_at', { ascending: false });

    if (protocolsError) throw protocolsError;
    if (data) setProtocols(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const protocolData = {
      protocol_name: formData.protocol_name.trim(),
      category: formData.category.trim(),
      target_concerns: formData.target_concerns.split(',').map(s => s.trim()).filter(Boolean),
      typical_duration: formData.typical_duration.trim() || null,
      allowed_products: formData.allowed_products.split(',').map(s => s.trim()).filter(Boolean),
      contraindications: formData.contraindications.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingId) {
      const { error } = await supabase
        .from('canonical_protocols')
        .update(protocolData)
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        loadProtocols();
      }
    } else {
      const { error } = await supabase
        .from('canonical_protocols')
        .insert([protocolData]);

      if (!error) {
        setIsAdding(false);
        resetForm();
        loadProtocols();
      }
    }
  };

  const handleEdit = (protocol: Protocol) => {
    setEditingId(protocol.id);
    setFormData({
      protocol_name: protocol.protocol_name,
      category: protocol.category,
      target_concerns: protocol.target_concerns.join(', '),
      typical_duration: protocol.typical_duration || '',
      allowed_products: protocol.allowed_products.join(', '),
      contraindications: protocol.contraindications.join(', '),
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this protocol?')) {
      await supabase.from('canonical_protocols').delete().eq('id', id);
      loadProtocols();
    }
  };

  const resetForm = () => {
    setFormData({
      protocol_name: '',
      category: '',
      target_concerns: '',
      typical_duration: '',
      allowed_products: '',
      contraindications: '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  /**
   * Checks if a canonical protocol matches the current month's featured protocols
   *
   * IMPORTANT: This fuzzy matching is ONLY used to display seasonal badges.
   * It NEVER creates new protocols or invents data.
   * All matching is against existing canonical_protocols entries only.
   */
  const isFeaturedProtocol = (protocolName: string): boolean => {
    if (!currentMonthData) return false;
    return currentMonthData.featured_protocols.some(
      featured => matchFeaturedToCanonical(featured, protocolName)
    );
  };

  const completionStats = {
    total: protocols.length,
    incomplete: protocols.filter(p => p.completion_status === 'incomplete').length,
    stepsComplete: protocols.filter(p => p.completion_status === 'steps_complete').length,
    fullyComplete: protocols.filter(p => p.completion_status === 'fully_complete').length,
    percentComplete: protocols.length > 0
      ? Math.round((protocols.filter(p => p.completion_status !== 'incomplete').length / protocols.length) * 100)
      : 0
  };

  const filteredProtocols = protocols.filter(p => {
    if (filterStatus !== 'all' && p.completion_status !== filterStatus) return false;
    if (filterBrand !== 'all' && p.brand_id !== filterBrand) return false;
    return true;
  });

  const getCompletionStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_complete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Fully Complete
          </span>
        );
      case 'steps_complete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <CheckCircle className="w-3 h-3" />
            Steps Complete
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3" />
            Incomplete
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pro-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-pro-warm-gray">Loading protocols...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error Loading Protocols</h3>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <button
                onClick={loadInitialData}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {completionEditorId && (
        <ProtocolCompletionEditor
          protocolId={completionEditorId}
          onClose={() => setCompletionEditorId(null)}
          onSave={() => {
            setCompletionEditorId(null);
            loadInitialData();
          }}
        />
      )}

      {currentMonthData && (
        <div className="bg-gradient-to-r from-pro-navy to-pro-charcoal rounded-lg p-4 mb-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-lg">{currentMonthData.month_name} Featured</h3>
          </div>
          <p className="text-white text-sm">{currentMonthData.theme}</p>
          {currentMonthData.featured_protocols.length > 0 && (
            <div className="mt-2 text-sm text-white">
              <strong>Featured Protocols:</strong> {currentMonthData.featured_protocols.join(', ')}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-pro-stone p-4">
          <div className="text-2xl font-bold text-pro-charcoal">{completionStats.total}</div>
          <div className="text-sm text-pro-warm-gray">Total Protocols</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="text-2xl font-bold text-red-900">{completionStats.incomplete}</div>
          <div className="text-sm text-red-700">Incomplete</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="text-2xl font-bold text-yellow-900">{completionStats.stepsComplete}</div>
          <div className="text-sm text-yellow-700">Steps Complete</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-900">{completionStats.fullyComplete}</div>
          <div className="text-sm text-green-700">Fully Complete</div>
        </div>
      </div>

      {completionStats.total > 0 && (
        <div className="bg-pro-cream border border-pro-stone rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-pro-navy">Completion Progress</span>
            <span className="text-sm font-bold text-pro-navy">{completionStats.percentComplete}%</span>
          </div>
          <div className="w-full bg-pro-stone rounded-full h-2">
            <div
              className="bg-pro-navy h-2 rounded-full transition-all"
              style={{ width: `${completionStats.percentComplete}%` }}
            />
          </div>
          <p className="text-xs text-pro-charcoal mt-2">
            {completionStats.incomplete > 0
              ? `${completionStats.incomplete} protocol(s) need completion to unlock Phase 3`
              : 'All protocols complete! Phase 3 ready to unlock.'}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-pro-charcoal">Canonical Protocols</h2>
          <p className="text-sm text-pro-warm-gray mt-1">Official Naturopathica treatment protocols with exact names</p>
        </div>
        {!isAdding && !editingId && (
          <div className="flex items-center gap-3">
            <Link
              to="/admin/protocols/import"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-pro-stone text-pro-charcoal rounded-lg hover:bg-pro-ivory transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Bulk Import
            </Link>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Protocol</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-pro-charcoal">Brand:</label>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="px-3 py-1.5 border border-pro-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy"
          >
            <option value="all">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-pro-navy text-white'
                : 'bg-pro-stone text-pro-charcoal hover:bg-pro-stone'
            }`}
          >
            All ({completionStats.total})
          </button>
        <button
          onClick={() => setFilterStatus('incomplete')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'incomplete'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          Incomplete ({completionStats.incomplete})
        </button>
        <button
          onClick={() => setFilterStatus('steps_complete')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'steps_complete'
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
          }`}
        >
          Steps Complete ({completionStats.stepsComplete})
        </button>
        <button
          onClick={() => setFilterStatus('fully_complete')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'fully_complete'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          Fully Complete ({completionStats.fullyComplete})
        </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-pro-stone p-6 mb-6">
          <h3 className="text-lg font-medium text-pro-charcoal mb-4">
            {editingId ? 'Edit Protocol' : 'New Protocol'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Protocol Name (Exact)
              </label>
              <input
                type="text"
                required
                value={formData.protocol_name}
                onChange={(e) => setFormData({ ...formData, protocol_name: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pro-charcoal mb-1">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
                placeholder="e.g., FACIALS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pro-charcoal mb-1">Typical Duration</label>
              <input
                type="text"
                value={formData.typical_duration}
                onChange={(e) => setFormData({ ...formData, typical_duration: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
                placeholder="e.g., 60 min"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Target Concerns (comma-separated)
              </label>
              <input
                type="text"
                value={formData.target_concerns}
                onChange={(e) => setFormData({ ...formData, target_concerns: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
                placeholder="aging, dehydration, sensitivity"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Allowed Products (comma-separated)
              </label>
              <input
                type="text"
                value={formData.allowed_products}
                onChange={(e) => setFormData({ ...formData, allowed_products: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Contraindications (comma-separated)
              </label>
              <input
                type="text"
                value={formData.contraindications}
                onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Update' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center space-x-2 px-4 py-2 border border-pro-stone rounded-lg hover:bg-pro-ivory"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-pro-stone overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pro-ivory border-b border-pro-stone">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-pro-charcoal">Protocol Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-pro-charcoal">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-pro-charcoal">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-pro-charcoal">Target Concerns</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-pro-charcoal">Duration</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-pro-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pro-stone">
              {filteredProtocols.map((protocol) => {
                const isFeatured = isFeaturedProtocol(protocol.protocol_name);
                return (
                  <tr key={protocol.id} className={`hover:bg-pro-ivory ${isFeatured ? 'bg-pro-cream/50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-pro-charcoal">
                      <div className="flex items-center gap-2">
                        {protocol.protocol_name}
                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pro-gold text-pro-navy">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-pro-warm-gray">{protocol.category}</td>
                    <td className="px-4 py-3">
                      {getCompletionStatusBadge(protocol.completion_status || 'incomplete')}
                    </td>
                    <td className="px-4 py-3 text-sm text-pro-warm-gray">
                      {protocol.target_concerns.join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-pro-warm-gray">{protocol.typical_duration || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setCompletionEditorId(protocol.id)}
                          className="p-1 text-pro-navy hover:text-pro-charcoal"
                          title="Complete Protocol"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(protocol)}
                          className="p-1 text-pro-warm-gray hover:text-pro-charcoal"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(protocol.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete Protocol"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProtocols.length === 0 && (
          <div className="text-center py-12 text-pro-warm-gray">
            {filterStatus === 'all'
              ? 'No protocols yet. Add your first protocol to get started.'
              : `No protocols with status: ${filterStatus.replace('_', ' ')}`}
          </div>
        )}
      </div>
    </div>
  );
}
