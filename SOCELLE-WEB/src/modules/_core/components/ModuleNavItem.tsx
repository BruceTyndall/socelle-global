import { NavLink, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { useModuleAccess } from '../hooks/useModuleAccess';

interface ModuleNavItemProps {
  /** Module key to check access for */
  moduleKey: string;
  /** Route path */
  to: string;
  /** Display label */
  label: string;
  /** Optional icon element */
  icon?: ReactNode;
}

/**
 * Navigation item that shows a lock badge if the module is gated.
 * - If hasAccess -> renders a normal NavLink
 * - If !hasAccess -> shows lock icon overlay, clicking routes to the upgrade prompt
 */
export default function ModuleNavItem({ moduleKey, to, label, icon }: ModuleNavItemProps) {
  const { hasAccess, isLoading } = useModuleAccess(moduleKey);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-graphite/30 animate-pulse">
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{label}</span>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <button
        type="button"
        onClick={() => navigate(to)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-graphite/40 hover:text-graphite/60 transition-colors w-full text-left group"
      >
        {icon && <span className="w-4 h-4 opacity-40">{icon}</span>}
        <span>{label}</span>
        <Lock className="w-3 h-3 ml-auto text-graphite/30 group-hover:text-accent transition-colors" />
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'text-graphite font-semibold'
            : 'text-graphite/60 hover:text-graphite'
        }`
      }
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{label}</span>
    </NavLink>
  );
}
