import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, iconRight, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-graphite font-sans mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-graphite/60">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full px-4 py-2.5 rounded-xl border font-sans text-sm text-graphite placeholder:text-graphite/60/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-graphite/15 focus:border-graphite disabled:opacity-50 disabled:bg-accent-soft/30 ${error ? 'border-red-400' : 'border-accent-soft bg-white'} ${iconLeft ? 'pl-10' : ''} ${iconRight ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {iconRight && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-graphite/60">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600 font-sans">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-graphite/60 font-sans">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
