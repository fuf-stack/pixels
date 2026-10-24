import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '../../Button';
import Card from '../Card';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Card> = {
  title: 'pixels/Card/Interactions',
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

const onAction = fn();

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardControls: Story = {
  args: { header: 'Project', children: 'Project details' },
  beforeEach: () => {
    onAction.mockClear();
  },
  render: (args) => {
    return (
      <>
        <button type="button">Before card</button>
        <Card
          {...args}
          footer={<Button onClick={onAction}>Open project</Button>}
        />
        <button type="button">After card</button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'Before card' }).focus();

    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Open project' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onAction).toHaveBeenCalledOnce();
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'After card' }),
    ).toHaveFocus();
  },
};
