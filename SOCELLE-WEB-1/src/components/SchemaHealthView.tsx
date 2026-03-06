import { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, Copy, FileText } from 'lucide-react';
import { runSchemaHealthCheck, getHealthSummary, type SchemaHealthResult } from '../lib/schemaHealth';
import { supabase } from '../lib/supabase';

interface ProtocolCompletionStatus {
  totalProtocols: number;
  withSteps: number;
  withProducts: number;
  incompleteProtocols: Array<{ id: string; protocol_name: string; category: string }>;
}

export default function SchemaHealthView() {
  const [results, setResults] = useState<SchemaHealthResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [protocolStatus, setProtocolStatus] = useState<ProtocolCompletionStatus | null>(null);

  useEffect(() => {
    performHealthCheck();
    loadProtocolStatus();
  }, []);

  const performHealthCheck = async () => {
    setLoading(true);
    try {
      const checkResults = await runSchemaHealthCheck();
      setResults(checkResults);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProtocolStatus = async () => {
    try {
      const { data: protocols, count: totalProtocols } = await supabase
        .from('canonical_protocols')
        .select('id, protocol_name, category', { count: 'exact' });

      const { data: stepsData } = await supabase
        .from('canonical_protocol_steps')
        .select('canonical_protocol_id');

      const { data: productsData } = await supabase
        .from('canonical_protocol_step_products')
        .select('protocol_step_id');

      const protocolsWithSteps = new Set(stepsData?.map(s => s.canonical_protocol_id) || []);
      const stepsWithProducts = new Set(productsData?.map(p => p.protocol_step_id) || []);

      const { data: stepsWithIds } = await supabase
        .from('canonical_protocol_steps')
        .select('id, canonical_protocol_id');

      const protocolsWithProducts = new Set(
        stepsWithIds
          ?.filter(s => stepsWithProducts.has(s.id))
          .map(s => s.canonical_protocol_id) || []
      );

      const incompleteProtocols = protocols?.filter(p => !protocolsWithSteps.has(p.id)) || [];

      setProtocolStatus({
        totalProtocols: totalProtocols || 0,
        withSteps: protocolsWithSteps.size,
        withProducts: protocolsWithProducts.size,
        incompleteProtocols
      });
    } catch (error) {
      console.error('Failed to load protocol status:', error);
    }
  };

  const summary = results.length > 0 ? getHealthSummary(results) : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'WARN':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'WARN':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'FAIL':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-pro-ivory border-pro-stone text-pro-charcoal';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-pro-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-pro-warm-gray">Running schema health check...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-pro-charcoal" />
          <div>
            <h2 className="text-2xl font-semibold text-pro-charcoal">Schema Health Check</h2>
            <p className="text-sm text-pro-warm-gray">Verify database structure and detect schema drift</p>
          </div>
        </div>

        <button
          onClick={performHealthCheck}
          className="px-4 py-2 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Re-check
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className={`rounded-lg border-2 p-4 ${
            summary.overallStatus === 'PASS' ? 'bg-green-50 border-green-200' :
            summary.overallStatus === 'WARN' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="text-sm font-medium text-pro-charcoal mb-1">Overall Status</div>
            <div className={`text-2xl font-bold ${
              summary.overallStatus === 'PASS' ? 'text-green-700' :
              summary.overallStatus === 'WARN' ? 'text-amber-700' :
              'text-red-700'
            }`}>
              {summary.overallStatus}
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-pro-charcoal mb-1">Passed</div>
            <div className="text-2xl font-bold text-green-700">{summary.passCount}</div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <div className="text-sm font-medium text-pro-charcoal mb-1">Warnings</div>
            <div className="text-2xl font-bold text-amber-700">{summary.warningCount}</div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="text-sm font-medium text-pro-charcoal mb-1">Failures</div>
            <div className="text-2xl font-bold text-red-700">{summary.failureCount}</div>
          </div>
        </div>
      )}

      {lastChecked && (
        <div className="text-sm text-pro-warm-gray mb-4">
          Last checked: {lastChecked.toLocaleString()}
        </div>
      )}

      {protocolStatus && (
        <div className="bg-white rounded-xl shadow-sm border border-pro-stone p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-pro-charcoal" />
            <div>
              <h3 className="text-lg font-semibold text-pro-charcoal">Protocol Completion Status</h3>
              <p className="text-sm text-pro-warm-gray">Track protocol step and product completion</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-pro-cream border border-pro-stone rounded-lg p-4">
              <div className="text-sm font-medium text-pro-charcoal mb-1">Total Protocols</div>
              <div className="text-2xl font-bold text-pro-charcoal">{protocolStatus.totalProtocols}</div>
            </div>

            <div className={`border rounded-lg p-4 ${
              protocolStatus.withSteps > 0 ? 'bg-green-50 border-green-200' : 'bg-pro-ivory border-pro-stone'
            }`}>
              <div className="text-sm font-medium text-pro-charcoal mb-1">With Steps</div>
              <div className={`text-2xl font-bold ${
                protocolStatus.withSteps > 0 ? 'text-green-700' : 'text-pro-charcoal'
              }`}>
                {protocolStatus.withSteps}
              </div>
              <div className="text-xs text-pro-warm-gray mt-1">
                {protocolStatus.totalProtocols > 0
                  ? Math.round((protocolStatus.withSteps / protocolStatus.totalProtocols) * 100)
                  : 0}% complete
              </div>
            </div>

            <div className={`border rounded-lg p-4 ${
              protocolStatus.withProducts > 0 ? 'bg-green-50 border-green-200' : 'bg-pro-ivory border-pro-stone'
            }`}>
              <div className="text-sm font-medium text-pro-charcoal mb-1">With Products</div>
              <div className={`text-2xl font-bold ${
                protocolStatus.withProducts > 0 ? 'text-green-700' : 'text-pro-charcoal'
              }`}>
                {protocolStatus.withProducts}
              </div>
              <div className="text-xs text-pro-warm-gray mt-1">
                {protocolStatus.totalProtocols > 0
                  ? Math.round((protocolStatus.withProducts / protocolStatus.totalProtocols) * 100)
                  : 0}% complete
              </div>
            </div>

            <div className={`border rounded-lg p-4 ${
              protocolStatus.incompleteProtocols.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="text-sm font-medium text-pro-charcoal mb-1">Incomplete</div>
              <div className={`text-2xl font-bold ${
                protocolStatus.incompleteProtocols.length > 0 ? 'text-amber-700' : 'text-green-700'
              }`}>
                {protocolStatus.incompleteProtocols.length}
              </div>
            </div>
          </div>

          {protocolStatus.incompleteProtocols.length > 0 && (
            <div className="border-t border-pro-stone pt-4">
              <h4 className="font-semibold text-pro-charcoal mb-3">
                Protocols Without Steps ({protocolStatus.incompleteProtocols.length})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {protocolStatus.incompleteProtocols.map((protocol) => (
                  <div
                    key={protocol.id}
                    className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded text-sm"
                  >
                    <div>
                      <span className="font-medium text-pro-charcoal">{protocol.protocol_name}</span>
                      <span className="ml-2 text-xs text-pro-warm-gray">({protocol.category})</span>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">Needs completion</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-pro-warm-gray">
                Use <span className="font-mono bg-pro-stone px-2 py-0.5 rounded">/admin/protocols</span> to complete these protocols
              </div>
            </div>
          )}

          {protocolStatus.incompleteProtocols.length === 0 && protocolStatus.totalProtocols > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-green-900">All protocols have steps!</div>
              <div className="text-sm text-green-700 mt-1">
                Ready for protocol mapping and analysis
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-4 ${getStatusColor(result.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{result.table}</h3>
                    {result.critical && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-90 mb-2">{result.description}</p>

                  {!result.tableExists && (
                    <div className="text-sm font-medium mb-2">
                      Table does not exist
                    </div>
                  )}

                  {result.missingColumns.length > 0 && result.tableExists && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">Missing columns:</span>{' '}
                      <span className="font-mono text-xs">{result.missingColumns.join(', ')}</span>
                    </div>
                  )}

                  {result.status === 'PASS' && (
                    <div className="text-sm font-medium">
                      ✓ All required columns present
                    </div>
                  )}

                  {result.suggestedFix && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium hover:underline">
                        Show suggested fix
                      </summary>
                      <div className="mt-2 bg-white bg-opacity-50 rounded border border-current p-3">
                        <div className="flex items-start justify-between gap-2">
                          <code className="text-xs flex-1 break-all">{result.suggestedFix}</code>
                          <button
                            onClick={() => copyToClipboard(result.suggestedFix!)}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {summary && summary.failureCount > 0 && (
        <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Action Required</h3>
          <p className="text-red-800 mb-4">
            {summary.criticalIssues > 0 ? (
              <>
                <strong>{summary.criticalIssues} critical issue{summary.criticalIssues > 1 ? 's' : ''}</strong> detected.
                The application may not function correctly until these are resolved.
              </>
            ) : (
              <>
                {summary.failureCount} schema issue{summary.failureCount > 1 ? 's' : ''} detected.
                Some features may not work as expected.
              </>
            )}
          </p>
          <p className="text-sm text-red-700">
            Review the suggested fixes above and apply the necessary migrations to restore full functionality.
          </p>
        </div>
      )}

      {summary && summary.overallStatus === 'PASS' && (
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">Schema Health: Excellent</h3>
          <p className="text-green-800">
            All required tables and columns are present. The database schema is in good health.
          </p>
        </div>
      )}
    </div>
  );
}
