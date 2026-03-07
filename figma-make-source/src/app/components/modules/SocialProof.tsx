import { ImageWithFallback } from '../figma/ImageWithFallback';

const AVATARS = [
  'https://images.unsplash.com/photo-1592393532405-fb1f165c4a1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80',
  'https://images.unsplash.com/photo-1632054224659-280be3239aff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80',
  'https://images.unsplash.com/photo-1656568726647-9092bf2b5640?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80',
  'https://images.unsplash.com/photo-1666887360742-974c8fce8e6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80',
];

interface SocialProofProps {
  dark?: boolean;
  count?: string;
  label?: string;
  compact?: boolean;
}

export function SocialProof({ dark = false, count = '18,423', label = 'practitioners already inside', compact = false }: SocialProofProps) {
  const textClass = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';
  const subtextClass = dark ? 'text-[#F7F5F2]/50' : 'text-[#141418]/50';

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      {/* Avatar stack */}
      <div className="flex -space-x-2.5">
        {AVATARS.map((src, i) => (
          <div
            key={i}
            className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-full overflow-hidden ring-2 ${dark ? 'ring-[#1F2428]' : 'ring-[#FAF9F7]'} relative`}
            style={{ zIndex: AVATARS.length - i }}
          >
            <ImageWithFallback src={src} alt="Practitioner" className="w-full h-full object-cover" />
          </div>
        ))}
        <div
          className={`${compact ? 'w-7 h-7 text-[9px]' : 'w-8 h-8 text-[10px]'} rounded-full flex items-center justify-center ring-2 ${dark ? 'ring-[#1F2428] bg-[#F7F5F2]/10 text-[#F7F5F2]/70' : 'ring-[#FAF9F7] bg-[#141418]/10 text-[#141418]/70'}`}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          18K+
        </div>
      </div>
      {/* Text */}
      <div className={compact ? 'text-xs' : 'text-sm'}>
        <span className={textClass} style={{ fontFamily: 'var(--font-mono)' }}>{count}</span>
        {' '}
        <span className={subtextClass}>{label}</span>
      </div>
    </div>
  );
}
