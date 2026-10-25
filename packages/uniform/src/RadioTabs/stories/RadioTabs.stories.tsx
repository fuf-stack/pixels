import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { number, string, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import { useWatchUserChange } from '../../hooks/useWatchUserChange';
import Input from '../../Input';
import SubmitButton from '../../SubmitButton';
import RadioTabs from '../RadioTabs';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof RadioTabs> = {
  title: 'uniform/RadioTabs',
  component: RadioTabs,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className={{ form: 'min-w-60' }}
          onSubmit={action('onSubmit')}
          {...(parameters?.formProps ?? {})}
        >
          <Story />
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof RadioTabs>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

export const CustomStyling: Story = {
  args: {
    ...Default.args,
    className: {
      description: 'text-primary text-small',
      errorMessage: 'font-semibold',
      helperWrapper: 'flex flex-col gap-2',
    },
    description: 'Choose an available option',
    label: 'Choice',
  },
  parameters: {
    formProps: {
      validation: veto({ radioTabsField: string() }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const description = canvas.getByText('Choose an available option');

    await expect(description).toHaveClass('text-primary', 'text-small');
    await expect(description).not.toHaveClass(
      'text-foreground-400',
      'text-tiny',
    );
    await expect(description.parentElement).toHaveClass(
      'flex',
      'flex-col',
      'gap-2',
    );

    await userEvent.click(canvas.getByTestId('form_submit_button'));

    const error = await canvas.findByTestId('radiotabsfield_error');

    await expect(error.parentElement).toHaveClass('font-semibold');
    await expect(
      canvas.getByRole('group', { name: 'Choice' }),
    ).toHaveAccessibleDescription(
      `Choose an available option ${error.textContent} Required selection.`,
    );
  },
};

export const NumberValues: Story = {
  args: {
    name: 'radioTabsField',
    options: [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 13, label: 'Unlucky' },
    ],
  },
};

export const WithContent: Story = {
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="radio-tabs"]' },
    formProps: {
      className: 'min-w-md',
      initialValues: { radioTabsField: 'option_1' },
    },
  },
  args: {
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1', content: 'Option 1 Content' },
      { value: 'option_2', label: 'Option 2', content: 'Option 2 Content' },
      { value: 'option_3', label: 'Option 3', content: 'Option 3 Content' },
    ],
  },
};

interface PizzaFormData {
  toppings?: string;
  wantsPizza?: boolean;
}

export const BooleanValuesWithConditionalField: Story = {
  parameters: {
    formProps: {
      className: 'min-w-md',
      initialValues: { wantsPizza: false },
    },
  },
  render: () => {
    // Reset toppings when wantsPizza changes
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useWatchUserChange<PizzaFormData>({
      watch: 'wantsPizza',
      onChange: (value, { resetField }) => {
        resetField('toppings');
      },
    });

    return (
      <RadioTabs
        label="Do you want pizza? 🍕"
        name="wantsPizza"
        options={[
          { label: 'No thanks 😢', value: false },
          {
            content: <Input label="What toppings?" name="toppings" />,
            label: 'Yes please! 🎉',
            value: true,
          },
        ]}
      />
    );
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: { initialValues: { radioTabsField: 'option_2' } },
  },
  args: {
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

export const DisabledCompletely: Story = {
  args: {
    name: 'radioTabsField',
    disabled: true,
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

export const DisabledOption: Story = {
  tags: ['visual'],
  parameters: { visual: { target: '[data-component="radio-tabs"]' } },
  args: {
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      {
        value: 'option_2',
        label: 'option 2',
        disabled: true,
      },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

const requiredValidation = veto({
  radioTabsField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'Radio Tabs Field',
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: veto({
        radioTabsField: string().refine((value) => {
          return value !== 'option_2';
        }, 'Please use another option'),
      }),
    },
  },
  args: {
    name: 'radioTabsField',
    label: 'Radio Tabs Field',
    testId: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionTwo = canvas.getByTestId('radiotabsfield_option_option_2');
    await userEvent.click(optionTwo, {
      delay: 100,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('radiotabsfield_error')).toBeVisible();
    });
  },
};

export const InvalidWithContent: Story = {
  parameters: {
    formProps: {
      className: 'min-w-md',
      validation: veto({
        radioTabsField: string().refine((value) => {
          return value !== 'option_2';
        }, 'This option is not allowed'),
      }),
    },
  },
  args: {
    label: 'Select Your Plan',
    name: 'radioTabsField',
    testId: 'radioTabsField',
    options: [
      {
        content: 'Perfect for individuals just getting started.',
        label: 'Starter',
        value: 'option_1',
      },
      {
        content: 'Great for growing teams and businesses.',
        label: 'Pro',
        value: 'option_2',
      },
      {
        content: 'For large organizations with advanced needs.',
        label: 'Enterprise',
        value: 'option_3',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const optionTwo = canvas.getByTestId('radiotabsfield_option_option_2');
    await userEvent.click(optionTwo, {
      delay: 100,
    });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('radiotabsfield_error')).toBeVisible();
    });
  },
};

export const FullWidth: Story = {
  parameters: {
    formProps: {
      className: 'min-w-md',
      initialValues: { radioTabsField: 'option_1' },
    },
  },
  args: {
    label: 'Radio Tabs Field',
    fullWidth: true,
    name: 'radioTabsField',
    options: [
      { value: 'option_1', label: 'Option 1' },
      { value: 'option_2', label: 'Option 2' },
      { value: 'option_3', label: 'Option 3' },
    ],
  },
};

// -----------------------------------------------------------------------------
// Composition
// -----------------------------------------------------------------------------

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
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="radio-tabs"]' },
    formProps: {
      initialValues: {
        solid: 'second',
        light: 'second',
        bordered: 'second',
        underlined: 'second',
      },
    },
  },
  render: () => {
    return (
      <div className="flex flex-col gap-4">
        {(['solid', 'light', 'bordered', 'underlined'] as const).map(
          (variant) => {
            return (
              <RadioTabs
                key={variant}
                label={variant}
                name={variant}
                options={[
                  { label: 'First', value: 'first' },
                  { label: 'Second', value: 'second' },
                ]}
                variant={variant}
              />
            );
          },
        )}
      </div>
    );
  },
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
        if (variant === 'bordered') {
          await expect(getComputedStyle(list).borderTopWidth).toBe('2px');
        }
      }),
    );
  },
};

// -----------------------------------------------------------------------------
// Disabled
// -----------------------------------------------------------------------------

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
