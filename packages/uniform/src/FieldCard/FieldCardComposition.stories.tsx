import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import type FieldCard from './FieldCard';
import meta, { Default } from './FieldCard.stories';

export default {
  ...meta,
  title: 'uniform/FieldCard/Composition',
} satisfies Meta<typeof FieldCard>;

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['heading'] }] } },
});

export const ConsumerHeading: StoryObj<typeof FieldCard> = {
  ...Default,
  args: {
    ...Default.args,
    className: { label: 'text-heading' },
  },
  decorators: [
    (Story) => (
      <StylingProvider styling={styling}>
        <style>{'.text-heading { font-size: 18px; }'}</style>
        <Story />
      </StylingProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Pizza Delivery Address' });
    const heading = within(group).getByRole('heading', { level: 3 });
    await expect(heading).toHaveClass('text-heading');
    await expect(heading).not.toHaveClass('text-base');
    await expect(getComputedStyle(heading).fontSize).toBe('18px');
    await expect(heading).toHaveAccessibleName('Pizza Delivery Address');
  },
};
