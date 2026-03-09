import { useState, useEffect } from 'react';
import {
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Edit3,
  Calendar, Target, DollarSign, ArrowRight, RefreshCw, Brain
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeSpaMenu, SpaService } from '../lib/mappingEngine';
import { performGapAnalysis } from '../lib/gapAnalysisEngine';

interface ServiceMapping {
  id: string;
  service_name: string;
  service_category: string | null;
  service_duration: string | null;
  service_price: number | null;
  canonical_protocol_id: string | null;
  match_type: string;
  confidence_score: number;
  mapping_notes: string;
  is_seasonally_relevant: boolean;
  seasonal_rationale: string | null;
  admin_reviewed: boolean;
  admin_override: boolean;
  protocol_name?: string;
}

interface GapAnalysis {
  id: string;
  gap_type: string;
  gap_category: string;
  gap_description: string;
  priority_level: string;
  recommended_protocol_id: string | null;
  rationale: string;
  is_seasonal: boolean;
  seasonal_window: string | null;
  marketing_theme: string | null;
  estimated_revenue_impact: string;
  implementation_complexity: string;
  status: string;
  recommended_protocol_name?: string;
  admin_reviewed?: boolean;
}

interface SpaMenu {
  id: string;
  spa_name: string;
  spa_type: 'medspa' | 'spa' | 'hybrid';
  analysis_status: string;
}

