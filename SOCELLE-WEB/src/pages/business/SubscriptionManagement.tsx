import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Check, Lock, ArrowRight, AlertTriangle,
  Calendar, RefreshCw, XCircle,
} from 'lucide-react';
import { useSubscription } from '../../modules/_core/hooks/useSubscription';
import { useModuleAccessContext, MODULE_KEYS } from '../../modules/_core/context/ModuleAccessContext';
import { getModuleMeta } from '../../modules/_core/components/UpgradePrompt';

// ── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    trialing: 'bg-blue-50 text-blue-700',
    past_due: 'bg-red-50 text-red-700',
    canceled: 'bg-graphite/5 text-graphite/50',
    none: 'bg-graphite/5 text-graphite/40',
  };
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles[status] ?? styles.none}`}>
      {status === 'none' ? 'No Plan' : status.replace('_', ' ')}
    </span>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function SubscriptionManagement() {
  const { plan, status, billingCycle, currentPeriodEnd, isTrialing, isPastDue, isLoading } = useSubscription();
  const { checkAccess } = useModuleAccessContext();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-graphite/10 rounded w-1/3" />
        <div className="bg-white rounded-2xl border border-graphite/10 p-8">
          <div className="space-y-4">
            <div className="h-4 bg-graphite/10 rounded w-1/2" />
            <div className="h-8 bg-graphite/10 rounded w-1/4" />
            <div className="h-3 bg-graphite/5 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Subscription</h1>
          <p className="text-sm text-graphite/50 mt-1">Manage your plan, modules, and billing</p>
        </div>
        <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
          DEMO
        </span>
      </div>

      {/* Past due warning */}
      {isPastDue && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Payment past due</p>
            <p className="text-sm text-red-600 mt-1">
              Please update your payment method to avoid service interruption.
            </p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white rounded-2xl border border-graphite/10 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-graphite/40 uppercase tracking-wider mb-2">Current Plan</p>
            <h2 className="text-xl font-semibold text-graphite">
              {plan?.name ?? 'No Active Plan'}
            </h2>
          </div>
          <StatusBadge status={status} />
        </div>

        {plan && (
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-xs text-graphite/40 mb-1">Price</p>
              <p className="text-lg font-semibold text-graphite">
                {plan.price_monthly === 0 ? 'Free' : `$${billingCycle === 'annual' ? plan.price_annual : plan.price_monthly}`}
                {plan.price_monthly > 0 && (
                  <span className="text-sm text-graphite/40 font-normal">
                    /{billingCycle === 'annual' ? 'yr' : 'mo'}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-graphite/40 mb-1">Billing Cycle</p>
              <p className="text-sm font-medium text-graphite capitalize">
                {billingCycle ?? 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-graphite/40 mb-1">
                {isTrialing ? 'Trial Ends' : 'Renews On'}
              </p>
              <p className="text-sm font-medium text-graphite flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-graphite/30" />
                {currentPeriodEnd
                  ? currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 h-10 px-5 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {plan ? 'Change Plan' : 'Choose a Plan'}
          </Link>
          {status !== 'none' && status !== 'canceled' && (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="inline-flex items-center gap-2 h-10 px-5 border border-red-200 text-red-600 text-sm font-medium rounded-full hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      {showCancelConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Cancel subscription?</h3>
          <p className="text-sm text-red-600 mb-4">
            You will retain access until the end of your current billing period.
            After that, gated modules will be locked.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowCancelConfirm(false)}
              className="h-9 px-4 text-sm font-medium text-graphite bg-white border border-graphite/10 rounded-full hover:bg-graphite/5 transition-colors"
            >
              Keep Plan
            </button>
            <button
              type="button"
              onClick={() => {
                // TODO: Wire to Supabase / Stripe cancellation
                setShowCancelConfirm(false);
              }}
              className="h-9 px-4 text-sm font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active modules */}
      <div className="bg-white rounded-2xl border border-graphite/10 p-8">
        <h3 className="text-sm font-semibold text-graphite mb-4">Module Access</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {MODULE_KEYS.map((key) => {
            const hasAccess = checkAccess(key);
            const meta = getModuleMeta(key);
            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  hasAccess ? 'border-green-200 bg-green-50/50' : 'border-graphite/5 bg-graphite/[0.02]'
                }`}
              >
                {hasAccess ? (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-graphite/25 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${hasAccess ? 'text-graphite' : 'text-graphite/40'}`}>
                    {meta.label}
                  </p>
                </div>
                {!hasAccess && (
                  <Link
                    to="/pricing"
                    className="text-[11px] font-medium text-accent hover:underline flex-shrink-0"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment method placeholder */}
      <div className="bg-white rounded-2xl border border-graphite/10 p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold text-graphite">Payment Method</h3>
          <button
            type="button"
            className="text-[11px] font-medium text-accent hover:underline"
          >
            Update
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm text-graphite/50">
          <CreditCard className="w-5 h-5 text-graphite/25" />
          <span>No payment method on file</span>
        </div>
        <p className="text-[10px] text-graphite/30 mt-3">
          Stripe billing is environment-controlled. Configure live billing keys to enable card updates.
        </p>
      </div>

      {/* Billing history placeholder */}
      <div className="bg-white rounded-2xl border border-graphite/10 p-8">
        <h3 className="text-sm font-semibold text-graphite mb-4">Billing History</h3>
        <div className="text-center py-8">
          <p className="text-sm text-graphite/40">No billing events yet</p>
        </div>
      </div>
    </div>
  );
}
