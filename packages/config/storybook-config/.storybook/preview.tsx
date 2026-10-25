import type { Preview } from '../preview';

import sharedPreview from '../preview';

// load tailwind css
import '@repo/tailwind-config/tailwind.css';

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
