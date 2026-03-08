// ── VideoBlock — WO-CMS-04 ─────────────────────────────────────────────
// Renders a video embed (YouTube/Vimeo) or a direct video element.

import React from 'react';

interface VideoBlockProps {
  url?: string;
  poster?: string;
  autoplay?: boolean;
  className?: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  url,
  poster,
  autoplay = false,
  className = '',
}) => {
  if (!url) return null;

  const embedUrl = getEmbedUrl(url);

  return (
    <div className={`max-w-4xl mx-auto px-6 py-8 ${className}`}>
      {embedUrl ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#141418]/5">
          <iframe
            src={`${embedUrl}${autoplay ? '?autoplay=1&mute=1' : ''}`}
            title="Video"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video
          src={url}
          poster={poster}
          controls
          autoPlay={autoplay}
          muted={autoplay}
          playsInline
          className="w-full rounded-lg"
        >
          <track kind="captions" />
        </video>
      )}
    </div>
  );
};
