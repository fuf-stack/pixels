import type { Meta, StoryObj } from '@storybook/react-vite';
import type RadioTabs from './RadioTabs';

import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import meta from './RadioTabs.stories';

export default {
  ...meta,
  tags: [],
  title: 'uniform/RadioTabs/Composition',
} satisfies Meta<typeof RadioTabs>;

const submit = fn();
export const DisabledBooleans: StoryObj<typeof RadioTabs> = {
  parameters: {
    formProps: { initialValues: { radioTabsField: false }, onSubmit: submit },
  },
  args: {
    name: 'radioTabsField',
    label: 'Choice',
    disabled: true,
    options: [
      { label: 'No', value: false },
      { label: 'Yes', value: true },
    ],
  },
  play: async ({ canvasElement }) => {
    submit.mockClear();
    const canvas = within(canvasElement);
    const no = canvas.getByRole('tab', { name: 'No' });
    await expect(no).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(canvas.getByRole('tab', { name: 'Yes' }));
    await expect(no).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(submit).toHaveBeenCalled();
    });
    await expect(submit.mock.calls[0][0]).toEqual({});
  },
};
