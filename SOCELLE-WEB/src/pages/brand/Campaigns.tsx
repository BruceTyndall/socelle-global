import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Users,
  Percent,
  DollarSign,
  Archive,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs';
import { useToast } from '../../components/Toast';
import { useCampaigns } from '../../lib/campaigns/useCampaigns';
import { useProducts } from '../../lib/shop/useProducts';
import type { Campaign, CampaignStatus, DiscountType, OperatorTier } from '../../lib/campaigns/types';

const STATUS_BADGE: Record<CampaignStatus, { variant: 'green' | 'gold' | 'amber' | 'gray' | 'navy'; label: string }> = {
  active: { variant: 'green', label: 'Active' },
  scheduled: { variant: 'gold', label: 'Scheduled' },
  draft: { variant: 'gray', label: 'Draft' },
  completed: { variant: 'navy', label: 'Completed' },
  archived: { variant: 'gray', label: 'Archived' },
};

const TIER_LABELS: Record<OperatorTier, string> = {
  active: 'Active',
  elite: 'Elite',
  master: 'Master',
};

const EMPTY_FORM: Omit<Campaign, 'id' | 'createdAt'> = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  discountType: 'percentage',
  discountValue: 0,
  eligibleProducts: [],
  eligibleTiers: [],
  status: 'draft',
  targetOperatorCount: 0,
};

