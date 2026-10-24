import type { Story } from './FieldCard.storySetup';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { StylingProvider } from '@fuf-stack/pixels/StylingProvider';

import Input from '../../Input';
import {
  meta as sharedMeta,
  styling,
  validationBackupContacts,
  validationHobbies,
  validationPizzaDelivery,
  validationSecretIdentity,
  validationSpaceMission,
  validationTacoOrder,
} from './FieldCard.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'uniform/FieldCard' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
// -----------------------------------------------------------------------------

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

export const ConsumerHeading: Story = {
  ...Default,
  args: {
    ...Default.args,
    className: { label: 'text-heading' },
  },
  decorators: [
    (Story) => {
      return (
        <StylingProvider styling={styling}>
          <style>{'.text-heading { font-size: 18px; }'}</style>
          <Story />
        </StylingProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Pizza Delivery Address' });
    const heading = within(group).getByRole('heading', { level: 3 });
    await expect(heading).toHaveClass('text-heading');
    await expect(heading).not.toHaveClass('text-base');
    await expect(getComputedStyle(heading).fontSize).toBe('18px');
    await expect(heading).toHaveAccessibleName('Pizza Delivery Address');
  },
};
