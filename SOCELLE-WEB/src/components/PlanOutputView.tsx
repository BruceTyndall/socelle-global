import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Download, Share2, TrendingUp, Calendar, Package, GraduationCap, Award, AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Skeleton } from './ui/Skeleton';

interface PlanOutputViewProps {
  planId: string;
  readOnly?: boolean;
}

export default function PlanOutputView({ planId, readOnly = false }: PlanOutputViewProps) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const { data: plan, isLoading: loading } = useQuery({
    queryKey: ['plan_output', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_outputs')
        .select(`
          *,
          spa_leads(spa_name, location, spa_type, contact_name),
          spa_menus(spa_name)
        `)
        .eq('id', planId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });

  const handleExportPdf = async () => {
    setExportingPdf(true);
    // Give the state a moment to render the "printing" state
    await new Promise(r => setTimeout(r, 100));
    window.print();
    setExportingPdf(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/portal/plans/${planId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Implementation Plan — ${plan?.spa_leads?.spa_name || 'Spa'}`,
          text: 'View this brand implementation plan',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareMsg('Link copied!');
        setTimeout(() => setShareMsg(''), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-graphite to-graphite py-12">
          <div className="max-w-5xl mx-auto px-6">
            <Skeleton className="h-4 w-40 mb-2 bg-graphite" />
            <Skeleton className="h-10 w-72 mb-3 bg-graphite" />
            <Skeleton className="h-5 w-56 bg-graphite" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
          <div className="grid grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white rounded-lg border border-accent-soft p-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-accent-soft p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white rounded-lg border border-accent-soft p-5">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-graphite/60 mx-auto mb-3" />
          <p className="text-graphite font-medium">Plan not found</p>
          <p className="text-sm text-graphite/60 mt-1">This plan may have been deleted or you don't have access.</p>
        </div>
      </div>
    );
  }

  const summary = plan.executive_summary || {};
  const validation = plan.menu_validation_section || {};
  const opportunities = plan.growth_opportunities_section || {};
  const roadmap = plan.implementation_roadmap_section || {};
  const opening = plan.opening_order_section || {};
  const brand = plan.brand_differentiation_section || {};
  const assumptions = plan.data_assumptions_section || {};

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-graphite to-graphite text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-accent-soft mb-2">Implementation Plan</div>
              <h1 className="text-4xl font-bold mb-3">{plan.spa_leads?.spa_name}</h1>
              <p className="text-accent-soft text-lg">
                {plan.spa_leads?.location} • {plan.spa_leads?.spa_type?.charAt(0).toUpperCase() + plan.spa_leads?.spa_type?.slice(1)}
              </p>
            </div>
            {!readOnly && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 bg-white text-graphite rounded-lg hover:bg-accent-soft flex items-center gap-2 font-medium print:hidden"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    onClick={handleExportPdf}
                    disabled={exportingPdf}
                    className="px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite flex items-center gap-2 font-medium disabled:opacity-70 print:hidden"
                  >
                    {exportingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {exportingPdf ? 'Preparing…' : 'Export PDF'}
                  </button>
                </div>
                {shareMsg && (
                  <div className="flex items-center gap-1 text-sm text-green-300 bg-white/10 px-3 py-1 rounded">
                    <LinkIcon className="w-3.5 h-3.5" />
                    {shareMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-graphite mb-6">Executive Summary</h2>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-accent-soft p-6">
              <div className="text-sm text-graphite/60 mb-2">Total Services</div>
              <div className="text-3xl font-bold text-graphite">{summary.current_state?.total_services || 0}</div>
              <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {summary.current_state?.confirmed_protocols || 0} validated
              </div>
            </div>

            <div className="bg-white rounded-lg border border-accent-soft p-6">
              <div className="text-sm text-graphite/60 mb-2">Growth Opportunities</div>
              <div className="text-3xl font-bold text-graphite">{summary.growth_opportunity?.recommended_additions || 0}</div>
              <div className="text-xs text-graphite/60 mt-2">Strategic additions</div>
            </div>

            <div className="bg-white rounded-lg border border-accent-soft p-6">
              <div className="text-sm text-graphite/60 mb-2">Revenue Potential</div>
              <div className="text-3xl font-bold text-green-700">
                {summary.growth_opportunity?.growth_potential_percent || 0}%
              </div>
              <div className="text-xs text-graphite/60 mt-2">Estimated growth</div>
            </div>
          </div>

          <div className="bg-accent-soft border border-accent-soft rounded-lg p-6">
            <h3 className="font-semibold text-graphite mb-3">Key Highlights</h3>
            <ul className="space-y-2">
              {summary.key_highlights?.map((highlight: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-graphite">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-graphite mb-6">Menu Validation</h2>

          <div className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
            <div className="flex items-center gap-6 mb-6">
              <div>
                <div className="text-sm text-graphite/60">High Confidence</div>
                <div className="text-2xl font-bold text-green-700">
                  {validation.confidence_breakdown?.high || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-graphite/60">Medium Confidence</div>
                <div className="text-2xl font-bold text-amber-700">
                  {validation.confidence_breakdown?.medium || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-graphite/60">Needs Review</div>
                <div className="text-2xl font-bold text-graphite">
                  {validation.confidence_breakdown?.low || 0}
                </div>
              </div>
            </div>
            <p className="text-sm text-graphite">{validation.validation_summary}</p>
          </div>

          {validation.services_by_confidence?.High && (
            <div className="space-y-3">
              <h3 className="font-semibold text-graphite">Validated Services</h3>
              {validation.services_by_confidence.High.slice(0, 5).map((service: any, idx: number) => (
                <div key={idx} className="bg-white border border-accent-soft rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-graphite">{service.service_name}</div>
                      <div className="text-sm text-graphite/60 mt-1">
                        Protocol: {service.protocol_name}
                      </div>
                    </div>
                    {service.price && (
                      <div className="text-sm font-medium text-graphite">${service.price}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-graphite mb-6 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-green-600" />
            Growth Opportunities
          </h2>

          {opportunities.why_now && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">Why Now?</h3>
              <p className="text-green-800">{opportunities.why_now}</p>
              <div className="text-sm text-green-700 mt-2">
                Seasonal themes: {opportunities.seasonal_context}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {opportunities.recommended_services?.map((service: any, idx: number) => (
              <div key={idx} className="bg-white border border-accent-soft rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-graphite text-lg">{service.protocol_name}</div>
                    <div className="text-sm text-graphite/60">{service.category}</div>
                  </div>
                  {service.priority && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.priority === 'High' ? 'bg-red-100 text-red-700' :
                      service.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-accent-soft text-graphite'
                    }`}>
                      {service.priority} Priority
                    </span>
                  )}
                </div>
                <p className="text-graphite mb-3">{service.why_recommend}</p>
                {service.estimated_revenue && (
                  <div className="text-green-700 font-medium">
                    Estimated Revenue: ${Math.round(service.estimated_revenue).toLocaleString()}/month
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-graphite mb-6 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-graphite" />
            90-Day Implementation Roadmap
          </h2>

          <div className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-graphite/60">Total Phases</div>
                <div className="text-2xl font-bold text-graphite">{roadmap.total_phases || 0}</div>
              </div>
              <div>
                <div className="text-sm text-graphite/60">Training Hours</div>
                <div className="text-2xl font-bold text-graphite">{roadmap.total_training_hours || 0}h</div>
              </div>
              <div>
                <div className="text-sm text-graphite/60">Risk Level</div>
                <div className={`text-2xl font-bold ${
                  (roadmap.avg_risk_score || 0) <= 30 ? 'text-green-700' :
                  (roadmap.avg_risk_score || 0) <= 60 ? 'text-amber-700' :
                  'text-red-700'
                }`}>
                  {roadmap.avg_risk_score || 0}/100
                </div>
              </div>
            </div>
          </div>

          {roadmap.phases?.map((phase: any, idx: number) => (
            <div key={idx} className="mb-8">
              <div className="bg-accent-soft rounded-t-lg px-6 py-4 border border-accent-soft">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-graphite text-lg">{phase.phase_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-graphite/60">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {phase.total_training_hours}h
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      phase.avg_risk <= 30 ? 'bg-green-100 text-green-700' :
                      phase.avg_risk <= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Risk: {phase.avg_risk}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-accent-soft border-t-0 rounded-b-lg divide-y divide-accent-soft">
                {phase.services?.map((service: any, sIdx: number) => (
                  <div key={sIdx} className="p-4">
                    <div className="font-medium text-graphite">{service.name}</div>
                    <div className="text-sm text-graphite/60 mt-1">{service.protocol}</div>
                    <div className="text-xs text-graphite/60 mt-2 italic">{service.rationale}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-accent-soft border border-accent-soft rounded-lg p-5">
            <h4 className="font-semibold text-graphite mb-2">Risk Management Approach</h4>
            <p className="text-graphite text-sm">{roadmap.risk_management_approach}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-graphite mb-6 flex items-center gap-2">
            <Package className="w-7 h-7 text-graphite" />
            Opening Order & Onboarding
          </h2>

          {opening.seasonal_launch && (
            <div className="bg-accent-soft border border-accent-soft rounded-lg p-5 mb-6">
              <h4 className="font-semibold text-teal-900 mb-2">Recommended Launch Window</h4>
              <div className="text-teal-800">{opening.seasonal_launch.recommended_window}</div>
              {opening.seasonal_launch.rationale && (
                <div className="text-sm text-graphite mt-2">{opening.seasonal_launch.rationale}</div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-accent-soft p-5">
              <h4 className="font-semibold text-graphite mb-3">Backbar Products</h4>
              <div className="text-3xl font-bold text-graphite mb-2">
                {opening.backbar_products?.length || 0}
              </div>
              <div className="text-sm text-graphite/60">SKUs required</div>
            </div>

            <div className="bg-white rounded-lg border border-accent-soft p-5">
              <h4 className="font-semibold text-graphite mb-3">Retail Assortment</h4>
              <div className="text-3xl font-bold text-graphite mb-2">
                {opening.retail_products?.length || 0}
              </div>
              <div className="text-sm text-graphite/60">Recommended SKUs</div>
            </div>
          </div>

          {opening.checklists && (
            <div className="grid grid-cols-3 gap-4">
              {opening.checklists.setup && (
                <div className="bg-white rounded-lg border border-accent-soft p-4">
                  <h4 className="font-semibold text-graphite mb-2 text-sm">Setup Checklist</h4>
                  <div className="text-2xl font-bold text-graphite">
                    {opening.checklists.setup.reduce((sum: number, section: any) => sum + section.items.length, 0)}
                  </div>
                  <div className="text-xs text-graphite/60">items</div>
                </div>
              )}
              {opening.checklists.training && (
                <div className="bg-white rounded-lg border border-accent-soft p-4">
                  <h4 className="font-semibold text-graphite mb-2 text-sm">Training Checklist</h4>
                  <div className="text-2xl font-bold text-graphite">
                    {opening.checklists.training.reduce((sum: number, section: any) => sum + section.items.length, 0)}
                  </div>
                  <div className="text-xs text-graphite/60">items</div>
                </div>
              )}
              {opening.checklists.launch && (
                <div className="bg-white rounded-lg border border-accent-soft p-4">
                  <h4 className="font-semibold text-graphite mb-2 text-sm">Launch Checklist</h4>
                  <div className="text-2xl font-bold text-graphite">
                    {opening.checklists.launch.reduce((sum: number, section: any) => sum + section.items.length, 0)}
                  </div>
                  <div className="text-xs text-graphite/60">items</div>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-graphite mb-6 flex items-center gap-2">
            <Award className="w-7 h-7 text-graphite" />
            {brand.headline || 'Why Partner with Naturopathica'}
          </h2>

          {brand.introduction && (
            <div className="bg-background border border-accent-soft rounded-lg p-6 mb-6">
              <p className="text-graphite">{brand.introduction}</p>
            </div>
          )}

          <div className="space-y-4">
            {brand.talking_points?.map((point: any, idx: number) => (
              <div key={idx} className="bg-white border border-accent-soft rounded-lg p-5">
                <h4 className="font-semibold text-graphite mb-3">{point.headline}</h4>
                <ul className="space-y-2">
                  {point.supporting_points?.map((subpoint: string, sIdx: number) => (
                    <li key={sIdx} className="flex items-start gap-2 text-graphite">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{subpoint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-graphite mb-6 flex items-center gap-2">
            <AlertCircle className="w-7 h-7 text-graphite/60" />
            Data & Assumptions
          </h2>

          <div className="bg-background border border-accent-soft rounded-lg p-6">
            <div className="mb-4">
              <div className="text-sm text-graphite/60 mb-2">Confidence Level</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                assumptions.confidence_level === 'High' ? 'bg-green-100 text-green-700' :
                assumptions.confidence_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                'bg-accent-soft text-graphite'
              }`}>
                {assumptions.confidence_level || 'Unknown'}
              </div>
            </div>

            {assumptions.data_sources && (
              <div className="mb-4">
                <div className="text-sm font-medium text-graphite mb-2">Data Sources</div>
                <ul className="text-sm text-graphite space-y-1">
                  {assumptions.data_sources.map((source: string, idx: number) => (
                    <li key={idx}>• {source}</li>
                  ))}
                </ul>
              </div>
            )}

            {assumptions.estimation_approach && (
              <div className="mb-4">
                <div className="text-sm font-medium text-graphite mb-2">Estimation Approach</div>
                <p className="text-sm text-graphite">{assumptions.estimation_approach}</p>
              </div>
            )}

            {assumptions.missing_data && assumptions.missing_data.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <div className="text-sm font-medium text-amber-900 mb-2">Data Gaps</div>
                <div className="text-sm text-amber-800">
                  The following data points would improve accuracy: {assumptions.missing_data.join(', ')}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="bg-graphite text-white py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-accent-soft mb-6">
            Let's discuss how Naturopathica can help elevate your spa's service offerings.
          </p>
          {!readOnly && (
            <button className="px-8 py-3 bg-white text-graphite rounded-lg hover:bg-accent-soft font-medium">
              Schedule a Consultation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
