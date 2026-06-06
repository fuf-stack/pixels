import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AlertProps } from './Alert';

import { FaBell } from 'react-icons/fa';

import { action } from 'storybook/actions';

import { cn } from '@fuf-stack/pixel-utils';

import { Button } from '../Button';
import Alert, { alertVariants } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'pixels/Alert',
  component: Alert,
};

const variants = [...Object.keys(alertVariants.variants.variant)];

const backgrounds = [
  { name: 'white', className: 'bg-white' },
  { name: 'light gray', className: 'bg-gray-100' },
  { name: 'dark', className: 'bg-gray-800' },
];

export default meta;
type Story = StoryObj<typeof Alert>;

export const AllVariants: Story = {
  render: (args) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.keys(alertVariants.variants.variant).map((variant) => {
          return (
            <Alert
              key={variant}
              variant={variant as AlertProps['variant']}
              {...args}
            />
          );
        })}
      </div>
    );
  },
  args: {
    title: "Something's Up",
    children: 'A message of varying importance has been detected.',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'System Notification',
  },
};

export const ChildrenOnly: Story = {
  args: {
    children: 'Your attention is required for this matter.',
  },
};

export const Closable: Story = {
  render: (args) => {
    return (
      <>
        {Object.keys(alertVariants.variants.variant).map((variant) => {
          return (
            <div key={variant} className="mb-12">
              <div>{variant}</div>
              <Alert variant={variant as AlertProps['variant']} {...args} />
            </div>
          );
        })}
      </>
    );
  },
  args: {
    title: 'Alert: [Close to dismiss]',
    children: 'X marks the spot (to close).',
    closable: true,
    onClose: action('closed'),
  },
};

export const Empty: Story = {
  args: {},
};

export const WithCustomIcon: Story = {
  args: {
    title: 'Custom Notification',
    children: 'This alert uses a custom bell icon.',
    icon: <FaBell />,
  },
};

export const WithEndContent: Story = {
  args: {
    title: 'Message from Our Team',
    children: 'We have some important news to share with you.',
    endContent: (
      <Button color="info" size="sm" type="button" variant="flat">
        Show more
      </Button>
    ),
  },
};

export const MultilineChildren: Story = {
  args: {
    title: 'System Notification',
    children: (
      <>
        Your attention is required for this matter.
        <br />
        Please review the details below.
        <br />
        Thank you for your cooperation.
      </>
    ),
  },
};

export const VariantsOnBackgrounds: Story = {
  render: (args) => {
    return (
      <>
        {variants.map((variant) => {
          return (
            <div key={variant} className="mb-6">
              <h2 className="mb-4 text-lg font-bold">{variant}</h2>
              {backgrounds.map((bg) => {
                return (
                  <div
                    key={`${variant}-${bg.name}`}
                    className={cn('mb-2 rounded p-3', bg.className)}
                  >
                    <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      background: {bg.name}
                    </div>
                    <Alert
                      variant={variant as AlertProps['variant']}
                      {...args}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </>
    );
  },
  args: {
    title: "Something's Up",
    children: 'A message of varying importance has been detected.',
  },
};
