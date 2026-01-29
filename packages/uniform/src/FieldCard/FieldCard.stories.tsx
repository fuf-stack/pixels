import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { object, refineObject, string, veto } from '@fuf-stack/veto';

import { Form } from '../Form';
import { Grid } from '../Grid';
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

const validationAddress = veto({
  address: refineObject(
    object({
      street: string().min(3, 'Street must be at least 3 characters'),
      city: string().min(2, 'City must be at least 2 characters'),
      zipCode: string()
        .min(5, 'Zip code must be 5 digits')
        .max(5, 'Zip code must be 5 digits'),
    }),
  )({
    custom: (data, ctx) => {
      const street = (data.street as string | undefined)?.toLowerCase() ?? '';
      const city = data.city as string | undefined;
      const zipCode = data.zipCode as string | undefined;

      // Cross-field validation: if street is a PO Box, ensure zip code starts with specific pattern
      const isPOBox = street.includes('po box') || street.includes('p.o. box');
      if (isPOBox && zipCode && !zipCode.startsWith('9')) {
        ctx.addIssue({
          code: 'custom',
          message: 'PO Box addresses typically use zip codes starting with 9',
        });
      }

      // Ensure address is complete - all fields must be filled together

      const hasAllFields = street && city && zipCode;
      if (!hasAllFields) {
        ctx.addIssue({
          code: 'custom',
          message: 'Complete address required (street, city, and zip code)',
        });
      }
    },
  }),
});

export const Default: Story = {
  parameters: {
    formProps: { validation: validationAddress },
  },
  args: {
    name: 'address',
    label: 'Address',
    children: (
      <Grid>
        <Input label="Street" name="address.street" />
        <Input label="City" name="address.city" />
        <Input label="Zip Code" name="address.zipCode" />
      </Grid>
    ),
  },
};

export const WithInitialValues: Story = {
  parameters: {
    formProps: {
      validation: validationAddress,
      initialValues: {
        address: {
          street: '123 Main St',
          city: 'Springfield',
          zipCode: '12345',
        },
      },
    },
  },
  args: {
    name: 'address',
    label: 'Shipping Address',
    children: (
      <Grid>
        <Input label="Street" name="address.street" />
        <Input label="City" name="address.city" />
        <Input label="Zip Code" name="address.zipCode" />
      </Grid>
    ),
  },
};

export const WithObjectLevelError: Story = {
  parameters: {
    formProps: {
      validation: validationAddress,
      initialValues: {
        address: {
          street: 'a',
          city: 'b',
        },
      },
    },
  },
  args: {
    name: 'address',
    label: 'Delivery Address',
    children: (
      <Grid>
        <Input label="Street" name="address.street" />
        <Input label="City" name="address.city" />
        <Input label="Zip Code" name="address.zipCode" />
      </Grid>
    ),
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Blur all fields to trigger validation
    const streetInput = canvas.getByTestId('address_street');
    await userEvent.click(streetInput);
    await userEvent.tab();

    const cityInput = canvas.getByTestId('address_city');
    await userEvent.click(cityInput);
    await userEvent.tab();

    const zipCodeInput = canvas.getByTestId('address_zipcode');
    await userEvent.click(zipCodeInput);
    await userEvent.tab();

    // Wait for field-level validation errors to appear
    await waitFor(() => {
      expect(canvas.getByTestId('address_street_error')).toBeInTheDocument();
      expect(canvas.getByTestId('address_city_error')).toBeInTheDocument();
    });

    // Wait for object-level (FieldCard) validation error to appear
    await waitFor(() => {
      expect(canvas.getByTestId('address_error')).toBeInTheDocument();
    });
  },
};

const validationProfile = veto({
  profile: refineObject(
    object({
      firstName: string().min(2, 'First name must be at least 2 characters'),
      lastName: string().min(2, 'Last name must be at least 2 characters'),
      email: string().email('Must be a valid email address'),
    }),
  )({
    custom: (data, ctx) => {
      const firstName = data.firstName as string | undefined;
      const lastName = data.lastName as string | undefined;
      const email = data.email as string | undefined;

      // Validate that first and last name are different
      if (
        firstName &&
        lastName &&
        firstName?.toLowerCase() === lastName?.toLowerCase()
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'First name and last name must be different',
        });
      }

      // Validate email domain matches name (example business logic)
      if (email && lastName) {
        const emailLower = email.toLowerCase();
        const lastNameLower = lastName.toLowerCase();

        // Check if email contains the last name
        if (!emailLower.includes(lastNameLower)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Email should contain your last name for company emails',
          });
        }
      }
    },
  }),
});

