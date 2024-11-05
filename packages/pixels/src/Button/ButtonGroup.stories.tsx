import type { Meta, StoryObj } from '@storybook/react';

import Button from './Button';
import ButtonGroup from './ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'pixels/Button/ButtonGroup',
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </>
    ),
  },
};
