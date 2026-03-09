/**
 * Vitest global setup — runs before every test file.
 * Stubs environment variables and browser APIs that aren't available in jsdom.
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Required for React 19 + @testing-library/react v16 in Vitest/jsdom.
// React 19 moved act() to the react package; react-dom/test-utils production
// build checks React.act which is undefined unless NODE_ENV is development.
// Setting IS_REACT_ACT_ENVIRONMENT enables act() wrapping globally.
(globalThis as unknown as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
// Force development mode so react-dom loads its development build (which exports act)
process.env.NODE_ENV = 'test';

// Stub Vite's import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    DEV: true,
    PROD: false,
    MODE: 'test',
  },
  writable: true,
});

// Stub localStorage (jsdom has it but make reset easy)
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

// Suppress console output in tests (optional — comment out to debug)
vi.spyOn(console, 'debug').mockImplementation(() => undefined);
vi.spyOn(console, 'info').mockImplementation(() => undefined);
