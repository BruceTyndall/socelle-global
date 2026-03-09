/**
 * SOCELLE Master Page Index — /dev-index
 * ───────────────────────────────────────
 * Admin-only page listing every route with status + owner notes.
 * Notes persist to localStorage and can be exported to markdown
 * for agents to read.
 *
 * Data source: src/data/pageIndex.ts
 * Agents: read pageIndex.ts directly, or export markdown from this page.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronDown, ChevronRight, Search, Download, RotateCcw, Copy, Check } from 'lucide-react';
import { PAGE_INDEX, PageEntry, PageGroup } from '../../data/pageIndex';

const STORAGE_KEY = 'socelle_page_notes_v1';

type NotesMap = Record<string, string>;

type StatusFilter = 'all' | 'live' | 'demo' | 'shell' | 'admin' | 'auth';

const STATUS_STYLES: Record<string, string> = {
  live:  'bg-[#5F8A72]/15 text-[#5F8A72] border border-[#5F8A72]/30',
  demo:  'bg-[#A97A4C]/15 text-[#A97A4C] border border-[#A97A4C]/30',
  shell: 'bg-[#8E6464]/15 text-[#8E6464] border border-[#8E6464]/30',
  admin: 'bg-[#6E879B]/15 text-[#6E879B] border border-[#6E879B]/30',
  auth:  'bg-[#141418]/10 text-[#141418]/60 border border-[#141418]/20',
};

const ACCESS_STYLES: Record<string, string> = {
  'public':        'text-[#141418]/40',
  'auth-required': 'text-[#A97A4C]/70',
  'admin-only':    'text-[#8E6464]/80',
};

function loadNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotes(notes: NotesMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function generateMarkdown(groups: PageGroup[], notes: NotesMap): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const lines: string[] = [
    '# SOCELLE Master Page Index',
    `*Exported ${date} — agent-readable reference for all routes.*`,
    '',
    '> **Status key:** `live` = real DB data | `demo` = mock/hardcoded | `shell` = placeholder | `admin` = admin tool | `auth` = auth flow',
    '',
  ];

  for (const group of groups) {
    lines.push(`## ${group.group}`);
    lines.push(`*${group.description}*`);
    lines.push('');
    lines.push('| Route | Label | Status | Access | Notes |');
    lines.push('|-------|-------|--------|--------|-------|');
    for (const page of group.pages) {
      const note = (notes[page.path] ?? page.notes).replace(/\n/g, ' ').replace(/\|/g, '\\|');
      lines.push(`| \`${page.path}\` | ${page.label} | ${page.status} | ${page.access} | ${note || '—'} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── PageRow ──────────────────────────────────────────────────────────────────

interface PageRowProps {
  page: PageEntry;
  note: string;
  onNoteChange: (path: string, value: string) => void;
}

function PageRow({ page, note, onNoteChange }: PageRowProps) {
  const [localNote, setLocalNote] = useState(note);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  function handleChange(val: string) {
    setLocalNote(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onNoteChange(page.path, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 600);
  }

  const isParamRoute = page.path.includes(':');

  return (
    <div className="group border-b border-[#141418]/6 last:border-0 py-3 px-4 hover:bg-[#141418]/[0.015] transition-colors">
      <div className="flex items-start gap-3">
        {/* Path + label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isParamRoute ? (
              <span className="font-mono text-[13px] text-[#141418]/50">{page.path}</span>
            ) : (
              <a
                href={page.path}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[13px] text-[#6E879B] hover:text-[#5A7185] hover:underline underline-offset-2 flex items-center gap-1 transition-colors"
              >
                {page.path}
                <ExternalLink size={10} className="opacity-50" />
              </a>
            )}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_STYLES[page.status]}`}>
              {page.status}
            </span>
            <span className={`text-[10px] ${ACCESS_STYLES[page.access]}`}>
              {page.access}
            </span>
          </div>
          <div className="text-[12px] text-[#141418]/50 mt-0.5">{page.label}</div>
        </div>

        {/* Saved indicator */}
        {saved && (
          <span className="text-[10px] text-[#5F8A72] flex items-center gap-1 mt-1 shrink-0">
            <Check size={10} /> saved
          </span>
        )}
      </div>

      {/* Notes textarea */}
      <textarea
        value={localNote}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes for this page — agents and future sessions will read this…"
        rows={localNote ? Math.min(4, localNote.split('\n').length + 1) : 1}
        className="mt-2 w-full text-[12px] text-[#141418]/80 placeholder:text-[#141418]/25 bg-transparent border border-[#141418]/8 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-[#6E879B]/40 focus:bg-[#6E879B]/[0.02] transition-all font-sans leading-relaxed"
      />
    </div>
  );
}

