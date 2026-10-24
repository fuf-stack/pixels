import type { Meta, StoryObj } from '@storybook/react-vite';

import edgeCaseDecorator from '@repo/storybook-config/edge-case-decorator';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import FormProvider from '../Form/subcomponents/FormContext';
import FormDebugViewer from '../Form/subcomponents/FormDebugViewer';
import Input from '../Input';
import SubmitButton from '../SubmitButton';
import meta from './SensitiveFields.stories';

const edgeCaseMeta: Meta = {
  ...meta,
  title: 'uniform/_examples/Sensitive Fields/Edge Cases',
  decorators: [...(meta.decorators ?? []), edgeCaseDecorator],
};

export default edgeCaseMeta;
type Story = StoryObj<typeof edgeCaseMeta>;

const onSubmit = fn();

export const CompactedArrays: Story = {
  parameters: {
    edgeCaseDescription:
      'Submission removes empty rows before a password and a nested token. The callback receives compacted values while the debug viewer keeps both secrets redacted. Submit-log redaction is also covered by a focused regression test.',
  },
  render: () => {
    return (
      <FormProvider
        debugModeSettings={{
          localStorageKey: 'uniform:compacted-secrets-story',
        }}
        initialValues={{
          accounts: [
            {},
            {
              password: 'example-password',
              tokens: [{}, { value: 'example-token' }],
            },
          ],
        }}
        onSubmit={onSubmit}
        validationTrigger="all"
      >
        {({ handleSubmit }) => {
          return (
            <div className="flex flex-wrap items-start gap-8">
              <form
                className="grid w-80 gap-4"
                noValidate
                onSubmit={handleSubmit}
              >
                <Input
                  label="Password in the second row"
                  name="accounts.1.password"
                  type="password"
                />
                <Input
                  label="Token in a nested second row"
                  name="accounts.1.tokens.1.value"
                  sensitive
                />
                <SubmitButton />
              </form>
              <div className="min-w-96" data-testid="compacted-debug-panel">
                <FormDebugViewer />
              </div>
            </div>
          );
        }}
      </FormProvider>
    );
  },
  play: async ({ canvasElement }) => {
    onSubmit.mockClear();
    const canvas = within(canvasElement);
    const enable = canvas.queryByRole('button', {
      name: 'Enable form debug mode',
    });
    if (enable) {
      await userEvent.click(enable);
    }
    const panel = canvas.getByTestId('compacted-debug-panel');
    await expect(within(panel).getAllByText(/\[REDACTED\]/)).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: /submit/i }));
    await waitFor(async () => {
      await expect(onSubmit).toHaveBeenCalledOnce();
    });
    await expect(onSubmit.mock.calls[0][0]).toEqual({
      accounts: [
        {
          password: 'example-password',
          tokens: [{ value: 'example-token' }],
        },
      ],
    });
    await expect(panel).not.toHaveTextContent('example-password');
    await expect(panel).not.toHaveTextContent('example-token');
  },
};
