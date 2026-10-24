import type { Story } from './Button.storySetup';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ButtonWithRefFocus, meta as sharedMeta } from './Button.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Button/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const WithRef: Story = {
  render: () => {
    return <ButtonWithRefFocus />;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Click the "Focus Target" button
    const focusTrigger = canvas.getByTestId('focus-trigger');
    await userEvent.click(focusTrigger);

    // Verify the target button is now focused (via ref)
    const focusIndicator = canvas.getByText('Target Button (via ref!)');
    await expect(focusIndicator).toBeInTheDocument();

    // The target button should now be focused - click it
    const targetButton = canvas.getByTestId('focus-target');
    await expect(targetButton).toHaveFocus();
    await userEvent.click(targetButton);
  },
};

export const KeyboardActivation: Story = {
  args: { children: 'Activate', onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Activate' });
    button.focus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('data-focus-visible', 'true');
  },
};

export const RippleCleanup: Story = {
  args: { children: 'Ripple', ripple: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Ripple' }));
    await expect(
      canvasElement.querySelector('[data-slot="ripple"]'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-slot="ripple"]'),
      ).not.toBeInTheDocument();
    });
  },
};
