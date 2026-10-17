import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createStyling } from '@fuf-stack/pixel-utils';
import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';
import { string, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import TextArea from '../TextArea';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof TextArea> = {
  title: 'uniform/TextArea',
  component: TextArea,
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
type Story = StoryObj<typeof TextArea>;

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    name: 'textareaField',
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: {
      initialValues: {
        textareaField:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
      },
    },
  },
  args: {
    name: 'textareaField',
  },
};

const requiredValidation = veto({
  textareaField: string(),
});

export const Required: Story = {
  parameters: { formProps: { validation: requiredValidation } },
  args: {
    label: 'Text Area',
    name: 'textareaField',
  },
};

const validation = veto({
  textareaField: string({ min: 2 }).regex(
    /^[a-z0-9\s]+$/i,
    'Must only contain alphanumeric characters and spaces.',
  ),
});

export const Invalid: Story = {
  parameters: {
    formProps: { validation },
  },
  args: {
    label: 'Text Area',
    name: 'textareaField',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('textareafield');
    await userEvent.type(input, 'invälid', {
      delay: 100,
    });
    // Blur so validation is triggered immediately
    input.blur();

    // Wait because of value debounce
    await waitFor(() => {
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(canvas.getByTestId('textareafield_error')).toBeVisible();
    });
  },
};

export const Disabled: Story = {
  args: { name: 'textareaField', label: 'Text Area', disabled: true },
};

// -----------------------------------------------------------------------------
// Composition
// -----------------------------------------------------------------------------

export const Autosizing: Story = {
  args: { name: 'textareaField', label: 'Autosizing text' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Autosizing text',
    });
    await waitFor(async () => {
      await expect(getComputedStyle(input).height).toBe('60px');
    });
    await userEvent.type(
      input,
      Array.from({ length: 10 }, (_, index) => {
        return `Line ${index + 1}`;
      }).join('{Enter}'),
    );
    await waitFor(async () => {
      await expect(getComputedStyle(input).height).toBe('160px');
    });
    await expect(input).not.toHaveAttribute('data-hide-scroll');
    await userEvent.clear(input);
    await waitFor(async () => {
      await expect(getComputedStyle(input).height).toBe('60px');
    });
    await expect(input).toHaveAttribute('data-hide-scroll', 'true');
  },
};

const styling = createStyling({
  extend: { classGroups: { 'font-size': [{ text: ['body'] }] } },
});

export const ConsumerFontSize: Story = {
  args: {
    name: 'textareaField',
    label: 'Custom font size',
    className: { input: 'text-body text-danger' },
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
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Custom font size',
    });
    await expect(input).toHaveClass('text-body', 'text-danger');
    await expect(input).not.toHaveClass('text-small');
    await expect(getComputedStyle(input).fontSize).toBe('18px');
  },
};

export const HelpAndRequired: Story = {
  ...Required,
  args: { ...Required.args, description: 'Enter multiple lines.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Text Area' });
    await expect(input).toHaveAccessibleDescription('Enter multiple lines.');
    await expect(input).toHaveAttribute('aria-required', 'true');
    await expect(input).not.toHaveAttribute('required');
    await userEvent.click(input);
    await userEvent.tab();
    await waitFor(async () => {
      await expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    const error = canvas.getByTestId('textareafield_error');
    const wrapper = input.closest('[data-slot="input-wrapper"]');
    const helper = input
      .closest('[data-slot="base"]')
      ?.querySelector('[data-slot="helper-wrapper"]');
    await expect(helper?.getBoundingClientRect().top).toBe(
      wrapper?.getBoundingClientRect().bottom,
    );
    await expect(input).toHaveAccessibleDescription(
      `Enter multiple lines. ${error.textContent}`,
    );
  },
};
