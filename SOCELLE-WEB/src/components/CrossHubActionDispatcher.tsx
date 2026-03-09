/**
 * CrossHubActionDispatcher — FOUND-WO-05
 *
 * Shared component for all signal→action flows across hubs.
 * Every hub consumes the same dispatcher instead of hub-specific implementations.
 *
 * Usage:
 *   <CrossHubActionDispatcher signal={signal} />
 *
 * The dispatcher renders an action menu button. When an action is selected,
 * it routes to the target hub's handler (e.g., create deal → Sales, add CRM note → CRM).
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  DollarSign,
  Users,
  Megaphone,
  GraduationCap,
  Bell,
  FileText,
  StickyNote,
  FlaskConical,
  ChevronDown,
} from 'lucide-react';

// ── Signal Action Contract ──────────────────────────────────────────────────
// Canonical interface for all cross-hub signal actions.
// Every hub must consume this contract — no hub-specific action interfaces.

export interface SignalAction {
  signal_id: string;
  signal_title: string;
  signal_category: string;
  signal_delta: number;
  signal_confidence: number;
  signal_source: string;
  action_type: SignalActionType;
  target_hub: string;
  context?: Record<string, unknown>;
}

export type SignalActionType =
  | 'create_deal'
  | 'add_to_crm'
  | 'create_campaign'
  | 'assign_training'
  | 'price_alert'
  | 'create_brief'
  | 'create_alert'
  | 'add_to_note'
  | 'create_protocol';

// ── Action definitions ──────────────────────────────────────────────────────

interface ActionDef {
  type: SignalActionType;
  label: string;
  icon: React.ElementType;
  targetHub: string;
  route: string;
  description: string;
}

const ACTION_DEFS: ActionDef[] = [
  {
    type: 'create_deal',
    label: 'Create Deal',
    icon: DollarSign,
    targetHub: 'sales',
    route: '/portal/sales/deals',
    description: 'Create a deal from this signal',
  },
  {
    type: 'add_to_crm',
    label: 'Add CRM Note',
    icon: Users,
    targetHub: 'crm',
    route: '/portal/crm',
    description: 'Add a note to CRM from this signal',
  },
  {
    type: 'create_campaign',
    label: 'Create Campaign',
    icon: Megaphone,
    targetHub: 'marketing',
    route: '/portal/marketing-hub/campaigns/new',
    description: 'Launch a marketing campaign from this signal',
  },
  {
    type: 'assign_training',
    label: 'Assign Training',
    icon: GraduationCap,
    targetHub: 'education',
    route: '/portal/education',
    description: 'Assign staff training based on this signal',
  },
  {
    type: 'price_alert',
    label: 'Set Price Alert',
    icon: Bell,
    targetHub: 'intelligence',
    route: '/portal/intelligence',
    description: 'Create a price alert for this signal',
  },
  {
    type: 'create_brief',
    label: 'Create Brief',
    icon: FileText,
    targetHub: 'intelligence',
    route: '/portal/intelligence/briefs',
    description: 'Generate an intelligence brief from this signal',
  },
  {
    type: 'create_alert',
    label: 'Create Alert',
    icon: Bell,
    targetHub: 'intelligence',
    route: '/portal/intelligence',
    description: 'Set up an alert based on this signal',
  },
  {
    type: 'add_to_note',
    label: 'Add to Note',
    icon: StickyNote,
    targetHub: 'crm',
    route: '/portal/crm',
    description: 'Attach this signal to a client note',
  },
  {
    type: 'create_protocol',
    label: 'Create Protocol',
    icon: FlaskConical,
    targetHub: 'education',
    route: '/portal/protocols',
    description: 'Create a treatment protocol from this signal',
  },
];

// ── Signal shape for the dispatcher ─────────────────────────────────────────

export interface DispatcherSignal {
  id: string;
  title: string;
  category: string;
  delta: number;
  confidence: number;
  source: string;
}

interface CrossHubActionDispatcherProps {
  signal: DispatcherSignal;
  onAction?: (action: SignalAction) => void;
  className?: string;
  compact?: boolean;
}

export function CrossHubActionDispatcher({
  signal,
  onAction,
  className = '',
  compact = false,
}: CrossHubActionDispatcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = useCallback(
    (def: ActionDef) => {
      const action: SignalAction = {
        signal_id: signal.id,
        signal_title: signal.title,
        signal_category: signal.category,
        signal_delta: signal.delta,
        signal_confidence: signal.confidence,
        signal_source: signal.source,
        action_type: def.type,
        target_hub: def.targetHub,
        context: {
          dispatched_at: new Date().toISOString(),
          source_component: 'CrossHubActionDispatcher',
        },
      };

      onAction?.(action);

      // Navigate to target hub with signal context in state
      navigate(def.route, {
        state: {
          fromSignal: action,
        },
      });

      setIsOpen(false);
    },
    [signal, onAction, navigate],
  );

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 font-sans text-sm font-medium
          ${compact ? 'px-2.5 py-1.5' : 'px-4 py-2'}
          rounded-lg bg-accent/10 text-accent hover:bg-accent/20
          transition-colors duration-150 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Zap className="w-4 h-4" />
        {!compact && <span>Actions</span>}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-1 z-50 w-64
              bg-white rounded-xl border border-[rgba(30,37,43,0.08)]
              shadow-dropdown animate-fade-in"
            role="menu"
          >
            <div className="px-3 py-2 border-b border-[rgba(30,37,43,0.06)]">
              <p className="text-xs font-medium text-graphite/50 font-sans uppercase tracking-wider">
                Signal Actions
              </p>
            </div>
            <div className="py-1">
              {ACTION_DEFS.map((def) => {
                const Icon = def.icon;
                return (
                  <button
                    key={def.type}
                    onClick={() => handleAction(def)}
                    className="w-full flex items-center gap-3 px-3 py-2.5
                      text-left text-sm text-graphite hover:bg-accent-soft/50
                      transition-colors duration-100"
                    role="menuitem"
                  >
                    <Icon className="w-4 h-4 text-accent shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium font-sans">{def.label}</p>
                      <p className="text-xs text-graphite/50 font-sans truncate">
                        {def.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CrossHubActionDispatcher;
