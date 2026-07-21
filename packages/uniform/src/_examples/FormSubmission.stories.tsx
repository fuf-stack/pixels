import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Card } from '@fuf-stack/pixels/Card';
import { string, veto } from '@fuf-stack/veto';

import Form from '../Form';
import Grid from '../Grid';
import { useFormContext } from '../hooks/useFormContext';
import Input from '../Input';
import SubmitButton from '../SubmitButton';

const meta: Meta<typeof Form> = {
  title: 'uniform/Examples/FormSubmission',
  component: Form,
};

export default meta;
type Story = StoryObj<typeof meta>;

// both fields are required and must be at least 3 characters (invalid while empty)
const requiredFieldsValidation = veto({
  firstName: string({ min: 3 }),
  lastName: string({ min: 3 }),
});

/**
 * Reads the react-hook-form `formState` from context (via `useFormContext`) and
 * renders it, so the submit lifecycle (`isSubmitting`, `isSubmitSuccessful`,
 * `submitCount`, `isValid`) is both visible in the story and assertable in tests.
 * Must be rendered inside the `<Form>` to read the form context.
 */
const FormStateReadout = () => {
  const {
    formState: { isValid, isSubmitting, isSubmitSuccessful, submitCount },
  } = useFormContext();
  return (
    <Card className="mt-6" header="Form State">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-small">
        <dt className="text-default-500">isValid</dt>
        <dd className="text-right font-mono" data-testid="state_is_valid">
          {String(isValid)}
        </dd>
        <dt className="text-default-500">isSubmitting</dt>
        <dd className="text-right font-mono" data-testid="state_is_submitting">
          {String(isSubmitting)}
        </dd>
        <dt className="text-default-500">isSubmitSuccessful</dt>
        <dd
          className="text-right font-mono"
          data-testid="state_is_submit_successful"
        >
          {String(isSubmitSuccessful)}
        </dd>
        <dt className="text-default-500">submitCount</dt>
        <dd className="text-right font-mono" data-testid="state_submit_count">
          {submitCount}
        </dd>
      </dl>
    </Card>
  );
};

/**
 * Basic form submission. The `SubmitButton` is a native `type="submit"` button
 * inside the `<Form>`, so submission is handled entirely by the browser:
 * - clicking the button submits the form,
 * - pressing Enter in a field triggers native implicit form submission.
 *
 * Either way react-hook-form validates the whole form first — invalid fields
 * turn red and `onSubmit` only runs once the form is valid.
 */
