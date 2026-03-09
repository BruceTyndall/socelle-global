import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-brand-surface-alt border border-accent-soft flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-graphite/60" />
      </div>
      <h3 className="font-sans font-semibold text-graphite text-base mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-graphite/60 font-sans max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button size="sm" onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
