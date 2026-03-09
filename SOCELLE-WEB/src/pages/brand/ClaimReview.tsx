import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { CheckCircle, FileText, Loader2 } from 'lucide-react';

interface SeedRow {
  id: string;
  content_type: string;
  content_data: unknown;
  source_url: string | null;
  status: string;
}

export default function ClaimReview() {
  const navigate = useNavigate();
  const { profile, brandId } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const { data: seedContent = [], isLoading: loading } = useQuery({
    queryKey: ['brand-seed-content', brandId],
    queryFn: async () => {
      const { data } = await supabase
        .from('brand_seed_content')
        .select('id, content_type, content_data, source_url, status')
        .eq('brand_id', brandId!)
        .order('created_at', { ascending: false });
      return (data as SeedRow[]) || [];
    },
    enabled: !!brandId,
  });

  const handleSubmitForVerification = async () => {
    if (!brandId) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('brands')
        .update({
          verification_status: 'pending_verification',
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandId);
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate('/brand/dashboard', { replace: true }), 2000);
    } catch {
      setSubmitting(false);
    }
  };

  if (!profile || profile.role !== 'brand_admin' || !brandId) {
    return (
      <div className="p-6">
        <p className="text-graphite/60 font-sans">You need to claim a brand first.</p>
        <Link to="/brands" className="text-accent hover:underline mt-2 inline-block">Browse brands</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-sans text-graphite mb-1">
        Review seed content<span className="text-accent">.</span>
      </h1>
      <p className="text-graphite/60 font-sans text-sm mb-8">
        We created this page from public information. Review the content below, then submit for verification.
      </p>

      {done ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-sans text-graphite mb-2">Submitted for verification</h2>
          <p className="text-graphite/60 font-sans text-sm">Our team will review and approve. Redirecting to dashboard…</p>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="flex items-center gap-2 text-graphite/60 font-sans">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : seedContent.length === 0 ? (
            <div className="bg-accent-soft border border-accent-soft rounded-xl p-6 text-graphite/60 font-sans text-sm">
              No seed content for this brand. You can still submit for verification.
            </div>
          ) : (
            <ul className="space-y-4 mb-8">
              {seedContent.map((row) => (
                <li
                  key={row.id}
                  className="flex gap-3 p-4 bg-white border border-accent-soft rounded-xl"
                >
                  <FileText className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-graphite font-sans capitalize">
                      {row.content_type.replace(/_/g, ' ')}
                    </p>
                    {row.source_url && (
                      <a
                        href={row.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline truncate block"
                      >
                        {row.source_url}
                      </a>
                    )}
                    <pre className="mt-2 text-xs text-graphite/60 overflow-auto max-h-24 font-sans">
                      {typeof row.content_data === 'object'
                        ? JSON.stringify(row.content_data, null, 2)
                        : String(row.content_data)}
                    </pre>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmitForVerification}
              disabled={submitting}
              className="btn-gold px-6 py-2 rounded-lg font-sans font-medium flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit for verification
            </button>
            <Link
              to="/brand/dashboard"
              className="px-6 py-2 border border-accent-soft rounded-lg font-sans font-medium text-graphite hover:bg-accent-soft"
            >
              Later
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
