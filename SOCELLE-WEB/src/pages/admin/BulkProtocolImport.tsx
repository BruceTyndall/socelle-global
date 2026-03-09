import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Download, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImportRow {
  protocol_name: string;
  category?: string;
  duration_minutes?: number | null;
  description?: string | null;
  target_concerns?: string[];
  allowed_products?: string[];
  completion_status?: string;
}

interface ImportResult {
  row: number;
  protocol_name: string;
  status: 'inserted' | 'updated' | 'skipped' | 'error';
  message?: string;
}

interface Brand {
  id: string;
  name: string;
}

const CSV_TEMPLATE = `protocol_name,category,duration_minutes,description,target_concerns,allowed_products,completion_status
Signature Facial,Facial,60,"A rejuvenating facial treatment","hydration,aging","Herbal Hydra Masque,Peptide Serum",name_only
Deep Tissue Massage,Body,90,"Releases chronic muscle tension","muscle tension,stress","Arnica Oil,Deep Relief Balm",steps_complete
`;

function parseCSV(csvText: string): ImportRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    // Handle quoted fields with commas inside
    const fields: string[] = [];
    let inQuotes = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());

    const row: Record<string, any> = {};
    headers.forEach((h, i) => {
      row[h] = fields[i] || '';
    });

    return {
      protocol_name: row['protocol_name'] || '',
      category: row['category'] || null,
      duration_minutes: row['duration_minutes'] ? parseInt(row['duration_minutes']) : null,
      description: row['description'] || null,
      target_concerns: row['target_concerns']
        ? row['target_concerns'].split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      allowed_products: row['allowed_products']
        ? row['allowed_products'].split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      completion_status: row['completion_status'] || 'name_only',
    };
  }).filter(r => r.protocol_name);
}

