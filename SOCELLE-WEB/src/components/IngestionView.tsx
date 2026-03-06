import { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Lock,
  Play,
  RotateCcw,
  Eye,
  FileSearch,
  Loader2
} from 'lucide-react';
import {
  getIngestionFiles,
  getIngestionPhases,
  updateFileStatus,
  readabilityCheck,
  ingestPhase1,
  batchIngestProtocols,
  type IngestionFile,
  type IngestionPhase
} from '../lib/ingestionService';
import Phase2IngestionPanel from './Phase2IngestionPanel';

export default function IngestionView() {
  const [files, setFiles] = useState<IngestionFile[]>([]);
  const [phases, setPhases] = useState<IngestionPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [processingPhase, setProcessingPhase] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showPhase2Panel, setShowPhase2Panel] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; fileName: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [filesData, phasesData] = await Promise.all([
        getIngestionFiles(),
        getIngestionPhases()
      ]);
      setFiles(filesData);
      setPhases(phasesData);
    } catch (error) {
      console.error('Failed to load ingestion data:', error);
      setMessage({ type: 'error', text: 'Failed to load ingestion data' });
    } finally {
      setLoading(false);
    }
  };

  const handleReadabilityCheck = async (fileName: string) => {
    setProcessingFile(fileName);
    setMessage(null);

    try {
      const result = await readabilityCheck(fileName);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✓ ${fileName} is readable ${result.pageCount ? `(${result.pageCount} pages)` : ''}`
        });
      } else {
        setMessage({
          type: 'error',
          text: `✗ ${fileName}: ${result.error}`
        });
      }

      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to check readability: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setProcessingFile(null);
    }
  };

  const handleUpdateStatus = async (fileName: string, status: IngestionFile['status']) => {
    try {
      await updateFileStatus(fileName, status);
      setMessage({
        type: 'success',
        text: `Updated ${fileName} to ${status}`
      });
      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleIngestPhase = async (phaseNumber: number) => {
    if (phaseNumber === 2) {
      setShowPhase2Panel(true);
      return;
    }

    if (phaseNumber !== 1) {
      setMessage({
        type: 'error',
        text: `Phase ${phaseNumber} ingestion not yet implemented. Only Phase 1 and Phase 2 are available.`
      });
      return;
    }

    setProcessingPhase(phaseNumber);
    setMessage(null);

    try {
      const result = await ingestPhase1();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✓ ${result.message} (${result.recordsCreated} records)`
        });
      } else {
        setMessage({
          type: 'error',
          text: `✗ ${result.message}: ${result.errors?.join(', ')}`
        });
      }

      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to ingest phase: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setProcessingPhase(null);
    }
  };

  const handlePhase2Complete = () => {
    setShowPhase2Panel(false);
    loadData();
    setMessage({
      type: 'success',
      text: 'Phase 2 ingestion completed. Review the results above.'
    });
  };

  const handleBatchIngestProtocols = async () => {
    setBatchProcessing(true);
    setBatchProgress(null);
    setMessage(null);

    try {
      const result = await batchIngestProtocols((current, total, fileName) => {
        setBatchProgress({ current, total, fileName });
      });

      if (result.success || result.failed === 0) {
        setMessage({
          type: 'success',
          text: `✓ ${result.message}`
        });
      } else {
        setMessage({
          type: 'error',
          text: `✗ ${result.message}. ${result.errors.length} errors occurred.`
        });
      }

      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to batch ingest protocols: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setBatchProcessing(false);
      setBatchProgress(null);
    }
  };

  const filteredFiles = selectedPhase !== null
    ? files.filter(f => f.phase === selectedPhase)
    : files;

  const getStatusIcon = (status: IngestionFile['status']) => {
    switch (status) {
      case 'Ingested':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-pro-navy" />;
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-pro-navy" />;
      case 'Secondary':
        return <AlertCircle className="w-4 h-4 text-pro-warm-gray" />;
      case 'Ignored':
        return <XCircle className="w-4 h-4 text-pro-warm-gray" />;
      case 'Unknown':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: IngestionFile['status']) => {
    switch (status) {
      case 'Ingested':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Pending':
        return 'bg-pro-cream text-pro-charcoal border-pro-stone';
      case 'Approved':
        return 'bg-pro-cream text-pro-charcoal border-pro-stone';
      case 'Secondary':
        return 'bg-pro-ivory text-pro-warm-gray border-pro-stone';
      case 'Ignored':
        return 'bg-pro-ivory text-pro-warm-gray border-pro-stone';
      case 'Unknown':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getPhaseStatusIcon = (status: IngestionPhase['status']) => {
    switch (status) {
      case 'Complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'In Progress':
        return <Loader2 className="w-5 h-5 text-pro-navy animate-spin" />;
      case 'Ready':
        return <Play className="w-5 h-5 text-pro-navy" />;
      case 'Locked':
        return <Lock className="w-5 h-5 text-pro-warm-gray" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pro-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-pro-charcoal">Document Ingestion Control Panel</h1>
        <p className="mt-2 text-pro-warm-gray">
          Manage PDF ingestion with full control over phasing, validation, and data integrity
        </p>
      </div>

      {batchProgress && (
        <div className="p-4 rounded-lg border bg-pro-cream border-pro-stone">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-pro-navy">
              Processing {batchProgress.current} of {batchProgress.total}
            </span>
            <span className="text-xs text-pro-charcoal">
              {Math.round((batchProgress.current / batchProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-pro-stone rounded-full h-2 mb-2">
            <div
              className="bg-pro-navy h-2 rounded-full transition-all"
              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
            />
          </div>
          <div className="text-xs text-pro-charcoal truncate">
            Current: {batchProgress.fileName}
          </div>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-pro-cream border-pro-stone text-pro-navy'
        }`}>
          {message.text}
        </div>
      )}

      {showPhase2Panel && (
        <Phase2IngestionPanel onComplete={handlePhase2Complete} />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-pro-stone p-6">
        <h2 className="text-xl font-semibold mb-4">Ingestion Phases</h2>
        <div className="space-y-3">
          {phases.map(phase => {
            const filesInPhase = files.filter(f => f.phase === phase.phase && f.isPrimary);
            const completedCount = filesInPhase.filter(f => f.status === 'Ingested').length;
            const progress = filesInPhase.length > 0 ? (completedCount / filesInPhase.length) * 100 : 0;

            return (
              <div
                key={phase.phase}
                className="border border-pro-stone rounded-lg p-4 hover:border-pro-stone transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPhaseStatusIcon(phase.status)}
                      <div>
                        <h3 className="font-semibold text-pro-charcoal">
                          Phase {phase.phase}: {phase.name}
                        </h3>
                        <p className="text-sm text-pro-warm-gray">{phase.description}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-pro-warm-gray">Progress</span>
                        <span className="font-medium text-pro-charcoal">
                          {completedCount} / {filesInPhase.length} files
                        </span>
                      </div>
                      <div className="w-full bg-pro-stone rounded-full h-2">
                        <div
                          className="bg-pro-navy h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-pro-warm-gray">
                        <span>Target tables:</span>
                        {phase.targetTables.map(table => (
                          <span key={table} className="px-2 py-1 bg-pro-stone rounded">
                            {table}
                          </span>
                        ))}
                      </div>

                      {phase.dependencies.length > 0 && (
                        <div className="text-xs text-pro-warm-gray">
                          Dependencies: Phase {phase.dependencies.join(', Phase ')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setSelectedPhase(selectedPhase === phase.phase ? null : phase.phase)}
                      className="px-3 py-1.5 text-sm bg-pro-stone hover:bg-pro-stone text-pro-charcoal rounded transition-colors"
                    >
                      {selectedPhase === phase.phase ? 'Show All' : 'Filter Files'}
                    </button>

                    {phase.status === 'Ready' && phase.phase === 2 && (
                      <button
                        onClick={handleBatchIngestProtocols}
                        disabled={batchProcessing}
                        className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {batchProcessing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            Batch Process All
                          </>
                        )}
                      </button>
                    )}

                    {phase.status === 'Ready' && (
                      <button
                        onClick={() => handleIngestPhase(phase.phase)}
                        disabled={processingPhase === phase.phase || batchProcessing}
                        className="px-3 py-1.5 text-sm bg-pro-navy hover:bg-pro-charcoal text-white rounded transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {processingPhase === phase.phase ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Ingesting...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            Ingest Phase
                          </>
                        )}
                      </button>
                    )}

                    {phase.status === 'Complete' && (
                      <button
                        className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Rollback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-pro-stone">
        <div className="p-6 border-b border-pro-stone">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              File Dashboard
              {selectedPhase !== null && (
                <span className="ml-2 text-sm font-normal text-pro-warm-gray">
                  (Showing Phase {selectedPhase} only)
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 text-sm text-pro-warm-gray">
              <span>{filteredFiles.length} files</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pro-ivory border-b border-pro-stone">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                  Phase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-pro-stone">
              {filteredFiles.map(file => (
                <tr key={file.fileName} className="hover:bg-pro-ivory">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-pro-warm-gray" />
                      <span className="text-sm text-pro-charcoal font-medium truncate max-w-md">
                        {file.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-pro-warm-gray">
                      Phase {file.phase}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-pro-warm-gray">
                      {file.ingestionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(file.status)}`}>
                      {getStatusIcon(file.status)}
                      {file.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-pro-stone rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            file.confidence >= 90 ? 'bg-green-600' :
                            file.confidence >= 70 ? 'bg-pro-navy' :
                            file.confidence >= 50 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${file.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-pro-warm-gray">{file.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReadabilityCheck(file.fileName)}
                        disabled={processingFile === file.fileName}
                        className="p-1.5 hover:bg-pro-stone rounded transition-colors disabled:opacity-50"
                        title="Readability Check"
                      >
                        {processingFile === file.fileName ? (
                          <Loader2 className="w-4 h-4 animate-spin text-pro-warm-gray" />
                        ) : (
                          <FileSearch className="w-4 h-4 text-pro-warm-gray" />
                        )}
                      </button>
                      <a
                        href={`/public/${file.fileName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-pro-stone rounded transition-colors"
                        title="View PDF"
                      >
                        <Eye className="w-4 h-4 text-pro-warm-gray" />
                      </a>

                      {file.status === 'Pending' && file.isPrimary && (
                        <button
                          onClick={() => handleUpdateStatus(file.fileName, 'Approved')}
                          className="px-2 py-1 text-xs bg-pro-stone hover:bg-pro-charcoal text-pro-charcoal rounded transition-colors"
                        >
                          Approve
                        </button>
                      )}

                      {file.status !== 'Ingested' && file.status !== 'Ignored' && (
                        <button
                          onClick={() => handleUpdateStatus(file.fileName, 'Ignored')}
                          className="px-2 py-1 text-xs bg-pro-stone hover:bg-pro-stone text-pro-charcoal rounded transition-colors"
                        >
                          Ignore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-pro-cream border border-pro-stone rounded-lg p-4">
        <h3 className="font-semibold text-pro-navy mb-2">Safety Rules Enforced</h3>
        <ul className="text-sm text-pro-navy space-y-1">
          <li>• No fuzzy matching - protocol names must come from document headers</li>
          <li>• Product names must match existing database records exactly</li>
          <li>• Mixing rules and costs are never inferred or estimated</li>
          <li>• All ingestions are transaction-wrapped with rollback capability</li>
          <li>• Phase dependencies are strictly enforced</li>
          <li>• Unknown files require manual classification before ingestion</li>
        </ul>
      </div>
    </div>
  );
}
