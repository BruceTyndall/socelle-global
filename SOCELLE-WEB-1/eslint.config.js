import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      // Deno Edge Functions use Deno runtime + Deno-specific TS syntax.
      // They are not part of the Vite/React browser bundle and must not
      // be linted by the browser TypeScript ESLint config.
      'supabase/functions/**',
      // Scripts are not part of the app bundle
      'scripts/**',
      // Nested git clone — separate repo, not part of this build
      'SOCELLE-WEB/**',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Pre-existing any-type debt — tracked as separate WO, not a CI blocker
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow _prefixed args/vars (intentional unused pattern)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  }
);
