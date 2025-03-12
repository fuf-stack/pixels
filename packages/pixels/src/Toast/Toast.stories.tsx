import type { Meta, StoryObj } from '@storybook/react';
import type { ToastProps } from './addToast';

import { Button } from '@heroui/button';
import { Toast } from '@heroui/toast';
import { action } from '@storybook/addon-actions';

import { addToast, toastVariants } from './addToast';
import ToastProvider from './ToastProvider';

const meta: Meta<typeof addToast> = {
  title: 'pixels/Toast',
  component: Toast,
  args: {
    onClose: action('closed'),
  },
  decorators: [
    (Story) => (
      <>
        <ToastProvider placement="top-center" />
        <Story />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof addToast>;

export const Default: Story = {
  args: {
    title: "Something's Up",
  },
  render: (args) => (
    <Button onPress={() => addToast({ ...args })}>Show success toast</Button>
  ),
};

export const AllProps: Story = {
  args: {
    className: { progressIndicator: 'moep1' },
    title: "Something's Up",
    children: 'A message of varying importance has been detected.',
    color: 'info' as ToastProps['color'],
    variant: 'bordered' as ToastProps['variant'],
    timeout: 60000,
    closeIcon: undefined,
    // description,
    endContent: 'the end',
    icon: undefined,
    loadingIcon: undefined,
    shouldShowTimeoutProgress: true,
    showCloseButton: true,
    showIcon: true,
    placement: 'top-right',
  },
  render: (args) => (
    <Button onPress={() => addToast({ ...args })}>Show toast</Button>
  ),
};

export const AllColors: Story = {
  render: (args) => (
    <>
      {[...Object.keys(toastVariants.variants.color)].map((color) => (
        <div key={color} className="mb-12">
          <h2 className="mb-4 text-lg font-bold">{color}</h2>
          <Button
            onPress={() =>
              addToast({
                ...args,

                color: color as ToastProps['color'],
              })
            }
          >{`${color}`}</Button>
        </div>
      ))}
    </>
  ),
  args: {
    title: "Something's Up",
    children: 'A message of varying importance has been detected.',
    variant: 'bordered' as ToastProps['variant'],
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <>
      {Object.keys(toastVariants.variants.variant).map((variant) => (
        <div key={`${variant}`} className="mb-6">
          <div className="mb-2 text-sm text-foreground">{variant}</div>
          <Button
            onPress={() =>
              addToast({
                ...args,

                variant: variant as ToastProps['variant'],
              })
            }
          >{`${variant}`}</Button>
        </div>
      ))}
    </>
  ),
  args: {
    title: "Something's Up",
    children: 'A message of varying importance has been detected.',
    color: 'info' as ToastProps['color'],
    timeout: 0,
  },
};
