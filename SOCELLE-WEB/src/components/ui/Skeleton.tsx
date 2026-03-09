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
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
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
    <div className={`bg-white rounded-xl border border-accent-soft p-6 space-y-4 ${className}`} aria-hidden="true">
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

/** Stat card skeleton — KPI strip loading state */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-accent-soft p-6" aria-hidden="true">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

/** Table row skeleton for sortable/filterable tables */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Generic card skeleton for list views */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-accent-soft p-5 flex flex-col gap-3" aria-hidden="true">
      <div className="flex items-start justify-between">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-16 h-5 rounded" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

/** Brand card skeleton for brand directory/grid */
export function BrandCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-accent-soft overflow-hidden" aria-hidden="true">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

/** Product card skeleton for commerce/shop grids */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-accent-soft overflow-hidden" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

/**
 * Page-level loading skeleton — replaces inline LoadingSkeleton functions.
 * Use this instead of defining per-page LoadingSkeleton functions.
 */
export function PageLoadingSkeleton({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-accent-soft rounded-xl p-5 animate-pulse">
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
