import type { Story } from './Menu.storySetup';

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import Menu from '../Menu';
import { funItems, menuItems, meta as sharedMeta } from './Menu.storySetup';

// -----------------------------------------------------------------------------
// Story base setup
// -----------------------------------------------------------------------------

const meta: typeof sharedMeta = { ...sharedMeta, title: 'pixels/Menu' };

export default meta;

// -----------------------------------------------------------------------------
// Normal and composition stories
// -----------------------------------------------------------------------------

export const Default: Story = {
  args: {
    items: [],
  },
};

export const WithoutTrigger: Story = {
  tags: ['visual'],
  parameters: {
    visual: { target: '[data-component="menu"], [aria-haspopup="true"]' },
  },
  render: (args, { canvasElement }) => {
    return <Menu {...args} portalContainer={canvasElement} />;
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));

    const menu = await within(canvasElement.ownerDocument.body).findByRole(
      'menu',
    );

    await waitFor(() => {
      expect(menu).toBeVisible();
    });
  },
  args: {
    disableAnimation: true,
    triggerButtonProps: { disableAnimation: true, disableRipple: true },
    items: menuItems,
  },
};

export const WithTrigger: Story = {
  args: {
    children: 'trigger',
    items: menuItems,
  },
};

export const WithTriggerButtonProps: Story = {
  args: {
    children: 'Open menu',
    items: menuItems,
    triggerButtonProps: {
      'aria-label': 'Open actions menu',
      className: 'min-w-0',
      color: 'primary',
      disableAnimation: true,
      variant: 'bordered',
    },
  },
};

export const SubMenu: Story = {
  args: {
    items: [
      { key: 'first', label: 'firstItem' },
      { key: 'subMenu', label: 'Sub Menu', items: menuItems },
    ],
  },
};

export const Disabled: Story = {
  args: {
    items: menuItems,
    isDisabled: true,
  },
};

export const AllPlacements: Story = {
  render: () => {
    const placements = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ] as const;

    return (
      <div className="grid grid-cols-3 gap-4">
        {placements.map((p) => {
          return (
            <Menu
              key={p}
              className=""
              items={menuItems}
              placement={p}
              triggerButtonProps={{
                variant: 'bordered',
              }}
            >
              {p}
            </Menu>
          );
        })}
      </div>
    );
  },
};

export const WithOnAction: Story = {
  args: {
    items: menuItems,
    onAction: action('menu:onAction'),
  },
};

export const WithAriaLabelAndTestIds: Story = {
  args: {
    items: menuItems,
    ariaLabel: 'Example actions menu',
    testId: 'menu-trigger',
  },
};

export const CustomStyling: Story = {
  args: {
    children: 'Styled trigger',
    items: menuItems,
    triggerButtonProps: { size: 'sm' },
    className: {
      trigger: 'bg-black text-white hover:bg-gray-900',
      item: 'text-red-600 hover:bg-gray-100',
    },
  },
};

export const MenuParty: Story = {
  args: {
    children: 'Open fun menu 🎈',
    items: funItems,
    onAction: action('menu:onAction'),
    triggerButtonProps: {
      'aria-label': 'Open fun menu',
      color: 'secondary',
      variant: 'bordered',
    },
  },
};
