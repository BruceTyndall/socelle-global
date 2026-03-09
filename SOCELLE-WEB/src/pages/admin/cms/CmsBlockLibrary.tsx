// ── CmsBlockLibrary — WO-CMS-03 ─────────────────────────────────────
// Reusable block library. CRUD for cms_blocks (is_reusable=true).
// Data label: LIVE — reads/writes cms_blocks via useCmsBlocks hooks.

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  ArrowLeft,
  Layers,
  AlertCircle,
  RefreshCw,
  Code2,
} from 'lucide-react';
import type { Json } from '../../../lib/database.types';
import {
  useCmsBlocks,
  type CmsBlock,
  type CmsBlockInsert,
  type CmsBlockType,
} from '../../../lib/cms';

// ── Constants ───────────────────────────────────────────────────────

const BLOCK_TYPES: CmsBlockType[] = [
  'hero', 'text', 'cta', 'image', 'video', 'faq',
  'testimonial', 'stats', 'split_feature', 'evidence_strip', 'embed', 'code',
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Component ───────────────────────────────────────────────────────

export default function CmsBlockLibrary() {
  const { blocks, isLoading, error, createBlock, updateBlock, deleteBlock } = useCmsBlocks({ reusableOnly: true });

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<CmsBlock | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<CmsBlockType>('text');
  const [formContent, setFormContent] = useState('{}');
  const [formReusable, setFormReusable] = useState(true);

  const filtered = useMemo(() => {
    return blocks.filter((b) => {
      if (typeFilter && b.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(b.name ?? '').toLowerCase().includes(q) && !b.type.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [blocks, typeFilter, search]);

  function resetForm() {
    setFormName('');
    setFormType('text');
    setFormContent('{}');
    setFormReusable(true);
    setEditingBlock(null);
    setShowForm(false);
    setMutationError(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(block: CmsBlock) {
    setEditingBlock(block);
    setFormName(block.name ?? '');
    setFormType(block.type as CmsBlockType);
    setFormContent(typeof block.content === 'string' ? block.content : JSON.stringify(block.content, null, 2));
    setFormReusable(block.is_reusable ?? true);
    setShowForm(true);
    setMutationError(null);
  }

  async function handleSubmit() {
    setMutationError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(formContent);
    } catch {
      setMutationError('Content must be valid JSON.');
      return;
    }

    try {
      if (editingBlock) {
        await updateBlock.mutateAsync({
          id: editingBlock.id,
          name: formName || null,
          type: formType,
          content: parsed as Json,
          is_reusable: formReusable,
        });
      } else {
        const input: CmsBlockInsert = {
          name: formName || null,
          type: formType,
          content: parsed as Json,
          is_reusable: formReusable,
          created_by: null,
        };
        await createBlock.mutateAsync(input);
      }
      resetForm();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Operation failed');
    }
  }

  async function handleDelete(id: string) {
    setMutationError(null);
    try {
      await deleteBlock.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">Block Library</h1>
        <div className="flex items-center gap-2 text-[#6E879B]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading blocks...</span>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">Block Library</h1>
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load blocks: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/cms" className="text-[#6E879B] hover:text-[#5A7185]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-[#141418]">Block Library</h1>
          <span className="text-sm text-[#6E879B]">({blocks.length} reusable)</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Block
        </button>
      </div>

      {/* ── Mutation error ──────────────────────────────────────── */}
      {mutationError && (
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-3 mb-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{mutationError}</span>
          <button onClick={() => setMutationError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Create/Edit form ────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#141418]">
              {editingBlock ? 'Edit Block' : 'New Block'}
            </h2>
            <button onClick={resetForm} className="text-[#6E879B] hover:text-[#5A7185]"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Block name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Type *</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as CmsBlockType)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              >
                {BLOCK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-sm text-[#141418] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formReusable}
                  onChange={(e) => setFormReusable(e.target.checked)}
                  className="rounded border-[#E8EDF1] text-[#6E879B] focus:ring-[#6E879B]"
                />
                Reusable block
              </label>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-[#141418] mb-1">Content (JSON)</label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B] font-mono"
                rows={8}
                placeholder='{ "heading": "...", "body": "..." }'
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-[#6E879B] hover:text-[#5A7185]">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={createBlock.isPending || updateBlock.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {editingBlock ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E879B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E8EDF1] rounded-lg pl-9 pr-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
            placeholder="Search blocks..."
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
        >
          <option value="">All types</option>
          {BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-12 text-center">
          <Layers className="w-12 h-12 text-[#6E879B]/40 mx-auto mb-3" />
          <p className="text-[#141418] font-medium mb-1">No blocks found</p>
          <p className="text-sm text-[#6E879B] mb-4">
            {search || typeFilter ? 'Try adjusting your filters.' : 'Create your first reusable block.'}
          </p>
          {!search && !typeFilter && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Create Block
            </button>
          )}
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((block) => (
            <div key={block.id} className="bg-white rounded-lg border border-[#E8EDF1] p-4 hover:border-[#6E879B] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-[#141418]">{block.name || 'Unnamed block'}</h3>
                  <span className="text-xs text-[#6E879B] bg-[#E8EDF1] px-2 py-0.5 rounded-full mt-1 inline-block">
                    {block.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(block)} className="p-1 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {deleteConfirm === block.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(block.id)} className="px-2 py-0.5 bg-[#8E6464] text-white rounded text-xs">Del</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-[#6E879B] text-xs px-1">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(block.id)} className="p-1 text-[#8E6464] hover:bg-[#8E6464]/10 rounded" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2 bg-[#F6F3EF] rounded p-2 max-h-24 overflow-auto">
                <pre className="text-[10px] text-[#141418]/70 font-mono whitespace-pre-wrap break-all">
                  {typeof block.content === 'string' ? block.content : JSON.stringify(block.content, null, 2)}
                </pre>
              </div>
              <div className="flex items-center justify-between mt-2">
                <Code2 className="w-3 h-3 text-[#6E879B]" />
                <span className="text-[10px] text-[#6E879B]">{formatDate(block.updated_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
