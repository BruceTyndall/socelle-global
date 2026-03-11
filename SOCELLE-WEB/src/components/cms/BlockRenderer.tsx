// ── BlockRenderer — WO-CMS-04 / WO-CMS-12 ──────────────────────────────
// Maps a CmsBlock type string to the correct React component and renders it
// using the newly created blockRegistry.
// Merges block.content with page_block.overrides (overrides win).

import React from 'react';
import type { CmsBlock, CmsPageBlock } from '../../lib/cms/types';
import type { Json } from '../../lib/database.types';
import { blockRegistry } from '../../lib/cms/blockRegistry';

function jsonToRecord(val: Json | null | undefined): Record<string, unknown> {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, unknown>;
  }
  return {};
}

interface BlockRendererProps {
  block: CmsBlock;
  pageBlock: CmsPageBlock;
  className?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  pageBlock,
  className,
}) => {
  const config = blockRegistry[block.type as keyof typeof blockRegistry];
  const Component = config?.component;

  if (!Component) {
    if (import.meta.env.DEV) {
      return (
        <div className="max-w-3xl mx-auto px-6 py-4 text-xs text-[#141418]/40 font-sans border border-dashed border-[#141418]/10 rounded-lg">
          Unknown block type: <code>{block.type}</code>
        </div>
      );
    }
    return null;
  }

  const content = jsonToRecord(block.content);
  const overrides = jsonToRecord(pageBlock.overrides);
  const props = { ...content, ...overrides, className };

  return <Component {...props} />;
};
