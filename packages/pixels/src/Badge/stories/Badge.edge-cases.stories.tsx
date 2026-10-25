import type { Meta, StoryObj } from '@storybook/react-vite';
import type { BadgeProps } from '../Badge';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';

import { Avatar } from '../../Avatar';
import Badge from '../Badge';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Badge> = {
  title: 'pixels/Badge/Edge Cases',
  decorators: [edgeCaseDecorator],
  component: Badge,
};

export default meta;

type Story = StoryObj<typeof Badge>;

const children = <Avatar src="" />;

// -----------------------------------------------------------------------------
// Edge Cases
// -----------------------------------------------------------------------------

export const NoContent: Story = {
  parameters: {
    edgeCaseDescription:
      'Missing content hides the badge while keeping its child visible.',
  },
  args: {
    children,
  },
  render: (args: BadgeProps) => {
    return (
      <dl>
        <div className="gap-4 pb-8 sm:grid sm:grid-cols-2">
          <dt>with content</dt>
          <dd>
            <Badge {...args} content="42" />
          </dd>
        </div>
        <div className="gap-4 pb-8 sm:grid sm:grid-cols-2">
          <dt>without content</dt>
          <dd>
            <Badge {...args} />
          </dd>
        </div>
      </dl>
    );
  },
};

export const Zero: Story = {
  parameters: {
    edgeCaseDescription: 'Numeric zero remains visible as badge content.',
  },
  args: { children, content: 0 },
};

export const EmptyString: Story = {
  parameters: {
    edgeCaseDescription: 'An empty string does not show an empty badge bubble.',
  },
  args: { children, content: '' },
};
