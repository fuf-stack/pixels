import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { Button, Card, Modal } from '@fuf-stack/pixels';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { CheckboxGroup } from '../CheckboxGroup';
import { Form } from '../Form';
import { Grid } from '../Grid';
import { Input } from '../Input';
import { RadioBoxes } from '../RadioBoxes';
import { RadioGroup } from '../RadioGroup';
import { Select } from '../Select';
import { SubmitButton } from '../SubmitButton';
import { Switch } from '../Switch';
import { TextArea } from '../TextArea';

const meta: Meta<typeof Form> = {
  title: 'uniform/Examples',
  component: Form,
  argTypes: { onSubmit: { action: 'onSubmit' } },
  decorators: [
    (Story) => {
      return (
        <div className="h-full w-full p-5">
          <div className="mx-auto xl:w-1/2">
            <Story />
          </div>
        </div>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Form>;

const checkboxSchema = vt.vEnum(['1', '2', '3']);
const radioGroupSchema = vt.vEnum(['Value0', 'Value1', 'Value2']);
const selectSchema = vt.vEnum(['Value0', 'Value1', 'Value2']);

const validation = veto({
  checkboxField: vt.array(checkboxSchema),
  numberField: vt.number(),
  passwordField: vt.string(),
  radioBoxField: radioGroupSchema,
  radioButtonField: radioGroupSchema,
  radioField: radioGroupSchema,
  selectField: selectSchema,
  stringField: vt.string(),
  switchField: vt.boolean(),
  textAreaField: vt.string(),
});

const checkboxOptions: {
  label: string;
  value: vt.vInfer<typeof checkboxSchema>;
}[] = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
];

const radioOptions: {
  label: string;
  value: vt.vInfer<typeof radioGroupSchema>;
}[] = [
  { label: 'LabelA', value: 'Value0' },
  { label: 'LabelB', value: 'Value1' },
  { label: 'LabelC', value: 'Value2' },
];

const selectOptions: {
  label: string;
  value: vt.vInfer<typeof selectSchema>;
}[] = [
  { label: 'LabelA', value: 'Value0' },
  { label: 'LabelB', value: 'Value1' },
  { label: 'LabelC', value: 'Value2' },
];

export const AllFieldRenderers: Story = {
  args: {
    validation,
    children: (
      <Card
        className={{ footer: 'flex-row-reverse' }}
        footer={<SubmitButton />}
      >
        <Grid className="md:grid-cols-2">
          <Input
            label="String Field"
            name="stringField"
            placeholder="String Field..."
          />
          <Input label="Number Field" name="numberField" type="number" />
          <Select
            label="Select Field"
            name="selectField"
            options={selectOptions}
          />
          <Input label="Password Field" name="passwordField" type="password" />
          <TextArea
            className="md:col-span-2"
            label="Text Area"
            name="textAreaField"
          />
          <Switch label="Switch Field" name="switchField" />
          <CheckboxGroup
            label="Checkbox Field"
            name="checkboxField"
            options={checkboxOptions}
          />
          <RadioGroup
            inline
            label="Radio Field"
            name="radioField"
            options={radioOptions}
          />
          <RadioBoxes
            className="md:col-span-2"
            label="Radio Box Field"
            name="radioBoxField"
            options={radioOptions}
          />
        </Grid>
      </Card>
    ),
  },
};

export const DebugModeDisabled: Story = {
  args: {
    debug: { disable: true },
    children: (
      <Card
        className={{ footer: 'flex-row-reverse' }}
        footer={<SubmitButton />}
      >
        <Input
          label="String Field"
          name="stringField"
          placeholder="String Field..."
        />
      </Card>
    ),
    validation,
  },
};

export const FormFieldsInModal: Story = {
  args: {},
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <Button
          testId="modal_trigger"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Open Modal
        </Button>
        <Form {...args}>
          <Modal
            footer={<SubmitButton />}
            isOpen={isOpen}
            onClose={() => {
              setIsOpen(false);
            }}
          >
            <Input
              label="String Field"
              name="stringField"
              placeholder="String Field..."
            />
          </Modal>
        </Form>
      </div>
    );
  },
};
