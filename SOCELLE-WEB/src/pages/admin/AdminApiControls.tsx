// ── AdminApiControls — CTRL-WO-02: API Kill-Switch ───────────────────────────
// Data source: edge_function_controls table (empty fallback if table missing)
// Authority: docs/operations/OPERATION_BREAKOUT.md -> CTRL-WO-02

import { useState, useMemo } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Zap,
  RefreshCw,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import {
  useEdgeFunctionControls,
  useToggleEdgeFunction,
} from '../../lib/useEdgeFunctionControls';
import type { EdgeFunctionControl } from '../../lib/useEdgeFunctionControls';

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminApiControls() {
  const { controls, isDemo, isLoading, isError, error: errorObj, refetch } =
    useEdgeFunctionControls();
  const toggleMutation = useToggleEdgeFunction();

  const [confirmTarget, setConfirmTarget] = useState<EdgeFunctionControl | null>(null);

  // ── KPI counts ────────────────────────────────────────────────────────

  const enabledCount = useMemo(
    () => controls.filter((c) => c.is_enabled).length,
    [controls]
  );

  // ── Toggle handler ────────────────────────────────────────────────────

  const handleToggleClick = (control: EdgeFunctionControl) => {
    if (isDemo) return;
    if (control.is_enabled) {
      // Disabling: show confirmation modal
      setConfirmTarget(control);
    } else {
      // Enabling: no confirmation needed
      toggleMutation.mutate({
        id: control.id,
        functionName: control.function_name,
        newEnabled: true,
      });
    }
  };

  const handleConfirmDisable = () => {
    if (!confirmTarget) return;
    toggleMutation.mutate({
      id: confirmTarget.id,
      functionName: confirmTarget.function_name,
      newEnabled: false,
    });
    setConfirmTarget(null);
  };

  // ── Error state ───────────────────────────────────────────────────────

  if (isError) {
    const message =
      errorObj instanceof Error ? errorObj.message : 'Failed to load API controls.';
    return (
      <div className="py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-[#8E6464] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">
          API Controls Unavailable
        </h3>
        <p className="text-sm text-graphite/60 mt-1 max-w-md mx-auto font-sans">
          {message}
        </p>
        <button
          onClick={() => void refetch()}
          className="mt-4 px-4 py-2 border border-accent text-accent font-medium rounded-lg hover:bg-accent-soft transition-colors font-sans text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-48 bg-accent-soft rounded" />
            <div className="h-4 w-64 bg-accent-soft rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-accent-soft rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-accent-soft rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-accent-soft rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-graphite font-sans">
              API Controls
            </h1>
            <p className="text-graphite/60 font-sans mt-1 text-sm">
              {enabledCount} enabled, {controls.length - enabledCount} disabled
            </p>
          </div>
          {isDemo && (
            <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
              DEMO
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* DEMO banner */}
      {isDemo && (
        <div className="bg-[#A97A4C]/10 text-[#A97A4C] text-xs font-medium px-4 py-2 rounded-lg text-center font-sans">
          DEMO -- edge_function_controls table not yet created. No data to display.
        </div>
      )}

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">
            Total Functions
          </p>
          <p className="text-3xl font-semibold text-graphite font-sans">
            {controls.length}
          </p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Enabled</p>
          <p className="text-3xl font-semibold text-[#5F8A72] font-sans">
            {enabledCount}
          </p>
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <p className="text-sm font-medium text-graphite/60 font-sans mb-2">Disabled</p>
          <p className="text-3xl font-semibold text-[#8E6464] font-sans">
            {controls.length - enabledCount}
          </p>
        </div>
      </div>

      {/* Controls table */}
      {controls.length === 0 && !isDemo && (
        <div className="py-10 text-center bg-white border border-accent-soft rounded-xl">
          <Zap className="w-8 h-8 text-graphite/30 mx-auto mb-2" />
          <p className="text-sm text-graphite/60 font-sans">
            No edge function controls found. Run the migration to seed them.
          </p>
        </div>
      )}

      {controls.length > 0 && (
        <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-accent-soft bg-[#F6F3EF]/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wide">
                    Function
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wide">
                    Display Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wide">
                    Last Toggled
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-graphite/60 uppercase tracking-wide">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {controls.map((control) => (
                  <tr
                    key={control.id}
                    className="border-b border-accent-soft/50 last:border-b-0 hover:bg-accent-soft/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-graphite font-medium">
                        {control.function_name}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-graphite">
                      {control.display_name}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleClick(control)}
                        className="inline-flex items-center gap-2 focus:outline-none"
                        title={
                          control.is_enabled
                            ? 'Click to disable'
                            : 'Click to enable'
                        }
                        disabled={isDemo || toggleMutation.isPending}
                      >
                        {control.is_enabled ? (
                          <>
                            <ToggleRight className="w-7 h-7 text-[#5F8A72]" />
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-[#5F8A72]/10 text-[#5F8A72]">
                              ON
                            </span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-7 h-7 text-[#8E6464]" />
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide bg-[#8E6464]/10 text-[#8E6464]">
                              OFF
                            </span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-xs text-graphite/50">
                      {timeAgo(control.last_toggled_at)}
                    </td>
                    <td className="px-5 py-4 text-xs text-graphite/60 max-w-xs truncate">
                      {control.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-3 bg-accent-soft/50 rounded-xl p-4">
        <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <div className="text-xs text-graphite/60 font-sans">
          <p className="font-medium text-graphite/80 mb-1">About API Controls</p>
          <p>
            API controls let you enable or disable edge functions at runtime. Disabling
            a function will prevent all requests from being processed. Use this as an
            emergency kill-switch if a function is misbehaving. Toggle changes are
            audit-logged.
          </p>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-graphite/40"
            onClick={() => setConfirmTarget(null)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8E6464]/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#8E6464]" />
                </div>
                <h3 className="text-lg font-semibold text-graphite font-sans">
                  Disable Function?
                </h3>
              </div>
              <button
                onClick={() => setConfirmTarget(null)}
                className="p-1 rounded-lg hover:bg-accent-soft transition-colors text-graphite/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-graphite/70 font-sans">
              Disabling{' '}
              <span className="font-semibold text-graphite">
                {confirmTarget.display_name}
              </span>{' '}
              will prevent all requests to this function. Continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisable}
                className="px-4 py-2 rounded-lg bg-[#8E6464] text-white hover:bg-[#7A5555] font-sans text-sm transition-colors"
              >
                Disable Function
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
