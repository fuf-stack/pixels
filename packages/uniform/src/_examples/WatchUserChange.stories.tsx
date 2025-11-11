/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Card } from '@fuf-stack/pixels';
import { SubmitButton } from '@fuf-stack/uniform';

import { Form } from '../Form';
import { Grid } from '../Grid';
import { useFormContext } from '../hooks/useFormContext';
import { useWatchUserChange } from '../hooks/useWatchUserChange';
import { Input } from '../Input';
import { Select } from '../Select';

const meta: Meta<typeof Form> = {
  title: 'uniform/_examples/WatchUserChange',
  component: Form,
  decorators: [
    (Story, { args }) => {
      return (
        <Form
          {...(args ?? {})}
          className="min-w-96"
          onSubmit={action('onSubmit')}
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
type Story = StoryObj<typeof Form>;

interface LocationFormData {
  country?: string;
  city?: string;
  zipCode?: string;
}

interface AnimalFormData {
  animal?: string;
  habitat?: string;
  favoriteSnack?: string;
}

interface UserFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Demonstrates simple field reset behavior.
 * When user changes country, city and zip code are cleared
 * (because your Toronto address doesn't work in Germany).
 */
export const SimpleReset: Story = {
  args: {
    initialValues: {
      country: 'Canada',
    },
  },
  render: () => {
    // Reset dependent fields when user changes country
    useWatchUserChange<LocationFormData>({
      watch: 'country',
      onChange: (value, { resetField }) => {
        resetField('city');
        resetField('zipCode');
      },
    });

    return (
      <Card>
        <Grid>
          <Select
            label="Country"
            name="country"
            options={[
              { label: '🇨🇦 Canada', value: 'Canada' },
              { label: '🇺🇸 USA', value: 'USA' },
              { label: '🇩🇪 Germany', value: 'Germany' },
              { label: '🇯🇵 Japan', value: 'Japan' },
            ]}
          />
          <Input label="City" name="city" placeholder="Enter city..." />
          <Input label="Zip Code" name="zipCode" placeholder="Enter zip..." />
        </Grid>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // User fills in city and zip code for Canada
    const cityInput = canvas.getByTestId('city');
    const zipInput = canvas.getByTestId('zipcode');

    await userEvent.type(cityInput, 'Toronto');
    await userEvent.type(zipInput, 'M5H 2N2');

    await waitFor(() => {
      expect(cityInput).toHaveValue('Toronto');
      expect(zipInput).toHaveValue('M5H 2N2');
    });

    // User changes country to Germany
    const countrySelect = canvas.getByTestId('country');
    await userEvent.click(countrySelect);
    await userEvent.click(canvas.getByText('🇩🇪 Germany'));

    // City and zip should be automatically reset to empty
    await waitFor(() => {
      expect(cityInput).toHaveValue('');
      expect(zipInput).toHaveValue('');
    });
  },
};

/**
 * Demonstrates setting smart defaults for related fields.
 * When user changes animal, the habitat and favorite snack are automatically set
 * to match (because penguins don't live in deserts and hate hot dogs).
 */
export const SmartDefaults: Story = {
  args: {
    initialValues: {
      animal: 'penguin',
      habitat: '❄️ Antarctica (Very Cold)',
      favoriteSnack: '🐟 Fresh Fish',
    },
  },
  render: () => {
    // Set appropriate habitat and snack when user changes animal
    useWatchUserChange<AnimalFormData>({
      watch: 'animal',
      onChange: (value, { setValue }) => {
        if (value === 'penguin') {
          setValue('habitat', '❄️ Antarctica (Very Cold)');
          setValue('favoriteSnack', '🐟 Fresh Fish');
        } else if (value === 'camel') {
          setValue('habitat', '🏜️ Desert (Very Hot)');
          setValue('favoriteSnack', '🌵 Cactus Juice');
        } else if (value === 'sloth') {
          setValue('habitat', '🌴 Rainforest (Very Humid)');
          setValue('favoriteSnack', '🍃 Leaves (Very Slowly)');
        } else {
          setValue('habitat', '🏢 Your Office (Very Boring)');
          setValue('favoriteSnack', '☕ Coffee (Obviously)');
        }
      },
    });

    return (
      <Card>
        <Grid>
          <Select
            label="Choose Your Spirit Animal"
            name="animal"
            options={[
              { label: '🐧 Penguin (Fancy Waddle)', value: 'penguin' },
              { label: '🐪 Camel (Desert King)', value: 'camel' },
              { label: '🦥 Sloth (Ultimate Chill)', value: 'sloth' },
              { label: '🐹 Hamster (Zoom Zoom)', value: 'hamster' },
            ]}
          />
          <Input
            label="Natural Habitat"
            name="habitat"
            placeholder="Where they vibe..."
          />
          <Input
            label="Favorite Snack"
            name="favoriteSnack"
            placeholder="What they munch..."
          />
        </Grid>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initial values should be set
    await waitFor(() => {
      expect(canvas.getByTestId('habitat')).toHaveValue(
        '❄️ Antarctica (Very Cold)',
      );
      expect(canvas.getByTestId('favoritesnack')).toHaveValue('🐟 Fresh Fish');
    });

    // Change to camel
    const animalSelect = canvas.getByTestId('animal');
    await userEvent.click(animalSelect);
    await userEvent.click(canvas.getByText('🐪 Camel (Desert King)'));

    // Habitat and snack should update to camel preferences
    await waitFor(() => {
      expect(canvas.getByTestId('habitat')).toHaveValue('🏜️ Desert (Very Hot)');
      expect(canvas.getByTestId('favoritesnack')).toHaveValue(
        '🌵 Cactus Juice',
      );
    });
  },
};

/**
 * Demonstrates watching multiple fields by calling the hook multiple times.
 * When user changes first or last name, the email is automatically generated.
 * Simple and practical!
 */
export const WatchMultipleFields: Story = {
  args: {
    initialValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
    },
  },
  render: () => {
    const { getValues, setValue } = useFormContext<UserFormData>();

    // Helper to generate email from current first/last name
    const generateEmail = () => {
      const { firstName, lastName } = getValues();
      const email = `${firstName ?? ''}.${lastName ?? ''}@company.com`
        .toLowerCase()
        .replace(/\s+/g, '');
      setValue('email', email);
    };

    // Watch first name changes
    useWatchUserChange<UserFormData>({
      watch: 'firstName',
      onChange: () => {
        generateEmail();
      },
    });

    // Watch last name changes
    useWatchUserChange<UserFormData>({
      watch: 'lastName',
      onChange: () => {
        generateEmail();
      },
    });

    return (
      <Card>
        <Grid>
          <Input
            label="First Name"
            name="firstName"
            placeholder="Enter first name..."
          />
          <Input
            label="Last Name"
            name="lastName"
            placeholder="Enter last name..."
          />
          <Input
            disabled
            className="md:col-span-2"
            label="Company Email (Auto-generated)"
            name="email"
            placeholder="Auto-generated..."
          />
        </Grid>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initial values
    await waitFor(() => {
      expect(canvas.getByTestId('firstname')).toHaveValue('John');
      expect(canvas.getByTestId('lastname')).toHaveValue('Doe');
      expect(canvas.getByTestId('email')).toHaveValue('john.doe@company.com');
    });

    // Change first name
    const firstNameInput = canvas.getByTestId('firstname');
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Jane');

    // Email should update
    await waitFor(() => {
      expect(canvas.getByTestId('email')).toHaveValue('jane.doe@company.com');
    });

    // Change last name
    const lastNameInput = canvas.getByTestId('lastname');
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, 'Smith');

    // Email should update with new last name
    await waitFor(() => {
      expect(canvas.getByTestId('email')).toHaveValue('jane.smith@company.com');
    });
  },
};
