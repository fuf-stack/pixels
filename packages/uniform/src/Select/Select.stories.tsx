import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SelectProps } from './Select';

import { useState } from 'react';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, Card, Modal } from '@fuf-stack/pixels';
import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import { SubmitButton } from '../SubmitButton';
import Select from './Select';

const meta: Meta<typeof Select> = {
  title: 'uniform/Select',
  component: Select,
  decorators: [
    (Story, { parameters }) => {
      return (
        <Form
          className="min-w-60"
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

export const EdgeCaseMenuIsVisibleInCard: Story = {
  args,
  render: (renderArgs) => {
    return (
      <Card header="Select in a Card">
        <Select {...renderArgs} />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement?.parentElement as HTMLElement);
    const dropdown = body.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(dropdown, { delay: 100 });
    // check that select menu option is visible
    await expect(
      body.getByTestId('selectfield_select_option_vanilla'),
    ).toBeVisible();
  },
};

export const EdgeCaseMenuIsVisibleInModal: Story = {
  args,
  render: (renderArgs) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          testId="open_modal"
          onClick={() => {
            setOpen(true);
          }}
        >
          Open Modal
        </Button>
        <Modal
          header="Select in a Modal"
          isOpen={open}
          onClose={() => {
            setOpen(false);
          }}
        >
          <Select {...renderArgs} />
        </Modal>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    // open modal
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('open_modal');
    await userEvent.click(trigger, { delay: 100 });
    // open menu
    const body = within(canvasElement?.parentElement as HTMLElement);
    const dropdown = body.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(dropdown, { delay: 100 });
    // check that select menu option is visible
    await expect(
      body.getByTestId('selectfield_select_option_vanilla'),
    ).toBeVisible();
  },
};

// Simulates fetched data (in real usage this would come from Relay useLazyLoadQuery)
const FETCHED_DATA: Record<string, { id: string; name: string }> = {
  secret_flavor: { id: 'secret_flavor', name: 'Secret Flavor' },
  another_secret: { id: 'another_secret', name: 'Another Secret' },
};

// Simulates a hook that fetches option data by ID (like a Relay query)
const useFetchOptionData = (value: string | null) => {
  // In real usage: const data = useLazyLoadQuery(ThingQuery, { id: value });
  // Here we simulate with a lookup
  if (!value) {
    return null;
  }
  return FETCHED_DATA[value] ?? null;
};

// Shared component to render an option label (used for both dropdown and selected)
const OptionLabel = ({ name }: { name: string }) => {
  return <span className="font-medium">{name}</span>;
};

/**
 * Wrapper component that handles fetching fallback data.
 * This demonstrates the pattern for async selects with Relay.
 */
const SelectWithFallbackFetch = ({ options, ...props }: SelectProps) => {
  const { watch } = useFormContext();
  const currentValue = watch('selectField') as string | null;

  // Check if current value is in options
  const isInOptions = options?.some((o) => {
    return o.value === currentValue;
  });

  // Fetch data for fallback value (when not in options)
  // In real usage: useLazyLoadQuery only when !isInOptions && currentValue
  const fetchedData = useFetchOptionData(
    !isInOptions && currentValue ? currentValue : null,
  );

  // Build fallback option from fetched data
  const selectedOptionFallback = fetchedData
    ? {
        label: fetchedData.name,
        // Pass extra data needed by renderOptionLabel
        node: fetchedData,
        value: fetchedData.id,
      }
    : undefined;

  return (
    <Select
      {...props}
      options={options}
      selectedOptionFallback={selectedOptionFallback}
      renderOptionLabel={(data) => {
        const option = data as {
          isFallback?: boolean;
          label?: string;
          node?: { name: string };
        };
        // For fallback options that we fetched, use node.name
        // For regular options from the list, use label
        const name = option.node?.name ?? option.label ?? '';
        return <OptionLabel name={name} />;
      }}
    />
  );
};

/**
 * Edge case: Fetching fallback option data outside renderOptionLabel.
 *
 * For async selects, when the form has an initial value (or a previously
 * selected value) that's not in the current options list:
 * 1. Watch the form value
 * 2. Check if it's in the options list
 * 3. If not, fetch the data (e.g., via Relay useLazyLoadQuery)
 * 4. Pass fetched option via selectedOption prop
 * 5. renderOptionLabel renders the same component for all options
 */
export const EdgeCaseFetchFallbackOutside: Story = {
  parameters: {
    formProps: { initialValues: { selectField: 'secret_flavor' } },
  },
  render: (renderArgs) => {
    return <SelectWithFallbackFetch {...renderArgs} />;
  },
  args: {
    ...args,
    // Options don't include 'secret_flavor'
  },
};
