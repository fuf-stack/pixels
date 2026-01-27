/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, Card } from '@fuf-stack/pixels';
import { SubmitButton } from '@fuf-stack/uniform';

import { Checkboxes } from '../Checkboxes';
import { FieldArray } from '../FieldArray';
import { Form } from '../Form';
import { useFormContext } from '../hooks/useFormContext';
import { Input } from '../Input';
import { RadioBoxes } from '../RadioBoxes';
import { Radios } from '../Radios';
import { RadioTabs } from '../RadioTabs';
import { Select } from '../Select';
import { Slider } from '../Slider';
import { Switch } from '../Switch';
import { SwitchBox } from '../SwitchBox';
import { TextArea } from '../TextArea';

const meta: Meta<typeof Form> = {
  title: 'uniform/_examples/ProgrammaticReset',
  component: Form,
  decorators: [
    (Story, { args }) => {
      return (
        <Form
          {...(args ?? {})}
          className="min-w-lg"
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

// ============================================================================
// Input, TextArea, Slider Stories
// ============================================================================

interface InputFormData {
  username?: string;
  bio?: string;
  volume?: number;
}

/**
 * Tests reset behavior for Input, TextArea, and Slider with initial values.
 */
export const InputsWithInitialValues: Story = {
  args: {
    initialValues: {
      username: 'john_doe',
      bio: 'Hello, I am John!',
      volume: 75,
    },
  },
  render: () => {
    const { reset } = useFormContext<InputFormData>();

    return (
      <Card
        className={{
          body: 'gap-6',
        }}
        footer={
          <Button
            className="w-full"
            color="danger"
            testId="reset-all"
            onClick={() => {
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <Input label="Username 👤" name="username" />
        <TextArea label="Bio 📝" name="bio" />
        <Slider label="Volume 🔊" name="volume" />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('username')).toHaveValue('john_doe');
    });

    // Change Input and TextArea
    await userEvent.clear(canvas.getByTestId('username'));
    await userEvent.type(canvas.getByTestId('username'), 'jane_doe', {
      delay: 50,
    });
    await userEvent.clear(canvas.getByTestId('bio'));
    await userEvent.type(canvas.getByTestId('bio'), 'I am Jane now!', {
      delay: 50,
    });

    // Change Slider with keyboard
    const thumb = canvas
      .getByTestId('volume')
      .querySelector('[data-slot="thumb"]');
    if (thumb) {
      await userEvent.click(thumb);
      await userEvent.keyboard(
        '{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}',
      );
    }

    // Verify changes
    await waitFor(() => {
      expect(canvas.getByTestId('username')).toHaveValue('jane_doe');
      expect(canvas.getByTestId('bio')).toHaveValue('I am Jane now!');
    });

    // Reset form
    await userEvent.click(canvas.getByTestId('reset-all'));

    // Verify reset to initial values
    await waitFor(() => {
      expect(canvas.getByTestId('username')).toHaveValue('john_doe');
      expect(canvas.getByTestId('bio')).toHaveValue('Hello, I am John!');
    });
  },
};

/**
 * Tests reset behavior for Input, TextArea, and Slider without initial values.
 */
export const InputsWithoutInitialValues: Story = {
  args: {
    // No initialValues provided
  },
  render: () => {
    const { reset } = useFormContext<InputFormData>();

    return (
      <Card
        className={{
          body: 'gap-6',
        }}
        footer={
          <Button
            className="w-full"
            color="danger"
            testId="reset-all"
            onClick={() => {
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <Input label="Username 👤" name="username" />
        <TextArea label="Bio 📝" name="bio" />
        <Slider label="Volume 🔊" name="volume" />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('username')).toBeVisible();
    });

    // Enter values in Input and TextArea
    await userEvent.type(canvas.getByTestId('username'), 'new_user', {
      delay: 50,
    });
    await userEvent.type(canvas.getByTestId('bio'), 'My bio text', {
      delay: 50,
    });

    // Change Slider with keyboard
    const thumb = canvas
      .getByTestId('volume')
      .querySelector('[data-slot="thumb"]');
    if (thumb) {
      await userEvent.click(thumb);
      await userEvent.keyboard(
        '{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}',
      );
    }

    // Verify values were entered
    await waitFor(() => {
      expect(canvas.getByTestId('username')).toHaveValue('new_user');
      expect(canvas.getByTestId('bio')).toHaveValue('My bio text');
    });

    // Reset form
    await userEvent.click(canvas.getByTestId('reset-all'));

    // Verify reset to empty
    await waitFor(() => {
      expect(canvas.getByTestId('username')).toHaveValue('');
      expect(canvas.getByTestId('bio')).toHaveValue('');
    });
  },
};

// ============================================================================
// Select Stories (Single & Multi-Select)
// ============================================================================

interface SelectFormData {
  planet?: string;
  flavors?: string[];
}

/**
 * Tests reset behavior for Select (single & multi) with initial values.
 */
export const SelectWithInitialValues: Story = {
  args: {
    initialValues: {
      planet: 'earth',
      flavors: ['vanilla', 'chocolate'],
    },
  },
  render: () => {
    const { reset } = useFormContext<SelectFormData>();

    return (
      <Card
        className={{
          body: 'gap-6',
        }}
        footer={
          <Button
            className="w-full"
            color="danger"
            testId="reset-all"
            onClick={() => {
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <Select
          label="Favorite Planet 🪐"
          name="planet"
          options={[
            { label: 'Earth', value: 'earth' },
            { label: 'Mars', value: 'mars' },
            { label: 'Jupiter', value: 'jupiter' },
          ]}
        />
        <Select
          multiSelect
          label="Ice Cream Flavors 🍦"
          name="flavors"
          options={[
            { label: 'Vanilla', value: 'vanilla' },
            { label: 'Chocolate', value: 'chocolate' },
            { label: 'Strawberry', value: 'strawberry' },
            { label: 'Mint', value: 'mint' },
          ]}
        />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement?.parentElement as HTMLElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('planet')).toBeVisible();
    });

    // Change single select to Mars
    const planetDropdown = body.getByTestId('planet_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(planetDropdown, { delay: 50 });
    const marsOption = body.getByTestId('planet_select_option_mars')
      .firstChild as HTMLElement;
    await userEvent.click(marsOption, { delay: 50 });

    // Change multi-select - add strawberry
    const flavorsDropdown = body.getByTestId('flavors_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(flavorsDropdown, { delay: 50 });
    const strawberryOption = body.getByTestId(
      'flavors_select_option_strawberry',
    ).firstChild as HTMLElement;
    await userEvent.click(strawberryOption, { delay: 50 });

    // Reset form
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    // Should reset to initial values
  },
};

/**
 * Tests reset behavior for Select (single & multi) without initial values.
 */
export const SelectWithoutInitialValues: Story = {
  args: {
    // No initialValues provided
  },
  render: () => {
    const { reset } = useFormContext<SelectFormData>();

    return (
      <Card
        className={{
          body: 'gap-6',
        }}
        footer={
          <Button
            className="w-full"
            color="danger"
            testId="reset-all"
            onClick={() => {
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <Select
          label="Favorite Planet 🪐"
          name="planet"
          options={[
            { label: 'Earth', value: 'earth' },
            { label: 'Mars', value: 'mars' },
            { label: 'Jupiter', value: 'jupiter' },
          ]}
        />
        <Select
          multiSelect
          label="Ice Cream Flavors 🍦"
          name="flavors"
          options={[
            { label: 'Vanilla', value: 'vanilla' },
            { label: 'Chocolate', value: 'chocolate' },
            { label: 'Strawberry', value: 'strawberry' },
            { label: 'Mint', value: 'mint' },
          ]}
        />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement?.parentElement as HTMLElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('planet')).toBeVisible();
    });

    // Select a planet
    const planetDropdown = body.getByTestId('planet_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(planetDropdown, { delay: 50 });
    const jupiterOption = body.getByTestId('planet_select_option_jupiter')
      .firstChild as HTMLElement;
    await userEvent.click(jupiterOption, { delay: 50 });

    // Select some flavors
    const flavorsDropdown = body.getByTestId('flavors_select_dropdown')
      .parentElement as HTMLElement;
    await userEvent.click(flavorsDropdown, { delay: 50 });
    const vanillaOption = body.getByTestId('flavors_select_option_vanilla')
      .firstChild as HTMLElement;
    await userEvent.click(vanillaOption, { delay: 50 });

    await userEvent.click(flavorsDropdown, { delay: 50 });
    const mintOption = body.getByTestId('flavors_select_option_mint')
      .firstChild as HTMLElement;
    await userEvent.click(mintOption, { delay: 50 });

    // Reset form
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    // Should reset to empty (no selections)
  },
};

// ============================================================================
// Checkboxes, Switch, SwitchBox Stories
// ============================================================================

interface CheckboxSwitchFormData {
  notifications?: string[];
  darkMode?: boolean;
  newsletter?: boolean;
  enableFeature?: boolean;
}

/**
 * Tests reset behavior for Checkboxes, Switch, and SwitchBox with initial values.
 */
export const CheckboxesWithInitialValues: Story = {
  args: {
    initialValues: {
      notifications: ['email', 'sms'],
      darkMode: true,
      newsletter: false,
      enableFeature: true,
    },
  },
  render: () => {
    const { reset } = useFormContext<CheckboxSwitchFormData>();

    return (
      <Card
        className={{
          body: 'gap-6',
        }}
        footer={
          <Button
            className="w-full"
            color="danger"
            testId="reset-all"
            onClick={() => {
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <Checkboxes
          label="Notifications"
          name="notifications"
          options={[
            { label: 'Email 📧', value: 'email' },
            { label: 'SMS 📱', value: 'sms' },
            { label: 'Push 🔔', value: 'push' },
          ]}
        />
        <div className="flex flex-col gap-4">
          <Switch label="Dark Mode 🌙" name="darkMode" />
          <Switch label="Newsletter 📰" name="newsletter" />
        </div>
        <SwitchBox
          description="Enable experimental features"
          label="Enable Feature 🧪"
          name="enableFeature"
        />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('notifications')).toBeVisible();
    });

    // Verify initial values - email and sms checked, push unchecked
    await waitFor(() => {
      expect(canvas.getByTestId('notifications_option_email')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('notifications_option_sms')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(
        canvas.getByTestId('notifications_option_push'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(canvas.getByTestId('darkmode')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('newsletter')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('enablefeature')).toHaveAttribute(
        'data-selected',
        'true',
      );
    });

    // Change values
    await userEvent.click(canvas.getByTestId('notifications_option_email'), {
      delay: 50,
    });
    await userEvent.click(canvas.getByTestId('notifications_option_push'), {
      delay: 50,
    });
    await userEvent.click(canvas.getByTestId('darkmode'), { delay: 50 });
    await userEvent.click(canvas.getByTestId('newsletter'), { delay: 50 });
    await userEvent.click(canvas.getByTestId('enablefeature'), { delay: 50 });

    // Verify changes
    await waitFor(() => {
      expect(
        canvas.getByTestId('notifications_option_email'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(canvas.getByTestId('notifications_option_push')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('darkmode')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('newsletter')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('enablefeature')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
    });

    // Reset all
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    // Should reset to initial values
    await waitFor(() => {
      expect(canvas.getByTestId('notifications_option_email')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('notifications_option_sms')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(
        canvas.getByTestId('notifications_option_push'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(canvas.getByTestId('darkmode')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('newsletter')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('enablefeature')).toHaveAttribute(
        'data-selected',
        'true',
      );
    });
  },
};

/**
 * Tests reset behavior for Checkboxes, Switch, and SwitchBox without initial values.
 */
export const CheckboxesWithoutInitialValues: Story = {
  args: {
    // No initialValues provided
  },
  render: () => {
    const { reset } = useFormContext<CheckboxSwitchFormData>();

    return (
      <Card
        className={{
          body: 'gap-6',
        }}
        footer={
          <Button
            className="w-full"
            color="danger"
            testId="reset-all"
            onClick={() => {
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <Checkboxes
          label="Notifications"
          name="notifications"
          options={[
            { label: 'Email 📧', value: 'email' },
            { label: 'SMS 📱', value: 'sms' },
            { label: 'Push 🔔', value: 'push' },
          ]}
        />
        <div className="flex flex-col gap-4">
          <Switch label="Dark Mode 🌙" name="darkMode" />
          <Switch label="Newsletter 📰" name="newsletter" />
        </div>
        <SwitchBox
          description="Enable experimental features"
          label="Enable Feature 🧪"
          name="enableFeature"
        />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('notifications')).toBeVisible();
    });

    // Initially nothing should be checked
    await waitFor(() => {
      expect(
        canvas.getByTestId('notifications_option_email'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(
        canvas.getByTestId('notifications_option_sms'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(
        canvas.getByTestId('notifications_option_push'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(canvas.getByTestId('darkmode')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('newsletter')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('enablefeature')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
    });

    // Select some options
    await userEvent.click(canvas.getByTestId('notifications_option_email'), {
      delay: 50,
    });
    await userEvent.click(canvas.getByTestId('notifications_option_push'), {
      delay: 50,
    });
    await userEvent.click(canvas.getByTestId('darkmode'), { delay: 50 });
    await userEvent.click(canvas.getByTestId('enablefeature'), { delay: 50 });

    // Verify selections
    await waitFor(() => {
      expect(canvas.getByTestId('notifications_option_email')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('notifications_option_push')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('darkmode')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('enablefeature')).toHaveAttribute(
        'data-selected',
        'true',
      );
    });

    // Reset all - should clear everything
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    await waitFor(() => {
      expect(
        canvas.getByTestId('notifications_option_email'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(
        canvas.getByTestId('notifications_option_sms'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(
        canvas.getByTestId('notifications_option_push'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(canvas.getByTestId('darkmode')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('newsletter')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('enablefeature')).not.toHaveAttribute(
        'data-selected',
        'true',
      );
    });
  },
};

// ============================================================================
// Radios, RadioBoxes, RadioTabs Stories
// ============================================================================

interface RadioFormData {
  radiosField?: string;
  radioBoxesField?: string;
  radioTabsField?: string;
}

/**
 * Demonstrates programmatic reset behavior for all radio-type components with initial values.
 * This story tests that resetField() properly resets each component to its initial value.
 */
export const RadiosWithInitialValues: Story = {
  args: {
    initialValues: {
      radiosField: 'pizza',
      radioBoxesField: 'cat',
      radioTabsField: 'rock',
    },
  },
  render: () => {
    const { reset } = useFormContext<RadioFormData>();

    return (
      <Card
        className={{
          body: 'gap-6',
        }}
        footer={
          <Button
            className="w-full"
            color="danger"
            testId="reset-all"
            onClick={() => {
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <Radios
          inline
          label="Radios: Favorite Food"
          name="radiosField"
          options={[
            { label: 'Pizza 🍕', value: 'pizza' },
            { label: 'Tacos 🌮', value: 'tacos' },
            { label: 'Sushi 🍣', value: 'sushi' },
          ]}
        />
        <RadioBoxes
          label="RadioBoxes: Spirit Animal"
          name="radioBoxesField"
          options={[
            {
              description: 'Independent and judges you silently.',
              label: 'Cat 🐱',
              value: 'cat',
            },
            {
              description: 'Loyal and enthusiastic.',
              label: 'Dog 🐕',
              value: 'dog',
            },
            {
              description: 'Sleeps 20 hours a day.',
              label: 'Sloth 🦥',
              value: 'sloth',
            },
          ]}
        />
        <RadioTabs
          label="RadioTabs: Weapon"
          name="radioTabsField"
          options={[
            { label: 'Rock 🪨', value: 'rock' },
            { label: 'Paper 📄', value: 'paper' },
            { label: 'Scissors ✂️', value: 'scissors' },
          ]}
        />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('radiosfield')).toBeVisible();
    });

    // Change all values from their initial values
    await userEvent.click(canvas.getByTestId('radiosfield_option_tacos'), {
      delay: 50,
    });
    await userEvent.click(canvas.getByTestId('radioboxesfield_option_dog'), {
      delay: 50,
    });
    await userEvent.click(canvas.getByTestId('radiotabsfield_option_paper'), {
      delay: 50,
    });

    // Verify selections changed
    await waitFor(() => {
      expect(canvas.getByTestId('radiosfield_option_tacos')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('radioboxesfield_option_dog')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('radiotabsfield_option_paper')).toHaveAttribute(
        'data-selected',
        'true',
      );
    });

    // Reset all
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    // All should reset to initial values
    await waitFor(() => {
      expect(canvas.getByTestId('radiosfield_option_pizza')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('radioboxesfield_option_cat')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('radiotabsfield_option_rock')).toHaveAttribute(
        'data-selected',
        'true',
      );
    });
  },
};

/**
 * Tests reset behavior when no initial values are set.
 * Resetting should clear the selection entirely (no option selected).
 */
export const RadiosWithoutInitialValues: Story = {
  args: {
    // No initialValues provided
  },
  render: () => {
    const { reset } = useFormContext<RadioFormData>();

    return (
      <Card
        className={{
          body: 'gap-6',
        }}
        footer={
          <Button
            className="w-full"
            color="danger"
            testId="reset-all"
            onClick={() => {
              reset();
            }}
          >
            Reset All
          </Button>
        }
      >
        <Radios
          inline
          label="Radios: Favorite Food"
          name="radiosField"
          options={[
            { label: 'Pizza 🍕', value: 'pizza' },
            { label: 'Tacos 🌮', value: 'tacos' },
            { label: 'Sushi 🍣', value: 'sushi' },
          ]}
        />
        <RadioBoxes
          label="RadioBoxes: Spirit Animal"
          name="radioBoxesField"
          options={[
            {
              description: 'Independent and judges you silently.',
              label: 'Cat 🐱',
              value: 'cat',
            },
            {
              description: 'Loyal and enthusiastic.',
              label: 'Dog 🐕',
              value: 'dog',
            },
            {
              description: 'Sleeps 20 hours a day.',
              label: 'Sloth 🦥',
              value: 'sloth',
            },
          ]}
        />
        <RadioTabs
          label="RadioTabs: Weapon"
          name="radioTabsField"
          options={[
            { label: 'Rock 🪨', value: 'rock' },
            { label: 'Paper 📄', value: 'paper' },
            { label: 'Scissors ✂️', value: 'scissors' },
          ]}
        />
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('radiosfield')).toBeVisible();
    });

    // Initially, no options should be selected
    await waitFor(() => {
      expect(
        canvas.getByTestId('radiosfield_option_pizza'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(
        canvas.getByTestId('radioboxesfield_option_cat'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(
        canvas.getByTestId('radiotabsfield_option_rock'),
      ).not.toHaveAttribute('data-selected', 'true');
    });

    // Select options
    await userEvent.click(canvas.getByTestId('radiosfield_option_pizza'), {
      delay: 50,
    });
    await userEvent.click(canvas.getByTestId('radioboxesfield_option_cat'), {
      delay: 50,
    });
    await userEvent.click(canvas.getByTestId('radiotabsfield_option_rock'), {
      delay: 50,
    });

    // Verify selections
    await waitFor(() => {
      expect(canvas.getByTestId('radiosfield_option_pizza')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('radioboxesfield_option_cat')).toHaveAttribute(
        'data-selected',
        'true',
      );
      expect(canvas.getByTestId('radiotabsfield_option_rock')).toHaveAttribute(
        'data-selected',
        'true',
      );
    });

    // Reset all - should clear all selections
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    await waitFor(() => {
      expect(
        canvas.getByTestId('radiosfield_option_pizza'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(
        canvas.getByTestId('radioboxesfield_option_cat'),
      ).not.toHaveAttribute('data-selected', 'true');
      expect(
        canvas.getByTestId('radiotabsfield_option_rock'),
      ).not.toHaveAttribute('data-selected', 'true');
    });
  },
};

// ============================================================================
// FieldArray Stories
// ============================================================================

/**
 * Tests reset behavior for FieldArray (object array) with initial value.
 */
export const FieldArrayWithInitialValues: Story = {
  args: {
    initialValues: {
      guests: [{ name: 'Alice' }],
    },
  },
  render: () => {
    const { reset } = useFormContext();
    return (
      <>
        <FieldArray
          className="mb-4"
          label="Party Guests 🎉 (Object Array)"
          name="guests"
          testId="guests"
        >
          {({ name }) => {
            return <Input label="Guest Name" name={`${name}.name`} />;
          }}
        </FieldArray>

        <Button
          className="w-full"
          color="danger"
          testId="reset-all"
          onClick={() => {
            reset();
          }}
        >
          Reset All
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('guests_0_name')).toHaveValue('Alice');
    });

    // Change value
    await userEvent.clear(canvas.getByTestId('guests_0_name'));
    await userEvent.type(canvas.getByTestId('guests_0_name'), 'Bob', {
      delay: 50,
    });

    // Add second element
    await userEvent.click(canvas.getByTestId('guests_append_button'), {
      delay: 50,
    });
    await waitFor(() => {
      expect(canvas.getByTestId('guests_1_name')).toBeVisible();
    });

    // Set second value
    await userEvent.type(canvas.getByTestId('guests_1_name'), 'Charlie', {
      delay: 50,
    });

    // Reset
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    // Should reset to initial value
    await waitFor(() => {
      expect(canvas.getByTestId('guests_0_name')).toHaveValue('Alice');
      expect(canvas.queryByTestId('guests_1_name')).not.toBeInTheDocument();
    });
  },
};

/**
 * Tests reset behavior for FieldArray (object array) without initial values.
 */
export const FieldArrayWithoutInitialValues: Story = {
  args: {
    initialValues: {
      guests: [],
    },
  },
  render: () => {
    const { reset } = useFormContext();
    return (
      <>
        <FieldArray
          lastElementNotRemovable
          className="mb-4"
          label="Party Guests 🎉 (Object Array)"
          name="guests"
          testId="guests"
        >
          {({ name }) => {
            return <Input label="Guest Name" name={`${name}.name`} />;
          }}
        </FieldArray>

        <Button
          className="w-full"
          color="danger"
          testId="reset-all"
          onClick={() => {
            reset();
          }}
        >
          Reset All
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for auto-initialized empty element
    await waitFor(() => {
      expect(canvas.getByTestId('guests_0_name')).toHaveValue('');
    });

    // Change value
    await userEvent.type(canvas.getByTestId('guests_0_name'), 'Alice', {
      delay: 50,
    });

    // Add second element
    await userEvent.click(canvas.getByTestId('guests_append_button'), {
      delay: 50,
    });
    await waitFor(() => {
      expect(canvas.getByTestId('guests_1_name')).toBeVisible();
    });

    // Set second value
    await userEvent.type(canvas.getByTestId('guests_1_name'), 'Bob', {
      delay: 50,
    });

    // Reset
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    // Should reset to empty
    await waitFor(() => {
      expect(canvas.getByTestId('guests_0_name')).toHaveValue('');
      expect(canvas.queryByTestId('guests_1_name')).not.toBeInTheDocument();
    });
  },
};

/**
 * Tests reset behavior for flat FieldArray (string array) with initial value.
 */
export const FieldArrayFlatWithInitialValues: Story = {
  args: {
    initialValues: {
      toppings: ['pepperoni'],
    },
  },
  render: () => {
    const { reset } = useFormContext();
    return (
      <>
        <FieldArray
          flat
          className="mb-4"
          label="Pizza Toppings 🍕 (Flat Array)"
          name="toppings"
          testId="toppings"
        >
          {({ name }) => {
            return <Input label="Topping" name={name} />;
          }}
        </FieldArray>

        <Button
          className="w-full"
          color="danger"
          testId="reset-all"
          onClick={() => {
            reset();
          }}
        >
          Reset All
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await waitFor(() => {
      expect(canvas.getByTestId('toppings_0')).toHaveValue('pepperoni');
    });

    // Change value
    await userEvent.clear(canvas.getByTestId('toppings_0'));
    await userEvent.type(canvas.getByTestId('toppings_0'), 'mushrooms', {
      delay: 50,
    });

    // Add second element
    await userEvent.click(canvas.getByTestId('toppings_append_button'), {
      delay: 50,
    });
    await waitFor(() => {
      expect(canvas.getByTestId('toppings_1')).toBeVisible();
    });

    // Set second value
    await userEvent.type(canvas.getByTestId('toppings_1'), 'olives', {
      delay: 50,
    });

    // Reset
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    // Should reset to initial value
    await waitFor(() => {
      expect(canvas.getByTestId('toppings_0')).toHaveValue('pepperoni');
      expect(canvas.queryByTestId('toppings_1')).not.toBeInTheDocument();
    });
  },
};

/**
 * Tests reset behavior for flat FieldArray (string array) without initial values.
 */
export const FieldArrayFlatWithoutInitialValues: Story = {
  args: {
    initialValues: {
      toppings: [],
    },
  },
  render: () => {
    const { reset } = useFormContext();
    return (
      <>
        <FieldArray
          flat
          lastElementNotRemovable
          className="mb-4"
          label="Pizza Toppings 🍕 (Flat Array)"
          name="toppings"
          testId="toppings"
        >
          {({ name }) => {
            return <Input label="Topping" name={name} />;
          }}
        </FieldArray>

        <Button
          className="w-full"
          color="danger"
          testId="reset-all"
          onClick={() => {
            reset();
          }}
        >
          Reset All
        </Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for auto-initialized empty element
    await waitFor(() => {
      expect(canvas.getByTestId('toppings_0')).toHaveValue('');
    });

    // Change value
    await userEvent.type(canvas.getByTestId('toppings_0'), 'pepperoni', {
      delay: 50,
    });

    // Add second element
    await userEvent.click(canvas.getByTestId('toppings_append_button'), {
      delay: 50,
    });
    await waitFor(() => {
      expect(canvas.getByTestId('toppings_1')).toBeVisible();
    });

    // Set second value
    await userEvent.type(canvas.getByTestId('toppings_1'), 'mushrooms', {
      delay: 50,
    });

    // Reset
    await userEvent.click(canvas.getByTestId('reset-all'), { delay: 50 });

    // Should reset to empty
    await waitFor(() => {
      expect(canvas.getByTestId('toppings_0')).toHaveValue('');
      expect(canvas.queryByTestId('toppings_1')).not.toBeInTheDocument();
    });
  },
};
