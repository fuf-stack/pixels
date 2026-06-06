import type { Meta, StoryObj } from '@storybook/react-vite';

import { FaBell, FaRocket } from 'react-icons/fa';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { toast, Toaster } from '.';
import { Button } from '../Button';

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

export const Simple: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          toast.info('This is an info message');
        }}
      >
        Show toast
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show toast'));
    await expect(
      canvas.getByText('This is an info message'),
    ).toBeInTheDocument();
  },
};

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

export const AllPositions: Story = {
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
  // Open a toast at every position so the snapshot captures all placements.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await positions.reduce(async (previous, position) => {
      await previous;
      await userEvent.click(canvas.getByText(position));
      await expect(
        canvas.getByText(`Toast at ${position}`),
      ).toBeInTheDocument();
    }, Promise.resolve());
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show toast'));
    // "Something's Up" is both the title and the message, so match either.
    await waitFor(() => {
      expect(canvas.getAllByText("Something's Up").length).toBeGreaterThan(0);
    });
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
  // Open both toasts so the snapshot shows the closable and non-closable ones.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Closable'));
    await expect(
      canvas.getByText('This toast can be closed'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Not closable'));
    await expect(
      canvas.getByText('This toast cannot be closed'),
    ).toBeInTheDocument();
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
  // Open the toast so the snapshot shows it (it stays open for 60s).
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show toast'));
    await expect(
      canvas.getByText('This toast can be closed programmatically'),
    ).toBeInTheDocument();
  },
};

export const WithFormattedMessages: Story = {
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
  // Open every toast so the snapshot captures the rendered ReactNode messages.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Formatted text'));
    await expect(canvas.getByText('bold')).toBeInTheDocument();

    await userEvent.click(canvas.getByText('With link'));
    await expect(canvas.getByText('admin')).toBeInTheDocument();

    await userEvent.click(canvas.getByText('With list'));
    await expect(canvas.getByText('First item')).toBeInTheDocument();
  },
};

const LONG_CONTENT = `[TOAST-LAB] Marshmallow overflow detected.

The snack machine got a little too excited.
No real damage, just extra crispy vibes.
Recommendation: reduce toast level and try again.`;

export const WithLongContent: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          toast.error(
            <pre className="whitespace-pre-wrap text-xs">{LONG_CONTENT}</pre>,
            {
              title: 'Snack machine complained',
              duration: 60000,
              closable: true,
            },
          );
        }}
      >
        Show toast with long content
      </Button>
    );
  },
  // Open the toast so the snapshot captures the long content.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show toast with long content'));
    await expect(
      canvas.getByText('Snack machine complained'),
    ).toBeInTheDocument();
  },
};

export const CustomIcon: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast.info('Custom icon toast', {
              icon: <FaBell />,
            });
          }}
        >
          Custom icon
        </Button>
        <Button
          onClick={() => {
            toast.success('Launched!', {
              icon: <FaRocket />,
            });
          }}
        >
          Rocket icon
        </Button>
      </div>
    );
  },
  // Open both toasts so the snapshot captures the custom icons.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Custom icon'));
    await expect(canvas.getByText('Custom icon toast')).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Rocket icon'));
    await expect(canvas.getByText('Launched!')).toBeInTheDocument();
  },
};

export const CustomRender: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          toast.default('Custom rendered toast', {
            render: ({ message, close }) => {
              return (
                <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white shadow-lg">
                  <span className="text-2xl">🎉</span>
                  <div className="flex-1">
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
  // Open the toast so the snapshot captures the custom render output.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show custom rendered toast'));
    await expect(canvas.getByText('Custom rendered toast')).toBeInTheDocument();
  },
};
