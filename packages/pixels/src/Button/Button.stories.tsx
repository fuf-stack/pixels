import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps } from './Button';

import { useRef, useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { tv } from '@fuf-stack/pixel-utils';

import Button, { buttonVariants } from './Button';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: Meta<typeof Button> = {
  title: 'pixels/Button',
  component: Button,
  args: {
    onClick: action('onClick'),
  },
  argTypes: {
    color: {
      control: { type: 'radio' },
      options: Object.keys(buttonVariants.variants.color),
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

const colors = Object.keys(buttonVariants.variants.color) as NonNullable<
  ButtonProps['color']
>[];
const variants = Object.keys(buttonVariants.variants.variant) as NonNullable<
  ButtonProps['variant']
>[];
const sizes = Object.keys(buttonVariants.variants.size) as NonNullable<
  ButtonProps['size']
>[];

// -----------------------------------------------------------------------------
// Normal stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: { children: 'Button' },
};

export const Basic: Story = {
  args: {
    children: 'Button',
    testId: 'some-test-id',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Button',
    disabled: true,
  },
};

export const IconOnly: Story = {
  args: {
    ariaLabel: 'Email',
    icon: <FaEnvelope />,
    children: undefined,
    color: 'danger',
    size: 'sm',
  },
};

export const Loading: Story = {
  args: {
    children: 'Button',
    loading: true,
  },
};

export const Ripple: Story = {
  args: {
    children: 'Ripple',
    ripple: true,
  },
};

export const DisabledAnimation: Story = {
  args: {
    children: 'Button',
    disableAnimation: true,
  },
};

export const AllColors: Story = {
  render: () => {
    return (
      <>
        {colors.map((color) => {
          return (
            <div key={color} style={{ marginTop: '10px' }}>
              <Button color={color}>{color}</Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const AllRadius: Story = {
  render: (args) => {
    return (
      <>
        {(['sm', 'md', 'lg', 'none', 'full'] as const).map((radius) => {
          return (
            <div key={radius} style={{ marginTop: '10px' }}>
              <Button radius={radius} {...args}>
                {radius}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const AllSizes: Story = {
  render: (args) => {
    return (
      <>
        {sizes.map((size) => {
          return (
            <div key={size} style={{ marginTop: '10px' }}>
              <Button size={size} {...args}>
                {size}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const AllVariants: Story = {
  render: (args) => {
    return (
      <>
        {variants.map((variant) => {
          return (
            <div key={variant} style={{ marginTop: '10px' }}>
              <Button variant={variant} {...args}>
                {variant}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

// -----------------------------------------------------------------------------
// Composition stories
// -----------------------------------------------------------------------------

const buttonVariantsExtended = tv({
  extend: buttonVariants,
  variants: {
    size: {
      sm: 'rounded-none',
      md: 'rounded-none',
      lg: 'rounded-none',
    },
  },
  compoundVariants: [
    {
      variant: 'solid',
      color: 'default',
      class: 'bg-warning-500',
    },
  ],
});

export const ExtendVariantStyles: Story = {
  args: {
    children: 'Extended Button',
    className: 'text-success',
  },
  render: ({ color = 'default', variant = 'solid', size = 'md', ...rest }) => {
    // className from slots
    const extendedClassNames = buttonVariantsExtended({
      color,
      variant,
      size,
      ...rest,
    });

    return <Button {...rest} className={extendedClassNames} />;
  },
};

const ButtonWithRefFocus = () => {
  const targetButtonRef = useRef<HTMLButtonElement>(null);
  const [focusedButton, setFocusedButton] = useState<string | null>(null);

  const handleFocusClick = () => {
    targetButtonRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-default-500">
        Click the &quot;Focus Target&quot; button to programmatically focus the
        target button using ref
      </p>
      <div className="flex gap-2">
        <Button
          onBlur={() => {
            setFocusedButton(null);
          }}
          onClick={handleFocusClick}
          onFocus={() => {
            setFocusedButton('trigger');
          }}
          testId="focus-trigger"
        >
          Focus Target
        </Button>
        <Button
          ref={targetButtonRef}
          color="success"
          onBlur={() => {
            setFocusedButton(null);
          }}
          onClick={action('target-clicked')}
          onFocus={() => {
            setFocusedButton('target');
          }}
          testId="focus-target"
        >
          Target Button
        </Button>
      </div>
      <div className="text-sm">
        <strong>Currently focused:</strong>{' '}
        {focusedButton === 'trigger' && (
          <span className="text-default-500">Focus Target button</span>
        )}
        {focusedButton === 'target' && (
          <span className="text-success">Target Button (via ref!)</span>
        )}
        {!focusedButton && <span className="text-default-400">None</span>}
      </div>
    </div>
  );
};

export const WithRef: Story = {
  render: () => {
    return <ButtonWithRefFocus />;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Click the "Focus Target" button
    const focusTrigger = canvas.getByTestId('focus-trigger');
    await userEvent.click(focusTrigger);

    // Verify the target button is now focused (via ref)
    const focusIndicator = canvas.getByText('Target Button (via ref!)');
    await expect(focusIndicator).toBeInTheDocument();

    // The target button should now be focused - click it
    const targetButton = canvas.getByTestId('focus-target');
    await expect(targetButton).toHaveFocus();
    await userEvent.click(targetButton);
  },
};

// -----------------------------------------------------------------------------
// Interaction stories
// -----------------------------------------------------------------------------

export const KeyboardActivation: Story = {
  args: { children: 'Activate', onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Activate' });
    button.focus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('data-focus-visible', 'true');
  },
};

export const RippleCleanup: Story = {
  args: { children: 'Ripple', ripple: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Ripple' }));
    await expect(
      canvasElement.querySelector('[data-slot="ripple"]'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-slot="ripple"]'),
      ).not.toBeInTheDocument();
    });
  },
};
