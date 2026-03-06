/**
 * Lightweight CSV export utility — no external dependencies.
 */

function escapeCell(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  // Wrap in quotes if the value contains a comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(
  rows: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[]
): void {
  if (rows.length === 0) return;

  const cols = columns || Object.keys(rows[0]).map(k => ({ key: k, label: k }));

  const header = cols.map(c => escapeCell(c.label)).join(',');
  const body = rows
    .map(row => cols.map(c => escapeCell(row[c.key])).join(','))
    .join('\n');

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
