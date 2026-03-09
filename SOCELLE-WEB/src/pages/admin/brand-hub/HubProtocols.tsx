import { useState } from 'react';
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  Tag,
  Package,
} from 'lucide-react';
import {
  Badge,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
} from '../../../components/ui';
import { getBrandProtocols } from '../../../lib/intelligence/adminIntelligence';

export default function HubProtocols() {
  const protocols = getBrandProtocols();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state for Add Protocol modal
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formConcerns, setFormConcerns] = useState('');
  const [formProducts, setFormProducts] = useState('');

  const totalProducts = protocols.reduce((s, p) => s + p.products.length, 0);
  const allConcerns = Array.from(new Set(protocols.flatMap(p => p.skinConcerns)));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;
    showToast(`Protocol "${formName}" queued for creation (Supabase integration in Wave 6)`);
    setFormName('');
    setFormDescription('');
    setFormConcerns('');
    setFormProducts('');
    setShowModal(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-graphite text-white text-sm font-sans px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Protocols" value={protocols.length} icon={BookOpen} />
        <StatCard label="Products Referenced" value={totalProducts} icon={Package} />
        <StatCard label="Skin Concerns" value={allConcerns.length} icon={Tag} />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-graphite/60 font-sans">
          {protocols.length} treatment protocol{protocols.length !== 1 ? 's' : ''} linked to this brand
        </p>
        <Button
          size="sm"
          iconLeft={<Plus className="w-4 h-4" />}
          onClick={() => setShowModal(true)}
        >
          Add Protocol
        </Button>
      </div>

      {/* Protocol Cards */}
      <div className="space-y-3">
        {protocols.map((protocol) => {
          const isExpanded = expandedId === protocol.id;
          return (
            <div
              key={protocol.id}
              className="bg-white rounded-xl border border-accent-soft overflow-hidden transition-shadow hover:shadow-card"
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(protocol.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-graphite" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-graphite font-sans text-sm">{protocol.name}</p>
                    <p className="text-xs text-graphite/60 font-sans mt-0.5 truncate max-w-md">
                      {protocol.products.length} product{protocol.products.length !== 1 ? 's' : ''} &middot; {protocol.skinConcerns.length} concern{protocol.skinConcerns.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 flex-wrap justify-end">
                    {protocol.skinConcerns.slice(0, 3).map(c => (
                      <Badge key={c} variant="default">{c}</Badge>
                    ))}
                    {protocol.skinConcerns.length > 3 && (
                      <Badge variant="gray">+{protocol.skinConcerns.length - 3}</Badge>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-graphite/60 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-graphite/60 flex-shrink-0" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-accent-soft px-4 pb-4">
                  {/* Description */}
                  <p className="text-sm text-graphite/60 font-sans py-3">
                    {protocol.description}
                  </p>

                  {/* Skin Concerns */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-graphite font-sans uppercase tracking-wider mb-2">
                      Skin Concerns
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {protocol.skinConcerns.map(c => (
                        <Badge key={c} variant="amber">{c}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Product Steps */}
                  <p className="text-xs font-semibold text-graphite font-sans uppercase tracking-wider mb-2">
                    Protocol Steps
                  </p>
                  <div className="space-y-0">
                    {protocol.products.map((product) => (
                      <div
                        key={product.step}
                        className="flex items-start gap-3 py-2.5 border-b border-accent-soft/30 last:border-0"
                      >
                        <div className="w-7 h-7 rounded-full bg-graphite text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {product.step}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-graphite font-sans text-sm">{product.name}</p>
                          <p className="text-xs text-graphite/60 font-sans mt-0.5">{product.usage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* All Skin Concerns Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Addressed Skin Concerns</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {allConcerns.map(c => {
            const count = protocols.filter(p => p.skinConcerns.includes(c)).length;
            return (
              <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-soft rounded-full">
                <span className="text-xs font-medium text-graphite font-sans">{c}</span>
                <span className="text-[10px] font-bold text-graphite/60 font-sans bg-accent-soft rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add Protocol Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Treatment Protocol" size="lg">
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Protocol Name"
              placeholder="e.g., Advanced Brightening Facial"
              value={formName}
              onChange={e => setFormName(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border border-accent-soft bg-white font-sans text-sm text-graphite placeholder:text-graphite/60/60 focus:outline-none focus:ring-2 focus:ring-graphite/15 focus:border-graphite resize-none"
                rows={3}
                placeholder="Describe the treatment protocol, target outcomes, and ideal client profile..."
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
              />
            </div>
            <Input
              label="Skin Concerns (comma-separated)"
              placeholder="e.g., Hyperpigmentation, Dark Spots, Uneven Tone"
              value={formConcerns}
              onChange={e => setFormConcerns(e.target.value)}
            />
            <Input
              label="Products (comma-separated, in order)"
              placeholder="e.g., Cleanser, Toner, Treatment Serum, Moisturizer"
              value={formProducts}
              onChange={e => setFormProducts(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!formName.trim()}
            iconLeft={<Plus className="w-4 h-4" />}
          >
            Add Protocol
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
