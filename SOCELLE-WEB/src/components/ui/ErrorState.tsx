import { ReactNode } from 'react';
import { AlertTriangle, LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  icon?: LucideIcon | ((props: { className?: string }) => ReactNode);
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  icon: Icon = AlertTriangle,
  title = 'Something went wrong',
  message,
  action,
  onRetry,
  retryLabel = 'Retry',
  className = '',
}: ErrorStateProps) {
  const resolvedAction = action ?? (onRetry ? { label: retryLabel, onClick: onRetry } : undefined);

  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`} role="alert">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-signal-down" />
      </div>
      <h3 className="font-sans font-semibold text-graphite text-base mb-1.5">{title}</h3>
      <p className="text-sm text-graphite/60 font-sans max-w-xs leading-relaxed">{message}</p>
      {resolvedAction && (
        <div className="mt-5">
          <Button size="sm" variant="outline" onClick={resolvedAction.onClick}>
            {resolvedAction.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
