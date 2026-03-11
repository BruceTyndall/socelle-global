// ── StudioEditor — WO-CMS-05 ────────────────────────────────────────
// Block-based document editor: 3-panel layout with block picker,
// canvas, and properties panel. Uses cms_docs + cms_blocks + cms_page_blocks.
// Data label: LIVE — reads/writes from Supabase CMS tables.

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
  Type,
  Heading,
  ImageIcon,
  VideoIcon,
  Music,
  File,
  MousePointer,
  BarChart3,
  HelpCircle,
  Quote,
  Code,
  Globe,
  Layers,
  LayoutTemplate,
  Award,
  ListChecks,
  Activity,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  MonitorSmartphone,
  RefreshCw,
  Download,
  Palette,
  FileDown,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useStudioDoc, useStudioDocs } from '../../../lib/studio/useStudioDocs';
import type { CmsBlockType } from '../../../lib/cms/types';
import type { Json } from '../../../lib/database.types';
import {
  findUnresolvedVariablesInJson,
  resolveTemplateJson,
  resolveTemplateString,
  type ResolveResult,
} from '../../../lib/studio/studioTemplateVariables';
import { useStudioSmartFill } from '../../../lib/studio/useStudioSmartFill';
import { useAuth } from '../../../lib/auth';
import { generateStudioSharePack, downloadStudioSharePack } from '../../../lib/studio/studioSharePack';
import DragCanvas, { type CanvasBlock as DragCanvasBlock } from '../../../components/studio/DragCanvas';
import { exportStudioDocument, type ExportOptions } from '../../../lib/studio/studioExportEngine';
import { getTemplatesByCategory, TEMPLATE_CATEGORIES, type StudioTemplate } from '../../../lib/studio/studioTemplates';

// ── Extended block types for studio ─────────────────────────────────

type StudioBlockType = CmsBlockType | 'heading' | 'audio' | 'file' | 'quiz' | 'kpi';

interface EditorBlock {
  id: string;
  type: StudioBlockType;
  content: Record<string, unknown>;
  position: number;
}

// ── Block type definitions ──────────────────────────────────────────

interface BlockTypeDef {
  type: StudioBlockType;
  label: string;
  icon: React.ElementType;
  category: string;
  defaultContent: Record<string, unknown>;
}

const BLOCK_TYPES: BlockTypeDef[] = [
  { type: 'text', label: 'Text', icon: Type, category: 'Content', defaultContent: { body: '' } },
  { type: 'heading', label: 'Heading', icon: Heading, category: 'Content', defaultContent: { text: '', level: 2 } },
  { type: 'image', label: 'Image', icon: ImageIcon, category: 'Media', defaultContent: { src: '', alt: '', caption: '' } },
  { type: 'video', label: 'Video', icon: VideoIcon, category: 'Media', defaultContent: { url: '', provider: 'youtube' } },
  { type: 'audio', label: 'Audio', icon: Music, category: 'Media', defaultContent: { url: '', title: '' } },
  { type: 'file', label: 'File', icon: File, category: 'Media', defaultContent: { url: '', filename: '' } },
  { type: 'cta', label: 'CTA', icon: MousePointer, category: 'Interactive', defaultContent: { text: 'Get Started', url: '', variant: 'primary' } },
  { type: 'stats', label: 'Stats', icon: BarChart3, category: 'Data', defaultContent: { items: [] } },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, category: 'Content', defaultContent: { items: [] } },
  { type: 'testimonial', label: 'Testimonial', icon: Quote, category: 'Content', defaultContent: { quote: '', author: '', role: '' } },
  { type: 'embed', label: 'Embed', icon: Globe, category: 'Media', defaultContent: { html: '' } },
  { type: 'code', label: 'Code', icon: Code, category: 'Content', defaultContent: { code: '', language: 'text' } },
  { type: 'hero', label: 'Hero', icon: LayoutTemplate, category: 'Layout', defaultContent: { title: '', subtitle: '', cta_text: '', cta_url: '' } },
  { type: 'split_feature', label: 'Split Feature', icon: Layers, category: 'Layout', defaultContent: { title: '', body: '', image: '', image_position: 'right' } },
  { type: 'evidence_strip', label: 'Evidence Strip', icon: Award, category: 'Data', defaultContent: { items: [] } },
  { type: 'quiz', label: 'Quiz', icon: ListChecks, category: 'Interactive', defaultContent: { questions: [] } },
  { type: 'kpi', label: 'KPI', icon: Activity, category: 'Data', defaultContent: { label: '', value: '', change: '', direction: 'up' } },
];

