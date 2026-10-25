/* eslint-disable import-x/no-extraneous-dependencies */

import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';

import react from '@fuf-stack/eslint-config-fuf/react';
import vitest from '@fuf-stack/eslint-config-fuf/vitest';

const gitignorePath = path.resolve('.', '.gitignore');

export default [
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  // Ignore specific files that are tracked by git
  { ignores: ['**/*/CHANGELOG.md', '**/.tsup/**'] },
  // Project configs
  ...react,
  ...vitest,
  // Tooling files deliberately live outside package build tsconfigs. Keep
  // type-aware linting enabled by letting the parser create a default project
  // for this small, explicit set instead of pulling tooling into package builds.
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mjs',
            'lint-staged.config.mjs',
            'prettier.config.mjs',
            'packages/atelier/vitest.config.mts',
            'packages/megapixels/vitest.config.mts',
            'packages/pixels/vitest.config.mts',
            'packages/uniform/vitest.config.mts',
            'packages/veto/vitest.config.mts',
            'packages/config/storybook-config/.storybook/preview.tsx',
            'packages/config/storybook-config/playwright.config.mjs',
            'packages/config/storybook-config/visual/docker.mjs',
            'packages/config/storybook-config/visual/getVisualTestImage.mjs',
            'packages/config/storybook-config/visual/serve.mjs',
            'packages/megapixels/.storybook/main.ts',
            'packages/megapixels/.storybook/preview.tsx',
            'packages/pixels/.storybook/main.ts',
            'packages/pixels/.storybook/preview.tsx',
            'packages/uniform/.storybook/main.ts',
            'packages/uniform/.storybook/preview.tsx',
            'scripts/check-dependency-boundaries.mjs',
            'scripts/check.mjs',
            'scripts/ci-snapshot-autofix.mjs',
            'scripts/ci-snapshot-autofix.test.mjs',
            'scripts/verify-packages.mjs',
          ],
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 20,
        },
      },
    },
  },
  {
    files: [
      'packages/*/vitest.config.mts',
      'packages/*/.storybook/*.{ts,tsx}',
      'packages/config/storybook-config/.storybook/*.{ts,tsx}',
      'scripts/*.mjs',
      'packages/config/storybook-config/playwright.config.mjs',
      'packages/config/storybook-config/visual/*.mjs',
      'packages/config/storybook-config/visual/*.ts',
    ],
    rules: {
      // Storybook/Vitest configuration executes development-only packages.
      'import-x/no-extraneous-dependencies': 'off',
      // Repository CLI scripts target the pinned Node version and favor clear,
      // sequential orchestration over browser-bundle style restrictions.
      'n/no-process-exit': 'off',
      'n/no-sync': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'no-continue': 'off',
      'no-restricted-syntax': 'off',
      'no-use-before-define': 'off',
    },
  },
  {
    files: ['**/stories/*.storySetup.tsx'],
    rules: {
      // shared story fixtures use the same development dependencies as CSF files
      'import-x/no-extraneous-dependencies': 'off',
    },
  },
];
