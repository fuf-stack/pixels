import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FieldValues } from 'react-hook-form';

import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import { Grid } from '../Grid';
import { Input } from '../Input';
import { SubmitButton } from '../SubmitButton';

const meta: Meta<typeof Form> = {
  title: 'uniform/_examples/RenderCycles',
  component: Form,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Simple validation schema using veto
const schema = veto({
  field1: vt.string().min(3, 'Field 1 must be at least 3 characters'),
  field2: vt.string().min(5, 'Field 2 must be at least 5 characters'),
});

/**
 * Simple form with two inputs to debug render cycles.
 * Check the console to see which components re-render when typing.
 */
export const TwoInputsDebug: Story = {
  render: () => {
    const handleSubmit = (data: FieldValues) => {
      console.log('Form submitted:', data);
    };

    return (
      <div className="space-y-4 xl:w-1/2">
        <h2 className="text-xl font-bold">Render Cycles Debug</h2>
        <p className="text-default-600">
          Open the console and type in either field. You should only see
          re-render logs for the field being typed into.
        </p>

        <Form
          onSubmit={handleSubmit}
          validation={schema}
          className="max-w-md space-y-4"
        >
          <Grid>
            <Input
              name="field1"
              label="Field 1 (min 3 chars)"
              placeholder="Type here..."
            />
            <Input
              name="field2"
              label="Field 2 (min 5 chars)"
              placeholder="Type here too..."
            />
          </Grid>
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      </div>
    );
  },
};

const complexSchema = veto({
  textField: vt.string().min(2, 'Text field must be at least 2 characters'),
  numberField: vt.number().min(10, 'Number must be at least 10'),
  passwordField: vt.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * More complex example with additional field types
 */
export const MultipleFieldTypes: Story = {
  render: () => {
    const handleSubmit = (data: FieldValues) => {
      console.log('Complex form submitted:', data);
    };

    return (
      <div className="space-y-4 xl:w-1/2">
        <h2 className="text-xl font-bold">Multiple Field Types Debug</h2>
        <p className="text-default-600">
          Test with different input types. Each field should only re-render when
          it&apos;s being modified.
        </p>

        <Form
          onSubmit={handleSubmit}
          validation={complexSchema}
          className="max-w-md space-y-4"
        >
          <Grid>
            <Input
              name="textField"
              label="Text Field"
              placeholder="Type some text..."
            />

            <Input
              name="numberField"
              label="Number Field"
              type="number"
              placeholder="Enter a number..."
            />

            <Input
              name="passwordField"
              label="Password Field"
              type="password"
              placeholder="Enter password..."
            />
          </Grid>
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      </div>
    );
  },
};

// Create a form with many fields to see the performance difference
const manyFieldsSchema = veto({
  field1: vt.string().optional(),
  field2: vt.string().optional(),
  field3: vt.string().optional(),
  field4: vt.string().optional(),
  field5: vt.string().optional(),
});

/**
 * Performance comparison - with many fields
 */
export const PerformanceComparison: Story = {
  render: () => {
    const handleSubmit = (data: FieldValues) => {
      console.log('Many fields form submitted:', data);
    };

    return (
      <div className="space-y-4 xl:w-1/2">
        <h2 className="text-xl font-bold">Performance Test</h2>
        <p className="text-default-600">
          Form with 5 fields. With proper optimization, typing in one field
          should not re-render others.
        </p>

        <Form
          onSubmit={handleSubmit}
          validation={manyFieldsSchema}
          className="max-w-md space-y-4"
        >
          <Grid>
            {Array.from({ length: 5 }, (_, i) => (
              <Input
                key={`field${i + 1}`}
                name={`field${i + 1}`}
                label={`Field ${i + 1}`}
                placeholder={`Type in field ${i + 1}...`}
              />
            ))}
          </Grid>
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      </div>
    );
  },
};
