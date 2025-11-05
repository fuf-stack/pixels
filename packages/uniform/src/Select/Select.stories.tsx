import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, Card, Modal } from '@fuf-stack/pixels';
import { string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
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

export const MenuIsVisibleInCard: Story = {
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

export const MenuIsVisibleInModal: Story = {
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
