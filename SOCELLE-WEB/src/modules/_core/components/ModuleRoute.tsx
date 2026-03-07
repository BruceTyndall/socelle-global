import type { ReactNode } from 'react';
import { useModuleAccess } from '../hooks/useModuleAccess';
import UpgradePrompt from './UpgradePrompt';

interface ModuleRouteProps {
  /** The module key to gate on (e.g. 'MODULE_SHOP') */
  moduleKey: string;
  children: ReactNode;
}

/**
 * Wrapper component for module-gated routes.
 * - If hasAccess  -> render children
 * - If !hasAccess -> render <UpgradePrompt />
 * - If isLoading  -> render skeleton
 */
export default function ModuleRoute({ moduleKey, children }: ModuleRouteProps) {
  const { hasAccess, isLoading } = useModuleAccess(moduleKey);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="space-y-3 w-40">
          <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse" />
          <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse w-3/4" />
          <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <UpgradePrompt moduleKey={moduleKey} />;
  }

  return <>{children}</>;
}
