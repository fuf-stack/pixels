import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, within } from 'storybook/test';

import Breadcrumb from '../Breadcrumb';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Breadcrumb> = {
  title: 'pixels/Breadcrumb/Interactions',
  component: Breadcrumb,
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardNavigation: Story = {
  args: {
    breadcrumbItems: [
      { children: 'Home' },
      { children: 'Unavailable', disabled: true },
      { children: 'Parent' },
      { children: 'Current' },
    ],
  },
  render: (args) => {
    return (
      <>
        <Breadcrumb {...args} />
        <button type="button">After breadcrumb</button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('link', { name: 'Home' });
    home.focus();

    await expect(home).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Parent' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button')).toHaveFocus();
    await expect(canvas.getByText('Current')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByText('Unavailable')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};
