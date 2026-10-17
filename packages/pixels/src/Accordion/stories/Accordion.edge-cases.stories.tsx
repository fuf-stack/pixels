import type { Story } from './Accordion.storySetup';

import { accordionItems, meta as sharedMeta } from './Accordion.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Accordion/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const AllDisabled: Story = {
  args: {
    disabled: true,
    accordionItems,
  },
};
export const SomeDisabled: Story = {
  args: {
    disabledKeys: ['1'],
    accordionItems: [
      { title: '1.', children: <div>First item</div>, disabled: true },
      { title: '2.', children: <div>Second item</div> },
      { title: '3.', children: <div>Third item</div> },
    ],
  },
};

export const Empty: Story = { args: { accordionItems: [] } };

export const HiddenIndicator: Story = {
  args: { accordionItems, hideIndicator: true },
};
