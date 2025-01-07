import type { Meta, StoryObj } from '@storybook/react';
import type { DrawerProps } from './Drawer';

import { Fragment, useState } from 'react';

import { useArgs } from '@storybook/preview-api';

import { Drawer } from '.';
import { Button } from '../Button';
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
        Open Drawer
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
    header: 'Drawer Header',
  },
};

export const Content: Story = {
  render: Template,
  args: {
    children: 'Drawer Content',
  },
};

export const Footer: Story = {
  render: Template,
  args: {
    footer: 'Drawer Footer',
  },
};

export const DefaultOpen: Story = {
  render: Template,
  args: {
    header: 'Drawer Header',
    children: 'Drawer Content',
    footer: 'Drawer Footer',
    isOpen: true,
  },
};

export const CustomWidth: Story = {
  render: Template,
  args: {
    header: 'Drawer Header',
    footer: 'Drawer Footer',
    children: 'Drawer Content',
    className: { base: 'w-1/4' },
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
