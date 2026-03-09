import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type TreatmentCost = Database['public']['Tables']['treatment_costs']['Row'];

export default function CostsView() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    item_type: 'product',
    item_reference: '',
    cost_per_unit: '',
    unit_type: '',
    typical_usage_amount: '',
    notes: '',
  });

  const { data: costs = [] } = useQuery<TreatmentCost[]>({
    queryKey: ['treatment_costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatment_costs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const costData = {
      item_type: formData.item_type,
      item_reference: formData.item_reference.trim(),
      cost_per_unit: formData.cost_per_unit ? parseFloat(formData.cost_per_unit) : null,
      unit_type: formData.unit_type.trim() || null,
      typical_usage_amount: formData.typical_usage_amount ? parseFloat(formData.typical_usage_amount) : null,
      notes: formData.notes.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from('treatment_costs')
        .update(costData)
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['treatment_costs'] });
      }
    } else {
      const { error } = await supabase
        .from('treatment_costs')
        .insert([costData]);

      if (!error) {
        setIsAdding(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['treatment_costs'] });
      }
    }
  };

  const handleEdit = (cost: TreatmentCost) => {
    setEditingId(cost.id);
    setFormData({
      item_type: cost.item_type,
      item_reference: cost.item_reference,
      cost_per_unit: cost.cost_per_unit?.toString() || '',
      unit_type: cost.unit_type || '',
      typical_usage_amount: cost.typical_usage_amount?.toString() || '',
      notes: cost.notes || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this cost entry?')) {
      await supabase.from('treatment_costs').delete().eq('id', id);
      queryClient.invalidateQueries({ queryKey: ['treatment_costs'] });
    }
  };

  const resetForm = () => {
    setFormData({
      item_type: 'product',
      item_reference: '',
      cost_per_unit: '',
      unit_type: '',
      typical_usage_amount: '',
      notes: '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-graphite">Treatment Costs</h2>
          <p className="text-sm text-graphite/60 mt-1">COGS data for calculating cost-per-treatment</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cost Entry</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
          <h3 className="text-lg font-medium text-graphite mb-4">
            {editingId ? 'Edit Cost Entry' : 'New Cost Entry'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Item Type</label>
              <select
                value={formData.item_type}
                onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
              >
                <option value="product">Product</option>
                <option value="protocol">Protocol</option>
                <option value="step">Step</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Item Reference</label>
              <input
                type="text"
                required
                value={formData.item_reference}
                onChange={(e) => setFormData({ ...formData, item_reference: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                placeholder="Product/Protocol name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Cost Per Unit</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Unit Type</label>
              <input
                type="text"
                value={formData.unit_type}
                onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                placeholder="ml, application, treatment"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-graphite mb-1">Typical Usage Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.typical_usage_amount}
                onChange={(e) => setFormData({ ...formData, typical_usage_amount: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                placeholder="Amount used per treatment"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-graphite mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
                rows={2}
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
                <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Item Reference</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Cost/Unit</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Usage Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Notes</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-graphite">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft">
              {costs.map((cost) => (
                <tr key={cost.id} className="hover:bg-background">
                  <td className="px-4 py-3 text-sm text-graphite capitalize">{cost.item_type}</td>
                  <td className="px-4 py-3 text-sm font-medium text-graphite">{cost.item_reference}</td>
                  <td className="px-4 py-3 text-sm text-graphite/60">
                    {cost.cost_per_unit ? `$${cost.cost_per_unit.toFixed(2)}${cost.unit_type ? `/${cost.unit_type}` : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-graphite/60">
                    {cost.typical_usage_amount || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-graphite/60">{cost.notes || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(cost)}
                        className="p-1 text-graphite/60 hover:text-graphite"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cost.id)}
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
        {costs.length === 0 && (
          <div className="text-center py-12 text-graphite/60">
            No cost entries yet. Add your first entry to get started.
          </div>
        )}
      </div>
    </div>
  );
}
