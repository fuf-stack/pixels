import type { Meta, StoryObj } from '@storybook/react';
import type { AvatarProps } from './Avatar';

import { FaEnvelope } from 'react-icons/fa';

import { Menu } from '../Menu';
import Avatar from './Avatar';

import avatar from './sample_image/avatar.png'; // https://pixabay.com/vectors/avatar-icon-placeholder-profile-3814049/

const meta: Meta<typeof Avatar> = {
  title: 'pixels/Avatar',
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {},
};

export const WithImage: Story = {
  args: {
    src: avatar,
  },
};

export const FallbackIcon: Story = {
  args: {
    fallback: <FaEnvelope />,
  },
};

export const FallbackString: Story = {
  args: {
    fallback: 'JD',
    src: undefined, // broken src -> fallback will be shown
  },
};

export const Bordered: Story = {
  args: {
    bordered: true,
    src: avatar,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    src: avatar,
  },
};

export const Inline: Story = {
  args: {
    src: avatar,
    className: 'inline-block',
  },
  render: (args: AvatarProps) => (
    <p>
      I am &quot;
      <Avatar {...args} />
      &quot; inline
    </p>
  ),
};

export const AllSizes: Story = {
  args: {
    src: avatar,
  },
  render: (args: AvatarProps) => (
    <div className="flex space-x-4">
      {['sm', 'md', 'lg'].map((size) => (
        <Avatar key={size} {...args} size={size as AvatarProps['size']} />
      ))}
    </div>
  ),
};

export const CustomSizes: Story = {
  args: {
    src: avatar,
  },
  render: (args: AvatarProps) => (
    <div className="flex space-x-4">
      <Avatar {...args} className="h-8 w-8" />
      <Avatar {...args} className="h-12 w-12" />
      <Avatar {...args} className="h-16 w-16" />
      <Avatar {...args} className="h-20 w-20" />
      <Avatar {...args} className="h-24 w-24" />
    </div>
  ),
};

export const AllBorderRadii: Story = {
  args: {
    src: undefined,
  },
  render: (args: AvatarProps) => (
    <div className="flex space-x-4">
      {['none', 'sm', 'md', 'lg', 'full'].map((rounded) => (
        <Avatar
          key={rounded}
          {...args}
          rounded={rounded as AvatarProps['rounded']}
        />
      ))}
    </div>
  ),
};

export const WithMenu: Story = {
  args: {
    bordered: true,
    src: avatar,
  },
  render: (args: AvatarProps) => (
    <Menu
      className="h-10 rounded-full"
      items={[
        {
          key: 'edit-profile',
          label: 'Edit Profile',
          onClick: () => {},
        },
        {
          key: 'logout',
          label: 'Logout',
          onClick: () => {},
        },
      ]}
    >
      <Avatar {...args} />
    </Menu>
  ),
};
