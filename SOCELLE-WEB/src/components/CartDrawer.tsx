import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../lib/useCart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onSubmit: () => void;
  brandName: string;
  notes: string;
  onNotesChange: (notes: string) => void;
  submitting?: boolean;
  error?: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  onSubmit,
  brandName,
  notes,
  onNotesChange,
  submitting = false,
  error,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
        style={{
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        <div className="p-6 border-b border-accent-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-graphite">
              Your Order — {brandName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent-soft rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-graphite/60" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-accent-soft mb-4" />
            <p className="text-xl font-medium text-graphite mb-2">Your cart is empty</p>
            <p className="text-graphite/60">Add some products to get started</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-background rounded-lg p-4 border border-accent-soft"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-graphite">{item.productName}</h3>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${
                          item.productType === 'pro'
                            ? 'bg-accent-soft text-graphite'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.productType === 'pro' ? 'Professional' : 'Retail'}
                      </span>
                      <p className="text-sm text-graphite/60 mt-1">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.productId)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                        className="p-1 hover:bg-accent-soft rounded transition-colors"
                      >
                        <Minus className="w-4 h-4 text-graphite/60" />
                      </button>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          onUpdateQty(item.productId, parseInt(e.target.value) || 0)
                        }
                        className="w-16 px-2 py-1 text-center border border-accent-soft rounded"
                        min="0"
                      />
                      <button
                        onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                        className="p-1 hover:bg-accent-soft rounded transition-colors"
                      >
                        <Plus className="w-4 h-4 text-graphite/60" />
                      </button>
                    </div>
                    <p className="text-lg font-bold text-graphite">
                      ${(item.unitPrice * item.qty).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-accent-soft p-6 space-y-4 bg-background">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-graphite">Subtotal:</span>
                <span className="text-graphite">${subtotal.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite focus:border-graphite"
                  placeholder="Add any special instructions or notes..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={onSubmit}
                disabled={submitting}
                className="w-full py-3 px-6 bg-graphite text-white font-semibold rounded-lg hover:bg-graphite transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Order Request'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
