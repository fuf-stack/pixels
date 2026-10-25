import type { Story } from './Accordion.storySetup';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import { accordionItems, meta as sharedMeta } from './Accordion.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Accordion/Edge Cases',
  decorators: [...[sharedMeta.decorators ?? []].flat(), edgeCaseDecorator],
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const AllDisabled: Story = {
  parameters: { edgeCaseDescription: 'Disabled sections cannot be expanded.' },
  args: {
    disabled: true,
    accordionItems,
  },
};
export const SomeDisabled: Story = {
  parameters: {
    edgeCaseDescription:
      'Enabled sections remain interactive alongside disabled sections.',
  },
  args: {
    disabledKeys: ['1'],
    accordionItems: [
      { title: '1.', children: <div>First item</div>, disabled: true },
      { title: '2.', children: <div>Second item</div> },
      { title: '3.', children: <div>Third item</div> },
    ],
  },
};

export const Empty: Story = {
  parameters: {
    edgeCaseDescription:
      'An empty item list renders without expandable sections.',
  },
  args: { accordionItems: [] },
};

export const HiddenIndicator: Story = {
  parameters: {
    edgeCaseDescription:
      'Sections remain interactive when their indicators are hidden.',
  },
  args: { accordionItems, hideIndicator: true },
};
