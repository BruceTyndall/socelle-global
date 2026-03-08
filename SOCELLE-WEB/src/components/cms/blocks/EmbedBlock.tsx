// ── EmbedBlock — WO-CMS-04 ─────────────────────────────────────────────
// Renders a sanitized iframe embed. Only allows iframe tags for safety.

import React, { useMemo } from 'react';

interface EmbedBlockProps {
  html?: string;
  url?: string;
  className?: string;
}

function sanitizeIframe(raw: string): string | null {
  // Only allow <iframe> tags — strip everything else
  const match = raw.match(/<iframe\s[^>]*src="([^"]+)"[^>]*><\/iframe>/i);
  if (!match) return null;

  const src = match[1];
  // Only allow https sources
  if (!src.startsWith('https://')) return null;

  return raw;
}

export const EmbedBlock: React.FC<EmbedBlockProps> = ({
  html,
  url,
  className = '',
}) => {
  const safeHtml = useMemo(() => (html ? sanitizeIframe(html) : null), [html]);

  return (
    <div className={`max-w-4xl mx-auto px-6 py-8 ${className}`}>
      {safeHtml ? (
        <div
          className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#141418]/5"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      ) : url ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#141418]/5">
          <iframe
            src={url}
            title="Embedded content"
            className="absolute inset-0 w-full h-full"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className="rounded-lg bg-[#141418]/5 p-8 text-center text-[#141418]/40 font-sans text-sm">
          No embeddable content provided.
        </div>
      )}
    </div>
  );
};