export const FormSubmission: Story = {
  render: () => {
    return (
      <Form
        className="min-w-lg"
        onSubmit={action('onSubmit')}
        validation={requiredFieldsValidation}
      >
        <Grid>
          <Input label="First name" name="firstName" />
          <Input label="Last name" name="lastName" />
        </Grid>
        <div className="mt-6">
          <SubmitButton>Submit (inside form)</SubmitButton>
        </div>
        <FormStateReadout />
      </Form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // clicking submits the form; the empty form is invalid, so validation runs
    // and both required fields show an error
    await userEvent.click(canvas.getByTestId('form_submit_button'));

    await waitFor(() => {
      expect(canvas.getByTestId('firstname_error')).toBeVisible();
      expect(canvas.getByTestId('lastname_error')).toBeVisible();
    });

    // the invalid submit was counted but did not succeed
    expect(canvas.getByTestId('state_is_valid')).toHaveTextContent('false');
    expect(canvas.getByTestId('state_is_submit_successful')).toHaveTextContent(
      'false',
    );
    expect(canvas.getByTestId('state_submit_count')).toHaveTextContent('1');
  },
};

/**
 * Submitting with Enter: pressing Enter inside a form field triggers the
 * browser's native "implicit form submission" — the same as clicking the
 * SubmitButton (which is a real `type="submit"` control). The whole form is
 * validated (invalid fields turn red) and `onSubmit` runs when it is valid.
 */
export const SubmitWithEnter: Story = {
  render: () => {
    return (
      <Form
        className="min-w-lg"
        onSubmit={action('onSubmit')}
        validation={requiredFieldsValidation}
      >
        <Grid>
          <Input label="First name" name="firstName" />
          <Input label="Last name" name="lastName" />
        </Grid>
        <div className="mt-6">
          <SubmitButton>Submit</SubmitButton>
        </div>
        <FormStateReadout />
      </Form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // pressing Enter in a field submits the form (native implicit submission);
    // the empty form is invalid, so both required fields show an error
    await userEvent.type(canvas.getByTestId('firstname'), '{Enter}');

    await waitFor(() => {
      expect(canvas.getByTestId('firstname_error')).toBeVisible();
      expect(canvas.getByTestId('lastname_error')).toBeVisible();
    });

    // native implicit submission counts as a submit attempt, but the invalid
    // form did not submit successfully
    expect(canvas.getByTestId('state_is_valid')).toHaveTextContent('false');
    expect(canvas.getByTestId('state_is_submit_successful')).toHaveTextContent(
      'false',
    );
    expect(canvas.getByTestId('state_submit_count')).toHaveTextContent('1');
  },
};

/**
 * The SubmitButton, with its `loading` prop wired to the form's `isSubmitting`
 * state so it shows a spinner (and is disabled) while `onSubmit` is running.
 * Must be rendered inside the `<Form>` to read the form context.
 */
const SubmitWithLoading = () => {
  const {
    formState: { isSubmitting },
  } = useFormContext();
  return <SubmitButton loading={isSubmitting}>Submit</SubmitButton>;
};

// simulates a slow backend request so the submitting state is observable
const LongRunningSubmitDemo = () => {
  return (
    <Form
      className="min-w-lg"
      // onSubmit returns a promise; react-hook-form keeps formState.isSubmitting
      // true until it settles
      onSubmit={async (values) => {
        // simulate a slow request (e.g. a network call)
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        action('onSubmit')(values);
      }}
      validation={requiredFieldsValidation}
    >
      <Grid>
        <Input label="First name" name="firstName" />
        <Input label="Last name" name="lastName" />
      </Grid>
      <div className="mt-6">
        <SubmitWithLoading />
      </div>
      <FormStateReadout />
    </Form>
  );
};

/**
 * Long-running submission: when `onSubmit` returns a promise (e.g. a network
 * call), react-hook-form exposes the lifecycle via `formState`. Here the
 * SubmitButton's `loading` prop is wired to `isSubmitting`, so the button shows
 * a spinner and is disabled until the request settles. The play function asserts
 * the state transitions: `isSubmitting` flips to true during the request, then
 * back to false, with `isSubmitSuccessful` true and `submitCount` incremented.
 */
export const LongRunningSubmit: Story = {
  render: () => {
    return <LongRunningSubmitDemo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // before submitting: pristine submit state
    expect(canvas.getByTestId('state_is_submitting')).toHaveTextContent(
      'false',
    );
    expect(canvas.getByTestId('state_is_submit_successful')).toHaveTextContent(
      'false',
    );
    expect(canvas.getByTestId('state_submit_count')).toHaveTextContent('0');

    // fill in valid values so the form actually submits and onSubmit runs
    await userEvent.type(canvas.getByTestId('firstname'), 'John');
    await userEvent.type(canvas.getByTestId('lastname'), 'Doe');

    // clicking submits the valid form; onSubmit runs a slow request
    await userEvent.click(canvas.getByTestId('form_submit_button'));

    // while the request is pending, isSubmitting is true and the button loads
    await waitFor(() => {
      expect(canvas.getByTestId('state_is_submitting')).toHaveTextContent(
        'true',
      );
    });
    expect(canvas.getByTestId('form_submit_button')).toHaveAttribute(
      'data-loading',
      'true',
    );

    // once it resolves: submitting clears, the submit succeeded and was counted
    await waitFor(
      () => {
        expect(canvas.getByTestId('state_is_submitting')).toHaveTextContent(
          'false',
        );
      },
      { timeout: 3000 },
    );
    expect(canvas.getByTestId('form_submit_button')).not.toHaveAttribute(
      'data-loading',
    );
    expect(canvas.getByTestId('state_is_submit_successful')).toHaveTextContent(
      'true',
    );
    expect(canvas.getByTestId('state_submit_count')).toHaveTextContent('1');
    expect(canvas.getByTestId('state_is_valid')).toHaveTextContent('true');
  },
};

// shared id linking the out-of-form SubmitButton to the Form
const REMOTE_FORM_ID = 'remote-form-submission';

/**
 * Remote form submission: the `SubmitButton` is rendered OUTSIDE the `<form>`
 * (e.g. a modal footer) and associated with it via the native HTML `form`
 * attribute — set the same id on `<Form remoteFormId>` and on
 * `<SubmitButton remoteFormId>`. Clicking the button then submits the remote form
 * natively, without any form context.
 *
 * NOTE: Native submission fires only on trusted events — manual/visual demo.
 */
export const RemoteFormSubmission: Story = {
  render: () => {
    return (
      <>
        <Form
          className="min-w-lg"
          onSubmit={action('onSubmit')}
          remoteFormId={REMOTE_FORM_ID}
          validation={requiredFieldsValidation}
        >
          <Grid>
            <Input label="First name" name="firstName" />
            <Input label="Last name" name="lastName" />
          </Grid>
          {/* inside the <Form> so it can read the form context */}
          <FormStateReadout />
        </Form>
        {/* outside the <Form>, linked via remoteFormId (native form attribute) */}
        <div className="mt-6">
          <SubmitButton remoteFormId={REMOTE_FORM_ID}>
            Submit (outside form, via remoteFormId)
          </SubmitButton>
        </div>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // clicking the out-of-form button submits the associated form natively; the
    // empty form is invalid, so both required fields show an error
    await userEvent.click(canvas.getByTestId('form_submit_button'));

    await waitFor(() => {
      expect(canvas.getByTestId('firstname_error')).toBeVisible();
      expect(canvas.getByTestId('lastname_error')).toBeVisible();
    });

    // the remote submit reached the form (submit counted) but was invalid
    expect(canvas.getByTestId('state_is_valid')).toHaveTextContent('false');
    expect(canvas.getByTestId('state_is_submit_successful')).toHaveTextContent(
      'false',
    );
    expect(canvas.getByTestId('state_submit_count')).toHaveTextContent('1');
  },
};
