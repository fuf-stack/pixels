import type { Meta, StoryObj } from '@storybook/react';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { action } from '@storybook/addon-actions';
import { expect, userEvent, within } from '@storybook/test';

import { SubmitButton } from '@fuf-stack/uniform';
import { veto } from '@fuf-stack/veto';
import * as vt from '@fuf-stack/veto';

import { Form } from '../Form';
import { Grid } from '../Grid';
import { useClientValidation } from '../hooks';
import { Input } from '../Input';
import { Select } from '../Select';

// Mock data - existing usernames per team
const MOCK_EXISTING_USERNAMES = {
  'team-frontend': ['john', 'sarah', 'mike'],
  'team-backend': ['alice', 'bob', 'charlie'],
  'team-design': ['emma', 'david'],
} as const;

// Mock query hook that simulates fetching existing usernames for a team
const useMockUsernamesQuery = (teamId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ existingUsernames: string[] } | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!teamId) {
      setData(undefined);
      return;
    }

    setLoading(true);
    // Simulate API delay
    const timeout = setTimeout(() => {
      const usernames = [
        ...(MOCK_EXISTING_USERNAMES[
          teamId as keyof typeof MOCK_EXISTING_USERNAMES
        ] || []),
      ];
      setData({ existingUsernames: usernames });
      setLoading(false);
    }, 300);

    // eslint-disable-next-line consistent-return
    return function cleanup() {
      clearTimeout(timeout);
    };
  }, [teamId]);

  return { data, loading };
};

// Simple client validation schema factory that creates a validation object
const createUsernameClientSchema = (queryData: {
  existingUsernames: string[];
}) => {
  const schema = veto(
    vt.objectLoose({
      username: vt
        .string()
        .refine(
          (value: string) =>
            !queryData.existingUsernames.includes(value.toLowerCase()),
          {
            message: 'Username already exists in this team',
          },
        ),
    }),
  );

  return schema;
};

// Simple component demonstrating client validation
const SimpleClientValidationForm = () => {
  const { watch } = useFormContext();
  const teamId = watch('teamId');

  // Call the query hook directly in the component
  const { data: queryData, loading } = useMockUsernamesQuery(teamId);

  // Use the simplified client validation hook
  useClientValidation(queryData, createUsernameClientSchema);

  return (
    <Grid>
      <Select
        name="teamId"
        label="Select Team"
        options={[
          { label: 'Frontend Team', value: 'team-frontend' },
          { label: 'Backend Team', value: 'team-backend' },
          { label: 'Design Team', value: 'team-design' },
        ]}
      />
      <Input name="username" label="Username" placeholder="Enter username" />
      <Input name="email" label="Email" placeholder="Enter email" />
      {queryData && (
        <div className="rounded bg-info-50 p-3 text-sm">
          <strong>Existing usernames in team:</strong>{' '}
          {queryData.existingUsernames.join(', ')}
        </div>
      )}
      <div className="rounded bg-default-50 p-3 text-sm">
        <strong>Client Validation:</strong>{' '}
        {queryData && !loading ? '✅ Active' : '❌ Inactive'}
        <br />
        <small className="mt-1 block text-default-600">
          Try typing an existing username to see validation errors!
        </small>
      </div>
    </Grid>
  );
};

// Base validation schema
const validationSchema = veto({
  teamId: vt.string(),
  username: vt.string().min(3),
  email: vt.string().email(),
});

const meta: Meta<typeof SimpleClientValidationForm> = {
  title: 'uniform/Examples/ClientValidation',
  component: SimpleClientValidationForm,
  decorators: [
    (Story, { parameters }) => (
      <Form
        className="max-w-md"
        onSubmit={action('onSubmit')}
        {...(parameters?.formProps || {})}
      >
        <Story />

        <div className="mt-6">
          <SubmitButton />
        </div>
      </Form>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SimpleClientValidationForm>;

export const Default: Story = {
  parameters: {
    formProps: {
      validation: validationSchema,
    },
  },
};

export const WithInitialData: Story = {
  parameters: {
    formProps: {
      validation: validationSchema,
      initialValues: {
        teamId: 'team-frontend',
        // INFO: This will only trigger client validation error on field change or submit
        username: 'john',
        email: 'john@example.com',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  parameters: {
    formProps: {
      validation: validationSchema,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the team select dropdown
    const teamDropdown = canvas.getByTestId('teamid_select_dropdown');
    await userEvent.click(teamDropdown, { delay: 100 });

    // Select 'team-frontend' option
    const frontendOption = canvas.getByTestId(
      'teamid_select_option_team_frontend',
    ).firstChild as HTMLElement;
    await userEvent.click(frontendOption, { delay: 100 });

    // Wait for query
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    // Type an existing username
    const usernameInput = canvas.getByTestId('username');
    await userEvent.type(usernameInput, 'john');

    // Verify validation is active
    const statusText = canvas.getByText('✅ Active');
    await expect(statusText).toBeInTheDocument();

    // Check for validation error
    await expect(
      canvas.getByText('Username already exists in this team'),
    ).toBeInTheDocument();
  },
};
