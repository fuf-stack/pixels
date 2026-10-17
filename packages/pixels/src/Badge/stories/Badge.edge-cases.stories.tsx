import type { Meta, StoryObj } from '@storybook/react-vite';
import type { BadgeProps } from '../Badge';

import { Avatar } from '../../Avatar';
import Badge from '../Badge';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Badge> = {
  title: 'pixels/Badge/Edge Cases',
  component: Badge,
};

export default meta;

type Story = StoryObj<typeof Badge>;

const children = <Avatar src="" />;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const NoContent: Story = {
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
  args: { children, content: 0 },
};

export const EmptyString: Story = {
  args: { children, content: '' },
};
