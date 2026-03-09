// ── SavedSearches — INTEL-WO-10 ──────────────────────────────────────────
// UI for saving, listing, and managing named signal alert searches.
// "Save this search" button → modal → name → saved to signal_alerts table.
// Click saved search → applies filter to parent signal table.
// Pearl Mineral V2 tokens only. TanStack Query v5.

import { useState, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Trash2, Bell, BellOff, X, Activity } from 'lucide-react';
import { useSignalAlerts, type SignalAlertFilter } from '../../lib/intelligence/useSignalAlerts';
import { useAuth } from '../../lib/auth';

// ── Save Modal ────────────────────────────────────────────────────────────

interface SaveModalProps {
  filters: SignalAlertFilter;
  onSave: (name: string, notifyInApp: boolean) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

function SaveModal({ filters, onSave, onClose, isSaving }: SaveModalProps) {
  const [name, setName] = useState('');
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeFilters = Object.entries(filters).filter(
    ([, v]) => v && v !== 'all' && v !== '',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for this search.');
      return;
    }
    try {
      await onSave(name.trim(), notifyInApp);
      onClose();
    } catch {
      setError('Failed to save search. Please try again.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-[#F6F3EF] rounded-2xl shadow-2xl z-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-[#6E879B]" />
            <h3 className="font-sans font-semibold text-[#141418] text-base">Save this search</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E8EDF1] transition-colors"
          >
            <X className="w-4 h-4 text-[#141418]" />
          </button>
        </div>

        {/* Active filter summary */}
        {activeFilters.length > 0 && (
          <div className="mb-4 p-3 bg-[#E8EDF1] rounded-xl">
            <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider mb-2">Active Filters</p>
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.map(([key, val]) => (
                <span
                  key={key}
                  className="text-xs font-sans font-medium text-[#141418] bg-white px-2 py-0.5 rounded-full border border-[#6E879B]/20"
                >
                  {key}: {String(val)}
                </span>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-medium text-[#141418] mb-1.5">
              Search name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              placeholder="e.g. High-confidence treatment signals"
              maxLength={120}
              className="w-full px-3 py-2.5 text-sm font-sans rounded-xl border border-[#6E879B]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30"
            />
            {error && <p className="text-xs font-sans text-[#8E6464] mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-sans font-medium text-[#141418]">In-app alerts</p>
              <p className="text-xs font-sans text-gray-500">Notify when new signals match</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifyInApp((v) => !v)}
              className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                notifyInApp ? 'bg-[#6E879B]' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${
                  notifyInApp ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#6E879B]/20 text-sm font-sans font-medium text-[#141418] hover:bg-[#E8EDF1] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#6E879B] text-white text-sm font-sans font-medium hover:bg-[#5A7185] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save search'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────

interface SavedSearchesProps {
  /** Current active filters — passed to save modal */
  activeFilters?: SignalAlertFilter;
  /** Called when user clicks a saved search to apply its filters */
  onApplyFilters?: (filters: SignalAlertFilter, name: string) => void;
  /** Show as inline panel (default) or just the save button */
  variant?: 'panel' | 'button-only';
}

// ── Component ─────────────────────────────────────────────────────────────

export function SavedSearches({
  activeFilters = {},
  onApplyFilters,
  variant = 'panel',
}: SavedSearchesProps) {
  const { user } = useAuth();
  const { alerts, isLoading, error, saveSearch, isSaving, deleteAlert, updateAlert, refetch } =
    useSignalAlerts();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = useCallback(
    async (name: string, notifyInApp: boolean) => {
      await saveSearch({ name, filters: activeFilters, notifyInApp });
    },
    [activeFilters, saveSearch],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        await deleteAlert(id);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteAlert],
  );

  const handleToggleNotify = useCallback(
    async (id: string, current: boolean) => {
      await updateAlert({ id, updates: { notify_in_app: !current } });
    },
    [updateAlert],
  );

  if (!user) return null;

  // ── Button-only variant (just shows "Save this search") ──────────
  if (variant === 'button-only') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F6F3EF] text-[#141418] hover:bg-[#E8EDF1] text-sm font-sans font-medium transition-colors border border-[#6E879B]/10"
        >
          <Bookmark className="w-4 h-4" />
          Save search
        </button>
        {showSaveModal && (
          <SaveModal
            filters={activeFilters}
            onSave={handleSave}
            onClose={() => setShowSaveModal(false)}
            isSaving={isSaving}
          />
        )}
      </>
    );
  }

  // ── Full panel variant ────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-[#6E879B]/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#6E879B]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-[#6E879B]" />
          <h3 className="font-sans font-semibold text-[#141418] text-sm">Saved Searches</h3>
          {alerts.length > 0 && (
            <span className="text-[10px] font-semibold bg-[#E8EDF1] text-[#6E879B] px-1.5 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F6F3EF] text-[#141418] hover:bg-[#E8EDF1] text-xs font-sans font-medium transition-colors border border-[#6E879B]/10"
        >
          <Bookmark className="w-3.5 h-3.5" />
          Save current
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-[#6E879B]/5">
        {/* Loading */}
        {isLoading && (
          <div className="p-5 space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-sans text-[#8E6464]">Failed to load saved searches</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-xs font-sans font-medium text-[#6E879B] hover:text-[#5A7185] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && alerts.length === 0 && (
          <div className="px-5 py-10 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-sans font-medium text-gray-500">No saved searches yet</p>
            <p className="text-xs font-sans text-gray-400 mt-1">
              Filter signals and save your search for quick access
            </p>
          </div>
        )}

        {/* Alert rows */}
        {!isLoading &&
          !error &&
          alerts.map((alert) => {
            const filterCount = Object.values(alert.filter_criteria).filter(
              (v) => v && v !== 'all' && v !== '',
            ).length;

            return (
              <div key={alert.id} className="px-5 py-3 flex items-center gap-3">
                {/* Apply button */}
                <button
                  type="button"
                  onClick={() => onApplyFilters?.(alert.filter_criteria, alert.name)}
                  className="flex-1 min-w-0 text-left group"
                >
                  <p className="text-sm font-sans font-medium text-[#141418] truncate group-hover:text-[#6E879B] transition-colors">
                    {alert.name}
                  </p>
                  <p className="text-xs font-sans text-gray-400">
                    {filterCount} filter{filterCount !== 1 ? 's' : ''} active
                    {alert.last_notified_at && (
                      <> · Last alert {new Date(alert.last_notified_at).toLocaleDateString()}</>
                    )}
                  </p>
                </button>

                {/* Notify toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleNotify(alert.id, alert.notify_in_app)}
                  title={alert.notify_in_app ? 'Disable alerts' : 'Enable alerts'}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F6F3EF] transition-colors flex-shrink-0"
                >
                  {alert.notify_in_app ? (
                    <Bell className="w-4 h-4 text-[#6E879B]" />
                  ) : (
                    <BellOff className="w-4 h-4 text-gray-300" />
                  )}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(alert.id)}
                  disabled={deletingId === alert.id}
                  title="Delete saved search"
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F6F3EF] transition-colors flex-shrink-0 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#8E6464]" />
                </button>
              </div>
            );
          })}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <SaveModal
          filters={activeFilters}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
