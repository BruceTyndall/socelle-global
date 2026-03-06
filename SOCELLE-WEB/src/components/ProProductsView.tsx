import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ProProduct = Database['public']['Tables']['pro_products']['Row'];

export default function ProProductsView() {
  const [products, setProducts] = useState<ProProduct[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_function: '',
    key_ingredients: '',
    in_service_usage_allowed: 'unknown',
    contraindications: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('pro_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      product_name: formData.product_name.trim(),
      product_function: formData.product_function.trim(),
      key_ingredients: formData.key_ingredients.split(',').map(s => s.trim()).filter(Boolean),
      in_service_usage_allowed: formData.in_service_usage_allowed,
      contraindications: formData.contraindications.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingId) {
      const { error } = await supabase
        .from('pro_products')
        .update(productData)
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        loadProducts();
      }
    } else {
      const { error } = await supabase
        .from('pro_products')
        .insert([productData]);

      if (!error) {
        setIsAdding(false);
        resetForm();
        loadProducts();
      }
    }
  };

  const handleEdit = (product: ProProduct) => {
    setEditingId(product.id);
    setFormData({
      product_name: product.product_name,
      product_function: product.product_function,
      key_ingredients: product.key_ingredients.join(', '),
      in_service_usage_allowed: product.in_service_usage_allowed,
      contraindications: product.contraindications.join(', '),
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      await supabase.from('pro_products').delete().eq('id', id);
      loadProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      product_function: '',
      key_ingredients: '',
      in_service_usage_allowed: 'unknown',
      contraindications: '',
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
          <h2 className="text-2xl font-semibold text-pro-charcoal">PRO Products</h2>
          <p className="text-sm text-pro-warm-gray mt-1">Professional-use products for building custom treatments</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-pro-stone p-6 mb-6">
          <h3 className="text-lg font-medium text-pro-charcoal mb-4">
            {editingId ? 'Edit Product' : 'New Product'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Product Name (Exact)
              </label>
              <input
                type="text"
                required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Product Function / Outcomes
              </label>
              <textarea
                required
                value={formData.product_function}
                onChange={(e) => setFormData({ ...formData, product_function: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Key Ingredients (comma-separated)
              </label>
              <input
                type="text"
                value={formData.key_ingredients}
                onChange={(e) => setFormData({ ...formData, key_ingredients: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                In-Service Usage Allowed
              </label>
              <select
                value={formData.in_service_usage_allowed}
                onChange={(e) => setFormData({ ...formData, in_service_usage_allowed: e.target.value })}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-pro-navy"
              >
                <option value="unknown">Unknown</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-pro-charcoal">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-pro-charcoal">Function</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-pro-charcoal">In-Service</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-pro-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pro-stone">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-pro-ivory">
                  <td className="px-4 py-3 text-sm font-medium text-pro-charcoal">{product.product_name}</td>
                  <td className="px-4 py-3 text-sm text-pro-warm-gray">{product.product_function}</td>
                  <td className="px-4 py-3 text-sm text-pro-warm-gray capitalize">{product.in_service_usage_allowed}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1 text-pro-warm-gray hover:text-pro-charcoal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
        {products.length === 0 && (
          <div className="text-center py-12 text-pro-warm-gray">
            No PRO products yet. Add your first product to get started.
          </div>
        )}
      </div>
    </div>
  );
}