// ── Block categories ────────────────────────────────────────────────

const CATEGORIES = ['Content', 'Media', 'Interactive', 'Data', 'Layout'] as const;

interface OutputPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  safeMargin: number;
}

const OUTPUT_PRESETS: OutputPreset[] = [
  { id: 'ig-post', label: 'IG Post (1:1)', width: 1080, height: 1080, safeMargin: 64 },
  { id: 'ig-story', label: 'IG Story (9:16)', width: 1080, height: 1920, safeMargin: 96 },
  { id: 'ig-reel', label: 'IG Reel Cover (9:16)', width: 1080, height: 1920, safeMargin: 96 },
  { id: 'tiktok-cover', label: 'TikTok Cover (9:16)', width: 1080, height: 1920, safeMargin: 96 },
  { id: 'email-header', label: 'Email Header', width: 1200, height: 600, safeMargin: 48 },
  { id: 'flyer', label: 'Flyer (US Letter)', width: 1275, height: 1650, safeMargin: 72 },
  { id: 'menu-insert', label: 'Menu Insert', width: 1200, height: 1800, safeMargin: 72 },
  { id: 'staff-sop', label: 'Staff SOP Sheet', width: 1275, height: 1650, safeMargin: 72 },
  { id: 'slide-16x9', label: 'Slide 16:9', width: 1920, height: 1080, safeMargin: 80 },
];

// ── Skeleton ────────────────────────────────────────────────────────

function EditorSkeleton() {
  return (
    <div className="h-screen flex bg-[#F6F3EF] animate-pulse">
      <div className="w-64 bg-white border-r border-[#E8EDF1] p-4">
        <div className="h-6 bg-[#141418]/5 rounded w-32 mb-4" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 bg-[#141418]/5 rounded mb-2" />
        ))}
      </div>
      <div className="flex-1 p-8">
        <div className="h-10 bg-[#141418]/5 rounded-lg w-1/2 mb-6" />
        <div className="space-y-4">
          <div className="h-32 bg-[#141418]/5 rounded-lg" />
          <div className="h-24 bg-[#141418]/5 rounded-lg" />
        </div>
      </div>
      <div className="w-72 bg-white border-l border-[#E8EDF1] p-4">
        <div className="h-6 bg-[#141418]/5 rounded w-24 mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-[#141418]/5 rounded" />
          <div className="h-8 bg-[#141418]/5 rounded" />
        </div>
      </div>
    </div>
  );
}

function resolveBlockVariables(
  block: EditorBlock,
  context: ReturnType<typeof useStudioSmartFill>['context']
): ResolveResult<EditorBlock> {
  const resolved = resolveTemplateJson(block.content as Json, context);
  return {
    value: {
      ...block,
      content: (resolved.value as Record<string, unknown>) ?? {},
    },
    unresolved: resolved.unresolved,
  };
}

// ── Property Editor Panel ───────────────────────────────────────────

