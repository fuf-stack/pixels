import type { Meta, StoryObj } from '@storybook/react-vite';

import FieldCopyTestIdButton from '../FieldCopyTestIdButton';

const meta: Meta<typeof FieldCopyTestIdButton> = {
  title: 'uniform/partials/FieldCopyTestIdButton',
  component: FieldCopyTestIdButton,
};

export default meta;
type Story = StoryObj<typeof FieldCopyTestIdButton>;

// TODO: Some weird glitching behavior in storybook.
export const Default: Story = {
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="field-copy-test-id-button"]' },
  },
  args: {
    testId: 'testId',
  },
};
