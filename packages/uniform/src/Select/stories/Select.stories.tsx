import type { Story } from './Select.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Alert } from '@fuf-stack/pixels';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import {
  args,
  requiredValidation,
  selectFieldSortTransform,
  meta as sharedMeta,
  styling,
  validation,
} from './Select.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'uniform/Select' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
// -----------------------------------------------------------------------------

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

export const Required: Story = {
  parameters: {
    formProps: { validation: requiredValidation },
  },
  args,
};

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

export const HelpAndRequired: Story = {
  ...Required,
  args: { ...Required.args, description: 'Choose a flavor.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox');
    await expect(input).toHaveAttribute('aria-required', 'true');
    await expect(input).not.toHaveAttribute('required');
    await expect(input).toHaveAccessibleDescription(
      expect.stringContaining('Choose a flavor.'),
    );
    await userEvent.click(canvas.getByTestId('form_submit_button'));
    await waitFor(async () => {
      await expect(input).toHaveFocus();
    });
    await waitFor(async () => {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('selectfield_error');
    await expect(input).toHaveAccessibleDescription(
      expect.stringContaining(error.textContent ?? ''),
    );
  },
};

export const ConsumerFontSize: Story = {
  ...InitialValue,
  args: {
    ...InitialValue.args,
    className: { singleValue: 'text-body text-danger' },
  },
  decorators: [
    (Story) => {
      return (
        <StylingProvider styling={styling}>
          <style>{'.text-body { font-size: 18px; }'}</style>
          <Story />
        </StylingProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const value = canvasElement.querySelector('.text-body');
    await expect(value).toHaveClass('text-body', 'text-danger');
    await expect(value).not.toHaveClass('text-small');
    await expect(getComputedStyle(value as Element).fontSize).toBe('18px');
  },
};
