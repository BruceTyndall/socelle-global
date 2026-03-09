// ── StudioHome — WO-CMS-05 ──────────────────────────────────────────
// Authoring Studio home: document grid, template picker, tabs.
// Data label: LIVE — reads from cms_docs filtered by current user.

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  GraduationCap,
  LayoutGrid,
  Users,
  AlertCircle,
  RefreshCw,
  Zap,
  ClipboardList,
  BookOpen,
  Megaphone,
  Heart,
  Shield,
  Gift,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { useStudioDocs } from '../../../lib/studio/useStudioDocs';
import type { CmsDoc, CmsStatus } from '../../../lib/cms/types';
import type { Json } from '../../../lib/database.types';

// ── Template definitions ────────────────────────────────────────────

interface StudioTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

const TEMPLATES: StudioTemplate[] = [
  { id: 'intelligence-brief', name: 'Intelligence Brief', description: 'Market signal summary with key insights and recommendations.', icon: Zap, category: 'intelligence' },
  { id: 'activation-plan', name: 'Activation Plan', description: 'Step-by-step plan to act on an intelligence signal.', icon: ClipboardList, category: 'intelligence' },
  { id: 'training-kit', name: 'Training Kit', description: 'Staff training document with objectives, content, and assessments.', icon: BookOpen, category: 'education' },
  { id: 'campaign-brief', name: 'Campaign Brief', description: 'Marketing campaign goals, audience, messaging, and timeline.', icon: Megaphone, category: 'marketing' },
  { id: 'client-aftercare', name: 'Client Aftercare', description: 'Post-treatment care instructions for clients.', icon: Heart, category: 'clinical' },
  { id: 'staff-sop', name: 'Staff SOP', description: 'Standard operating procedure for staff workflows.', icon: Shield, category: 'operations' },
  { id: 'membership-offer', name: 'Membership Offer', description: 'Membership or loyalty program offer structure.', icon: Gift, category: 'revenue' },
  { id: 'local-promo', name: 'Local Promo', description: 'Localized promotional campaign for your market.', icon: MapPin, category: 'marketing' },
  { id: 'territory-brief', name: 'Territory Brief', description: 'Market territory overview with competitive landscape.', icon: Briefcase, category: 'intelligence' },
];

// ── Helpers ──────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusColor(status: CmsStatus): string {
  switch (status) {
    case 'published':
      return 'bg-[#5F8A72]/10 text-[#5F8A72]';
    case 'draft':
      return 'bg-[#A97A4C]/10 text-[#A97A4C]';
    case 'archived':
      return 'bg-[#141418]/10 text-[#141418]/60';
    default:
      return 'bg-[#141418]/10 text-[#141418]/60';
  }
}

// ── Tab type ─────────────────────────────────────────────────────────

type StudioTab = 'documents' | 'templates' | 'shared';

// ── Skeleton ─────────────────────────────────────────────────────────

function StudioSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 bg-[#141418]/5 rounded-lg w-64 mb-6" />
      <div className="flex gap-4 mb-6">
        <div className="h-10 bg-[#141418]/5 rounded-lg w-32" />
        <div className="h-10 bg-[#141418]/5 rounded-lg w-32" />
        <div className="h-10 bg-[#141418]/5 rounded-lg w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 bg-[#141418]/5 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Document Card ────────────────────────────────────────────────────

function DocCard({ doc }: { doc: CmsDoc }) {
  const metadata = doc.metadata as Record<string, unknown> | null;
  const viewCount = (metadata?.view_count as number) ?? 0;
  const docType = doc.category === 'course' ? 'course' : 'document';
  const editorPath =
    docType === 'course'
      ? `/portal/studio/course/${doc.id}`
      : `/portal/studio/editor/${doc.id}`;

  return (
    <Link
      to={editorPath}
      className="bg-white rounded-lg border border-[#E8EDF1] p-5 hover:border-[#6E879B] transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {docType === 'course' ? (
            <GraduationCap className="w-4 h-4 text-[#6E879B]" />
          ) : (
            <FileText className="w-4 h-4 text-[#6E879B]" />
          )}
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor(doc.status)}`}>
            {doc.status}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-[#141418] mb-1 group-hover:text-[#6E879B] transition-colors line-clamp-2">
        {doc.title}
      </h3>
      <div className="flex items-center gap-3 text-xs text-[#141418]/50 mt-3">
        <span>{formatDate(doc.updated_at)}</span>
        {viewCount > 0 && <span>{viewCount} views</span>}
      </div>
    </Link>
  );
}

// ── Component ────────────────────────────────────────────────────────

export default function StudioHome() {
  const [activeTab, setActiveTab] = useState<StudioTab>('documents');
  const { docs, isLoading, error, createDoc } = useStudioDocs();
  const navigate = useNavigate();

  const myDocs = useMemo(
    () => docs.filter((d) => d.category !== 'course'),
    [docs]
  );
  const myCourses = useMemo(
    () => docs.filter((d) => d.category === 'course'),
    [docs]
  );

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading) return <StudioSkeleton />;

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#141418] mb-6">
          Authoring Studio
        </h1>
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load documents: {error}</span>
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

  // ── Create handlers ──────────────────────────────────────────────

  async function handleNewDocument(templateId?: string) {
    const metadata: Record<string, unknown> = { version: 1, view_count: 0 };
    if (templateId) metadata.template_id = templateId;

    const template = templateId
      ? TEMPLATES.find((t) => t.id === templateId)
      : null;

    const result = await createDoc.mutateAsync({
      title: template ? template.name : 'Untitled Document',
      slug: `doc-${Date.now()}`,
      space_id: '',
      status: 'draft',
      category: 'document',
      body: null,
      metadata: metadata as Json,
    });
    navigate(`/portal/studio/editor/${result.id}`);
  }

  async function handleNewCourse() {
    const result = await createDoc.mutateAsync({
      title: 'Untitled Course',
      slug: `course-${Date.now()}`,
      space_id: '',
      status: 'draft',
      category: 'course',
      body: null,
      metadata: { version: 1, view_count: 0, doc_type: 'course', space: 'education' },
    });
    navigate(`/portal/studio/course/${result.id}`);
  }

  // ── Tabs ─────────────────────────────────────────────────────────

  const tabs: { key: StudioTab; label: string; icon: React.ElementType }[] = [
    { key: 'documents', label: 'My Documents', icon: FileText },
    { key: 'templates', label: 'Templates', icon: LayoutGrid },
    { key: 'shared', label: 'Shared', icon: Users },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#141418]">
          Authoring Studio
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleNewDocument()}
            disabled={createDoc.isPending}
            className="flex items-center gap-1.5 bg-[#6E879B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#5A7185] transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> New Document
          </button>
          <button
            onClick={handleNewCourse}
            disabled={createDoc.isPending}
            className="flex items-center gap-1.5 bg-white text-[#141418] text-sm font-medium px-4 py-2 rounded-lg border border-[#E8EDF1] hover:border-[#6E879B] transition-colors disabled:opacity-50"
          >
            <GraduationCap className="w-4 h-4" /> New Course
          </button>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-[#E8EDF1]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#6E879B] text-[#141418]'
                : 'border-transparent text-[#141418]/50 hover:text-[#141418]/70'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: My Documents ─────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <>
          {myDocs.length === 0 && myCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E8EDF1] flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-[#6E879B]" />
              </div>
              <h2 className="text-lg font-semibold text-[#141418] mb-2">
                No documents yet
              </h2>
              <p className="text-sm text-[#141418]/60 max-w-sm mb-6">
                Create your first document or course to start building
                intelligence briefs, training kits, and more.
              </p>
              <button
                onClick={() => handleNewDocument()}
                disabled={createDoc.isPending}
                className="flex items-center gap-1.5 bg-[#6E879B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#5A7185] transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Create Document
              </button>
            </div>
          ) : (
            <>
              {/* Documents */}
              {myDocs.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-semibold text-[#141418]/60 uppercase tracking-wide mb-3">
                    Documents ({myDocs.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myDocs.map((doc) => (
                      <DocCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                </div>
              )}
              {/* Courses */}
              {myCourses.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-[#141418]/60 uppercase tracking-wide mb-3">
                    Courses ({myCourses.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myCourses.map((doc) => (
                      <DocCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Tab: Templates ────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleNewDocument(tmpl.id)}
              disabled={createDoc.isPending}
              className="bg-white rounded-lg border border-[#E8EDF1] p-5 hover:border-[#6E879B] transition-colors text-left group disabled:opacity-50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#E8EDF1] flex items-center justify-center group-hover:bg-[#6E879B]/10 transition-colors">
                  <tmpl.icon className="w-4 h-4 text-[#6E879B]" />
                </div>
                <span className="text-xs font-medium text-[#141418]/40 uppercase tracking-wide">
                  {tmpl.category}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#141418] mb-1">
                {tmpl.name}
              </h3>
              <p className="text-xs text-[#141418]/60 line-clamp-2">
                {tmpl.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* ── Tab: Shared ───────────────────────────────────────────── */}
      {activeTab === 'shared' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8EDF1] flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-[#6E879B]" />
          </div>
          <h2 className="text-lg font-semibold text-[#141418] mb-2">
            Shared documents
          </h2>
          <p className="text-sm text-[#141418]/60 max-w-sm">
            Documents shared with your team will appear here. Share a document
            from the editor to collaborate.
          </p>
        </div>
      )}
    </div>
  );
}
