import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AccordionProps } from './Accordion';

import Accordion from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'pixels/Accordion',
  component: Accordion,
  args: {
    className: 'w-96',
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const accordionItems = [
  { title: '1.', children: <div>First item</div> },
  { title: '2.', children: <div>Second item</div> },
  { title: '3.', children: <div>Third item</div> },
];

export const Default: Story = {
  args: {
    accordionItems,
  },
};

export const WithSubtitle: Story = {
  args: {
    accordionItems: [
      { title: '1.', children: <div>First item</div>, subtitle: 'Subtitle' },
      { title: '2.', children: <div>Second item</div>, subtitle: 'Subtitle' },
      { title: '3.', children: <div>Third item</div>, subtitle: 'Subtitle' },
    ],
  },
};
export const AllVariants: Story = {
  args: {
    accordionItems,
    indicatorLeft: false,
  },
  render: (args) => {
    return (
      <div className="w-96">
        {['light', 'shadow', 'bordered', 'splitted'].map((variant) => {
          return (
            <Accordion
              {...args}
              key={variant}
              className="mb-12"
              variant={variant as AccordionProps['variant']}
            />
          );
        })}
      </div>
    );
  },
};

export const OnlySingleSelection: Story = {
  args: {
    selectionMode: 'single',
    accordionItems,
  },
};

export const AllDisabled: Story = {
  args: {
    disabled: true,
    accordionItems,
  },
};
export const SomeDisabled: Story = {
  args: {
    disabledKeys: ['1'],
    accordionItems: [
      { title: '1.', children: <div>First item</div>, disabled: true },
      { title: '2.', children: <div>Second item</div> },
      { title: '3.', children: <div>Third item</div> },
    ],
  },
};

export const DefaultOpen: Story = {
  args: {
    defaultSelectedKeys: ['1'],
    accordionItems,
  },
};

export const IndicatorLeft: Story = {
  args: {
    accordionItems,
    indicatorLeft: true,
  },
};

export const CustomStyles: Story = {
  args: {
    accordionItems,
    className: {
      base: 'py-0',
      title: 'font-normal text-medium',
      trigger:
        'py-0 data-[hover=true]:bg-blue-100 rounded-lg h-14 flex items-center',
      indicator: 'text-medium rotate-180 data-[open=true]:rotate-90',
      content: 'text-small px-2',
      wrapper: 'w-96',
    },
  },
};
