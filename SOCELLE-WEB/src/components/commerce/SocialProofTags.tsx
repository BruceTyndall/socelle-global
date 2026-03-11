import React from 'react';
import { Instagram, Link2, CheckCircle2 } from 'lucide-react';

interface SocialProofProps {
  platform: 'instagram' | 'tiktok' | 'expert' | 'manufacturer';
  handle: string;
  followerCount?: string;
  quote: string;
  url?: string;
  className?: string;
}

export function SocialProofTag({ platform, handle, followerCount, quote, url, className = '' }: SocialProofProps) {
  const getIcon = () => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'tiktok': return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>;
      case 'expert': return <CheckCircle2 className="w-4 h-4" />;
      case 'manufacturer': return <Link2 className="w-4 h-4" />;
      default: return <Link2 className="w-4 h-4" />;
    }
  };

  const getPlatformColors = () => {
    switch (platform) {
      case 'instagram': return 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100';
      case 'tiktok': return 'bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100';
      case 'expert': return 'bg-blueprint/10 text-blueprint border-blueprint/20 hover:bg-blueprint/15';
      case 'manufacturer': return 'bg-graphite/5 text-graphite border-graphite/10 hover:bg-graphite/10';
      default: return 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100';
    }
  };

  const InnerContent = () => (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-medium text-inherit">
          {getIcon()}
          <span className="text-sm">@{handle}</span>
        </div>
        {followerCount && (
          <span className="text-[10px] font-sans tracking-wide uppercase opacity-70">
            {followerCount} Followers
          </span>
        )}
      </div>
      <p className="text-xs leading-relaxed opacity-90 italic">
        "{quote}"
      </p>
    </>
  );

  return url ? (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-3 rounded-xl border transition-colors ${getPlatformColors()} ${className}`}
    >
      <InnerContent />
    </a>
  ) : (
    <div className={`block p-3 rounded-xl border ${getPlatformColors()} ${className}`}>
      <InnerContent />
    </div>
  );
}

// Container component for multiple tags
export function SocialProofTagList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {children}
    </div>
  );
}
