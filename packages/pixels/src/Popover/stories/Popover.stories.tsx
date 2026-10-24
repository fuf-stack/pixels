import type { Story } from './Popover.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import Popover from '../Popover';
import {
  ControlledPopover,
  PortalPopover,
  meta as sharedMeta,
} from './Popover.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'pixels/Popover' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    children: 'i am the trigger',
    content: 'i am the content',
  },
};

export const Title: Story = {
  args: {
    header: 'i am the title',
    children: 'i am the trigger',
    content: 'i am the content',
  },
};

export const Footer: Story = {
  args: {
    footer: 'i am the footer',
    children: 'i am the trigger',
    content: 'i am the content',
  },
};

export const WithCustomTriggerButton: Story = {
  args: {
    content: 'i am the content',
    triggerButtonProps: {
      color: 'success',
      variant: 'shadow',
    },
    children: 'i am a custom trigger',
  },
};

export const AllSections: Story = {
  args: {
    header: 'i am the title',
    footer: 'i am the footer',
    children: 'i am the trigger',
    content: 'i am the content',
  },
};

export const Placements: Story = {
  render: () => {
    const placements = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ] as const;

    return (
      <div className="grid grid-cols-3 gap-12">
        {placements.map((placement) => {
          return (
            <Popover key={placement} content="Details" placement={placement}>
              {placement}
            </Popover>
          );
        })}
      </div>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    return <ControlledPopover />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Open controlled' });
    await userEvent.click(trigger);
    await expect(
      body.getByRole('dialog', { name: 'Controlled dialog' }),
    ).toBeInTheDocument();
    await userEvent.click(body.getByRole('button', { name: 'Done' }));
    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  },
};

export const CustomStyling: Story = {
  args: {
    ...AllSections.args,
    className: {
      body: 'py-4',
      content: 'w-72 rounded-large bg-primary-50',
      header: 'text-primary',
      trigger: 'font-semibold text-primary',
    },
  },
};

export const CustomPortal: Story = {
  render: () => {
    return <PortalPopover />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open portal' }));
    await expect(
      within(canvas.getByTestId('portal-container')).getByRole('dialog'),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        within(document.body).queryByRole('dialog'),
      ).not.toBeInTheDocument();
    });
  },
};
