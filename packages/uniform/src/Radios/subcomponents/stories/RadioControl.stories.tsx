import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadioGroup } from 'react-aria-components';

import { expect, userEvent, within } from 'storybook/test';

import { variantsToClassNames } from '@fuf-stack/pixel-utils';

import RadioControl from '../RadioControl';
import radioControlVariants from '../radioControlVariants';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const variants = radioControlVariants();
const classNames = variantsToClassNames(variants);
const invalidVariants = radioControlVariants({ invalid: true });
const invalidClassNames = variantsToClassNames(invalidVariants);

const meta: Meta<typeof RadioControl> = {
  title: 'uniform/Radios/RadioControl',
  component: RadioControl,
  args: {
    children: 'Email',
    className: classNames,
    invalid: false,
    value: 'email',
  },
  render: (args) => {
    return (
      <RadioGroup
        aria-label="Delivery"
        isInvalid={args.invalid}
        validationBehavior="aria"
      >
        <RadioControl {...args} />
      </RadioGroup>
    );
  },
};
export default meta;
type Story = StoryObj<typeof RadioControl>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio', { name: 'Email' });
    await userEvent.click(radio);
    await expect(radio).toBeChecked();
  },
};

export const WithDescription: Story = {
  args: { description: 'Sent to your inbox' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole('radio', { name: 'Email' });

    await expect(radio).toHaveAccessibleDescription('Sent to your inbox');
    await userEvent.click(canvas.getByText('Sent to your inbox'));
    await expect(radio).toBeChecked();
  },
};

export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = {
  args: { className: invalidClassNames, invalid: true },
};

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

export const WithIcon: Story = { args: { icon: <span aria-hidden>✉</span> } };
