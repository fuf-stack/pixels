import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import Popover from './Popover';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Popover> = {
  title: 'pixels/Popover',
  component: Popover,
};

export default meta;
type Story = StoryObj<typeof Popover>;

// -----------------------------------------------------------------------------
// Normal stories
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

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

const ControlledPopover = () => {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      content={
        <button
          onClick={() => {
            setOpen(false);
          }}
          type="button"
        >
          Done
        </button>
      }
      header="Controlled dialog"
      openControlled={{ open, setOpen }}
    >
      Open controlled
    </Popover>
  );
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

const PortalPopover = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div>
      <div ref={setContainer} data-testid="portal-container" />
      <Popover
        content="Portalled details"
        portalContainer={container ?? undefined}
      >
        Open portal
      </Popover>
    </div>
  );
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

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

export const KeyboardInteraction: Story = {
  args: {
    children: 'Open details',
    header: 'Details',
    content: <input aria-label="Note" />,
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open details',
    });
    const body = within(document.body);
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(body.getByRole('dialog', { name: 'Details' })).toHaveFocus();
    await userEvent.tab();
    await expect(body.getByRole('textbox', { name: 'Note' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  },
};

export const DisabledTrigger: Story = {
  args: {
    ...Default.args,
    triggerButtonProps: { disabled: true, color: 'primary' },
  },
};

export const TooMuchContent: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'i am the trigger' }),
    );
    const dialog = within(document.body).getByRole('dialog');
    const body = dialog.querySelector('[data-slot="body"]');
    if (body) {
      body.scrollTop = 100;
      body.dispatchEvent(new Event('scroll'));
    }
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
  },
  args: {
    children: 'i am the trigger',
    placement: 'right',
    content: (
      <>
        {/* eslint-disable-next-line prefer-spread */}
        {Array.apply(null, Array(100)).map((_, i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i}>
              too much content
              <br />
            </div>
          );
        })}
      </>
    ),
    testId: 'testId42',
  },
};

export const DoubleScrollbar: Story = {
  args: {
    children: 'i am the trigger',
    placement: 'right',
    content: (
      <>
        {/* eslint-disable-next-line prefer-spread */}
        {Array.apply(null, Array(100)).map((_, i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i}>too much content</div>
          );
        })}
      </>
    ),
    footer: 'i am the footer',
    testId: 'testId42',
    header: 'i am the title',
  },
  render: (args) => {
    return (
      <div className="h-[2000px]">
        <Popover {...args} />
      </div>
    );
  },
};

export const BlockOuterScrollbar: Story = {
  args: {
    children: 'i am the trigger',
    content: (
      <>
        {/* eslint-disable-next-line prefer-spread */}
        {Array.apply(null, Array(100)).map((_, i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i}>too much content</div>
          );
        })}
      </>
    ),
    footer: 'i am the footer',
    placement: 'right',
    shouldBlockScroll: true,
    testId: 'testId42',
    header: 'i am the title',
  },
  render: (args) => {
    return (
      <div className="h-[2000px]">
        <Popover {...args} />
      </div>
    );
  },
};
