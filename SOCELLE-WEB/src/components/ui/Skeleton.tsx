import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string | number;
  width?: string | number;
  rounded?: boolean;
}

export function Skeleton({ height, width, rounded, className = '', style, ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-accent-soft animate-pulse ${rounded ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{ height, width, ...style }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-accent-soft p-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width="50%" />
          <Skeleton height={12} width="30%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}
