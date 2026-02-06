import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AlertProps } from './Alert';

import { useState } from 'react';
import { FaBell } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { cn } from '@fuf-stack/pixel-utils';

import { Modal } from '../Modal';
import Alert, { alertVariants } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'pixels/Alert',
  component: Alert,
};

const colors = [...Object.keys(alertVariants.variants.color)];

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {},
};

export const Variants: Story = {
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
    title: <span>System Notification</span>,
  },
};

export const MultilineTitleOnly: Story = {
  args: {
    title: (
      <>
        System Notification
        <br />
        Second Line
        <br />
        Third Line
      </>
    ),
  },
};

export const ChildrenOnly: Story = {
  args: {
    children: 'Your attention is required for this matter.',
  },
};

export const MultilineChildrenOnly: Story = {
  args: {
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

export const MultilineTitleAndChildren: Story = {
  args: {
    title: (
      <>
        System Notification
        <br />
        Important Update
      </>
    ),
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

export const CustomIcon: Story = {
  args: {
    title: 'Custom Notification',
    children: 'This alert uses a custom bell icon.',
    icon: <FaBell />,
  },
};

const backgrounds = [
  { name: 'white', className: 'bg-white' },
  { name: 'light gray', className: 'bg-gray-100' },
  { name: 'dark', className: 'bg-gray-800' },
];

export const AllColorsAndVariants: Story = {
  render: (args) => {
    return (
      <>
        {colors.map((color) => {
          return (
            <div key={color} className="mb-12">
              <h2 className="mb-4 text-lg font-bold">{color}</h2>
              {Object.keys(alertVariants.variants.variant).map((variant) => {
                return (
                  <div key={`${color}-${variant}`} className="mb-6">
                    <div className="mb-2 text-sm text-foreground">
                      {variant}
                    </div>
                    {backgrounds.map((bg) => {
                      return (
                        <div
                          key={`${color}-${variant}-${bg.name}`}
                          className={cn('mb-2 rounded p-3', bg.className)}
                        >
                          <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                            background: {bg.name}
                          </div>
                          <Alert
                            color={color as AlertProps['color']}
                            variant={variant as AlertProps['variant']}
                            {...args}
                          />
                        </div>
                      );
                    })}
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

export const NoIcon: Story = {
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
    title: 'Alert',
    children: 'More details regarding the alert with no icon.',
    showIcon: false,
  },
};

export const Endcontent: Story = {
  args: {
    title: 'Message from Our Team',
    children: 'We have some important news to share with you.',
    endContent: <button type="button">End Content</button>,
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
    color: 'info',
  },
};

export const AllColorsWithShowMoreButton: Story = {
  render: function Render(args) {
    const [{ showMore }, updateArgs] = useArgs();

    const toggleShowMore = () => {
      updateArgs({ showMore: !showMore });
    };

    return (
      <>
        {colors.map((color) => {
          return (
            <div key={color} className="mb-12">
              <div>{color}</div>
              <Alert
                color={color as AlertProps['color']}
                {...args}
                endContent={
                  <button
                    className="ml-2 mt-2 rounded border px-2 py-1 text-xs"
                    onClick={toggleShowMore}
                    type="button"
                  >
                    {showMore ? <>Show Less Info</> : <>Show More Info</>}
                  </button>
                }
              >
                Please take a moment to review the following information.
                {showMore ? (
                  <div className={cn('mt-2 border-t pt-4 text-sm')}>
                    <div className="ml-2">
                      Our team of highly trained monkeys has detected a minor
                      issue. Don&apos;t worry, it&apos;s not the end of the
                      world (but we can&apos;t promise anything). <br />{' '}
                      Seriously though, please review the following info:
                      We&apos;ve got some stuff to tell you, and it&apos;s
                      probably going to be boring. But hey, at least you&apos;ll
                      know what&apos;s up!
                    </div>
                  </div>
                ) : null}
              </Alert>
            </div>
          );
        })}
      </>
    );
  },
  args: {
    title: 'Alert Issued',
  },
};

export const WithMoreModal: Story = {
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Alert
          {...args}
          endContent={
            <button
              className="ml-2 mt-2 rounded border px-2 py-1 text-xs"
              type="button"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              More
            </button>
          }
        >
          Something requires your attention.
        </Alert>
        <Modal
          header="Alert Details"
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
        >
          Here are the full details of the alert. This modal provides additional
          context and information that does not fit in the alert itself.
        </Modal>
      </>
    );
  },
  args: {
    title: 'Attention Required',
    color: 'warning',
  },
};

export const SpecialFullWidth: Story = {
  args: {
    showIcon: false,
    className: 'w-screen',
  },
};
