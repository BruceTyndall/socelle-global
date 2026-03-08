// ── CodeBlock — WO-CMS-04 ──────────────────────────────────────────────
// Renders a code snippet with optional filename and language label.

import React, { useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code?: string;
  language?: string;
  filename?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code = '',
  language,
  filename,
  className = '',
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <section className={`max-w-4xl mx-auto px-6 py-8 ${className}`}>
      <div className="rounded-xl overflow-hidden border border-[#141418]/10 bg-[#141418]">
        {(filename || language) && (
          <div className="flex items-center justify-between px-4 py-2 bg-[#141418]/90 border-b border-white/10">
            <span className="text-xs text-white/60 font-sans">
              {filename ?? language}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-white/40 hover:text-white/80 transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
        <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
          <code className="text-white/90 font-mono whitespace-pre">{code}</code>
        </pre>
      </div>
    </section>
  );
};
