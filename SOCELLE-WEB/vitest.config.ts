import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure import.meta.env.DEV is true in test environment so logger debug/info paths fire
    'import.meta.env.DEV': JSON.stringify(true),
    'import.meta.env.PROD': JSON.stringify(false),
    'import.meta.env.MODE': JSON.stringify('test'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', 'e2e'],
    // Mock Vite's import.meta.env for tests
    setupFiles: ['./src/test/setup.ts'],
  },
});
