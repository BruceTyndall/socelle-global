/**
 * studioTemplates — STUDIO-UI-04
 * 50+ built-in template definitions organized by category.
 * Each template provides initial blocks with preset positions/sizes
 * for the DragCanvas artboard system.
 *
 * Templates are seeded into cms_templates table via migration
 * 20260310160001_seed_studio_templates.sql.
 * Static definitions here are used as fallback + for StudioHome quickstart.
 */

import type { CanvasBlock } from '../../components/studio/DragCanvas';

export type TemplateCategory =
  | 'Intelligence Brief'
  | 'Social Post'
  | 'Training Content'
  | 'Campaign'
  | 'Report'
  | 'Proposal'
  | 'Event'
  | 'Brand Kit'
  | 'Email Header'
  | 'Course';

export interface StudioTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  /** Preset ID from OUTPUT_PRESETS in StudioEditor */
  presetId: string;
  /** Thumbnail color (gradient stop or solid) */
  thumbnailColor: string;
  /** Initial blocks for the DragCanvas */
  blocks: Omit<CanvasBlock, 'id'>[];
}

/* ── Helper: assign IDs to blocks ─────────────────────────────── */

let _tplBlockIdx = 0;
function tblk(partial: Omit<CanvasBlock, 'id'>): CanvasBlock {
  return { ...partial, id: `tpl-blk-${++_tplBlockIdx}` };
}

/* ══════════════════════════════════════════════════════════════════
   TEMPLATES (52 total)
   ══════════════════════════════════════════════════════════════════ */