export default function BulkProtocolImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoaded, setBrandsLoaded] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [mode, setMode] = useState<'upsert' | 'insert_new'>('upsert');

  const loadBrands = async () => {
    if (brandsLoaded) return;
    const { data } = await supabase.from('brands').select('id, name').order('name');
    setBrands(data || []);
    setBrandsLoaded(true);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResults([]);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
  };

  const handleImport = async () => {
    if (!selectedBrandId || preview.length === 0) return;
    setImporting(true);
    setResults([]);

    const importResults: ImportResult[] = [];

    for (let i = 0; i < preview.length; i++) {
      const row = preview[i];
      try {
        if (mode === 'upsert') {
          const { error } = await supabase.from('canonical_protocols').upsert(
            {
              brand_id: selectedBrandId,
              protocol_name: row.protocol_name,
              category: row.category || null,
              duration_minutes: row.duration_minutes || null,
              description: row.description || null,
              target_concerns: row.target_concerns || [],
              allowed_products: row.allowed_products || [],
              completion_status: row.completion_status || 'name_only',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'brand_id,protocol_name' }
          );

          if (error) {
            importResults.push({ row: i + 2, protocol_name: row.protocol_name, status: 'error', message: error.message });
          } else {
            importResults.push({ row: i + 2, protocol_name: row.protocol_name, status: 'inserted' });
          }
        } else {
          // insert_new: skip if exists
          const { data: existing } = await supabase
            .from('canonical_protocols')
            .select('id')
            .eq('brand_id', selectedBrandId)
            .eq('protocol_name', row.protocol_name)
            .maybeSingle();

          if (existing) {
            importResults.push({ row: i + 2, protocol_name: row.protocol_name, status: 'skipped', message: 'Already exists' });
            continue;
          }

          const { error } = await supabase.from('canonical_protocols').insert({
            brand_id: selectedBrandId,
            protocol_name: row.protocol_name,
            category: row.category || null,
            duration_minutes: row.duration_minutes || null,
            description: row.description || null,
            target_concerns: row.target_concerns || [],
            allowed_products: row.allowed_products || [],
            completion_status: row.completion_status || 'name_only',
          });

          if (error) {
            importResults.push({ row: i + 2, protocol_name: row.protocol_name, status: 'error', message: error.message });
          } else {
            importResults.push({ row: i + 2, protocol_name: row.protocol_name, status: 'inserted' });
          }
        }
      } catch (err: any) {
        importResults.push({ row: i + 2, protocol_name: row.protocol_name, status: 'error', message: err.message });
      }
    }

    setResults(importResults);
    setImporting(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'protocol_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const inserted = results.filter(r => r.status === 'inserted').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/admin/brands"
          className="inline-flex items-center gap-2 text-sm text-graphite/60 hover:text-graphite mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Brands
        </Link>
        <h1 className="text-2xl font-bold text-graphite">Bulk Protocol Import</h1>
        <p className="text-graphite/60 mt-1 text-sm">
          Import multiple protocols at once via CSV. Download the template to get started.
        </p>
      </div>

      {/* Template download */}
      <div className="flex items-center justify-between bg-accent-soft border border-accent-soft rounded-lg p-4">
        <div>
          <p className="text-sm font-medium text-graphite">CSV Template</p>
          <p className="text-xs text-graphite mt-0.5">
            Columns: protocol_name, category, duration_minutes, description, target_concerns (comma-separated), allowed_products (comma-separated), completion_status
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-accent-soft text-graphite rounded-lg text-sm font-medium hover:bg-accent-soft transition-colors flex-shrink-0 ml-4"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Brand selector */}
      <div>
        <label className="block text-sm font-medium text-graphite mb-1">Target Brand</label>
        <select
          value={selectedBrandId}
          onFocus={loadBrands}
          onChange={e => setSelectedBrandId(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-accent-soft rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-graphite bg-white"
        >
          <option value="">Select a brand...</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Import mode */}
      <div>
        <label className="block text-sm font-medium text-graphite mb-2">Import Mode</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="upsert"
              checked={mode === 'upsert'}
              onChange={() => setMode('upsert')}
              className="text-graphite"
            />
            <span className="text-sm text-graphite">Upsert (insert or update existing)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="insert_new"
              checked={mode === 'insert_new'}
              onChange={() => setMode('insert_new')}
              className="text-graphite"
            />
            <span className="text-sm text-graphite">Insert new only (skip duplicates)</span>
          </label>
        </div>
      </div>

      {/* File drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-accent-soft rounded-lg p-8 text-center hover:border-accent-soft transition-colors"
      >
        {fileName ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-graphite">{fileName}</span>
            <button
              onClick={() => { setFileName(''); setPreview([]); setResults([]); }}
              className="text-graphite/60 hover:text-graphite/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-graphite/60 mx-auto mb-3" />
            <p className="text-sm text-graphite/60 mb-2">Drag and drop a CSV file, or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-graphite text-white text-sm font-medium rounded-lg hover:bg-graphite transition-colors"
            >
              Browse Files
            </button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
          <div className="px-5 py-3 border-b border-accent-soft flex items-center justify-between">
            <p className="text-sm font-medium text-graphite">
              Preview — {preview.length} protocol{preview.length !== 1 ? 's' : ''} found
            </p>
            <button
              onClick={handleImport}
              disabled={!selectedBrandId || importing}
              className="flex items-center gap-2 px-4 py-2 bg-graphite text-white text-sm font-medium rounded-lg hover:bg-graphite disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {importing ? 'Importing...' : `Import ${preview.length} Protocols`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-accent-soft">
                <tr>
                  {['Protocol Name', 'Category', 'Duration', 'Completion Status', 'Concerns', 'Products'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-graphite/60 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-soft">
                {preview.slice(0, 20).map((row, i) => (
                  <tr key={i} className="hover:bg-background">
                    <td className="px-4 py-2 font-medium text-graphite">{row.protocol_name}</td>
                    <td className="px-4 py-2 text-graphite/60">{row.category || '—'}</td>
                    <td className="px-4 py-2 text-graphite/60">{row.duration_minutes ? `${row.duration_minutes}m` : '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        row.completion_status === 'fully_complete' ? 'bg-green-100 text-green-700' :
                        row.completion_status === 'steps_complete' ? 'bg-accent-soft text-graphite' :
                        'bg-accent-soft text-graphite/60'
                      }`}>
                        {row.completion_status || 'name_only'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-graphite/60 max-w-[160px] truncate">
                      {row.target_concerns?.join(', ') || '—'}
                    </td>
                    <td className="px-4 py-2 text-graphite/60 max-w-[160px] truncate">
                      {row.allowed_products?.join(', ') || '—'}
                    </td>
                  </tr>
                ))}
                {preview.length > 20 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-sm text-graphite/60 text-center">
                      + {preview.length - 20} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
          <div className="px-5 py-4 border-b border-accent-soft flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{inserted} imported</span>
            </div>
            {skipped > 0 && (
              <div className="flex items-center gap-2 text-yellow-700">
                <span className="text-sm font-medium">{skipped} skipped</span>
              </div>
            )}
            {errors > 0 && (
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{errors} errors</span>
              </div>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-accent-soft">
            {results.filter(r => r.status !== 'inserted').map((result, i) => (
              <div key={i} className="px-5 py-2.5 flex items-center gap-3">
                {result.status === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                ) : (
                  <span className="w-4 h-4 text-yellow-500 text-xs font-bold flex-shrink-0">~</span>
                )}
                <span className="text-sm font-medium text-graphite">Row {result.row}: {result.protocol_name}</span>
                {result.message && (
                  <span className="text-xs text-graphite/60 ml-auto">{result.message}</span>
                )}
              </div>
            ))}
            {results.filter(r => r.status !== 'inserted').length === 0 && (
              <div className="px-5 py-4 text-center text-sm text-green-700 font-medium">
                All protocols imported successfully!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
