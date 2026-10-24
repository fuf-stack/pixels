import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

import { Card } from '@fuf-stack/pixels/Card';

import FormProvider from '../../Form/subcomponents/FormContext';
import FormDebugViewer from '../../Form/subcomponents/FormDebugViewer';
import Input from '../../Input';
import SubmitButton from '../../SubmitButton';

const SensitiveFieldsExample = () => {
  return (
    <FormProvider
      debugModeSettings={{ localStorageKey: 'uniform:sensitive-fields-story' }}
      initialValues={{
        username: 'john',
        password: 'Example_123',
        apiToken: 'example-api-token',
      }}
      onSubmit={action('onSubmit')}
      validationTrigger="all"
    >
      {({ handleSubmit }) => {
        return (
          <div className="flex flex-col gap-6">
            <Card
              className="max-w-3xl"
              header={
                <h2 className="font-semibold">
                  Sensitive fields in debug output
                </h2>
              }
            >
              <div className="space-y-2 text-sm">
                <p>
                  Password inputs are redacted automatically. The API Token
                  input uses the explicit “sensitive” prop. Username stays
                  visible.
                </p>
                <p>
                  The debug viewer, copied JSON, and Uniform debug logs replace
                  sensitive values with “[REDACTED]”, even when you reveal the
                  password in its input. Validation and submission still receive
                  the original values.
                </p>
              </div>
            </Card>
            <div className="flex flex-wrap items-start gap-8">
              <form
                className="grid w-80 gap-4"
                noValidate
                onSubmit={handleSubmit}
              >
                <Input label="Username" name="username" />
                <Input label="Password" name="password" type="password" />
                <Input label="API Token" name="apiToken" sensitive />
                <SubmitButton />
              </form>
              <div className="min-w-96" data-testid="sensitive-debug-panel">
                <FormDebugViewer />
              </div>
            </div>
          </div>
        );
      }}
    </FormProvider>
  );
};

const meta: Meta<typeof SensitiveFieldsExample> = {
  title: 'uniform/_examples/Sensitive Fields',
  component: SensitiveFieldsExample,
};

export default meta;
type Story = StoryObj<typeof SensitiveFieldsExample>;

export const PasswordAndToken: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const enable = canvas.queryByRole('button', {
      name: 'Enable form debug mode',
    });
    if (enable) {
      await userEvent.click(enable);
    }
    const debugPanel = canvas.getByTestId('sensitive-debug-panel');
    await expect(within(debugPanel).getAllByText(/\[REDACTED\]/)).toHaveLength(
      2,
    );
    await expect(debugPanel).not.toHaveTextContent('Example_123');
    await expect(debugPanel).not.toHaveTextContent('example-api-token');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show password' }),
    );
    await expect(canvas.getByTestId('password')).toHaveAttribute(
      'type',
      'text',
    );
    await expect(debugPanel).not.toHaveTextContent('Example_123');
  },
};
