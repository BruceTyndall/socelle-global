import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Play, Loader2, FileCheck, AlertTriangle } from 'lucide-react';
import { runPreFlightValidation, ingestPhase2, type IngestionResult } from '../lib/pdfExtractionService';

interface Phase2IngestionPanelProps {
  onComplete: () => void;
}

export default function Phase2IngestionPanel({ onComplete }: Phase2IngestionPanelProps) {
  const [stage, setStage] = useState<'ready' | 'preflight' | 'ingesting' | 'complete'>('ready');
  const [preFlightResults, setPreFlightResults] = useState<any>(null);
  const [ingestionResults, setIngestionResults] = useState<{
    results: IngestionResult[];
    summary: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreFlight = async () => {
    setStage('preflight');
    setError(null);

    try {
      const results = await runPreFlightValidation();
      setPreFlightResults(results);

      if (!results.passed) {
        setError(`Pre-flight validation failed for ${results.results.filter(r => !r.readable).length} file(s)`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pre-flight validation failed');
      setStage('ready');
    }
  };

  const handleIngest = async () => {
    if (!preFlightResults?.passed) {
      setError('Pre-flight validation must pass before ingestion');
      return;
    }

    setStage('ingesting');
    setError(null);

    try {
      const results = await ingestPhase2();

      if (results.success) {
        setIngestionResults(results);
        setStage('complete');
        onComplete();
      } else {
        setError(results.message);
        setIngestionResults(results);
        setStage('complete');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingestion failed');
      setStage('ready');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-pro-stone p-6">
        <h2 className="text-xl font-semibold mb-4">Phase 2: Canonical Protocol Ingestion</h2>

        {stage === 'ready' && (
          <div className="space-y-4">
            <div className="bg-pro-cream border border-pro-stone rounded-lg p-4">
              <h3 className="font-semibold text-pro-navy mb-2">Pre-Flight Validation Required</h3>
              <p className="text-sm text-pro-navy">
                Before ingestion, all 14 primary protocol PDFs must pass readability checks.
              </p>
            </div>

            <button
              onClick={handlePreFlight}
              className="px-4 py-2 bg-pro-navy hover:bg-pro-charcoal text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Run Pre-Flight Validation
            </button>
          </div>
        )}

        {stage === 'preflight' && (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-pro-navy" />
            <span className="text-pro-charcoal">Running pre-flight validation on 14 files...</span>
          </div>
        )}

        {preFlightResults && stage !== 'ingesting' && stage !== 'complete' && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 border ${
              preFlightResults.passed
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {preFlightResults.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <h3 className={`font-semibold ${
                  preFlightResults.passed ? 'text-green-900' : 'text-red-900'
                }`}>
                  Pre-Flight Validation {preFlightResults.passed ? 'Passed' : 'Failed'}
                </h3>
              </div>
              <p className={`text-sm ${
                preFlightResults.passed ? 'text-green-800' : 'text-red-800'
              }`}>
                {preFlightResults.results.filter((r: any) => r.readable).length} / {preFlightResults.results.length} files readable
              </p>
            </div>

            {!preFlightResults.passed && (
              <div className="space-y-2">
                <h4 className="font-medium text-pro-charcoal">Failed Files:</h4>
                {preFlightResults.results
                  .filter((r: any) => !r.readable)
                  .map((result: any) => (
                    <div key={result.fileName} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-pro-charcoal">{result.fileName}</div>
                        <div className="text-xs text-red-600">{result.error}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {preFlightResults.passed && (
              <button
                onClick={handleIngest}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Begin Phase 2 Ingestion
              </button>
            )}
          </div>
        )}

        {stage === 'ingesting' && (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-pro-navy" />
            <span className="text-pro-charcoal">Ingesting Phase 2 protocols...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {stage === 'complete' && ingestionResults && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-pro-stone p-6">
            <h2 className="text-xl font-semibold mb-4">Ingestion Summary</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-pro-cream rounded-lg p-4">
                <div className="text-2xl font-bold text-pro-navy">
                  {ingestionResults.summary.totalProtocols}
                </div>
                <div className="text-sm text-pro-charcoal">Protocols Ingested</div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-900">
                  {ingestionResults.summary.protocolsWithMissingSteps}
                </div>
                <div className="text-sm text-yellow-700">Missing Steps</div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-900">
                  {ingestionResults.summary.protocolsWithUnresolvedProducts}
                </div>
                <div className="text-sm text-orange-700">Unresolved Products</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-900">
                  {ingestionResults.summary.totalExceptions}
                </div>
                <div className="text-sm text-purple-700">Total Warnings</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-pro-charcoal">Protocol Details</h3>
              {ingestionResults.results.map((result) => (
                <div
                  key={result.sourceFile}
                  className={`border rounded-lg p-4 ${
                    result.success ? 'border-pro-stone' : 'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium text-pro-charcoal">{result.protocolName}</div>
                        <div className="text-xs text-pro-warm-gray">{result.sourceFile}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.extractionConfidence === 'High' ? 'bg-green-100 text-green-700' :
                      result.extractionConfidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {result.extractionConfidence}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-pro-warm-gray">Steps:</span>
                      <span className="ml-1 font-medium">{result.stepsCreated}</span>
                    </div>
                    <div>
                      <span className="text-pro-warm-gray">Products:</span>
                      <span className="ml-1 font-medium">{result.stepProductLinksCreated}</span>
                    </div>
                    <div>
                      <span className="text-pro-warm-gray">Unresolved:</span>
                      <span className="ml-1 font-medium">{result.unresolvedProducts.length}</span>
                    </div>
                  </div>

                  {result.stepsMissing && (
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <span className="text-yellow-800">Steps missing - protocol created with metadata only</span>
                    </div>
                  )}

                  {result.unresolvedProducts.length > 0 && (
                    <div className="flex items-start gap-2 p-2 bg-orange-50 rounded text-sm mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div className="text-orange-800">
                        <div className="font-medium">Unresolved products:</div>
                        <div className="text-xs">{result.unresolvedProducts.join(', ')}</div>
                      </div>
                    </div>
                  )}

                  {result.warnings.length > 0 && (
                    <div className="space-y-1">
                      {result.warnings.map((warning, idx) => (
                        <div key={idx} className="text-xs text-pro-warm-gray flex items-start gap-1">
                          <span className="text-pro-warm-gray">•</span>
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {result.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {result.errors.map((error, idx) => (
                        <div key={idx} className="text-xs text-red-600 flex items-start gap-1">
                          <span className="text-red-400">✗</span>
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notice</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• PDF text extraction requires server-side processing with a proper PDF parsing library</p>
              <p>• Current implementation creates protocol records with basic metadata only</p>
              <p>• Full step-by-step extraction requires deploying a Supabase Edge Function with PDF.js or similar</p>
              <p>• All protocols have been created and logged in document_ingestion_log</p>
              <p>• Phase 3+ remain locked until Phase 2 is fully complete</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
