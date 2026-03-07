import { type FC } from 'react';

const AVATARS = [
  '/images/avatars/avatar-1.jpg',
  '/images/avatars/avatar-2.jpg',
  '/images/avatars/avatar-3.jpg',
  '/images/avatars/avatar-4.jpg',
];

interface SocialProofProps {
  dark?: boolean;
  count?: string;
  label?: string;
  compact?: boolean;
}

export function SocialProof({ dark = false, count = '18,423', label = 'practitioners already inside', compact = false }: SocialProofProps) {
  const textClass = dark ? 'text-mn-bg' : 'text-graphite';
  const subtextClass = dark ? 'text-mn-bg/50' : 'text-graphite/50';

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      {/* Avatar stack */}
      <div className="flex -space-x-2.5">
        {AVATARS.map((src, i) => (
          <div
            key={i}
            className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-full overflow-hidden ring-2 ${dark ? 'ring-mn-dark' : 'ring-mn-bg'} relative`}
            style={{ zIndex: AVATARS.length - i }}
          >
            <img src={src} alt="Practitioner" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
        <div
          className={`${compact ? 'w-7 h-7 text-[9px]' : 'w-8 h-8 text-[10px]'} rounded-full flex items-center justify-center ring-2 ${
            dark ? 'ring-mn-dark bg-accent/20 text-mn-bg/70' : 'ring-mn-bg bg-accent/10 text-graphite/60'
          } font-mono tracking-tight relative`}
          style={{ zIndex: 0 }}
        >
          99+
        </div>
      </div>
      {/* Count + label */}
      <div className={compact ? 'text-xs' : 'text-sm'}>
        <span className={`font-semibold ${textClass}`}>{count}</span>{' '}
        <span className={subtextClass}>{label}</span>
      </div>
    </div>
  );
}
