import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DrawerProps } from './Drawer';

import { Fragment, useEffect, useRef, useState } from 'react';

import { useArgs } from 'storybook/preview-api';

import { Drawer } from '.';
import { Button } from '../Button';
import { Card } from '../Card';
import { Tabs } from '../Tabs';
import {
  drawerBackdrops,
  drawerPlacements,
  drawerRadii,
  drawerSizes,
} from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'pixels/Drawer',
  component: Drawer,
};

export default meta;
type Story = StoryObj<DrawerProps>;

const Template: Story['render'] = (args, { canvasElement }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const isTestEnv = process.env.NODE_ENV === 'test';

  return (
    <>
      <Button
        disableAnimation={isTestEnv}
        onClick={onClick}
        testId="drawer_trigger"
      >
        Reveal the Secrets!
      </Button>
      <Drawer
        {...args}
        isOpen={isOpen}
        onClose={onClose}
        portalContainer={canvasElement}
      />
    </>
  );
};

export const Default: Story = {
  render: Template,
  args: {},
};

export const Header: Story = {
  render: Template,
  args: {
    header: 'Just the Top Bit, Sorry',
  },
};

export const Content: Story = {
  render: Template,
  args: {
    children: 'Just the meat of the drawer, no fluff.',
  },
};

export const Footer: Story = {
  render: Template,
  args: {
    footer: 'The bottom line. Literally.',
  },
};

export const DefaultOpen: Story = {
  render: Template,
  args: {
    header: "The Drawer That Doesn't Need an Introduction (or a click)",
    children: "Just chillin', being opened by default. Nothing to see here.",
    footer:
      "The end! (but actually the beginning, since you didn't have to do anything)",
    isOpen: true,
  },
};

export const CustomWidth: Story = {
  render: Template,
  args: {
    header: 'A Drawer of Unique Proportions!',
    footer: 'A standard footer, on a very non-standard width.',
    children:
      "You know what they say: 'A drawer a day keeps the boredom at bay.' Well, we've halved that promise – and quadrupled the fun! Okay, maybe not quadrupled, but there are some nice views in here.",
    className: { base: 'w-1/2' },
    // fractionals needs full size to work with larger than 1/4.
    size: 'full',
  },
};

const SizeTemplate: Story['render'] = (args) => {
  const [{ openDrawers }, updateArgs] = useArgs<{
    openDrawers: Record<string, boolean>;
  }>();

  return (
    <>
      {drawerSizes.map((size) => {
        const toggleOpen = () => {
          updateArgs({
            openDrawers: {
              ...openDrawers,
              [size]: !openDrawers?.[size],
            },
          });
        };

        return (
          <Fragment key={size}>
            <Button
              className="mb-2 mr-2"
              onClick={toggleOpen}
              data-testid={`drawer-trigger-${size}`}
            >
              {size}
            </Button>
            <Drawer
              {...args}
              header={`Size ${size}`}
              isOpen={openDrawers?.[size] || false}
              size={size}
              testId={`drawer-${size}`}
              onClose={() => {
                updateArgs({
                  openDrawers: {
                    ...openDrawers,
                    [size]: false,
                  },
                });
              }}
            >
              {size} Content
            </Drawer>
          </Fragment>
        );
      })}
    </>
  );
};

export const AllSizes: Story = {
  render: SizeTemplate,
  args: {
    isOpen: false,
  },
  argTypes: {
    size: {
      table: {
        disable: true,
      },
    },
  },
};

const RadiiTemplate: Story['render'] = (args) => {
  const [{ openDrawers }, updateArgs] = useArgs<{
    openDrawers: Record<string, boolean>;
  }>();

  return (
    <>
      {drawerRadii.map((radius) => {
        const toggleOpen = () => {
          updateArgs({
            openDrawers: {
              ...openDrawers,
              [radius]: !openDrawers?.[radius],
            },
          });
        };

        return (
          <Fragment key={radius}>
            <Button
              className="mb-2 mr-2"
              onClick={toggleOpen}
              data-testid={`drawer-trigger-${radius}`}
            >
              {radius}
            </Button>
            <Drawer
              {...args}
              header={`radius ${radius}`}
              isOpen={openDrawers?.[radius] || false}
              radius={radius}
              testId={`drawer-${radius}`}
              onClose={() => {
                updateArgs({
                  openDrawers: {
                    ...openDrawers,
                    [radius]: false,
                  },
                });
              }}
            >
              {radius} Content
            </Drawer>
          </Fragment>
        );
      })}
    </>
  );
};

export const AllRadii: Story = {
  render: RadiiTemplate,
  args: {
    isOpen: false,
  },
  argTypes: {
    radius: {
      table: {
        disable: true,
      },
    },
  },
};

