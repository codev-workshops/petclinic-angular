module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['react-hooks', 'react-refresh'],
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  rules: {
    'no-unused-vars': 'off',
    'react-refresh/only-export-components': 'warn',
    quotes: 'off',
    '@typescript-eslint/quotes': 'off',
    'no-restricted-imports': [
      'error',
      { patterns: ['src/**', '../src/**', '../../src/**', '../../../src/**'] },
    ],
  },
  overrides: [{ files: ['*.ts', '*.tsx'], parser: '@typescript-eslint/parser' }],
};