export default function BrandCampaigns() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const { products: catalogProducts } = useProducts({ per_page: 200, sort: 'featured' });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      eligibleProducts: campaign.eligibleProducts,
      eligibleTiers: campaign.eligibleTiers,
      status: campaign.status,
      targetOperatorCount: campaign.targetOperatorCount,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      addToast('Campaign name is required', 'error');
      return;
    }
    if (editingId) {
      updateCampaign(editingId, form);
      addToast('Campaign updated successfully', 'success');
    } else {
      addCampaign(form);
      addToast('Campaign created successfully', 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteCampaign(id);
    setConfirmDeleteId(null);
    addToast('Campaign deleted', 'success');
  };

  const handleArchive = (id: string) => {
    updateCampaign(id, { status: 'archived' });
    addToast('Campaign archived', 'success');
  };

  const toggleTier = (tier: OperatorTier) => {
    setForm((prev) => ({
      ...prev,
      eligibleTiers: prev.eligibleTiers.includes(tier)
        ? prev.eligibleTiers.filter((t) => t !== tier)
        : [...prev.eligibleTiers, tier],
    }));
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      eligibleProducts: prev.eligibleProducts.includes(productId)
        ? prev.eligibleProducts.filter((p) => p !== productId)
        : [...prev.eligibleProducts, productId],
    }));
  };

  const filterCampaigns = (status: string) => {
    if (status === 'all') return campaigns;
    return campaigns.filter((c) => c.status === status);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProductNames = (ids: string[]) => {
    return ids
      .map((id) => catalogProducts.find((p) => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const renderCampaignCard = (campaign: Campaign) => {
    const statusCfg = STATUS_BADGE[campaign.status];
    return (
      <Card key={campaign.id} padding="none" className="overflow-hidden">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-semibold text-pro-charcoal text-base truncate">
                {campaign.name}
              </h3>
              <p className="text-xs text-pro-warm-gray font-sans mt-1 line-clamp-2">
                {campaign.description}
              </p>
            </div>
            <Badge variant={statusCfg.variant} dot className="ml-3 flex-shrink-0">
              {statusCfg.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2 text-xs text-pro-warm-gray font-sans">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-pro-warm-gray font-sans">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{campaign.targetOperatorCount} operators</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-pro-warm-gray font-sans">
              {campaign.discountType === 'percentage' ? (
                <Percent className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>
                {campaign.discountType === 'percentage'
                  ? `${campaign.discountValue}% off`
                  : `$${campaign.discountValue} credit`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-pro-warm-gray font-sans">
              <span className="flex gap-1">
                {campaign.eligibleTiers.map((t) => (
                  <span
                    key={t}
                    className="inline-block px-1.5 py-0.5 rounded bg-pro-ivory text-[10px] font-medium text-pro-charcoal"
                  >
                    {TIER_LABELS[t]}
                  </span>
                ))}
              </span>
            </div>
          </div>

          {campaign.eligibleProducts.length > 0 && (
            <p className="text-[11px] text-pro-warm-gray font-sans mt-3 line-clamp-1">
              Products: {getProductNames(campaign.eligibleProducts)}
            </p>
          )}
        </div>

        <div className="flex items-center border-t border-pro-stone divide-x divide-pro-stone">
          <button
            onClick={() => openEdit(campaign)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-sans text-pro-warm-gray hover:text-pro-navy hover:bg-pro-cream/50 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          {campaign.status !== 'archived' && (
            <button
              onClick={() => handleArchive(campaign.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-sans text-pro-warm-gray hover:text-amber-600 hover:bg-amber-50/50 transition-colors"
            >
              <Archive className="w-3 h-3" />
              Archive
            </button>
          )}
          <button
            onClick={() => setConfirmDeleteId(campaign.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-sans text-pro-warm-gray hover:text-red-600 hover:bg-red-50/50 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Campaigns | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl text-pro-navy">Campaign Management</h1>
            <p className="text-sm text-pro-warm-gray font-sans mt-0.5">
              Create and manage promotional campaigns for your operator network
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="gold"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/brand/campaigns/new')}
            >
              Create Campaign
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={openCreate}
            >
              Quick Create
            </Button>
          </div>
        </div>

        {/* Tabs + Campaign Grid */}
        <Tabs defaultTab="all">
          <TabList>
            <Tab id="all">All ({campaigns.length})</Tab>
            <Tab id="active">Active ({campaigns.filter((c) => c.status === 'active').length})</Tab>
            <Tab id="scheduled">Scheduled ({campaigns.filter((c) => c.status === 'scheduled').length})</Tab>
            <Tab id="draft">Draft ({campaigns.filter((c) => c.status === 'draft').length})</Tab>
            <Tab id="completed">Completed ({campaigns.filter((c) => c.status === 'completed').length})</Tab>
          </TabList>

          {['all', 'active', 'scheduled', 'draft', 'completed'].map((status) => (
            <TabPanel key={status} id={status} className="pt-5">
              {filterCampaigns(status).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-pro-warm-gray font-sans text-sm">
                    No {status === 'all' ? '' : status} campaigns found.
                  </p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-4">
                  {filterCampaigns(status).map(renderCampaignCard)}
                </div>
              )}
            </TabPanel>
          ))}
        </Tabs>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Campaign' : 'Create Campaign'}
        size="lg"
      >
        <ModalBody className="space-y-5">
          <Input
            label="Campaign Name"
            placeholder="e.g. Spring Renewal Launch"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-pro-stone bg-white font-sans text-sm text-pro-charcoal placeholder:text-pro-warm-gray/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pro-navy/15 focus:border-pro-navy resize-none"
              rows={3}
              placeholder="Describe the campaign objectives and target audience..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                Discount Type
              </label>
              <div className="flex gap-3">
                {(['percentage', 'fixed'] as DiscountType[]).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      form.discountType === type
                        ? 'border-pro-navy bg-pro-navy/5 text-pro-navy'
                        : 'border-pro-stone text-pro-warm-gray hover:border-pro-navy/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value={type}
                      checked={form.discountType === type}
                      onChange={() => setForm((f) => ({ ...f, discountType: type }))}
                      className="sr-only"
                    />
                    {type === 'percentage' ? (
                      <Percent className="w-3.5 h-3.5" />
                    ) : (
                      <DollarSign className="w-3.5 h-3.5" />
                    )}
                    <span className="text-sm font-sans capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <Input
              label={form.discountType === 'percentage' ? 'Discount (%)' : 'Credit Amount ($)'}
              type="number"
              min={0}
              value={form.discountValue || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
              Eligible Operator Tiers
            </label>
            <div className="flex gap-3">
              {(['active', 'elite', 'master'] as OperatorTier[]).map((tier) => (
                <label
                  key={tier}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm font-sans ${
                    form.eligibleTiers.includes(tier)
                      ? 'border-pro-navy bg-pro-navy/5 text-pro-navy'
                      : 'border-pro-stone text-pro-warm-gray hover:border-pro-navy/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.eligibleTiers.includes(tier)}
                    onChange={() => toggleTier(tier)}
                    className="sr-only"
                  />
                  <span className="capitalize">{tier}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
              Eligible Products
            </label>
            {catalogProducts.length === 0 ? (
              <p className="text-xs text-pro-warm-gray font-sans">
                No active products found. Add products in Brand Storefront before creating targeted campaigns.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {catalogProducts.map((product) => (
                  <label
                    key={product.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs font-sans ${
                      form.eligibleProducts.includes(product.id)
                        ? 'border-pro-navy bg-pro-navy/5 text-pro-navy'
                        : 'border-pro-stone text-pro-warm-gray hover:border-pro-navy/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.eligibleProducts.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="sr-only"
                    />
                    <span className="truncate">{product.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Target Operator Count"
            type="number"
            min={0}
            value={form.targetOperatorCount || ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, targetOperatorCount: Number(e.target.value) }))
            }
            hint="Estimated number of operators this campaign will reach"
          />
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {editingId ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Campaign"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-pro-warm-gray font-sans">
            Are you sure you want to delete this campaign? This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
          >
            Delete Campaign
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
