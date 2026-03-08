// ── CmsTemplatesList — WO-CMS-03 ────────────────────────────────────
// Template management. CRUD for cms_templates with block_schema editor.
// Data label: LIVE — reads/writes cms_templates via useCmsTemplates hooks.

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
  Layout,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useCmsTemplates,
  type CmsTemplate,
  type CmsTemplateInsert,
} from '../../../lib/cms';

// ── Helpers ─────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Component ───────────────────────────────────────────────────────

export default function CmsTemplatesList() {
  const { templates, isLoading, error, createTemplate, updateTemplate, deleteTemplate } = useCmsTemplates();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CmsTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ── Form state ────────────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBlockSchema, setFormBlockSchema] = useState('[]');
  const [formSeoDefaults, setFormSeoDefaults] = useState('{}');

  const filtered = useMemo(() => {
    if (!search) return templates;
    const q = search.toLowerCase();
    return templates.filter((t) =>
      t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [templates, search]);

  function resetForm() {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormBlockSchema('[]');
    setFormSeoDefaults('{}');
    setEditingTemplate(null);
    setShowForm(false);
    setMutationError(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(template: CmsTemplate) {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormSlug(template.slug);
    setFormDescription(template.description ?? '');
    setFormBlockSchema(typeof template.block_schema === 'string' ? template.block_schema : JSON.stringify(template.block_schema, null, 2));
    setFormSeoDefaults(template.seo_defaults ? (typeof template.seo_defaults === 'string' ? template.seo_defaults : JSON.stringify(template.seo_defaults, null, 2)) : '{}');
    setShowForm(true);
    setMutationError(null);
  }

  async function handleSubmit() {
    setMutationError(null);
    let parsedSchema: unknown;
    let parsedSeo: unknown;
    try {
      parsedSchema = JSON.parse(formBlockSchema);
    } catch {
      setMutationError('Block schema must be valid JSON.');
      return;
    }
    try {
      parsedSeo = JSON.parse(formSeoDefaults);
    } catch {
      setMutationError('SEO defaults must be valid JSON.');
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          name: formName,
          slug: formSlug,
          description: formDescription || null,
          block_schema: parsedSchema as Record<string, unknown>,
          seo_defaults: parsedSeo as Record<string, unknown>,
        });
      } else {
        const input: CmsTemplateInsert = {
          name: formName,
          slug: formSlug || slugify(formName),
          description: formDescription || null,
          block_schema: parsedSchema as Record<string, unknown>,
          seo_defaults: parsedSeo as Record<string, unknown>,
          preview_image: null,
        };
        await createTemplate.mutateAsync(input);
      }
      resetForm();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Operation failed');
    }
  }

  async function handleDelete(id: string) {
    setMutationError(null);
    try {
      await deleteTemplate.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  // ── Loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Templates</h1>
        <div className="flex items-center gap-2 text-[#6E879B]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading templates...</span>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">CMS Templates</h1>
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load templates: {error}</span>
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
          <h1 className="text-2xl font-semibold text-[#141418]">CMS Templates</h1>
          <span className="text-sm text-[#6E879B]">({templates.length})</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Template
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
              {editingTemplate ? 'Edit Template' : 'New Template'}
            </h2>
            <button onClick={resetForm} className="text-[#6E879B] hover:text-[#5A7185]"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingTemplate) setFormSlug(slugify(e.target.value));
                }}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">Slug</label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                rows={2}
                placeholder="Template description"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">Block Schema (JSON array)</label>
              <textarea
                value={formBlockSchema}
                onChange={(e) => setFormBlockSchema(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B] font-mono"
                rows={8}
                placeholder='[{ "type": "hero", "required": true }, ...]'
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#141418] mb-1">SEO Defaults (JSON)</label>
              <textarea
                value={formSeoDefaults}
                onChange={(e) => setFormSeoDefaults(e.target.value)}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B] font-mono"
                rows={4}
                placeholder='{ "seo_schema_type": "WebPage" }'
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-[#6E879B] hover:text-[#5A7185]">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!formName || createTemplate.isPending || updateTemplate.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {editingTemplate ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E879B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#E8EDF1] rounded-lg pl-9 pr-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
            placeholder="Search templates..."
          />
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E8EDF1] p-12 text-center">
          <Layout className="w-12 h-12 text-[#6E879B]/40 mx-auto mb-3" />
          <p className="text-[#141418] font-medium mb-1">No templates found</p>
          <p className="text-sm text-[#6E879B] mb-4">
            {search ? 'Try adjusting your search.' : 'Create your first page template.'}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6E879B] text-white rounded-lg hover:bg-[#5A7185] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Create Template
            </button>
          )}
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => {
            const schemaArr = Array.isArray(template.block_schema) ? template.block_schema : [];
            return (
              <div key={template.id} className="bg-white rounded-lg border border-[#E8EDF1] p-4 hover:border-[#6E879B] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-[#141418]">{template.name}</h3>
                    <span className="text-xs text-[#6E879B]">/{template.slug}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(template)} className="p-1 text-[#6E879B] hover:text-[#5A7185] hover:bg-[#E8EDF1] rounded" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirm === template.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(template.id)} className="px-2 py-0.5 bg-[#8E6464] text-white rounded text-xs">Del</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-[#6E879B] text-xs px-1">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(template.id)} className="p-1 text-[#8E6464] hover:bg-[#8E6464]/10 rounded" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {template.description && (
                  <p className="text-xs text-[#6E879B] mb-2">{template.description}</p>
                )}
                <div className="bg-[#F6F3EF] rounded p-2 mb-2">
                  <p className="text-[10px] text-[#141418]/60 font-medium mb-1">Block Schema ({schemaArr.length} blocks)</p>
                  <pre className="text-[10px] text-[#141418]/70 font-mono max-h-16 overflow-auto whitespace-pre-wrap break-all">
                    {typeof template.block_schema === 'string' ? template.block_schema : JSON.stringify(template.block_schema, null, 2)}
                  </pre>
                </div>
                <span className="text-[10px] text-[#6E879B]">Updated {formatDate(template.updated_at)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
