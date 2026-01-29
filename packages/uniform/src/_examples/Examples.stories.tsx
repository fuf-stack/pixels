import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { expect, waitFor, within } from 'storybook/test';

import { Button, Card, Modal } from '@fuf-stack/pixels';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Checkboxes } from '../Checkboxes';
import { FieldArray } from '../FieldArray';
import { FieldCard } from '../FieldCard';
import { Form } from '../Form';
import { Grid } from '../Grid';
import { Input } from '../Input';
import { RadioBoxes } from '../RadioBoxes';
import { Radios } from '../Radios';
import { RadioTabs } from '../RadioTabs';
import { Select } from '../Select';
import { Slider } from '../Slider';
import { SubmitButton } from '../SubmitButton';
import { Switch } from '../Switch';
import { SwitchBox } from '../SwitchBox';
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
const radiosSchema = vt.vEnum(['Value0', 'Value1', 'Value2']);
const selectSchema = vt.vEnum(['Value0', 'Value1', 'Value2']);

const validation = veto({
  checkboxField: vt.array(checkboxSchema),
  fieldArrayField: vt.array(vt.object({ name: vt.string() })),
  fieldArrayFlatField: vt.array(vt.string()),
  numberField: vt.number(),
  objectCardField: vt.refineObject(
    vt.object({
      fieldA: vt.string(),
      fieldB: vt.string(),
    }),
  )({
    custom: (data, ctx) => {
      const fieldA = (data.fieldA as string | undefined) ?? '';
      const fieldB = (data.fieldB as string | undefined) ?? '';

      // Object-level validation: both fields must be provided
      if (!fieldA || !fieldB) {
        ctx.addIssue({
          code: 'custom',
          message: 'Both Field A and Field B are required',
        });
      }
    },
  }),
  passwordField: vt.string(),
  radioBoxField: radiosSchema,
  radioButtonField: radiosSchema,
  radioField: radiosSchema,
  radioTabsField: radiosSchema,
  radioTabsWithContentField: radiosSchema,
  selectField: selectSchema,
  sliderField: vt.number(),
  stringField: vt.string(),
  switchBoxField: vt.boolean(),
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
  value: vt.vInfer<typeof radiosSchema>;
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
          <Slider
            className="md:col-span-2"
            label="Slider Field"
            name="sliderField"
          />
          <Switch label="Switch Field" name="switchField" />
          <SwitchBox
            className="md:col-span-2"
            description="Enable advanced features for your account"
            label="Switch Box Field"
            name="switchBoxField"
          />
          <Checkboxes
            label="Checkbox Field"
            name="checkboxField"
            options={checkboxOptions}
          />
          <Radios
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
          <RadioTabs
            className="md:col-span-2"
            label="Radio Tabs Field"
            name="radioTabsField"
            options={radioOptions}
          />
          <RadioTabs
            className="md:col-span-2"
            label="Radio Tabs with Content Field"
            name="radioTabsWithContentField"
            options={[
              {
                content: 'This option provides basic features for your needs.',
                label: 'LabelA',
                value: 'Value0',
              },
              {
                content: 'This option includes advanced features and tools.',
                label: 'LabelB',
                value: 'Value1',
              },
              {
                content: 'This option has premium features and support.',
                label: 'LabelC',
                value: 'Value2',
              },
            ]}
          />
          <FieldArray
            appendButtonText="Add Element"
            className="md:col-span-2"
            label="Field Array"
            name="fieldArrayField"
          >
            {({ name }) => {
              return (
                <Input
                  label="Element"
                  name={`${name}.name`}
                  placeholder="Array item..."
                />
              );
            }}
          </FieldArray>
          <FieldArray
            flat
            lastElementNotRemovable
            appendButtonText="Add Element"
            className="md:col-span-2"
            label="Field Array (Flat)"
            name="fieldArrayFlatField"
          >
            {({ name }) => {
              return (
                <Input
                  label="Element"
                  name={name}
                  placeholder="Flat array item..."
                />
              );
            }}
          </FieldArray>
          <FieldCard
            className="md:col-span-2"
            label="Field Card"
            name="objectCardField"
          >
            <Grid>
              <Input label="Field A" name="objectCardField.fieldA" />
              <Input label="Field B" name="objectCardField.fieldB" />
            </Grid>
          </FieldCard>
        </Grid>
      </Card>
    ),
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Verify the object-level error is shown
    // INFO:  we do this so that snapshot is stable
    await waitFor(() => {
      expect(canvas.getByTestId('objectcardfield_error')).toBeInTheDocument();
    });

    // Verify the error message text
    expect(
      canvas.getByText('Both Field A and Field B are required'),
    ).toBeInTheDocument();

    // Verify the FieldCard header is not danger (not touched yet)
    const fieldCardLabel = canvas.getByRole('heading', {
      name: /field card/i,
    });
    expect(fieldCardLabel).not.toHaveClass('text-danger');
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
