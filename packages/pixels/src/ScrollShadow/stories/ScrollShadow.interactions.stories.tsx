import type { Story } from './ScrollShadow.storySetup';

import { expect, fireEvent, waitFor, within } from 'storybook/test';

import { Vertical } from './ScrollShadow.stories';
import { meta as sharedMeta } from './ScrollShadow.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = {
  ...sharedMeta,
  title: 'pixels/ScrollShadow/Interactions',
};

export default meta;

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const ScrollEdges: Story = {
  ...Vertical,
  args: { ...Vertical.args, testId: 'scroll-edges' },
  play: async ({ canvasElement }) => {
    const surface = within(canvasElement).getByTestId('scroll-edges');
    // layout measurements are unavailable in DOM-only snapshots
    if (!surface.clientHeight) {
      return;
    }

    await waitFor(async () => {
      await expect(surface).toHaveAttribute('data-bottom-scroll', 'true');
    });

    surface.scrollTop = 100;
    fireEvent.scroll(surface);
    await expect(surface).toHaveAttribute('data-top-bottom-scroll', 'true');

    surface.scrollTop = surface.scrollHeight;
    fireEvent.scroll(surface);
    await expect(surface).toHaveAttribute('data-bottom-scroll', 'false');
    await expect(surface).toHaveAttribute('data-top-scroll', 'true');
  },
};
