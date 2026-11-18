import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { number, object, refineObject, string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import Input from '../Input';
import SubmitButton from '../SubmitButton';
import FieldReset from './FieldReset';

const onSubmit = fn(action('onSubmit'));

const FieldResetForm = ({
  always = false,
  requiredCpu = false,
}: {
  always?: boolean;
  requiredCpu?: boolean;
}) => {
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
                    <span className="text-default-600 text-small">Cores</span>
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
                    <span className="text-default-600 text-small">GB</span>
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
        <SubmitButton />
      </div>
    </Form>
  );
};

const meta: Meta<typeof FieldReset> = {
  title: 'uniform/FieldReset',
  component: FieldReset,
  parameters: { a11y: { test: 'error' } },
  render: () => {
    return <FieldResetForm />;
  },
};

export default meta;
type Story = StoryObj<typeof FieldReset>;

export const Default: Story = {};

export const Changed: Story = {
  play: async ({ canvasElement }) => {
    onSubmit.mockClear();
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('form')).toHaveAttribute(
        'data-form-is-valid',
        'false',
      );
    });
    await expect(canvas.getByText('Cores')).toBeVisible();
    await expect(canvas.getByText('GB')).toBeVisible();
    const cpu = canvas.getByRole('textbox', { name: /CPU count/ });
    await userEvent.clear(cpu);
    await userEvent.type(cpu, '8');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Reset to original: cpuCount' }),
    ).toBeVisible();
    const reset = canvas.getByRole('button', {
      name: 'Reset to original: cpuCount',
    });
    await expect(reset.closest('[data-slot="input-wrapper"]')).toBe(
      cpu.closest('[data-slot="input-wrapper"]'),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Submit form' }));
    await expect(onSubmit).toHaveBeenCalledWith(
      { cpuCount: 8 },
      expect.anything(),
    );
  },
};

export const Reset: Story = {
  play: async (context) => {
    await Changed.play?.(context);
    const canvas = within(context.canvasElement);
    const reset = canvas.getByRole('button', {
      name: 'Reset to original: cpuCount',
    });
    reset.focus();
    await expect(reset).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('textbox', { name: /CPU count/ }),
    ).toHaveFocus();
    await expect(
      canvas.getByRole('textbox', { name: /CPU count/ }),
    ).toHaveValue('4');
    await waitFor(() => {
      expect(context.canvasElement.querySelector('form')).toHaveAttribute(
        'data-form-is-valid',
        'false',
      );
    });
  },
};

export const IncludeAlways: Story = {
  render: () => {
    return <FieldResetForm always />;
  },
  play: async ({ canvasElement }) => {
    onSubmit.mockClear();
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: /CPU count/ }),
    ).toHaveValue('4');
    await expect(canvas.getByRole('textbox', { name: /Memory/ })).toHaveValue(
      '16',
    );
    await expect(canvas.getByRole('textbox', { name: /Note/ })).toHaveValue(
      'Current settings',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Submit form' }));
    await expect(onSubmit).toHaveBeenCalledWith(
      { cpuCount: 4, memory: 16, note: 'Current settings' },
      expect.anything(),
    );
  },
};

export const ValidationError: Story = {
  render: () => {
    return <FieldResetForm requiredCpu />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cpu = canvas.getByRole('textbox', { name: /CPU count/ });
    await userEvent.clear(cpu);
    await userEvent.tab();
    await waitFor(() => {
      expect(canvas.getByText('Field is required')).toBeVisible();
    });
    const reset = canvas.getByRole('button', {
      name: 'Reset to original: cpuCount',
    });
    const inputWrapper = cpu.closest('[data-slot="input-wrapper"]');
    await expect(inputWrapper).not.toBeNull();
    await expect(inputWrapper).toContainElement(reset);
    await userEvent.click(reset);
    await expect(cpu).toHaveValue('4');
    await expect(cpu).toHaveFocus();
    await waitFor(() => {
      expect(canvas.queryByText('Field is required')).not.toBeInTheDocument();
    });
  },
};
