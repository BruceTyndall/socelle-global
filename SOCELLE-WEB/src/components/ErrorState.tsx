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
      <Icon className="w-12 h-12 text-pro-warm-gray mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-pro-charcoal">{title}</h3>
      <p className="text-sm text-pro-warm-gray mt-1 max-w-md mx-auto">{message}</p>
      {resolvedAction && (
        <button
          onClick={resolvedAction.onClick}
          className="mt-4 px-4 py-2 border border-pro-navy text-pro-navy font-medium rounded-lg hover:bg-pro-cream transition-colors"
        >
          {resolvedAction.label}
        </button>
      )}
    </div>
  );
}
