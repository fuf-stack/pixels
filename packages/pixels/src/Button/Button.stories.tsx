import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps } from './Button';

import { useRef, useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

import { tv } from '@fuf-stack/pixel-utils';

import Button, { buttonVariants } from './Button';

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

const colors = [...Object.keys(buttonVariants.variants.color)];
const variants = [...Object.keys(buttonVariants.variants.variant)];
const sizes = [...Object.keys(buttonVariants.variants.size)];

export const Default: Story = {
  args: {},
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
    icon: <FaEnvelope />,
    children: undefined,
    color: 'danger',
    size: 'sm',
    // variant: 'light',
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
              <Button color={color as ButtonProps['color']}>{color}</Button>
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
        {['sm', 'md', 'lg', 'none', 'full'].map((radius) => {
          return (
            <div key={radius} style={{ marginTop: '10px' }}>
              <Button radius={radius as ButtonProps['radius']} {...args}>
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
              <Button size={size as ButtonProps['size']} {...args}>
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
              <Button variant={variant as ButtonProps['variant']} {...args}>
                {variant}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

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
          onClick={handleFocusClick}
          testId="focus-trigger"
          onBlur={() => {
            setFocusedButton(null);
          }}
          onFocus={() => {
            setFocusedButton('trigger');
          }}
        >
          Focus Target
        </Button>
        <Button
          ref={targetButtonRef}
          color="success"
          onClick={action('target-clicked')}
          testId="focus-target"
          onBlur={() => {
            setFocusedButton(null);
          }}
          onFocus={() => {
            setFocusedButton('target');
          }}
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
