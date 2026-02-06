import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';

import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

import { toast, Toaster } from '.';
import { Button } from '../Button';
import { Modal } from '../Modal';

const meta: Meta = {
  title: 'pixels/Toast',
  component: Toaster,
  decorators: [
    (Story) => {
      return (
        <>
          <Toaster />
          <Story />
        </>
      );
    },
  ],
};

export default meta;
type Story = StoryObj;

export const Variants: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast.default('This is a default message', {
              onAutoClose: action('onAutoClose'),
              onClose: action('onClose'),
            });
          }}
        >
          Default
        </Button>
        <Button
          onClick={() => {
            toast.info('This is an info message', {
              onAutoClose: action('onAutoClose'),
              onClose: action('onClose'),
            });
          }}
        >
          Info
        </Button>
        <Button
          onClick={() => {
            toast.warn('This is a warning message', {
              onAutoClose: action('onAutoClose'),
              onClose: action('onClose'),
            });
          }}
        >
          Warn
        </Button>
        <Button
          onClick={() => {
            toast.success('This is a success message', {
              onAutoClose: action('onAutoClose'),
              onClose: action('onClose'),
            });
          }}
        >
          Success
        </Button>
        <Button
          onClick={() => {
            toast.error('This is an error message', {
              onAutoClose: action('onAutoClose'),
              onClose: action('onClose'),
            });
          }}
        >
          Error
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Default'));
    await expect(
      canvas.getByText('This is a default message'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Info'));
    await expect(
      canvas.getByText('This is an info message'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Warn'));
    await expect(
      canvas.getByText('This is a warning message'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Success'));
    await expect(
      canvas.getByText('This is a success message'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Error'));
    await expect(
      canvas.getByText('This is an error message'),
    ).toBeInTheDocument();
  },
};

const positions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export const Placement: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap gap-2">
        {positions.map((position) => {
          return (
            <Button
              key={position}
              onClick={() => {
                return toast.info(`Toast at ${position}`, { position });
              }}
            >
              {position}
            </Button>
          );
        })}
      </div>
    );
  },
};

export const AllOptions: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          return toast.info("Something's Up", {
            title: "Something's Up",
            duration: 60000,
            closable: true,
            onAutoClose: action('onAutoClose'),
            onClose: action('onClose'),
          });
        }}
      >
        Show toast
      </Button>
    );
  },
};

export const CloseExternal: Story = {
  render: () => {
    const toastIds: (string | number)[] = [];
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => {
            toastIds.push(
              toast.info('This toast can be closed programmatically', {
                duration: 60000,
              }),
            );
          }}
        >
          Show toast
        </Button>
        <Button
          onClick={() => {
            const id = toastIds.shift();
            if (id != null) {
              toast.close(id);
            }
          }}
        >
          Close toast
        </Button>
      </div>
    );
  },
};

const MoreModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        className="ml-2 mt-2 whitespace-nowrap rounded border px-2 py-1 text-xs"
        onClick={() => {
          setIsOpen(true);
        }}
        type="button"
      >
        More
      </button>
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
};

export const WithMoreModal: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          toast.warn('Something requires your attention.', {
            title: 'Attention Required',
            endContent: <MoreModal />,
          });
        }}
      >
        Show toast with more
      </Button>
    );
  },
};

export const Closable: Story = {
  render: () => {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => {
            return toast.info('This toast can be closed', {
              closable: true,
            });
          }}
        >
          Closable
        </Button>
        <Button
          onClick={() => {
            return toast.info('This toast cannot be closed', {
              closable: false,
            });
          }}
        >
          Not closable
        </Button>
      </div>
    );
  },
};

export const WithReactNodeMessage: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast.info(
              <span>
                Message with <strong>bold</strong> and <em>italic</em> text
              </span>,
            );
          }}
        >
          Formatted text
        </Button>
        <Button
          onClick={() => {
            toast.success(
              <span>
                User{' '}
                <a className="underline" href="#link" id="link">
                  admin
                </a>{' '}
                was created
              </span>,
            );
          }}
        >
          With link
        </Button>
        <Button
          onClick={() => {
            toast.warn(
              <ul className="list-inside list-disc">
                <li>First item</li>
                <li>Second item</li>
              </ul>,
              { title: 'Multiple warnings' },
            );
          }}
        >
          With list
        </Button>
      </div>
    );
  },
};

export const CustomRender: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          toast.info('Custom rendered toast', {
            render: ({ message, color, close }) => {
              return (
                <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white shadow-lg">
                  <span className="text-2xl">🎉</span>
                  <div className="flex-1">
                    <div className="text-xs uppercase opacity-75">{color}</div>
                    <div className="font-semibold">{message}</div>
                  </div>
                  <button
                    className="rounded bg-white/20 px-2 py-1 text-sm hover:bg-white/30"
                    onClick={close}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              );
            },
          });
        }}
      >
        Show custom rendered toast
      </Button>
    );
  },
};