export const STUDIO_TEMPLATES: StudioTemplate[] = [

  /* ── Intelligence Brief (8) ──────────────────────────────────── */
  {
    id: 'brief-market-signal',
    title: 'Market Signal Brief',
    category: 'Intelligence Brief',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 0, y: 0, w: 8, h: 1080, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 60, y: 80, w: 900, h: 120, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Market Signal Brief', level: 1 } },
      { type: 'text', x: 60, y: 220, w: 800, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Category · Region · Date' } },
      { type: 'kpi', x: 60, y: 340, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.15)', content: { label: 'Adoption Velocity', value: '+24%', direction: 'up', change: 'vs. prior quarter' } },
      { type: 'kpi', x: 360, y: 340, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.15)', content: { label: 'Category Share', value: '18%', direction: 'neutral', change: 'steady' } },
      { type: 'kpi', x: 660, y: 340, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.15)', content: { label: 'Margin Signal', value: '↓ 3pts', direction: 'down', change: 'alert' } },
      { type: 'text', x: 60, y: 540, w: 900, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Key insight narrative. Replace with your signal analysis, source attribution, and recommended action for practitioners.' } },
      { type: 'text', x: 60, y: 980, w: 400, h: 40, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'SOCELLE Intelligence · Confidential' } },
    ],
  },
  {
    id: 'brief-ingredient-trend',
    title: 'Ingredient Trend Brief',
    category: 'Intelligence Brief',
    presetId: 'slide-16x9',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 6, zIndex: 1, rotation: 0, locked: true, content: { fill: '#5F8A72' } },
      { type: 'heading', x: 80, y: 60, w: 960, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Ingredient Trend: [Name]', level: 1 } },
      { type: 'kpi', x: 80, y: 200, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: '#5F8A72', color: '#F6F3EF', content: { label: 'Formulation Mentions', value: '847', direction: 'up' } },
      { type: 'kpi', x: 360, y: 200, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'EU Status', value: 'SAFE', direction: 'up' } },
      { type: 'kpi', x: 640, y: 200, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'YoY Growth', value: '+31%', direction: 'up' } },
      { type: 'text', x: 80, y: 380, w: 840, h: 240, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Clinical data summary. Mechanism of action, efficacy evidence, contraindications, and protocol guidance for treatment room use.' } },
    ],
  },
  {
    id: 'brief-competitor-intel',
    title: 'Competitor Intelligence',
    category: 'Intelligence Brief',
    presetId: 'slide-16x9',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Competitor Intelligence Report', level: 1 } },
      { type: 'text', x: 80, y: 180, w: 600, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Brand: [Name] · Category: [Category] · Period: Q1 2026' } },
      { type: 'kpi', x: 80, y: 270, w: 220, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(169,122,76,0.2)', content: { label: 'Market Share Est.', value: '12%', direction: 'up', color: '#F6F3EF' } },
      { type: 'kpi', x: 340, y: 270, w: 220, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(169,122,76,0.2)', content: { label: 'Price Position', value: 'Mid+', direction: 'neutral', color: '#F6F3EF' } },
      { type: 'kpi', x: 600, y: 270, w: 220, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(169,122,76,0.2)', content: { label: 'Protocol Adoption', value: '+18%', direction: 'up', color: '#F6F3EF' } },
      { type: 'text', x: 80, y: 450, w: 840, h: 320, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Strengths: [list key strengths]\n\nWeaknesses: [list gaps]\n\nRecommended response strategy for operators and practitioners.' } },
    ],
  },
  {
    id: 'brief-reorder-risk',
    title: 'Reorder Risk Alert',
    category: 'Intelligence Brief',
    presetId: 'slide-16x9',
    thumbnailColor: '#8E6464',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 8, zIndex: 1, rotation: 0, locked: true, content: { fill: '#8E6464' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: '⚠ Reorder Risk Alert', level: 1 } },
      { type: 'kpi', x: 80, y: 200, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#8E6464', color: '#F6F3EF', content: { label: 'Products at Risk', value: '7', direction: 'down' } },
      { type: 'kpi', x: 380, y: 200, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Avg Days to Stockout', value: '12d', direction: 'down' } },
      { type: 'text', x: 80, y: 380, w: 900, h: 400, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Affected products and recommended reorder quantities.\n\nPriority 1: [Product Name] — 3d remaining\nPriority 2: [Product Name] — 8d remaining\nPriority 3: [Product Name] — 12d remaining' } },
    ],
  },
  {
    id: 'brief-protocol-analysis',
    title: 'Protocol Analysis',
    category: 'Intelligence Brief',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#FFFFFF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 480, h: 1080, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 40, y: 80, w: 400, h: 160, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Protocol Analysis', level: 1 } },
      { type: 'text', x: 40, y: 280, w: 400, h: 400, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Protocol Name\n\nTarget Condition:\nKey Steps:\nAvg Duration:\nClient Outcome:' } },
      { type: 'kpi', x: 540, y: 80, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Adoption Rate', value: '68%', direction: 'up' } },
      { type: 'kpi', x: 860, y: 80, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Avg Revenue / Session', value: '$340', direction: 'up' } },
      { type: 'text', x: 540, y: 260, w: 700, h: 600, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Clinical evidence summary, ingredient rationale, contraindications, and sourcing recommendations.' } },
    ],
  },
  {
    id: 'brief-category-gap',
    title: 'Category Gap Report',
    category: 'Intelligence Brief',
    presetId: 'slide-16x9',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Category Gap Analysis', level: 1 } },
      { type: 'text', x: 80, y: 180, w: 600, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Category: [Name] · Geography: [Region] · Q1 2026' } },
      { type: 'kpi', x: 80, y: 270, w: 220, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(95,138,114,0.3)', content: { label: 'Unmet Demand', value: 'HIGH', direction: 'up' } },
      { type: 'kpi', x: 340, y: 270, w: 220, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(95,138,114,0.3)', content: { label: 'Competitor Whitespace', value: '3 gaps', direction: 'up' } },
      { type: 'text', x: 80, y: 450, w: 840, h: 420, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Gap 1: [Description]\nRevenue opportunity: $XXk\n\nGap 2: [Description]\nRevenue opportunity: $XXk\n\nRecommended action: [Sourcing / Protocol / Marketing]' } },
    ],
  },
  {
    id: 'brief-procurement',
    title: 'Procurement Intelligence',
    category: 'Intelligence Brief',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Procurement Intelligence', level: 1 } },
      { type: 'text', x: 80, y: 165, w: 700, h: 45, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Distributor: [Name] · Review Period: [Month YYYY]' } },
      { type: 'kpi', x: 80, y: 240, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: '#5F8A72', color: '#F6F3EF', content: { label: 'Cost Savings vs. Retail', value: '23%', direction: 'up' } },
      { type: 'kpi', x: 360, y: 240, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Fill Rate', value: '97%', direction: 'up' } },
      { type: 'kpi', x: 640, y: 240, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Avg Lead Time', value: '4.2d', direction: 'neutral' } },
      { type: 'text', x: 80, y: 410, w: 860, h: 380, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Top performing SKUs by margin:\n1. [Product] — 38% margin\n2. [Product] — 34% margin\n3. [Product] — 31% margin\n\nSku optimization recommendations for Q2.' } },
    ],
  },
  {
    id: 'brief-trend-forecast',
    title: 'Trend Forecast',
    category: 'Intelligence Brief',
    presetId: 'slide-16x9',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 6, zIndex: 1, rotation: 0, locked: true, content: { fill: '#A97A4C' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Trend Forecast: [Category]', level: 1 } },
      { type: 'text', x: 80, y: 180, w: 700, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Forecast horizon: 6 months · Confidence: High' } },
      { type: 'kpi', x: 80, y: 270, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(169,122,76,0.25)', content: { label: 'Growth Projection', value: '+28%', direction: 'up' } },
      { type: 'kpi', x: 360, y: 270, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(169,122,76,0.25)', content: { label: 'Confidence Score', value: '84%', direction: 'up' } },
      { type: 'text', x: 80, y: 450, w: 900, h: 400, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Forecast rationale, data sources, leading indicators, and operator recommendations.' } },
    ],
  },

  /* ── Social Post (8) ─────────────────────────────────────────── */
  {
    id: 'social-ig-post-clean',
    title: 'IG Post – Clean',
    category: 'Social Post',
    presetId: 'ig-post',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 800, w: 1080, h: 280, zIndex: 1, rotation: 0, locked: false, content: { fill: '#141418' } },
      { type: 'heading', x: 60, y: 820, w: 960, h: 120, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Your headline here', level: 2 }, align: 'left' },
      { type: 'text', x: 60, y: 60, w: 400, h: 40, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: '@socelle' } },
    ],
  },
  {
    id: 'social-ig-post-dark',
    title: 'IG Post – Dark',
    category: 'Social Post',
    presetId: 'ig-post',
    thumbnailColor: '#141418',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 0, y: 0, w: 8, h: 1080, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 60, y: 400, w: 960, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Your message here', level: 2 }, align: 'center' },
      { type: 'text', x: 60, y: 1000, w: 960, h: 40, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: '@socelle · Professional Beauty Intelligence' }, align: 'center' },
    ],
  },
  {
    id: 'social-ig-story-stat',
    title: 'IG Story – Stat',
    category: 'Social Post',
    presetId: 'ig-story',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1920, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 40, y: 40, w: 1000, h: 1840, zIndex: 1, rotation: 0, locked: true, content: { fill: 'rgba(110,135,155,0.08)', radius: 32 } },
      { type: 'kpi', x: 80, y: 700, w: 920, h: 300, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', bg: 'transparent', content: { label: 'Market growth this quarter', value: '+34%', direction: 'up', change: 'vs prior quarter' }, align: 'center' },
      { type: 'text', x: 80, y: 1700, w: 920, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: '@socelle' }, align: 'center' },
    ],
  },
  {
    id: 'social-ig-story-tip',
    title: 'IG Story – Pro Tip',
    category: 'Social Post',
    presetId: 'ig-story',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1920, zIndex: 0, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 300, w: 920, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: '✦ Pro Tip', level: 1 }, align: 'center' },
      { type: 'text', x: 100, y: 600, w: 880, h: 600, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Your insight or tip text goes here. Keep it punchy and practitioner-focused.' }, align: 'center' },
      { type: 'text', x: 80, y: 1780, w: 920, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'SOCELLE INTELLIGENCE' }, align: 'center' },
    ],
  },
  {
    id: 'social-ig-post-quote',
    title: 'IG Post – Quote',
    category: 'Social Post',
    presetId: 'ig-post',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'testimonial', x: 80, y: 300, w: 920, h: 500, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { quote: 'Quote text here. Replace with practitioner insight or brand statement.', author: 'Name, Title', role: '' }, align: 'center' },
      { type: 'text', x: 80, y: 1000, w: 920, h: 40, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: '@socelle' }, align: 'center' },
    ],
  },
  {
    id: 'social-email-header-clean',
    title: 'Email Header – Clean',
    category: 'Email Header',
    presetId: 'email-header',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1200, h: 600, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1200, h: 6, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 180, w: 800, h: 120, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Intelligence Update', level: 1 } },
      { type: 'text', x: 80, y: 330, w: 700, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'What practitioners need to know this week.' } },
    ],
  },
  {
    id: 'social-email-header-light',
    title: 'Email Header – Light',
    category: 'Email Header',
    presetId: 'email-header',
    thumbnailColor: '#F6F3EF',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1200, h: 600, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 594, w: 1200, h: 6, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 200, w: 800, h: 110, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Weekly Intelligence Brief', level: 1 } },
      { type: 'text', x: 80, y: 340, w: 700, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Signals, trends, and procurement intelligence for operators.' } },
    ],
  },
  {
    id: 'social-tiktok-cover',
    title: 'TikTok Cover',
    category: 'Social Post',
    presetId: 'tiktok-cover',
    thumbnailColor: '#141418',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1920, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 60, y: 800, w: 960, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Video Title', level: 2 }, align: 'center' },
      { type: 'text', x: 60, y: 1020, w: 960, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Category · Duration · @socelle' }, align: 'center' },
    ],
  },

  /* ── Training Content (8) ────────────────────────────────────── */
  {
    id: 'training-module-cover',
    title: 'Training Module Cover',
    category: 'Training Content',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'shape-rect', x: 0, y: 800, w: 1920, h: 280, zIndex: 1, rotation: 0, locked: true, content: { fill: 'rgba(20,20,24,0.4)' } },
      { type: 'heading', x: 80, y: 820, w: 1200, h: 120, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Module Title', level: 1 } },
      { type: 'text', x: 80, y: 960, w: 800, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Instructor Name · Duration · CE Credits' } },
    ],
  },
  {
    id: 'training-lesson-slide',
    title: 'Lesson Slide',
    category: 'Training Content',
    presetId: 'slide-16x9',
    thumbnailColor: '#F6F3EF',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#FFFFFF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 8, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Lesson Topic', level: 2 } },
      { type: 'text', x: 80, y: 180, w: 840, h: 600, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: '• Key learning point 1\n• Key learning point 2\n• Key learning point 3\n• Key learning point 4' } },
      { type: 'text', x: 80, y: 1020, w: 600, h: 40, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Module [X] · Slide [X of N]' } },
    ],
  },
  {
    id: 'training-quiz-slide',
    title: 'Quiz Slide',
    category: 'Training Content',
    presetId: 'slide-16x9',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 80, y: 80, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Knowledge Check', level: 2 } },
      { type: 'text', x: 80, y: 220, w: 900, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Question: Which of the following best describes [topic]?' } },
      { type: 'text', x: 80, y: 360, w: 800, h: 480, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'A. Option text\nB. Option text\nC. Option text\nD. Option text' } },
    ],
  },
  {
    id: 'training-protocol-guide',
    title: 'Protocol Guide',
    category: 'Training Content',
    presetId: 'flyer',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 1650, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 10, zIndex: 1, rotation: 0, locked: true, content: { fill: '#5F8A72' } },
      { type: 'heading', x: 80, y: 60, w: 1100, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Protocol Name', level: 1 } },
      { type: 'text', x: 80, y: 180, w: 1100, h: 1200, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Overview:\n[Description]\n\nStep 1: Cleanse + Prep\n[Details]\n\nStep 2: Active Application\n[Details]\n\nStep 3: Treatment\n[Details]\n\nStep 4: Finish + SPF\n[Details]\n\nContraindications:\n[List]\n\nRecommended Products:\n[List]' } },
    ],
  },
  {
    id: 'training-cert-slide',
    title: 'Certification Slide',
    category: 'Training Content',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 200, y: 100, w: 1520, h: 880, zIndex: 1, rotation: 0, locked: true, content: { fill: '#FFFFFF', radius: 24 } },
      { type: 'heading', x: 300, y: 200, w: 1320, h: 120, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Certificate of Completion', level: 1 }, align: 'center' },
      { type: 'text', x: 300, y: 380, w: 1320, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'This certifies that' }, align: 'center' },
      { type: 'heading', x: 300, y: 480, w: 1320, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#6E879B', content: { text: '[Recipient Name]', level: 2 }, align: 'center' },
      { type: 'text', x: 300, y: 620, w: 1320, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'has successfully completed [Module Name]' }, align: 'center' },
    ],
  },
  {
    id: 'training-sop-sheet',
    title: 'Staff SOP Sheet',
    category: 'Training Content',
    presetId: 'staff-sop',
    thumbnailColor: '#141418',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 1650, zIndex: 0, rotation: 0, locked: true, content: { fill: '#FFFFFF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 120, zIndex: 1, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 60, y: 30, w: 1000, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Standard Operating Procedure', level: 2 } },
      { type: 'text', x: 60, y: 160, w: 1155, h: 1380, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Procedure: [Name]\nDept: [Dept]\nVersion: 1.0\n\n1. PURPOSE\n[Describe purpose]\n\n2. SCOPE\n[Who this applies to]\n\n3. PROCEDURE STEPS\nStep 1: [Action]\nStep 2: [Action]\nStep 3: [Action]\n\n4. QUALITY CHECKS\n[ ] Check 1\n[ ] Check 2\n\n5. NOTES\n[Additional notes]' } },
    ],
  },
  {
    id: 'training-brand-onboard',
    title: 'Brand Onboarding Deck',
    category: 'Training Content',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 960, y: 0, w: 960, h: 1080, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 300, w: 800, h: 180, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Welcome to [Brand Name]', level: 1 } },
      { type: 'text', x: 80, y: 520, w: 760, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Partner Onboarding · [Date]' } },
      { type: 'text', x: 1040, y: 400, w: 800, h: 300, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Key topics:\n• Brand story + positioning\n• Product portfolio\n• Protocol requirements\n• Support contacts' } },
    ],
  },
  {
    id: 'training-menu-insert',
    title: 'Service Menu Insert',
    category: 'Training Content',
    presetId: 'menu-insert',
    thumbnailColor: '#F6F3EF',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1200, h: 1800, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1200, h: 10, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 60, w: 1040, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Services Menu', level: 1 }, align: 'center' },
      { type: 'text', x: 80, y: 200, w: 1040, h: 1400, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'FACIALS\n[Service Name] — $XXX\n[Description, 30 min]\n\n[Service Name] — $XXX\n[Description, 60 min]\n\nBODY TREATMENTS\n[Service Name] — $XXX\n[Description]\n\nADD-ONS\n[Service Name] — $XX\n[Description]' } },
    ],
  },

  /* ── Campaign (7) ────────────────────────────────────────────── */
  {
    id: 'campaign-launch-slide',
    title: 'Campaign Launch Slide',
    category: 'Campaign',
    presetId: 'slide-16x9',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 640, h: 1080, zIndex: 1, rotation: 0, locked: true, content: { fill: '#A97A4C' } },
      { type: 'heading', x: 60, y: 260, w: 520, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Campaign Name', level: 1 } },
      { type: 'text', x: 60, y: 490, w: 520, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Launch: [Date] · Target: [Audience]' } },
      { type: 'kpi', x: 720, y: 120, w: 340, h: 160, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Target Reach', value: '12,000', direction: 'up' } },
      { type: 'kpi', x: 1120, y: 120, w: 340, h: 160, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Budget', value: '$4,200', direction: 'neutral' } },
      { type: 'text', x: 720, y: 340, w: 760, h: 500, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Campaign objectives:\n1. [Objective]\n2. [Objective]\n3. [Objective]\n\nChannels: [List channels]\n\nKPIs: [List KPIs]' } },
    ],
  },
  {
    id: 'campaign-promo-flyer',
    title: 'Promo Flyer',
    category: 'Campaign',
    presetId: 'flyer',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 1650, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 80, y: 200, w: 1115, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Special Offer', level: 1 }, align: 'center' },
      { type: 'kpi', x: 200, y: 500, w: 875, h: 200, zIndex: 2, rotation: 0, locked: false, bg: '#6E879B', color: '#F6F3EF', content: { label: 'Discount', value: '20% OFF', direction: 'up' }, align: 'center' },
      { type: 'text', x: 80, y: 800, w: 1115, h: 400, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Valid: [Start Date] – [End Date]\n\nApply at checkout: [CODE]\n\nTerms and conditions apply.' }, align: 'center' },
      { type: 'text', x: 80, y: 1560, w: 1115, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: '[Business Name] · [Phone] · [Website]' }, align: 'center' },
    ],
  },
  {
    id: 'campaign-activation-brief',
    title: 'Brand Activation Brief',
    category: 'Campaign',
    presetId: 'slide-16x9',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Brand Activation Brief', level: 1 } },
      { type: 'kpi', x: 80, y: 200, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#5F8A72', color: '#F6F3EF', content: { label: 'Target Accounts', value: '45', direction: 'up' } },
      { type: 'kpi', x: 380, y: 200, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Timeline', value: '6 weeks', direction: 'neutral' } },
      { type: 'kpi', x: 680, y: 200, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Budget', value: '$8,000', direction: 'neutral' } },
      { type: 'text', x: 80, y: 400, w: 900, h: 500, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Objective:\n[Campaign objective]\n\nTarget audience:\n[Who we are reaching]\n\nKey messages:\n1. [Message 1]\n2. [Message 2]' } },
    ],
  },
  {
    id: 'campaign-seasonal',
    title: 'Seasonal Campaign',
    category: 'Campaign',
    presetId: 'ig-post',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#A97A4C' } },
      { type: 'heading', x: 80, y: 350, w: 920, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Fall Collection', level: 1 }, align: 'center' },
      { type: 'text', x: 80, y: 580, w: 920, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'New arrivals now available for pro accounts.' }, align: 'center' },
      { type: 'text', x: 80, y: 1000, w: 920, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'socelle.com/brands' }, align: 'center' },
    ],
  },
  {
    id: 'campaign-referral',
    title: 'Referral Campaign',
    category: 'Campaign',
    presetId: 'flyer',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 1650, zIndex: 0, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 200, w: 1115, h: 180, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Refer a Colleague', level: 1 }, align: 'center' },
      { type: 'text', x: 100, y: 440, w: 1075, h: 300, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Share your unique referral link and earn credits for every colleague who signs up and places their first order.' }, align: 'center' },
      { type: 'kpi', x: 200, y: 820, w: 875, h: 180, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(255,255,255,0.15)', color: '#F6F3EF', content: { label: 'Your reward per referral', value: '$50 credit', direction: 'up' }, align: 'center' },
      { type: 'text', x: 80, y: 1560, w: 1115, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Terms apply · socelle.com/referral' }, align: 'center' },
    ],
  },
  {
    id: 'campaign-partnership',
    title: 'Partnership Announcement',
    category: 'Campaign',
    presetId: 'ig-post',
    thumbnailColor: '#141418',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 240, y: 500, w: 600, h: 2, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'text', x: 80, y: 320, w: 920, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Introducing' }, align: 'center' },
      { type: 'heading', x: 80, y: 420, w: 920, h: 160, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: '[Partner Name]', level: 1 }, align: 'center' },
      { type: 'text', x: 80, y: 660, w: 920, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Now available on SOCELLE' }, align: 'center' },
    ],
  },
  {
    id: 'campaign-event-invite',
    title: 'Event Invite',
    category: 'Event',
    presetId: 'flyer',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 1650, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 400, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 100, w: 1115, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'You\'re Invited', level: 1 }, align: 'center' },
      { type: 'heading', x: 80, y: 480, w: 1115, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Event Name', level: 2 }, align: 'center' },
      { type: 'text', x: 80, y: 620, w: 1115, h: 600, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Date: [Date]\nTime: [Time]\nLocation: [Address]\n\nJoin us for [description of event]. Light refreshments provided.\n\nRSVP by [RSVP Date]: [contact info]' }, align: 'center' },
    ],
  },

  /* ── Report (5) ──────────────────────────────────────────────── */
  {
    id: 'report-performance',
    title: 'Performance Report',
    category: 'Report',
    presetId: 'slide-16x9',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 6, zIndex: 1, rotation: 0, locked: true, content: { fill: '#5F8A72' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Performance Report', level: 1 } },
      { type: 'text', x: 80, y: 170, w: 700, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Period: [Month YYYY] · Prepared by: [Name]' } },
      { type: 'kpi', x: 80, y: 260, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#5F8A72', color: '#F6F3EF', content: { label: 'Revenue', value: '$48,200', direction: 'up', change: '+12% MoM' } },
      { type: 'kpi', x: 380, y: 260, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Client Visits', value: '312', direction: 'up' } },
      { type: 'kpi', x: 680, y: 260, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Avg Ticket', value: '$154', direction: 'up' } },
      { type: 'kpi', x: 980, y: 260, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Retail Attach Rate', value: '28%', direction: 'up' } },
      { type: 'text', x: 80, y: 450, w: 900, h: 480, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Highlights:\n[Key achievement 1]\n[Key achievement 2]\n\nAreas for improvement:\n[Item 1]\n[Item 2]' } },
    ],
  },
  {
    id: 'report-monthly-intel',
    title: 'Monthly Intelligence Report',
    category: 'Report',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Monthly Intelligence Report', level: 1 } },
      { type: 'text', x: 80, y: 180, w: 600, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: '[Month YYYY] · Prepared by SOCELLE Intelligence' } },
      { type: 'kpi', x: 80, y: 280, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.2)', content: { label: 'Signals Tracked', value: '1,847', direction: 'up' } },
      { type: 'kpi', x: 360, y: 280, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.2)', content: { label: 'Top Category', value: 'Peptides', direction: 'up' } },
      { type: 'kpi', x: 640, y: 280, w: 240, h: 130, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.2)', content: { label: 'Emerging Trend', value: 'Bioferments', direction: 'up' } },
      { type: 'text', x: 80, y: 460, w: 900, h: 480, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Key themes this month:\n1. [Theme 1]\n2. [Theme 2]\n3. [Theme 3]\n\nRecommended actions for operators.' } },
    ],
  },
  {
    id: 'report-qbr',
    title: 'Quarterly Business Review',
    category: 'Report',
    presetId: 'slide-16x9',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 400, h: 1080, zIndex: 1, rotation: 0, locked: true, content: { fill: '#A97A4C' } },
      { type: 'heading', x: 40, y: 200, w: 320, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Q1 2026 Review', level: 1 } },
      { type: 'text', x: 40, y: 420, w: 320, h: 300, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: '[Business Name]\n[Date]\nPrepared by:\n[Name]' } },
      { type: 'kpi', x: 460, y: 80, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Revenue vs. Goal', value: '107%', direction: 'up' } },
      { type: 'kpi', x: 800, y: 80, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'NPS', value: '72', direction: 'up' } },
      { type: 'kpi', x: 1140, y: 80, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'New Clients', value: '+84', direction: 'up' } },
      { type: 'text', x: 460, y: 280, w: 1000, h: 680, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Highlights:\n[Key wins]\n\nChallenges:\n[What we faced]\n\nPlan for Q2:\n[Next quarter goals]' } },
    ],
  },
  {
    id: 'report-client-outcome',
    title: 'Client Outcome Report',
    category: 'Report',
    presetId: 'flyer',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 1650, zIndex: 0, rotation: 0, locked: true, content: { fill: '#FFFFFF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1275, h: 10, zIndex: 1, rotation: 0, locked: true, content: { fill: '#5F8A72' } },
      { type: 'heading', x: 80, y: 60, w: 1115, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Client Outcome Report', level: 2 } },
      { type: 'text', x: 80, y: 170, w: 600, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Client: [Name] · Period: [Dates]' } },
      { type: 'kpi', x: 80, y: 260, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#5F8A72', color: '#F6F3EF', content: { label: 'Sessions Completed', value: '12', direction: 'up' } },
      { type: 'kpi', x: 400, y: 260, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Outcome Score', value: '9.2/10', direction: 'up' } },
      { type: 'text', x: 80, y: 460, w: 1115, h: 1000, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Treatment summary:\n[Description]\n\nObjective progress:\n[Progress against goals]\n\nProducts used:\n[List]\n\nNext phase:\n[Recommendation]' } },
    ],
  },
  {
    id: 'report-distributor',
    title: 'Distributor Performance',
    category: 'Report',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Distributor Performance Dashboard', level: 1 } },
      { type: 'kpi', x: 80, y: 200, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.3)', content: { label: 'On-Time Delivery', value: '96%', direction: 'up' } },
      { type: 'kpi', x: 380, y: 200, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.3)', content: { label: 'Fill Rate', value: '98.2%', direction: 'up' } },
      { type: 'kpi', x: 680, y: 200, w: 260, h: 140, zIndex: 2, rotation: 0, locked: false, bg: 'rgba(110,135,155,0.3)', content: { label: 'Returns Rate', value: '0.8%', direction: 'up' } },
      { type: 'text', x: 80, y: 400, w: 900, h: 540, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Top performing SKUs:\n[List]\n\nIssues flagged:\n[List]\n\nContract renewal: [Date]' } },
    ],
  },

  /* ── Proposal (5) ────────────────────────────────────────────── */
  {
    id: 'proposal-service-cover',
    title: 'Service Proposal Cover',
    category: 'Proposal',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 300, w: 1200, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Service Proposal', level: 1 } },
      { type: 'text', x: 80, y: 530, w: 900, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Prepared for: [Client Name] · [Date]' } },
      { type: 'text', x: 80, y: 980, w: 600, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: '[Your Business Name] · Confidential' } },
    ],
  },
  {
    id: 'proposal-brand-partnership',
    title: 'Brand Partnership Proposal',
    category: 'Proposal',
    presetId: 'slide-16x9',
    thumbnailColor: '#141418',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 6, zIndex: 1, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 80, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Partnership Proposal', level: 1 } },
      { type: 'text', x: 80, y: 200, w: 700, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'From: [Your Brand] · To: [Partner Brand]' } },
      { type: 'text', x: 80, y: 320, w: 900, h: 600, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Proposal overview:\n[Summary]\n\nValue exchange:\n[What each party contributes]\n\nTerms:\n[Key terms]\n\nNext steps:\n[Action items]' } },
    ],
  },
  {
    id: 'proposal-reseller',
    title: 'Reseller Agreement Deck',
    category: 'Proposal',
    presetId: 'slide-16x9',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 10, zIndex: 1, rotation: 0, locked: true, content: { fill: '#A97A4C' } },
      { type: 'heading', x: 80, y: 80, w: 900, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Reseller Program Overview', level: 1 } },
      { type: 'kpi', x: 80, y: 220, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#A97A4C', color: '#F6F3EF', content: { label: 'Commission Rate', value: '15%', direction: 'up' } },
      { type: 'kpi', x: 400, y: 220, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Territory', value: 'Exclusive', direction: 'neutral' } },
      { type: 'kpi', x: 720, y: 220, w: 280, h: 140, zIndex: 2, rotation: 0, locked: false, bg: '#F6F3EF', content: { label: 'Min Monthly Order', value: '$2,500', direction: 'neutral' } },
      { type: 'text', x: 80, y: 420, w: 900, h: 540, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Program benefits:\n[List benefits]\n\nSupport provided:\n[Marketing assets, training, etc.]\n\nKPIs and review cadence:\n[Details]' } },
    ],
  },
  {
    id: 'proposal-event-sponsorship',
    title: 'Event Sponsorship Deck',
    category: 'Proposal',
    presetId: 'slide-16x9',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#5F8A72' } },
      { type: 'heading', x: 80, y: 260, w: 1100, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Sponsorship Opportunity', level: 1 } },
      { type: 'text', x: 80, y: 500, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Event: [Name] · Date: [Date] · Audience: [Size]' } },
    ],
  },
  {
    id: 'proposal-program-pitch',
    title: 'Program Pitch Deck',
    category: 'Proposal',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'heading', x: 80, y: 280, w: 900, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Program Pitch', level: 1 } },
      { type: 'text', x: 80, y: 510, w: 700, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: '[Your Name] · [Date] · [Target Org]' } },
    ],
  },

  /* ── Course (4) ──────────────────────────────────────────────── */
  {
    id: 'course-cover',
    title: 'Course Cover Slide',
    category: 'Course',
    presetId: 'slide-16x9',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#6E879B' } },
      { type: 'heading', x: 80, y: 300, w: 1200, h: 220, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Course Title', level: 1 } },
      { type: 'text', x: 80, y: 560, w: 800, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Instructor: [Name] · Duration: [X hours] · CE Credits: [X]' } },
      { type: 'text', x: 80, y: 1000, w: 600, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'SOCELLE Academy' } },
    ],
  },
  {
    id: 'course-module-intro',
    title: 'Module Intro Slide',
    category: 'Course',
    presetId: 'slide-16x9',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#FFFFFF' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 8, zIndex: 1, rotation: 0, locked: true, content: { fill: '#5F8A72' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Module [N]: [Topic]', level: 1 } },
      { type: 'text', x: 80, y: 200, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Learning objectives:' } },
      { type: 'text', x: 80, y: 320, w: 800, h: 500, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: '1. [Objective 1]\n2. [Objective 2]\n3. [Objective 3]\n4. [Objective 4]' } },
    ],
  },
  {
    id: 'course-assessment',
    title: 'Assessment Slide',
    category: 'Course',
    presetId: 'slide-16x9',
    thumbnailColor: '#A97A4C',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#141418' } },
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 8, zIndex: 1, rotation: 0, locked: true, content: { fill: '#A97A4C' } },
      { type: 'heading', x: 80, y: 80, w: 600, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Assessment', level: 2 } },
      { type: 'text', x: 80, y: 220, w: 900, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Q[N]: [Question text here]' } },
      { type: 'text', x: 80, y: 360, w: 800, h: 500, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'A. [Option 1]\nB. [Option 2]\nC. [Option 3]\nD. [Option 4]' } },
    ],
  },
  {
    id: 'course-completion',
    title: 'Course Completion',
    category: 'Course',
    presetId: 'slide-16x9',
    thumbnailColor: '#5F8A72',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#5F8A72' } },
      { type: 'heading', x: 80, y: 340, w: 1760, h: 200, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { text: 'Module Complete', level: 1 }, align: 'center' },
      { type: 'text', x: 80, y: 580, w: 1760, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'Congratulations! You have completed this module.' }, align: 'center' },
      { type: 'text', x: 80, y: 1020, w: 1760, h: 40, zIndex: 2, rotation: 0, locked: false, color: '#F6F3EF', content: { body: 'SOCELLE Academy' }, align: 'center' },
    ],
  },

  /* ── Brand Kit (3) ───────────────────────────────────────────── */
  {
    id: 'brandkit-overview',
    title: 'Brand Kit Overview',
    category: 'Brand Kit',
    presetId: 'slide-16x9',
    thumbnailColor: '#141418',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Brand Identity', level: 1 } },
      { type: 'shape-rect', x: 80, y: 220, w: 200, h: 200, zIndex: 2, rotation: 0, locked: false, content: { fill: '#141418', radius: 8 } },
      { type: 'shape-rect', x: 320, y: 220, w: 200, h: 200, zIndex: 2, rotation: 0, locked: false, content: { fill: '#6E879B', radius: 8 } },
      { type: 'shape-rect', x: 560, y: 220, w: 200, h: 200, zIndex: 2, rotation: 0, locked: false, content: { fill: '#F6F3EF', radius: 8 } },
      { type: 'shape-rect', x: 800, y: 220, w: 200, h: 200, zIndex: 2, rotation: 0, locked: false, content: { fill: '#5F8A72', radius: 8 } },
      { type: 'text', x: 80, y: 450, w: 200, h: 40, zIndex: 3, rotation: 0, locked: false, color: '#141418', content: { body: '#141418 Graphite' }, align: 'center' },
      { type: 'text', x: 320, y: 450, w: 200, h: 40, zIndex: 3, rotation: 0, locked: false, color: '#141418', content: { body: '#6E879B Accent' }, align: 'center' },
    ],
  },
  {
    id: 'brandkit-colors',
    title: 'Color Palette',
    category: 'Brand Kit',
    presetId: 'ig-post',
    thumbnailColor: '#6E879B',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1080, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#F6F3EF' } },
      { type: 'heading', x: 80, y: 80, w: 920, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Color Palette', level: 2 }, align: 'center' },
      { type: 'shape-rect', x: 80, y: 220, w: 440, h: 440, zIndex: 2, rotation: 0, locked: false, content: { fill: '#141418', radius: 16 } },
      { type: 'shape-rect', x: 560, y: 220, w: 440, h: 440, zIndex: 2, rotation: 0, locked: false, content: { fill: '#6E879B', radius: 16 } },
      { type: 'shape-rect', x: 80, y: 700, w: 210, h: 210, zIndex: 2, rotation: 0, locked: false, content: { fill: '#5F8A72', radius: 12 } },
      { type: 'shape-rect', x: 310, y: 700, w: 210, h: 210, zIndex: 2, rotation: 0, locked: false, content: { fill: '#A97A4C', radius: 12 } },
      { type: 'shape-rect', x: 560, y: 700, w: 210, h: 210, zIndex: 2, rotation: 0, locked: false, content: { fill: '#8E6464', radius: 12 } },
      { type: 'shape-rect', x: 790, y: 700, w: 210, h: 210, zIndex: 2, rotation: 0, locked: false, content: { fill: '#E8EDF1', radius: 12 } },
    ],
  },
  {
    id: 'brandkit-typography',
    title: 'Typography Sheet',
    category: 'Brand Kit',
    presetId: 'slide-16x9',
    thumbnailColor: '#F6F3EF',
    blocks: [
      { type: 'shape-rect', x: 0, y: 0, w: 1920, h: 1080, zIndex: 0, rotation: 0, locked: true, content: { fill: '#FFFFFF' } },
      { type: 'heading', x: 80, y: 60, w: 900, h: 90, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Typography', level: 1 } },
      { type: 'heading', x: 80, y: 200, w: 900, h: 100, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Display Heading — General Sans', level: 1 } },
      { type: 'heading', x: 80, y: 340, w: 900, h: 80, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { text: 'Section Heading — Semibold 32px', level: 2 } },
      { type: 'text', x: 80, y: 460, w: 900, h: 60, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Body text — General Sans Regular 18px / line-height 1.7' } },
      { type: 'text', x: 80, y: 560, w: 900, h: 50, zIndex: 2, rotation: 0, locked: false, color: '#141418', content: { body: 'Caption / Label — 13px / tracking 0.08em / uppercase' } },
    ],
  },
];

/* ── Accessors ─────────────────────────────────────────────────── */

export function getTemplatesByCategory(category: TemplateCategory): StudioTemplate[] {
  return STUDIO_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): StudioTemplate | undefined {
  return STUDIO_TEMPLATES.find((t) => t.id === id);
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Intelligence Brief',
  'Social Post',
  'Email Header',
  'Training Content',
  'Campaign',
  'Report',
  'Proposal',
  'Event',
  'Course',
  'Brand Kit',
];

export const TEMPLATE_CATEGORY_COUNTS = TEMPLATE_CATEGORIES.reduce<Record<string, number>>(
  (acc, cat) => {
    acc[cat] = STUDIO_TEMPLATES.filter((t) => t.category === cat).length;
    return acc;
  },
  {},
);
