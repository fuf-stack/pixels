import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

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
          className="min-w-md"
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

const validationDefault = veto({
  arrayField: array(object({ name: string() })).max(3),
});

export const Default: Story = {
  parameters: {
    formProps: { validation: validationDefault },
  },
  args: {
    name: 'arrayField',
    label: 'Array Field',
    children: ({ name }) => {
      return <Input label="Name" name={`${name}.name`} />;
    },
  },
};

const validationFlat = veto({
  arrayField: array(string()).max(3),
});

export const FlatArray: Story = {
  parameters: {
    formProps: {
      validation: validationFlat,
    },
  },
  args: {
    name: 'arrayField',
    label: 'Flat Array Field',
    flat: true,
    children: ({ name }) => {
      return <Input label="Value" name={name} />;
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
    label: 'People',
    children: ({ name }) => {
      return <Input label="Name" name={`${name}.name`} />;
    },
  },
};

const validationDuplicates = veto({
  arrayField: refineArray(array(object({ name: string() })))({
    unique: {
      elementMessage: 'Contains duplicate name',
      mapFn: (val) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return val?.name;
      },
      elementErrorPath: ['name'],
    },
  }),
});

export const Required: Story = {
  parameters: {
    formProps: {
      validation: validationDuplicates,
      initialValues: { arrayField: [{}] },
    },
  },
  args: {
    name: 'arrayField',
    label: 'Required Array',
    children: ({ name }) => {
      return <Input label="Name" name={`${name}.name`} />;
    },
  },
};

const complexValidator = veto({
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value.name;
      },
      elementErrorPath: ['name'],
    },
  }),
});

export const Invalid: Story = {
  parameters: {
    formProps: {
      validation: complexValidator,
      initialValues: { arrayField: [{}] },
    },
  },
  args: {
    name: 'arrayField',
    label: 'Invalid Array',
    children: ({ name }) => {
      return (
        <>
          <Input label="Name" name={`${name}.name`} />
          <Input label="Test Field" name={`${name}.test`} />
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

    const firstElement = canvas.getByTestId('arrayfield_0_element');
    await expect(firstElement).toContainHTML(
      'Must only contain alphanumeric characters and spaces.',
    );
    await expect(firstElement).toContainHTML(
      'String must contain at least 8 character(s)',
    );

    const secondElement = canvas.getByTestId('arrayfield_1_element');
    await expect(secondElement).toContainHTML(
      'Must only contain alphanumeric characters and spaces.',
    );
    await expect(secondElement).toContainHTML(
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
      validation: validationDefault,
    },
  },
  args: {
    name: 'arrayField',
    label: 'Last Element Not Removable',
    children: ({ name }) => {
      return <Input label="Name" name={`${name}.name`} />;
    },
    lastElementNotRemovable: true,
  },
};

export const FlatLastElementNotRemovable: Story = {
  parameters: {
    formProps: { validation: validationFlat },
  },
  args: {
    name: 'arrayField',
    label: 'Flat Last Element Not Removable',
    flat: true,
    lastElementNotRemovable: true,
    children: ({ name }) => {
      return <Input label="Value" name={name} />;
    },
  },
};

export const WithoutLabels: Story = {
  parameters: {
    formProps: {
      validation: validationDefault,
    },
  },
  args: {
    name: 'arrayField',
    children: ({ name }) => {
      return <Input name={`${name}.name`} />;
    },
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
    label: 'Custom Test ID Array',
    children: ({ name }) => {
      return (
        <>
          <Input label="Name" name={`${name}.name`} />
          <Input label="Age" name={`${name}.age`} />
        </>
      );
    },
    testId: 'some-test-id',
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
    label: 'Sortable Elements',
    children: ({ name, index }) => {
      return (
        <Input label={`Element ${index + 1} Name`} name={`${name}.name`} />
      );
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

export const Duplicate: Story = {
  parameters: {
    formProps: {
      initialValues: { arrayField: [{}, {}] },
    },
  },
  args: {
    name: 'arrayField',
    label: 'Duplicate Elements',
    duplicate: true,
    children: ({ name }) => {
      return (
        <>
          <Input label="Name" name={`${name}.name`} />
          <Input label="Age" name={`${name}.age`} />
        </>
      );
    },
    testId: 'arrayfield',
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
    label: 'Insert After Example',
    children: ({ name }) => {
      return <Input label="Name" name={`${name}.name`} />;
    },
    insertAfter: true,
    testId: 'arrayfield',
  },
};

export const DuplicateAndInsertAfter: Story = {
  parameters: {
    formProps: {
      initialValues: { arrayField: [{ name: 'Max' }, { name: 'Maria' }] },
    },
  },
  args: {
    name: 'arrayField',
    label: 'All Actions Available',
    duplicate: true,
    insertAfter: true,
    children: ({ name }) => {
      return (
        <>
          <Input label="Name" name={`${name}.name`} />
          <Input label="Age" name={`${name}.age`} />
        </>
      );
    },
    testId: 'arrayfield',
  },
};

export const AllFeatures: Story = {
  parameters: {
    formProps: {
      validation: complexValidator,
      initialValues: { arrayField: [{ name: 'Max' }, { name: 'Maria' }] },
    },
  },
  args: {
    name: 'arrayField',
    label: 'All Features',
    duplicate: true,
    insertAfter: true,
    lastElementNotRemovable: true,
    sortable: true,
    children: ({ name }) => {
      return (
        <>
          <Input label="Name" name={`${name}.name`} />
          <Input label="Age" name={`${name}.age`} />
        </>
      );
    },
  },
};
