import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';

import AvatarGroup from './AvatarGroup';

import avatar from '../Avatar/sample_image/avatar.png'; // https://pixabay.com/vectors/avatar-icon-placeholder-profile-3814049/

const meta: Meta<typeof AvatarGroup> = {
  title: 'pixels/AvatarGroup',
  component: AvatarGroup,
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {
  args: {
    avatars: [
      {
        src: '',
      },
      {
        src: '',
      },
      {
        src: '',
      },
      {
        src: '',
      },
    ],
  },
};

export const WithImage: Story = {
  args: {
    avatars: [
      {
        src: avatar,
      },
      {
        src: avatar,
      },
      {
        src: avatar,
      },
      {
        src: avatar,
      },
    ],
  },
};

export const Fallback: Story = {
  args: {
    avatars: [
      {
        src: '',
        fallback: 'JD',
      },
      {
        src: avatar,
      },
      {
        src: '',
        fallback: 'UK',
      },
      {
        src: avatar,
      },
    ],
  },
};

export const WithWrapper: Story = {
  args: {
    bordered: true,
    avatarWrapper: 'button',
    avatars: [
      {
        src: avatar,
        wrapperProps: {
          onClick: action('onclick 1'),
        },
      },
      {
        src: avatar,
        wrapperProps: {
          onClick: action('onclick 2'),
        },
      },
      {
        src: avatar,
        wrapperProps: {
          onClick: action('onclick 3'),
        },
      },
      {
        src: avatar,
        wrapperProps: {
          onClick: action('onclick 4'),
        },
      },
    ],
  },
};

export const Bordered: Story = {
  args: {
    bordered: true,
    avatars: [
      {
        src: avatar,
      },
      {
        src: avatar,
      },
      {
        src: avatar,
      },
      {
        src: avatar,
      },
    ],
  },
};

export const OneDisabled: Story = {
  args: {
    avatars: [
      {
        src: avatar,
        disabled: false,
      },
      {
        src: avatar,
        disabled: true,
      },
      {
        src: avatar,
        disabled: false,
      },
      {
        src: avatar,
        disabled: false,
      },
    ],
  },
};

export const AllDisabled: Story = {
  args: {
    disabled: true,
    avatars: [
      {
        src: avatar,
      },
      {
        src: avatar,
      },
      {
        src: avatar,
      },
      {
        src: avatar,
      },
    ],
  },
};