function PropertyPanel({
  block,
  onUpdate,
}: {
  block: EditorBlock | null;
  onUpdate: (id: string, content: Record<string, unknown>) => void;
}) {
  if (!block) {
    return (
      <div className="p-4">
        <p className="text-sm text-[#141418]/40">
          Select a block to edit its properties.
        </p>
      </div>
    );
  }

  const activeBlock = block;
  const blockDef = BLOCK_TYPES.find((bt) => bt.type === block.type);

  function handleFieldChange(field: string, value: unknown) {
    onUpdate(activeBlock.id, { ...activeBlock.content, [field]: value });
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        {blockDef && <blockDef.icon className="w-4 h-4 text-[#6E879B]" />}
        <h3 className="text-sm font-semibold text-[#141418]">
          {blockDef?.label ?? block.type} Properties
        </h3>
      </div>
      <div className="space-y-3">
        {Object.entries(block.content).map(([key, value]) => {
          if (typeof value === 'string') {
            return (
              <div key={key}>
                <label className="block text-xs font-medium text-[#141418]/60 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                {value.length > 80 || key === 'body' || key === 'code' || key === 'html' ? (
                  <textarea
                    value={value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    rows={4}
                    className="w-full text-sm border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B] resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="w-full text-sm border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B]"
                  />
                )}
              </div>
            );
          }
          if (typeof value === 'number') {
            return (
              <div key={key}>
                <label className="block text-xs font-medium text-[#141418]/60 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleFieldChange(key, parseInt(e.target.value, 10) || 0)
                  }
                  className="w-full text-sm border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B]"
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

// ── Canvas Block ────────────────────────────────────────────────────

function CanvasBlock({
  block,
  isSelected,
  isFirst,
  isLast,
  hasUnresolvedVariables,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  block: EditorBlock;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  hasUnresolvedVariables: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const blockDef = BLOCK_TYPES.find((bt) => bt.type === block.type);

  return (
    <div
      onClick={onSelect}
      className={`relative bg-white rounded-lg border p-4 cursor-pointer transition-colors group ${
        isSelected
          ? 'border-[#6E879B] ring-1 ring-[#6E879B]/20'
          : 'border-[#E8EDF1] hover:border-[#6E879B]/50'
      }`}
    >
      {/* Block type label */}
      <div className="flex items-center gap-2 mb-2">
        {blockDef && <blockDef.icon className="w-3.5 h-3.5 text-[#6E879B]" />}
        <span className="text-xs font-medium text-[#141418]/40 uppercase tracking-wide">
          {blockDef?.label ?? block.type}
        </span>
        {hasUnresolvedVariables && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#A97A4C]/15 px-2 py-0.5 text-[10px] font-semibold text-[#A97A4C]">
            <AlertTriangle className="h-3 w-3" />
            Fix vars
          </span>
        )}
      </div>

      {/* Block content preview */}
      <div className="text-sm text-[#141418]/70 min-h-[2rem]">
        {block.type === 'text' && (
          <p className="line-clamp-3">
            {(block.content.body as string) || 'Empty text block'}
          </p>
        )}
        {block.type === 'heading' && (
          <p className="font-semibold">
            {(block.content.text as string) || 'Empty heading'}
          </p>
        )}
        {block.type === 'image' && (
          <p className="italic">
            {(block.content.alt as string) || (block.content.src as string) || 'No image set'}
          </p>
        )}
        {block.type === 'cta' && (
          <p>
            Button: {(block.content.text as string) || 'Untitled'}
          </p>
        )}
        {block.type === 'hero' && (
          <p className="font-semibold">
            {(block.content.title as string) || 'Empty hero'}
          </p>
        )}
        {!['text', 'heading', 'image', 'cta', 'hero'].includes(block.type) && (
          <p className="italic text-[#141418]/40">
            {blockDef?.label ?? block.type} block
          </p>
        )}
      </div>

      {/* Actions on hover */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
          className="p-1 rounded hover:bg-[#E8EDF1] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5 text-[#141418]/60" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
          className="p-1 rounded hover:bg-[#E8EDF1] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#141418]/60" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-[#8E6464]/10"
          title="Delete block"
        >
          <Trash2 className="w-3.5 h-3.5 text-[#8E6464]" />
        </button>
      </div>
    </div>
  );
}

// ── Template Picker Modal ────────────────────────────────────────────

function TemplatePickerModal({
  onApply,
  onClose,
}: {
  onApply: (template: StudioTemplate) => void;
  onClose: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...TEMPLATE_CATEGORIES];
  const templates =
    activeCategory === 'All'
      ? TEMPLATE_CATEGORIES.flatMap((c) => getTemplatesByCategory(c))
      : getTemplatesByCategory(activeCategory as any);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141418]/40">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EDF1]">
          <div>
            <h2 className="text-lg font-semibold text-[#141418]">Template Library</h2>
            <p className="text-xs text-[#141418]/50 mt-0.5">Choose a starting point for your design</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#E8EDF1] text-[#141418]/50 hover:text-[#141418] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category filter */}
        <div className="px-6 py-3 border-b border-[#E8EDF1] flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#141418] text-white'
                  : 'bg-[#F6F3EF] text-[#141418]/60 hover:bg-[#E8EDF1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onApply(tpl)}
                className="group text-left rounded-xl border border-[#E8EDF1] overflow-hidden hover:border-[#6E879B] hover:shadow-md transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div
                  className="h-32 flex items-center justify-center relative"
                  style={{ backgroundColor: tpl.thumbnailColor }}
                >
                  <span className="text-white/70 text-xs font-medium uppercase tracking-widest">
                    {tpl.category}
                  </span>
                  <div className="absolute inset-0 bg-[#141418]/0 group-hover:bg-[#141418]/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[#141418] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Use this
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-[#141418] leading-tight">{tpl.title}</p>
                  <p className="text-[10px] text-[#141418]/40 mt-0.5 uppercase tracking-wider">
                    {tpl.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Export Modal ─────────────────────────────────────────────────────

function ExportModal({
  title,
  preset,
  canvasBlocks,
  onClose,
}: {
  title: string;
  preset: OutputPreset;
  canvasBlocks: DragCanvasBlock[];
  onClose: () => void;
}) {
  const [format, setFormat] = useState<'png' | 'jpg' | 'pdf' | 'svg' | 'scorm'>('png');
  const [exporting, setExporting] = useState(false);

  const FORMAT_OPTIONS: { id: 'png' | 'jpg' | 'pdf' | 'svg' | 'scorm'; label: string; desc: string }[] = [
    { id: 'png', label: 'PNG', desc: 'High-quality raster — social posts, email headers' },
    { id: 'jpg', label: 'JPG', desc: 'Compressed raster — smaller file size' },
    { id: 'pdf', label: 'PDF', desc: 'Print-ready document' },
    { id: 'svg', label: 'SVG', desc: 'Scalable vector — web embeds' },
    { id: 'scorm', label: 'SCORM 2004', desc: 'LMS-compatible course package (ZIP)' },
  ];

  async function handleExport() {
    setExporting(true);
    try {
      const opts: ExportOptions = {
        title,
        format,
        presetWidth: preset.width,
        presetHeight: preset.height,
        safeMargin: preset.safeMargin,
        blocks: canvasBlocks.map((b) => ({
          id: b.id,
          type: b.type,
          x: b.x,
          y: b.y,
          w: b.w,
          h: b.h,
          content: typeof b.content === 'string' ? { body: b.content } : (b.content as Record<string, unknown>),
          bg: b.bg,
          color: b.color,
        })),
      };
      await exportStudioDocument(opts);
      onClose();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141418]/40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EDF1]">
          <h2 className="text-lg font-semibold text-[#141418]">Export Design</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#E8EDF1] text-[#141418]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFormat(opt.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer text-left ${
                format === opt.id
                  ? 'border-[#6E879B] bg-[#6E879B]/5'
                  : 'border-[#E8EDF1] hover:border-[#6E879B]/40'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                format === opt.id ? 'bg-[#6E879B] text-white' : 'bg-[#F6F3EF] text-[#141418]/50'
              }`}>
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#141418]">{opt.label}</p>
                <p className="text-xs text-[#141418]/50">{opt.desc}</p>
              </div>
              {format === opt.id && (
                <Check className="w-4 h-4 text-[#6E879B] ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={handleExport}
            disabled={exporting || canvasBlocks.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-[#141418] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#141418]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" />
            {exporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
          </button>
          {canvasBlocks.length === 0 && (
            <p className="text-xs text-[#141418]/40 text-center mt-2">
              Switch to Canvas mode and add blocks to export.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Editor ─────────────────────────────────────────────────────

export default function StudioEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  const { user } = useAuth();
  const { context: smartFillContext, isLoading: smartFillLoading, isLive: smartFillLive } = useStudioSmartFill();

  const { doc, isLoading: docLoading, error: docError } = useStudioDoc(id ?? '');
  const { updateDoc, createDoc } = useStudioDocs();

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [titleInitialized, setTitleInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('slide-16x9');
  const [lastUnresolvedVariables, setLastUnresolvedVariables] = useState<string[]>([]);

  // Canvas design mode state
  const [canvasMode, setCanvasMode] = useState(false);
  const [canvasBlocks, setCanvasBlocks] = useState<DragCanvasBlock[]>([]);
  const [selectedCanvasBlockId, setSelectedCanvasBlockId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Canvas scale — fits preset dimensions into available viewport width
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  const selectedPreset = useMemo(
    () => OUTPUT_PRESETS.find((preset) => preset.id === selectedPresetId) ?? OUTPUT_PRESETS[0],
    [selectedPresetId]
  );

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const update = () => {
      const available = el.clientWidth - 48; // 2 × p-6 = 48px
      setCanvasScale(Math.min(1, available / selectedPreset.width));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedPreset.width]);

  // Initialize from loaded doc or new document
  useEffect(() => {
    if (titleInitialized) return;
    if (doc) {
      setTitle(doc.title);
      const meta = doc.metadata as Record<string, unknown> | null;
      const savedBlocks = (meta?.blocks as EditorBlock[]) ?? [];
      setBlocks(savedBlocks);
      const savedCanvasBlocks = (meta?.canvas_blocks as DragCanvasBlock[]) ?? [];
      setCanvasBlocks(savedCanvasBlocks);
      if (savedCanvasBlocks.length > 0) setCanvasMode(true);
      const savedPreset = typeof meta?.output_preset === 'string' ? meta.output_preset : null;
      if (savedPreset && OUTPUT_PRESETS.some((preset) => preset.id === savedPreset)) {
        setSelectedPresetId(savedPreset);
      }
      setTitleInitialized(true);
    } else if (isNew) {
      setTitle('Untitled Document');
      setTitleInitialized(true);
    }
  }, [doc, isNew, titleInitialized]);

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const unresolvedByBlock = useMemo(() => {
    const map: Record<string, string[]> = {};
    blocks.forEach((block) => {
      map[block.id] = findUnresolvedVariablesInJson(block.content as Json);
    });
    return map;
  }, [blocks]);

  const unresolvedVariables = useMemo(() => {
    const all = new Set<string>(lastUnresolvedVariables);
    Object.values(unresolvedByBlock).forEach((variables) => {
      variables.forEach((variableName) => all.add(variableName));
    });
    return Array.from(all);
  }, [lastUnresolvedVariables, unresolvedByBlock]);

  // ── Block operations ─────────────────────────────────────────────

  const addBlock = useCallback(
    (typeDef: BlockTypeDef) => {
      const newBlock: EditorBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: typeDef.type,
        content: { ...typeDef.defaultContent },
        position: blocks.length,
      };
      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
    },
    [blocks.length]
  );

  const moveBlock = useCallback(
    (index: number, direction: 'up' | 'down') => {
      setBlocks((prev) => {
        const next = [...prev];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= next.length) return prev;
        [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
        return next.map((b, i) => ({ ...b, position: i }));
      });
    },
    []
  );

  const deleteBlock = useCallback(
    (id: string) => {
      setBlocks((prev) =>
        prev
          .filter((b) => b.id !== id)
          .map((b, i) => ({ ...b, position: i }))
      );
      if (selectedBlockId === id) setSelectedBlockId(null);
    },
    [selectedBlockId]
  );

  const updateBlockContent = useCallback(
    (id: string, content: Record<string, unknown>) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content } : b))
      );
    },
    []
  );

  const handleSmartFill = useCallback(() => {
    const unresolved = new Set<string>();

    const resolvedTitle = resolveTemplateString(title, smartFillContext);
    resolvedTitle.unresolved.forEach((value) => unresolved.add(value));
    setTitle(resolvedTitle.value);

    setBlocks((prev) =>
      prev.map((block) => {
        const resolvedBlock = resolveBlockVariables(block, smartFillContext);
        resolvedBlock.unresolved.forEach((value) => unresolved.add(value));
        return resolvedBlock.value;
      })
    );

    setLastUnresolvedVariables(Array.from(unresolved));
  }, [title, smartFillContext]);

  const handleApplyTemplate = useCallback((template: StudioTemplate) => {
    const newBlocks: DragCanvasBlock[] = template.blocks.map((b, i) => ({
      ...b,
      id: `tblock-${Date.now()}-${i}`,
    }));
    setCanvasBlocks(newBlocks);
    setSelectedCanvasBlockId(null);
    if (template.presetId) setSelectedPresetId(template.presetId);
    setCanvasMode(true);
    setShowTemplates(false);
  }, []);

  const handleCanvasBlockChange = useCallback(
    (id: string, changes: Partial<DragCanvasBlock>) => {
      setCanvasBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...changes } : b))
      );
    },
    []
  );

  const handleCanvasBlockDelete = useCallback((id: string) => {
    setCanvasBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedCanvasBlockId((prev) => (prev === id ? null : prev));
  }, []);

  const handleCanvasBlockReorder = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setCanvasBlocks((prev) => {
        const idx = prev.findIndex((b) => b.id === id);
        if (idx < 0) return prev;
        const next = [...prev];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= next.length) return prev;
        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
        return next.map((b, i) => ({ ...b, zIndex: i + 1 }));
      });
    },
    []
  );

  const handleDownloadSharePack = useCallback(() => {
    const copyBlocks = blocks
      .flatMap((b) => {
        if (b.type === 'text') return [(b.content.body as string) || ''];
        if (b.type === 'heading') return [(b.content.text as string) || ''];
        if (b.type === 'cta') return [(b.content.text as string) || ''];
        return [];
      })
      .filter(Boolean);
    const ctaBlock = blocks.find((b) => b.type === 'cta');
    const ctaUrl = (ctaBlock?.content.url as string) || null;
    const { filename, blob } = generateStudioSharePack({
      title,
      slug: title,
      presetId: selectedPreset.id,
      copyBlocks,
      ctaUrl,
      signalSummary: smartFillContext.signal.metric,
      generatedBy: user?.email ?? null,
    });
    downloadStudioSharePack(filename, blob);
  }, [blocks, title, selectedPreset.id, smartFillContext.signal.metric, user]);

  // ── Save ──────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    try {
      const currentMeta = doc?.metadata as Record<string, unknown> | null;
      const currentVersion = (currentMeta?.version as number) ?? 0;
      const metadata: Json = {
        ...(currentMeta ?? {}),
        blocks: blocks as unknown as Json,
        canvas_blocks: canvasBlocks as unknown as Json,
        version: currentVersion + 1,
        output_preset: selectedPreset.id,
        unresolved_variables: unresolvedVariables,
      };

      if (id && doc) {
        await updateDoc.mutateAsync({ id, title, metadata });
      } else {
        const result = await createDoc.mutateAsync({
          title,
          slug: `doc-${Date.now()}`,
          space_id: '',
          status: 'draft',
          scheduled_at: null,
          seo_twitter_card: 'summary_large_image',
          category: 'document',
          body: null,
          metadata,
        });
        navigate(`/portal/studio/editor/${result.id}`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }

  // ── Loading / Error ───────────────────────────────────────────────

  if (!isNew && docLoading) return <EditorSkeleton />;

  if (!isNew && docError) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load document: {docError}</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185]"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Preview overlay ───────────────────────────────────────────────

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-[#F6F3EF] z-50 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#E8EDF1] px-6 py-3 flex items-center justify-between z-10">
          <span className="text-sm font-medium text-[#141418]">Preview</span>
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185]"
          >
            <X className="w-4 h-4" /> Close Preview
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-semibold text-[#141418] mb-8">
            {title}
          </h1>
          {blocks.length === 0 ? (
            <p className="text-[#141418]/40">No blocks to preview.</p>
          ) : (
            <div className="space-y-6">
              {blocks.map((block) => {
                const blockDef = BLOCK_TYPES.find((bt) => bt.type === block.type);
                return (
                  <div key={block.id} className="bg-white rounded-lg border border-[#E8EDF1] p-6">
                    <div className="flex items-center gap-2 mb-2 text-xs text-[#141418]/40 uppercase tracking-wide">
                      {blockDef && <blockDef.icon className="w-3 h-3" />}
                      {blockDef?.label ?? block.type}
                    </div>
                    {block.type === 'heading' && (
                      <h2 className="text-xl font-semibold text-[#141418]">
                        {(block.content.text as string) || 'Untitled heading'}
                      </h2>
                    )}
                    {block.type === 'text' && (
                      <p className="text-[#141418]/80 whitespace-pre-wrap">
                        {(block.content.body as string) || 'Empty text'}
                      </p>
                    )}
                    {block.type === 'image' && (block.content.src as string) && (
                      <img
                        src={block.content.src as string}
                        alt={block.content.alt as string}
                        className="rounded-lg max-w-full"
                      />
                    )}
                    {block.type === 'cta' && (
                      <span className="inline-block bg-[#6E879B] text-white text-sm font-medium px-4 py-2 rounded-lg">
                        {(block.content.text as string) || 'Button'}
                      </span>
                    )}
                    {!['heading', 'text', 'image', 'cta'].includes(block.type) && (
                      <p className="text-[#141418]/50 italic">
                        {blockDef?.label ?? block.type} block preview
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Editor Layout ─────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-[#F6F3EF]">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8EDF1] px-4 py-2.5 flex items-center gap-4">
        <Link
          to="/portal/studio"
          className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185]"
        >
          <ArrowLeft className="w-4 h-4" /> Studio
        </Link>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-lg font-semibold text-[#141418] bg-transparent border-none outline-none"
          placeholder="Document title"
        />
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-[#E8EDF1] bg-white px-2 py-1.5">
            <MonitorSmartphone className="h-3.5 w-3.5 text-[#6E879B]" />
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#141418] outline-none"
              aria-label="Output preset"
            >
              {OUTPUT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          {/* Mode toggle */}
          <div className="hidden md:flex items-center rounded-lg border border-[#E8EDF1] overflow-hidden">
            <button
              onClick={() => setCanvasMode(false)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                !canvasMode ? 'bg-[#141418] text-white' : 'text-[#141418]/60 hover:bg-[#F6F3EF]'
              }`}
              title="Document mode — vertical block list"
            >
              <ListIcon className="w-3.5 h-3.5" /> Doc
            </button>
            <button
              onClick={() => setCanvasMode(true)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                canvasMode ? 'bg-[#141418] text-white' : 'text-[#141418]/60 hover:bg-[#F6F3EF]'
              }`}
              title="Canvas mode — drag and resize blocks"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Canvas
            </button>
          </div>
          <button
            onClick={() => setShowTemplates(true)}
            className="hidden md:flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185] px-3 py-1.5 rounded-lg border border-[#E8EDF1] hover:border-[#6E879B] transition-colors"
            title="Browse template library"
          >
            <Palette className="w-4 h-4" /> Templates
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="hidden md:flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185] px-3 py-1.5 rounded-lg border border-[#E8EDF1] hover:border-[#6E879B] transition-colors"
            title="Export design as PNG, JPG, PDF, SVG, or SCORM"
          >
            <FileDown className="w-4 h-4" /> Export
          </button>
          <button
            onClick={handleSmartFill}
            className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185] px-3 py-1.5 rounded-lg border border-[#E8EDF1] hover:border-[#6E879B] transition-colors"
            title="Resolve template variables using business, brand, and signal context"
          >
            <Sparkles className="w-4 h-4" />
            Smart Fill
            {smartFillLive ? null : (
              <span className="text-[10px] text-[#A97A4C]">{smartFillLoading ? '...' : 'fallback'}</span>
            )}
          </button>
          {doc && (
            <span className="text-xs text-[#141418]/40">
              v{((doc.metadata as Record<string, unknown> | null)?.version as number) ?? 1}
            </span>
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185] px-3 py-1.5 rounded-lg border border-[#E8EDF1] hover:border-[#6E879B] transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={handleDownloadSharePack}
            className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185] px-3 py-1.5 rounded-lg border border-[#E8EDF1] hover:border-[#6E879B] transition-colors"
            title="Download share pack as ZIP (captions, UTM link, QR code)"
          >
            <Download className="w-4 h-4" /> Share Pack
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 text-sm text-white bg-[#6E879B] hover:bg-[#5A7185] px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── 3-panel layout ──────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left: Block Picker ─────────────────────────────────────── */}
        <div className="w-60 bg-white border-r border-[#E8EDF1] overflow-y-auto flex-shrink-0">
          <div className="p-3">
            <h2 className="text-xs font-semibold text-[#141418]/50 uppercase tracking-wide mb-3">
              Add Block
            </h2>
            {CATEGORIES.map((cat) => {
              const catBlocks = BLOCK_TYPES.filter((bt) => bt.category === cat);
              return (
                <div key={cat} className="mb-3">
                  <p className="text-[10px] font-medium text-[#141418]/30 uppercase tracking-wider mb-1 px-1">
                    {cat}
                  </p>
                  {catBlocks.map((bt) => (
                    <button
                      key={bt.type}
                      onClick={() => addBlock(bt)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-[#141418]/70 hover:bg-[#E8EDF1] hover:text-[#141418] transition-colors text-left"
                    >
                      <bt.icon className="w-3.5 h-3.5 text-[#6E879B]" />
                      {bt.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center: Canvas ─────────────────────────────────────────── */}
        <div ref={canvasContainerRef} className="flex-1 overflow-auto p-6">
          <div
            className="mx-auto"
            style={{ width: Math.ceil(selectedPreset.width * canvasScale) }}
          >
            <div className="mb-2 flex items-center justify-between text-xs text-[#141418]/55">
              <span>{selectedPreset.label}</span>
              <div className="flex items-center gap-3">
                {canvasMode && (
                  <button
                    onClick={() => setShowGrid((v) => !v)}
                    className={`flex items-center gap-1 transition-colors ${showGrid ? 'text-[#6E879B]' : 'text-[#141418]/30 hover:text-[#141418]/50'}`}
                    title="Toggle grid"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Grid
                  </button>
                )}
                <span>
                  {selectedPreset.width} × {selectedPreset.height}px · {selectedPreset.safeMargin}px safe
                  {canvasScale < 0.99 ? ` · ${Math.round(canvasScale * 100)}%` : ''}
                </span>
              </div>
            </div>

            {canvasMode ? (
              /* ── Canvas / Design mode ─────────────────────────────── */
              <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top left' }}>
                <div className="rounded-xl border border-[#E8EDF1] bg-white/60 p-4 shadow-sm">
                  {canvasBlocks.length === 0 ? (
                    <div
                      className="relative rounded-lg border border-[#E8EDF1] bg-[#F6F3EF] flex flex-col items-center justify-center text-center"
                      style={{ width: selectedPreset.width, height: Math.min(selectedPreset.height, 600) }}
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8EDF1]">
                        <Palette className="h-8 w-8 text-[#6E879B]" />
                      </div>
                      <h2 className="mb-2 text-lg font-semibold text-[#141418]">
                        Start with a template
                      </h2>
                      <p className="max-w-sm text-sm text-[#141418]/60 mb-4">
                        Choose from 52 templates or add shapes and text manually.
                      </p>
                      <button
                        onClick={() => setShowTemplates(true)}
                        className="flex items-center gap-2 bg-[#6E879B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#5A7185] transition-colors"
                      >
                        <Palette className="w-4 h-4" /> Browse Templates
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <DragCanvas
                      blocks={canvasBlocks}
                      selectedId={selectedCanvasBlockId}
                      canvasScale={canvasScale}
                      presetWidth={selectedPreset.width}
                      presetHeight={selectedPreset.height}
                      safeMargin={selectedPreset.safeMargin}
                      showGrid={showGrid}
                      onSelect={setSelectedCanvasBlockId}
                      onBlockChange={handleCanvasBlockChange}
                      onBlockDelete={handleCanvasBlockDelete}
                      onBlockReorder={handleCanvasBlockReorder}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* ── Document / List mode ─────────────────────────────── */
              <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top left' }}>
                <div className="rounded-xl border border-[#E8EDF1] bg-white/60 p-4 shadow-sm">
                  <div
                    className="relative overflow-hidden rounded-lg border border-[#E8EDF1] bg-[#F6F3EF]"
                    style={{ width: selectedPreset.width, minHeight: selectedPreset.height }}
                  >
                    <div
                      className="pointer-events-none absolute border border-dashed border-[#6E879B]/40"
                      style={{
                        top: selectedPreset.safeMargin,
                        right: selectedPreset.safeMargin,
                        bottom: selectedPreset.safeMargin,
                        left: selectedPreset.safeMargin,
                      }}
                    />
                    <div className="relative p-4">
                      {blocks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8EDF1]">
                            <Plus className="h-8 w-8 text-[#6E879B]" />
                          </div>
                          <h2 className="mb-2 text-lg font-semibold text-[#141418]">
                            Start building
                          </h2>
                          <p className="max-w-sm text-sm text-[#141418]/60">
                            Add blocks from the picker on the left to build your document.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {blocks.map((block, index) => (
                            <CanvasBlock
                              key={block.id}
                              block={block}
                              isSelected={selectedBlockId === block.id}
                              isFirst={index === 0}
                              isLast={index === blocks.length - 1}
                              hasUnresolvedVariables={(unresolvedByBlock[block.id] ?? []).length > 0}
                              onSelect={() => setSelectedBlockId(block.id)}
                              onMoveUp={() => moveBlock(index, 'up')}
                              onMoveDown={() => moveBlock(index, 'down')}
                              onDelete={() => deleteBlock(block.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Properties ───────────────────────────────────────── */}
        <div className="w-72 bg-white border-l border-[#E8EDF1] overflow-y-auto flex-shrink-0">
          <div className="p-3 border-b border-[#E8EDF1]">
            <h2 className="text-xs font-semibold text-[#141418]/50 uppercase tracking-wide">
              Properties
            </h2>
          </div>
          <PropertyPanel block={selectedBlock} onUpdate={updateBlockContent} />
          <div className="border-t border-[#E8EDF1] p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#141418]/50">
              Variable Fix Panel
            </h3>
            {unresolvedVariables.length === 0 ? (
              <p className="text-xs text-[#5F8A72]">All template variables resolved.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#141418]/60">
                  Resolve these variables by editing block fields or running Smart Fill after updating profile data.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {unresolvedVariables.map((variableName) => (
                    <span
                      key={variableName}
                      className="rounded-full bg-[#A97A4C]/15 px-2 py-1 text-[10px] font-semibold text-[#A97A4C]"
                    >
                      {'{'}
                      {variableName}
                      {'}'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 rounded-md border border-[#E8EDF1] bg-[#F6F3EF] px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-[#141418]/40">Smart Fill context</p>
              <p className="mt-1 text-xs text-[#141418]/70">
                {smartFillContext.business_name} · {smartFillContext.city}
              </p>
              <p className="text-[11px] text-[#141418]/55">Signal: {smartFillContext.signal.metric}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
