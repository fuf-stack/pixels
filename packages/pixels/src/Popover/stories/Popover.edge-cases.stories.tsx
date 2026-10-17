import type { Story } from './Popover.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import Popover from '../Popover';
import { Default } from './Popover.stories';
import { meta as sharedMeta } from './Popover.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/Popover/Edge Cases',
};

export default meta;

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

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
