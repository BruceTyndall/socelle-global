import { AlertTriangle, LucideIcon } from 'lucide-react';

interface ErrorStateProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorState({
  icon: Icon = AlertTriangle,
  title = 'Something went wrong',
  message,
  action,
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  const resolvedAction = action ?? (onRetry ? { label: retryLabel, onClick: onRetry } : undefined);

  return (
    <div className="py-16 text-center">
      <Icon className="w-12 h-12 text-graphite/60 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-graphite">{title}</h3>
      <p className="text-sm text-graphite/60 mt-1 max-w-md mx-auto">{message}</p>
      {resolvedAction && (
        <button
          onClick={resolvedAction.onClick}
          className="mt-4 px-4 py-2 border border-graphite text-graphite font-medium rounded-lg hover:bg-accent-soft transition-colors"
        >
          {resolvedAction.label}
        </button>
      )}
    </div>
  );
}
