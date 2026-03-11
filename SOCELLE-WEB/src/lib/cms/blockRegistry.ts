import {
  HeroBlock,
  TextBlock,
  CtaBlock,
  ImageBlock,
  VideoBlock,
  FaqBlock,
  TestimonialBlock,
  StatsBlock,
  SplitFeatureBlock,
  EvidenceStripBlock,
  EmbedBlock,
  CodeBlock,
  EmbedIntelligenceBlock,
} from '../../components/cms/blocks';
import type { CmsBlockType } from './types';
import type React from 'react';

export interface BlockConfig {
  type: CmsBlockType;
  label: string;
  category: 'layout' | 'content' | 'media' | 'data';
  description: string;
  component: React.FC<any>;
  defaultContent: Record<string, any>;
}

export const blockRegistry: Record<CmsBlockType, BlockConfig> = {
  hero: {
    type: 'hero',
    label: 'Hero',
    category: 'layout',
    description: 'Large header section with optional media and CTAs.',
    component: HeroBlock as React.FC<any>,
    defaultContent: { headline: 'New Hero Section', subheading: 'Add your subheading here' },
  },
  text: {
    type: 'text',
    label: 'Text',
    category: 'content',
    description: 'Standard rich text block.',
    component: TextBlock as React.FC<any>,
    defaultContent: { content: '<p>Enter text here...</p>' },
  },
  cta: {
    type: 'cta',
    label: 'Call to Action',
    category: 'layout',
    description: 'Standalone call-to-action bar.',
    component: CtaBlock as React.FC<any>,
    defaultContent: { label: 'Click Here', url: '#' },
  },
  image: {
    type: 'image',
    label: 'Image',
    category: 'media',
    description: 'Single image with optional caption.',
    component: ImageBlock as React.FC<any>,
    defaultContent: { url: '', alt: '' },
  },
  video: {
    type: 'video',
    label: 'Video',
    category: 'media',
    description: 'Video player embedding.',
    component: VideoBlock as React.FC<any>,
    defaultContent: { url: '' },
  },
  faq: {
    type: 'faq',
    label: 'FAQ',
    category: 'content',
    description: 'Expandable frequently asked questions list.',
    component: FaqBlock as React.FC<any>,
    defaultContent: { faqs: [] },
  },
  testimonial: {
    type: 'testimonial',
    label: 'Testimonial',
    category: 'content',
    description: 'Quote from a customer or user.',
    component: TestimonialBlock as React.FC<any>,
    defaultContent: { quote: 'Great product!', author: 'User' },
  },
  stats: {
    type: 'stats',
    label: 'Stats',
    category: 'content',
    description: 'Grid of numerical statistics.',
    component: StatsBlock as React.FC<any>,
    defaultContent: { stats: [] },
  },
  split_feature: {
    type: 'split_feature',
    label: 'Split Feature',
    category: 'layout',
    description: '50/50 split of text and media.',
    component: SplitFeatureBlock as React.FC<any>,
    defaultContent: { headline: 'Feature', image: '' },
  },
  evidence_strip: {
    type: 'evidence_strip',
    label: 'Evidence Strip',
    category: 'data',
    description: 'Strip displaying data evidence points.',
    component: EvidenceStripBlock as React.FC<any>,
    defaultContent: { title: 'Evidence', proofs: [] },
  },
  embed: {
    type: 'embed',
    label: 'Embed',
    category: 'media',
    description: 'Arbitrary HTML/Iframe embed.',
    component: EmbedBlock as React.FC<any>,
    defaultContent: { html: '' },
  },
  code: {
    type: 'code',
    label: 'Code snippet',
    category: 'content',
    description: 'Syntax-highlighted code block.',
    component: CodeBlock as React.FC<any>,
    defaultContent: { code: '', language: 'javascript' },
  },
};
