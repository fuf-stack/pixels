/* eslint-disable import-x/no-extraneous-dependencies */

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ToastProps } from './addToast';

import { action } from 'storybook/actions';

import { addToast, Toast, toastVariants } from '.';
import { Button } from '../Button';
import ToastProvider from './ToastProvider';

const meta: Meta<typeof addToast> = {
  title: 'pixels/Toast',
  component: Toast,
  args: {
    onClose: action('closed'),
  },
  decorators: [
    (Story) => {
      return (
        <>
          <ToastProvider placement="top-center" />
          <Story />
        </>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof addToast>;

export const Default: Story = {
  args: {
    title: "Something's Up",
  },
  render: (args) => {
    return (
      <Button
        onClick={() => {
          addToast(args);
        }}
      >
        Show success toast
      </Button>
    );
  },
};

export const AllProps: Story = {
  args: {
    className: { progressIndicator: 'moep1' },
    title: "Something's Up",
    description: 'A message of varying importance has been detected.',
    color: 'info' as ToastProps['color'],
    variant: 'bordered' as ToastProps['variant'],
    timeout: 60000,
    closeIcon: undefined,
    endContent: 'the end',
    icon: undefined,
    loadingIcon: undefined,
    shouldShowTimeoutProgress: true,
    showCloseButton: true,
    showIcon: true,
    placement: 'top-right',
  },
  render: (args) => {
    return (
      <Button
        onClick={() => {
          addToast(args);
        }}
      >
        Show toast
      </Button>
    );
  },
};

export const AllColors: Story = {
  render: () => {
    return (
      <>
        {[...Object.keys(toastVariants.variants.color)].map((color) => {
          return (
            <div key={color} className="mb-12">
              <h2 className="mb-4 text-lg font-bold">{color}</h2>
              <Button
                onClick={() => {
                  addToast({
                    title: "Something's Up",
                    description:
                      'A message of varying importance has been detected.',
                    variant: 'bordered',
                    color: color as ToastProps['color'],
                  });
                }}
              >
                {color}
              </Button>
            </div>
          );
        })}
      </>
    );
  },
};

export const AllVariants: Story = {
  render: (_args) => {
    return (
      <>
        {Object.keys(toastVariants.variants.variant).map((variant) => {
          return (
            <div key={variant} className="mb-6">
              <div className="mb-2 text-sm text-foreground">{variant}</div>
              <Button>{variant}</Button>
            </div>
          );
        })}
      </>
    );
  },
  args: {
    title: "Something's Up",
    description: 'A message of varying importance has been detected.',
    color: 'info' as ToastProps['color'],
    timeout: 0,
  },
};

export const LongContent: Story = {
  args: {
    className: { progressIndicator: 'moep1' },
    title: "The Toast That Won't Shut Up (and Other Charming Qualities)",
    description:
      "Ever needed to tell your users something important, but also wanted to channel your inner toddler and just yell it at them repeatedly? Then you've come to the right place! This story showcases the HeroUI/NextUI Toast component – a powerful tool for delivering notifications, alerts, and passive-aggressive messages to your unsuspecting audience. Here, you can tweak the Toast's appearance, duration, and severity (from a gentle 'heads up' to a full-blown 'CODE RED! THE COFFEE MACHINE IS EMPTY!'). Be warned: overuse can lead to user frustration and potentially feature requests for a 'mute all toasts' button. But hey, sometimes you just need to make sure they really see that discount code, right? Explore different variations, from the subtly informative to the gloriously attention-grabbing. Just remember, with great toast power comes great responsibility... or at least a well-placed 'X' button.",
    color: 'info' as ToastProps['color'],
    variant: 'bordered' as ToastProps['variant'],
    timeout: 60000,
    closeIcon: undefined,
    endContent: 'the end',
    icon: undefined,
    loadingIcon: undefined,
    shouldShowTimeoutProgress: true,
    showCloseButton: true,
    showIcon: true,
    placement: 'top-right',
  },
  render: (args) => {
    return (
      <Button
        onClick={() => {
          addToast(args);
        }}
      >
        Show toast
      </Button>
    );
  },
};
