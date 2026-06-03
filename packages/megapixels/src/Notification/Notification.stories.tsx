import type { Meta, StoryObj } from '@storybook/react-vite';
import type { NotificationHostProps } from '.';

import { useState } from 'react';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@fuf-stack/pixels/Button';

import { notification, NotificationHost } from '.';

const meta: Meta = {
  title: 'Megapixels/Notification',
  component: NotificationHost,
  decorators: [
    (Story, context) => {
      // Stories can override the host props via `parameters.notificationHost`,
      // or opt out entirely by setting it to `false` (then the story mounts
      // its own NotificationHost — e.g. to drive props from local state).
      const hostProps = context.parameters.notificationHost;
      if (hostProps === false) {
        return <Story />;
      }
      return (
        <>
          <NotificationHost {...((hostProps as NotificationHostProps) ?? {})} />
          <Story />
        </>
      );
    },
  ],
};

export default meta;
type Story = StoryObj;

const errorDetails = (
  <pre className="whitespace-pre-wrap text-xs">
    {`[REQUEST-ERROR-MIDDLEWARE] Field "moep" is not defined by type "Admin_Input".

GraphQLError: Field "moep" is not defined by type "Admin_Input".
    at coerceInputValueImpl (/path/to/graphql.js:137:11)
    at coerceVariableValues (/path/to/graphql.js:132:69)
    at getVariableValues (/path/to/graphql.js:45:21)
    at buildExecutionContext (/path/to/graphql.js:331:63)
    at execute (/path/to/graphql.js:165:22)
    at handler (/path/to/graphql.js:335:28)`}
  </pre>
);

const reportContent = (
  <div className="space-y-2">
    {Array.from({ length: 20 }, (_, i) => {
      return `Line ${i + 1}: report content goes here. The modal opens in xl size so longer reports are easier to read.`;
    }).map((line) => {
      return <p key={line}>{line}</p>;
    })}
  </div>
);

const widthPresets: { label: string; value: NotificationHostProps['width'] }[] =
  [
    { label: 'default (600x)', value: undefined },
    { label: '40rem', value: '40rem' },
    { label: '30em', value: '30em' },
    { label: '80%', value: '80%' },
  ];

const WidthDemo = () => {
  const [width, setWidth] = useState<NotificationHostProps['width']>(600);
  return (
    <>
      <NotificationHost width={width} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Toaster width:</span>
          {widthPresets.map((preset) => {
            const active = preset.value === width;
            return (
              <Button
                key={preset.label}
                color={active ? 'primary' : 'default'}
                onClick={() => {
                  setWidth(preset.value);
                }}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              notification.info('Short message.', {
                title: `width: ${String(width ?? 'default')}`,
              });
            }}
          >
            Short notification
          </Button>
          <Button
            onClick={() => {
              notification.success(
                'This notification fills the configured Toaster width. ' +
                  'Even short messages stay centered because every toast ' +
                  'takes the full Toaster width.',
                { title: `width: ${String(width ?? 'default')}` },
              );
            }}
          >
            Long notification
          </Button>
        </div>
      </div>
    </>
  );
};

export const CustomWidth: Story = {
  parameters: { notificationHost: false },
  render: () => {
    return <WidthDemo />;
  },
  // Trigger a notification so the snapshot shows the toast at the chosen width.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Short notification'));
    await expect(canvas.getByText('Short message.')).toBeInTheDocument();
  },
};

export const Variants: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            notification.default('This is a default notification');
          }}
        >
          Default
        </Button>
        <Button
          onClick={() => {
            notification.info('This is an info notification');
          }}
        >
          Info
        </Button>
        <Button
          onClick={() => {
            notification.warn('This is a warning notification');
          }}
        >
          Warn
        </Button>
        <Button
          onClick={() => {
            notification.success('This is a success notification');
          }}
        >
          Success
        </Button>
        <Button
          onClick={() => {
            notification.error('This is an error notification');
          }}
        >
          Error
        </Button>
      </div>
    );
  },
  // Click every variant so the snapshot captures the rendered toasts, not just
  // the trigger buttons.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Default'));
    await expect(
      canvas.getByText('This is a default notification'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Info'));
    await expect(
      canvas.getByText('This is an info notification'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Warn'));
    await expect(
      canvas.getByText('This is a warning notification'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Success'));
    await expect(
      canvas.getByText('This is a success notification'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Error'));
    await expect(
      canvas.getByText('This is an error notification'),
    ).toBeInTheDocument();
  },
};

/**
 * `endContent` can also be a plain node rendered directly (instead of a render
 * function), e.g. a simple action button that does not open a modal.
 */
export const WithActionButton: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          notification.warn('Your session is about to expire.', {
            title: 'Session expiring',
            endContent: (
              <Button
                color="warning"
                onClick={() => {
                  notification.success('Session extended.');
                }}
                size="sm"
                type="button"
                variant="flat"
              >
                Extend
              </Button>
            ),
          });
        }}
      >
        Show notification with action
      </Button>
    );
  },
  // `endContent` is a plain node here, so the snapshot just needs the toast.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show notification with action'));
    await expect(
      canvas.getByText('Your session is about to expire.'),
    ).toBeInTheDocument();
  },
};

export const WithLargeMoreContentModal: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          notification.info('Report is ready.', {
            title: 'Daily report',
            endContent: ({ modal }) => {
              return (
                <Button
                  className="whitespace-nowrap"
                  color="info"
                  onClick={() => {
                    modal.open({
                      content: reportContent,
                      header: 'Daily report',
                      size: 'xl',
                    });
                  }}
                  size="sm"
                  type="button"
                  variant="flat"
                >
                  Open report
                </Button>
              );
            },
          });
        }}
      >
        Show notification with xl modal
      </Button>
    );
  },
  // Open the toast, then the xl modal, so the snapshot captures the report.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show notification with xl modal'));
    await expect(canvas.getByText('Report is ready.')).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Open report'));
    await waitFor(() => {
      expect(within(document.body).getByText(/Line 1:/)).toBeInTheDocument();
    });
  },
};

export const WithMoreContent: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          notification.error('A request failed.', {
            title: 'Request failed',
            endContent: ({ modal }) => {
              return (
                <Button
                  color="danger"
                  onClick={() => {
                    modal.open({
                      content: errorDetails,
                      header: 'Request error details',
                    });
                  }}
                  size="sm"
                  type="button"
                  variant="flat"
                >
                  Show error details
                </Button>
              );
            },
          });
        }}
      >
        Show notification with details
      </Button>
    );
  },
  // Open the toast, then its details modal, so the snapshot captures both.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show notification with details'));
    await expect(canvas.getByText('A request failed.')).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Show error details'));
    // The modal renders in a portal on document.body, outside the canvas.
    await waitFor(() => {
      expect(
        within(document.body).getByText('Request error details'),
      ).toBeInTheDocument();
    });
  },
};

export const WithoutMoreContent: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          notification.success('Saved successfully.', {
            title: 'Saved',
            closable: true,
          });
        }}
      >
        Show simple notification
      </Button>
    );
  },
  // Open the toast so the snapshot captures the rendered notification.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Show simple notification'));
    await expect(canvas.getByText('Saved successfully.')).toBeInTheDocument();
  },
};
