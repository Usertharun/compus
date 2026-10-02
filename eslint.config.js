import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['**/dist/**', '**/node_modules/**', '**/generated/**', '**/coverage/**', 'output/**']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['server/**/*.ts', 'tests/**/*.ts', '*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  {
    // Prisma test doubles deliberately implement only the methods exercised by a test.
    files: ['server/test/**/*.ts', 'server/scratch/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    // Context hooks and reusable UI variant helpers share modules with their components.
    files: ['src/context/*.tsx', 'src/components/ui/*.tsx', 'src/components/common/BottomNavigation.tsx', 'src/pages/Communities/index.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  { files: ['scripts/**/*.mjs', 'server/scripts/**/*.cjs', 'server/test/load-test.js'], languageOptions: { globals: globals.node } },
])