const PlacementTemplate: Story['render'] = (args) => {
  const [{ openDrawers }, updateArgs] = useArgs<{
    openDrawers: Record<string, boolean>;
  }>();

  return (
    <>
      {drawerPlacements.map((placement) => {
        const toggleOpen = () => {
          updateArgs({
            openDrawers: {
              ...openDrawers,
              [placement]: !openDrawers?.[placement],
            },
          });
        };

        return (
          <Fragment key={placement}>
            <Button
              className="mb-2 mr-2"
              onClick={toggleOpen}
              data-testid={`drawer-trigger-${placement}`}
            >
              {placement}
            </Button>
            <Drawer
              {...args}
              header={`placement ${placement}`}
              isOpen={openDrawers?.[placement] || false}
              placement={placement}
              testId={`drawer-${placement}`}
              onClose={() => {
                updateArgs({
                  openDrawers: {
                    ...openDrawers,
                    [placement]: false,
                  },
                });
              }}
            >
              {placement} Content
            </Drawer>
          </Fragment>
        );
      })}
    </>
  );
};

export const AllPlacements: Story = {
  render: PlacementTemplate,
  args: {
    isOpen: false,
  },
  argTypes: {
    placement: {
      table: {
        disable: true,
      },
    },
  },
};

const BackdropTemplate: Story['render'] = (args) => {
  const [{ openDrawers }, updateArgs] = useArgs<{
    openDrawers: Record<string, boolean>;
  }>();

  return (
    <>
      {drawerBackdrops.map((backdrop) => {
        const toggleOpen = () => {
          updateArgs({
            openDrawers: {
              ...openDrawers,
              [backdrop]: !openDrawers?.[backdrop],
            },
          });
        };

        return (
          <Fragment key={backdrop}>
            <Button
              className="mb-2 mr-2"
              onClick={toggleOpen}
              data-testid={`drawer-trigger-${backdrop}`}
            >
              {backdrop}
            </Button>
            <Drawer
              {...args}
              header={`backdrop ${backdrop}`}
              isOpen={openDrawers?.[backdrop] || false}
              backdrop={backdrop}
              testId={`drawer-${backdrop}`}
              onClose={() => {
                updateArgs({
                  openDrawers: {
                    ...openDrawers,
                    [backdrop]: false,
                  },
                });
              }}
            >
              {backdrop} Content
            </Drawer>
          </Fragment>
        );
      })}
    </>
  );
};

export const AllBackdrops: Story = {
  render: BackdropTemplate,
  args: {
    isOpen: false,
  },
  argTypes: {
    backdrop: {
      table: {
        disable: true,
      },
    },
  },
};

const CardTemplate: Story['render'] = (args) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefReady, setIsRefReady] = useState(false);
  const drawerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (drawerContainerRef?.current && !isRefReady) {
      setIsRefReady(true);
    }
  }, [drawerContainerRef, isRefReady]);

  const onClick = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const isTestEnv = process.env.NODE_ENV === 'test';

  const card = (
    <Card
      ref={drawerContainerRef}
      header={
        <>
          Behold! A Portal to More Stuff!
          <Button
            className="ml-auto"
            disableAnimation={isTestEnv}
            onClick={onClick}
            testId="drawer_trigger"
          >
            Unleash the Drawer!
          </Button>
        </>
      }
    >
      <div className="h-48 w-full">
        This is just a placeholder. But a very handsome placeholder.
      </div>
    </Card>
  );

  if (!isRefReady) {
    return card;
  }

  const drawerContent =
    "And here's all the stuff you didn't see before! (Mostly more text)";

  return (
    <>
      {card}
      <Drawer
        {...args}
        className={{
          wrapper: 'absolute right-0 h-full w-full',
          backdrop: 'absolute right-0 h-full w-full',
        }}
        isOpen={isOpen}
        onClose={onClose}
        portalContainer={drawerContainerRef.current || undefined}
        size="xs"
        header="So you made it. High five!"
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export const CardWithDrawer: Story = {
  render: CardTemplate,
  args: {
    isOpen: false,
  },
  argTypes: {
    size: {
      table: {
        disable: true,
      },
    },
  },
};

export const DrawerWithTabs: Story = {
  render: Template,
  args: {
    children: (
      <Tabs
        ariaLabel="Top tabs"
        placement="top"
        tabs={[
          {
            key: '1',
            label: 'Plan A',
            content: "When all else fails, this won't work either",
          },
          {
            key: '2',
            label: 'Plan B',
            content: 'Same as Plan A, but with more panic',
          },
        ]}
      />
    ),
  },
};
