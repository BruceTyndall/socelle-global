import { useState, useEffect } from 'react';
import { MapPin, Play, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { performServiceMapping } from '../lib/mappingEngine';

interface SpaMenu {
  id: string;
  spa_name: string;
  raw_menu_data: string;
  parse_status: string;
}

interface MappingResult {
  serviceId: string;
  serviceName: string;
  category: string;
  solutionType: string;
  solutionReference: string;
  matchType: string;
  confidence: string;
  rationale: string;
  retailAttach: string[];
  cogsStatus: string;
  cogsAmount: number | null;
  pricingGuidance: string;
}

export default function MappingView() {
  const [menus, setMenus] = useState<SpaMenu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [isMapping, setIsMapping] = useState(false);
  const [mappingResults, setMappingResults] = useState<MappingResult[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    const { data, error } = await supabase
      .from('spa_menus')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMenus(data);
    }
  };

  const handleStartMapping = async () => {
    if (!selectedMenuId) {
      setError('Please select a spa menu first');
      return;
    }

    setIsMapping(true);
    setError('');
    setMappingResults([]);

    try {
      const results = await performServiceMapping(selectedMenuId);
      setMappingResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mapping failed');
    } finally {
      setIsMapping(false);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      High: 'bg-accent-soft text-graphite',
      Medium: 'bg-amber-100 text-amber-800',
      Low: 'bg-accent-soft text-graphite',
    };
    return colors[confidence as keyof typeof colors] || colors.Low;
  };

  const getMatchTypeBadge = (matchType: string) => {
    const colors = {
      'Direct Fit': 'bg-accent-soft text-graphite',
      'Partial Fit': 'bg-purple-100 text-purple-800',
      'Adjacent Opportunity': 'bg-orange-100 text-orange-800',
    };
    return colors[matchType as keyof typeof colors] || 'bg-accent-soft text-graphite';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-graphite">Service Mapping Engine</h2>
        <p className="text-sm text-graphite/60 mt-1">
          Map spa services to Naturopathica solutions using AI-powered analysis
        </p>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
        <h3 className="text-lg font-medium text-graphite mb-4">Select Spa Menu</h3>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-graphite mb-2">Spa Menu</label>
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
              disabled={isMapping}
            >
              <option value="">Select a spa menu...</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.spa_name} (Uploaded {new Date(menu.raw_menu_data).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleStartMapping}
            disabled={!selectedMenuId || isMapping}
            className="flex items-center space-x-2 px-6 py-2 bg-graphite text-white rounded-lg hover:bg-graphite disabled:bg-accent-soft disabled:cursor-not-allowed transition-colors"
          >
            {isMapping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mapping...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Mapping</span>
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {isMapping && (
        <div className="bg-white rounded-lg border border-accent-soft p-12 text-center">
          <Loader2 className="w-12 h-12 text-graphite animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-graphite mb-2">Analyzing Service Menu</h3>
          <p className="text-graphite/60">
            Parsing services, matching protocols, and generating recommendations...
          </p>
        </div>
      )}

      {mappingResults.length > 0 && !isMapping && (
        <div className="space-y-6">
          <div className="bg-accent-soft border border-accent-soft rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-graphite mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-graphite font-medium">Mapping Complete</p>
              <p className="text-sm text-graphite mt-1">
                Successfully mapped {mappingResults.length} services. View results below or generate reports.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-accent-soft">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Spa Service</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Solution</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Match</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Confidence</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-graphite">Retail Attach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent-soft">
                  {mappingResults.map((result, index) => (
                    <tr key={index} className="hover:bg-background">
                      <td className="px-4 py-3 text-sm font-medium text-graphite">{result.serviceName}</td>
                      <td className="px-4 py-3 text-sm text-graphite/60">{result.category}</td>
                      <td className="px-4 py-3 text-sm text-graphite">{result.solutionReference}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-graphite/60">{result.solutionType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMatchTypeBadge(result.matchType)}`}>
                          {result.matchType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConfidenceBadge(result.confidence)}`}>
                          {result.confidence}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-graphite/60">
                        {result.retailAttach.length > 0 ? result.retailAttach.join(', ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {mappingResults.length === 0 && !isMapping && (
        <div className="bg-white rounded-lg border border-accent-soft p-12 text-center">
          <MapPin className="w-12 h-12 text-graphite/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-graphite mb-2">No Mapping Results</h3>
          <p className="text-graphite/60">Select a spa menu and click Start Mapping to begin</p>
        </div>
      )}
    </div>
  );
}
