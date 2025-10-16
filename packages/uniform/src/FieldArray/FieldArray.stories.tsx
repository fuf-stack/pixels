import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaCopy, FaPlus, FaTimes } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@fuf-stack/pixels';
import { SubmitButton } from '@fuf-stack/uniform';
import { array, object, refineArray, string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import { Input } from '../Input';
import FieldArray from './FieldArray';

const meta: Meta<typeof FieldArray> = {
  title: 'uniform/FieldArray',
  component: FieldArray,
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
type Story = StoryObj<typeof FieldArray>;

export const Default: Story = {
  args: {
    name: 'arrayField',
    children: ({ name }) => {
      return <Input name={`${name}.name`} />;
    },
  },
};

const validationRequiredFlat = veto({
  arrayField: array(string()).min(0),
});

export const FlatArray: Story = {
  parameters: {
    formProps: {
      validation: validationRequiredFlat,
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name }) => {
      return <Input name={name} />;
    },
  },
};

export const WithInitialValue: Story = {
  parameters: {
    formProps: {
      initialValues: { arrayField: [{ name: 'Max' }, { name: 'Maria' }] },
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name, index }) => {
      return <Input label={`name ${index}`} name={`${name}.name`} />;
    },
  },
};

export const DisabledAnimation: Story = {
  args: {
    name: 'arrayField',
    disableAnimation: true,
    children: ({ name }) => {
      return <Input name={`${name}.name`} />;
    },
  },
};

const validationRequired = veto({
  arrayField: refineArray(array(object({ name: string() })))({
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
      initialValues: { arrayField: [{}] },
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name, index }) => {
      return <Input label={`name ${index}`} name={`${name}.name`} />;
    },
  },
};

const formValidator = veto({
  arrayField: refineArray(
    array(
      object({
        name: string()
          .regex(
            /^[a-z0-9\s]+$/i,
            'Must only contain alphanumeric characters and spaces.',
          )
          .min(8),
        test: string().min(2),
      }),
    ).min(3),
  )({
    unique: {
      mapFn: (value) => {
        return value.name;
      },
      elementErrorPath: ['name'],
    },
  }),
});

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: formValidator,
      initialValues: { arrayField: [{}] },
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name }) => {
      return (
        <>
          <Input name={`${name}.name`} />
          <Input name={`${name}.test`} />
        </>
      );
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const appendButton = canvas.getByTestId('arrayfield_append_button');
    appendButton.click();

    const input = canvas.getByTestId('arrayfield_0_name');
    await userEvent.type(input, 'invälid', {
      delay: 100,
    });

    const inputTwo = canvas.getByTestId('arrayfield_1_name');
    await userEvent.type(inputTwo, 'invälid', {
      delay: 100,
    });

    await userEvent.click(canvas.getByTestId('arrayfield'), { delay: 100 });

    // await userEvent.click(canvas.getByTestId('arrayfield'), { delay: 1000 });

    // const submitButton = canvas.getByTestId('form_submit_button');
    // await userEvent.click(submitButton, { delay: 100 });

    const inputInvalid = input.getAttribute('aria-invalid');
    await expect(inputInvalid).toBe('true');

    const inputTwoInvalid = inputTwo.getAttribute('aria-invalid');
    await expect(inputTwoInvalid).toBe('true');

    // TODO: currently disabled, because we need to validate smarter
    // const errorGlobal = canvas.getByText(
    //   'Array must contain at least 3 element(s)',
    // );
    // await expect(errorGlobal).toBeInTheDocument();

    const elementZero = canvas.getByTestId('arrayfield_0_element_wrapper');
    await expect(elementZero).toContainHTML(
      'Must only contain alphanumeric characters and spaces.',
    );
    await expect(elementZero).toContainHTML(
      'String must contain at least 8 character(s)',
    );

    const elementOne = canvas.getByTestId('arrayfield_1_element_wrapper');
    await expect(elementOne).toContainHTML(
      'Must only contain alphanumeric characters and spaces.',
    );
    await expect(elementOne).toContainHTML(
      'String must contain at least 8 character(s)',
    );

    // TODO: not working for some reason
    // const arrayField = canvas.getByTestId('arrayfield');
    // await waitFor(() => {
    //   expect(arrayField).toContainHTML('Element already exists');
    //   expect(arrayField).toContainHTML('Array elements are not unique');
    // });
  },
};

