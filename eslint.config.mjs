import antfu from '@antfu/eslint-config'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const eslintrcImport = require('./.eslintrc-auto-import.json')

export default antfu(
  {
    // Disable problematic rules that cause circular fixes
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    stylistic: false, // Disable all stylistic rules to avoid conflicts
    rules: {
      'curly': 'off',
      'style/semi': 'off',
      '@/semi': 'off',
      'style/indent-binary-ops': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'vue/html-indent': 'off',
      'vue/prefer-separate-static-class': 'off',
      // Keep only essential rules
      '@/no-use-before-define': ['error', { allowNamedExports: true, functions: false }],
      'vue/no-empty-component-block': ['error'],
      'symbol-description': 'off',
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: '@vueuse/core',
            importNames: ['useClipboard'],
            message: 'Please use local useCopy from src/composable/copy.ts instead of useClipboard.',
          },
          {
            name: 'lodash-es',
            importNames: ['chain'],
            message: 'Do not use chain() from lodash-es. Use direct function calls instead to avoid production build issues.',
          }
        ],
      }],
    },
  },
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: { ...eslintrcImport }
  },
)
