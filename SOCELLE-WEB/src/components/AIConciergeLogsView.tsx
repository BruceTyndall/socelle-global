import { useState, useEffect } from 'react';
import { MessageCircle, Search, Filter, Download, Eye, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChatLog {
  id: string;
  spa_id: string | null;
  user_role: string;
  mode_used: string;
  user_question: string;
  ai_response: string;
  source_tables: string[];
  missing_data_flags: string[];
  confidence_level: string;
  context_page: string;
  created_at: string;
  spa_leads?: {
    spa_name: string;
  };
}

export default function AIConciergeLogsView() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ChatLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    avgConfidence: 0,
    topMode: '',
    flaggedQuestions: 0
  });

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [logs, searchTerm, filterMode, filterConfidence]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_concierge_chat_logs')
        .select(`
          *,
          spa_leads(spa_name)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(
        log =>
          log.user_question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ai_response.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMode !== 'all') {
      filtered = filtered.filter(log => log.mode_used === filterMode);
    }

    if (filterConfidence !== 'all') {
      filtered = filtered.filter(log => log.confidence_level === filterConfidence);
    }

    setFilteredLogs(filtered);
  };

  const calculateStats = () => {
    const total = filteredLogs.length;
    const flagged = filteredLogs.filter(log => log.missing_data_flags.length > 0).length;

    const confidenceScores = filteredLogs.map(log => {
      switch (log.confidence_level) {
        case 'High': return 3;
        case 'Medium': return 2;
        case 'Low': return 1;
        default: return 0;
      }
    });

    const avgScore = confidenceScores.length > 0
      ? confidenceScores.reduce<number>((sum, score) => sum + score, 0) / confidenceScores.length
      : 0;

    const modeCounts = filteredLogs.reduce((acc, log) => {
      acc[log.mode_used] = (acc[log.mode_used] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topMode = Object.entries(modeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    setStats({
      totalQuestions: total,
      avgConfidence: avgScore,
      topMode,
      flaggedQuestions: flagged
    });
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Spa', 'User Role', 'Mode', 'Question', 'Confidence', 'Missing Data'],
      ...filteredLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.spa_leads?.spa_name || 'N/A',
        log.user_role,
        log.mode_used,
        log.user_question,
        log.confidence_level,
        log.missing_data_flags.join('; ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-concierge-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getConfidenceColor = (level: string) => {
    const colors = {
      High: 'text-green-700 bg-green-50',
      Medium: 'text-pro-charcoal bg-pro-cream',
      Low: 'text-amber-700 bg-amber-50',
      Unknown: 'text-pro-charcoal bg-pro-ivory'
    };
    return colors[level as keyof typeof colors] || colors.Unknown;
  };

  const getModeColor = (mode: string) => {
    const colors = {
      brand_expert: 'text-purple-700 bg-purple-50',
      service_strategy: 'text-pro-charcoal bg-pro-cream',
      budget_guide: 'text-green-700 bg-green-50',
      training_advisor: 'text-amber-700 bg-amber-50',
      sales_enablement: 'text-red-700 bg-red-50'
    };
    return colors[mode as keyof typeof colors] || 'text-pro-charcoal bg-pro-ivory';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pro-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pro-warm-gray">Loading AI Concierge logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-pro-navy" />
          <div>
            <h2 className="text-2xl font-semibold text-pro-charcoal">AI Concierge Logs</h2>
            <p className="text-sm text-pro-warm-gray">Governance & audit trail for AI interactions</p>
          </div>
        </div>

        <button
          onClick={exportLogs}
          className="px-4 py-2 border border-pro-stone text-pro-charcoal rounded-lg hover:bg-pro-ivory flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-pro-stone p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-pro-charcoal">{stats.totalQuestions}</div>
              <div className="text-xs text-pro-warm-gray">Total Questions</div>
            </div>
            <MessageCircle className="w-8 h-8 text-pro-navy" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-pro-stone p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-pro-charcoal">
                {stats.avgConfidence.toFixed(1)}/3
              </div>
              <div className="text-xs text-pro-warm-gray">Avg Confidence</div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-pro-stone p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-pro-charcoal capitalize">
                {stats.topMode.replace('_', ' ')}
              </div>
              <div className="text-xs text-pro-warm-gray">Most Used Mode</div>
            </div>
            <Filter className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-pro-stone p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-pro-charcoal">{stats.flaggedQuestions}</div>
              <div className="text-xs text-pro-warm-gray">Missing Data Flags</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-pro-stone mb-6">
        <div className="p-4 border-b border-pro-stone">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pro-warm-gray" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions or responses..."
                className="w-full pl-10 pr-4 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
              />
            </div>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-3 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
            >
              <option value="all">All Modes</option>
              <option value="brand_expert">Brand Expert</option>
              <option value="service_strategy">Service Strategy</option>
              <option value="budget_guide">Budget Guide</option>
              <option value="training_advisor">Training Advisor</option>
              <option value="sales_enablement">Sales Enablement</option>
            </select>

            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(e.target.value)}
              className="px-3 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
            >
              <option value="all">All Confidence</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-pro-stone max-h-[600px] overflow-y-auto">
          {filteredLogs.map(log => (
            <div
              key={log.id}
              className="p-4 hover:bg-pro-ivory cursor-pointer"
              onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getModeColor(log.mode_used)}`}>
                      {log.mode_used.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getConfidenceColor(log.confidence_level)}`}>
                      {log.confidence_level}
                    </span>
                    {log.missing_data_flags.length > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-amber-700 bg-amber-50">
                        {log.missing_data_flags.length} flags
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-pro-charcoal mb-1">{log.user_question}</p>
                  <div className="flex items-center gap-4 text-xs text-pro-warm-gray">
                    {log.spa_leads?.spa_name && (
                      <span>{log.spa_leads.spa_name}</span>
                    )}
                    <span className="capitalize">{log.user_role}</span>
                    <span className="capitalize">{log.context_page}</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <Eye className="w-4 h-4 text-pro-warm-gray" />
              </div>

              {selectedLog?.id === log.id && (
                <div className="mt-4 pt-4 border-t border-pro-stone space-y-3">
                  <div className="bg-pro-ivory rounded p-3">
                    <div className="text-xs font-medium text-pro-charcoal mb-2">AI Response:</div>
                    <div className="text-sm text-pro-charcoal">
                      {typeof log.ai_response === 'string'
                        ? JSON.parse(log.ai_response).directAnswer
                        : log.ai_response}
                    </div>
                  </div>

                  {log.source_tables.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-pro-charcoal mb-1">Data Sources:</div>
                      <div className="flex flex-wrap gap-1">
                        {log.source_tables.map((table, i) => (
                          <span key={i} className="px-2 py-0.5 bg-pro-cream text-pro-charcoal text-xs rounded">
                            {table}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.missing_data_flags.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-amber-700 mb-1">Missing Data Flags:</div>
                      <div className="space-y-1">
                        {log.missing_data_flags.map((flag, i) => (
                          <div key={i} className="text-xs text-amber-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {flag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-pro-warm-gray">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-pro-warm-gray" />
              <p>No logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
