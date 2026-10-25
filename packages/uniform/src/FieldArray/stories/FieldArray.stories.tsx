import type { Story } from './FieldArray.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import Input from '../../Input';
import {
  complexValidator,
  meta as sharedMeta,
  validationDefault,
  validationDuplicates,
  validationFlat,
} from './FieldArray.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'uniform/FieldArray' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
// -----------------------------------------------------------------------------

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
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="field-array"]' },
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

export const Invalid: Story = {
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="field-array"]' },
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
          <Input label="Other Field" name={`${name}.otherField`} />
        </>
      );
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const firstElementName = canvas.getByTestId('arrayfield_0_name');
    await userEvent.type(firstElementName, 'invälid', { delay: 100 });

    // check first element validation errors
    await waitFor(async () => {
      // should have aria-invalid
      await expect(firstElementName.getAttribute('aria-invalid')).toBe('true');

      // should show expected error messages
      const firstElementNameError = canvas.getByTestId(
        'arrayfield_0_name_error',
      );
      await expect(firstElementNameError).toContainHTML(
        'Must only contain alphanumeric characters and spaces.',
      );
      await expect(firstElementNameError).toContainHTML(
        'String must contain at least 8 character(s)',
      );
    });

    // add second element
    const appendButton = canvas.getByTestId('arrayfield_append_button');
    appendButton.click();

    // wait for second element to be present
    await waitFor(async () => {
      return canvas.getByTestId('arrayfield_1_name');
    });

    const secondElementName = canvas.getByTestId('arrayfield_1_name');
    await userEvent.type(secondElementName, 'invälid', { delay: 100 });

    // check second element validation errors
    await waitFor(async () => {
      // should have aria-invalid
      await expect(secondElementName.getAttribute('aria-invalid')).toBe('true');

      // should show expected error messages
      const secondElementNameError = canvas.getByTestId(
        'arrayfield_1_name_error',
      );
      // IMPORTANT: also already exists message is shown
      await expect(secondElementNameError).toContainHTML(
        'Element already exists',
      );
      await expect(secondElementNameError).toContainHTML(
        'Must only contain alphanumeric characters and spaces.',
      );
      await expect(secondElementNameError).toContainHTML(
        'String must contain at least 8 character(s)',
      );
    });

    // check for array-level validation errors
    await waitFor(() => {
      // Check for array-level error element
      const arrayFieldError = canvas.getByTestId('arrayfield_error');
      expect(arrayFieldError).toBeVisible();

      // Check for specific array-level error messages within the error element
      expect(arrayFieldError).toContainHTML(
        'Array must contain at least 3 element(s)',
      );
      expect(arrayFieldError).toContainHTML('Array elements are not unique');
    });

    // Now hit the submit button so submit count increases
    // and remaining error messages are shown
    const submitButton = canvas.getByTestId('form_submit_button');
    submitButton.click();

    // check untouched fields error messages are showing
    await waitFor(() => {
      expect(canvas.getByTestId('arrayfield_0_otherfield_error')).toContainHTML(
        'Field is required',
      );
      expect(canvas.getByTestId('arrayfield_1_otherfield_error')).toContainHTML(
        'Field is required',
      );
    });
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
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="field-array"]' },
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
