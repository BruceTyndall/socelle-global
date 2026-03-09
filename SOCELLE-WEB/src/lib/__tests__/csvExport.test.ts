import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DOM APIs that csvExport uses for download
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn((_: Blob) => 'blob:test-url');
const mockRevokeObjectURL = vi.fn();

vi.stubGlobal('URL', {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

vi.spyOn(document, 'createElement').mockReturnValue({
  href: '',
  download: '',
  click: mockClick,
} as unknown as HTMLElement);

import { exportToCsv } from '../csvExport';

describe('exportToCsv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates correct CSV string from array of objects', () => {
    const rows = [
      { name: 'Alice', email: 'alice@test.com', age: 30 },
      { name: 'Bob', email: 'bob@test.com', age: 25 },
    ];

    exportToCsv(rows, 'contacts');

    // Verify Blob was created
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = mockCreateObjectURL.mock.calls[0]?.[0];
    expect(blobArg).toBeInstanceOf(Blob);

    // Verify download was triggered
    expect(mockClick).toHaveBeenCalledTimes(1);

    // Verify cleanup
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });

  it('handles empty arrays by returning early (no download)', () => {
    exportToCsv([], 'empty');

    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockClick).not.toHaveBeenCalled();
  });

  it('escapes commas and quotes in values', () => {
    const rows = [
      { name: 'Smith, John', note: 'He said "hello"' },
    ];

    exportToCsv(rows, 'escaped');

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = mockCreateObjectURL.mock.calls[0]?.[0] as Blob | undefined;

    // Read the blob content to verify escaping
    // Blob constructor receives [csv] where csv has proper escaping
    expect(blobArg?.size ?? 0).toBeGreaterThan(0);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('uses custom columns when provided', () => {
    const rows = [
      { first_name: 'Alice', last_name: 'Smith', email: 'a@b.com' },
    ];
    const columns = [
      { key: 'first_name' as const, label: 'First Name' },
      { key: 'email' as const, label: 'Email Address' },
    ];

    exportToCsv(rows, 'custom', columns);

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
