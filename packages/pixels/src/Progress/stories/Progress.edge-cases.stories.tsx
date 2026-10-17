import type { Story } from './Progress.storySetup';

import { meta as sharedMeta } from './Progress.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Progress/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const RichValue: Story = {
  args: {
    percent: 42,
    showValueLabel: true,
    format: (percent) => {
      return <strong>{percent} files</strong>;
    },
  },
};

export const StaticIndeterminate: Story = {
  args: { percent: 0, indeterminate: true, disableAnimation: true },
};
