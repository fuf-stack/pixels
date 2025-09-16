import type { Meta, StoryObj } from '@storybook/react-vite';
import type { BadgeProps } from './Badge';

import { Avatar } from '../Avatar';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'pixels/Badge',
  component: Badge,
};

export default meta;
type Story = StoryObj<typeof Badge>;

const children = <Avatar src="" />;
const content = 42;

export const Default: Story = {
  args: {
    children,
    content,
  },
};

export const IsOneChar: Story = {
  args: {
    isOneChar: true,
    children,
    content: 'X',
  },
};

export const NoOutline: Story = {
  args: {
    children,
    content,
  },
  render: (args: BadgeProps) => {
    return (
      <dl>
        <div className="gap-4 pb-8 sm:grid sm:grid-cols-2">
          <dt>with outline</dt>
          <dd>
            <Badge {...args} />
          </dd>
        </div>
        <div className="gap-4 pb-8 sm:grid sm:grid-cols-2">
          <dt>without outline</dt>
          <dd>
            <Badge {...args} noOutline />
          </dd>
        </div>
      </dl>
    );
  },
};

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

export const AllColors: Story = {
  args: {
    children,
    content,
  },
  render: (args: BadgeProps) => {
    return (
      <dl>
        {[
          'default',
          'primary',
          'secondary',
          'success',
          'warning',
          'danger',
        ].map((color) => {
          return (
            <div key={color} className="gap-4 pb-8 sm:grid sm:grid-cols-2">
              <dt>{color}</dt>
              <dd>
                <Badge
                  key={color}
                  {...args}
                  color={color as BadgeProps['color']}
                />
              </dd>
            </div>
          );
        })}
      </dl>
    );
  },
};

export const AllSizes: Story = {
  args: {
    children,
    content,
  },
  render: (args: BadgeProps) => {
    return (
      <dl>
        {['sm', 'md ', 'lg'].map((size) => {
          return (
            <div key={size} className="gap-4 pb-8 sm:grid sm:grid-cols-2">
              <dt>{size}</dt>
              <dd>
                <Badge {...args} size={size as BadgeProps['size']} />
              </dd>
            </div>
          );
        })}
      </dl>
    );
  },
};

export const AllPlacements: Story = {
  args: {
    children,
    content,
  },
  render: (args: BadgeProps) => {
    return (
      <dl>
        {['top-right', 'top-left', 'bottom-right', 'bottom-left'].map(
          (placement) => {
            return (
              <div
                key={placement}
                className="gap-4 pb-8 sm:grid sm:grid-cols-2"
              >
                <dt>{placement}</dt>
                <dd>
                  <Badge
                    {...args}
                    placement={placement as BadgeProps['placement']}
                  />
                </dd>
              </div>
            );
          },
        )}
      </dl>
    );
  },
};
