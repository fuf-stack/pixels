import type { Meta, StoryObj } from '@storybook/react';
import type { AlertProps } from './Alert';

import { useArgs } from '@storybook/preview-api';

import { cn } from '@fuf-stack/pixel-utils';

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

export const TitleOnly: Story = {
  args: {
    title: <span>System Notification</span>,
  },
};

export const ChildrenOnly: Story = {
  args: {
    children: 'Your attention is required for this matter.',
  },
};

export const AllColorsAndVariants: Story = {
  render: (args) => (
    <>
      {colors.map((color) => (
        <div key={color} className="mb-12">
          <h2 className="mb-4 text-lg font-bold">{color}</h2>
          {Object.keys(alertVariants.variants.variant).map((variant) => (
            <div key={`${color}-${variant}`} className="mb-6">
              <div className="mb-2 text-sm text-foreground">{variant}</div>
              <Alert
                color={color as AlertProps['color']}
                variant={variant as AlertProps['variant']}
                {...args}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  ),
  args: {
    title: "Something's Up",
    children: 'A message of varying importance has been detected.',
  },
};

export const NoIcon: Story = {
  render: (args) => (
    <>
      {Object.keys(alertVariants.variants.variant).map((variant) => (
        <div key={variant} className="mb-12">
          <div>{variant}</div>
          <Alert variant={variant as AlertProps['variant']} {...args} />
        </div>
      ))}
    </>
  ),
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
  render: (args) => (
    <>
      {Object.keys(alertVariants.variants.variant).map((variant) => (
        <div key={variant} className="mb-12">
          <div>{variant}</div>
          <Alert variant={variant as AlertProps['variant']} {...args} />
        </div>
      ))}
    </>
  ),
  args: {
    title: 'Alert: [Close to dismiss]',
    children: 'X marks the spot (to close).',
    isClosable: true,
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
        {colors.map((color) => (
          <div key={color} className="mb-12">
            <div>{color}</div>
            <Alert
              color={color as AlertProps['color']}
              {...args}
              endContent={
                <button
                  className="ml-2 mt-2 rounded border px-2 py-1 text-xs"
                  type="button"
                  onClick={toggleShowMore}
                >
                  {showMore ? <>Show Less Info</> : <>Show More Info</>}
                </button>
              }
            >
              Please take a moment to review the following information.
              {showMore && (
                <div className={cn('mt-2 border-t pt-4 text-sm')}>
                  <div className="ml-2">
                    Our team of highly trained monkeys has detected a minor
                    issue. Don&apos;t worry, it&apos;s not the end of the world
                    (but we can&apos;t promise anything). <br /> Seriously
                    though, please review the following info: We&apos;ve got
                    some stuff to tell you, and it&apos;s probably going to be
                    boring. But hey, at least you&apos;ll know what&apos;s up!
                  </div>
                </div>
              )}
            </Alert>
          </div>
        ))}
      </>
    );
  },
  args: {
    title: 'Alert Issued',
    variant: 'faded',
  },
};

export const SpecialFullWidth: Story = {
  args: {
    showIcon: false,
    className: 'w-screen',
  },
};

export const LimitHeight: Story = {
  args: {
    showIcon: false,
    sizeLimit: 'height',
    children: (
      <div>
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
      </div>
    ),
  },
  render: (args) => <Alert {...args} />,
};

export const LimitWidth: Story = {
  args: {
    showIcon: false,
    sizeLimit: 'width',
    children: (
      <div>
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
      </div>
    ),
  },
  render: (args) => <Alert {...args} />,
};

export const LimitHeightWidth: Story = {
  args: {
    showIcon: false,
    sizeLimit: 'both',
    children: (
      <div>
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
        Our team of highly trained monkeys has detected a minor issue.
        Don&apos;t worry, it&apos;s not the end of the world (but we can&apos;t
        promise anything). <br /> Seriously though, please review the following
        info: We&apos;ve got some stuff to tell you, and it&apos;s probably
        going to be boring. But hey, at least you&apos;ll know what&apos;s up!
      </div>
    ),
  },
};
