import eslintReact from '@eslint-react/eslint-plugin';
import pluginNext from '@next/eslint-plugin-next';
import globals from 'globals';
import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 */
export const nextJsConfig = [
  ...baseConfig,
  eslintReact.configs.recommended,
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
];
