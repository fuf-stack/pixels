import type { Meta, StoryObj } from '@storybook/react';

import {
  FaAngleDown,
  FaAngleUp,
  FaCopy,
  FaPlus,
  FaTimes,
} from 'react-icons/fa';

import { action } from '@storybook/addon-actions';
import { expect, userEvent, within } from '@storybook/test';

import { Button } from '@fuf-stack/pixels';
import { SubmitButton } from '@fuf-stack/uniform';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import { Input } from '../Input';
import FieldArray from './FieldArray';

const meta: Meta<typeof FieldArray> = {
  title: 'uniform/FieldArray',
  component: FieldArray,
  decorators: [
    (Story, { parameters }) => (
      <Form
        className="min-w-60"
        onSubmit={action('onSubmit')}
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
type Story = StoryObj<typeof FieldArray>;

export const Default: Story = {
  args: {
    name: 'DefaultStory',
    children: (name, index) => (
      <Input name={`${name}.name`} label={`name ${index}`} />
    ),
    testId: 'some-test-id',
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: {
      initialValues: { FieldArray: [{ name: 'Max' }, { name: 'Maria' }] },
    },
  },
  args: {
    name: 'FieldArray',
    children: (name, index) => (
      <Input name={`${name}.name`} label={`name ${index}`} />
    ),
    testId: 'fieldarray',
  },
};

const validationRequired = veto({
  fieldArray: vt.refineArray(vt.array(vt.object({ name: vt.string() })))({
    unique: {
      elementMessage: 'Contains duplicate name',
      mapFn: (val) => {
        return val?.name;
      },
      elementErrorPath: ['name'],
    },
  }),
});

export const Required: Story = {
  parameters: {
    formProps: {
      validation: validationRequired,
      initialValues: { fieldArray: [{}] },
    },
  },
  args: {
    name: 'fieldArray',
    children: (name, index) => (
      <Input name={`${name}.name`} label={`name ${index}`} />
    ),
  },
};

const formValidator = veto({
  fieldArray: vt.refineArray(
    vt
      .array(
        vt.object({
          name: vt
            .string()
            .regex(
              /^[a-z0-9\s]+$/i,
              'Must only contain alphanumeric characters and spaces.',
            )
            .min(8),
          test: vt.string().min(2),
        }),
      )
      .min(3),
  )({ unique: { mapFn: (value) => value.name } }),
});

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: formValidator,
      initialValues: { fieldArray: [{}] },
    },
  },
  args: {
    name: 'fieldArray',
    label: 'FieldArray',
    children: (name, index) => (
      <>
        <Input
          testId={`${name}_name`}
          name={`${name}.name`}
          label={`name ${index}`}
        />
        <Input
          testId={`${name}_test`}
          name={`${name}.test`}
          label={`test ${index}`}
        />
      </>
    ),
    testId: 'fieldarray',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const appendButton = canvas.getByTestId('fieldarray_append');
    appendButton.click();

    const input = canvas.getByTestId('fieldarray0_name');
    await userEvent.type(input, 'invälid', {
      delay: 100,
    });

    const inputTwo = canvas.getByTestId('fieldarray1_name');
    await userEvent.type(inputTwo, 'invälid', {
      delay: 100,
    });

    await userEvent.click(canvas.getByTestId('fieldarray'), { delay: 100 });

    // await userEvent.click(canvas.getByTestId('fieldarray'), { delay: 1000 });

    // const submitButton = canvas.getByTestId('form_submit_button');
    // await userEvent.click(submitButton, { delay: 100 });

    const inputInvalid = input.getAttribute('aria-invalid');
    await expect(inputInvalid).toBe('true');

    const inputTwoInvalid = inputTwo.getAttribute('aria-invalid');
    await expect(inputTwoInvalid).toBe('true');

    const errorGlobal = canvas.getByText(
      'Array must contain at least 3 element(s)',
    );
    await expect(errorGlobal).toBeInTheDocument();

    const elementZero = canvas.getByTestId('fieldarray_0');
    await expect(elementZero).toContainHTML(
      'Must only contain alphanumeric characters and spaces.',
    );
    await expect(elementZero).toContainHTML(
      'String must contain at least 8 character(s)',
    );

    const elementOne = canvas.getByTestId('fieldarray_1');
    await expect(elementOne).toContainHTML(
      'Must only contain alphanumeric characters and spaces.',
    );
    await expect(elementOne).toContainHTML(
      'String must contain at least 8 character(s)',
    );

    // TODO: this should happen if fieldarray1_name is blurred but blurring does not seem to work by clicking somewhere else
    await expect(canvas.getByTestId('fieldarray')).toContainHTML(
      'Element already exists',
    );
    await expect(canvas.getByTestId('fieldarray')).toContainHTML(
      'Array elements are not unique',
    );
  },
};

export const HideAllButtons: Story = {
  parameters: {
    formProps: {
      initialValues: { fieldArray: [{}] },
    },
  },
  args: {
    name: 'fieldArray',
    children: (name, index) => (
      <Input name={`${name}.name`} label={`name ${index}`} />
    ),
    // hideButtons: ['all'],
    moveField: ['drag-drop', 'button'],
  },
};
export const HideAllButAdd: Story = {
  parameters: {
    formProps: {
      initialValues: { fieldArray: [{}] },
    },
  },
  args: {
    name: 'fieldArray',
    children: (name, index) => (
      <Input name={`${name}.name`} label={`name ${index}`} />
    ),
    hideButtons: ['insert', 'remove', 'move'],
  },
};

