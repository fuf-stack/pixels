import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SelectProps } from '../Select';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { action } from 'storybook/actions';

import { createStyling } from '@fuf-stack/pixel-utils';
import { string, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import { useFormContext } from '../../hooks/useFormContext';
import SubmitButton from '../../SubmitButton';
import Select from '../Select';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof Select> = {
  title: 'uniform/Select',
  component: Select,
  decorators: [
    (Story, context) => {
      const { parameters } = context;
      const content = (
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
      const renderField = () => {
        return content;
      };
      return parameters.edgeCaseDescription
        ? edgeCaseDecorator(renderField, context)
        : content;
    },
  ],
};

export type Story = StoryObj<typeof Select>;

export const args: Story['args'] = {
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

export const requiredValidation = veto({
  selectField: string(),
});

export const validation = veto({
  selectField: string()
    .refine((value) => {
      return value !== 'vanilla';
    }, 'Please select another option')
    .nullable()
    .optional(),
});

const sortStringValues = (a: unknown, b: unknown) => {
  return String(a).localeCompare(String(b));
};

export const selectFieldSortTransform = {
  toDisplayValue: (value: unknown) => {
    return Array.isArray(value) ? [...value].sort(sortStringValues) : value;
  },
  toFormValue: (value: unknown) => {
    return Array.isArray(value) ? [...value].sort(sortStringValues) : value;
  },
};

export const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

const FETCHED_DATA: Record<string, { id: string; name: string }> = {
  secret_flavor: { id: 'secret_flavor', name: 'Secret Flavor' },
  another_secret: { id: 'another_secret', name: 'Another Secret' },
};

const useFetchOptionData = (value: string | null) => {
  // In real usage: const data = useLazyLoadQuery(ThingQuery, { id: value });
  // Here we simulate with a lookup
  if (!value) {
    return null;
  }
  return FETCHED_DATA[value] ?? null;
};

const OptionLabel = ({ name }: { name: string }) => {
  return <span className="font-medium">{name}</span>;
};

export const SelectWithFallbackFetch = ({ options, ...props }: SelectProps) => {
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
      selectedOptionFallback={selectedOptionFallback}
    />
  );
};
