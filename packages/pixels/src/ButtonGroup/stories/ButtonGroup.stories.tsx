import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../Button';
import ButtonGroup from '../ButtonGroup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof ButtonGroup> = {
  title: 'pixels/ButtonGroup',
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

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

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
  parameters: { layout: 'padded' },
};

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

export const GroupDefaults: Story = {
  args: {
    ...Default.args,
    color: 'primary',
    isDisabled: true,
    radius: 'full',
    size: 'lg',
    variant: 'bordered',
  },
};

export const ChildOverrides: Story = {
  args: {
    radius: 'sm',
    size: 'lg',
    children: (
      <>
        <Button color="primary" size="sm" variant="bordered">
          One
        </Button>
        <Button color="primary" radius="full" variant="bordered">
          Two
        </Button>
        <Button color="primary" size="lg" variant="bordered">
          Three
        </Button>
      </>
    ),
  },
};
