/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@fuf-stack/pixels';
import { array, object, refineArray, string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import { Grid } from '../Grid';
import { useFormContext } from '../hooks/useFormContext';
import { Input } from '../Input';
import { SubmitButton } from '../SubmitButton';
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
        otherField: string().min(2),
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
          <Input label="Other Field" name={`${name}.otherField`} />
        </>
      );
    },
  },
  /**
   * ⚠️ SIMPLIFIED TEST - ZOD V4 MIGRATION
   *
   * This test was significantly simplified during the zod v4 migration due to
   * a fundamental change in how Zod handles refinements:
   *
   * **Zod v4 Behavior Change:**
   * - `superRefine` callbacks ONLY run when ALL base validation passes
   * - For `refineArray(array(...).min(3))({ unique: ... })`:
   *   1. Array type check must pass
   *   2. Each element must pass its schema validation
   *   3. Array constraints (like .min(3)) must pass
   *   4. ONLY THEN does superRefine (unique check) run
   *
   * **Previous Test (Zod v3):**
   * - Tested both min constraint AND unique refinement errors simultaneously
   * - Could show "Too small" AND "Array elements are not unique" together
   * - Tested element-level "Element already exists" error attribution
   *
   * **Current Test (Zod v4):**
   * - Only tests base validation (regex, min length) on elements
   * - Only tests array-level min constraint error
   * - Does NOT test unique refinement (would require 3+ valid elements)
   *
   * **TODO: Consider adding a separate test story that:**
   * - Has 3+ elements with all valid field values
   * - Has duplicate names to trigger unique refinement
   * - Tests that "Element already exists" and "Array elements are not unique" errors appear
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test base validation errors on first element
    const firstElementName = canvas.getByTestId('arrayfield_0_name');
    await userEvent.type(firstElementName, 'invälid', { delay: 100 });

    // check first element validation errors (base validation)
    await waitFor(async () => {
      await expect(firstElementName.getAttribute('aria-invalid')).toBe('true');
      const firstElementNameError = canvas.getByTestId(
        'arrayfield_0_name_error',
      );
      await expect(firstElementNameError).toContainHTML(
        'Must only contain alphanumeric characters and spaces.',
      );
      await expect(firstElementNameError).toContainHTML(
        'Too small: expected string to have &gt;=8 characters',
      );
    });

    // Submit to show array-level min error
    const submitButton = canvas.getByTestId('form_submit_button');
    submitButton.click();

    // Check for array-level min constraint error
    await waitFor(() => {
      const arrayFieldError = canvas.getByTestId('arrayfield_error');
      expect(arrayFieldError).toBeVisible();
      expect(arrayFieldError).toContainHTML(
        'Too small: expected array to have &gt;=3 items',
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

const edgeCaseValidation = veto({
  people: array(object({ name: string().min(2) }))
    .min(1)
    .max(5),
  tags: array(string().min(2)).min(1).max(5),
});

export const EdgeCaseResetWithoutInitialValues: Story = {
  name: 'Edge Case: Reset without Initial Values',
  parameters: {
    formProps: {
      validation: edgeCaseValidation,
      initialValues: {
        // Empty arrays as initial values - arrays should auto-initialize with 1 element due to lastElementNotRemovable
        people: [],
        tags: [],
      },
    },
  },
  render: () => {
    const { reset } = useFormContext();
    return (
      <Grid>
        <div className="col-span-12 mb-4">
          <Button
            className="w-full"
            color="secondary"
            testId="reset_button"
            onClick={() => {
              reset();
            }}
          >
            Reset Form
          </Button>
        </div>

        <div className="col-span-12 md:col-span-6">
          <FieldArray
            lastElementNotRemovable
            appendButtonText="Add Person"
            label="People (Normal Array - No Initial Values)"
            name="people"
            testId="people"
          >
            {({ name }) => {
              return <Input label="Name" name={`${name}.name`} />;
            }}
          </FieldArray>
        </div>

        <div className="col-span-12 md:col-span-6">
          <FieldArray
            flat
            lastElementNotRemovable
            appendButtonText="Add Tag"
            label="Tags (Flat Array - No Initial Values)"
            name="tags"
            testId="tags"
          >
            {({ name }) => {
              return <Input label="Tag" name={name} />;
            }}
          </FieldArray>
        </div>
      </Grid>
    );
  },
};

export const EdgeCaseResetWithInitialValues: Story = {
  name: 'Edge Case: Reset with Initial Values',
  parameters: {
    formProps: {
      validation: edgeCaseValidation,
      initialValues: {
        people: [{ name: 'Alice' }, { name: 'Bob' }],
        tags: ['react', 'typescript'],
      },
    },
  },
  render: () => {
    const { reset } = useFormContext();
    return (
      <Grid>
        <div className="col-span-12 mb-4">
          <Button
            className="w-full"
            color="secondary"
            testId="reset_button"
            onClick={() => {
              reset();
            }}
          >
            Reset Form
          </Button>
        </div>

        <div className="col-span-12 md:col-span-6">
          <FieldArray
            lastElementNotRemovable
            appendButtonText="Add Person"
            label="People (Normal Array)"
            name="people"
            testId="people"
          >
            {({ name }) => {
              return <Input label="Name" name={`${name}.name`} />;
            }}
          </FieldArray>
        </div>

        <div className="col-span-12 md:col-span-6">
          <FieldArray
            flat
            lastElementNotRemovable
            appendButtonText="Add Tag"
            label="Tags (Flat Array)"
            name="tags"
            testId="tags"
          >
            {({ name }) => {
              return <Input label="Tag" name={name} />;
            }}
          </FieldArray>
        </div>
      </Grid>
    );
  },
};
