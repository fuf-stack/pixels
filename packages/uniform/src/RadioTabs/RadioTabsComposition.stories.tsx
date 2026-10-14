import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { number, veto } from '@fuf-stack/veto';

import RadioTabs from './RadioTabs';
import meta from './RadioTabs.stories';

export default {
  ...meta,
  tags: [],
  title: 'uniform/RadioTabs/Composition',
} satisfies Meta<typeof RadioTabs>;

export const KeyboardAndRequired: StoryObj<typeof RadioTabs> = {
  parameters: {
    formProps: {
      validation: veto({ radioTabsField: number().max(0) }),
      initialValues: { radioTabsField: 2 },
    },
  },
  args: {
    name: 'radioTabsField',
    label: 'Choice',
    description: 'Choose zero.',
    options: [
      { label: 'Zero', value: 0, content: 'Zero panel' },
      { label: 'Disabled', value: 1, disabled: true },
      { label: 'Two', value: 2, content: 'Two panel' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Choice' });
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    const selected = canvas.getByRole('tab', { name: 'Two' });
    await waitFor(async () => {
      await expect(selected).toHaveFocus();
      await expect(group).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('radiotabsfield_error');
    await expect(selected).toHaveAccessibleDescription(
      `Choose zero. ${error.textContent} Required selection.`,
    );
    await expect(group).toHaveAccessibleDescription(
      `Choose zero. ${error.textContent} Required selection.`,
    );
    await expect(canvas.getByRole('tablist', { name: 'Choice' })).toBeVisible();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Zero' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(canvas.getByText('Zero panel')).toBeVisible();
    await expect(canvas.getByRole('tab', { name: 'Disabled' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const AllVariants: StoryObj<typeof RadioTabs> = {
  parameters: {
    formProps: {
      initialValues: {
        solid: 'second',
        light: 'second',
        bordered: 'second',
        underlined: 'second',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {(['solid', 'light', 'bordered', 'underlined'] as const).map(
        (variant) => (
          <RadioTabs
            key={variant}
            label={variant}
            name={variant}
            variant={variant}
            options={[
              { label: 'First', value: 'first' },
              { label: 'Second', value: 'second' },
            ]}
          />
        ),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await Promise.all(
      ['solid', 'light', 'bordered', 'underlined'].map(async (variant) => {
        const list = canvas.getByRole('tablist', { name: variant });
        const active = within(list).getByRole('tab', { name: 'Second' });
        const cursor = list.querySelector('[data-slot="cursor"]');
        await waitFor(async () => {
          await expect(cursor).toBeVisible();
        });
        const expectedWidth =
          active.getBoundingClientRect().width *
          (variant === 'underlined' ? 0.8 : 1);
        await expect(cursor?.getBoundingClientRect().width).toBeCloseTo(
          expectedWidth,
          0,
        );
        await expect(cursor?.getBoundingClientRect().height).toBe(
          variant === 'underlined' ? 2 : 32,
        );
        await expect(getComputedStyle(active).fontSize).toBe('14px');
        if (variant === 'bordered')
          await expect(getComputedStyle(list).borderTopWidth).toBe('2px');
      }),
    );
  },
};
