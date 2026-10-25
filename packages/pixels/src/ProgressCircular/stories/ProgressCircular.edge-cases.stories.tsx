import type { Story } from './ProgressCircular.storySetup';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import { meta as sharedMeta } from './ProgressCircular.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/ProgressCircular/Edge Cases',
  decorators: [...[sharedMeta.decorators ?? []].flat(), edgeCaseDecorator],
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const ErrorAtCompletion: Story = {
  parameters: {
    edgeCaseDescription:
      'An error remains visible even when progress reaches completion.',
  },
  args: { percent: 100, hasError: true },
};

export const CustomStrokeWidth: Story = {
  parameters: {
    edgeCaseDescription:
      'A custom stroke width preserves the progress ring layout.',
  },
  args: { percent: 42, strokeWidth: 4 },
};

export const RichValue: Story = {
  parameters: {
    edgeCaseDescription: 'Rich value content renders inside the progress ring.',
  },
  args: {
    percent: 42,
    size: 'xl',
    format: (percent) => {
      return <strong>{percent} files</strong>;
    },
  },
};
