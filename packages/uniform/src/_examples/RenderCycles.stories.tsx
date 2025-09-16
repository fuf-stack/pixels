import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FieldValues } from 'react-hook-form';

import { number, string, veto } from '@fuf-stack/veto';

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
  field1: string().min(3, 'Field 1 must be at least 3 characters'),
  field2: string().min(5, 'Field 2 must be at least 5 characters'),
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
          className="max-w-md space-y-4"
          onSubmit={handleSubmit}
          validation={schema}
        >
          <Grid>
            <Input
              label="Field 1 (min 3 chars)"
              name="field1"
              placeholder="Type here..."
            />
            <Input
              label="Field 2 (min 5 chars)"
              name="field2"
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
  textField: string().min(2, 'Text field must be at least 2 characters'),
  numberField: number().min(10, 'Number must be at least 10'),
  passwordField: string().min(6, 'Password must be at least 6 characters'),
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
          className="max-w-md space-y-4"
          onSubmit={handleSubmit}
          validation={complexSchema}
        >
          <Grid>
            <Input
              label="Text Field"
              name="textField"
              placeholder="Type some text..."
            />

            <Input
              label="Number Field"
              name="numberField"
              placeholder="Enter a number..."
              type="number"
            />

            <Input
              label="Password Field"
              name="passwordField"
              placeholder="Enter password..."
              type="password"
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
  field1: string().optional(),
  field2: string().optional(),
  field3: string().optional(),
  field4: string().optional(),
  field5: string().optional(),
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
          className="max-w-md space-y-4"
          onSubmit={handleSubmit}
          validation={manyFieldsSchema}
        >
          <Grid>
            {Array.from({ length: 5 }, (_, i) => {
              return (
                <Input
                  key={`field${i + 1}`}
                  label={`Field ${i + 1}`}
                  name={`field${i + 1}`}
                  placeholder={`Type in field ${i + 1}...`}
                />
              );
            })}
          </Grid>
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      </div>
    );
  },
};
