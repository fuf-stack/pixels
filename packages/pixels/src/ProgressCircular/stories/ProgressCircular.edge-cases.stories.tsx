import type { Story } from './ProgressCircular.storySetup';

import { meta as sharedMeta } from './ProgressCircular.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/ProgressCircular/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const ErrorAtCompletion: Story = {
  args: { percent: 100, hasError: true },
};

export const CustomStrokeWidth: Story = {
  args: { percent: 42, strokeWidth: 4 },
};

export const RichValue: Story = {
  args: {
    percent: 42,
    size: 'xl',
    format: (percent) => {
      return <strong>{percent} files</strong>;
    },
  },
};
