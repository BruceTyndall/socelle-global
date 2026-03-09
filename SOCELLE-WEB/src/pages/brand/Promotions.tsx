import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  Pencil,
  Trash2,
  Crown,
  Star,
  Shield,
  Package,
  Download,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { useToast } from '../../components/Toast';
import { useTierDiscounts, useVolumeDiscounts } from '../../lib/campaigns/useCampaigns';
import { exportToCsv } from '../../lib/csvExport';
import type { OperatorTier } from '../../lib/campaigns/types';

const TIER_CONFIG: Record<OperatorTier, { icon: typeof Shield; label: string; color: string; bgColor: string }> = {
  active: { icon: Shield, label: 'Active', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  elite: { icon: Star, label: 'Elite', color: 'text-accent', bgColor: 'bg-amber-50' },
  master: { icon: Crown, label: 'Master', color: 'text-graphite', bgColor: 'bg-background' },
};

export default function BrandPromotions() {
  const { addToast } = useToast();
  const {
    tierDiscounts,
    addTierDiscount,
    updateTierDiscount,
    deleteTierDiscount,
    loading: tierLoading,
    error: tierError,
  } = useTierDiscounts();
  const {
    volumeDiscounts,
    addVolumeDiscount,
    updateVolumeDiscount,
    deleteVolumeDiscount,
    loading: volumeLoading,
    error: volumeError,
  } = useVolumeDiscounts();

  // Tier discount modal state
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState({
    tier: 'active' as OperatorTier,
    discountPercent: 0,
    minUnits: 0,
    description: '',
  });

  // Volume discount modal state
  const [volumeModalOpen, setVolumeModalOpen] = useState(false);
  const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null);
  const [volumeForm, setVolumeForm] = useState({
    minUnits: 0,
    maxUnits: '' as string | number,
    discountPercent: 0,
  });

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'tier' | 'volume'; id: string } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Tier discount handlers
  const openCreateTier = () => {
    setEditingTierId(null);
    setTierForm({ tier: 'active', discountPercent: 0, minUnits: 0, description: '' });
    setTierModalOpen(true);
  };

  const openEditTier = (id: string) => {
    const discount = tierDiscounts.find((d) => d.id === id);
    if (!discount) return;
    setEditingTierId(id);
    setTierForm({
      tier: discount.tier,
      discountPercent: discount.discountPercent,
      minUnits: discount.minUnits || 0,
      description: discount.description,
    });
    setTierModalOpen(true);
  };

  const handleSaveTier = async () => {
    if (!tierForm.description.trim()) {
      addToast('Description is required', 'error');
      return;
    }
    const payload = {
      tier: tierForm.tier,
      discountPercent: tierForm.discountPercent,
      minUnits: tierForm.minUnits || undefined,
      description: tierForm.description,
    };
    setBusyAction(editingTierId ?? 'create-tier');
    if (editingTierId) {
      const ok = await updateTierDiscount(editingTierId, payload);
      if (ok) {
        addToast('Tier discount updated', 'success');
      } else {
        addToast('Unable to update tier discount', 'error');
        setBusyAction(null);
        return;
      }
    } else {
      const created = await addTierDiscount(payload);
      if (created) {
        addToast('Tier discount created', 'success');
      } else {
        addToast('Unable to create tier discount', 'error');
        setBusyAction(null);
        return;
      }
    }
    setTierModalOpen(false);
    setBusyAction(null);
  };

  // Volume discount handlers
  const openCreateVolume = () => {
    setEditingVolumeId(null);
    setVolumeForm({ minUnits: 0, maxUnits: '', discountPercent: 0 });
    setVolumeModalOpen(true);
  };

  const openEditVolume = (id: string) => {
    const discount = volumeDiscounts.find((d) => d.id === id);
    if (!discount) return;
    setEditingVolumeId(id);
    setVolumeForm({
      minUnits: discount.minUnits,
      maxUnits: discount.maxUnits ?? '',
      discountPercent: discount.discountPercent,
    });
    setVolumeModalOpen(true);
  };

  const handleSaveVolume = async () => {
    if (volumeForm.minUnits <= 0) {
      addToast('Minimum units must be greater than 0', 'error');
      return;
    }
    const payload = {
      minUnits: volumeForm.minUnits,
      maxUnits: volumeForm.maxUnits ? Number(volumeForm.maxUnits) : undefined,
      discountPercent: volumeForm.discountPercent,
    };
    setBusyAction(editingVolumeId ?? 'create-volume');
    if (editingVolumeId) {
      const ok = await updateVolumeDiscount(editingVolumeId, payload);
      if (ok) {
        addToast('Volume discount updated', 'success');
      } else {
        addToast('Unable to update volume discount', 'error');
        setBusyAction(null);
        return;
      }
    } else {
      const created = await addVolumeDiscount(payload);
      if (created) {
        addToast('Volume discount created', 'success');
      } else {
        addToast('Unable to create volume discount', 'error');
        setBusyAction(null);
        return;
      }
    }
    setVolumeModalOpen(false);
    setBusyAction(null);
  };

  // Delete handler
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusyAction(confirmDelete.id);
    if (confirmDelete.type === 'tier') {
      const ok = await deleteTierDiscount(confirmDelete.id);
      if (!ok) {
        addToast('Unable to delete tier discount', 'error');
        setBusyAction(null);
        return;
      }
    } else {
      const ok = await deleteVolumeDiscount(confirmDelete.id);
      if (!ok) {
        addToast('Unable to delete volume discount', 'error');
        setBusyAction(null);
        return;
      }
    }
    setConfirmDelete(null);
    addToast('Discount deleted', 'success');
    setBusyAction(null);
  };

  const handleExportTierCsv = () => {
    exportToCsv(
      tierDiscounts.map((discount) => ({
        tier: discount.tier,
        discount_percent: discount.discountPercent,
        min_units: discount.minUnits ?? '',
        description: discount.description,
      })),
      'brand_tier_discounts',
    );
  };

  const handleExportVolumeCsv = () => {
    exportToCsv(
      volumeDiscounts.map((discount) => ({
        min_units: discount.minUnits,
        max_units: discount.maxUnits ?? '',
        discount_percent: discount.discountPercent,
      })),
      'brand_volume_discounts',
    );
  };

  return (
    <>
      <Helmet>
        <title>Promotions | Socelle</title>
      </Helmet>

      <div className="space-y-8">
        {(tierError || volumeError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {tierError ?? volumeError}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="font-sans text-2xl text-graphite">Pricing & Promotions</h1>
            <p className="text-sm text-graphite/60 font-sans mt-0.5">
              Manage tier-based pricing and volume discounts for your operator network
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportTierCsv}
              disabled={tierDiscounts.length === 0}
            >
              Export Tier CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportVolumeCsv}
              disabled={volumeDiscounts.length === 0}
            >
              Export Volume CSV
            </Button>
          </div>
        </div>

        {/* Section 1: Tier-Based Pricing */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-sans font-semibold text-graphite text-lg">Tier-Based Pricing</h2>
              <p className="text-xs text-graphite/60 font-sans mt-0.5">
                Set wholesale discount rates based on operator performance tiers
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Plus className="w-3.5 h-3.5" />}
              onClick={openCreateTier}
            >
              Add Tier Discount
            </Button>
          </div>

          {tierLoading ? (
            <Card padding="lg" className="text-center">
              <p className="text-graphite/60 font-sans text-sm">Loading tier discounts...</p>
            </Card>
          ) : tierDiscounts.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-graphite/60 font-sans text-sm">
                No tier discounts configured. Add pricing tiers to incentivize your top-performing operators.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {tierDiscounts.map((discount) => {
                const tierCfg = TIER_CONFIG[discount.tier];
                const TierIcon = tierCfg.icon;
                return (
                  <Card key={discount.id} padding="none" className="overflow-hidden">
                    <div className={`${tierCfg.bgColor} px-5 py-4 border-b border-accent-soft/30`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TierIcon className={`w-5 h-5 ${tierCfg.color}`} />
                          <h3 className="font-sans font-semibold text-graphite text-base capitalize">
                            {tierCfg.label}
                          </h3>
                        </div>
                        <Badge variant="navy">
                          {discount.discountPercent}% off
                        </Badge>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-xs text-graphite/60 font-sans mb-3">
                        {discount.description}
                      </p>
                      {discount.minUnits && (
                        <p className="text-[11px] text-graphite/60 font-sans flex items-center gap-1.5">
                          <Package className="w-3 h-3" />
                          Minimum {discount.minUnits} units/quarter
                        </p>
                      )}
                    </div>
                    <div className="flex items-center border-t border-accent-soft divide-x divide-accent-soft">
                      <button
                        onClick={() => openEditTier(discount.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-sans text-graphite/60 hover:text-graphite hover:bg-accent-soft/50 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ type: 'tier', id: discount.id })}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-sans text-graphite/60 hover:text-red-600 hover:bg-red-50/50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 2: Volume Discounts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-sans font-semibold text-graphite text-lg">Volume Discounts</h2>
              <p className="text-xs text-graphite/60 font-sans mt-0.5">
                Reward larger orders with incremental savings based on unit quantity
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Plus className="w-3.5 h-3.5" />}
              onClick={openCreateVolume}
            >
              Add Volume Tier
            </Button>
          </div>

          {volumeLoading ? (
            <Card padding="lg" className="text-center">
              <p className="text-graphite/60 font-sans text-sm">Loading volume discounts...</p>
            </Card>
          ) : volumeDiscounts.length === 0 ? (
            <Card padding="lg" className="text-center">
              <p className="text-graphite/60 font-sans text-sm">
                No volume discounts configured. Add quantity-based pricing to encourage larger orders.
              </p>
            </Card>
          ) : (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-accent-soft bg-background/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-graphite font-sans">
                        Unit Range
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-graphite font-sans">
                        Discount
                      </th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-graphite font-sans">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {volumeDiscounts.map((discount) => (
                      <tr key={discount.id} className="hover:bg-background/30 transition-colors">
                        <td className="px-5 py-3.5 text-sm text-graphite font-sans">
                          {discount.maxUnits
                            ? `${discount.minUnits} — ${discount.maxUnits} units`
                            : `${discount.minUnits}+ units`}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="green">{discount.discountPercent}% off</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditVolume(discount.id)}
                              className="p-1.5 rounded-lg text-graphite/60 hover:text-graphite hover:bg-accent-soft transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ type: 'volume', id: discount.id })}
                              className="p-1.5 rounded-lg text-graphite/60 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </div>

      {/* Tier Discount Modal */}
      <Modal
        open={tierModalOpen}
        onClose={() => setTierModalOpen(false)}
        title={editingTierId ? 'Edit Tier Discount' : 'Add Tier Discount'}
        size="md"
      >
        <ModalBody className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
              Operator Tier
            </label>
            <div className="flex gap-3">
              {(['active', 'elite', 'master'] as OperatorTier[]).map((tier) => {
                const cfg = TIER_CONFIG[tier];
                const Icon = cfg.icon;
                return (
                  <label
                    key={tier}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors flex-1 ${
                      tierForm.tier === tier
                        ? 'border-graphite bg-graphite/5'
                        : 'border-accent-soft hover:border-graphite/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={tier}
                      checked={tierForm.tier === tier}
                      onChange={() => setTierForm((f) => ({ ...f, tier }))}
                      className="sr-only"
                    />
                    <Icon className={`w-4 h-4 ${tierForm.tier === tier ? cfg.color : 'text-graphite/60'}`} />
                    <span className={`text-sm font-sans capitalize ${tierForm.tier === tier ? 'text-graphite font-medium' : 'text-graphite/60'}`}>
                      {cfg.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Discount (%)"
              type="number"
              min={0}
              max={100}
              value={tierForm.discountPercent || ''}
              onChange={(e) => setTierForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
            />
            <Input
              label="Minimum Units/Quarter"
              type="number"
              min={0}
              value={tierForm.minUnits || ''}
              onChange={(e) => setTierForm((f) => ({ ...f, minUnits: Number(e.target.value) }))}
              hint="Leave 0 for no minimum"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-accent-soft bg-white font-sans text-sm text-graphite placeholder:text-graphite/60/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-graphite/15 focus:border-graphite resize-none"
              rows={3}
              placeholder="Describe this tier pricing level..."
              value={tierForm.description}
              onChange={(e) => setTierForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setTierModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => void handleSaveTier()} disabled={busyAction !== null}>
            {editingTierId ? 'Update' : 'Add'} Tier Discount
          </Button>
        </ModalFooter>
      </Modal>

      {/* Volume Discount Modal */}
      <Modal
        open={volumeModalOpen}
        onClose={() => setVolumeModalOpen(false)}
        title={editingVolumeId ? 'Edit Volume Discount' : 'Add Volume Discount'}
        size="sm"
      >
        <ModalBody className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Units"
              type="number"
              min={1}
              value={volumeForm.minUnits || ''}
              onChange={(e) => setVolumeForm((f) => ({ ...f, minUnits: Number(e.target.value) }))}
            />
            <Input
              label="Maximum Units"
              type="number"
              min={0}
              value={volumeForm.maxUnits}
              onChange={(e) =>
                setVolumeForm((f) => ({
                  ...f,
                  maxUnits: e.target.value ? Number(e.target.value) : '',
                }))
              }
              hint="Leave empty for unlimited"
            />
          </div>
          <Input
            label="Discount (%)"
            type="number"
            min={0}
            max={100}
            value={volumeForm.discountPercent || ''}
            onChange={(e) => setVolumeForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
          />
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setVolumeModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => void handleSaveVolume()} disabled={busyAction !== null}>
            {editingVolumeId ? 'Update' : 'Add'} Volume Discount
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Discount"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-graphite/60 font-sans">
            Are you sure you want to delete this discount? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={() => void handleDelete()} disabled={busyAction !== null}>
            Delete Discount
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
