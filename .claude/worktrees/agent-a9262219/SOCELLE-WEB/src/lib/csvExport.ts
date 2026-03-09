// ── CSV Export Utility ───────────────────────────────────────────────────
// Converts an array of objects to a CSV string and triggers download.
// Used across CRM Hub for contacts, companies, tasks, segments (V2-HUBS-06).

export function exportToCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  if (rows.length === 0) return;

  const cols = columns ?? Object.keys(rows[0]).map(key => ({ key: key as keyof T, label: key as string }));

  const escapeCell = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = Array.isArray(value) ? value.join('; ') : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = cols.map(c => escapeCell(c.label)).join(',');
  const body = rows.map(row =>
    cols.map(c => escapeCell(row[c.key])).join(',')
  ).join('\n');

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
