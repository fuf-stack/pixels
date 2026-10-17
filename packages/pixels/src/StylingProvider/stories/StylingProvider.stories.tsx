import type { Meta, StoryObj } from '@storybook/react-vite';

import { useId } from 'react';

import { expect, within } from 'storybook/test';

import { createStyling, tv } from '@fuf-stack/pixel-utils';

import { StylingProvider, useStyling } from '../StylingProvider';

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});
const inputRecipe = tv({
  slots: {
    base: 'flex flex-col gap-1.5',
    input:
      'rounded border border-default-200 bg-content1 p-2 text-sm text-danger',
  },
});

const Example = () => {
  const helpers = useStyling();
  const id = useId();
  const classes = helpers.variantsToClassNames(helpers.resolve(inputRecipe), {
    input: 'text-body',
  });
  return (
    <label className={classes.base} htmlFor={id}>
      Custom font size with danger color
      <input
        className={classes.input}
        defaultValue="Consumer utility"
        id={id}
      />
    </label>
  );
};

const meta: Meta<typeof StylingProvider> = {
  title: 'pixels/StylingProvider',
  component: StylingProvider,
};
export default meta;
type Story = StoryObj<typeof StylingProvider>;

export const ConsumerFontSize: Story = {
  render: () => {
    return (
      <StylingProvider styling={styling}>
        {/* An app must also generate its utility; merge config alone does not. */}
        <style>{'.text-body { font-size: 18px; }'}</style>
        <Example />
      </StylingProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Custom font size with danger color',
    });
    await expect(input).toHaveClass('text-body', 'text-danger');
    await expect(input).not.toHaveClass('text-sm');
  },
};