// ── GroupSection ─────────────────────────────────────────────────────────────

interface GroupSectionProps {
  group: PageGroup;
  notes: NotesMap;
  onNoteChange: (path: string, value: string) => void;
  searchQuery: string;
  statusFilter: StatusFilter;
  defaultOpen: boolean;
}

function GroupSection({ group, notes, onNoteChange, searchQuery, statusFilter, defaultOpen }: GroupSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const filtered = group.pages.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = !searchQuery ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notes[p.path] ?? p.notes).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) return null;

  const liveCount = filtered.filter((p) => p.status === 'live').length;
  const demoCount = filtered.filter((p) => p.status === 'demo').length;
  const shellCount = filtered.filter((p) => p.status === 'shell').length;

  return (
    <div className="border border-[#141418]/8 rounded-xl overflow-hidden mb-4">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#141418]/[0.025] hover:bg-[#141418]/[0.04] transition-colors text-left"
      >
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${group.color}`} />
        <span className="font-semibold text-[13px] text-[#141418] flex-1">{group.group}</span>
        <span className="text-[11px] text-[#141418]/40 mr-2">{filtered.length} routes</span>
        <div className="flex items-center gap-1.5 mr-3">
          {liveCount > 0 && <span className="text-[10px] text-[#5F8A72]">{liveCount} live</span>}
          {demoCount > 0 && <span className="text-[10px] text-[#A97A4C]">{demoCount} demo</span>}
          {shellCount > 0 && <span className="text-[10px] text-[#8E6464]">{shellCount} shell</span>}
        </div>
        {open ? <ChevronDown size={14} className="text-[#141418]/40" /> : <ChevronRight size={14} className="text-[#141418]/40" />}
      </button>

      {/* Pages */}
      {open && (
        <div>
          <div className="px-4 py-1.5 text-[11px] text-[#141418]/35 border-b border-[#141418]/6">
            {group.description}
          </div>
          {filtered.map((page) => (
            <PageRow
              key={page.path}
              page={page}
              note={notes[page.path] ?? page.notes}
              onNoteChange={onNoteChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── MasterIndex (main page) ───────────────────────────────────────────────────

export default function MasterIndex() {
  const [notes, setNotes] = useState<NotesMap>(() => loadNotes());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [copied, setCopied] = useState(false);
  const [showExportHint, setShowExportHint] = useState(false);

  const handleNoteChange = useCallback((path: string, value: string) => {
    setNotes((prev) => {
      const next = { ...prev, [path]: value };
      saveNotes(next);
      return next;
    });
  }, []);

  function handleExportMarkdown() {
    const md = generateMarkdown(PAGE_INDEX, notes);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setShowExportHint(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleResetNotes() {
    if (!confirm('Clear all notes from localStorage? (pageIndex.ts notes remain.)')) return;
    localStorage.removeItem(STORAGE_KEY);
    setNotes({});
  }

  const totalRoutes = PAGE_INDEX.reduce((a, g) => a + g.pages.length, 0);
  const liveTotal = PAGE_INDEX.flatMap((g) => g.pages).filter((p) => p.status === 'live').length;
  const demoTotal = PAGE_INDEX.flatMap((g) => g.pages).filter((p) => p.status === 'demo').length;
  const shellTotal = PAGE_INDEX.flatMap((g) => g.pages).filter((p) => p.status === 'shell').length;
  const notedTotal = Object.values(notes).filter((v) => v.trim()).length +
    PAGE_INDEX.flatMap((g) => g.pages).filter((p) => p.notes && !notes[p.path]).length;

  const hasActiveSearch = search || statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-[#F6F3EF] font-sans">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#141418] text-white px-6 py-3 flex items-center gap-4 shadow-lg">
        <Link to="/admin/dashboard" className="text-white/50 hover:text-white text-[12px] transition-colors">
          ← Admin
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-[13px] font-semibold tracking-tight">Master Page Index</span>
        <span className="text-[11px] text-white/30 ml-1">{totalRoutes} routes</span>

        <div className="flex-1" />

        {/* Stats */}
        <div className="hidden md:flex items-center gap-3 text-[11px]">
          <span className="text-[#5F8A72]">{liveTotal} live</span>
          <span className="text-[#A97A4C]">{demoTotal} demo</span>
          <span className="text-[#8E6464]">{shellTotal} shell</span>
          {notedTotal > 0 && <span className="text-white/40">{notedTotal} with notes</span>}
        </div>

        <div className="w-px h-4 bg-white/10 ml-1" />

        {/* Export */}
        <button
          onClick={handleExportMarkdown}
          className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Export MD'}
        </button>

        <button
          onClick={handleResetNotes}
          className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/80 transition-colors px-2 py-1 rounded hover:bg-white/10"
          title="Clear all localStorage notes"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold text-[#141418] tracking-tight">SOCELLE Platform — All Pages</h1>
          <p className="text-[13px] text-[#141418]/50 mt-1">
            Every route, its status, and your notes. Notes auto-save to localStorage.
            Use <strong>Export MD</strong> to copy a markdown snapshot agents can read.
          </p>
          {showExportHint && (
            <div className="mt-3 text-[12px] bg-[#5F8A72]/10 text-[#5F8A72] border border-[#5F8A72]/20 rounded-lg px-4 py-2.5">
              Markdown copied to clipboard. Paste into <code className="font-mono">docs/MASTER_PAGE_INDEX.md</code> so agents can reference it directly.
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141418]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search routes, labels, or notes…"
              className="w-full pl-8 pr-4 py-2 text-[13px] bg-white border border-[#141418]/10 rounded-lg focus:outline-none focus:border-[#6E879B]/50 text-[#141418] placeholder:text-[#141418]/30"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-[12px] text-[#141418] bg-white border border-[#141418]/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6E879B]/50 cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="live">Live only</option>
            <option value="demo">Demo only</option>
            <option value="shell">Shells only</option>
            <option value="admin">Admin only</option>
            <option value="auth">Auth only</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-5 text-[11px] text-[#141418]/40 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#5F8A72] inline-block" /> live = real DB data</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A97A4C] inline-block" /> demo = mock/hardcoded</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8E6464] inline-block" /> shell = placeholder</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6E879B] inline-block" /> admin = admin tool</span>
          <span className="ml-auto text-[#141418]/30">Notes auto-save as you type</span>
        </div>

        {/* Groups */}
        {PAGE_INDEX.map((group) => (
          <GroupSection
            key={group.id}
            group={group}
            notes={notes}
            onNoteChange={handleNoteChange}
            searchQuery={search}
            statusFilter={statusFilter}
            defaultOpen={!hasActiveSearch && ['public', 'admin'].includes(group.id) ? false : false}
          />
        ))}

        {/* Footer */}
        <div className="mt-8 text-center text-[11px] text-[#141418]/25">
          Data source: <code className="font-mono">src/data/pageIndex.ts</code> · Notes: localStorage <code className="font-mono">{STORAGE_KEY}</code>
        </div>
      </div>
    </div>
  );
}
