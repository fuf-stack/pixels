import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps } from '../Button';

import { useRef, useState } from 'react';

import { action } from 'storybook/actions';

import { tv } from '@fuf-stack/pixel-utils';

import Button, { buttonVariants } from '../Button';

// -----------------------------------------------------------------------------
// Shared metadata and fixtures
// -----------------------------------------------------------------------------

export const meta: Meta<typeof Button> = {
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

export type Story = StoryObj<typeof Button>;

export const colors = Object.keys(buttonVariants.variants.color) as NonNullable<
  ButtonProps['color']
>[];

export const variants = Object.keys(
  buttonVariants.variants.variant,
) as NonNullable<ButtonProps['variant']>[];

export const sizes = Object.keys(buttonVariants.variants.size) as NonNullable<
  ButtonProps['size']
>[];

export const buttonVariantsExtended = tv({
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

export const ButtonWithRefFocus = () => {
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
