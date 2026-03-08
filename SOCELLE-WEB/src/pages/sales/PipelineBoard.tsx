import { useState, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  AlertCircle,
  Filter,
  X,
  GripVertical,
  Download,
  Columns3,
} from 'lucide-react';
import { useDeals, type Deal, type NewDeal } from '../../lib/useDeals';
import { usePipelines, type PipelineStage } from '../../lib/usePipelines';
import { exportToCSV } from '../../lib/csvExport';

// ── WO-OVERHAUL-14: Pipeline Kanban Board ────────────────────────────────
// Data source: deals + sales_pipelines + pipeline_stages (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function daysBetween(from: string) {
  return Math.floor((Date.now() - new Date(from).getTime()) / 86400000);
}

export default function PipelineBoard() {
  const { pipelines, loading: pLoading, isLive, error: pError, reload: pReload } = usePipelines();
  const defaultPipeline = pipelines.find((p) => p.is_default) ?? pipelines[0];
  const { deals, loading: dLoading, moveDeal, createDeal, error: dError, reload: dReload } = useDeals(defaultPipeline?.id);
  const loading = pLoading || dLoading;
  const error = pError || dError;

  const [showFilters, setShowFilters] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [showAddDeal, setShowAddDeal] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');
  const dragDealRef = useRef<string | null>(null);

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      if (d.status !== 'open') return false;
      if (ownerFilter && d.owner_id !== ownerFilter) return false;
      if (minValue && d.value < Number(minValue)) return false;
      if (maxValue && d.value > Number(maxValue)) return false;
      return true;
    });
  }, [deals, ownerFilter, minValue, maxValue]);

  const handleExport = () => {
    const exportData = filteredDeals.map((d) => ({
      title: d.title,
      value: d.value,
      status: d.status,
      probability: d.probability,
      contact: d.contact_name ?? '',
      company: d.company_name ?? '',
      expected_close: d.expected_close_date ?? '',
      updated: d.updated_at,
    }));
    exportToCSV(exportData, 'pipeline-deals');
  };

  const handleDrop = useCallback(async (stageId: string) => {
    if (!dragDealRef.current) return;
    try {
      await moveDeal(dragDealRef.current, stageId);
    } catch {
      // silent — reload will fix
    }
    dragDealRef.current = null;
  }, [moveDeal]);

  const handleAddDeal = useCallback(async (stageId: string) => {
    if (!newTitle.trim() || !defaultPipeline) return;
    const nd: NewDeal = {
      pipeline_id: defaultPipeline.id,
      stage_id: stageId,
      title: newTitle.trim(),
      value: Number(newValue) || 0,
    };
    try {
      await createDeal(nd);
      setNewTitle('');
      setNewValue('');
      setShowAddDeal(null);
    } catch {
      // silent
    }
  }, [newTitle, newValue, defaultPipeline, createDeal]);

  if (loading) {
    return (
      <div className="max-w-[100vw] px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-40 bg-graphite/8 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-graphite/5 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="h-9 w-24 bg-graphite/8 rounded-full animate-pulse" />
        </div>
        {/* Kanban skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72 bg-mn-surface/60 rounded-2xl border border-graphite/8">
              <div className="p-4 border-b border-graphite/8">
                <div className="h-4 w-24 bg-graphite/8 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-graphite/5 rounded animate-pulse" />
              </div>
              <div className="p-2 space-y-2">
                {Array.from({ length: 3 - i % 2 }).map((_, j) => (
                  <div key={j} className="bg-white rounded-xl border border-graphite/8 p-3">
                    <div className="h-4 w-32 bg-graphite/8 rounded animate-pulse mb-2" />
                    <div className="h-5 w-20 bg-graphite/5 rounded animate-pulse mb-2" />
                    <div className="h-3 w-24 bg-graphite/5 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[100vw] px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-signal-down mx-auto mb-2" />
          <p className="text-graphite font-medium">Something went wrong</p>
          <p className="text-graphite/60 text-sm mt-1">{error}</p>
          <button onClick={() => { pReload(); dReload(); }} className="mt-3 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const stages: PipelineStage[] = defaultPipeline?.stages ?? [];

  return (
    <div className="max-w-[100vw] px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans font-semibold text-graphite">Pipeline</h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            {defaultPipeline?.name ?? 'No pipeline configured'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent hover:text-accent-hover border border-accent/20 rounded-lg hover:bg-accent-soft transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 h-9 px-4 border border-graphite/15 text-graphite text-sm font-sans rounded-full hover:bg-mn-surface transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-graphite/8 p-4">
          <input
            type="text"
            placeholder="Owner ID"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="h-9 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <input
            type="number"
            placeholder="Min value"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            className="h-9 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white w-28 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <input
            type="number"
            placeholder="Max value"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            className="h-9 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white w-28 focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button onClick={() => { setOwnerFilter(''); setMinValue(''); setMaxValue(''); }} className="text-xs text-accent hover:underline font-sans">
            Clear
          </button>
        </div>
      )}

      {/* Kanban */}
      {stages.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Columns3 className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-graphite mb-2">No pipeline stages configured</h3>
          <p className="text-graphite/60 max-w-md mx-auto mb-6">Set up pipeline stages in Admin to start tracking your deals through the sales process.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
          {stages.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage_id === stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-72 bg-mn-surface/60 rounded-2xl border border-graphite/8"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Column header */}
                <div className="p-4 border-b border-graphite/8">
                  <div className="flex items-center gap-2 mb-1">
                    {stage.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />}
                    <span className="text-sm font-sans font-semibold text-graphite">{stage.name}</span>
                    <span className="ml-auto text-xs font-sans text-graphite/40">{stageDeals.length}</span>
                  </div>
                  <p className="text-xs font-sans text-graphite/50">{formatCurrency(stageValue)}</p>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[100px]">
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onDragStart={() => { dragDealRef.current = deal.id; }} />
                  ))}
                </div>

                {/* Add deal */}
                <div className="p-2 border-t border-graphite/5">
                  {showAddDeal === stage.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Deal title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full h-8 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                        autoFocus
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="w-full h-8 px-3 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddDeal(stage.id)}
                          className="flex-1 h-8 bg-graphite text-white text-xs font-sans font-semibold rounded-lg hover:bg-graphite/90 transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAddDeal(null)}
                          className="h-8 w-8 flex items-center justify-center border border-graphite/15 rounded-lg hover:bg-mn-surface transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-graphite/50" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowAddDeal(stage.id); setNewTitle(''); setNewValue(''); }}
                      className="flex items-center gap-1.5 w-full h-8 px-3 text-xs font-sans text-graphite/50 hover:text-graphite hover:bg-white/60 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add deal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DealCard({ deal, onDragStart }: { deal: Deal; onDragStart: () => void }) {
  const daysInStage = daysBetween(deal.updated_at);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white rounded-xl border border-graphite/8 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-graphite/20 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Link to={`/sales/deals/${deal.id}`} className="text-sm font-sans font-medium text-graphite hover:text-accent transition-colors line-clamp-1">
            {deal.title}
          </Link>
          <p className="text-lg font-sans font-semibold text-graphite mt-0.5">{formatCurrency(deal.value)}</p>
          {deal.contact_name && (
            <p className="text-xs font-sans text-graphite/50 mt-1 truncate">{deal.contact_name}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs font-sans text-graphite/40">
            <span>{deal.probability}% prob</span>
            <span>{daysInStage}d in stage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
