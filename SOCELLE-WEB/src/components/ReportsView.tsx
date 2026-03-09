import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateReports } from '../lib/reportGenerator';

interface SpaMenu {
  id: string;
  spa_name: string;
  parse_status: string;
}

interface GeneratedReports {
  mappingTable: string;
  gapSummary: string;
  executiveSummary: string;
  followUpEmail: string;
}

export default function ReportsView() {
  const [menus, setMenus] = useState<SpaMenu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<GeneratedReports | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    const { data, error } = await supabase
      .from('spa_menus')
      .select('id, spa_name, parse_status')
      .eq('parse_status', 'parsed')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMenus(data);
    }
  };

  const handleGenerateReports = async () => {
    if (!selectedMenuId) {
      setError('Please select a spa menu first');
      return;
    }

    setIsGenerating(true);
    setError('');
    setReports(null);

    try {
      const generatedReports = await generateReports(selectedMenuId);
      setReports(generatedReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-graphite">Report Generator</h2>
        <p className="text-sm text-graphite/60 mt-1">
          Generate comprehensive mapping tables, gap analyses, and follow-up materials
        </p>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft p-6 mb-6">
        <h3 className="text-lg font-medium text-graphite mb-4">Select Mapped Menu</h3>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-graphite mb-2">Spa Menu</label>
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="w-full px-3 py-2 border border-accent-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-graphite"
              disabled={isGenerating}
            >
              <option value="">Select a mapped spa menu...</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.spa_name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateReports}
            disabled={!selectedMenuId || isGenerating}
            className="flex items-center space-x-2 px-6 py-2 bg-graphite text-white rounded-lg hover:bg-graphite disabled:bg-accent-soft disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Reports</span>
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {isGenerating && (
        <div className="bg-white rounded-lg border border-accent-soft p-12 text-center">
          <Loader2 className="w-12 h-12 text-graphite animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-graphite mb-2">Generating Reports</h3>
          <p className="text-graphite/60">
            Creating mapping tables, gap analysis, executive summary, and follow-up email...
          </p>
        </div>
      )}

      {reports && !isGenerating && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-accent-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-graphite">Service Mapping Table</h3>
              <button
                onClick={() => copyToClipboard(reports.mappingTable, 'Mapping Table')}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-accent-soft rounded-lg hover:bg-background"
              >
                <Download className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-background rounded border border-accent-soft p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-graphite whitespace-pre-wrap font-mono">
                {reports.mappingTable}
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-accent-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-graphite">Gap & Expansion Summary</h3>
              <button
                onClick={() => copyToClipboard(reports.gapSummary, 'Gap Summary')}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-accent-soft rounded-lg hover:bg-background"
              >
                <Download className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-background rounded border border-accent-soft p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-graphite whitespace-pre-wrap font-mono">
                {reports.gapSummary}
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-accent-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-graphite">Executive Prospect Summary</h3>
              <button
                onClick={() => copyToClipboard(reports.executiveSummary, 'Executive Summary')}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-accent-soft rounded-lg hover:bg-background"
              >
                <Download className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-background rounded border border-accent-soft p-4">
              <pre className="text-sm text-graphite whitespace-pre-wrap">
                {reports.executiveSummary}
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-accent-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-graphite" />
                <h3 className="text-lg font-semibold text-graphite">Follow-Up Email</h3>
              </div>
              <button
                onClick={() => copyToClipboard(reports.followUpEmail, 'Follow-Up Email')}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-accent-soft rounded-lg hover:bg-background"
              >
                <Download className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
            <div className="bg-background rounded border border-accent-soft p-4">
              <pre className="text-sm text-graphite whitespace-pre-wrap">
                {reports.followUpEmail}
              </pre>
            </div>
          </div>
        </div>
      )}

      {!reports && !isGenerating && (
        <div className="bg-white rounded-lg border border-accent-soft p-12 text-center">
          <FileText className="w-12 h-12 text-graphite/60 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-graphite mb-2">No Reports Generated</h3>
          <p className="text-graphite/60">Select a mapped spa menu and click Generate Reports to begin</p>
        </div>
      )}
    </div>
  );
}
