import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { object, refineObject, string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import { Input } from '../Input';
import { SubmitButton } from '../SubmitButton';
import FieldCard from './FieldCard';

const meta: Meta<typeof FieldCard> = {
  title: 'uniform/FieldCard',
  component: FieldCard,
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
type Story = StoryObj<typeof FieldCard>;

// =============================================================================
// BASIC USAGE
// =============================================================================

const validationPizzaDelivery = veto({
  delivery: object({
    street: string().min(3, 'Street too short for delivery driver to find'),
    city: string().min(2, 'City name too short'),
    phone: string().min(10, 'Phone number must have at least 10 digits'),
  }),
});

/**
 * Default FieldCard grouping related form fields together.
 * Perfect for collecting structured data like addresses or contact info.
 */
export const Default: Story = {
  parameters: {
    formProps: { validation: validationPizzaDelivery },
  },
  args: {
    name: 'delivery',
    label: 'Pizza Delivery Address',
    children: (
      <>
        <Input label="Street" name="delivery.street" />
        <Input label="City" name="delivery.city" />
        <Input label="Phone" name="delivery.phone" />
      </>
    ),
  },
};

/**
 * FieldCard with pre-filled initial values.
 * Great for edit forms or when you have saved data.
 */
export const WithInitialValues: Story = {
  parameters: {
    formProps: {
      validation: validationPizzaDelivery,
      initialValues: {
        delivery: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          phone: '555-DONUT',
        },
      },
    },
  },
  args: {
    name: 'delivery',
    label: 'Saved Delivery Address',
    children: (
      <>
        <Input label="Street" name="delivery.street" />
        <Input label="City" name="delivery.city" />
        <Input label="Phone" name="delivery.phone" />
      </>
    ),
  },
};

// =============================================================================
// REQUIRED INDICATOR (ASTERISK)
// =============================================================================

const validationSpaceMission = veto({
  mission: object({
    commander: string().min(2, 'Commander name required'),
    pilot: string().optional(),
  }),
});

/**
 * FieldCard shows asterisk (*) when ANY child field is required.
 * Here, Commander is required but Pilot is optional.
 */
export const Required: Story = {
  parameters: {
    formProps: { validation: validationSpaceMission },
  },
  args: {
    name: 'mission',
    label: 'Space Mission Crew',
    children: (
      <>
        <Input label="Commander" name="mission.commander" />
        <Input label="Pilot" name="mission.pilot" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fieldCardLabel = canvas.getByRole('heading', {
      name: /space mission crew/i,
    });
    // Should show asterisk because Commander is required
    expect(fieldCardLabel.textContent).toContain('*');
  },
};

const validationHobbies = veto({
  hobbies: object({
    favorite: string().optional(),
    secondary: string().optional(),
  }).optional(),
});

/**
 * FieldCard does NOT show asterisk when ALL fields are optional.
 */
export const AllOptional: Story = {
  parameters: {
    formProps: { validation: validationHobbies },
  },
  args: {
    name: 'hobbies',
    label: 'Your Hobbies',
    children: (
      <>
        <Input label="Favorite Hobby" name="hobbies.favorite" />
        <Input label="Secondary Hobby" name="hobbies.secondary" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fieldCardLabel = canvas.getByRole('heading', {
      name: /your hobbies/i,
    });
    // Should NOT show asterisk - all fields are optional
    expect(fieldCardLabel.textContent).not.toContain('*');
  },
};

// =============================================================================
// CROSS-FIELD VALIDATION (OBJECT-LEVEL ERRORS)
// =============================================================================

const validationSecretIdentity = veto({
  identity: refineObject(
    object({
      realName: string().min(2, 'Name too short'),
      heroName: string().min(2, 'Hero name too short'),
      email: string().email('Invalid email format'),
    }),
  )({
    custom: (data, ctx) => {
      const realName = (data.realName as string | undefined)?.toLowerCase();
      const heroName = (data.heroName as string | undefined)?.toLowerCase();
      const email = data.email as string | undefined;

      // Rule 1: Real name and hero name must be different
      if (realName && heroName && realName === heroName) {
        ctx.addIssue({
          code: 'custom',
          message: "Your secret identity isn't very secret if names match!",
        });
      }

      // Rule 2: Email should contain hero name for official hero business
      if (email && heroName && !email.toLowerCase().includes(heroName)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Official hero email must contain your hero name',
        });
      }
    },
  }),
});

/**
 * FieldCard with cross-field validation using `refineObject`.
 * Object-level errors appear in the card footer when multiple fields
 * fail validation rules together (e.g., "names must be different").
 */
export const CrossFieldValidation: Story = {
  parameters: {
    formProps: { validation: validationSecretIdentity },
  },
  args: {
    name: 'identity',
    label: 'Secret Identity Registration',
    children: (
      <>
        <Input label="Real Name" name="identity.realName" />
        <Input label="Hero Name" name="identity.heroName" />
        <Input label="Official Email" name="identity.email" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Enter the same name for both fields (triggers "names must be different")
    const realNameInput = canvas.getByTestId('identity_realname');
    await userEvent.type(realNameInput, 'Bruce');

    const heroNameInput = canvas.getByTestId('identity_heroname');
    await userEvent.click(heroNameInput);
    await userEvent.type(heroNameInput, 'Bruce');
    await userEvent.tab();

    // Wait for object-level error to appear
    await waitFor(() => {
      expect(canvas.getByTestId('identity_error')).toBeInTheDocument();
    });

    // Check for the fun cross-field validation message
    expect(
      canvas.getByText(
        "Your secret identity isn't very secret if names match!",
      ),
    ).toBeInTheDocument();
  },
};

const validationTacoOrder = veto({
  taco: refineObject(
    object({
      shell: string().min(1),
      protein: string().min(1),
      salsa: string().min(1),
    }),
  )({
    custom: (data, ctx) => {
      const shell = data.shell as string | undefined;
      const protein = data.protein as string | undefined;
      const salsa = data.salsa as string | undefined;

      // All parts must be selected for a complete taco
      if (!shell || !protein || !salsa) {
        ctx.addIssue({
          code: 'custom',
          message: 'A proper taco needs shell, protein, AND salsa!',
        });
      }
    },
  }),
});

/**
 * Demonstrates object-level validation errors appearing in the footer.
 * The "incomplete taco" message shows when not all fields are filled.
 */
export const ObjectLevelError: Story = {
  parameters: {
    formProps: {
      validation: validationTacoOrder,
      initialValues: {
        taco: {
          shell: 'c', // too short, triggers field error
          protein: 'b',
        },
      },
    },
  },
  args: {
    name: 'taco',
    label: 'Build Your Taco',
    children: (
      <>
        <Input label="Shell Type" name="taco.shell" />
        <Input label="Protein" name="taco.protein" />
        <Input label="Salsa" name="taco.salsa" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Touch fields to trigger validation
    const shellInput = canvas.getByTestId('taco_shell');
    await userEvent.click(shellInput);
    await userEvent.tab();

    const proteinInput = canvas.getByTestId('taco_protein');
    await userEvent.click(proteinInput);
    await userEvent.tab();

    const salsaInput = canvas.getByTestId('taco_salsa');
    await userEvent.click(salsaInput);
    await userEvent.tab();

    // Wait for object-level error to appear
    await waitFor(() => {
      expect(canvas.getByTestId('taco_error')).toBeInTheDocument();
    });

    // Check the fun error message
    expect(
      canvas.getByText('A proper taco needs shell, protein, AND salsa!'),
    ).toBeInTheDocument();
  },
};

// =============================================================================
// STYLING BEHAVIOR
// =============================================================================

const validationBackupContacts = veto({
  // External trigger field
  trigger: string().optional(),
  contacts: refineObject(
    object({
      email: string().optional(),
      phone: string().optional(),
    }),
  )({
    custom: (data, ctx) => {
      const email = data.email as string | undefined;
      const phone = data.phone as string | undefined;

      if (!email && !phone) {
        ctx.addIssue({
          code: 'custom',
          message: 'Provide at least one way to reach you (email or phone)',
        });
      }
    },
  }),
});

/**
 * Object-level errors show immediately when they exist, but the danger "danger"
 * styling only appears after interacting with a field inside the card.
 *
 * This prevents the jarring experience of a form loading with danger error
 * states before the user has had a chance to fill anything in.
 *
 * Test flow:
 * 1. Error message appears (gray) after external trigger
 * 2. Error message turns danger after touching a field inside the card
 */
export const ErrorStylingBehavior: Story = {
  name: 'Error Styling Danger Transition',
  parameters: {
    formProps: {
      validation: validationBackupContacts,
      initialValues: { contacts: {} },
      validationTrigger: 'all',
    },
  },
  args: {
    name: 'contacts',
    label: 'Backup Contacts',
    children: (
      <>
        <Input label="Email" name="contacts.email" />
        <Input label="Phone" name="contacts.phone" />
      </>
    ),
  },
  decorators: [
    (Story) => {
      return (
        <>
          <Input
            className="mb-4"
            label="Type here to trigger validation"
            name="trigger"
          />
          <Story />
        </>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fieldCardLabel = canvas.getByRole('heading', {
      name: /backup contacts/i,
    });

    // Initially: no error styling
    expect(fieldCardLabel).not.toHaveClass('text-danger');

    // Type in trigger field to run form validation
    const triggerInput = canvas.getByTestId('trigger');
    await userEvent.type(triggerInput, 'hello');
    await userEvent.tab();

    // Error message appears (in gray, not danger yet)
    await waitFor(() => {
      expect(canvas.getByTestId('contacts_error')).toBeInTheDocument();
    });
    expect(fieldCardLabel).not.toHaveClass('text-danger');

    // Now touch a field inside the FieldCard
    const emailInput = canvas.getByTestId('contacts_email');
    await userEvent.click(emailInput);
    await userEvent.tab();

    // Error styling turns red
    await waitFor(() => {
      expect(fieldCardLabel).toHaveClass('text-danger');
    });
  },
};

// =============================================================================
// EDGE CASES
// =============================================================================

const validationOptionalNickname = veto({
  user: object({
    username: string().min(3, 'Username must be at least 3 characters'),
    nickname: string().optional(),
  }),
});

/**
 * Edge case: Touching an optional field should NOT trigger error styling.
 *
 * The card should only show errors when:
 * - A required field is touched and invalid, or
 * - An object-level error exists and any field is touched
 *
 * Touching just an optional empty field? No danger styling.
 */
export const EdgeCaseOptionalFieldTouched: Story = {
  name: 'Edge Case: Optional Field Touch',
  parameters: {
    formProps: { validation: validationOptionalNickname },
  },
  args: {
    name: 'user',
    label: 'User Profile',
    children: (
      <>
        <Input label="Username" name="user.username" />
        <Input label="Nickname (optional)" name="user.nickname" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fieldCardLabel = canvas.getByRole('heading', {
      name: /user profile/i,
    });

    // Touch ONLY the optional nickname field
    const nicknameInput = canvas.getByTestId('user_nickname');
    await userEvent.click(nicknameInput);
    await userEvent.tab();

    // Wait a moment for validation
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // Card should NOT be danger - optional field has no error
    expect(fieldCardLabel).not.toHaveClass('text-danger');

    // No errors should be visible
    expect(canvas.queryByTestId('user_nickname_error')).not.toBeInTheDocument();
    expect(canvas.queryByTestId('user_username_error')).not.toBeInTheDocument();
    expect(canvas.queryByTestId('user_error')).not.toBeInTheDocument();
  },
};
