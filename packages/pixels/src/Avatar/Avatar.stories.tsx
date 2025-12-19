import type { Meta, StoryObj } from '@storybook/react-vite';
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
  render: (args: AvatarProps) => {
    return (
      <p>
        I am &quot;
        <Avatar {...args} />
        &quot; inline
      </p>
    );
  },
};

export const AllSizes: Story = {
  args: {
    src: avatar,
  },
  render: (args: AvatarProps) => {
    return (
      <div className="flex space-x-4">
        {['sm', 'md', 'lg'].map((size) => {
          return (
            <Avatar key={size} {...args} size={size as AvatarProps['size']} />
          );
        })}
      </div>
    );
  },
};

export const CustomSizes: Story = {
  args: {
    src: avatar,
  },
  render: (args: AvatarProps) => {
    const sizes = [
      { key: 'xs', className: 'h-8 w-8' },
      { key: 'sm', className: 'h-12 w-12' },
      { key: 'md', className: 'h-16 w-16' },
      { key: 'lg', className: 'h-20 w-20' },
      { key: 'xl', className: 'h-24 w-24' },
    ];
    return (
      <div className="flex space-x-4">
        {sizes.map(({ key, className }) => {
          return <Avatar key={key} {...args} className={className} />;
        })}
      </div>
    );
  },
};

export const AllBorderRadii: Story = {
  args: {
    src: undefined,
  },
  render: (args: AvatarProps) => {
    return (
      <div className="flex space-x-4">
        {['none', 'sm', 'md', 'lg', 'full'].map((rounded) => {
          return (
            <Avatar
              key={rounded}
              {...args}
              rounded={rounded as AvatarProps['rounded']}
            />
          );
        })}
      </div>
    );
  },
};

export const WithMenu: Story = {
  args: {
    bordered: true,
    src: avatar,
  },
  render: (args: AvatarProps) => {
    return (
      <Menu
        className="h-10 rounded-full"
        items={[
          {
            key: 'edit-profile',
            label: 'Edit Profile',
          },
          {
            key: 'logout',
            label: 'Logout',
          },
        ]}
      >
        <Avatar {...args} />
      </Menu>
    );
  },
};
