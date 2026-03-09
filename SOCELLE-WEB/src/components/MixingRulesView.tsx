import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MixingRule = Database['public']['Tables']['mixing_rules']['Row'];

export default function MixingRulesView() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rule_type: 'compatibility',
    product_references: '',
    rule_description: '',
    severity: 'mandatory',
  });

  const { data: rules = [] } = useQuery<MixingRule[]>({
    queryKey: ['mixing_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mixing_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ruleData = {
      rule_type: formData.rule_type,
      product_references: formData.product_references.split(',').map(s => s.trim()).filter(Boolean),
      rule_description: formData.rule_description.trim(),
      severity: formData.severity,
    };

    if (editingId) {
      const { error } = await supabase
        .from('mixing_rules')
        .update(ruleData)
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['mixing_rules'] });
      }
    } else {
      const { error } = await supabase
        .from('mixing_rules')
        .insert([ruleData]);

      if (!error) {
        setIsAdding(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['mixing_rules'] });
      }
    }
  };

  const handleEdit = (rule: MixingRule) => {
    setEditingId(rule.id);
    setFormData({
      rule_type: rule.rule_type,
      product_references: (rule.product_references ?? []).join(', '),
      rule_description: rule.rule_description,
      severity: rule.severity ?? 'mandatory',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this rule?')) {
      await supabase.from('mixing_rules').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['mixing_rules'] });
    }
  };

  const resetForm = () => {
    setFormData({
      rule_type: 'compatibility',
      product_references: '',
      rule_description: '',
      severity: 'mandatory',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      mandatory: 'bg-red-100 text-red-800',
      warning: 'bg-amber-100 text-amber-800',
      info: 'bg-accent-soft text-graphite',
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-graphite">Mixing Rules</h2>
          <p className="text-sm text-graphite/60 mt-1">Product combination and formulation constraints</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rule</span>
          </button>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-amber-900 font-medium">Mixing rules override all other suggestions</p>
          <p className="text-sm text-amber-800 mt-1">
            These constraints are mandatory and will block incompatible product combinations in custom treatments.
          </p>
        </div>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
          <h3 className="text-lg font-medium text-graphite mb-4">
            {editingId ? 'Edit Rule' : 'New Rule'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Rule Type</label>
              <select
                value={formData.rule_type}
                onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
              >
                <option value="compatibility">Compatibility</option>
                <option value="concentration">Concentration</option>
                <option value="restriction">Restriction</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
              >
                <option value="mandatory">Mandatory</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-graphite mb-1">
                Product References (comma-separated)
              </label>
              <input
                type="text"
                required
                value={formData.product_references}
                onChange={(e) => setFormData({ ...formData, product_references: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                placeholder="Product A, Product B"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-graphite mb-1">
                Rule Description
              </label>
              <textarea
                required
                value={formData.rule_description}
                onChange={(e) => setFormData({ ...formData, rule_description: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                rows={3}
                placeholder="Describe the constraint or rule..."
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite"
            >
              <Save className="w-4 h-4" />
              <span>{editingId ? 'Update' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center space-x-2 px-4 py-2 border border-accent-soft rounded-lg hover:bg-background"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-accent-soft">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Products</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Severity</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-graphite">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-background">
                  <td className="px-4 py-3 text-sm text-graphite capitalize">{rule.rule_type}</td>
                  <td className="px-4 py-3 text-sm text-graphite/60">
                    {(rule.product_references ?? []).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-graphite/60">{rule.rule_description}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(rule.severity ?? 'mandatory')}`}>
                      {rule.severity ?? 'mandatory'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-1 text-graphite/60 hover:text-graphite"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rules.length === 0 && (
          <div className="text-center py-12 text-graphite/60">
            No mixing rules yet. Add your first rule to get started.
          </div>
        )}
      </div>
    </div>
  );
}
