import React from 'react';

export function getImpactLabel(score: number): { label: string; colorClass: string } {
  if (score >= 80) return { label: 'High Impact', colorClass: 'bg-rose-100/80 text-rose-700' };
  if (score >= 50) return { label: 'Medium Impact', colorClass: 'bg-amber-100/80 text-amber-700' };
  return { label: 'Low Impact', colorClass: 'bg-slate-100/80 text-slate-700' };
}

interface ImpactBadgeProps {
  score?: number | null;
  className?: string;
}

export default function ImpactBadge({ score, className = '' }: ImpactBadgeProps) {
  if (score == null) return null;
  const { label, colorClass } = getImpactLabel(score);
  return (
    <span 
      className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium whitespace-nowrap ${colorClass} ${className}`}
      title={`Impact Score: ${Math.round(score)}`}
    >
      {label} ({Math.round(score)}/100)
    </span>
  );
}
