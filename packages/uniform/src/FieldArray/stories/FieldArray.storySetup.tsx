import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { action } from 'storybook/actions';

import {
  array,
  object,
  refineArray,
  refineObject,
  string,
  veto,
} from '@fuf-stack/veto';

import Form from '../../Form';
import SubmitButton from '../../SubmitButton';
import FieldArray from '../FieldArray';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof FieldArray> = {
  title: 'uniform/FieldArray',
  component: FieldArray,
  decorators: [
    (Story, context) => {
      const { parameters } = context;
      const content = (
        <Form
          className={{ form: 'min-w-md' }}
          onSubmit={action('onSubmit')}
          {...(parameters?.formProps ?? {})}
        >
          <Story />
          <div className="mt-4 flex justify-end">
            <SubmitButton />
          </div>
        </Form>
      );
      const renderField = () => {
        return content;
      };
      return parameters.edgeCaseDescription
        ? edgeCaseDecorator(renderField, context)
        : content;
    },
  ],
};

export type Story = StoryObj<typeof FieldArray>;

export const validationDefault = veto({
  arrayField: array(object({ name: string() })).max(3),
});

export const validationFlat = veto({
  arrayField: array(string()).max(3),
});

export const validationDuplicates = veto({
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

export const complexValidator = veto({
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
        return value.name;
      },
      elementErrorPath: ['name'],
    },
  }),
});

export const edgeCaseTopLevelVsArrayValidation = veto(
  refineObject(
    object({
      topLevelValue: string(),
      arrayField: refineArray(array(string()))({
        unique: true,
      }),
    }),
  )({
    custom: (data, ctx) => {
      const { topLevelValue, arrayField } = data;

      if (typeof topLevelValue !== 'string' || !Array.isArray(arrayField)) {
        return;
      }

      const normalizedTopLevelValue = getNormalizedString(topLevelValue);

      if (!normalizedTopLevelValue) {
        return;
      }

      arrayField.forEach((item, index) => {
        const normalizedArrayValue = getNormalizedString(item);
        if (normalizedArrayValue === normalizedTopLevelValue) {
          ctx.addIssue({
            code: 'custom',
            message: 'Array values must be different from the top-level value',
            path: ['arrayField', index],
          });
        }
      });
    },
  }),
);

export const edgeCaseSelectOptions = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma' },
];

const getNormalizedString = (value: unknown): string => {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
};
