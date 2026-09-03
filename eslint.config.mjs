// Flat config for the React/TypeScript app only. The Angular app keeps using
// .eslintrc.json via `npm run ng:lint`.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'docs/**',
      'e2e-protractor/**',
      'e2e/__screenshots__/**',
      'src/app/**',
      'src/main.ts',
      'src/polyfills.ts',
      'src/test.ts',
      'src/typings.d.ts',
      'src/environments/**',
      'karma.conf.js',
      'protractor.conf.js',
      'playwright-report/**',
      'e2e/.tmp/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Playwright parity suite: fixtures use `use()` callbacks and `{}` dependency lists.
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'no-empty-pattern': 'off',
    },
  },
  {
    files: ['e2e/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
);
