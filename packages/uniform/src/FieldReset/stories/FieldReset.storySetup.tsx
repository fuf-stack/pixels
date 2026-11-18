import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { fn } from 'storybook/test';

import { number, object, refineObject, string, veto } from '@fuf-stack/veto';

import Form from '../../Form';
import Input from '../../Input';
import SubmitButton from '../../SubmitButton';
import FieldReset from '../FieldReset';

export const onSubmit = fn(action('onSubmit'));

interface FieldResetFormProps {
  /** Includes unchanged values */
  always?: boolean;
  /** Requires a CPU count */
  requiredCpu?: boolean;
}

export const FieldResetForm = ({
  always = false,
  requiredCpu = false,
}: FieldResetFormProps) => {
  const validation = veto(
    refineObject(
      object({
        cpuCount: requiredCpu ? number().min(1) : number().min(1).optional(),
        memory: number().min(1).optional(),
        note: string().optional(),
      }),
    )({
      custom: (data, ctx) => {
        if (Object.keys(data).length === 0) {
          ctx.addIssue({
            code: 'custom',
            message: 'Change at least one value',
          });
        }
      },
    }),
  );

  return (
    <Form
      className={{ form: 'min-w-60' }}
      onSubmit={onSubmit}
      validation={validation}
    >
      <div className="flex flex-col gap-4">
        <FieldReset
          include={always || requiredCpu ? 'always' : 'changed'}
          name="cpuCount"
          resetValue={4}
        >
          {({ transform, resetAction }) => {
            return (
              <Input
                debounceDelay={0}
                endContent={
                  <span className="inline-flex shrink-0 items-center gap-2">
                    <span className="text-small text-default-600">Cores</span>
                    {resetAction}
                  </span>
                }
                label="CPU count"
                name="cpuCount"
                transform={transform}
                type="number"
              />
            );
          }}
        </FieldReset>
        <FieldReset
          include={always ? 'always' : 'changed'}
          name="memory"
          resetValue={16}
        >
          {({ transform, resetAction }) => {
            return (
              <Input
                debounceDelay={0}
                endContent={
                  <span className="inline-flex shrink-0 items-center gap-2">
                    <span className="text-small text-default-600">GB</span>
                    {resetAction}
                  </span>
                }
                label="Memory"
                name="memory"
                transform={transform}
                type="number"
              />
            );
          }}
        </FieldReset>
        <FieldReset
          include={always ? 'always' : 'changed'}
          name="note"
          resetValue="Current settings"
        >
          {({ transform, resetAction }) => {
            return (
              <Input
                debounceDelay={0}
                endContent={resetAction}
                label="Note"
                name="note"
                transform={transform}
              />
            );
          }}
        </FieldReset>
      </div>
      <div className="mt-4 flex justify-end">
        {/* keep the example accessible with the existing button palette */}
        <SubmitButton color="default" />
      </div>
    </Form>
  );
};

export const meta: Meta<typeof FieldReset> = {
  component: FieldReset,
  parameters: { a11y: { test: 'error' } },
  render: () => {
    return <FieldResetForm />;
  },
};

export type Story = StoryObj<typeof FieldReset>;
