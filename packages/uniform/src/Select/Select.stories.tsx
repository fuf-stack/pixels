import type { Meta, StoryObj } from '@storybook/react';

import { useState } from 'react';

import { action } from '@storybook/addon-actions';
import { expect, userEvent, within } from '@storybook/test';

import { Button, Card, Modal } from '@fuf-stack/pixels';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import { SubmitButton } from '../SubmitButton';
import Select from './Select';

const meta: Meta<typeof Select> = {
  title: 'uniform/Select',
  component: Select,
  decorators: [
    (Story, { parameters }) => (
      <Form
        onSubmit={action('onSubmit')}
        className="min-w-60"
        {...(parameters?.formProps || {})}
      >
        <Story />
        <div className="mt-4 flex justify-end">
          <SubmitButton />
        </div>
      </Form>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Select>;

const args: Story['args'] = {
  name: 'selectField',
  label: 'Some Label',
  options: [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'vanilla', label: 'Vanilla' },
    { value: 'strawberry', label: 'Strawberry' },
  ],
  testId: 'selectfield',
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
  selectField: vt.string(),
});

export const Required: Story = {
  parameters: {
    formProps: { validation: requiredValidation },
  },
  args,
};

const validation = veto({
  selectField: vt
    .string()
    .refine((value) => value !== 'vanilla', 'Please select another option')
    .nullable()
    .optional(),
});

export const Invalid: Story = {
  parameters: {
    formProps: { validation, initialValues: { selectField: 'vanilla' } },
  },
  args,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement?.parentElement as HTMLElement);

    const dropdown = body.getByTestId('selectfield_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(dropdown, { delay: 100 });

    const vanillaOption = body.getByTestId('selectfield_select_option_vanilla')
      .firstChild as HTMLElement;
    await userEvent.click(vanillaOption, { delay: 100 });
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
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)} testId="open_modal">
          Open Modal
        </Button>
        <Modal
          header="Select in a Modal"
          isOpen={open}
          onClose={() => setOpen(false)}
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