export const LastElementNotRemovable: Story = {
  parameters: {
    formProps: {
      initialValues: {},
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name, index }) => {
      return <Input label={`name ${index}`} name={`${name}.name`} />;
    },
    lastElementNotRemovable: true,
  },
};

export const CustomTestId: Story = {
  parameters: {
    formProps: {
      initialValues: { arrayField: [{}] },
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name, index, methods }) => {
      return (
        <>
          <Input label={`name ${index}`} name={`${name}.name`} />
          <Input label={`age ${index}`} name={`${name}.age`} />
          <Button
            className="mt-2"
            onClick={() => {
              methods.insert();
            }}
          >
            <FaPlus />
          </Button>
          <Button
            className="mt-2"
            onClick={() => {
              methods.remove();
            }}
          >
            <FaTimes />
          </Button>
        </>
      );
    },
    testId: 'some-test-id',
  },
};

export const Duplicate: Story = {
  parameters: {
    formProps: {
      initialValues: { arrayField: [{}] },
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name, index, methods }) => {
      return (
        <>
          <Input label={`name ${index}`} name={`${name}.name`} />
          <Input label={`age ${index}`} name={`${name}.age`} />
          <Button
            className="mt-2"
            onClick={() => {
              methods.duplicate();
            }}
          >
            <FaCopy />
          </Button>
          <Button
            className="mt-2"
            onClick={() => {
              methods.remove();
            }}
          >
            <FaTimes />
          </Button>
        </>
      );
    },
    testId: 'some-test-id',
  },
};

export const InsertAfter: Story = {
  parameters: {
    formProps: {
      initialValues: { arrayField: [{ name: 'Max' }, { name: 'Maria' }] },
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name, index }) => {
      return <Input label={`name ${index}`} name={`${name}.name`} />;
    },
    insertAfter: true,
    testId: 'arrayfield',
  },
};

export const Sortable: Story = {
  parameters: {
    formProps: {
      initialValues: {
        arrayField: [{ name: 'The First' }, { name: 'The Second' }],
      },
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name, index }) => {
      return <Input label={`name at index ${index}`} name={`${name}.name`} />;
    },
    testId: 'arrayfield',
    sortable: true,
  },

  // TODO: test with cypress when component is actually in use. This is not working.
  // play: async ({ canvasElement }) => {
  //   const user = userEvent.setup();
  //   const canvas = within(canvasElement);
  //   // const fieldArrayItemButton = canvas.getByTestId('arrayfield_1_movebutton');
  //   // const fieldArray = canvas.getByTestId('arrayfield_0_movebutton');

  //   // await fieldArrayItemButton.dispatchEvent(new MouseEvent('mousedown'));
  //   // await new Promise((resolve) => setTimeout(resolve, 2000));
  //   // await fieldArray.dispatchEvent(new MouseEvent('mousemove'));
  //   // await new Promise((resolve) => setTimeout(resolve, 2000));
  //   // await fieldArray.dispatchEvent(new MouseEvent('mouseup'));

  //   // const firstField = canvas.getByTestId('arrayfield0.name');
  //   // const firstFieldValue = firstField.getAttribute('value');
  //   // await expect(firstFieldValue).toBe('The Second');
  //   // await userEvent.click(fieldArrayItemButton, {
  //   //   delay: 500,
  //   // });
  //   // const canvas = within(canvasElement);
  //   // const dropTarget = canvas.getByTestId('arrayfield_1_movebutton');

  //   await new Promise((resolve) => setTimeout(resolve, 2000));
  //   const draggable = canvas.getByTestId('arrayfield_0_movebutton');
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

  //   const firstField = canvas.getByTestId('arrayfield0.name');
  //   const firstFieldValue = firstField.getAttribute('value');
  //   await expect(firstFieldValue).toBe('The Second');
  //   // await user.click(draggable, {
  //   //   delay: 500,
  //   // });
  // },
};