export const AllowAllDelete: Story = {
  parameters: {
    formProps: {
      initialValues: { fieldArray: [{}] },
    },
  },
  args: {
    name: 'fieldArray',
    children: (name, index) => (
      <Input name={`${name}.name`} label={`name ${index}`} />
    ),

    lastNotDeletable: false,
  },
};

export const Custom: Story = {
  parameters: {
    formProps: {
      initialValues: { fieldArray: [{}] },
    },
  },
  args: {
    name: 'fieldArray',
    children: (name, index, length, move, insert, remove) => (
      <>
        <Input name={`${name}.name`} label={`name ${index}`} />
        <Input name={`${name}.age`} label={`age ${index}`} />
        <Button className="mt-2" onClick={() => move(index, index - 1)}>
          <FaAngleUp />
        </Button>
        <Button className="mt-2" onClick={() => move(index, index + 1)}>
          <FaAngleDown />
        </Button>
        <Button
          className="mt-2"
          onClick={() => {
            insert(index + 1, {});
          }}
        >
          <FaPlus />
        </Button>
        <Button className="mt-2" onClick={() => remove(index)}>
          <FaTimes />
        </Button>
      </>
    ),
    hideButtons: ['insert', 'remove', 'move'],
    testId: 'some-test-id',
  },
};

export const Duplicate: Story = {
  parameters: {
    formProps: {
      initialValues: { fieldArray: [{}] },
    },
  },
  args: {
    name: 'fieldArray',
    children: (name, index, remove, duplicate) => (
      <>
        <Input name={`${name}.name`} label={`name ${index}`} />
        <Input name={`${name}.age`} label={`age ${index}`} />
        <Button
          className="mt-2"
          onClick={() => {
            duplicate(index);
          }}
        >
          <FaCopy />
        </Button>
        <Button className="mt-2" onClick={() => remove(index)}>
          <FaTimes />
        </Button>
      </>
    ),
    hideButtons: ['insert', 'remove', 'move'],
    testId: 'some-test-id',
  },
};

export const Dragable: Story = {
  parameters: {
    formProps: {
      initialValues: {
        fieldArray: [{ name: 'The First' }, { name: 'The Second' }],
      },
    },
  },
  args: {
    name: 'fieldArray',
    children: (name, index) => (
      <Input name={`${name}.name`} label={`name at index ${index}`} />
    ),
    testId: 'fieldarray',
    moveField: ['drag-drop'],
  },

  // TODO: test with cypress when component is actually in use. This is not working.
  // play: async ({ canvasElement }) => {
  //   const user = userEvent.setup();
  //   const canvas = within(canvasElement);
  //   // const fieldArrayItemButton = canvas.getByTestId('fieldarray_1_movebutton');
  //   // const fieldArray = canvas.getByTestId('fieldarray_0_movebutton');

  //   // await fieldArrayItemButton.dispatchEvent(new MouseEvent('mousedown'));
  //   // await new Promise((resolve) => setTimeout(resolve, 2000));
  //   // await fieldArray.dispatchEvent(new MouseEvent('mousemove'));
  //   // await new Promise((resolve) => setTimeout(resolve, 2000));
  //   // await fieldArray.dispatchEvent(new MouseEvent('mouseup'));

  //   // const firstField = canvas.getByTestId('fieldarray0.name');
  //   // const firstFieldValue = firstField.getAttribute('value');
  //   // await expect(firstFieldValue).toBe('The Second');
  //   // await userEvent.click(fieldArrayItemButton, {
  //   //   delay: 500,
  //   // });
  //   // const canvas = within(canvasElement);
  //   // const dropTarget = canvas.getByTestId('fieldarray_1_movebutton');

  //   await new Promise((resolve) => setTimeout(resolve, 2000));
  //   const draggable = canvas.getByTestId('fieldarray_0_movebutton');
  //   const dropTarget = canvas.getByText('Add');

  //   // user.

  //   // // await userEvent.click(draggable, { skipHover: true });
  //   await user.pointer({ keys: '[MouseLeft>]', target: draggable });
  //   await new Promise((resolve) => setTimeout(resolve, 500));

  //   await draggable.dispatchEvent(new MouseEvent('mousemove'));
  //   // await user.pointer({
  //   //   keys: '>[MouseMove]',
  //   //   // offset: 100,
  //   //   coords: { x: 100, y: 100 },
  //   //   // target: dropTarget,
  //   // });
  //   await new Promise((resolve) => setTimeout(resolve, 500));

  //   await user.pointer({ target: dropTarget, keys: '[/MouseLeft]' });

  //   const firstField = canvas.getByTestId('fieldarray0.name');
  //   const firstFieldValue = firstField.getAttribute('value');
  //   await expect(firstFieldValue).toBe('The Second');
  //   // await user.click(draggable, {
  //   //   delay: 500,
  //   // });
  // },
};
