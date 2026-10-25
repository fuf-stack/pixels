import type { Preview } from '@repo/storybook-config/preview';

import sharedPreview from '@repo/storybook-config/preview';

const preview: Preview = {
  ...sharedPreview,
  parameters: {
    ...sharedPreview.parameters,
    // Storybook extracts sorting here, it cannot follow the shared preview import
    options: {
      storySort: {
        method: 'configure',
        includeNames: true,
        order: [
          '*',
          ['*', ['Default', '*', 'Composition', 'Interactions', 'Edge Cases']],
        ],
      },
    },
  },
};

export default preview;
