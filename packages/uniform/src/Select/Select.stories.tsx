import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Alert } from '@fuf-stack/pixels';
import { string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import SubmitButton from '../SubmitButton';
import Select from './Select';

const meta: Meta<typeof Select> = {
  title: 'uniform/Select',
  component: Select,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className={{ form: 'min-w-90' }}
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
type Story = StoryObj<typeof Select>;

const args: Story['args'] = {
  name: 'selectField',
  label: 'Some Label',
  options: [
    { value: 'blueberry', label: 'Blueberry' },
    { value: 'caramel_swirl', label: 'Caramel Swirl' },
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'coconut', label: 'Coconut' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'cookies_cream', label: 'Cookies & Cream' },
    { value: 'lemon_sorbet', label: 'Lemon Sorbet' },
    { value: 'mango', label: 'Mango' },
    { value: 'mint_chocolate', label: 'Mint Chocolate' },
    { value: 'peanut_butter', label: 'Peanut Butter' },
    { value: 'pistachio', label: 'Pistachio' },
    { value: 'raspberry', label: 'Raspberry' },
    { value: 'rocky_road', label: 'Rocky Road' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ],
};

export const Default: Story = {
  args,
};

export const NumberValues: Story = {
  args: {
    name: 'selectField',
    label: 'Select a Rating',
    options: [
      { value: 1, label: 'Poor' },
      { value: 2, label: 'Fair' },
      { value: 3, label: 'Good' },
      { value: 4, label: 'Very Good' },
      { value: 5, label: 'Excellent' },
    ],
  },
};

export const MultiSelect: Story = {
  args: {
    ...args,
    multiSelect: true,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement?.parentElement as HTMLElement);

    const dropdown = body.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;

    // select vanilla
    await userEvent.click(dropdown, { delay: 100 });
    const vanillaOption = body.getByTestId(
      'selectfield_select_option_vanilla',
    ).firstChild;
    await userEvent.click(vanillaOption as HTMLElement, { delay: 100 });

    // select chocolate
    await userEvent.click(dropdown, { delay: 100 });
    const chocolateOption = body.getByTestId(
      'selectfield_select_option_chocolate',
    ).firstChild;
    await userEvent.click(chocolateOption as HTMLElement, { delay: 100 });
  },
};

export const MultiSelectInitialValue: Story = {
  parameters: {
    formProps: {
      initialValues: {
        selectField: ['vanilla', 'chocolate', 'strawberry'],
      },
    },
  },
  args: {
    ...args,
    multiSelect: true,
  },
};

export const InitialValue: Story = {
  parameters: {
    formProps: { initialValues: { selectField: 'vanilla' } },
  },
  args,
};

const requiredValidation = veto({
  selectField: string(),
});

export const Required: Story = {
  parameters: {
    formProps: { validation: requiredValidation },
  },
  args,
};

const validation = veto({
  selectField: string()
    .refine((value) => {
      return value !== 'vanilla';
    }, 'Please select another option')
    .nullable()
    .optional(),
});

export const Invalid: Story = {
  parameters: {
    formProps: { validation, initialValues: { selectField: 'vanilla' } },
  },
  args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dropdown = canvas.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(dropdown, { delay: 100 });

    const vanillaOption = canvas.getByTestId(
      'selectfield_select_option_vanilla',
    ).firstChild as HTMLElement;
    await userEvent.click(vanillaOption, { delay: 100 });

    // Wait for validation to complete and error message to appear
    await waitFor(() => {
      expect(canvas.getByTestId('selectfield_error')).toBeVisible();
    });
  },
};

export const Disabled: Story = {
  args: {
    ...args,
    disabled: true,
  },
};

export const ReadOnly: Story = {
  parameters: {
    formProps: { initialValues: { selectField: 'chocolate' } },
  },
  args: {
    ...args,
    readOnly: true,
  },
};

export const OptionDisabled: Story = {
  args: {
    ...args,
    options: [
      { value: 'blueberry', label: 'Blueberry', disabled: true },
      { value: 'caramel_swirl', label: 'Caramel Swirl' },
      { value: 'chocolate', label: 'Chocolate' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await waitFor(() => {
      expect(canvas.getByTestId('selectfield')).toBeVisible();
    });

    const dropdown = canvas.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(dropdown, { delay: 100 });

    const blueberryOption = await body.findByRole(
      'option',
      { name: 'Blueberry' },
      { timeout: 5000 },
    );

    const hiddenInput = canvasElement.querySelector<HTMLInputElement>(
      'input[name="selectField"]',
    );
    if (!hiddenInput) {
      throw new Error('Hidden input selectField not found');
    }

    await expect(blueberryOption).toHaveAttribute('aria-disabled', 'true');
    expect(hiddenInput.value).toBe('');
    await userEvent.click(blueberryOption, { delay: 100 });

    await waitFor(() => {
      expect(hiddenInput.value).toBe('');
      expect(canvas.getByText('Select...')).toBeVisible();
    });
  },
};

export const Loading: Story = {
  args: {
    ...args,
    loading: true,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement?.parentElement as HTMLElement);
    const select = body.getByTestId('selectfield');
    await userEvent.type(select, 'search for something');
  },
};

export const NoResults: Story = {
  args: {
    ...args,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement?.parentElement as HTMLElement);
    const select = body.getByTestId('selectfield');
    await userEvent.type(select, 'search for something');
  },
};

// Helper function to sort string values alphabetically
const sortStringValues = (a: unknown, b: unknown) => {
  return String(a).localeCompare(String(b));
};

// Transform to sort multi select options alphabetically
const selectFieldSortTransform = {
  toDisplayValue: (value: unknown) => {
    return Array.isArray(value) ? [...value].sort(sortStringValues) : value;
  },
  toFormValue: (value: unknown) => {
    return Array.isArray(value) ? [...value].sort(sortStringValues) : value;
  },
};

export const TransformMultiSelectSorted: Story = {
  args: {
    ...args,
    label: 'Sorted Multi Select',
    multiSelect: true,
    transform: selectFieldSortTransform,
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement?.parentElement as HTMLElement);
    const dropdown = body.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;

    await userEvent.click(dropdown, { delay: 100 });
    await userEvent.click(
      body.getByTestId('selectfield_select_option_vanilla')
        .firstChild as HTMLElement,
      { delay: 100 },
    );

    await userEvent.click(dropdown, { delay: 100 });
    await userEvent.click(
      body.getByTestId('selectfield_select_option_chocolate')
        .firstChild as HTMLElement,
      { delay: 100 },
    );

    await waitFor(() => {
      const chips = Array.from(
        canvasElement.querySelectorAll('[class*="multiValue"]'),
      ).map((chip) => {
        return chip.textContent;
      });
      expect(chips).toEqual(['Chocolate', 'Vanilla']);
    });
  },
};

export const NoResultsCustomRenderer: Story = {
  args: {
    ...args,
    options: [],
    renderEmptyOptions: ({ inputValue }) => {
      return (
        <Alert variant="warning">
          {inputValue
            ? 'Searching will not help if there are no options'
            : 'There is nothing to select here'}
        </Alert>
      );
    },
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement?.parentElement as HTMLElement);
    const select = body.getByTestId('selectfield');
    await userEvent.click(select);
  },
};
