import { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Protocol {
  id: string;
  protocol_name: string;
  category: string;
  typical_duration: string;
  target_concerns: string[];
  contraindications: string[];
  completion_status: 'incomplete' | 'steps_complete' | 'fully_complete';
  completed_by: string | null;
  completed_at: string | null;
  manual_entry_notes: string | null;
  source_file: string | null;
}

interface Step {
  id?: string;
  step_number: number;
  step_title: string;
  step_instructions: string;
  timing_minutes: number | null;
  technique_notes: string | null;
  products: StepProduct[];
}

interface StepProduct {
  id?: string;
  product_id: string;
  product_name: string;
  usage_amount: string | null;
  usage_unit: string | null;
  notes: string | null;
}

interface BackbarProduct {
  id: string;
  product_name: string;
  brand: string;
  volume_ml: number | null;
}

interface ProtocolCompletionEditorProps {
  protocolId: string;
  onClose: () => void;
  onSave: () => void;
}

export default function ProtocolCompletionEditor({ protocolId, onClose, onSave }: ProtocolCompletionEditorProps) {
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [backbarProducts, setBackbarProducts] = useState<BackbarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProtocolData();
  }, [protocolId]);

  const loadProtocolData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: protocolData, error: protocolError } = await supabase
        .from('canonical_protocols')
        .select('*')
        .eq('id', protocolId)
        .single();

      if (protocolError) throw protocolError;
      setProtocol(protocolData);

      const { data: stepsData, error: stepsError } = await supabase
        .from('canonical_protocol_steps')
        .select('*')
        .eq('canonical_protocol_id', protocolId)
        .order('step_number');

      if (stepsError) throw stepsError;

      const stepsWithProducts = await Promise.all(
        (stepsData || []).map(async (step) => {
          const { data: productsData } = await supabase
            .from('canonical_protocol_step_products')
            .select('*')
            .eq('protocol_step_id', step.id);

          return {
            ...step,
            products: productsData || []
          };
        })
      );

      setSteps(stepsWithProducts);

      const { data: productsData, error: productsError } = await supabase
        .from('pro_products')
        .select('id, product_name, brand, volume_ml')
        .order('product_name');

      if (productsError) throw productsError;
      setBackbarProducts(productsData || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load protocol');
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const newStepNumber = steps.length > 0 ? Math.max(...steps.map(s => s.step_number)) + 1 : 1;
    setSteps([...steps, {
      step_number: newStepNumber,
      step_title: '',
      step_instructions: '',
      timing_minutes: null,
      technique_notes: null,
      products: []
    }]);
  };

  const updateStep = (index: number, field: keyof Step, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const addProductToStep = (stepIndex: number) => {
    const updated = [...steps];
    updated[stepIndex].products.push({
      product_id: '',
      product_name: '',
      usage_amount: null,
      usage_unit: null,
      notes: null
    });
    setSteps(updated);
  };

  const updateStepProduct = (stepIndex: number, productIndex: number, field: keyof StepProduct, value: any) => {
    const updated = [...steps];
    updated[stepIndex].products[productIndex] = {
      ...updated[stepIndex].products[productIndex],
      [field]: value
    };

    if (field === 'product_id') {
      const product = backbarProducts.find(p => p.id === value);
      if (product) {
        updated[stepIndex].products[productIndex].product_name = product.product_name;
      }
    }

    setSteps(updated);
  };

  const removeProductFromStep = (stepIndex: number, productIndex: number) => {
    const updated = [...steps];
    updated[stepIndex].products = updated[stepIndex].products.filter((_, i) => i !== productIndex);
    setSteps(updated);
  };

  const updateProtocolField = (field: keyof Protocol, value: any) => {
    if (protocol) {
      setProtocol({ ...protocol, [field]: value });
    }
  };

  const validateProtocol = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (steps.length === 0) {
      errors.push('At least one step is required');
    }

    steps.forEach((step, index) => {
      if (!step.step_instructions || step.step_instructions.trim() === '') {
        errors.push(`Step ${index + 1}: Instructions are required`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const saveProtocol = async () => {
    const validation = validateProtocol();
    if (!validation.valid) {
      setError(validation.errors.join('; '));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await supabase
        .from('canonical_protocols')
        .update({
          target_concerns: protocol?.target_concerns || [],
          contraindications: protocol?.contraindications || [],
          typical_duration: protocol?.typical_duration,
          manual_entry_notes: protocol?.manual_entry_notes,
          last_edited_by: 'admin',
          last_edited_at: new Date().toISOString()
        })
        .eq('id', protocolId);

      for (const step of steps) {
        let stepId = step.id;

        if (stepId) {
          await supabase
            .from('canonical_protocol_steps')
            .update({
              step_number: step.step_number,
              step_title: step.step_title,
              step_instructions: step.step_instructions,
              timing_minutes: step.timing_minutes,
              technique_notes: step.technique_notes
            })
            .eq('id', stepId);
        } else {
          const { data: newStep, error: stepError } = await supabase
            .from('canonical_protocol_steps')
            .insert({
              canonical_protocol_id: protocolId,
              step_number: step.step_number,
              step_title: step.step_title,
              step_instructions: step.step_instructions,
              timing_minutes: step.timing_minutes,
              technique_notes: step.technique_notes
            })
            .select()
            .single();

          if (stepError) throw stepError;
          stepId = newStep.id;
        }

        if (stepId) {
          await supabase
            .from('canonical_protocol_step_products')
            .delete()
            .eq('protocol_step_id', stepId);

          for (const product of step.products) {
            if (product.product_id) {
              await supabase
                .from('canonical_protocol_step_products')
                .insert({
                  protocol_step_id: stepId,
                  product_id: product.product_id,
                  product_name: product.product_name,
                  product_type: 'BACKBAR',
                  usage_amount: product.usage_amount,
                  usage_unit: product.usage_unit,
                  notes: product.notes
                });
            }
          }
        }
      }

      setSuccessMessage('Protocol saved successfully');
      setTimeout(() => {
        onSave();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save protocol');
    } finally {
      setSaving(false);
    }
  };

  const markAsComplete = async (status: 'steps_complete' | 'fully_complete') => {
    const validation = validateProtocol();
    if (!validation.valid) {
      setError(`Cannot mark as ${status}: ${validation.errors.join('; ')}`);
      return;
    }

    if (status === 'fully_complete') {
      if (!protocol?.target_concerns || protocol.target_concerns.length === 0) {
        setError('Cannot mark as fully complete: Target concerns are required');
        return;
      }
      if (!protocol?.contraindications || protocol.contraindications.length === 0) {
        setError('Cannot mark as fully complete: Contraindications are required');
        return;
      }
      const hasProducts = steps.some(s => s.products.length > 0);
      if (!hasProducts) {
        setError('Cannot mark as fully complete: At least one product must be linked');
        return;
      }
    }

    try {
      setSaving(true);
      await saveProtocol();

      await supabase
        .from('canonical_protocols')
        .update({
          completion_status: status,
          completed_by: 'admin',
          completed_at: new Date().toISOString()
        })
        .eq('id', protocolId);

      setSuccessMessage(`Protocol marked as ${status.replace('_', ' ')}`);
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-pro-navy" />
        </div>
      </div>
    );
  }

  if (!protocol) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-pro-stone px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-pro-charcoal">Complete Protocol</h2>
            <p className="text-sm text-pro-warm-gray">{protocol.protocol_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-pro-stone rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">{successMessage}</div>
            </div>
          )}

          <div className="bg-pro-ivory rounded-lg p-4">
            <h3 className="font-semibold text-pro-charcoal mb-2">Protocol Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-pro-warm-gray">Category:</span>
                <span className="ml-2 font-medium">{protocol.category}</span>
              </div>
              <div>
                <span className="text-pro-warm-gray">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                  protocol.completion_status === 'fully_complete' ? 'bg-green-100 text-green-700' :
                  protocol.completion_status === 'steps_complete' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {protocol.completion_status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-pro-warm-gray">Source File:</span>
                <span className="ml-2 text-xs">{protocol.source_file || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Typical Duration
              </label>
              <input
                type="text"
                value={protocol.typical_duration || ''}
                onChange={(e) => updateProtocolField('typical_duration', e.target.value)}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                placeholder="e.g., 60 minutes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Target Concerns (comma-separated)
              </label>
              <input
                type="text"
                value={protocol.target_concerns?.join(', ') || ''}
                onChange={(e) => updateProtocolField('target_concerns', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                placeholder="e.g., Acne, Inflammation, Sensitivity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Contraindications (comma-separated)
              </label>
              <input
                type="text"
                value={protocol.contraindications?.join(', ') || ''}
                onChange={(e) => updateProtocolField('contraindications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                placeholder="e.g., Pregnancy, Active infection, Recent laser"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pro-charcoal mb-1">
                Admin Notes
              </label>
              <textarea
                value={protocol.manual_entry_notes || ''}
                onChange={(e) => updateProtocolField('manual_entry_notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                placeholder="Notes about manual entry, sources, or clarifications..."
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-pro-charcoal">Protocol Steps</h3>
              <button
                onClick={addStep}
                className="px-3 py-2 bg-pro-navy hover:bg-pro-charcoal text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 bg-pro-ivory rounded-lg">
                <p className="text-pro-warm-gray">No steps added yet. Click "Add Step" to begin.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="border border-pro-stone rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-pro-charcoal">Step {step.step_number}</h4>
                      <button
                        onClick={() => removeStep(stepIndex)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-pro-charcoal mb-1">
                          Step Title
                        </label>
                        <input
                          type="text"
                          value={step.step_title}
                          onChange={(e) => updateStep(stepIndex, 'step_title', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                          placeholder="e.g., Cleanse"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-pro-charcoal mb-1">
                          Timing (minutes)
                        </label>
                        <input
                          type="number"
                          value={step.timing_minutes || ''}
                          onChange={(e) => updateStep(stepIndex, 'timing_minutes', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-3 py-2 text-sm border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-pro-charcoal mb-1">
                        Instructions <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={step.step_instructions}
                        onChange={(e) => updateStep(stepIndex, 'step_instructions', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                        placeholder="Detailed step instructions..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-pro-charcoal mb-1">
                        Technique Notes
                      </label>
                      <textarea
                        value={step.technique_notes || ''}
                        onChange={(e) => updateStep(stepIndex, 'technique_notes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                        placeholder="Special techniques, tips, or warnings..."
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-pro-charcoal">Products Used</label>
                        <button
                          onClick={() => addProductToStep(stepIndex)}
                          className="px-2 py-1 bg-pro-stone hover:bg-pro-stone text-pro-charcoal rounded text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Product
                        </button>
                      </div>

                      <div className="space-y-2">
                        {step.products.map((product, productIndex) => (
                          <div key={productIndex} className="flex items-start gap-2 bg-pro-ivory p-2 rounded">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <select
                                value={product.product_id}
                                onChange={(e) => updateStepProduct(stepIndex, productIndex, 'product_id', e.target.value)}
                                className="px-2 py-1 text-xs border border-pro-stone rounded focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                              >
                                <option value="">Select product...</option>
                                {backbarProducts.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.product_name} ({p.brand})
                                  </option>
                                ))}
                              </select>

                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={product.usage_amount || ''}
                                  onChange={(e) => updateStepProduct(stepIndex, productIndex, 'usage_amount', e.target.value)}
                                  className="flex-1 px-2 py-1 text-xs border border-pro-stone rounded focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                                  placeholder="Amount"
                                />
                                <input
                                  type="text"
                                  value={product.usage_unit || ''}
                                  onChange={(e) => updateStepProduct(stepIndex, productIndex, 'usage_unit', e.target.value)}
                                  className="w-16 px-2 py-1 text-xs border border-pro-stone rounded focus:ring-2 focus:ring-pro-navy focus:border-transparent"
                                  placeholder="Unit"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => removeProductFromStep(stepIndex, productIndex)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-pro-ivory border-t border-pro-stone px-6 py-4 flex items-center justify-between rounded-b-xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-pro-charcoal hover:bg-pro-stone rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={saveProtocol}
              disabled={saving}
              className="px-4 py-2 bg-pro-navy hover:bg-pro-charcoal disabled:bg-pro-warm-gray text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>

            <button
              onClick={() => markAsComplete('steps_complete')}
              disabled={saving}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-pro-warm-gray text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Steps Complete
            </button>

            <button
              onClick={() => markAsComplete('fully_complete')}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-pro-warm-gray text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Fully Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
