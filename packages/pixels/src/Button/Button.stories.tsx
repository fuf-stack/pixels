import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps } from './Button';

import { FaEnvelope } from 'react-icons/fa';

import { action } from 'storybook/actions';

import Button, { buttonVariants } from './Button';

const meta: Meta<typeof Button> = {
  title: 'pixels/Button',
  component: Button,
  args: {
    onClick: action('onClick'),
  },
  argTypes: {
    color: {
      control: { type: 'radio' },
      options: Object.keys(buttonVariants.variants.color),
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

const colors = [...Object.keys(buttonVariants.variants.color)];
const variants = [...Object.keys(buttonVariants.variants.variant)];
const sizes = [...Object.keys(buttonVariants.variants.size)];

export const Default: Story = {
  args: {},
};

export const Basic: Story = {
  args: {
    children: 'Button',
    testId: 'some-test-id',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Button',
    disabled: true,
  },
};

export const IconOnly: Story = {
  args: {
    icon: <FaEnvelope />,
    children: undefined,
  },
};

export const Loading: Story = {
  args: {
    children: 'Button',
    loading: true,
  },
};

export const Ripple: Story = {
  args: {
    children: 'Ripple',
    ripple: true,
  },
};

export const DisabledAnimation: Story = {
  args: {
    children: 'Button',
    disableAnimation: true,
  },
};

export const AllColors: Story = {
  render: () => (
    <>
      {colors.map((color) => (
        <div key={color} style={{ marginTop: '10px' }}>
          <Button color={color as ButtonProps['color']}>{color}</Button>
        </div>
      ))}
    </>
  ),
};

export const AllRadius: Story = {
  render: (args) => (
    <>
      {['sm', 'md', 'lg', 'none', 'full'].map((radius) => (
        <div key={radius} style={{ marginTop: '10px' }}>
          <Button radius={radius as ButtonProps['radius']} {...args}>
            {radius}
          </Button>
        </div>
      ))}
    </>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <>
      {sizes.map((size) => (
        <div key={size} style={{ marginTop: '10px' }}>
          <Button size={size as ButtonProps['size']} {...args}>
            {size}
          </Button>
        </div>
      ))}
    </>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <>
      {variants.map((variant) => (
        <div key={variant} style={{ marginTop: '10px' }}>
          <Button variant={variant as ButtonProps['variant']} {...args}>
            {variant}
          </Button>
        </div>
      ))}
    </>
  ),
};
