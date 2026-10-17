import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TooltipPlacement } from '../Tooltip';

import { UNSAFE_PortalProvider as PortalProvider } from 'react-aria';

import Tooltip, { tooltipVariants } from '../Tooltip';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof Tooltip> = {
  title: 'pixels/Tooltip',
  component: Tooltip,
  // keep portals inside the canvas so each story owns its cleanup
  decorators: [
    (Story, { canvasElement }) => {
      return (
        <PortalProvider
          getContainer={() => {
            return canvasElement;
          }}
        >
          <Story />
        </PortalProvider>
      );
    },
  ],
};

export type Story = StoryObj<typeof Tooltip>;

export const sizes = Object.keys(tooltipVariants.variants.size);

export const tooltipPlacementOptions: TooltipPlacement[] = [
  'top',
  'bottom',
  'left',
  'right',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
  'left-start',
  'left-end',
  'right-start',
  'right-end',
];
