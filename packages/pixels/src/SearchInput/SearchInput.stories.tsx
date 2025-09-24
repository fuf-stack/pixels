import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

import SearchInput from './SearchInput';

const onChange = action('onChange');

const meta: Meta<typeof SearchInput> = {
  title: 'pixels/SearchInput',
  component: SearchInput,
  args: {
    onChange,
    testId: 'inputField',
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Search something...',
  },
};

export const WithInitialValue: Story = {
  parameters: { formProps: { initialValues: { inputField: 'initial value' } } },
  args: {
    initialValue: 'initial value',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('inputfield');
    const inputValue = input.getAttribute('value');
    await expect(inputValue).toBe('initial value');
  },
};

export const Clearable: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('inputfield');
    await userEvent.type(input, 'I can be cleared');
    const clearButton = canvas.getByLabelText('clear input');
    expect(clearButton).toBeVisible();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

const renderAllSizes = () => {
  return ['sm', 'md', 'lg'].map((size) => {
    return (
      <SearchInput
        key={size}
        className="mt-4"
        placeholder={size}
        // @ts-expect-error this is ok
        size={size}
      />
    );
  });
};

export const AllSizes: Story = {
  // @ts-expect-error this is ok
  render: renderAllSizes,
};

export const CustomStyles: Story = {
  parameters: {
    formProps: { initialValues: { partySearch: 'Something fun!' } },
  },
  args: {
    placeholder: 'Search with party vibes...',
  },
  render: (args) => {
    return (
      <SearchInput
        className={{
          inputWrapper: [
            // min width, rounded corners and padding
            'min-w-sm rounded-2xl px-4',
            // transition styles
            'transition-colors duration-500',
            // background gradient (stronger in light mode)
            'bg-gradient-to-r from-fuchsia-100 via-rose-100 to-amber-100 dark:from-fuchsia-900 dark:via-rose-900 dark:to-amber-900',
            // background hover gradient
            'data-[hover=true]:bg-gradient-to-r data-[hover=true]:from-emerald-50 data-[hover=true]:via-teal-50 data-[hover=true]:to-lime-50 dark:data-[hover=true]:from-emerald-900 dark:data-[hover=true]:via-teal-900 dark:data-[hover=true]:to-lime-900',
            // border styles
            'border-2 border-fuchsia-400',
            // border hover styles (greenish)
            'data-[hover=true]:border-emerald-400',
            // border focus styles
            'group-data-[focus=true]:border-amber-400',
            // text color
            'text-fuchsia-700 group-hover:text-emerald-500 dark:text-fuchsia-300',
          ],
          // input placeholder color
          input:
            'placeholder:text-fuchsia-400/70 dark:placeholder:text-fuchsia-500/60',
          // clear button color
          clearButton:
            'text-fuchsia-500 transition-colors duration-500 hover:text-emerald-500',
        }}
        {...args}
      />
    );
  },
};
