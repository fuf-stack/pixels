import type { Meta, StoryObj } from '@storybook/react';
import type { LabelProps } from './Label';

import { FaRocket } from 'react-icons/fa6';

import { action } from '@storybook/addon-actions';

import Label from './Label';

const meta: Meta<typeof Label> = {
  title: 'pixels/Label',
  component: Label,
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Some Label',
  },
};

export const IconOnly: Story = {
  args: {
    icon: <FaRocket />,
  },
};

export const IconAndContent: Story = {
  args: {
    icon: <FaRocket />,
    children: 'Some Label',
  },
};

export const EndContent: Story = {
  args: {
    children: 'Some Label',
    endContent: <FaRocket />,
  },
};

export const WithCloseButton: Story = {
  args: {
    children: 'Some Label',
    onClose: action('onClose'),
  },
};

export const AllColors: Story = {
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'bordered', 'light', 'flat', 'faded', 'dot'],
    },
  },
  render: (args) => (
    <>
      {[
        'default',
        'primary',
        'secondary',
        'info',
        'success',
        'warning',
        'danger',
      ].map((color) => (
        <div key={color} style={{ marginTop: '10px' }}>
          <Label {...args} color={color as LabelProps['color']}>
            {color}
          </Label>
        </div>
      ))}
    </>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <>
      {['sm', 'md', 'lg'].map((size) => (
        <div key={size} style={{ marginTop: '10px' }}>
          <Label size={size as LabelProps['size']}>{size}</Label>
        </div>
      ))}
    </>
  ),
};

export const AllRadius: Story = {
  render: () => (
    <>
      {['none', 'sm', 'md', 'lg', 'full'].map((radius) => (
        <div key={radius} style={{ marginTop: '10px' }}>
          <Label radius={radius as LabelProps['radius']}>{radius}</Label>
        </div>
      ))}
    </>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <>
      {['solid', 'bordered', 'light', 'flat', 'faded', 'dot'].map((variant) => (
        <div key={variant} style={{ marginTop: '10px' }}>
          <Label color="success" variant={variant as LabelProps['variant']}>
            {variant}
          </Label>
        </div>
      ))}
    </>
  ),
};
