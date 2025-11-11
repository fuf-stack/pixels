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
        firstName.toLowerCase() === lastName.toLowerCase()
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
