import type { Story } from './Progress.storySetup';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import { meta as sharedMeta } from './Progress.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Progress/Edge Cases',
  decorators: [...[sharedMeta.decorators ?? []].flat(), edgeCaseDecorator],
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const RichValue: Story = {
  parameters: {
    edgeCaseDescription:
      'Rich value content renders alongside the progress bar.',
  },
  args: {
    percent: 42,
    showValueLabel: true,
    format: (percent) => {
      return <strong>{percent} files</strong>;
    },
  },
};

export const StaticIndeterminate: Story = {
  parameters: {
    edgeCaseDescription:
      'Indeterminate progress remains visible with animation disabled.',
  },
  args: { percent: 0, indeterminate: true, disableAnimation: true },
};
