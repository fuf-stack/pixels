import type { Story } from './Tabs.storySetup';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import { meta as sharedMeta } from './Tabs.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Tabs/Edge Cases',
  decorators: [...[sharedMeta.decorators ?? []].flat(), edgeCaseDecorator],
};

export default meta;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const DisabledTabs: Story = {
  parameters: { edgeCaseDescription: 'Disabled tabs cannot be selected.' },
  args: {
    ariaLabel: 'Tabs with disabled items',
    tabs: [
      {
        key: 'monday',
        label: 'Monday',
        content:
          'The day everyone pretends their weekend emails got lost in spam.',
      },
      {
        key: 'weekend',
        label: 'Weekend',
        content: 'Error 404: Weekend not found',
        disabled: true,
      },
      {
        key: 'meeting',
        label: 'Meeting',
        content: 'This could have been an email',
      },
      {
        key: 'vacation',
        label: 'Vacation',
        content: 'Nice try! Get back to work!',
        disabled: true,
      },
    ],
  },
};

export const Empty: Story = {
  parameters: {
    edgeCaseDescription: 'An empty tab list renders without panels.',
  },
  args: { ariaLabel: 'Empty sections', tabs: [] },
};

export const NumericKeys: Story = {
  parameters: {
    edgeCaseDescription:
      'Numeric tab keys preserve selection and panel associations.',
  },
  args: {
    ariaLabel: 'Numeric sections',
    defaultSelectedKey: 2,
    tabs: [
      { key: 1, label: 'One', content: 'First' },
      { key: 2, label: 'Two', content: 'Second' },
    ],
  },
};

export const RetainedPanels: Story = {
  parameters: {
    edgeCaseDescription:
      'Inactive panels retain their mounted content when configured to stay mounted.',
  },
  args: {
    ariaLabel: 'Retained sections',
    destroyInactiveTabPanel: false,
    tabs: [
      {
        key: 'draft',
        label: 'Draft',
        content: <input aria-label="Draft text" defaultValue="Keep me" />,
      },
      { key: 'preview', label: 'Preview', content: 'Preview content' },
    ],
  },
};