export default function ServiceIntelligenceView() {
  const [spaMenus, setSpaMenus] = useState<SpaMenu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [mappings, setMappings] = useState<ServiceMapping[]>([]);
  const [gaps, setGaps] = useState<GapAnalysis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'mappings' | 'gaps'>('mappings');
  const [filterMatchType, setFilterMatchType] = useState<string>('all');

  useEffect(() => {
    loadSpaMenus();
  }, []);

  useEffect(() => {
    if (selectedMenu) {
      loadMappings();
      loadGaps();
    }
  }, [selectedMenu]);

  const loadSpaMenus = async () => {
    const { data } = await supabase
      .from('spa_menus')
      .select('id, spa_name, spa_type, analysis_status')
      .order('created_at', { ascending: false });

    if (data) {
      setSpaMenus(data as SpaMenu[]);
      if (data.length > 0 && !selectedMenu) {
        setSelectedMenu(data[0].id);
      }
    }
  };

  const loadMappings = async () => {
    if (!selectedMenu) return;

    const { data } = await supabase
      .from('spa_service_mapping')
      .select(`
        *,
        canonical_protocols (protocol_name)
      `)
      .eq('spa_menu_id', selectedMenu)
      .order('confidence_score', { ascending: false });

    if (data) {
      const mappingsWithProtocol = data.map(m => ({
        ...m,
        protocol_name: m.canonical_protocols?.protocol_name || null
      }));
      setMappings(mappingsWithProtocol as ServiceMapping[]);
    }
  };

  const loadGaps = async () => {
    if (!selectedMenu) return;

    const { data } = await supabase
      .from('service_gap_analysis')
      .select(`
        *,
        canonical_protocols (protocol_name)
      `)
      .eq('spa_menu_id', selectedMenu)
      .order('priority_level', { ascending: true });

    if (data) {
      const gapsWithProtocol = data.map(g => ({
        ...g,
        recommended_protocol_name: g.canonical_protocols?.protocol_name || null
      }));
      setGaps(gapsWithProtocol as GapAnalysis[]);
    }
  };

  const runAnalysis = async () => {
    if (!selectedMenu) return;

    const currentMenu = spaMenus.find(m => m.id === selectedMenu);
    if (!currentMenu) return;

    setAnalyzing(true);

    try {
      await supabase
        .from('spa_service_mapping')
        .delete()
        .eq('spa_menu_id', selectedMenu);

      await supabase
        .from('service_gap_analysis')
        .delete()
        .eq('spa_menu_id', selectedMenu);

      const { data: menuData } = await supabase
        .from('spa_menus')
        .select('raw_menu_data')
        .eq('id', selectedMenu)
        .single();

      if (!menuData) {
        alert('Menu data not found');
        return;
      }

      const lines = menuData.raw_menu_data.split('\n');
      const services: SpaService[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
          const parts = trimmed.split('|').map((p: string) => p.trim());

          services.push({
            service_name: parts[0] || trimmed,
            service_category: parts[1] || undefined,
            service_duration: parts[2] || undefined,
            service_price: parts[3] ? parseFloat(parts[3]) : undefined,
            service_description: parts[4] || undefined,
          });
        }
      }

      if (services.length === 0) {
        alert('No services found in menu. Format: Name | Category | Duration | Price | Description');
        return;
      }

      await analyzeSpaMenu(selectedMenu, services, currentMenu.spa_type);

      await performGapAnalysis(selectedMenu, currentMenu.spa_type);

      await loadMappings();
      await loadGaps();
      await loadSpaMenus();

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Check console for details.');
    } finally {
      setAnalyzing(false);
    }
  };

  const updateMappingReview = async (mappingId: string, approved: boolean, notes?: string) => {
    await supabase
      .from('spa_service_mapping')
      .update({
        admin_reviewed: true,
        admin_override: !approved,
        admin_notes: notes,
        reviewed_by: 'admin',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', mappingId);

    loadMappings();
  };

  const updateGapStatus = async (gapId: string, action: string, notes?: string) => {
    await supabase
      .from('service_gap_analysis')
      .update({
        admin_reviewed: true,
        admin_action: action,
        admin_notes: notes,
        reviewed_by: 'admin',
        reviewed_at: new Date().toISOString(),
        status: action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : 'identified'
      })
      .eq('id', gapId);

    loadGaps();
  };

  const getMatchTypeBadge = (matchType: string) => {
    const styles = {
      'Exact': 'bg-green-100 text-green-700 border-green-200',
      'Partial': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Candidate': 'bg-accent-soft text-graphite border-accent-soft',
      'No Match': 'bg-red-100 text-red-700 border-red-200'
    };

    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${styles[matchType as keyof typeof styles] || styles['No Match']}`}>
        {matchType}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      'High': 'bg-red-100 text-red-700 border-red-200',
      'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Low': 'bg-accent-soft text-graphite border-accent-soft'
    };

    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${styles[priority as keyof typeof styles]}`}>
        {priority}
      </span>
    );
  };

  const filteredMappings = mappings.filter(m => {
    if (filterMatchType === 'all') return true;
    return m.match_type === filterMatchType;
  });

  const mappingStats = {
    exact: mappings.filter(m => m.match_type === 'Exact').length,
    partial: mappings.filter(m => m.match_type === 'Partial').length,
    candidate: mappings.filter(m => m.match_type === 'Candidate').length,
    noMatch: mappings.filter(m => m.match_type === 'No Match').length,
    avgConfidence: mappings.length > 0
      ? Math.round(mappings.reduce((sum, m) => sum + m.confidence_score, 0) / mappings.length)
      : 0
  };

  const gapStats = {
    high: gaps.filter(g => g.priority_level === 'High').length,
    medium: gaps.filter(g => g.priority_level === 'Medium').length,
    low: gaps.filter(g => g.priority_level === 'Low').length,
    seasonal: gaps.filter(g => g.is_seasonal).length
  };

  const currentMenu = spaMenus.find(m => m.id === selectedMenu);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-graphite" />
            <div>
              <h2 className="text-2xl font-semibold text-graphite">Service Intelligence Engine</h2>
              <p className="text-sm text-graphite/60">AI-powered service mapping and gap analysis</p>
            </div>
          </div>

          {selectedMenu && (
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="flex items-center gap-2 px-4 py-2 bg-graphite hover:bg-graphite disabled:bg-graphite/60 text-white rounded-lg font-medium transition-colors"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Run Analysis
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {spaMenus.map(menu => (
            <button
              key={menu.id}
              onClick={() => setSelectedMenu(menu.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMenu === menu.id
                  ? 'bg-graphite text-white'
                  : 'bg-accent-soft text-graphite hover:bg-accent-soft'
              }`}
            >
              {menu.spa_name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                menu.spa_type === 'medspa' ? 'bg-accent-soft text-graphite' :
                menu.spa_type === 'hybrid' ? 'bg-purple-200 text-purple-800' :
                'bg-green-200 text-green-800'
              }`}>
                {menu.spa_type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedMenu && currentMenu && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-accent-soft p-4">
              <div className="text-2xl font-bold text-graphite">{mappings.length}</div>
              <div className="text-sm text-graphite/60">Total Services</div>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <div className="text-2xl font-bold text-green-900">{mappingStats.exact}</div>
              <div className="text-sm text-green-700">Exact Matches</div>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <div className="text-2xl font-bold text-red-900">{gapStats.high}</div>
              <div className="text-sm text-red-700">High Priority Gaps</div>
            </div>
            <div className="bg-accent-soft rounded-lg border border-accent-soft p-4">
              <div className="text-2xl font-bold text-graphite">{mappingStats.avgConfidence}%</div>
              <div className="text-sm text-graphite">Avg Confidence</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-accent-soft mb-6">
            <div className="border-b border-accent-soft">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('mappings')}
                  className={`flex-1 px-6 py-3 font-medium transition-colors ${
                    activeTab === 'mappings'
                      ? 'border-b-2 border-graphite text-graphite'
                      : 'text-graphite/60 hover:text-graphite'
                  }`}
                >
                  Service Mappings ({mappings.length})
                </button>
                <button
                  onClick={() => setActiveTab('gaps')}
                  className={`flex-1 px-6 py-3 font-medium transition-colors ${
                    activeTab === 'gaps'
                      ? 'border-b-2 border-graphite text-graphite'
                      : 'text-graphite/60 hover:text-graphite'
                  }`}
                >
                  Gap Analysis ({gaps.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'mappings' ? (
                <>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setFilterMatchType('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        filterMatchType === 'all'
                          ? 'bg-graphite text-white'
                          : 'bg-accent-soft text-graphite hover:bg-accent-soft'
                      }`}
                    >
                      All ({mappings.length})
                    </button>
                    <button
                      onClick={() => setFilterMatchType('Exact')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        filterMatchType === 'Exact'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      Exact ({mappingStats.exact})
                    </button>
                    <button
                      onClick={() => setFilterMatchType('Partial')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        filterMatchType === 'Partial'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      }`}
                    >
                      Partial ({mappingStats.partial})
                    </button>
                    <button
                      onClick={() => setFilterMatchType('No Match')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        filterMatchType === 'No Match'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      No Match ({mappingStats.noMatch})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {filteredMappings.map(mapping => (
                      <div
                        key={mapping.id}
                        className={`border rounded-lg p-4 ${
                          mapping.admin_reviewed
                            ? 'border-accent-soft bg-background'
                            : 'border-accent-soft bg-accent-soft/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-graphite">{mapping.service_name}</h4>
                              {getMatchTypeBadge(mapping.match_type)}
                              <span className="text-sm font-medium text-graphite/60">
                                {mapping.confidence_score}% confidence
                              </span>
                              {mapping.is_seasonally_relevant && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
                                  <Calendar className="w-3 h-3" />
                                  Seasonal
                                </span>
                              )}
                            </div>

                            {mapping.protocol_name && (
                              <div className="flex items-center gap-2 mb-2 text-sm text-graphite">
                                <span className="font-medium">{mapping.service_name}</span>
                                <ArrowRight className="w-4 h-4 text-graphite/60" />
                                <span className="font-medium text-graphite">{mapping.protocol_name}</span>
                              </div>
                            )}

                            <p className="text-sm text-graphite/60 mb-2">{mapping.mapping_notes}</p>

                            {mapping.seasonal_rationale && (
                              <p className="text-xs text-purple-700 italic">{mapping.seasonal_rationale}</p>
                            )}

                            {mapping.admin_reviewed && (
                              <div className="mt-2 flex items-center gap-2 text-xs">
                                {mapping.admin_override ? (
                                  <span className="text-amber-600 font-medium">⚠️ Overridden by admin</span>
                                ) : (
                                  <span className="text-green-600 font-medium">✓ Approved</span>
                                )}
                              </div>
                            )}
                          </div>

                          {!mapping.admin_reviewed && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => updateMappingReview(mapping.id, true)}
                                className="p-2 hover:bg-green-100 text-green-600 rounded transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt('Enter override notes:');
                                  if (notes) updateMappingReview(mapping.id, false, notes);
                                }}
                                className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                                title="Override"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {gaps.map(gap => (
                    <div
                      key={gap.id}
                      className={`border rounded-lg p-4 ${
                        gap.priority_level === 'High' ? 'border-red-200 bg-red-50/30' :
                        gap.priority_level === 'Medium' ? 'border-yellow-200 bg-yellow-50/30' :
                        'border-accent-soft bg-accent-soft/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-5 h-5 ${
                            gap.priority_level === 'High' ? 'text-red-600' :
                            gap.priority_level === 'Medium' ? 'text-yellow-600' :
                            'text-graphite'
                          }`} />
                          <h4 className="font-semibold text-graphite">{gap.gap_description}</h4>
                          {getPriorityBadge(gap.priority_level)}
                          {gap.is_seasonal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
                              <Calendar className="w-3 h-3" />
                              {gap.seasonal_window}
                            </span>
                          )}
                        </div>
                      </div>

                      {gap.recommended_protocol_name && (
                        <div className="mb-3 p-3 bg-white rounded border border-accent-soft">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-graphite" />
                            <span className="text-sm font-medium text-graphite">Recommended Protocol:</span>
                            <span className="text-sm font-semibold text-graphite">{gap.recommended_protocol_name}</span>
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-graphite mb-3">{gap.rationale}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-graphite/60">Revenue: </span>
                          <span className="font-medium">{gap.estimated_revenue_impact}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-graphite" />
                          <span className="text-graphite/60">Complexity: </span>
                          <span className="font-medium">{gap.implementation_complexity}</span>
                        </div>
                      </div>

                      {!gap.admin_reviewed && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-accent-soft">
                          <button
                            onClick={() => updateGapStatus(gap.id, 'approved')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateGapStatus(gap.id, 'under_review')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-graphite hover:bg-graphite text-white rounded text-sm font-medium transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Review Later
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter rejection reason:');
                              if (notes) updateGapStatus(gap.id, 'rejected', notes);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}

                      {gap.admin_reviewed && (
                        <div className="mt-3 pt-3 border-t border-accent-soft">
                          <span className={`text-xs font-medium ${
                            gap.status === 'approved' ? 'text-green-600' :
                            gap.status === 'rejected' ? 'text-red-600' :
                            'text-graphite'
                          }`}>
                            Status: {gap.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {gaps.length === 0 && (
                    <div className="text-center py-12 text-graphite/60">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <p>No gaps identified. Your service menu is well-balanced!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