export const ComplexExample: Story = {
  parameters: {
    formProps: { validation: validationProfile },
  },
  args: {
    name: 'profile',
    label: 'User Profile',
    children: (
      <Grid>
        <Input label="First Name" name="profile.firstName" />
        <Input label="Last Name" name="profile.lastName" />
        <Input label="Email" name="profile.email" />
      </Grid>
    ),
  },
};

const validationMixedRequired = veto({
  contact: object({
    // Required field
    name: string().min(2, 'Name must be at least 2 characters'),
    // Optional field - can be empty
    nickname: string().optional(),
  }),
});

/**
 * Tests that the FieldCard does NOT turn red when an optional field is touched
 * and left empty. The required field is NOT touched, so its error shouldn't show,
 * and therefore the card should not show any error styling.
 */
export const MixedRequiredAndOptional: Story = {
  parameters: {
    formProps: { validation: validationMixedRequired },
  },
  args: {
    name: 'contact',
    label: 'Contact Info',
    children: (
      <Grid>
        <Input label="Name" name="contact.name" />
        <Input label="Nickname" name="contact.nickname" />
      </Grid>
    ),
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // FieldCard should show required asterisk since it has a required child field
    const fieldCardLabel = canvas.getByRole('heading', {
      name: /contact info/i,
    });
    expect(fieldCardLabel.textContent).toContain('*');

    // Touch ONLY the optional field and leave it empty
    // (do NOT touch the required field)
    const nicknameInput = canvas.getByTestId('contact_nickname');
    await userEvent.click(nicknameInput);
    await userEvent.tab();

    // Wait a moment for any validation to occur
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // The FieldCard should NOT have an error state (no red border/text)
    // because:
    // - The optional field has no error (it's optional)
    // - The required field was not touched, so its error is not visible
    // - No object-level (_errors) validation errors exist
    await waitFor(() => {
      // No error shown for optional field
      expect(
        canvas.queryByTestId('contact_nickname_error'),
      ).not.toBeInTheDocument();
      // No error shown for untouched required field
      expect(
        canvas.queryByTestId('contact_name_error'),
      ).not.toBeInTheDocument();
      // No FieldCard-level error
      expect(canvas.queryByTestId('contact_error')).not.toBeInTheDocument();
    });
  },
};

const validationAllOptional = veto({
  preferences: object({
    // All optional fields
    bio: string().optional(),
    website: string().optional(),
  }),
});

/**
 * Tests that when all fields are optional, the FieldCard label does NOT show
 * an asterisk (required indicator).
 */
export const AllOptionalFields: Story = {
  parameters: {
    formProps: { validation: validationAllOptional },
  },
  args: {
    name: 'preferences',
    label: 'Preferences',
    children: (
      <Grid>
        <Input label="Bio" name="preferences.bio" />
        <Input label="Website" name="preferences.website" />
      </Grid>
    ),
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // FieldCard should NOT show required asterisk since all child fields are optional
    const fieldCardLabel = canvas.getByRole('heading', {
      name: /preferences/i,
    });
    expect(fieldCardLabel.textContent).not.toContain('*');

    // Touch both optional fields and leave them empty
    const bioInput = canvas.getByTestId('preferences_bio');
    await userEvent.click(bioInput);
    await userEvent.tab();

    const websiteInput = canvas.getByTestId('preferences_website');
    await userEvent.click(websiteInput);
    await userEvent.tab();

    // Wait a moment for any validation to occur
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // No validation errors should appear for empty optional fields
    await waitFor(() => {
      expect(
        canvas.queryByTestId('preferences_bio_error'),
      ).not.toBeInTheDocument();
      expect(
        canvas.queryByTestId('preferences_website_error'),
      ).not.toBeInTheDocument();
      expect(canvas.queryByTestId('preferences_error')).not.toBeInTheDocument();
    });
  },
};
